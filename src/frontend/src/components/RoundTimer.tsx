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
      const startMs = Number(round.startTime) / 1_000_000;
      const elapsed = (Date.now() - startMs) / 1000;
      const remaining = Math.max(0, ROUND_DURATION - elapsed);
      setSecondsLeft(Math.ceil(remaining));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 500);
    return () => clearInterval(interval);
  }, [round]);

  const progress =
    round?.status === RoundStatus.open
      ? (secondsLeft / ROUND_DURATION) * 100
      : 0;

  const getTimerColor = () => {
    if (round?.status !== RoundStatus.open) return "oklch(0.38 0.012 260)";
    if (secondsLeft > 15) return "oklch(0.68 0.22 148)";
    if (secondsLeft > 7) return "oklch(0.82 0.18 88)";
    return "oklch(0.65 0.26 22)";
  };

  const getGlowColor = () => {
    if (round?.status !== RoundStatus.open) return "transparent";
    if (secondsLeft > 15) return "oklch(0.68 0.22 148 / 0.4)";
    if (secondsLeft > 7) return "oklch(0.82 0.18 88 / 0.4)";
    return "oklch(0.65 0.26 22 / 0.5)";
  };

  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress / 100);

  const statusLabel = () => {
    if (isLoading) return "Loading...";
    if (!round) return "Waiting...";
    if (round.status === RoundStatus.open) return `Round #${Number(round.id)}`;
    if (round.status === RoundStatus.closed)
      return `Round #${Number(round.id)}`;
    if (round.status === RoundStatus.resolved)
      return `Round #${Number(round.id)}`;
    return "Waiting...";
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Round label */}
      <div className="text-xs font-mono text-muted-foreground tracking-wider">
        {statusLabel()}
      </div>

      {/* Timer circle */}
      <div
        className="relative"
        style={{
          width: 140,
          height: 140,
          filter: `drop-shadow(0 0 16px ${getGlowColor()})`,
        }}
      >
        <svg
          className="-rotate-90"
          width="140"
          height="140"
          viewBox="0 0 140 140"
          role="img"
          aria-label="Round timer progress"
        >
          {/* Outer decorative ring */}
          <circle
            cx="70"
            cy="70"
            r="66"
            fill="none"
            stroke="oklch(0.22 0.012 260 / 0.5)"
            strokeWidth="1"
            strokeDasharray="4 4"
          />

          {/* Background track */}
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke="oklch(0.2 0.01 260)"
            strokeWidth="9"
          />

          {/* Inner fill */}
          <circle
            cx="70"
            cy="70"
            r={radius - 12}
            fill="oklch(0.1 0.01 260 / 0.5)"
          />

          {/* Progress arc */}
          <motion.circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke={getTimerColor()}
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={`${circumference}`}
            strokeDashoffset={`${strokeDashoffset}`}
            transition={{ duration: 0.4, ease: "linear" }}
          />

          {/* Glow arc (thicker, lower opacity) */}
          <motion.circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke={getTimerColor()}
            strokeWidth="16"
            strokeLinecap="round"
            strokeDasharray={`${circumference}`}
            strokeDashoffset={`${strokeDashoffset}`}
            opacity="0.12"
            transition={{ duration: 0.4, ease: "linear" }}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.span
              key={secondsLeft}
              initial={{ scale: 1.25, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.75, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="font-display font-black leading-none"
              style={{
                fontSize: "2.4rem",
                color: getTimerColor(),
              }}
            >
              {round?.status === RoundStatus.open
                ? secondsLeft
                : round?.status === RoundStatus.closed
                  ? "—"
                  : "···"}
            </motion.span>
          </AnimatePresence>
          {round?.status === RoundStatus.open && (
            <span
              className="text-xs font-mono mt-0.5"
              style={{ color: "oklch(0.5 0.012 260)" }}
            >
              sec
            </span>
          )}
        </div>
      </div>

      {/* Status badge */}
      <AnimatePresence mode="wait">
        <motion.div
          key={round?.status}
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.85 }}
          transition={{ duration: 0.2 }}
          className="px-4 py-1.5 rounded-full text-xs font-bold font-mono tracking-widest"
          style={
            round?.status === RoundStatus.open
              ? {
                  background: "oklch(0.62 0.22 148 / 0.18)",
                  color: "oklch(0.75 0.2 148)",
                  border: "1px solid oklch(0.62 0.22 148 / 0.4)",
                  boxShadow: "0 0 12px oklch(0.62 0.22 148 / 0.15)",
                }
              : round?.status === RoundStatus.closed
                ? {
                    background: "oklch(0.82 0.18 88 / 0.15)",
                    color: "oklch(0.88 0.16 88)",
                    border: "1px solid oklch(0.82 0.18 88 / 0.35)",
                  }
                : {
                    background: "oklch(0.18 0.01 260)",
                    color: "oklch(0.45 0.012 260)",
                    border: "1px solid oklch(0.25 0.012 260)",
                  }
          }
        >
          {round?.status === RoundStatus.open
            ? "● BETTING OPEN"
            : round?.status === RoundStatus.closed
              ? "◌ WAITING RESULT"
              : "○ IDLE"}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
