import { useState, useEffect } from "react";
import Link from "next/link";
import { Play } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDateToNow, formatViews, type Video } from "@/lib/youtube-data";

type VideoCardProps = {
  video: Video;
};
export function VideoCard({ video }: VideoCardProps) {
  const [timeAgo, setTimeAgo] = useState("");

  useEffect(() => {
    setTimeAgo(formatDateToNow(video.createdAt));
  }, [video.createdAt]);

  return (
    <Link href={`/watch/${video.id}`} className="group block">
      <article className="grid gap-3">
        <div
          className={`relative flex aspect-video items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br ${video.gradient}`}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.72),transparent_18%),radial-gradient(circle_at_25%_70%,rgba(0,0,0,0.28),transparent_24%)]" />
          <div className="relative flex size-14 items-center justify-center rounded-full bg-black/70 text-white opacity-90 transition-transform group-hover:scale-110">
            <Play className="ml-1 size-7 fill-current" />
          </div>
          <span className="absolute bottom-2 right-2 rounded bg-black/85 px-1.5 py-0.5 text-xs font-semibold text-white">
            {video.duration}
          </span>
        </div>

        <div className="grid grid-cols-[36px_1fr] gap-3">
          <Avatar className="size-9">
            <AvatarFallback>{video.avatar}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h2 className="line-clamp-2 text-sm font-semibold leading-5">
              {video.title}
            </h2>
            <p className="mt-1 truncate text-sm text-muted-foreground">
              {video.channel}
            </p>
           <p className="text-sm text-muted-foreground">
  {formatViews(video.views)} views - {timeAgo}
</p>
          </div>
        </div>
      </article>
    </Link>
  );
}

export default VideoCard;
