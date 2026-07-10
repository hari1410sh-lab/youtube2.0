import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { FileVideo, Pencil, Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import axiosInstance from "@/lib/axiosinstance";
import { useUser } from "@/lib/authcontext";
import videoApi, { DbVideoResponse } from "@/lib/video-api";

type UploadedVideo = {
  id: string;
  title: string;
  description: string;
  fileName: string;
  fileSize: number;
  previewUrl: string;
};

type SavedVideoResponse = {
  _id: string;
  title: string;
  description: string;
  originalName?: string;
  fileSize?: number;
  videoUrl?: string;
};

const tabs = ["Home", "Videos", "Shorts", "Playlists", "Community", "About"];

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function ChannelContent() {
  const { user } = useUser() as {
    user: { email?: string | null; name?: string | null; image?: string | null } | null;
  };

  const [channelName, setChannelName] = useState("Tech Channel");
  const [channelHandle, setChannelHandle] = useState("@techchannel");
  const [channelDescription, setChannelDescription] = useState(
    "Welcome to our tech channel! We cover the latest in technology, reviews, and tutorials.",
  );
  const [draftName, setDraftName] = useState(channelName);
  const [draftHandle, setDraftHandle] = useState(channelHandle);
  const [draftDescription, setDraftDescription] = useState(channelDescription);
  const [isChannelDialogOpen, setIsChannelDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedPreviewUrl, setSelectedPreviewUrl] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uploadedVideos, setUploadedVideos] = useState<UploadedVideo[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    if (user?.name) {
      setChannelName(user.name);
      setChannelHandle(`@${user.name.toLowerCase().replace(/\s+/g, "")}`);
    }
  }, [user]);

  useEffect(() => {
    const fetchChannelVideos = async () => {
      try {
        const allVideos = await videoApi.getVideos();
        const filtered = allVideos
          .filter(
            (v: any) =>
              v.channelName === channelName ||
              (user?.email && v.uploaderEmail === user.email) ||
              (!v.channelName && channelName === "Tech Channel")
          )
          .map((v: any) => ({
            id: v._id,
            title: v.title,
            description: v.description,
            fileName: v.originalName || "video.mp4",
            fileSize: v.fileSize || 0,
            previewUrl: `${axiosInstance.defaults.baseURL}${v.videoUrl}`,
          }));
        setUploadedVideos(filtered);
      } catch (error) {
        console.error("Error fetching channel videos:", error);
      }
    };

    fetchChannelVideos();
  }, [channelName, user?.email]);

  const canUpload = useMemo(
    () => Boolean(selectedFile && title.trim() && description.trim()),
    [description, selectedFile, title],
  );

  function openChannelDialog(open: boolean) {
    setIsChannelDialogOpen(open);

    if (open) {
      setDraftName(channelName);
      setDraftHandle(channelHandle);
      setDraftDescription(channelDescription);
    }
  }

  function saveChannelDetails(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setChannelName(draftName.trim() || "Untitled Channel");
    setChannelHandle(
      draftHandle.trim().startsWith("@")
        ? draftHandle.trim()
        : `@${draftHandle.trim() || "channel"}`,
    );
    setChannelDescription(draftDescription.trim());
    setIsChannelDialogOpen(false);
  }

  function clearSelection() {
    if (selectedPreviewUrl) URL.revokeObjectURL(selectedPreviewUrl);
    setSelectedFile(null);
    setSelectedPreviewUrl("");
    setTitle("");
    setDescription("");
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (selectedPreviewUrl) URL.revokeObjectURL(selectedPreviewUrl);

    setSelectedFile(file);
    setSelectedPreviewUrl(URL.createObjectURL(file));
    setTitle(file.name.replace(/\.[^/.]+$/, ""));
    setDescription("");
  }

  async function handleUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedFile || !selectedPreviewUrl || !canUpload) return;

    const formData = new FormData();
    formData.append("video", selectedFile);
    formData.append("title", title.trim());
    formData.append("description", description.trim());
    formData.append("channelName", channelName);
    if (user?.email) {
      formData.append("uploaderEmail", user.email);
    }

    setIsUploading(true);
    setUploadError("");

    try {
      const savedVideo = await videoApi.uploadVideo(formData);

      setUploadedVideos((currentVideos) => [
        {
          id: savedVideo._id,
          title: savedVideo.title,
          description: savedVideo.description,
          fileName: savedVideo.originalName || selectedFile.name,
          fileSize: savedVideo.fileSize || selectedFile.size,
          previewUrl: selectedPreviewUrl,
        },
        ...currentVideos,
      ]);

      setSelectedFile(null);
      setSelectedPreviewUrl("");
      setTitle("");
      setDescription("");
    } catch (error) {
      console.error(error);
      setUploadError("Video upload failed. Make sure your backend server is running.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <section className="min-w-0">
      <div className="h-52 bg-gradient-to-r from-sky-500 via-indigo-500 to-fuchsia-500" />

      <div className="px-4 sm:px-8">
        <div className="flex gap-5 py-5 max-sm:flex-col sm:items-center">
          <div className="flex size-24 shrink-0 items-center justify-center rounded-full bg-secondary text-3xl font-medium">
            T
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-3xl font-bold leading-tight">{channelName}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{channelHandle}</p>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              {channelDescription || "No channel description added yet."}
            </p>
          </div>

          <Dialog open={isChannelDialogOpen} onOpenChange={openChannelDialog}>
            <DialogTrigger asChild>
              <Button type="button" variant="secondary" className="gap-2">
                <Pencil className="size-4" />
                Customize channel
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Channel details</DialogTitle>
                <DialogDescription>
                  Edit the public name, handle, and description for your channel.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={saveChannelDetails} className="grid gap-4">
                <label className="grid gap-2 text-sm font-medium">
                  Channel name
                  <Input
                    value={draftName}
                    onChange={(event) => setDraftName(event.target.value)}
                    placeholder="Channel name"
                    required
                  />
                </label>

                <label className="grid gap-2 text-sm font-medium">
                  Handle
                  <Input
                    value={draftHandle}
                    onChange={(event) => setDraftHandle(event.target.value)}
                    placeholder="@channel"
                    required
                  />
                </label>

                <label className="grid gap-2 text-sm font-medium">
                  Description
                  <textarea
                    value={draftDescription}
                    onChange={(event) => setDraftDescription(event.target.value)}
                    placeholder="Describe your channel"
                    rows={5}
                    className="min-h-28 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  />
                </label>

                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="secondary">
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button type="submit">Save</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <nav className="flex gap-7 overflow-x-auto border-b text-sm text-muted-foreground">
          {tabs.map((tab) => (
            <button
              key={tab}
              type="button"
              className={`h-11 shrink-0 border-b-2 px-0 ${
                tab === "Videos"
                  ? "border-foreground font-medium text-foreground"
                  : "border-transparent"
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>

        <div className="grid gap-6 py-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <form
            onSubmit={handleUpload}
            className="rounded-md border bg-background p-5"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Upload a video</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Choose a video file, add a title, and write a description.
                </p>
              </div>
              <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">
                <Upload className="size-4" />
                Select file
                <input
                  type="file"
                  accept="video/*"
                  className="sr-only"
                  onChange={handleFileChange}
                />
              </label>
            </div>

            {selectedFile ? (
              <div className="mt-5 grid gap-4">
                <div className="flex items-center gap-3 rounded-md border p-3">
                  <div className="flex size-11 items-center justify-center rounded-md bg-blue-100 text-blue-700">
                    <FileVideo className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {selectedFile.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label="Remove selected file"
                    onClick={clearSelection}
                  >
                    <X className="size-4" />
                  </Button>
                </div>

                <video
                  controls
                  src={selectedPreviewUrl}
                  className="aspect-video w-full rounded-md bg-black"
                />

                <label className="grid gap-2 text-sm font-medium">
                  Title
                  <Input
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="Add a title"
                    required
                  />
                </label>

                <label className="grid gap-2 text-sm font-medium">
                  Description
                  <textarea
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Tell viewers about your video"
                    required
                    rows={5}
                    className="min-h-28 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  />
                </label>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="secondary" onClick={clearSelection}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={!canUpload || isUploading}>
                    {isUploading ? "Uploading..." : "Upload"}
                  </Button>
                </div>

                {uploadError ? (
                  <p className="text-sm font-medium text-red-600">{uploadError}</p>
                ) : null}
              </div>
            ) : (
              <div className="mt-5 grid place-items-center rounded-md border border-dashed py-12 text-center">
                <FileVideo className="size-10 text-muted-foreground" />
                <p className="mt-3 text-sm font-medium">No video selected</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Use Select file to choose an MP4, WebM, or another video file.
                </p>
              </div>
            )}
          </form>

          <aside className="h-fit rounded-md border bg-secondary/40 p-5">
            <h2 className="text-base font-semibold">Channel details</h2>
            <div className="mt-4 grid gap-3 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Subscribers</span>
                <span className="font-medium">1.2M</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Uploaded videos</span>
                <span className="font-medium">{uploadedVideos.length}</span>
              </div>
            </div>
          </aside>
        </div>

        <section className="pb-8">
          <h2 className="text-lg font-semibold">Uploaded videos</h2>
          {uploadedVideos.length > 0 ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {uploadedVideos.map((video) => (
                <article key={video.id} className="grid gap-3">
                  <video
                    controls
                    src={video.previewUrl}
                    className="aspect-video w-full rounded-md bg-black"
                  />
                  <div className="min-w-0">
                    <h3 className="line-clamp-2 text-sm font-semibold">
                      {video.title}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                      {video.description}
                    </p>
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {video.fileName} - {formatFileSize(video.fileSize)}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-muted-foreground">
              Your uploaded videos will appear here.
            </p>
          )}
        </section>
      </div>
    </section>
  );
}

export default ChannelContent;
