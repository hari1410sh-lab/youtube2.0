import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Search, SlidersHorizontal } from "lucide-react";

import Sidebar from "@/components/sidebar";
import { Button } from "@/components/ui/button";
import videoApi from "@/lib/video-api";
import {
  formatDateToNow,
  formatViews,
  type Video,
  videos,
} from "@/lib/youtube-data";

function getSearchTerm(query: string | string[] | undefined) {
  return Array.isArray(query) ? query[0] ?? "" : query ?? "";
}

function searchVideos(term: string, allVideos: Video[]) {
  const normalizedTerm = term.trim().toLowerCase();

  if (!normalizedTerm) return allVideos;

  return allVideos.filter((video) => {
    const searchableText = [
      video.title,
      video.channel,
      video.category,
      video.description,
    ]
      .join(" ")
      .toLowerCase();

    return searchableText.includes(normalizedTerm);
  });
}

function ResultThumbnail({ video }: { video: Video }) {
  return (
    <div
      className={`relative flex aspect-video w-56 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br ${video.gradient}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.72),transparent_18%),radial-gradient(circle_at_25%_70%,rgba(0,0,0,0.28),transparent_24%)]" />
      <span className="absolute bottom-2 right-2 rounded bg-black/85 px-1.5 py-0.5 text-xs font-semibold text-white">
        {video.duration}
      </span>
    </div>
  );
}

function SearchResult({ video }: { video: Video }) {
  return (
    <Link
      href={`/watch/${video.id}`}
      className="grid max-w-5xl grid-cols-[224px_1fr] gap-4 rounded-md p-2 transition-colors hover:bg-secondary/70 max-sm:grid-cols-1"
    >
      <ResultThumbnail video={video} />
      <div className="min-w-0 py-1">
        <h2 className="line-clamp-2 text-lg font-medium leading-6">
          {video.title}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {formatViews(video.views)} views - {formatDateToNow(video.createdAt)}
        </p>
        <div className="mt-3 flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-full bg-secondary text-xs font-medium">
            {video.avatar}
          </span>
          <p className="text-sm text-muted-foreground">{video.channel}</p>
        </div>
        <p className="mt-3 line-clamp-2 text-sm leading-5 text-muted-foreground">
          {video.description}
        </p>
      </div>
    </Link>
  );
}

export default function SearchPage() {
  const router = useRouter();
  const searchTerm = getSearchTerm(router.query.q);
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
  const results = searchVideos(searchTerm, allVideos);

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-background">
      <Sidebar />
      <main className="min-w-0 flex-1 px-4 py-4 sm:px-6">
        <div className="flex items-center justify-between gap-3 border-b pb-4">
          <div>
            <h1 className="text-xl font-semibold">Search results</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {searchTerm
                ? `${results.length} results for "${searchTerm}"`
                : `${results.length} videos`}
            </p>
          </div>
          <Button variant="secondary" className="gap-2">
            <SlidersHorizontal className="size-4" />
            Filters
          </Button>
        </div>

        {results.length > 0 ? (
          <section className="mt-4 grid gap-2">
            {results.map((video) => (
              <SearchResult key={video.id} video={video} />
            ))}
          </section>
        ) : (
          <section className="grid min-h-80 place-items-center text-center">
            <div>
              <Search className="mx-auto size-10 text-muted-foreground" />
              <h2 className="mt-4 text-lg font-medium">No results found</h2>
              <p className="mt-2 max-w-sm text-sm text-muted-foreground">
                Try searching for another title, channel, category, or topic.
              </p>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
