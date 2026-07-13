import { useRef, useState, useEffect, useCallback } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Volume1,
  Maximize,
  Minimize,
  SkipForward,
  SkipBack,
  Loader2,
  Settings,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface VideoPlayerProps {
  src: string;
  title: string;
  nextVideo?: { id: string; title: string } | null;
  onNext?: () => void;
}

type PlaybackSpeed = 0.25 | 0.5 | 0.75 | 1 | 1.25 | 1.5 | 1.75 | 2;

const PLAYBACK_SPEEDS: PlaybackSpeed[] = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Formats seconds → "m:ss" or "h:mm:ss" */
function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return "0:00";
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  if (hrs > 0) {
    return `${hrs}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function VideoPlayer({ src, title, nextVideo, onNext }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const seekBarRef = useRef<HTMLInputElement>(null);

  /* ---- Core playback state ---- */
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(true); // start muted so autoplay works
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<PlaybackSpeed>(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  /* ---- Skip indicator state (for double-tap ripple) ---- */
  const [skipIndicator, setSkipIndicator] = useState<{
    side: "left" | "right";
    key: number;
  } | null>(null);

  /* ================================================================ */
  /*  PLAYBACK CONTROLS                                                */
  /* ================================================================ */

  /** BUG FIX #1 & #3: togglePlay reads video.paused directly, no stale deps */
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  }, []);

  /**
   * BUG FIX #1 (critical): handleTimeUpdate ONLY updates currentTime state.
   * The original code erroneously toggled play/pause here.
   */
  const handleTimeUpdate = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    setCurrentTime(video.currentTime);

    // Update buffered range
    if (video.buffered.length > 0) {
      setBuffered(video.buffered.end(video.buffered.length - 1));
    }
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setIsLoading(false);
    }
  }, []);

  const handleSeek = useCallback((value: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value;
      setCurrentTime(value);
    }
  }, []);

  const skip = useCallback(
    (seconds: number) => {
      const video = videoRef.current;
      if (!video) return;
      const newTime = Math.min(Math.max(video.currentTime + seconds, 0), duration);
      video.currentTime = newTime;
      setCurrentTime(newTime);
    },
    [duration]
  );

  /* ================================================================ */
  /*  VOLUME                                                           */
  /* ================================================================ */

  const handleVolumeChange = useCallback((value: number) => {
    if (videoRef.current) {
      videoRef.current.volume = value;
      videoRef.current.muted = value === 0;
      setVolume(value);
      setIsMuted(value === 0);
    }
  }, []);

  /** BUG FIX #4: toggleMute reads directly from ref, no stale-closure dep */
  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      const newMuted = !videoRef.current.muted;
      videoRef.current.muted = newMuted;
      setIsMuted(newMuted);
    }
  }, []);

  /* ================================================================ */
  /*  FULLSCREEN                                                       */
  /* ================================================================ */

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }, []);

  useEffect(() => {
    const handleChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handleChange);
    return () => document.removeEventListener("fullscreenchange", handleChange);
  }, []);

  /* ================================================================ */
  /*  PLAYBACK SPEED                                                   */
  /* ================================================================ */

  const changeSpeed = useCallback((speed: PlaybackSpeed) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
      setShowSpeedMenu(false);
    }
  }, []);

  /* ================================================================ */
  /*  MOBILE DOUBLE-TAP GESTURE                                        */
  /* ================================================================ */

  const lastTapRef = useRef<{ time: number; side: "left" | "right" | null }>({
    time: 0,
    side: null,
  });

  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLDivElement>) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;

      const touchX = e.touches[0].clientX - rect.left;
      const side: "left" | "right" = touchX < rect.width / 2 ? "left" : "right";
      const now = Date.now();

      const isDoubleTap =
        now - lastTapRef.current.time < 300 && lastTapRef.current.side === side;

      if (isDoubleTap) {
        skip(side === "right" ? 10 : -10);
        // Show ripple feedback
        setSkipIndicator({ side, key: now });
        lastTapRef.current = { time: 0, side: null };
      } else {
        lastTapRef.current = { time: now, side };
      }
    },
    [skip]
  );

  /* ================================================================ */
  /*  CONTROLS AUTO-HIDE                                               */
  /* ================================================================ */

  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetControlsTimeout = useCallback(() => {
    setShowControls(true);
    setShowSpeedMenu(false); // close speed menu on any mouse move
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    if (isPlaying) {
      hideTimeoutRef.current = setTimeout(() => setShowControls(false), 3000);
    }
  }, [isPlaying]);

  /* ================================================================ */
  /*  KEYBOARD SHORTCUTS                                               */
  /* ================================================================ */

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      // Don't hijack if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      )
        return;

      switch (e.code) {
        case "Space":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowRight":
          e.preventDefault();
          skip(10);
          break;
        case "ArrowLeft":
          e.preventDefault();
          skip(-10);
          break;
        case "ArrowUp":
          e.preventDefault();
          handleVolumeChange(Math.min((videoRef.current?.volume ?? 1) + 0.1, 1));
          break;
        case "ArrowDown":
          e.preventDefault();
          handleVolumeChange(Math.max((videoRef.current?.volume ?? 1) - 0.1, 0));
          break;
        case "KeyM":
          toggleMute();
          break;
        case "KeyF":
          toggleFullscreen();
          break;
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [togglePlay, skip, handleVolumeChange, toggleMute, toggleFullscreen]);

  /* ================================================================ */
  /*  SYNC isPlaying with video events                                 */
  /* ================================================================ */

  const handlePlay = useCallback(() => {
    setIsPlaying(true);
    // BUG FIX #6: Unmute on first user-initiated play
    if (videoRef.current && videoRef.current.muted) {
      videoRef.current.muted = false;
      setIsMuted(false);
    }
  }, []);
  const handlePause = useCallback(() => setIsPlaying(false), []);

  /* ---- Clear skip indicator after animation ---- */
  useEffect(() => {
    if (!skipIndicator) return;
    const timeout = setTimeout(() => setSkipIndicator(null), 700);
    return () => clearTimeout(timeout);
  }, [skipIndicator]);

  /* ================================================================ */
  /*  DERIVED VALUES                                                   */
  /* ================================================================ */

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;
  const bufferedPercent = duration ? (buffered / duration) * 100 : 0;

  const VolumeIcon = isMuted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  /* ================================================================ */
  /*  RENDER                                                           */
  /* ================================================================ */

  return (
    <div
      ref={containerRef}
      className="vp-container group relative aspect-video w-full overflow-hidden rounded-xl bg-black"
      onMouseMove={resetControlsTimeout}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      onTouchStart={handleTouchStart}
    >
      {/* ---- Video element ---- */}
      {/* BUG FIX #6: muted allows autoplay in all browsers */}
      <video
        ref={videoRef}
        src={src}
        autoPlay
        muted
        preload="metadata"
        aria-label={`${title} video player`}
        className="h-full w-full cursor-pointer"
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onWaiting={() => setIsLoading(true)}
        onCanPlay={() => setIsLoading(false)}
        onPlay={handlePlay}
        onPause={handlePause}
        onEnded={onNext}
      />

      {/* ---- Loading spinner ---- */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none">
          <Loader2 className="size-12 animate-spin text-white/90" />
        </div>
      )}

      {/* ---- Big center play button (shown when paused) ---- */}
      {!isPlaying && !isLoading && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity hover:bg-black/30"
          aria-label="Play video"
        >
          <div className="flex size-16 items-center justify-center rounded-full bg-black/60 backdrop-blur-sm transition-transform hover:scale-110">
            <Play className="size-7 text-white ml-1" fill="white" />
          </div>
        </button>
      )}

      {/* ---- Double-tap skip indicator ---- */}
      {skipIndicator && (
        <div
          key={skipIndicator.key}
          className={`vp-skip-indicator absolute top-1/2 -translate-y-1/2 ${
            skipIndicator.side === "right" ? "right-[15%]" : "left-[15%]"
          }`}
        >
          <div className="flex flex-col items-center gap-1 rounded-full bg-black/50 px-5 py-3 backdrop-blur-sm">
            {skipIndicator.side === "right" ? (
              <SkipForward className="size-6 text-white" />
            ) : (
              <SkipBack className="size-6 text-white" />
            )}
            <span className="text-xs font-bold text-white">
              {skipIndicator.side === "right" ? "+10s" : "-10s"}
            </span>
          </div>
        </div>
      )}

      {/* ---- Controls overlay ---- */}
      {/* BUG FIX #7: pointer-events-none when hidden */}
      <div
        className={`absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent px-3 pb-3 pt-12 transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* ---- Seek bar ---- */}
        <div className="vp-seek-container group/seek relative mb-2 flex items-center">
          {/* Buffered background */}
          <div
            className="absolute left-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-white/30 transition-all group-hover/seek:h-[5px]"
            style={{ width: `${bufferedPercent}%` }}
          />
          {/* Played progress */}
          <div
            className="absolute left-0 top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-red-600 transition-all group-hover/seek:h-[5px]"
            style={{ width: `${progressPercent}%` }}
          />
          <input
            ref={seekBarRef}
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={currentTime}
            onChange={(e) => handleSeek(Number(e.target.value))}
            className="vp-seek-input relative z-10 h-[3px] w-full cursor-pointer appearance-none bg-transparent transition-all group-hover/seek:h-[5px]"
            aria-label="Seek"
          />
        </div>

        {/* ---- Bottom row ---- */}
        <div className="flex items-center justify-between text-white">
          {/* Left controls */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="vp-btn flex size-9 items-center justify-center rounded-full transition-all hover:bg-white/15 active:scale-90"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="size-5" fill="white" />
              ) : (
                <Play className="size-5 ml-0.5" fill="white" />
              )}
            </button>

            {/* Skip back */}
            <button
              onClick={() => skip(-10)}
              className="vp-btn flex size-9 items-center justify-center rounded-full transition-all hover:bg-white/15 active:scale-90"
              aria-label="Rewind 10 seconds"
              title="Rewind 10s (←)"
            >
              <SkipBack className="size-[18px]" />
            </button>

            {/* Skip forward */}
            <button
              onClick={() => skip(10)}
              className="vp-btn flex size-9 items-center justify-center rounded-full transition-all hover:bg-white/15 active:scale-90"
              aria-label="Forward 10 seconds"
              title="Forward 10s (→)"
            >
              <SkipForward className="size-[18px]" />
            </button>

            {/* Volume */}
            <div className="group/vol flex items-center gap-1">
              <button
                onClick={toggleMute}
                className="vp-btn flex size-9 items-center justify-center rounded-full transition-all hover:bg-white/15 active:scale-90"
                aria-label={isMuted ? "Unmute" : "Mute"}
                title="Mute (M)"
              >
                <VolumeIcon className="size-5" />
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.02}
                value={isMuted ? 0 : volume}
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                className="vp-volume-input h-[3px] w-0 origin-left scale-x-0 cursor-pointer appearance-none rounded-full bg-white/30 transition-all group-hover/vol:w-16 group-hover/vol:scale-x-100 sm:group-hover/vol:w-20"
                aria-label="Volume"
              />
            </div>

            {/* Time display */}
            <span className="ml-1 select-none text-xs font-medium tabular-nums text-white/90 sm:text-[13px]">
              {formatTime(currentTime)}
              <span className="text-white/50"> / </span>
              {formatTime(duration)}
            </span>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Playback speed */}
            <div className="relative">
              <button
                onClick={() => setShowSpeedMenu((prev) => !prev)}
                className="vp-btn flex h-9 items-center gap-1 rounded-full px-2 text-xs font-semibold transition-all hover:bg-white/15 active:scale-90"
                aria-label="Playback speed"
                title="Playback speed"
              >
                <Settings className="size-[18px]" />
                <span className="hidden sm:inline">{playbackSpeed}x</span>
              </button>

              {/* Speed menu */}
              {showSpeedMenu && (
                <div className="absolute bottom-full right-0 mb-2 overflow-hidden rounded-lg border border-white/10 bg-zinc-900/95 py-1 shadow-2xl backdrop-blur-lg">
                  {PLAYBACK_SPEEDS.map((speed) => (
                    <button
                      key={speed}
                      onClick={() => changeSpeed(speed)}
                      className={`flex w-full items-center justify-between gap-6 px-4 py-2 text-sm transition-colors hover:bg-white/10 ${
                        playbackSpeed === speed
                          ? "font-bold text-red-400"
                          : "text-white/80"
                      }`}
                    >
                      <span>{speed === 1 ? "Normal" : `${speed}x`}</span>
                      {playbackSpeed === speed && (
                        <span className="text-red-400">●</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Next video */}
            {nextVideo && (
              <button
                onClick={onNext}
                className="vp-btn flex h-9 items-center gap-1.5 rounded-full px-3 text-xs font-semibold transition-all hover:bg-white/15 active:scale-90"
                title={`Next: ${nextVideo.title}`}
                aria-label="Next video"
              >
                <span className="hidden sm:inline">Next</span>
                <SkipForward className="size-4" />
              </button>
            )}

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="vp-btn flex size-9 items-center justify-center rounded-full transition-all hover:bg-white/15 active:scale-90"
              aria-label="Toggle fullscreen"
              title="Fullscreen (F)"
            >
              {isFullscreen ? (
                <Minimize className="size-5" />
              ) : (
                <Maximize className="size-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}