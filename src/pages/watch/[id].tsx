import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  BookmarkPlus,
  BookmarkCheck,
  CheckCircle2,
  Download,
  MoreHorizontal,
  Send,
  Share2,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  XCircle,
} from "lucide-react";

import Sidebar from "@/components/sidebar";
import VideoPlayer from "@/components/video-player";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import EnhancedCommentItem from "@/components/enhanced-comment-item";
import axiosInstance from "@/lib/axiosinstance";
import videoApi, { type CommentResponse } from "@/lib/video-api";
import { useUser } from "@/lib/authcontext";
import {
  formatDateToNow,
  formatViews,
  type Video,
  videos,
} from "@/lib/youtube-data";

function triggerBrowserDownload(fileUrl: string, fileName: string) {
  // Use a direct link with the download attribute — the browser streams the
  // file natively from the server. The old fetch→blob approach was corrupt
  // because revokeObjectURL was called immediately after click(), before the
  // browser actually read the blob data.
  const link = document.createElement("a");
  link.href = fileUrl;
  link.download = fileName || "video.mp4";
  link.rel = "noopener noreferrer";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
function getVideoFromRoute(id: string | string[] | undefined) {
  const routeId = Array.isArray(id) ? id[0] : id;
  const numericIndex = Number(routeId) - 1;

  return (
    videos.find((video) => video.id === routeId) ??
    (Number.isInteger(numericIndex) ? videos[numericIndex] : undefined) ??
    videos[0]
  );
}

        function SuggestedVideo({ video }: { video: Video }) {
          const [timeAgo, setTimeAgo] = useState("");

          useEffect(() => {
            setTimeAgo(formatDateToNow(video.createdAt));
          }, [video.createdAt]);

          return (
            <Link
              href={`/watch/${video.id}`}
              className="group grid grid-cols-[160px_1fr] gap-2"
            >
              <div
                className={`relative flex aspect-video items-center justify-center overflow-hidden rounded-md bg-gradient-to-br ${video.gradient}`}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.7),transparent_18%),radial-gradient(circle_at_25%_70%,rgba(0,0,0,0.28),transparent_24%)]" />
                <span className="absolute bottom-1 right-1 rounded bg-black/85 px-1.5 py-0.5 text-[11px] font-semibold text-white">
                  {video.duration}
                </span>
              </div>
              <div className="min-w-0 py-0.5">
                <h3 className="line-clamp-2 text-sm font-semibold leading-5 group-hover:text-muted-foreground">
                  {video.title}
                </h3>
                <p className="mt-1 truncate text-xs text-muted-foreground">
          {video.channel}
        </p>
                <p className="text-xs text-muted-foreground">
          {formatViews(video.views)} views - {timeAgo}
        </p>
              </div>
            </Link>
          );
        }

        export default function WatchPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useUser() as { user: any };
  const [currentVideo, setCurrentVideo] = useState<any>(null);
  const [suggested, setSuggested] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Like/dislike state
  const [likesCount, setLikesCount] = useState(0);
  const [dislikesCount, setDislikesCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [hasDisliked, setHasDisliked] = useState(false);
  const [isDbVideo, setIsDbVideo] = useState(false);
  const [reactionLoading, setReactionLoading] = useState(false);

  // Watch later state
  const [isSaved, setIsSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  // Comments state
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [commentInputFocused, setCommentInputFocused] = useState(false);
  const [videoTimeAgo, setVideoTimeAgo] = useState("");
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [downloadToast, setDownloadToast] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [remainingDownloads, setRemainingDownloads] = useState<number | string | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback(
    (type: "success" | "error", message: string) => {
      setDownloadToast({ type, message });
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      toastTimerRef.current = setTimeout(() => setDownloadToast(null), 5000);
    },
    []
  );

  useEffect(() => () => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
  }, []);

  useEffect(() => {
    if (!id) return;

    const fetchVideoAndSuggested = async () => {
      setLoading(true);
      try {
        // First check if it's in the static videos list
        const staticVideo = videos.find((v) => v.id === id);
        if (staticVideo) {
          setCurrentVideo(staticVideo);
          setSuggested(videos.filter((v) => v.id !== id));
          setIsDbVideo(false);
          setLikesCount(890);
          setDislikesCount(20);
          setHasLiked(false);
          setHasDisliked(false);
          setIsSaved(false);
          setComments([]);
          setLoading(false);
          return;
        }

        // If not, fetch from DB
        const dbVideo = await videoApi.getVideoById(id as string);
        if (dbVideo) {
          const mapped = {
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
          };
          setCurrentVideo(mapped);
          setIsDbVideo(true);

          // Set like/dislike counts and user's reaction status
          const likes = dbVideo.likes || [];
          const dislikes = dbVideo.dislikes || [];
          setLikesCount(likes.length);
          setDislikesCount(dislikes.length);
          const userId = user?._id;
          setHasLiked(userId ? likes.includes(userId) : false);
          setHasDisliked(userId ? dislikes.includes(userId) : false);

          // Check watch later status
          if (userId) {
            try {
              const watchLaterList = await videoApi.getWatchLater(userId);
              setIsSaved(watchLaterList.some((v: any) => v._id === dbVideo._id));
            } catch {
              setIsSaved(false);
            }
          } else {
            setIsSaved(false);
          }

          // Fetch comments
          try {
            const videoComments = await videoApi.getComments(dbVideo._id);
            setComments(videoComments);
          } catch {
            setComments([]);
          }

          // Get other DB videos for suggestion
          const dbVideosList = await videoApi.getVideos();
          const otherDbVideosMapped = dbVideosList
            .filter((v: any) => v._id !== id)
            .map((v: any) => ({
              id: v._id,
              title: v.title,
              channel: v.channelName || "Unknown Channel",
              views: v.views || 0,
              createdAt: v.createdAt,
              duration: v.duration ? `${Math.floor(v.duration / 60)}:${String(Math.floor(v.duration % 60)).padStart(2, '0')}` : "0:00",
              category: v.category || "All",
              avatar: (v.channelName || "U").charAt(0).toUpperCase(),
              gradient: "from-blue-600 to-indigo-600",
              description: v.description || "",
              videoUrl: v.videoUrl,
            }));

          setSuggested([...otherDbVideosMapped, ...videos]);
        } else {
          // Fallback to first static video
          setCurrentVideo(videos[0]);
          setSuggested(videos.slice(1));
          setIsDbVideo(false);
          setLikesCount(890);
          setDislikesCount(20);
          setHasLiked(false);
          setHasDisliked(false);
          setIsSaved(false);
          setComments([]);
        }
      } catch (error) {
        console.error("Error loading video details:", error);
        const fallbackVideo = videos.find((v) => v.id === id) || videos[0];
        setCurrentVideo(fallbackVideo);
        setSuggested(videos.filter((v) => v.id !== fallbackVideo.id));
        setIsDbVideo(false);
        setLikesCount(890);
        setDislikesCount(20);
        setHasLiked(false);
        setHasDisliked(false);
        setIsSaved(false);
        setComments([]);
      } finally {
        setLoading(false);
      }
    };

 fetchVideoAndSuggested();
  }, [id, user?._id]);

  useEffect(() => {
    if (currentVideo?.createdAt) {
      setVideoTimeAgo(formatDateToNow(currentVideo.createdAt));
    }
  }, [currentVideo?.createdAt]);
  const handleLike = useCallback(async () => {
    if (!user?._id || !isDbVideo || reactionLoading) {
      if (!user) {
        alert("Please sign in to like videos.");
      }
      return;
    }

    setReactionLoading(true);
    try {
      const updatedVideo = await videoApi.likeVideo(currentVideo.id, user._id);
      const likes = updatedVideo.likes || [];
      const dislikes = updatedVideo.dislikes || [];
      setLikesCount(likes.length);
      setDislikesCount(dislikes.length);
      setHasLiked(likes.includes(user._id));
      setHasDisliked(dislikes.includes(user._id));
    } catch (error) {
      console.error("Error liking video:", error);
    } finally {
      setReactionLoading(false);
    }
  }, [user, isDbVideo, reactionLoading, currentVideo?.id]);

  const handleDislike = useCallback(async () => {
    if (!user?._id || !isDbVideo || reactionLoading) {
      if (!user) {
        alert("Please sign in to dislike videos.");
      }
      return;
    }

    setReactionLoading(true);
    try {
      const updatedVideo = await videoApi.dislikeVideo(currentVideo.id, user._id);
      const likes = updatedVideo.likes || [];
      const dislikes = updatedVideo.dislikes || [];
      setLikesCount(likes.length);
      setDislikesCount(dislikes.length);
      setHasLiked(likes.includes(user._id));
      setHasDisliked(dislikes.includes(user._id));
    } catch (error) {
      console.error("Error disliking video:", error);
    } finally {
      setReactionLoading(false);
    }
  }, [user, isDbVideo, reactionLoading, currentVideo?.id]);

  const handleDownload = useCallback(async () => {
    if (!user?._id || !isDbVideo || downloadLoading) {
      if (!user) {
        showToast("error", "Please sign in to download videos.");
      }
      return;
    }

    setDownloadLoading(true);
    try {
      const result = await videoApi.requestDownload(currentVideo.id, user._id);
      const fileUrl = result.videoUrl.startsWith("http")
        ? result.videoUrl
        : `${axiosInstance.defaults.baseURL}${result.videoUrl}`;

      await triggerBrowserDownload(fileUrl, `${result.title}.mp4`);
      setRemainingDownloads(result.remainingToday);
      showToast(
        "success",
        `Download started! Remaining today: ${
          result.remainingToday === "Unlimited" ? "∞" : result.remainingToday
        }`
      );
    } catch (error: any) {
      const message =
        error?.response?.data?.message || "Failed to download video.";
      showToast("error", message);
    } finally {
      setDownloadLoading(false);
    }
  }, [user, isDbVideo, downloadLoading, currentVideo?.id, showToast]);

  const handleToggleWatchLater = useCallback(async () => {
    if (!user?._id || !isDbVideo || saveLoading) {
      if (!user) {
        alert("Please sign in to save videos.");
      }
      return;
    }


    setSaveLoading(true);
    try {
      const updatedUser = await videoApi.toggleWatchLater(currentVideo.id, user._id);
      const watchLater: string[] = updatedUser.watchLater || [];
      setIsSaved(watchLater.includes(currentVideo.id));
    } catch (error) {
      console.error("Error toggling watch later:", error);
    } finally {
      setSaveLoading(false);
    }
  }, [user, isDbVideo, saveLoading, currentVideo?.id]);

  const handleAddComment = useCallback(async () => {
    if (!user?._id || !isDbVideo || commentLoading || !commentText.trim()) {
      if (!user) {
        alert("Please sign in to comment.");
      }
      return;
    }

    setCommentLoading(true);
    try {
      const newComment = await videoApi.addComment(currentVideo.id, {
        userId: user._id,
        userName: user.name || "",
        userImage: user.image || "",
        text: commentText.trim(),
      });
      setComments((prev) => [newComment, ...prev]);
      setCommentText("");
      setCommentInputFocused(false);
    } catch (error: any) {
      const reason = error?.response?.data?.reason;
      let errorMessage = "Failed to add comment";
      
      if (reason === "PROFANITY_DETECTED") {
        errorMessage = "Your comment contains prohibited language";
      } else if (reason === "EXCESSIVE_CAPS") {
        errorMessage = "Comment has too much UPPERCASE text";
      } else if (reason === "EXCESSIVE_SPECIAL_CHARS") {
        errorMessage = "Comment has too many special characters";
      } else if (reason === "CONTAINS_LINK") {
        errorMessage = "Comments with links are not allowed";
      } else if (reason === "TOO_SHORT") {
        errorMessage = "Comment is too short";
      } else if (reason === "TOO_LONG") {
        errorMessage = "Comment is too long (max 2000 characters)";
      }
      
      showToast("error", errorMessage);
      console.error("Error adding comment:", error);
    } finally {
      setCommentLoading(false);
    }
  }, [user, isDbVideo, commentLoading, commentText, currentVideo?.id, showToast]);

  const handleDeleteComment = useCallback(
    async (commentId: string) => {
      if (!user?._id) return;

      try {
        await videoApi.deleteComment(commentId, user._id);
        setComments((prev) => prev.filter((c) => c._id !== commentId));
      } catch (error) {
        console.error("Error deleting comment:", error);
      }
    },
    [user]
  );

  const handleRefreshComments = useCallback(async () => {
    if (!isDbVideo || !currentVideo?.id) return;
    try {
      const updatedComments = await videoApi.getComments(currentVideo.id);
      setComments(updatedComments);
    } catch (error) {
      console.error("Error refreshing comments:", error);
    }
  }, [isDbVideo, currentVideo?.id]);

  if (loading || !currentVideo) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] bg-background">
        <Sidebar />
        <main className="flex flex-1 items-center justify-center">
          <p className="text-lg font-medium text-muted-foreground animate-pulse">Loading video details...</p>
        </main>
      </div>
    );
  }

  // Choose the source URL
  const videoSrc = currentVideo.videoUrl
    ? (currentVideo.videoUrl.startsWith("http")
      ? currentVideo.videoUrl
      : `${axiosInstance.defaults.baseURL}${currentVideo.videoUrl}`)
    : "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
  return (
    <div className="flex min-h-[calc(100vh-4rem)] bg-background">
      <Sidebar />

      {/* ─── Download Toast ─── */}
      {downloadToast && (
        <div
          className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 flex items-center gap-3 rounded-xl px-5 py-3.5 shadow-2xl text-sm font-medium backdrop-blur-sm border transition-all duration-300 ${
            downloadToast.type === "success"
              ? "bg-emerald-950/90 border-emerald-500/30 text-emerald-300"
              : "bg-red-950/90 border-red-500/30 text-red-300"
          }`}
        >
          {downloadToast.type === "success" ? (
            <CheckCircle2 className="size-4 shrink-0 text-emerald-400" />
          ) : (
            <XCircle className="size-4 shrink-0 text-red-400" />
          )}
          <span>{downloadToast.message}</span>
          <button
            onClick={() => setDownloadToast(null)}
            className="ml-2 text-white/30 hover:text-white/70 transition-colors"
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      )}

      <main className="grid min-w-0 flex-1 gap-5 px-4 py-4 lg:grid-cols-[minmax(0,1fr)_320px] xl:grid-cols-[minmax(0,1fr)_360px] 2xl:grid-cols-[minmax(0,840px)_390px]">
        <section className="min-w-0">
          <VideoPlayer
            src={videoSrc}
            title={currentVideo.title}
            nextVideo={
              suggested.length > 0
                ? { id: suggested[0].id, title: suggested[0].title }
                : null
            }
            onNext={() => {
              if (suggested.length > 0) {
                router.push(`/watch/${suggested[0].id}`);
              }
            }}
          />

          <h1 className="mt-4 text-xl font-bold leading-7">
            {currentVideo.title}
          </h1>

          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <Avatar className="size-10">
                <AvatarFallback>{currentVideo.avatar}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {currentVideo.channel}
                </p>
                <p className="text-xs text-muted-foreground">
                  1.2M subscribers
                </p>
              </div>
              <Button className="ml-2 rounded-full bg-black px-4 text-white hover:bg-black/80">
                Subscribe
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex overflow-hidden rounded-full bg-secondary">
                <Button
                  id="like-button"
                  variant="secondary"
                  className={`rounded-none px-3 transition-colors ${hasLiked ? "bg-blue-600/20 text-blue-500 hover:bg-blue-600/30" : ""}`}
                  onClick={handleLike}
                  disabled={reactionLoading}
                  title={hasLiked ? "Remove like" : "Like this video"}
                >
                  <ThumbsUp className={`size-4 ${hasLiked ? "fill-current" : ""}`} />
                  {likesCount}
                </Button>
                <div className="my-1 w-px bg-border" />
                <Button
                  id="dislike-button"
                  variant="secondary"
                  className={`rounded-none px-3 transition-colors ${hasDisliked ? "bg-red-600/20 text-red-500 hover:bg-red-600/30" : ""}`}
                  onClick={handleDislike}
                  disabled={reactionLoading}
                  title={hasDisliked ? "Remove dislike" : "Dislike this video"}
                >
                  <ThumbsDown className={`size-4 ${hasDisliked ? "fill-current" : ""}`} />
                  {dislikesCount}
                </Button>
              </div>
              <Button variant="secondary" className="rounded-full px-3">
                <Share2 className="size-4" />
                Share
              </Button>
              <Button
                variant="secondary"
                className="flex flex-col items-center rounded-full px-3 h-auto py-1.5"
                onClick={handleDownload}
                disabled={downloadLoading}
              >
                <span className="flex items-center gap-1.5">
                  <Download className="size-4" />
                  {downloadLoading ? "Downloading..." : "Download"}
                </span>
                {remainingDownloads !== null && (
                  <span className="text-[10px] leading-none text-muted-foreground mt-0.5">
                    {remainingDownloads === "Unlimited" || remainingDownloads === "∞"
                      ? "∞ remaining"
                      : `${remainingDownloads} left today`}
                  </span>
                )}
              </Button>
              <Button
                id="save-button"
                variant="secondary"
                className={`rounded-full px-3 transition-colors ${isSaved ? "bg-emerald-600/20 text-emerald-500 hover:bg-emerald-600/30" : ""}`}
                onClick={handleToggleWatchLater}
                disabled={saveLoading}
                title={isSaved ? "Remove from Watch Later" : "Save to Watch Later"}
              >
                {isSaved ? (
                  <BookmarkCheck className="size-4 fill-current" />
                ) : (
                  <BookmarkPlus className="size-4" />
                )}
                {isSaved ? "Saved" : "Save"}
              </Button>
              <Button variant="secondary" size="icon" className="rounded-full">
                <MoreHorizontal className="size-4" />
              </Button>
            </div>
          </div>

          <div className="mt-4 rounded-lg bg-secondary p-4 text-sm leading-6">
            <div className="mb-2 flex flex-wrap gap-x-4 font-semibold">
  <span>{formatViews(currentVideo.views)} views</span>
  <span>{videoTimeAgo}</span>
</div>
            <p>{currentVideo.description}</p>
            <button className="mt-2 text-sm font-semibold">Show more</button>
          </div>

          {/* Comments Section */}
          <section className="mt-5">
            <h2 className="text-xl font-bold">
              {comments.length} {comments.length === 1 ? "Comment" : "Comments"}
            </h2>

            {/* Add comment input */}
            {isDbVideo && (
              <div className="mt-4 flex items-start gap-3">
                <Avatar className="size-9 shrink-0">
                  {user?.image ? (
                    <AvatarImage src={user.image} alt={user.name || "You"} />
                  ) : null}
                  <AvatarFallback>
                    {(user?.name || "Y").charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder={user ? "Add a comment..." : "Sign in to comment"}
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onFocus={() => setCommentInputFocused(true)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && commentText.trim()) {
                        handleAddComment();
                      }
                    }}
                    disabled={!user}
                    className="h-9 w-full border-b bg-transparent text-sm outline-none transition-colors focus:border-b-2 focus:border-foreground disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  {commentInputFocused && user && (
                    <div className="mt-2 flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-full text-xs"
                        onClick={() => {
                          setCommentText("");
                          setCommentInputFocused(false);
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        className="rounded-full bg-blue-600 px-4 text-xs text-white hover:bg-blue-700"
                        disabled={!commentText.trim() || commentLoading}
                        onClick={handleAddComment}
                      >
                        <Send className="mr-1 size-3" />
                        {commentLoading ? "Posting..." : "Comment"}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Comments list */}
            {comments.length > 0 ? (
              <div className="mt-2 divide-y">
                {comments.map((comment) => (
                  <EnhancedCommentItem
                    key={comment._id}
                    comment={comment}
                    currentUserId={user?._id}
                    onDelete={handleDeleteComment}
                    onLike={(commentId, liked) => {
                      // Refresh comments to get updated like count
                      handleRefreshComments();
                    }}
                    onDislike={(commentId, disliked) => {
                      // Refresh comments to get updated dislike count
                      handleRefreshComments();
                    }}
                    onReport={(commentId) => {
                      // Refresh comments to get updated report status
                      handleRefreshComments();
                    }}
                  />
                ))}
              </div>
            ) : isDbVideo ? (
              <p className="mt-4 text-sm text-muted-foreground">
                No comments yet. Be the first to comment!
              </p>
            ) : (
              <div className="mt-4 flex items-center gap-3">
                <Avatar className="size-9">
                  <AvatarFallback>YT</AvatarFallback>
                </Avatar>
                <div className="h-9 flex-1 border-b text-sm text-muted-foreground">
                  Add a comment...
                </div>
              </div>
            )}
          </section>
        </section>

        <aside className="grid h-fit gap-2">
          {suggested.slice(0, 5).map((video) => (
            <SuggestedVideo key={video.id} video={video} />
          ))}
        </aside>
      </main>
    </div>
  );
}

