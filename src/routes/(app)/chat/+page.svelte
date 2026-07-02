<script lang="ts">
	import { onMount, onDestroy, tick } from 'svelte';
	import { get } from 'svelte/store';
	import { auth } from '$lib/stores/auth';
	import { apiClient } from '$lib/services/core/api-client';
	import { toast } from '$lib/stores/toast';
	import { chatApi } from '$lib/services/chat/api';
	import { createChatSocket, type ChatServerMessage } from '$lib/services/chat/socket';
	import type { ConversationSummary, ChatMessage } from '$lib/services/chat/types';

	interface UserLite {
		id: string;
		name: string;
		email: string;
		avatar?: string | null;
	}

	const myId = get(auth).user?.id ?? '';

	let conversations = $state<ConversationSummary[]>([]);
	let usersById = $state<Record<string, UserLite>>({});
	let allUsers = $state<UserLite[]>([]);
	let activeId = $state<string | null>(null);
	let messages = $state<ChatMessage[]>([]);
	let draft = $state('');
	let loadingConversations = $state(true);
	let loadingMessages = $state(false);
	let sending = $state(false);
	let showNew = $state(false);
	let messagesEl = $state<HTMLDivElement | null>(null);
	let typingBy = $state<string | null>(null);
	let editingId = $state<string | null>(null);
	let editDraft = $state('');
	let reactionPickerFor = $state<string | null>(null);

	const EMOJIS = ['👍', '❤️', '😄', '🎉', '😮', '😢'];

	const socket = createChatSocket();
	let typingTimer: ReturnType<typeof setTimeout> | null = null;
	let lastTypingSent = 0;

	const activeConversation = $derived(conversations.find((c) => c.id === activeId) ?? null);

	function userName(id: string): string {
		if (id === myId) return '我';
		return usersById[id]?.name ?? `使用者 ${id.slice(0, 8)}`;
	}

	function conversationTitle(c: ConversationSummary): string {
		if (c.name) return c.name;
		const others = c.participants.filter((p) => p !== myId);
		if (others.length === 0) return '（自己）';
		return others.map(userName).join('、');
	}

	function formatTime(ms: number): string {
		return new Date(ms).toLocaleString('zh-TW', { hour: '2-digit', minute: '2-digit', month: 'numeric', day: 'numeric' });
	}

	async function scrollToBottom() {
		await tick();
		if (messagesEl) messagesEl.scrollTop = messagesEl.scrollHeight;
	}

	async function loadUsers() {
		try {
			const res = await apiClient.get<{ data: UserLite[] }>('/users?pageSize=100');
			allUsers = res.data ?? [];
			usersById = Object.fromEntries(allUsers.map((u) => [u.id, u]));
		} catch {
			/* non-fatal: names fall back to ids */
		}
	}

	async function loadConversations() {
		loadingConversations = true;
		try {
			const page = await chatApi.listConversations({ limit: 50 });
			conversations = page.conversations;
		} catch (e) {
			toast.error('無法載入對話');
		} finally {
			loadingConversations = false;
		}
	}

	async function openConversation(id: string) {
		activeId = id;
		loadingMessages = true;
		messages = [];
		try {
			const page = await chatApi.getMessages(id, { limit: 50 });
			// service returns newest-first cursor pages; show oldest-first
			messages = [...page.messages].reverse();
			await scrollToBottom();
			const last = messages[messages.length - 1];
			if (last) chatApi.markRead(id, last.id).catch(() => {});
		} catch {
			toast.error('無法載入訊息');
		} finally {
			loadingMessages = false;
		}
	}

	async function send() {
		const content = draft.trim();
		if (!content || !activeId || sending) return;
		sending = true;
		const conversationId = activeId;
		try {
			const res = await chatApi.sendMessage(conversationId, { content });
			// optimistic append
			messages = [
				...messages,
				{
					id: res.id,
					conversation_id: conversationId,
					sender_id: myId,
					content,
					content_type: 'text',
					created_at: res.created_at,
					updated_at: null,
					reply_to_id: null,
					mentions: [],
					reactions: {},
					recalled_at: null
				}
			];
			draft = '';
			await scrollToBottom();
		} catch {
			toast.error('訊息發送失敗');
		} finally {
			sending = false;
		}
	}

	function toggleReaction(messageId: string, emoji: string) {
		reactionPickerFor = null;
		if (!activeId) return;
		patchMessage(messageId, (m) => {
			const reactions = { ...(m.reactions ?? {}) };
			const list = new Set(reactions[emoji] ?? []);
			list.has(myId) ? list.delete(myId) : list.add(myId);
			if (list.size > 0) reactions[emoji] = [...list];
			else delete reactions[emoji];
			return { ...m, reactions };
		});
		socket.send({ type: 'ToggleReaction', payload: { conversation_id: activeId, message_id: messageId, emoji } });
	}

	function recall(messageId: string) {
		if (!activeId) return;
		patchMessage(messageId, (m) => ({ ...m, recalled_at: Date.now() }));
		socket.send({ type: 'RecallMessage', payload: { conversation_id: activeId, message_id: messageId } });
	}

	function startEdit(m: ChatMessage) {
		editingId = m.id;
		editDraft = m.content;
	}

	function cancelEdit() {
		editingId = null;
		editDraft = '';
	}

	function saveEdit(messageId: string) {
		const content = editDraft.trim();
		if (!content || !activeId) return;
		patchMessage(messageId, (m) => ({ ...m, content, updated_at: Date.now() }));
		socket.send({ type: 'EditMessage', payload: { conversation_id: activeId, message_id: messageId, new_content: content } });
		editingId = null;
		editDraft = '';
	}

	async function startDirect(userId: string) {
		try {
			const existing = conversations.find(
				(c) => c.conversation_type === 'direct' && c.participants.includes(userId)
			);
			if (existing) {
				showNew = false;
				await openConversation(existing.id);
				return;
			}
			const conv = await chatApi.createConversation({
				conversation_type: 'direct',
				participants: [userId]
			});
			conversations = [conv, ...conversations];
			showNew = false;
			await openConversation(conv.id);
		} catch {
			toast.error('無法建立對話');
		}
	}

	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			send();
		}
	}

	function upsertConversationFromMessage(m: ChatMessage) {
		const idx = conversations.findIndex((c) => c.id === m.conversation_id);
		if (idx === -1) {
			// unknown conversation → refresh list lazily
			loadConversations();
			return;
		}
		const conv = { ...conversations[idx] };
		conv.last_message = {
			message_id: m.id,
			sender_id: m.sender_id,
			content_preview: m.content.slice(0, 80),
			content_type: m.content_type,
			created_at: m.created_at
		};
		conv.updated_at = m.created_at;
		if (m.conversation_id !== activeId && m.sender_id !== myId) {
			conv.unread_count = (conv.unread_count ?? 0) + 1;
		}
		conversations = [conv, ...conversations.filter((c) => c.id !== conv.id)];
	}

	async function handleServerMessage(msg: ChatServerMessage) {
		switch (msg.type) {
			case 'message': {
				const m = msg.message as ChatMessage | undefined;
				if (!m) return;
				if (m.conversation_id === activeId) {
					if (!messages.some((x) => x.id === m.id)) {
						messages = [...messages, m];
						await scrollToBottom();
						if (m.sender_id !== myId) chatApi.markRead(m.conversation_id, m.id).catch(() => {});
					}
				}
				upsertConversationFromMessage(m);
				break;
			}
			case 'typing': {
				if (msg.conversation_id === activeId && msg.user_id !== myId) {
					typingBy = userName(String(msg.user_id));
					if (typingTimer) clearTimeout(typingTimer);
					typingTimer = setTimeout(() => (typingBy = null), 4000);
				}
				break;
			}
			case 'message_recalled': {
				patchMessage(String(msg.message_id), (m) => ({ ...m, recalled_at: Date.now() }));
				break;
			}
			case 'message_edited': {
				patchMessage(String(msg.message_id), (m) => ({
					...m,
					content: String(msg.new_content ?? m.content),
					updated_at: Number(msg.edited_at ?? Date.now())
				}));
				break;
			}
			case 'reaction_update': {
				const emoji = String(msg.emoji);
				const uid = String(msg.user_id);
				const add = msg.action === 'add';
				patchMessage(String(msg.message_id), (m) => {
					const reactions = { ...(m.reactions ?? {}) };
					const list = new Set(reactions[emoji] ?? []);
					// idempotent: safe even if the actor also applied it optimistically
					add ? list.add(uid) : list.delete(uid);
					if (list.size > 0) reactions[emoji] = [...list];
					else delete reactions[emoji];
					return { ...m, reactions };
				});
				break;
			}
			case 'error': {
				if (msg.message) toast.error(String(msg.message));
				break;
			}
		}
	}

	function patchMessage(id: string, updater: (m: ChatMessage) => ChatMessage) {
		messages = messages.map((m) => (m.id === id ? updater(m) : m));
	}

	function emitTyping() {
		const now = Date.now();
		if (!activeId || now - lastTypingSent < 2000) return;
		lastTypingSent = now;
		socket.send({ type: 'Typing', payload: { conversation_id: activeId, is_typing: true } });
	}

	onMount(async () => {
		await Promise.all([loadUsers(), loadConversations()]);
		socket.on(handleServerMessage);
		socket.connect();
	});

	onDestroy(() => {
		if (typingTimer) clearTimeout(typingTimer);
		socket.disconnect();
	});
</script>

<div class="h-full flex">
	<!-- 對話列表 -->
	<aside class="w-72 border-r border-gray-200 dark:border-gray-800 flex flex-col bg-white dark:bg-gray-900">
		<div class="flex items-center justify-between px-4 h-14 border-b border-gray-200 dark:border-gray-800">
			<h2 class="font-semibold text-gray-900 dark:text-gray-100">聊天</h2>
			<button
				type="button"
				class="text-sm px-2 py-1 rounded-md bg-[var(--color-primary-600)] text-white hover:bg-[var(--color-primary-500)]"
				onclick={() => (showNew = !showNew)}
			>
				＋ 新對話
			</button>
		</div>

		{#if showNew}
			<div class="max-h-64 overflow-y-auto border-b border-gray-200 dark:border-gray-800">
				{#each allUsers.filter((u) => u.id !== myId) as u (u.id)}
					<button
						type="button"
						class="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800"
						onclick={() => startDirect(u.id)}
					>
						<span class="block text-sm text-gray-900 dark:text-gray-100 truncate">{u.name}</span>
						<span class="block text-xs text-gray-500 truncate">{u.email}</span>
					</button>
				{/each}
			</div>
		{/if}

		<div class="flex-1 overflow-y-auto">
			{#if loadingConversations}
				<p class="p-4 text-sm text-gray-500 text-center">載入中…</p>
			{:else if conversations.length === 0}
				<p class="p-4 text-sm text-gray-500 text-center">尚無對話,點「新對話」開始</p>
			{:else}
				{#each conversations as c (c.id)}
					<button
						type="button"
						class="w-full text-left px-4 py-3 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 {activeId === c.id ? 'bg-gray-100 dark:bg-gray-800' : ''}"
						onclick={() => openConversation(c.id)}
					>
						<div class="flex items-center justify-between gap-2">
							<span class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{conversationTitle(c)}</span>
							{#if c.unread_count > 0}
								<span class="text-xs bg-red-500 text-white rounded-full px-1.5 py-0.5">{c.unread_count}</span>
							{/if}
						</div>
						{#if c.last_message}
							<span class="block text-xs text-gray-500 truncate mt-0.5">{c.last_message.content_preview}</span>
						{/if}
					</button>
				{/each}
			{/if}
		</div>
	</aside>

	<!-- 訊息區 -->
	<section class="flex-1 flex flex-col bg-gray-50 dark:bg-gray-950 min-w-0">
		{#if !activeConversation}
			<div class="flex-1 flex items-center justify-center text-gray-400 text-sm">選擇或建立一個對話</div>
		{:else}
			<header class="h-14 px-4 flex items-center border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
				<h3 class="font-medium text-gray-900 dark:text-gray-100 truncate">{conversationTitle(activeConversation)}</h3>
			</header>

			<div bind:this={messagesEl} class="flex-1 overflow-y-auto p-4 space-y-3">
				{#if loadingMessages}
					<p class="text-sm text-gray-500 text-center">載入訊息中…</p>
				{:else if messages.length === 0}
					<p class="text-sm text-gray-500 text-center">還沒有訊息</p>
				{:else}
					{#each messages as m (m.id)}
						{@const mine = m.sender_id === myId}
						<div class="group flex {mine ? 'justify-end' : 'justify-start'}">
							<div class="max-w-[70%]">
								{#if !mine}
									<span class="block text-xs text-gray-500 mb-0.5">{userName(m.sender_id)}</span>
								{/if}

								{#if m.recalled_at}
									<div class="rounded-2xl px-3 py-2 text-sm italic text-gray-400 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
										此訊息已撤回
									</div>
								{:else if editingId === m.id}
									<div class="flex flex-col gap-1">
										<textarea
											class="rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1 text-sm text-gray-900 dark:text-gray-100"
											rows="2"
											bind:value={editDraft}
										></textarea>
										<div class="flex gap-2 justify-end text-xs">
											<button type="button" class="text-gray-500 hover:underline" onclick={cancelEdit}>取消</button>
											<button type="button" class="text-[var(--color-primary-600)] hover:underline" onclick={() => saveEdit(m.id)}>儲存</button>
										</div>
									</div>
								{:else}
									<div class="relative">
										<div class="rounded-2xl px-3 py-2 text-sm {mine ? 'bg-[var(--color-primary-600)] text-white' : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700'}">
											<p class="whitespace-pre-wrap break-words">{m.content}</p>
										</div>

										<!-- hover 動作 -->
										<div class="absolute -top-3 {mine ? 'left-0' : 'right-0'} hidden group-hover:flex items-center gap-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-full px-1 shadow-sm">
											<button type="button" class="text-sm px-1 hover:scale-110" title="表情" onclick={() => (reactionPickerFor = reactionPickerFor === m.id ? null : m.id)}>😊</button>
											{#if mine}
												<button type="button" class="text-xs px-1 text-gray-500 hover:text-gray-700" title="編輯" onclick={() => startEdit(m)}>編輯</button>
												<button type="button" class="text-xs px-1 text-red-500 hover:text-red-600" title="撤回" onclick={() => recall(m.id)}>撤回</button>
											{/if}
										</div>

										{#if reactionPickerFor === m.id}
											<div class="absolute top-6 {mine ? 'left-0' : 'right-0'} z-10 flex gap-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-full px-2 py-1 shadow-md">
												{#each EMOJIS as e}
													<button type="button" class="text-base hover:scale-125 transition-transform" onclick={() => toggleReaction(m.id, e)}>{e}</button>
												{/each}
											</div>
										{/if}
									</div>

									<!-- reaction chips -->
									{#if m.reactions && Object.keys(m.reactions).length > 0}
										<div class="flex flex-wrap gap-1 mt-1 {mine ? 'justify-end' : ''}">
											{#each Object.entries(m.reactions) as [emoji, ids]}
												<button
													type="button"
													class="text-xs px-1.5 py-0.5 rounded-full border {ids.includes(myId) ? 'border-[var(--color-primary-500)] bg-[var(--color-primary-50)] dark:bg-[var(--color-primary-900)]/30' : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'}"
													onclick={() => toggleReaction(m.id, emoji)}
												>
													{emoji} {ids.length}
												</button>
											{/each}
										</div>
									{/if}
								{/if}

								<span class="block text-[10px] text-gray-400 mt-0.5 {mine ? 'text-right' : ''}">
									{formatTime(m.created_at)}{#if m.updated_at && !m.recalled_at}・已編輯{/if}
								</span>
							</div>
						</div>
					{/each}
				{/if}
			</div>

			<div class="h-5 px-4 text-xs text-gray-400">
				{#if typingBy}{typingBy} 正在輸入…{/if}
			</div>

			<div class="p-3 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
				<div class="flex items-end gap-2">
					<textarea
						class="flex-1 resize-none rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-500)]"
						rows="1"
						placeholder="輸入訊息…(Enter 送出,Shift+Enter 換行)"
						bind:value={draft}
						onkeydown={onKeydown}
						oninput={emitTyping}
					></textarea>
					<button
						type="button"
						class="px-4 py-2 text-sm rounded-md bg-[var(--color-primary-600)] text-white hover:bg-[var(--color-primary-500)] disabled:opacity-50"
						disabled={sending || draft.trim() === ''}
						onclick={send}
					>
						送出
					</button>
				</div>
			</div>
		{/if}
	</section>
</div>
