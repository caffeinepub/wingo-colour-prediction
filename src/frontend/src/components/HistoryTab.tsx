import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, TrendingDown, TrendingUp } from "lucide-react";
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
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ background: "oklch(0.18 0.008 280)" }}
        >
          <Clock size={28} className="text-muted-foreground" />
        </div>
        <div className="text-center">
          <p className="font-display font-semibold text-foreground">
            No bets yet
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Start playing to see your history
          </p>
        </div>
      </div>
    );
  }

  // Sort: most recent first
  const sorted = [...bets].sort(
    (a, b) => Number(b.roundId) - Number(a.roundId),
  );

  return (
    <ScrollArea className="h-full max-h-[480px]">
      <div className="space-y-2 pr-2">
        {sorted.map((bet, idx) => {
          const outcome = getBetOutcome(bet);
          const isWin = outcome === "win";
          const isPending = outcome === "pending";

          // Get colour for result
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
              className="flex items-center justify-between px-4 py-3 rounded-xl"
              style={{
                background: isPending
                  ? "oklch(0.18 0.008 280)"
                  : isWin
                    ? "oklch(0.65 0.2 145 / 0.08)"
                    : "oklch(0.62 0.24 27 / 0.06)",
                border: `1px solid ${
                  isPending
                    ? "oklch(0.25 0.01 280)"
                    : isWin
                      ? "oklch(0.65 0.2 145 / 0.25)"
                      : "oklch(0.62 0.24 27 / 0.2)"
                }`,
              }}
            >
              {/* Left: round + bet type */}
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-muted-foreground">
                    Round #{Number(bet.roundId)}
                  </span>
                  {resultNum !== null && resultStyle && (
                    <div
                      className="flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-mono font-bold"
                      style={{
                        background: resultStyle.bg,
                        color: resultStyle.text,
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

              {/* Right: amount + outcome */}
              <div className="flex flex-col items-end gap-1">
                <div className="flex items-center gap-1.5">
                  {!isPending &&
                    (isWin ? (
                      <TrendingUp
                        size={14}
                        style={{ color: "oklch(0.65 0.2 145)" }}
                      />
                    ) : (
                      <TrendingDown
                        size={14}
                        style={{ color: "oklch(0.62 0.24 27)" }}
                      />
                    ))}
                  <span
                    className="text-sm font-bold font-mono"
                    style={{
                      color: isPending
                        ? "oklch(0.78 0.16 85)"
                        : isWin
                          ? "oklch(0.65 0.2 145)"
                          : "oklch(0.62 0.24 27)",
                    }}
                  >
                    {isPending
                      ? `${Number(bet.amount)}`
                      : isWin
                        ? `+${Number(bet.payout)}`
                        : `-${Number(bet.amount)}`}
                  </span>
                </div>
                <Badge
                  variant="outline"
                  className="text-xs py-0 h-5"
                  style={{
                    borderColor: isPending
                      ? "oklch(0.35 0.01 280)"
                      : isWin
                        ? "oklch(0.65 0.2 145 / 0.4)"
                        : "oklch(0.62 0.24 27 / 0.4)",
                    color: isPending
                      ? "oklch(0.55 0.01 280)"
                      : isWin
                        ? "oklch(0.65 0.2 145)"
                        : "oklch(0.62 0.24 27)",
                  }}
                >
                  {isPending ? "PENDING" : isWin ? "WIN" : "LOSS"}
                </Badge>
              </div>
            </motion.div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
