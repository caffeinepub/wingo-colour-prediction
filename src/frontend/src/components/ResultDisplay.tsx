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
    bg: "linear-gradient(135deg, oklch(0.66 0.28 18) 0%, oklch(0.50 0.26 28) 100%)",
    bgSubtle: "oklch(0.58 0.26 22 / 0.15)",
    text: "oklch(0.92 0.06 22)",
    border: "oklch(0.58 0.26 22 / 0.6)",
    glow: "oklch(0.58 0.26 22)",
    badgeBg: "oklch(0.58 0.26 22 / 0.2)",
    badgeText: "oklch(0.82 0.2 22)",
    badgeBorder: "oklch(0.58 0.26 22 / 0.4)",
    label: "RED",
  },
  green: {
    bg: "linear-gradient(135deg, oklch(0.68 0.24 148) 0%, oklch(0.52 0.22 158) 100%)",
    bgSubtle: "oklch(0.62 0.22 148 / 0.15)",
    text: "oklch(0.96 0.04 148)",
    border: "oklch(0.62 0.22 148 / 0.6)",
    glow: "oklch(0.62 0.22 148)",
    badgeBg: "oklch(0.62 0.22 148 / 0.2)",
    badgeText: "oklch(0.82 0.18 148)",
    badgeBorder: "oklch(0.62 0.22 148 / 0.4)",
    label: "GREEN",
  },
  violet: {
    bg: "linear-gradient(135deg, oklch(0.62 0.28 300) 0%, oklch(0.46 0.26 310) 100%)",
    bgSubtle: "oklch(0.55 0.26 300 / 0.15)",
    text: "oklch(0.96 0.04 300)",
    border: "oklch(0.55 0.26 300 / 0.6)",
    glow: "oklch(0.55 0.26 300)",
    badgeBg: "oklch(0.55 0.26 300 / 0.2)",
    badgeText: "oklch(0.8 0.2 300)",
    badgeBorder: "oklch(0.55 0.26 300 / 0.4)",
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
            initial={{ scale: 0.3, rotate: -20, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{
              duration: 0.55,
              ease: [0.34, 1.56, 0.64, 1],
            }}
            className="flex flex-col items-center gap-3"
          >
            {/* Big number tile with glow */}
            <div className="relative">
              {/* Outer glow ring */}
              <div
                className="absolute inset-0 rounded-2xl"
                style={{
                  background: colourStyle.bgSubtle,
                  boxShadow:
                    `0 0 40px ${colourStyle.glow} / 0.4), 0 0 80px ${colourStyle.glow} / 0.15)`.replace(
                      "/ 0",
                      "/ 0",
                    ),
                  filter: "blur(8px)",
                  transform: "scale(1.15)",
                }}
              />
              <div
                className="relative w-24 h-24 rounded-2xl flex items-center justify-center font-display font-black"
                style={{
                  background: colourStyle.bg,
                  border: `2px solid ${colourStyle.border}`,
                  color: colourStyle.text,
                  fontSize: "2.6rem",
                  boxShadow: `
                    0 0 30px ${colourStyle.glow} / 0.35),
                    0 0 60px ${colourStyle.glow} / 0.15),
                    inset 0 1px 0 oklch(1 0 0 / 0.15)
                  `.replace(/\/ 0\)/g, "/ 0)"),
                }}
              >
                {resultNum}
              </div>
            </div>

            {/* Colour name badge */}
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="px-5 py-1.5 rounded-full text-xs font-bold font-mono tracking-widest"
              style={{
                background: colourStyle.badgeBg,
                color: colourStyle.badgeText,
                border: `1px solid ${colourStyle.badgeBorder}`,
              }}
            >
              ● {colourStyle.label}
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="no-result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-3"
          >
            <div
              className="w-24 h-24 rounded-2xl flex items-center justify-center"
              style={{
                background: "oklch(0.16 0.012 260)",
                border: "2px solid oklch(0.24 0.012 260)",
              }}
            >
              <span className="font-display font-bold text-4xl text-muted-foreground">
                ?
              </span>
            </div>
            <div
              className="px-5 py-1.5 rounded-full text-xs font-mono"
              style={{
                background: "oklch(0.16 0.01 260)",
                color: "oklch(0.4 0.012 260)",
                border: "1px solid oklch(0.22 0.012 260)",
              }}
            >
              PENDING
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export { NUMBER_COLOURS, COLOUR_STYLES };
