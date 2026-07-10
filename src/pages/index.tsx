import { useEffect, useState } from "react";
import CategoryTabs from "@/components/category-tabs";
import Sidebar from "@/components/sidebar";
import VideoCard from "@/components/video-card";
import { videos } from "@/lib/youtube-data";
import videoApi from "@/lib/video-api";

export default function Home() {
  const [dbVideos, setDbVideos] = useState<any[]>([]);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const result = await videoApi.getVideos();
        setDbVideos(result);
      } catch (error) {
        console.error("Error fetching videos from DB:", error);
      }
    };
    fetchVideos();
  }, []);

  const mappedDbVideos = dbVideos.map((dbVideo) => ({
    id: dbVideo._id,
    title: dbVideo.title,
    channel: dbVideo.channelName || "Unknown Channel",
    views: dbVideo.views || 0,
    createdAt: dbVideo.createdAt,
    duration: dbVideo.duration ? `${Math.floor(dbVideo.duration / 60)}:${String(Math.floor(dbVideo.duration % 60)).padStart(2, '0')}` : "0:00",
    category: dbVideo.category || "All",
    avatar: (dbVideo.channelName || "U").charAt(0).toUpperCase(),
    gradient: "from-blue-600 to-indigo-600",
    description: dbVideo.description || "",
    videoUrl: dbVideo.videoUrl,
  }));

  const allVideos = [...mappedDbVideos, ...videos];

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-background">
      <Sidebar />
      <main className="min-w-0 flex-1">
        <CategoryTabs />
        <section className="grid gap-x-4 gap-y-10 p-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {allVideos.map((video) => (
            <VideoCard key={video.id} video={video} />
          ))}
        </section>
      </main>
    </div>
  );
}
