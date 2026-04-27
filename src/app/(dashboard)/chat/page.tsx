'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Database } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useCurrentCompanyId } from '@/hooks/useCurrentCompany';
import { useCreateSession } from '@/hooks/useChatSessions';
import { useDbConnections } from '@/hooks/useDbConnections';
import { ChatWelcome } from '@/components/features/chat/chat-welcome';
import { ChatInput } from '@/components/ui/chat-input';
import { EmptyState } from '@/components/shared/empty-state';
import { Button } from '@/components/ui/button';
import { setPendingChatQuery } from '@/store/pendingChatQuery';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

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
  const [modalOpen, setModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const autoOpenedRef = useRef(false);

  // Auto-select default connection once loaded
  useEffect(() => {
    if (!selectedConnectionId && connections.length > 0) {
      const def = connections.find((c) => c.is_default) ?? connections[0];
      setSelectedConnectionId(def.id);
    }
  }, [connections, selectedConnectionId]);

  // Auto-open modal once when company + connections are ready
  useEffect(() => {
    if (!companyId || connectionsLoading || autoOpenedRef.current) return;
    autoOpenedRef.current = true;
    setModalOpen(true);
  }, [companyId, connectionsLoading]);

  const handleSend = async (text: string) => {
    if (!companyId) {
      toast.error('Select a company before starting a chat.');
      return;
    }
    if (!selectedConnectionId) {
      toast.error('Select a database connection first.');
      setModalOpen(true);
      return;
    }
    if (!text.trim()) return;

    setIsCreating(true);
    try {
      const session = await createSession.mutateAsync({ connection_id: selectedConnectionId });
      // Pre-fill both caches so the session page's connection bar renders
      // immediately without waiting for either round-trip.
      queryClient.setQueryData(['chat-session', session.id, companyId], session);
      if (selected) {
        queryClient.setQueryData(['db-connections', selectedConnectionId, companyId], selected);
      }
      setPendingChatQuery(session.id, text.trim());
      router.push(`/chat/${session.id}`);
    } catch {
      toast.error('Failed to create chat session.');
      setIsCreating(false);
    }
  };

  const selected = connections.find((c) => c.id === selectedConnectionId);

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Connection bar — read-only display of modal selection */}
      {companyId && (
        <div className="flex shrink-0 items-center gap-2 border-b border-border bg-surface-200 px-6 py-2">
          <Database className="h-3.5 w-3.5 shrink-0 text-muted" strokeWidth={1.5} />
          {selected ? (
            <>
              <span className="font-sans text-caption text-foreground">{selected.name}</span>
              <span className="font-sans text-caption text-subtle">·</span>
              <span className="truncate font-mono text-mono-sm text-subtle">
                {selected.database_name}
              </span>
              <span className="rounded-md border border-border bg-surface-300 px-1.5 py-0.5 font-mono text-mono-sm uppercase tracking-wide text-subtle">
                {selected.database_type}
              </span>
              <button
                onClick={() => setModalOpen(true)}
                className="ml-auto font-sans text-caption text-muted transition-colors hover:text-foreground"
              >
                Change
              </button>
            </>
          ) : (
            <>
              <span className="font-sans text-caption text-muted">No database selected</span>
              <button
                onClick={() => setModalOpen(true)}
                className="ml-auto font-sans text-caption text-accent/80 transition-colors hover:text-accent"
              >
                Select
              </button>
            </>
          )}
        </div>
      )}

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
            disabled={!companyId || connections.length === 0}
          />
        </div>
      </div>

      {/* DB selection modal — auto-opens on first visit, re-opens on error */}
      <Dialog open={modalOpen} onOpenChange={(open) => { if (!open) setModalOpen(false); }}>
        <DialogContent className="sm:max-w-md" showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Choose a database</DialogTitle>
            <DialogDescription>
              Select a connection to use for this conversation.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-1.5">
            <label className="font-sans text-caption text-muted">Connection</label>
            {connections.length === 0 ? (
              <p className="font-sans text-button text-muted">
                No connections available.{' '}
                <a
                  href="/connections"
                  className="text-accent/80 underline-offset-2 hover:text-accent hover:underline"
                >
                  Add one
                </a>{' '}
                first.
              </p>
            ) : (
              <Select
                value={selectedConnectionId ?? ''}
                onValueChange={(v) => { if (v) setSelectedConnectionId(v); }}
              >
                <SelectTrigger className="w-full rounded-lg focus-visible:ring-1 focus-visible:ring-accent/30">
                  <SelectValue placeholder="Select a connection…">
                    {selected ? (
                      <span className="flex items-center gap-2">
                        <Database className="h-3.5 w-3.5 shrink-0 text-muted" strokeWidth={1.5} />
                        <span>{selected.name}</span>
                        {selected.database_name && (
                          <span className="font-mono text-mono-sm text-subtle">
                            · {selected.database_name}
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="text-muted">Select a connection…</span>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {connections.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      <span className="flex flex-col">
                        <span>{c.name}</span>
                        {c.database_name && (
                          <span className="font-mono text-mono-sm text-subtle">
                            {c.database_name}
                          </span>
                        )}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <DialogFooter className="bg-transparent border-border">
            <Button
              variant="outline"
              onClick={() => setModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => setModalOpen(false)}
              disabled={!selectedConnectionId || connections.length === 0}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
