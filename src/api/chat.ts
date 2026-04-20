/**
 * Chat API functions.
 */

import api from './axios';
import type {
  ChatSession,
  ChatSessionListResponse,
  ChatSessionCreate,
  ChatSessionUpdate,
  ChatMessageListResponse,
  ChatMessageSubmitResponse,
} from '../types/chat';

export async function createSession(
  data: ChatSessionCreate,
  companyId?: string,
): Promise<ChatSession> {
  const response = await api.post<ChatSession>('/chat/sessions', data, {
    params: companyId ? { company_id: companyId } : undefined,
  });
  return response.data;
}

export async function listSessions(
  skip = 0,
  limit = 50,
  companyId?: string,
): Promise<ChatSessionListResponse> {
  const response = await api.get<ChatSessionListResponse>('/chat/sessions', {
    params: {
      skip,
      limit,
      ...(companyId ? { company_id: companyId } : {}),
    },
  });
  return response.data;
}

export async function getSession(
  sessionId: string,
  companyId?: string,
): Promise<ChatSession> {
  const response = await api.get<ChatSession>(`/chat/sessions/${sessionId}`, {
    params: companyId ? { company_id: companyId } : undefined,
  });
  return response.data;
}

export async function updateSession(
  sessionId: string,
  data: ChatSessionUpdate,
  companyId?: string,
): Promise<ChatSession> {
  const response = await api.patch<ChatSession>(
    `/chat/sessions/${sessionId}`,
    data,
    { params: companyId ? { company_id: companyId } : undefined },
  );
  return response.data;
}

export async function deleteSession(
  sessionId: string,
  companyId?: string,
): Promise<void> {
  await api.delete(`/chat/sessions/${sessionId}`, {
    params: companyId ? { company_id: companyId } : undefined,
  });
}

export async function listMessages(
  sessionId: string,
  skip = 0,
  limit = 50,
  companyId?: string,
): Promise<ChatMessageListResponse> {
  const response = await api.get<ChatMessageListResponse>(
    `/chat/sessions/${sessionId}/messages`,
    {
      params: {
        skip,
        limit,
        ...(companyId ? { company_id: companyId } : {}),
      },
    },
  );
  return response.data;
}

export async function sendMessage(
  sessionId: string,
  content: string,
  companyId?: string,
  language?: string,
): Promise<ChatMessageSubmitResponse> {
  const body: Record<string, unknown> = { content };
  if (language) body.language = language;

  const response = await api.post<ChatMessageSubmitResponse>(
    `/chat/sessions/${sessionId}/messages`,
    body,
    { params: companyId ? { company_id: companyId } : undefined },
  );
  return response.data;
}
