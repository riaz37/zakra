'use client';

import { useRouter } from 'next/navigation';
import { useCurrentCompanyId } from '@/hooks/useCurrentCompany';
import { useCreateSession } from '@/hooks/useChatSessions';
import { ChatWelcome } from '@/components/features/chat/chat-welcome';
import { ChatInput } from '@/components/ui/chat-input';
import { EmptyState } from '@/components/shared/empty-state';
import { toast } from 'sonner';

export default function NewChatPage() {
  const router = useRouter();
  const companyId = useCurrentCompanyId();
  const createSession = useCreateSession(companyId);

  const handlePrompt = async (text: string) => {
    if (!companyId) {
      toast.error('Select a company before starting a chat.');
      return;
    }

    if (!text.trim()) return;

    try {
      const session = await createSession.mutateAsync({});
      // Navigate to the new session and pass the initial prompt via query param
      router.push(`/chat/${session.id}?q=${encodeURIComponent(text)}`);
    } catch (error) {
      toast.error('Failed to create chat session.');
      console.error(error);
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex flex-1 items-center justify-center overflow-y-auto px-6 py-6">
        <div className="w-full max-w-[720px]">
          {!companyId ? (
            <EmptyState
              title="No company selected"
              description="Select a company from the sidebar to start a conversation."
            />
          ) : (
            <ChatWelcome onPrompt={handlePrompt} />
          )}
        </div>
      </div>
      <div className="bg-background px-6 pb-6 pt-3">
        <div className="mx-auto max-w-[720px]">
          <ChatInput
            onSendMessage={handlePrompt}
            onStop={() => {}}
            isStreaming={false}
            disabled={!companyId}
          />
        </div>
      </div>
    </div>
  );
}
