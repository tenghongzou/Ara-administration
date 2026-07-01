/**
 * Chat REST API client.
 *
 * Talks directly to the Rust chat service (config.chatApiUrl) with a Bearer
 * JWT from the auth store. Kept separate from the backend apiClient because
 * it targets a different origin/prefix (dev: :8082, prod: /chat).
 */

import { get } from 'svelte/store';
import { config } from '$lib/constants/config';
import { auth } from '$lib/stores/auth';
import type {
	ConversationsPage,
	ConversationSummary,
	MessagesPage,
	SendMessageInput,
	SendMessageResult,
	CreateConversationInput,
	UnreadCounts
} from './types';

async function chatFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
	const token = get(auth).token;
	const res = await fetch(`${config.chatApiUrl}${path}`, {
		...init,
		headers: {
			'Content-Type': 'application/json',
			...(token ? { Authorization: `Bearer ${token}` } : {}),
			...(init.headers ?? {})
		}
	});

	if (!res.ok) {
		let detail = '';
		try {
			detail = JSON.stringify(await res.json());
		} catch {
			/* ignore */
		}
		throw new Error(`Chat API ${res.status} ${path} ${detail}`.trim());
	}

	// 204 / empty body
	if (res.status === 204) return undefined as T;
	return (await res.json()) as T;
}

function qs(params: Record<string, string | number | undefined>): string {
	const sp = new URLSearchParams();
	for (const [k, v] of Object.entries(params)) {
		if (v !== undefined && v !== '') sp.set(k, String(v));
	}
	const s = sp.toString();
	return s ? `?${s}` : '';
}

export const chatApi = {
	listConversations(opts: { before?: string; limit?: number } = {}): Promise<ConversationsPage> {
		return chatFetch<ConversationsPage>(`/conversations${qs(opts)}`);
	},

	getConversation(id: string): Promise<ConversationSummary> {
		return chatFetch<ConversationSummary>(`/conversations/${id}`);
	},

	createConversation(input: CreateConversationInput): Promise<ConversationSummary> {
		return chatFetch<ConversationSummary>('/conversations', {
			method: 'POST',
			body: JSON.stringify(input)
		});
	},

	getMessages(
		conversationId: string,
		opts: { before?: string; limit?: number } = {}
	): Promise<MessagesPage> {
		return chatFetch<MessagesPage>(`/conversations/${conversationId}/messages${qs(opts)}`);
	},

	sendMessage(conversationId: string, input: SendMessageInput): Promise<SendMessageResult> {
		return chatFetch<SendMessageResult>(`/conversations/${conversationId}/messages`, {
			method: 'POST',
			body: JSON.stringify({ content_type: 'text', ...input })
		});
	},

	markRead(conversationId: string, messageId: string): Promise<void> {
		return chatFetch<void>(`/conversations/${conversationId}/read`, {
			method: 'POST',
			body: JSON.stringify({ message_id: messageId })
		});
	},

	getUnread(): Promise<UnreadCounts> {
		return chatFetch<UnreadCounts>('/unread');
	}
};
