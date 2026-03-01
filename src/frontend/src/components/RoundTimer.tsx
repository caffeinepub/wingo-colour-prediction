import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import type { Round } from "../backend.d";
import { RoundStatus } from "../backend.d";

interface RoundTimerProps {
  round: Round | undefined;
  isLoading: boolean;
}

const ROUND_DURATION = 30; // seconds

export default function RoundTimer({ round, isLoading }: RoundTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState<number>(ROUND_DURATION);

  useEffect(() => {
    if (!round) return;

    const updateTimer = () => {
      if (round.status !== RoundStatus.open) {
        setSecondsLeft(0);
        return;
      }
      // startTime is in nanoseconds
      const startMs = Number(round.startTime) / 1_000_000;
      const elapsed = (Date.now() - startMs) / 1000;
      const remaining = Math.max(0, ROUND_DURATION - elapsed);
      setSecondsLeft(Math.ceil(remaining));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 500);
    return () => clearInterval(interval);
  }, [round]);

  const progress = (secondsLeft / ROUND_DURATION) * 100;

  const getTimerColor = () => {
    if (secondsLeft > 15) return "oklch(0.65 0.2 145)";
    if (secondsLeft > 7) return "oklch(0.78 0.16 85)";
    return "oklch(0.62 0.24 27)";
  };

  const statusLabel = () => {
    if (isLoading) return "Loading...";
    if (!round) return "Waiting...";
    if (round.status === RoundStatus.open) return `Round #${round.id}`;
    if (round.status === RoundStatus.closed) return "Round Closed";
    if (round.status === RoundStatus.resolved) return "Round Ended";
    return "Waiting...";
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Round label */}
      <div className="flex items-center gap-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={round?.status ?? "loading"}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="flex items-center gap-2"
          >
            {round?.status === RoundStatus.open && (
              <span
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ background: "oklch(0.65 0.2 145)" }}
              />
            )}
            <span className="text-sm font-medium text-muted-foreground font-mono">
              {statusLabel()}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Timer circle */}
      <div className="relative w-28 h-28">
        <svg
          className="w-full h-full -rotate-90"
          viewBox="0 0 112 112"
          role="img"
          aria-label="Round timer progress"
        >
          {/* Background track */}
          <circle
            cx="56"
            cy="56"
            r="48"
            fill="none"
            stroke="oklch(0.22 0.01 280)"
            strokeWidth="6"
          />
          {/* Progress arc */}
          <motion.circle
            cx="56"
            cy="56"
            r="48"
            fill="none"
            stroke={getTimerColor()}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 48}`}
            strokeDashoffset={`${2 * Math.PI * 48 * (1 - progress / 100)}`}
            style={{ filter: `drop-shadow(0 0 6px ${getTimerColor()})` }}
            transition={{ duration: 0.4, ease: "linear" }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.span
              key={secondsLeft}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="font-mono font-bold text-3xl leading-none"
              style={{ color: getTimerColor() }}
            >
              {round?.status === RoundStatus.open
                ? secondsLeft
                : round?.status === RoundStatus.closed
                  ? "—"
                  : "•••"}
            </motion.span>
          </AnimatePresence>
          <span className="text-xs text-muted-foreground mt-0.5">
            {round?.status === RoundStatus.open ? "sec" : ""}
          </span>
        </div>
      </div>

      {/* Status badge */}
      <AnimatePresence mode="wait">
        <motion.div
          key={round?.status}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="px-3 py-1 rounded-full text-xs font-semibold font-mono"
          style={
            round?.status === RoundStatus.open
              ? {
                  background: "oklch(0.65 0.2 145 / 0.15)",
                  color: "oklch(0.65 0.2 145)",
                  border: "1px solid oklch(0.65 0.2 145 / 0.3)",
                }
              : round?.status === RoundStatus.closed
                ? {
                    background: "oklch(0.78 0.16 85 / 0.15)",
                    color: "oklch(0.78 0.16 85)",
                    border: "1px solid oklch(0.78 0.16 85 / 0.3)",
                  }
                : {
                    background: "oklch(0.22 0.01 280)",
                    color: "oklch(0.55 0.01 280)",
                    border: "1px solid oklch(0.28 0.01 280)",
                  }
          }
        >
          {round?.status === RoundStatus.open
            ? "BETTING OPEN"
            : round?.status === RoundStatus.closed
              ? "WAITING RESULT"
              : "IDLE"}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
