import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock } from "lucide-react";
import { motion } from "motion/react";
import type { Bet } from "../backend.d";
import { COLOUR_STYLES, NUMBER_COLOURS } from "./ResultDisplay";

interface HistoryTabProps {
  bets: Bet[] | undefined;
  isLoading: boolean;
}

function formatBetType(bet: Bet): string {
  if (bet.betType.__kind__ === "colour") {
    return `Colour: ${bet.betType.colour.toUpperCase()}`;
  }
  return `Number: ${bet.betType.number}`;
}

function getBetOutcome(bet: Bet): "win" | "loss" | "pending" {
  if (bet.result === undefined) return "pending";
  if (Number(bet.payout) > 0) return "win";
  return "loss";
}

export default function HistoryTab({ bets, isLoading }: HistoryTabProps) {
  if (isLoading) {
    return (
      <div className="space-y-3 p-1">
        {["s1", "s2", "s3", "s4", "s5"].map((k) => (
          <Skeleton key={k} className="h-16 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!bets || bets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl"
          style={{ background: "oklch(0.18 0.012 260)" }}
        >
          <Clock size={32} className="text-muted-foreground" />
        </div>
        <div className="text-center">
          <p className="font-display font-bold text-lg text-foreground">
            No bets yet
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Place a bet to start tracking your history
          </p>
        </div>
      </div>
    );
  }

  const sorted = [...bets].sort(
    (a, b) => Number(b.roundId) - Number(a.roundId),
  );

  return (
    <ScrollArea className="h-full max-h-[520px]">
      <div className="space-y-2 pr-1">
        {sorted.map((bet, idx) => {
          const outcome = getBetOutcome(bet);
          const isWin = outcome === "win";
          const isPending = outcome === "pending";

          const resultNum =
            bet.result !== undefined ? Number(bet.result) : null;
          const resultColour =
            resultNum !== null ? NUMBER_COLOURS[resultNum] : null;
          const resultStyle = resultColour ? COLOUR_STYLES[resultColour] : null;

          return (
            <motion.div
              key={`${bet.roundId}-${idx}`}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.04, duration: 0.3 }}
              className="flex items-center gap-3 px-4 py-3.5 rounded-2xl"
              style={{
                background: isPending
                  ? "oklch(0.16 0.01 260)"
                  : isWin
                    ? "oklch(0.62 0.22 148 / 0.1)"
                    : "oklch(0.58 0.26 22 / 0.08)",
                border: `1px solid ${
                  isPending
                    ? "oklch(0.24 0.012 260)"
                    : isWin
                      ? "oklch(0.62 0.22 148 / 0.3)"
                      : "oklch(0.58 0.26 22 / 0.25)"
                }`,
              }}
            >
              {/* Outcome indicator */}
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-base shrink-0"
                style={{
                  background: isPending
                    ? "oklch(0.2 0.012 260)"
                    : isWin
                      ? "oklch(0.62 0.22 148 / 0.2)"
                      : "oklch(0.58 0.26 22 / 0.2)",
                  color: isPending
                    ? "oklch(0.5 0.012 260)"
                    : isWin
                      ? "oklch(0.72 0.2 148)"
                      : "oklch(0.7 0.22 22)",
                  border: `1px solid ${isPending ? "oklch(0.28 0.012 260)" : isWin ? "oklch(0.62 0.22 148 / 0.35)" : "oklch(0.58 0.26 22 / 0.3)"}`,
                }}
              >
                {isPending ? "⏳" : isWin ? "✓" : "✗"}
              </div>

              {/* Left: round + bet type */}
              <div className="flex-1 flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-muted-foreground">
                    Round #{Number(bet.roundId)}
                  </span>
                  {resultNum !== null && resultStyle && (
                    <div
                      className="flex items-center justify-center w-5 h-5 rounded-full text-xs font-mono font-bold"
                      style={{
                        background: resultStyle.bg,
                        color: "#fff",
                      }}
                    >
                      {resultNum}
                    </div>
                  )}
                </div>
                <span className="text-sm font-medium">
                  {formatBetType(bet)}
                </span>
              </div>

              {/* Right: amount + badge */}
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span
                  className="text-sm font-bold font-mono"
                  style={{
                    color: isPending
                      ? "oklch(0.82 0.18 88)"
                      : isWin
                        ? "oklch(0.75 0.2 148)"
                        : "oklch(0.7 0.22 22)",
                  }}
                >
                  {isPending
                    ? `${Number(bet.amount).toLocaleString()}`
                    : isWin
                      ? `+${Number(bet.payout).toLocaleString()}`
                      : `-${Number(bet.amount).toLocaleString()}`}
                </span>
                <span
                  className="text-xs font-bold font-mono px-2 py-0.5 rounded-full"
                  style={{
                    background: isPending
                      ? "oklch(0.22 0.012 260)"
                      : isWin
                        ? "oklch(0.62 0.22 148 / 0.2)"
                        : "oklch(0.58 0.26 22 / 0.2)",
                    color: isPending
                      ? "oklch(0.5 0.012 260)"
                      : isWin
                        ? "oklch(0.75 0.2 148)"
                        : "oklch(0.72 0.22 22)",
                    border: `1px solid ${isPending ? "oklch(0.3 0.012 260)" : isWin ? "oklch(0.62 0.22 148 / 0.3)" : "oklch(0.58 0.26 22 / 0.25)"}`,
                  }}
                >
                  {isPending ? "PENDING" : isWin ? "WIN" : "LOSS"}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
