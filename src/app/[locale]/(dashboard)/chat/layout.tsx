import { ChatSidebar } from '@/components/features/chat/chat-sidebar';

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Sidebar - hidden on mobile, visible on md+ screens */}
      <div className="hidden md:block md:w-[260px] shrink-0 h-full border-r border-border">
        <ChatSidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 h-full relative">
        {children}
      </div>
    </div>
  );
}
