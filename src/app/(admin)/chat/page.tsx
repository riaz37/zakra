import { Suspense } from "react";
import { ChatView } from "./_components/chat-view";

export default function ChatPage() {
  return (
    <Suspense fallback={null}>
      <ChatView sessionId={null} />
    </Suspense>
  );
}
