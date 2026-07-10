import HistoryContent from "@/components/historycontent";
import Sidebar from "@/components/sidebar";

export default function HistoryPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-background">
      <Sidebar />
      <main className="min-w-0 flex-1">
        <HistoryContent />
      </main>
    </div>
  );
}
