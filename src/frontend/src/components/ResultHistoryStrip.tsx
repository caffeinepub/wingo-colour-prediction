import { motion } from "motion/react";
import type { Round } from "../backend.d";
import { RoundStatus } from "../backend.d";

const NUMBER_COLOURS_LOCAL: Record<number, "red" | "green" | "violet"> = {
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

const BALL_COLORS = {
  red: {
    bg: "linear-gradient(135deg, oklch(0.66 0.28 18) 0%, oklch(0.52 0.26 28) 100%)",
    text: "#fff",
    shadow: "oklch(0.58 0.26 22 / 0.5)",
  },
  green: {
    bg: "linear-gradient(135deg, oklch(0.68 0.24 148) 0%, oklch(0.54 0.22 158) 100%)",
    text: "#fff",
    shadow: "oklch(0.62 0.22 148 / 0.5)",
  },
  violet: {
    bg: "linear-gradient(135deg, oklch(0.62 0.28 300) 0%, oklch(0.48 0.26 310) 100%)",
    text: "#fff",
    shadow: "oklch(0.55 0.26 300 / 0.5)",
  },
};

interface ResultHistoryStripProps {
  round: Round | undefined;
  allResults?: Array<{ number: number; roundId: bigint }>;
}

// Generate mock history from round data
function extractResultsFromRound(
  round: Round | undefined,
): Array<{ number: number; roundId: bigint }> {
  if (!round) return [];

  const results: Array<{ number: number; roundId: bigint }> = [];

  // If current round has a result, include it
  if (round.status === RoundStatus.resolved && round.result !== undefined) {
    results.push({ number: Number(round.result), roundId: round.id });
  }

  return results;
}

export default function ResultHistoryStrip({
  round,
  allResults,
}: ResultHistoryStripProps) {
  const currentResult = extractResultsFromRound(round);
  const displayResults = allResults ?? currentResult;

  if (displayResults.length === 0) {
    return (
      <div
        className="flex items-center gap-2 px-4 py-2.5 overflow-hidden"
        style={{
          background: "oklch(0.11 0.01 260)",
          borderBottom: "1px solid oklch(0.22 0.012 260)",
        }}
      >
        <span className="text-xs text-muted-foreground font-mono shrink-0">
          HISTORY
        </span>
        <span className="text-xs text-muted-foreground italic">
          No results yet
        </span>
      </div>
    );
  }

  // Show last 20
  const recent = displayResults.slice(-20).reverse();

  return (
    <div
      className="flex items-center gap-2 px-3 py-2"
      style={{
        background: "oklch(0.11 0.01 260)",
        borderBottom: "1px solid oklch(0.22 0.012 260)",
      }}
    >
      <span className="text-xs text-muted-foreground font-mono shrink-0 tracking-wider">
        HIST
      </span>
      <div className="flex gap-1.5 overflow-x-auto scrollbar-none flex-nowrap">
        {recent.map((res, idx) => {
          const colour = NUMBER_COLOURS_LOCAL[res.number] ?? "violet";
          const style = BALL_COLORS[colour];
          return (
            <motion.div
              key={`${res.roundId}-${idx}`}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{
                delay: idx * 0.03,
                type: "spring",
                stiffness: 400,
                damping: 20,
              }}
              className="w-7 h-7 rounded-full flex items-center justify-center font-mono font-bold text-xs shrink-0"
              style={{
                background: style.bg,
                color: style.text,
                boxShadow: `0 2px 8px ${style.shadow}`,
              }}
            >
              {res.number}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export { NUMBER_COLOURS_LOCAL };
