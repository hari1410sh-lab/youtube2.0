import Link from "next/link";

import { formatDateToNow, formatViews, videos, type Video } from "@/lib/youtube-data";

type HistoryItem = {
  video: Video;
  watchedAt: string;
};

const historyItems: HistoryItem[] = [
  {
    video: videos[0],
    watchedAt: "Watched about 1 hour ago",
  },
  {
    video: videos[1],
    watchedAt: "Watched about 2 hours ago",
  },
];

function HistoryThumbnail({ video }: { video: Video }) {
  return (
    <div
      className={`relative aspect-video w-40 shrink-0 overflow-hidden rounded-md bg-gradient-to-br ${video.gradient}`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.72),transparent_18%),radial-gradient(circle_at_25%_70%,rgba(0,0,0,0.28),transparent_24%)]" />
      <span className="absolute bottom-1 right-1 rounded bg-black/85 px-1.5 py-0.5 text-[11px] font-semibold text-white">
        {video.duration}
      </span>
    </div>
  );
}

function HistoryRow({ item }: { item: HistoryItem }) {
  const { video, watchedAt } = item;

  return (
    <Link
      href={`/watch/${video.id}`}
      className="grid max-w-2xl grid-cols-[160px_1fr] gap-4 rounded-md py-2 transition-colors hover:bg-secondary/70"
    >
      <HistoryThumbnail video={video} />
      <div className="min-w-0 py-0.5">
        <h2 className="line-clamp-2 text-sm font-medium leading-5">
          {video.title}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">{video.channel}</p>
        <p className="text-sm text-muted-foreground">
          {formatViews(video.views)} views - {formatDateToNow(video.createdAt)}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">{watchedAt}</p>
      </div>
    </Link>
  );
}

export function HistoryContent() {
  return (
    <section className="w-full max-w-3xl px-4 py-3 sm:px-6">
      <h1 className="text-lg font-medium">Watch History</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {historyItems.length} videos
      </p>

      <div className="mt-3 grid gap-1">
        {historyItems.map((item) => (
          <HistoryRow key={item.video.id} item={item} />
        ))}
      </div>
    </section>
  );
}

export default HistoryContent;
