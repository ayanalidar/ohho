"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, Volume2, Headphones, X } from "lucide-react";
import { menuItems, type MenuItem } from "@/data/menu";
import { cn } from "@/lib/utils";

const RING_SIZE = 96;
const RING_STROKE = 5;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRC = 2 * Math.PI * RING_RADIUS;

type PlayingState = {
  itemId: string;
  progress: number; // 0..1
  paused: boolean;
};

export function AudioGuide() {
  const [playing, setPlaying] = useState<PlayingState | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const stopAll = useCallback(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    currentUtteranceRef.current = null;
    setPlaying(null);
  }, []);

  const playItem = useCallback(
    (item: MenuItem) => {
      // Stop anything currently playing
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }

      // If browser doesn't support speech, simulate with timer only
      const supportsSpeech =
        typeof window !== "undefined" && "speechSynthesis" in window;

      const estDuration = Math.max(8000, item.audioDescription.length * 75); // ~75ms per char

      setPlaying({ itemId: item.id, progress: 0, paused: false });
      setExpanded(item.id);

      const startTime = Date.now();
      progressIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const p = Math.min(1, elapsed / estDuration);
        setPlaying((s) => (s ? { ...s, progress: p } : s));
        if (p >= 1) {
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
          }
          // mark as completed but keep ring full
          setTimeout(() => {
            setPlaying(null);
            setExpanded(null);
          }, 1500);
        }
      }, 100);

      if (supportsSpeech) {
        const u = new SpeechSynthesisUtterance(item.audioDescription);
        u.rate = 0.95;
        u.pitch = 1.0;
        u.volume = 0.9;
        // Try to find an English voice
        const voices = window.speechSynthesis.getVoices();
        const preferred =
          voices.find((v) => v.lang === "en-IN") ||
          voices.find((v) => v.lang.startsWith("en"));
        if (preferred) u.voice = preferred;
        u.onend = () => {
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
          }
          setPlaying((s) =>
            s ? { ...s, progress: 1 } : s
          );
          setTimeout(() => {
            setPlaying(null);
          }, 800);
        };
        currentUtteranceRef.current = u;
        try {
          window.speechSynthesis.speak(u);
        } catch {
          // ignore — timer still drives progress
        }
      }
    },
    []
  );

  const togglePause = useCallback(() => {
    if (!playing) return;
    if (playing.paused) {
      // resume
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.resume();
      }
      // restart timer from current progress
      const estDuration = 8000;
      const remaining = estDuration * (1 - playing.progress);
      const startTime = Date.now() - estDuration * playing.progress;
      progressIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const p = Math.min(1, elapsed / estDuration);
        setPlaying((s) => (s ? { ...s, progress: p, paused: false } : s));
        if (p >= 1) {
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
          }
          setTimeout(() => setPlaying(null), 800);
        }
      }, 100);
      void remaining;
    } else {
      // pause
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.pause();
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      setPlaying((s) => (s ? { ...s, paused: true } : s));
    }
  }, [playing]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, []);

  // Preload voices on mount (Chrome quirk)
  useEffect(() => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  return (
    <section
      id="audio"
      className="relative py-24 sm:py-32 bg-gradient-to-b from-ohho-black via-ohho-black-light to-ohho-black overflow-hidden"
    >
      <div className="absolute -top-20 right-0 h-72 w-72 rounded-full bg-ohho-gold/8 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-12">
        {/* Header */}
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-ohho-gold/10 border border-ohho-gold/30 text-ohho-gold text-xs font-semibold tracking-wider uppercase">
            <Headphones className="h-3.5 w-3.5" />
            Audio Guide — Circular Progress Rings
          </div>
          <h2 className="mt-5 font-display text-4xl sm:text-6xl text-ohho-cream leading-[0.95]">
            Listen to the <span className="text-gradient-ohho">menu.</span>
          </h2>
          <p className="mt-4 text-ohho-cream/75 text-lg leading-relaxed">
            Tap any dish to play a narrated audio description — read aloud by
            your browser. Each ring fills as the narration plays, so you can
            see how much is left. Pause, resume, or replay anytime.
          </p>
        </div>

        {/* Now playing banner */}
        <AnimatePresence>
          {playing && (
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="mt-8 p-4 rounded-xl glass-card flex items-center gap-4"
            >
              <div className="h-12 w-12 rounded-full bg-ohho-orange/15 border border-ohho-orange/40 grid place-items-center">
                <Volume2 className="h-5 w-5 text-ohho-orange animate-pulse" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] uppercase tracking-wider text-ohho-cream-dim">
                  Now narrating
                </div>
                <div className="font-display text-lg text-ohho-cream truncate">
                  {menuItems.find((m) => m.id === playing.itemId)?.name}
                </div>
              </div>
              <button
                onClick={togglePause}
                className="h-10 w-10 grid place-items-center rounded-full bg-ohho-orange text-ohho-black hover:scale-105 transition-transform"
                aria-label={playing.paused ? "Resume" : "Pause"}
              >
                {playing.paused ? (
                  <Play className="h-5 w-5 fill-ohho-black" />
                ) : (
                  <Pause className="h-5 w-5 fill-ohho-black" />
                )}
              </button>
              <button
                onClick={stopAll}
                className="h-10 w-10 grid place-items-center rounded-full bg-ohho-black/40 text-ohho-cream hover:text-ohho-red"
                aria-label="Stop"
              >
                <X className="h-5 w-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Grid of audio guide rings */}
        <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {menuItems.map((item, i) => {
            const isThisPlaying = playing?.itemId === item.id;
            const progress = isThisPlaying ? playing!.progress : 0;
            const isExpanded = expanded === item.id;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: (i % 4) * 0.05 }}
                className={cn(
                  "glass-card glass-card-hover rounded-2xl p-5 flex flex-col items-center text-center transition-all",
                  isExpanded && "ring-2 ring-ohho-orange/50"
                )}
              >
                {/* Circular progress ring with play button */}
                <div className="relative" style={{ width: RING_SIZE, height: RING_SIZE }}>
                  <svg
                    width={RING_SIZE}
                    height={RING_SIZE}
                    className="-rotate-90 absolute inset-0"
                  >
                    {/* track */}
                    <circle
                      cx={RING_SIZE / 2}
                      cy={RING_SIZE / 2}
                      r={RING_RADIUS}
                      fill="none"
                      stroke="rgba(245, 230, 204, 0.08)"
                      strokeWidth={RING_STROKE}
                    />
                    {/* progress */}
                    <circle
                      cx={RING_SIZE / 2}
                      cy={RING_SIZE / 2}
                      r={RING_RADIUS}
                      fill="none"
                      stroke="url(#ringGrad)"
                      strokeWidth={RING_STROKE}
                      strokeLinecap="round"
                      strokeDasharray={RING_CIRC}
                      strokeDashoffset={RING_CIRC * (1 - progress)}
                      style={{
                        transition: isThisPlaying
                          ? "stroke-dashoffset 100ms linear"
                          : "stroke-dashoffset 300ms ease",
                      }}
                    />
                    <defs>
                      <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#ff6a00" />
                        <stop offset="100%" stopColor="#ffc107" />
                      </linearGradient>
                    </defs>
                  </svg>

                  {/* Center button */}
                  <button
                    onClick={() => {
                      if (isThisPlaying) {
                        togglePause();
                      } else {
                        playItem(item);
                      }
                    }}
                    className="absolute inset-2 rounded-full grid place-items-center bg-ohho-black/80 border border-ohho-gold/30 hover:border-ohho-gold transition-colors group"
                    aria-label={
                      isThisPlaying
                        ? playing!.paused
                          ? `Resume ${item.name}`
                          : `Pause ${item.name}`
                        : `Play audio guide for ${item.name}`
                    }
                  >
                    {isThisPlaying && !playing!.paused ? (
                      <Pause className="h-7 w-7 text-ohho-orange fill-ohho-orange" />
                    ) : isThisPlaying && playing!.paused ? (
                      <Play className="h-7 w-7 text-ohho-orange fill-ohho-orange ml-0.5" />
                    ) : (
                      <Play className="h-7 w-7 text-ohho-cream fill-ohho-cream group-hover:text-ohho-orange group-hover:fill-ohho-orange transition-colors ml-0.5" />
                    )}
                  </button>

                  {/* Item emoji badge */}
                  <div className="absolute -top-1 -right-1 h-7 w-7 rounded-full bg-ohho-black border border-ohho-gold/40 grid place-items-center text-sm">
                    {item.emoji}
                  </div>
                </div>

                {/* Item name */}
                <div className="mt-4 font-semibold text-ohho-cream text-sm leading-tight">
                  {item.name}
                </div>
                <div className="mt-1 text-[11px] text-ohho-cream-dim">
                  {Math.ceil(item.audioDescription.length * 0.075)}s ·{" "}
                  {item.audioDescription.split(" ").length} words
                </div>

                {/* Progress text */}
                {isThisPlaying && (
                  <div className="mt-2 text-[11px] text-ohho-gold font-mono">
                    {Math.round(progress * 100)}%
                  </div>
                )}

                {/* Replay button when finished (only show briefly) */}
                {isThisPlaying && progress >= 1 && (
                  <button
                    onClick={() => playItem(item)}
                    className="mt-2 inline-flex items-center gap-1 text-[11px] text-ohho-cream-dim hover:text-ohho-gold"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Replay
                  </button>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Hint footer */}
        <div className="mt-10 flex items-center justify-center gap-2 text-xs text-ohho-cream-dim text-center">
          <Headphones className="h-3.5 w-3.5 text-ohho-gold" />
          Tip: turn your sound on. Narration uses your browser&apos;s built-in
          speech synthesis — no audio files, no downloads.
        </div>
      </div>
    </section>
  );
}
