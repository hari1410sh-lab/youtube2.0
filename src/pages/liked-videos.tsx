import { useEffect, useState } from "react";
import SavedVideosContent from "@/components/saved-videos-content";
import Sidebar from "@/components/sidebar";
import { likedVideos, type Video } from "@/lib/youtube-data";
import { useUser } from "@/lib/authcontext";
import videoApi from "@/lib/video-api";

function mapDbVideoToVideo(v: any): Video {
  return {
    id: v._id,
    title: v.title,
    channel: v.channelName || "Unknown Channel",
    views: v.views || 0,
    createdAt: v.createdAt,
    duration: v.duration
      ? `${Math.floor(v.duration / 60)}:${String(Math.floor(v.duration % 60)).padStart(2, "0")}`
      : "0:00",
    category: v.category || "All",
    avatar: (v.channelName || "U").charAt(0).toUpperCase(),
    gradient: "from-blue-600 to-indigo-600",
    description: v.description || "",
  };
}

export default function LikedVideosPage() {
  const { user } = useUser() as { user: any };
  const [videosList, setVideosList] = useState<Video[]>(likedVideos);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?._id) {
      setVideosList(likedVideos);
      return;
    }

    const fetchLiked = async () => {
      setLoading(true);
      try {
        const dbLiked = await videoApi.getLikedVideos(user._id);
        if (dbLiked.length > 0) {
          setVideosList(dbLiked.map(mapDbVideoToVideo));
        } else {
          setVideosList(likedVideos);
        }
      } catch (error) {
        console.error("Error fetching liked videos:", error);
        setVideosList(likedVideos);
      } finally {
        setLoading(false);
      }
    };

    fetchLiked();
  }, [user?._id]);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-background">
      <Sidebar />
      <main className="min-w-0 flex-1">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-lg font-medium text-muted-foreground animate-pulse">
              Loading liked videos...
            </p>
          </div>
        ) : (
          <SavedVideosContent
            title="Liked videos"
            description="videos you liked"
            videos={videosList}
            icon="liked"
          />
        )}
      </main>
    </div>
  );
}
