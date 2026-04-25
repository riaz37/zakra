'use client';

import { useRouter } from 'next/navigation';
import { useCurrentCompanyId } from '@/hooks/useCurrentCompany';
import { useCreateSession } from '@/hooks/useChatSessions';
import { ChatWelcome } from '@/components/features/chat/chat-welcome';
import { ChatInput } from '@/components/ui/chat-input';
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
      {!companyId ? (
        <div className="flex h-full items-center justify-center p-6">
          <div className="flex max-w-md flex-col items-center justify-center rounded-lg border border-border border-dashed p-8 text-center animate-fade-up">
            <h3 className="mb-2 text-lg font-semibold text-foreground">No company selected</h3>
            <p className="text-sm text-muted-foreground">
              Please select a company from the sidebar switcher to start a conversation with your data.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto px-6 py-6 flex items-center justify-center">
            <div className="w-full max-w-[720px]">
              <ChatWelcome onPrompt={handlePrompt} />
            </div>
          </div>
          <div className="bg-background px-6 pb-6 pt-3">
            <div className="mx-auto max-w-[720px]">
              <ChatInput
                onSendMessage={handlePrompt}
                onStop={() => {}}
                isStreaming={false}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
