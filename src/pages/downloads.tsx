import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Download,
  Film,
  Crown,
  ShieldCheck,
  Star,
  Zap,
  Lock,
  ArrowRight,
  CalendarDays,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import Sidebar from "@/components/sidebar";
import { useUser } from "@/lib/authcontext";
import videoApi from "@/lib/video-api";

/* ─────────────────────────────────────────────────────────── */
/*  Types & Constants                                          */
/* ─────────────────────────────────────────────────────────── */

type PlanKey = "Free" | "Bronze" | "Silver" | "Gold";

const PLAN_LIMITS: Record<PlanKey, number | "Unlimited"> = {
  Free: 1,
  Bronze: 3,
  Silver: 5,
  Gold: "Unlimited",
};

const PLAN_META: Record<
  PlanKey,
  { icon: React.ElementType; color: string; ring: string; bg: string; text: string; badge: string }
> = {
  Free: {
    icon: Zap,
    color: "text-slate-400",
    ring: "ring-slate-400/30",
    bg: "bg-slate-400/10",
    text: "text-slate-300",
    badge: "bg-slate-700 text-slate-200",
  },
  Bronze: {
    icon: ShieldCheck,
    color: "text-amber-500",
    ring: "ring-amber-500/30",
    bg: "bg-amber-500/10",
    text: "text-amber-300",
    badge: "bg-amber-900/60 text-amber-300",
  },
  Silver: {
    icon: Star,
    color: "text-sky-400",
    ring: "ring-sky-400/30",
    bg: "bg-sky-400/10",
    text: "text-sky-300",
    badge: "bg-sky-900/60 text-sky-300",
  },
  Gold: {
    icon: Crown,
    color: "text-yellow-400",
    ring: "ring-yellow-400/30",
    bg: "bg-yellow-400/10",
    text: "text-yellow-300",
    badge: "bg-yellow-900/60 text-yellow-300",
  },
};

/* ─────────────────────────────────────────────────────────── */
/*  Helpers                                                    */
/* ─────────────────────────────────────────────────────────── */

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isToday(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  );
}

/* ─────────────────────────────────────────────────────────── */
/*  Sub-components                                             */
/* ─────────────────────────────────────────────────────────── */

function PlanBadge({ plan }: { plan: PlanKey }) {
  const meta = PLAN_META[plan] ?? PLAN_META.Free;
  const Icon = meta.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${meta.badge}`}
    >
      <Icon className="size-3" />
      {plan}
    </span>
  );
}

function QuotaCard({
  plan,
  todayCount,
}: {
  plan: PlanKey;
  todayCount: number;
}) {
  const meta = PLAN_META[plan] ?? PLAN_META.Free;
  const Icon = meta.icon;
  const limit = PLAN_LIMITS[plan];
  const isUnlimited = limit === "Unlimited";
  const used = isUnlimited ? todayCount : Math.min(todayCount, limit as number);
  const remaining = isUnlimited ? "∞" : Math.max((limit as number) - used, 0);
  const progress = isUnlimited ? 100 : ((used / (limit as number)) * 100);
  const isFull = !isUnlimited && (limit as number) - used <= 0;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border ring-1 ${meta.ring} border-white/5 bg-gradient-to-br from-white/5 to-white/[0.02] p-5 backdrop-blur-sm`}
    >
      {/* Decorative glow */}
      <div
        className={`absolute -right-8 -top-8 size-36 rounded-full blur-3xl opacity-20 ${meta.bg}`}
      />

      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: plan info */}
        <div className="flex items-center gap-3">
          <div
            className={`flex size-11 items-center justify-center rounded-xl ring-1 ${meta.ring} ${meta.bg}`}
          >
            <Icon className={`size-5 ${meta.color}`} />
          </div>
          <div>
            <p className="text-[11px] font-medium uppercase tracking-widest text-white/40">
              Active Plan
            </p>
            <p className={`text-lg font-bold ${meta.color}`}>{plan}</p>
          </div>
        </div>

        {/* Right: quota numbers */}
        <div className="flex items-center gap-6 text-center">
          <div>
            <p className="text-2xl font-bold text-white">{used}</p>
            <p className="text-[11px] text-white/40">Used today</p>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div>
            <p className={`text-2xl font-bold ${isFull ? "text-red-400" : meta.color}`}>
              {remaining}
            </p>
            <p className="text-[11px] text-white/40">Remaining</p>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div>
            <p className="text-2xl font-bold text-white">
              {isUnlimited ? "∞" : limit}
            </p>
            <p className="text-[11px] text-white/40">Daily limit</p>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      {!isUnlimited && (
        <div className="relative mt-4">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                isFull ? "bg-red-500" : "bg-gradient-to-r from-blue-500 to-violet-500"
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
          {isFull && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-red-400">
              <AlertTriangle className="size-3" />
              Daily limit reached. Resets at midnight.
            </p>
          )}
        </div>
      )}

      {/* Upgrade CTA for free users */}
      {plan === "Free" && (
        <div className="mt-4 flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-4 py-2.5">
          <p className="text-xs text-white/50">
            Want more daily downloads?{" "}
            <span className="text-white/70 font-medium">Upgrade your plan</span>
          </p>
          <Link
            href="/subscribe"
            className="flex items-center gap-1 rounded-full bg-violet-600 px-3 py-1 text-xs font-semibold text-white transition-colors hover:bg-violet-500"
          >
            Upgrade <ArrowRight className="size-3" />
          </Link>
        </div>
      )}
    </div>
  );
}

function DownloadRow({ download }: { download: any }) {
  const video = download.video || {};
  const plan: PlanKey = (download.plan as PlanKey) ?? "Free";
  const title = video.title || "Untitled Video";
  const channel = video.channelName || "Unknown Channel";
  const downloadedAt: string = download.downloadedAt ?? "";
  const today = isToday(downloadedAt);
  const videoId = video._id ?? "";

  return (
    <div className="group grid grid-cols-[48px_1fr_auto] items-center gap-4 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3 transition-colors hover:bg-white/[0.07]">
      {/* Thumbnail placeholder */}
      <div className="relative flex aspect-video w-12 shrink-0 items-center justify-center overflow-hidden rounded-md bg-gradient-to-br from-blue-600/40 to-violet-600/40">
        <Film className="size-4 text-white/50" />
      </div>

      {/* Details */}
      <div className="min-w-0">
        {videoId ? (
          <Link
            href={`/watch/${videoId}`}
            className="block truncate text-sm font-semibold text-white/90 transition-colors hover:text-violet-400"
          >
            {title}
          </Link>
        ) : (
          <p className="truncate text-sm font-semibold text-white/90">{title}</p>
        )}
        <p className="truncate text-xs text-white/40">{channel}</p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1 text-[11px] text-white/30">
            <CalendarDays className="size-3" />
            {downloadedAt ? formatDate(downloadedAt) : "—"}
          </span>
          {today && (
            <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400">
              Today
            </span>
          )}
        </div>
      </div>

      {/* Plan badge */}
      <PlanBadge plan={plan} />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mt-12 flex flex-col items-center gap-4 rounded-2xl border border-dashed border-white/10 py-16 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-white/5">
        <Download className="size-7 text-white/30" />
      </div>
      <div>
        <h2 className="text-base font-semibold text-white/60">No downloads yet</h2>
        <p className="mt-1 text-sm text-white/30">
          Videos you download will appear here
        </p>
      </div>
      <Link
        href="/"
        className="mt-2 flex items-center gap-1.5 rounded-full bg-violet-600 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-500"
      >
        Browse videos <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}

function SignInPrompt() {
  return (
    <div className="mt-12 flex flex-col items-center gap-4 rounded-2xl border border-dashed border-white/10 py-16 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-white/5">
        <Lock className="size-7 text-white/30" />
      </div>
      <div>
        <h2 className="text-base font-semibold text-white/60">Sign in to see your downloads</h2>
        <p className="mt-1 text-sm text-white/30">
          Your download history is saved per account
        </p>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────── */
/*  Page Component                                             */
/* ─────────────────────────────────────────────────────────── */

export default function DownloadsPage() {
  const { user } = useUser() as { user: any };
  const [downloads, setDownloads] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?._id) return;

    const fetchDownloads = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await videoApi.getUserDownloads(user._id);
        setDownloads(data);
      } catch (err) {
        console.error("Error fetching downloads:", err);
        setError("Failed to load downloads. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchDownloads();
  }, [user?._id]);

  const plan: PlanKey = (user?.plan as PlanKey) ?? "Free";
  const todayDownloads = downloads.filter((d) =>
    d.downloadedAt ? isToday(d.downloadedAt) : false
  );

  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-[#0a0a0f]">
      <Sidebar />
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
        {/* Page header */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-violet-600/20">
            <Download className="size-5 text-violet-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Downloads</h1>
            <p className="text-sm text-white/40">
              {downloads.length} total · {todayDownloads.length} today
            </p>
          </div>
        </div>

        {/* Quota card */}
        {user ? (
          <QuotaCard plan={plan} todayCount={todayDownloads.length} />
        ) : null}

        {/* Content */}
        <div className="mt-6">
          {!user ? (
            <SignInPrompt />
          ) : loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="size-8 animate-spin text-violet-400" />
            </div>
          ) : error ? (
            <div className="mt-6 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              <AlertTriangle className="size-4 shrink-0" />
              {error}
            </div>
          ) : downloads.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              {/* Section header */}
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-widest text-white/30">
                  Download History
                </h2>
                <span className="rounded-full bg-white/5 px-2.5 py-0.5 text-xs text-white/40">
                  {downloads.length} {downloads.length === 1 ? "video" : "videos"}
                </span>
              </div>
              <div className="grid gap-2">
                {downloads.map((dl) => (
                  <DownloadRow key={dl._id} download={dl} />
                ))}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
