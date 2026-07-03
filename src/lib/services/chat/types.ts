/**
 * Chat service types — mirror the Rust chat service REST/WS contract.
 * See services/chat/docs/<locale>/03-api-reference.md
 */

export type ConversationType = 'direct' | 'group';
export type ContentType = 'text' | 'image' | 'file' | 'system';
export type PresenceStatus = 'online' | 'away' | 'busy' | 'offline';

export interface LastMessage {
	message_id: string;
	sender_id: string;
	content_preview: string;
	content_type: ContentType;
	created_at: number;
}

export interface ConversationSummary {
	id: string;
	conversation_type: ConversationType;
	name: string | null;
	avatar_url: string | null;
	participant_count: number;
	participants: string[];
	last_message: LastMessage | null;
	unread_count: number;
	updated_at: number;
}

export interface ChatMessage {
	id: string;
	conversation_id: string;
	sender_id: string;
	content: string;
	content_type: ContentType;
	created_at: number;
	updated_at: number | null;
	reply_to_id: string | null;
	mentions: string[];
	reactions: Record<string, string[]>;
	recalled_at: number | null;
}

export interface ConversationsPage {
	conversations: ConversationSummary[];
	has_more: boolean;
}

export interface MessagesPage {
	messages: ChatMessage[];
	has_more: boolean;
}

export interface SendMessageInput {
	content: string;
	content_type?: ContentType;
	reply_to?: string | null;
	mentions?: string[];
	client_message_id?: string;
}

export interface SendMessageResult {
	id: string;
	conversation_id: string;
	created_at: number;
	client_message_id?: string;
}

export interface CreateConversationInput {
	conversation_type: ConversationType;
	participants: string[];
	name?: string | null;
}

export interface UnreadCounts {
	total: number;
	per_conversation: Record<string, number>;
}
