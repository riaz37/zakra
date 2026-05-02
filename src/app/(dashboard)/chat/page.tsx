'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useCurrentCompanyId } from '@/hooks/useCurrentCompany';
import { useCreateSession } from '@/hooks/useChatSessions';
import { useDbConnections } from '@/hooks/useDbConnections';
import { ChatWelcome } from '@/components/features/chat/chat-welcome';
import { ChatInput } from '@/components/ui/chat-input';
import { EmptyState } from '@/components/shared/empty-state';
import { setPendingTask } from '@/store/pendingChatTask';
import { sendMessage } from '@/api/chat';
import { toast } from 'sonner';
import { AnimatedPage } from '@/components/shared/animated-container';

export default function NewChatPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const companyId = useCurrentCompanyId();
  const createSession = useCreateSession(companyId);
  const { data: connectionsData, isLoading: connectionsLoading } = useDbConnections({
    company_id: companyId,
  });
  const connections = connectionsData?.items ?? [];

  const [selectedConnectionId, setSelectedConnectionId] = useState<string | undefined>();
  const [isCreating, setIsCreating] = useState(false);

  // Auto-select default connection once loaded
  useEffect(() => {
    if (!selectedConnectionId && connections.length > 0) {
      const def = connections.find((c) => c.is_default) ?? connections[0];
      setSelectedConnectionId(def.id);
    }
  }, [connections, selectedConnectionId]);

  const handleSend = async (text: string) => {
    if (!companyId) {
      toast.error('Select a company before starting a chat.');
      return;
    }
    if (!selectedConnectionId) {
      toast.error('Select a database connection first.');
      return;
    }
    if (!text.trim()) return;

    setIsCreating(true);
    try {
      const selected = connections.find((c) => c.id === selectedConnectionId);
      const session = await createSession.mutateAsync({ connection_id: selectedConnectionId });
      queryClient.setQueryData(['chat-session', session.id, companyId], session);
      if (selected) {
        queryClient.setQueryData(['db-connections', selectedConnectionId, companyId], selected);
      }
      const { task_id } = await sendMessage(session.id, text.trim(), companyId);
      setPendingTask(session.id, { taskId: task_id, userMessage: text.trim() });
      router.push(`/chat/${session.id}`);
    } catch {
      toast.error('Failed to create chat session.');
      setIsCreating(false);
    }
  };

  return (
    <AnimatedPage className="flex h-full flex-col overflow-hidden">
      <div className="flex flex-1 items-center justify-center overflow-y-auto px-6 py-6">
        <div className="w-full max-w-[720px]">
          {!companyId ? (
            <EmptyState
              title="No company selected"
              description="Select a company from the sidebar to start a conversation."
            />
          ) : (
            <ChatWelcome onPrompt={(text) => void handleSend(text)} />
          )}
        </div>
      </div>

      <div className="bg-background px-6 pb-6 pt-3">
        <div className="mx-auto max-w-[720px]">
          <ChatInput
            onSendMessage={(text) => void handleSend(text)}
            onStop={() => {}}
            isStreaming={isCreating}
            disabled={!companyId || connectionsLoading}
            connections={connections}
            selectedConnectionId={selectedConnectionId ?? null}
            onConnectionChange={setSelectedConnectionId}
          />
        </div>
      </div>
    </AnimatedPage>
  );
}
