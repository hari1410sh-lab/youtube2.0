import { useState } from "react";
import {
  ThumbsUp,
  ThumbsDown,
  Flag,
  Globe,
  Trash2,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { formatDateToNow } from "@/lib/youtube-data";
import videoApi, { type CommentResponse } from "@/lib/video-api";
import TranslateModal from "./comment-translate-modal";
import ReportModal from "./comment-report-modal";

interface EnhancedCommentItemProps {
  comment: CommentResponse;
  currentUserId?: string;
  onDelete: (id: string) => void;
  onLike?: (commentId: string, liked: boolean) => void;
  onDislike?: (commentId: string, disliked: boolean) => void;
  onReport?: (commentId: string) => void;
}

export default function EnhancedCommentItem({
  comment,
  currentUserId,
  onDelete,
  onLike,
  onDislike,
  onReport,
}: EnhancedCommentItemProps) {
  const isOwn = currentUserId && comment.userId === currentUserId;
  const [showTranslateModal, setShowTranslateModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  
  const [likeLoading, setLikeLoading] = useState(false);
  const [dislikeLoading, setDislikeLoading] = useState(false);
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [translateError, setTranslateError] = useState<string | null>(null);
  
  const userHasLiked = currentUserId && comment.likes?.includes(currentUserId);
  const userHasDisliked = currentUserId && comment.dislikes?.includes(currentUserId);
  const likesCount = comment.likesCount ?? comment.likes?.length ?? 0;
  const dislikesCount = comment.dislikesCount ?? comment.dislikes?.length ?? 0;
  
  const timeAgo = formatDateToNow(comment.createdAt);
  
  // Language code to full name mapping
  const languageNames: Record<string, string> = {
    en: "English",
    es: "Spanish",
    fr: "French",
    de: "German",
    it: "Italian",
    pt: "Portuguese",
    ru: "Russian",
    ja: "Japanese",
    ko: "Korean",
    zh: "Chinese",
    hi: "Hindi",
    ar: "Arabic",
  };

  const handleLike = async () => {
    if (!currentUserId) return;
    setLikeLoading(true);
    try {
      await videoApi.likeComment(comment._id, currentUserId);
      onLike?.(comment._id, !userHasLiked);
    } catch (error) {
      console.error("Error liking comment:", error);
    } finally {
      setLikeLoading(false);
    }
  };

  const handleDislike = async () => {
    if (!currentUserId) return;
    setDislikeLoading(true);
    try {
      await videoApi.dislikeComment(comment._id, currentUserId);
      onDislike?.(comment._id, !userHasDisliked);
    } catch (error) {
      console.error("Error disliking comment:", error);
    } finally {
      setDislikeLoading(false);
    }
  };

  const handleTranslate = async (targetLang: string) => {
    try {
      setTranslateError(null);
      const result = await videoApi.translateComment(comment._id, targetLang);
      setTranslatedText(result.translated);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Translation failed";
      setTranslateError(errorMsg);
      console.error("Translation error:", error);
    }
  };

  const handleReportSubmit = async (reason: string, details: string) => {
    try {
      if (currentUserId) {
        await videoApi.reportComment(comment._id, currentUserId, reason, details);
        onReport?.(comment._id);
        setShowReportModal(false);
      }
    } catch (error) {
      console.error("Error reporting comment:", error);
    }
  };

  return (
    <>
      <div className="group flex gap-3 py-4">
        <Avatar className="size-9 shrink-0">
          {comment.userImage ? (
            <AvatarImage src={comment.userImage} alt={comment.userName} />
          ) : null}
          <AvatarFallback>
            {(comment.userName || "U").charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-semibold">
              {comment.userName || "Anonymous"}
            </span>
            <span className="text-xs text-muted-foreground">{timeAgo}</span>
            
            {/* Language badge */}
            {comment.language && comment.language !== "en" && (
              <span className="inline-block rounded-full bg-secondary px-2 py-0.5 text-xs font-medium">
                {languageNames[comment.language] || comment.language.toUpperCase()}
              </span>
            )}
            
            {/* Reported badge */}
            {comment.isReported && (
              <span className="inline-block rounded-full bg-destructive/20 px-2 py-0.5 text-xs font-medium text-destructive">
                Reported
              </span>
            )}
          </div>
          
          <p className="mt-1 text-sm leading-5">{comment.text}</p>
          
          {/* Translated text (if available) */}
          {translatedText && (
            <div className="mt-2 rounded bg-secondary/50 p-2 text-sm leading-5 text-secondary-foreground">
              <p className="text-xs font-semibold opacity-70">Translation:</p>
              <p>{translatedText}</p>
            </div>
          )}
          
          {/* Translation error */}
          {translateError && (
            <div className="mt-2 text-xs text-destructive">
              Translation failed: {translateError}
            </div>
          )}
          
          {/* Engagement buttons */}
          <div className="mt-2 flex items-center gap-4">
            {/* Like button */}
            <Button
              variant="ghost"
              size="sm"
              className="h-6 gap-1 px-2 text-xs opacity-0 transition-opacity group-hover:opacity-100"
              onClick={handleLike}
              disabled={!currentUserId || likeLoading || isOwn}
              title={isOwn ? "You can't like your own comment" : "Like"}
            >
              <ThumbsUp
                className={`size-3 ${userHasLiked ? "fill-current text-blue-500" : ""}`}
              />
              {likesCount > 0 && <span>{likesCount}</span>}
            </Button>
            
            {/* Dislike button */}
            <Button
              variant="ghost"
              size="sm"
              className="h-6 gap-1 px-2 text-xs opacity-0 transition-opacity group-hover:opacity-100"
              onClick={handleDislike}
              disabled={!currentUserId || dislikeLoading || isOwn}
              title={isOwn ? "You can't dislike your own comment" : "Dislike"}
            >
              <ThumbsDown
                className={`size-3 ${userHasDisliked ? "fill-current text-red-500" : ""}`}
              />
              {dislikesCount > 0 && <span>{dislikesCount}</span>}
            </Button>
            
            {/* Translate button */}
            <Button
              variant="ghost"
              size="sm"
              className="h-6 gap-1 px-2 text-xs opacity-0 transition-opacity group-hover:opacity-100"
              onClick={() => setShowTranslateModal(true)}
              title="Translate comment"
              disabled={!currentUserId}
            >
              <Globe className="size-3" />
              <span>Translate</span>
            </Button>
            
            {/* Report button */}
            <Button
              variant="ghost"
              size="sm"
              className="h-6 gap-1 px-2 text-xs opacity-0 transition-opacity group-hover:opacity-100"
              onClick={() => setShowReportModal(true)}
              title="Report comment"
              disabled={!currentUserId || isOwn}
            >
              <Flag className="size-3 text-orange-500" />
              <span>Report</span>
            </Button>
          </div>
        </div>
        
        {/* Delete button (owner only) */}
        {isOwn && (
          <Button
            variant="ghost"
            size="icon"
            className="size-8 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
            onClick={() => onDelete(comment._id)}
            title="Delete comment"
          >
            <Trash2 className="size-4 text-destructive" />
          </Button>
        )}
      </div>
      
      {/* Translate Modal */}
      {showTranslateModal && (
        <TranslateModal
          commentId={comment._id}
          onTranslate={handleTranslate}
          onClose={() => {
            setShowTranslateModal(false);
            setTranslatedText(null);
            setTranslateError(null);
          }}
        />
      )}
      
      {/* Report Modal */}
      {showReportModal && (
        <ReportModal
          onSubmit={handleReportSubmit}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </>
  );
}
