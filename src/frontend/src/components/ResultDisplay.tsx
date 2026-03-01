import { AnimatePresence, motion } from "motion/react";
import type { Round } from "../backend.d";
import { RoundStatus } from "../backend.d";

interface ResultDisplayProps {
  round: Round | undefined;
}

const NUMBER_COLOURS: Record<number, "red" | "green" | "violet"> = {
  0: "violet",
  1: "red",
  2: "green",
  3: "red",
  4: "green",
  5: "violet",
  6: "green",
  7: "red",
  8: "green",
  9: "red",
};

const COLOUR_STYLES = {
  red: {
    bg: "oklch(0.62 0.24 27 / 0.15)",
    text: "oklch(0.7 0.2 27)",
    border: "oklch(0.62 0.24 27 / 0.4)",
    glow: "oklch(0.62 0.24 27)",
    label: "RED",
  },
  green: {
    bg: "oklch(0.65 0.2 145 / 0.15)",
    text: "oklch(0.72 0.18 145)",
    border: "oklch(0.65 0.2 145 / 0.4)",
    glow: "oklch(0.65 0.2 145)",
    label: "GREEN",
  },
  violet: {
    bg: "oklch(0.58 0.22 295 / 0.15)",
    text: "oklch(0.68 0.2 295)",
    border: "oklch(0.58 0.22 295 / 0.4)",
    glow: "oklch(0.58 0.22 295)",
    label: "VIOLET",
  },
};

export default function ResultDisplay({ round }: ResultDisplayProps) {
  const hasResult =
    round?.status === RoundStatus.resolved && round.result !== undefined;
  const resultNum = hasResult ? Number(round!.result!) : null;
  const colour = resultNum !== null ? NUMBER_COLOURS[resultNum] : null;
  const colourStyle = colour ? COLOUR_STYLES[colour] : null;

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
        Last Result
      </p>

      <AnimatePresence mode="wait">
        {hasResult && resultNum !== null && colourStyle ? (
          <motion.div
            key={`result-${round!.id}-${resultNum}`}
            initial={{ scale: 0.5, rotate: -10, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{
              duration: 0.5,
              ease: [0.34, 1.56, 0.64, 1],
            }}
            className="flex flex-col items-center gap-2"
          >
            {/* Big number */}
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center font-display font-black text-4xl"
              style={{
                background: colourStyle.bg,
                border: `2px solid ${colourStyle.border}`,
                color: colourStyle.text,
                boxShadow:
                  `0 0 30px ${colourStyle.glow} / 0.3), 0 0 60px ${colourStyle.glow} / 0.1)`.replace(
                    "/ 0",
                    "/ 0",
                  ),
                filter: `drop-shadow(0 0 12px ${colourStyle.glow})`,
              }}
            >
              {resultNum}
            </div>

            {/* Colour badge */}
            <div
              className="px-4 py-1 rounded-full text-xs font-bold font-mono tracking-widest"
              style={{
                background: colourStyle.bg,
                color: colourStyle.text,
                border: `1px solid ${colourStyle.border}`,
              }}
            >
              {colourStyle.label}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="no-result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-20 h-20 rounded-2xl flex items-center justify-center"
            style={{
              background: "oklch(0.18 0.008 280)",
              border: "2px solid oklch(0.25 0.01 280)",
            }}
          >
            <span className="font-display font-bold text-3xl text-muted-foreground">
              ?
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export { NUMBER_COLOURS, COLOUR_STYLES };
