import axiosInstance from "./axiosinstance";

export interface DbVideoResponse {
  _id: string;
  title: string;
  description: string;
  videoUrl: string;
  thumbnailUrl?: string;
  duration?: number;
  originalName?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  channelName?: string;
  uploaderEmail?: string;
  category?: string;
  views?: number;
  likes?: string[];
  dislikes?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CommentResponse {
  _id: string;
  videoId: string;
  userId: string;
  userName: string;
  userImage: string;
  text: string;
  createdAt: string;
  updatedAt: string;
}

export const videoApi = {
  /**
   * Fetches all uploaded videos from the database.
   */
  getVideos: async (): Promise<DbVideoResponse[]> => {
    const response = await axiosInstance.get<{ result: DbVideoResponse[] }>("/video");
    return response.data?.result || [];
  },

  /**
   * Fetches details of a single video by its ID.
   */
  getVideoById: async (id: string): Promise<DbVideoResponse> => {
    const response = await axiosInstance.get<{ result: DbVideoResponse }>(`/video/${id}`);
    return response.data?.result;
  },

  /**
   * Uploads a video file and its metadata to the server.
   */
  uploadVideo: async (formData: FormData): Promise<DbVideoResponse> => {
   const response = await axiosInstance.post<{ result: DbVideoResponse }>(
     "/video/upload",
     formData
   );
   return response.data?.result;
  },

  /**
   * Toggles a like on a video. If already liked, removes the like.
   * If previously disliked, removes the dislike and adds a like.
   */
  likeVideo: async (videoId: string, userId: string): Promise<DbVideoResponse> => {
    const response = await axiosInstance.patch<{ result: DbVideoResponse }>(
      `/video/like/${videoId}`,
      { userId }
    );
    return response.data?.result;
  },

  /**
   * Toggles a dislike on a video. If already disliked, removes the dislike.
   * If previously liked, removes the like and adds a dislike.
   */
  dislikeVideo: async (videoId: string, userId: string): Promise<DbVideoResponse> => {
    const response = await axiosInstance.patch<{ result: DbVideoResponse }>(
      `/video/dislike/${videoId}`,
      { userId }
    );
    return response.data?.result;
  },

  // ─── Comments ──────────────────────────────────────────────

  /**
   * Adds a comment to a video.
   */
  addComment: async (
    videoId: string,
    data: { userId: string; userName: string; userImage: string; text: string }
  ): Promise<CommentResponse> => {
    const response = await axiosInstance.post<{ result: CommentResponse }>(
      `/comment/${videoId}`,
      data
    );
    return response.data?.result;
  },

  /**
   * Fetches all comments for a video, sorted newest-first.
   */
  getComments: async (videoId: string): Promise<CommentResponse[]> => {
    const response = await axiosInstance.get<{ result: CommentResponse[] }>(
      `/comment/${videoId}`
    );
    return response.data?.result || [];
  },

  /**
   * Deletes a comment by ID. Body must include userId for ownership check.
   */
  deleteComment: async (commentId: string, userId: string): Promise<void> => {
    await axiosInstance.delete(`/comment/${commentId}`, {
      data: { userId },
    });
  },

  // ─── Watch Later ───────────────────────────────────────────

  /**
   * Toggles a video in the user's watch later list.
   */
  toggleWatchLater: async (videoId: string, userId: string): Promise<any> => {
    const response = await axiosInstance.patch(
      `/user/watch-later/${videoId}`,
      { userId }
    );
    return response.data?.result;
  },

  /**
   * Fetches the user's watch later videos list.
   */
  getWatchLater: async (userId: string): Promise<DbVideoResponse[]> => {
    const response = await axiosInstance.get<{ result: DbVideoResponse[] }>(
      `/user/watch-later/${userId}`
    );
    return response.data?.result || [];
  },

  // ─── Liked Videos ──────────────────────────────────────────

  /**
   * Fetches all videos that a user has liked.
   */
  getLikedVideos: async (userId: string): Promise<DbVideoResponse[]> => {
    const response = await axiosInstance.get<{ result: DbVideoResponse[] }>(
      `/user/liked-videos/${userId}`
    );
    return response.data?.result || [];
  },
  // ─── Downloads ─────────────────────────────────────────────

  /**
   * Requests permission to download a video. Backend checks the user's
   * plan-based daily limit before allowing it. Throws if the limit is
   * exceeded — check err.response.data.message for the reason.
   */
  requestDownload: async (
    videoId: string,
    userId: string
  ): Promise<{ downloadId: string; videoUrl: string; title: string; remainingToday: number | string }> => {
    const response = await axiosInstance.post<{
      result: { downloadId: string; videoUrl: string; title: string; remainingToday: number | string };
    }>(`/download/request/${videoId}`, { userId });
    return response.data?.result;
  },

  /**
   * Fetches a user's full download history, most recent first.
   */
  getUserDownloads: async (userId: string): Promise<any[]> => {
    const response = await axiosInstance.get<{ result: any[] }>(
      `/download/user/${userId}`
    );
    return response.data?.result || [];
  },
};

export default videoApi;

