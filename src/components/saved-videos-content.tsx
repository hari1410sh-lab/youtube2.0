import Link from "next/link";
import { Clock, Play, ThumbsUp, type LucideIcon } from "lucide-react";

import { formatDateToNow, formatViews, type Video } from "@/lib/youtube-data";

type SavedVideosContentProps = {
  title: string;
  description: string;
  videos: Video[];
  icon: "liked" | "watch-later";
};

function SavedThumbnail({ video }: { video: Video }) {
  return (
    <div
      className={`relative flex aspect-video w-44 shrink-0 items-center justify-center overflow-hidden rounded-md bg-gradient-to-br ${video.gradient}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.72),transparent_18%),radial-gradient(circle_at_25%_70%,rgba(0,0,0,0.28),transparent_24%)]" />
      <div className="relative flex size-10 items-center justify-center rounded-full bg-black/70 text-white opacity-90">
        <Play className="ml-0.5 size-5 fill-current" />
      </div>
      <span className="absolute bottom-1 right-1 rounded bg-black/85 px-1.5 py-0.5 text-[11px] font-semibold text-white">
        {video.duration}
      </span>
    </div>
  );
}

function SavedVideoRow({ video }: { video: Video }) {
  return (
    <Link
      href={`/watch/${video.id}`}
      className="grid max-w-3xl grid-cols-[176px_1fr] gap-4 rounded-md py-2 transition-colors hover:bg-secondary/70 max-sm:grid-cols-1"
    >
      <SavedThumbnail video={video} />
      <div className="min-w-0 py-0.5">
        <h2 className="line-clamp-2 text-sm font-medium leading-5">
          {video.title}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">{video.channel}</p>
        <p className="text-sm text-muted-foreground">
          {formatViews(video.views)} views - {formatDateToNow(video.createdAt)}
        </p>
        <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">
          {video.description}
        </p>
      </div>
    </Link>
  );
}

function EmptyState({ Icon }: { Icon: LucideIcon }) {
  return (
    <div className="mt-10 grid max-w-md gap-3 rounded-md border border-dashed p-8 text-center">
      <Icon className="mx-auto size-8 text-muted-foreground" />
      <h2 className="text-base font-medium">No videos yet</h2>
      <p className="text-sm text-muted-foreground">
        Saved videos will appear here when this collection has items.
      </p>
    </div>
  );
}

export function SavedVideosContent({
  title,
  description,
  videos,
  icon,
}: SavedVideosContentProps) {
  const Icon = icon === "liked" ? ThumbsUp : Clock;

  return (
    <section className="w-full px-4 py-4 sm:px-6">
      <div className="flex items-center gap-3">
        <div className="flex size-11 items-center justify-center rounded-full bg-secondary">
          <Icon className="size-5" />
        </div>
        <div>
          <h1 className="text-lg font-medium">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {videos.length} videos - {description}
          </p>
        </div>
      </div>

      {videos.length > 0 ? (
        <div className="mt-4 grid gap-1">
          {videos.map((video) => (
            <SavedVideoRow key={video.id} video={video} />
          ))}
        </div>
      ) : (
        <EmptyState Icon={Icon} />
      )}
    </section>
  );
}

export default SavedVideosContent;
