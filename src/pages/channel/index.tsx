import ChannelContent from "@/components/channel-content";
import Sidebar from "@/components/sidebar";

export default function ChannelIndexPage() {
  return (
    <main className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="min-w-0 flex-1">
        <ChannelContent />
      </div>
    </main>
  );
}
