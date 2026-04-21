import { Suspense } from "react";
import { ChatView } from "../_components/chat-view";

interface ChatSessionPageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function ChatSessionPage({ params }: ChatSessionPageProps) {
  const { sessionId } = await params;
  return (
    <Suspense fallback={null}>
      <ChatView sessionId={sessionId} />
    </Suspense>
  );
}
