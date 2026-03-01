import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import type { Principal } from "@icp-sdk/core/principal";
import { Trophy } from "lucide-react";
import { motion } from "motion/react";

interface LeaderboardTabProps {
  data: Array<[Principal, bigint]> | undefined;
  isLoading: boolean;
  currentPrincipal: string | undefined;
}

function shortenPrincipal(p: Principal): string {
  const str = p.toString();
  if (str.length <= 12) return str;
  return `${str.slice(0, 6)}...${str.slice(-4)}`;
}

const RANK_CONFIG = [
  {
    badge: "🥇",
    label: "1st",
    bg: "linear-gradient(135deg, oklch(0.82 0.18 88 / 0.2) 0%, oklch(0.18 0.012 260) 100%)",
    border: "oklch(0.82 0.18 88 / 0.45)",
    text: "oklch(0.88 0.16 88)",
    rankBg:
      "linear-gradient(135deg, oklch(0.82 0.18 88) 0%, oklch(0.72 0.16 75) 100%)",
    rankText: "oklch(0.15 0.01 260)",
  },
  {
    badge: "🥈",
    label: "2nd",
    bg: "linear-gradient(135deg, oklch(0.72 0.01 260 / 0.15) 0%, oklch(0.16 0.01 260) 100%)",
    border: "oklch(0.65 0.01 260 / 0.4)",
    text: "oklch(0.82 0.01 260)",
    rankBg:
      "linear-gradient(135deg, oklch(0.72 0.01 260) 0%, oklch(0.58 0.01 260) 100%)",
    rankText: "oklch(0.1 0.005 260)",
  },
  {
    badge: "🥉",
    label: "3rd",
    bg: "linear-gradient(135deg, oklch(0.68 0.16 55 / 0.15) 0%, oklch(0.16 0.01 260) 100%)",
    border: "oklch(0.65 0.16 55 / 0.4)",
    text: "oklch(0.78 0.14 55)",
    rankBg:
      "linear-gradient(135deg, oklch(0.68 0.16 55) 0%, oklch(0.55 0.14 48) 100%)",
    rankText: "oklch(0.1 0.005 260)",
  },
];

export default function LeaderboardTab({
  data,
  isLoading,
  currentPrincipal,
}: LeaderboardTabProps) {
  if (isLoading) {
    return (
      <div className="space-y-3 p-1">
        {["s1", "s2", "s3", "s4", "s5"].map((k) => (
          <Skeleton key={k} className="h-16 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl"
          style={{ background: "oklch(0.18 0.012 260)" }}
        >
          🏆
        </div>
        <div className="text-center">
          <p className="font-display font-bold text-lg text-foreground">
            No players yet
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Be the first to reach the top!
          </p>
        </div>
      </div>
    );
  }

  const top10 = data.slice(0, 10);

  return (
    <ScrollArea className="h-full max-h-[520px]">
      <div className="space-y-2.5 pr-1">
        {top10.map(([principal, balance], idx) => {
          const rankCfg = RANK_CONFIG[idx];
          const isTopThree = idx < 3;
          const isCurrentUser = principal.toString() === currentPrincipal;

          return (
            <motion.div
              key={principal.toString()}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.06, duration: 0.35 }}
              className="flex items-center gap-3 px-4 py-3.5 rounded-2xl"
              style={{
                background: isCurrentUser
                  ? "oklch(0.82 0.18 88 / 0.08)"
                  : isTopThree
                    ? rankCfg.bg
                    : "oklch(0.15 0.01 260)",
                border: `1px solid ${isCurrentUser ? "oklch(0.82 0.18 88 / 0.35)" : isTopThree ? rankCfg.border : "oklch(0.24 0.012 260)"}`,
                boxShadow:
                  idx === 0 ? "0 4px 20px oklch(0.82 0.18 88 / 0.15)" : "none",
              }}
            >
              {/* Rank badge */}
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center font-display font-black text-sm shrink-0"
                style={
                  isTopThree
                    ? {
                        background: rankCfg.rankBg,
                        color: rankCfg.rankText,
                        boxShadow: `0 2px 8px ${rankCfg.border}`,
                      }
                    : {
                        background: "oklch(0.2 0.012 260)",
                        color: "oklch(0.5 0.012 260)",
                        border: "1px solid oklch(0.28 0.012 260)",
                      }
                }
              >
                {isTopThree ? rankCfg.badge : idx + 1}
              </div>

              {/* Principal */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className="text-sm font-mono truncate"
                    style={{
                      color: isTopThree ? rankCfg.text : "oklch(0.75 0.01 260)",
                    }}
                  >
                    {shortenPrincipal(principal)}
                  </span>
                  {isCurrentUser && (
                    <span
                      className="text-xs px-2 py-0.5 rounded-full font-bold font-mono shrink-0"
                      style={{
                        background: "oklch(0.82 0.18 88 / 0.2)",
                        color: "oklch(0.88 0.16 88)",
                        border: "1px solid oklch(0.82 0.18 88 / 0.3)",
                      }}
                    >
                      YOU
                    </span>
                  )}
                </div>
              </div>

              {/* Balance */}
              <div className="flex items-center gap-1.5 shrink-0">
                <span
                  className="text-base font-bold font-mono"
                  style={{
                    color:
                      idx === 0
                        ? "oklch(0.88 0.16 88)"
                        : isTopThree
                          ? rankCfg.text
                          : "oklch(0.78 0.01 260)",
                  }}
                >
                  {Number(balance).toLocaleString()}
                </span>
                <span className="text-xs text-muted-foreground">🪙</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
