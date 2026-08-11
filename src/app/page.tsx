"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Shuffle, 
  Repeat, 
  Volume2, 
  VolumeX, 
  Music,
  Compass
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const ReactPlayer = dynamic(() => import("react-player/youtube"), { ssr: false }) as any;

interface Track {
  id: string;
  title: string;
  artist: string;
  artwork_url: string;
  audio_url: string;
}

export default function Home() {
  // Core client states
  const [tracks, setTracks] = useState<Track[]>([]);
  const [activeTrack, setActiveTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0); // Played fraction (0 to 1)

  // Interactive controls states
  const [duration, setDuration] = useState<number>(0); // Total duration in seconds
  const [volume, setVolume] = useState<number>(0.8);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isShuffle, setIsShuffle] = useState<boolean>(false);
  const [isRepeat, setIsRepeat] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadingStatus, setLoadingStatus] = useState<string>("Loading StayHigh Playlist...");

  const playerRef = useRef<any>(null);

  // Fetch playlist data once on mount
  useEffect(() => {
    let isSubscribed = true;

    const fetchPlaylistData = async () => {
      try {
        const res = await fetch("/api/playlist");
        if (res.ok) {
          const data = await res.json();
          if (data.tracks && data.tracks.length > 0 && isSubscribed) {
            setTracks(data.tracks);
            setActiveTrack(data.tracks[0]);
            setIsLoading(false);
            return;
          }
        }
        if (isSubscribed) {
          setLoadingStatus("Failed to load playlist. Please refresh.");
        }
      } catch (e) {
        console.error("Error fetching playlist data:", e);
        if (isSubscribed) {
          setLoadingStatus("Failed to load playlist. Please refresh.");
        }
      }
    };

    fetchPlaylistData();

    return () => {
      isSubscribed = false;
    };
  }, []);

  // Keyboard controls listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        handleNext();
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        handlePrev();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [tracks, activeTrack, isPlaying, isShuffle, isRepeat, progress, duration]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleNext = () => {
    if (tracks.length === 0 || !activeTrack) return;
    const currentIndex = tracks.findIndex((t) => t.id === activeTrack.id);

    if (isRepeat) {
      playerRef.current?.seekTo(0);
      setIsPlaying(true);
    } else if (isShuffle) {
      let nextIndex = Math.floor(Math.random() * tracks.length);
      if (nextIndex === currentIndex && tracks.length > 1) {
        nextIndex = (nextIndex + 1) % tracks.length;
      }
      setActiveTrack(tracks[nextIndex]);
      setIsPlaying(true);
      setProgress(0);
    } else {
      const nextIndex = (currentIndex + 1) % tracks.length;
      setActiveTrack(tracks[nextIndex]);
      setIsPlaying(true);
      setProgress(0);
    }
  };

  const handlePrev = () => {
    if (tracks.length === 0 || !activeTrack) return;
    const currentIndex = tracks.findIndex((t) => t.id === activeTrack.id);

    if (progress * duration > 3) {
      playerRef.current?.seekTo(0);
      setProgress(0);
    } else {
      let prevIndex;
      if (isShuffle) {
        prevIndex = Math.floor(Math.random() * tracks.length);
        if (prevIndex === currentIndex && tracks.length > 1) {
          prevIndex = (prevIndex + 1) % tracks.length;
        }
      } else {
        prevIndex = (currentIndex - 1 + tracks.length) % tracks.length;
      }
      setActiveTrack(tracks[prevIndex]);
      setIsPlaying(true);
      setProgress(0);
    }
  };

  const selectTrack = (index: number) => {
    if (index >= 0 && index < tracks.length) {
      setActiveTrack(tracks[index]);
      setIsPlaying(true);
      setProgress(0);
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = parseFloat(e.target.value);
    setProgress(newProgress);
    playerRef.current?.seekTo(newProgress, "fraction");
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (newVol > 0) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds) || timeInSeconds < 0) return "0:00";
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  if (isLoading || tracks.length === 0 || !activeTrack) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center min-h-screen bg-forest-dark text-gold-khaki select-none">
        <Compass className="w-12 h-12 animate-spin text-gold-khaki/80 mb-4" />
        <h1 className="font-serif text-lg tracking-widest uppercase animate-pulse text-center px-4 max-w-sm">
          {loadingStatus}
        </h1>
      </div>
    );
  }

  const currentTrackIndex = tracks.findIndex((t) => t.id === activeTrack.id);

  return (
    <div className="w-screen h-screen overflow-hidden flex flex-col justify-between items-stretch p-3 sm:p-4 md:p-6 relative z-10 text-white select-none bg-[#141C14]/80 bg-[url('/images/theme1.jpg')] bg-cover bg-center bg-no-repeat bg-fixed bg-blend-overlay">
      
      {/* Off-screen ReactPlayer container streaming YouTube video audio */}
      <div className="hidden">
        {activeTrack?.audio_url && (
          <ReactPlayer
            ref={playerRef}
            url={activeTrack.audio_url}
            playing={isPlaying}
            volume={volume}
            muted={isMuted}
            onProgress={(e: any) => setProgress(e.played || 0)}
            onDuration={(d: any) => setDuration(d || 0)}
            onEnded={handleNext}
            config={{
              youtube: {
                playerVars: {
                  origin: typeof window !== "undefined" ? window.location.origin : "",
                  autoplay: 0,
                  controls: 0,
                  showinfo: 0,
                  rel: 0,
                  modestbranding: 1
                }
              }
            }}
          />
        )}
      </div>

      {/* Main Workspace: top area flex row + bottom playbar */}
      <div className="w-full flex-1 flex flex-col justify-between min-h-0 gap-3 sm:gap-4">
        
        {/* Top Area: contains Header on Left, and Playlist on Right */}
        <div className="w-full flex-1 flex flex-row justify-between items-stretch min-h-0 gap-6">
          
          {/* Top-Left: Centered Header Area */}
          <div className="flex-1 flex flex-col justify-center items-center">
            <header className="text-center flex flex-col items-center">
              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-widest text-gold-khaki uppercase transition-all duration-300 hover:text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                StayHigh
              </h1>
              <p className="font-sans text-[10px] sm:text-xs tracking-wider text-zinc-500 uppercase mt-1">
                A Curated Playlist for the Hazy Moments
              </p>
            </header>
          </div>

          {/* Top-Right: Curated Sessions Playlist (tall and narrow) */}
          <section className="w-56 sm:w-60 md:w-64 bg-forest-dark/30 border border-forest-secondary/40 rounded-xl p-2.5 backdrop-blur-md shadow-2xl flex flex-col overflow-hidden h-full flex-shrink-0">
            <div className="flex items-center justify-between border-b border-forest-secondary/40 pb-1.5 px-0.5 flex-shrink-0">
              <div className="flex items-center gap-1 font-serif text-[9px] text-zinc-400 tracking-widest font-semibold uppercase">
                <Music className="w-3 h-3 text-gold-khaki/70" />
                <span>Curated Sessions</span>
              </div>
              <span className="font-sans text-[8px] text-zinc-500 tracking-wider font-medium uppercase">
                {tracks.length} Tracks
              </span>
            </div>

            {/* Internal scrollable list */}
            <div className="flex-1 overflow-y-auto mt-1.5 pr-0.5 space-y-1">
              {tracks.map((track, index) => {
                const isActive = track.id === activeTrack.id;
                return (
                  <button
                    key={track.id}
                    onClick={() => selectTrack(index)}
                    className={`w-full flex items-center justify-between p-1 rounded-lg text-left transition-all duration-300 group border border-transparent ${
                      isActive
                        ? "bg-forest-secondary/60 text-gold-khaki border-forest-secondary/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                        : "text-zinc-400 hover:text-zinc-200 hover:bg-forest-secondary/20"
                    }`}
                  >
                    <div className="flex items-center min-w-0">
                      <div className="w-7 h-7 rounded relative overflow-hidden flex-shrink-0 mr-1.5 border border-forest-secondary">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={track.artwork_url}
                          alt={track.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="min-w-0">
                        <p className={`text-[10px] font-medium truncate ${
                          isActive ? "text-gold-khaki" : "text-zinc-300 group-hover:text-white"
                        }`}>
                          {track.title}
                        </p>
                        <p className="text-[7.5px] text-zinc-500 group-hover:text-zinc-400 mt-0.5 truncate uppercase tracking-wider">
                          {track.artist}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-center w-3.5 h-3.5 flex-shrink-0 select-none">
                      {isActive && isPlaying ? (
                        <div className="flex items-end gap-[2px] h-2">
                          <span className="w-[1.5px] h-1 bg-gold-khaki rounded-full origin-bottom animate-wave-1"></span>
                          <span className="w-[1.5px] h-2 bg-gold-khaki rounded-full origin-bottom animate-wave-2"></span>
                          <span className="w-[1.5px] h-1 bg-gold-khaki rounded-full origin-bottom animate-wave-3"></span>
                        </div>
                      ) : isActive && !isPlaying ? (
                        <Play className="w-2 h-2 text-gold-khaki/80 fill-current translate-x-[0.5px]" />
                      ) : (
                        <span className="text-[8px] text-zinc-600 group-hover:text-gold-khaki/50 transition-colors">
                          {index < 9 ? `0${index + 1}` : index + 1}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

        </div>

        {/* Bottom Area: Centered, wider playbar card */}
        <div className="w-full flex justify-center items-center flex-shrink-0 mt-auto">
          <main className="w-full max-w-4xl bg-forest-dark/30 border border-forest-secondary/40 rounded-xl p-3 sm:p-4 backdrop-blur-md shadow-2xl flex flex-row items-center justify-between min-h-0 overflow-hidden gap-4">
            
            {/* Left Column: Spinning Vinyl Record Disc */}
            <div className="relative flex-shrink-0 flex items-center justify-center">
              <div 
                className="relative w-20 h-20 sm:w-24 sm:h-24 aspect-square rounded-full bg-[#0a0f0a] border border-forest-secondary shadow-[0_10px_30px_rgba(0,0,0,0.7)] flex items-center justify-center overflow-hidden cursor-pointer active:scale-98 transition-transform duration-300"
                onClick={togglePlay}
              >
                <div 
                  className={`absolute -inset-1 rounded-full border border-resin-glow/40 transition-all duration-500 blur-sm pointer-events-none ${
                    isPlaying ? "opacity-100 scale-105" : "opacity-0 scale-100"
                  }`}
                />

                <div 
                  className="w-[96%] h-[96%] rounded-full overflow-hidden relative animate-spin-slow"
                  style={{ 
                    animationPlayState: isPlaying ? "running" : "paused",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={activeTrack.artwork_url}
                    alt={activeTrack.title}
                    className="w-full h-full object-cover pointer-events-none"
                  />

                  <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle,transparent_38%,rgba(0,0,0,0.45)_38%,rgba(0,0,0,0.45)_40%,transparent_40%,transparent_48%,rgba(0,0,0,0.45)_48%,rgba(0,0,0,0.45)_50%,transparent_50%,transparent_58%,rgba(0,0,0,0.45)_58%,rgba(0,0,0,0.45)_60%,transparent_60%,transparent_68%,rgba(0,0,0,0.45)_68%,rgba(0,0,0,0.45)_70%,transparent_70%,transparent_78%,rgba(0,0,0,0.45)_78%,rgba(0,0,0,0.45)_80%,transparent_80%)] opacity-70" />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/8 to-transparent pointer-events-none" />
                </div>

                <div className="absolute w-[20%] h-[20%] rounded-full bg-[#141c14] border border-gold-khaki/30 flex items-center justify-center z-20 shadow-inner">
                  <div className="w-[30%] h-[30%] rounded-full bg-gold-khaki/70 shadow-[0_0_8px_rgba(217,200,155,0.4)]" />
                </div>
              </div>
            </div>

            {/* Right Column: Metadata, Progress, Controls, Volume */}
            <div className="flex-1 flex flex-col justify-center min-w-0">
              
              {/* Metadata & Media Controls on a single row to save vertical height */}
              <div className="w-full flex flex-row items-center justify-between min-w-0 gap-4">
                {/* Currently Playing Metadata */}
                <div className="text-left flex-shrink-0 flex flex-col justify-center max-w-[50%]">
                  <AnimatePresence mode="wait">
                    {activeTrack && (
                      <motion.div
                        key={activeTrack.id}
                        initial={{ opacity: 0, y: 3 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -3 }}
                        transition={{ duration: 0.15 }}
                      >
                        <h2 className="font-serif text-sm sm:text-base font-medium tracking-wide text-gold-khaki truncate max-w-full drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
                          {activeTrack.title}
                        </h2>
                        <h3 className="font-sans text-[8px] sm:text-[9px] tracking-widest text-zinc-400 mt-0.5 uppercase truncate">
                          {activeTrack.artist}
                        </h3>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Media Action Controls */}
                <div className="flex items-center justify-end gap-3 flex-shrink-0">
                  {/* Shuffle */}
                  <button
                    onClick={() => setIsShuffle(!isShuffle)}
                    className={`p-1 rounded-full transition-colors flex flex-col items-center relative ${
                      isShuffle ? "text-gold-khaki" : "text-zinc-500 hover:text-zinc-300"
                    }`}
                    title="Shuffle"
                  >
                    <Shuffle className="w-3.5 h-3.5" />
                    {isShuffle && (
                      <span className="absolute bottom-0 w-0.5 h-0.5 rounded-full bg-gold-khaki" />
                    )}
                  </button>

                  {/* Skip Previous */}
                  <button
                    onClick={handlePrev}
                    className="p-1 rounded-full text-zinc-400 hover:text-white transition-colors"
                    title="Previous"
                  >
                    <SkipBack className="w-4 h-4 fill-current" />
                  </button>

                  {/* Play/Pause Button */}
                  <button
                    onClick={togglePlay}
                    className="w-9 h-9 rounded-full bg-forest-secondary border border-gold-khaki/20 text-gold-khaki hover:text-white hover:bg-gold-khaki/10 flex items-center justify-center transition-all duration-300 transform active:scale-95 shadow-[0_0_10px_rgba(224,122,47,0.06)]"
                    title={isPlaying ? "Pause" : "Play"}
                  >
                    {isPlaying ? (
                      <Pause className="w-3.5 h-3.5 fill-current" />
                    ) : (
                      <Play className="w-3.5 h-3.5 fill-current translate-x-0.5" />
                    )}
                  </button>

                  {/* Skip Next */}
                  <button
                    onClick={handleNext}
                    className="p-1 rounded-full text-zinc-400 hover:text-white transition-colors"
                    title="Next"
                  >
                    <SkipForward className="w-4 h-4 fill-current" />
                  </button>

                  {/* Repeat */}
                  <button
                    onClick={() => setIsRepeat(!isRepeat)}
                    className={`p-1 rounded-full transition-colors flex flex-col items-center relative ${
                      isRepeat ? "text-gold-khaki" : "text-zinc-500 hover:text-zinc-300"
                    }`}
                    title="Repeat"
                  >
                    <Repeat className="w-3.5 h-3.5" />
                    {isRepeat && (
                      <span className="absolute bottom-0 w-0.5 h-0.5 rounded-full bg-gold-khaki" />
                    )}
                  </button>
                </div>
              </div>

              {/* Progress Timeline Control */}
              <div className="w-full mt-2 px-1 flex-shrink-0 flex flex-col items-center">
                <div className="w-full flex items-center justify-between font-sans text-[8px] sm:text-[9px] text-zinc-400 tracking-wider mb-2 select-none">
                  <span>{formatTime(progress * duration)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
                
                <div className="relative w-full group flex items-center">
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.001}
                    value={progress}
                    onChange={handleProgressChange}
                    className="w-full h-1 rounded-lg appearance-none cursor-pointer outline-none bg-forest-secondary accent-gold-khaki"
                    style={{
                      background: `linear-gradient(to right, #d9c89b 0%, #d9c89b ${
                        progress * 100
                      }%, #253d25 ${progress * 100}%, #253d25 100%)`,
                    }}
                  />
                </div>
              </div>

              {/* Volume control slider */}
              <div className="flex items-center gap-1.5 mt-2 flex-shrink-0 text-zinc-500 group pl-1">
                <button 
                  onClick={toggleMute}
                  className="hover:text-gold-khaki transition-colors p-0.5"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-3 h-3" />
                  ) : (
                    <Volume2 className="w-3 h-3" />
                  )}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-12 sm:w-14 h-1 rounded-lg appearance-none cursor-pointer outline-none bg-forest-secondary accent-gold-khaki opacity-40 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: `linear-gradient(to right, #d9c89b 0%, #d9c89b ${
                      (isMuted ? 0 : volume) * 100
                    }%, #253d25 ${(isMuted ? 0 : volume) * 100}%, #253d25 100%)`,
                  }}
                />
              </div>

            </div>
          </main>
        </div>

      </div>
    </div>
  );
}
