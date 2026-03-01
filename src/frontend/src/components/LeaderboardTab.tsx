import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import type { Principal } from "@icp-sdk/core/principal";
import { Crown, Medal, Trophy } from "lucide-react";
import { motion } from "motion/react";

interface LeaderboardTabProps {
  data: Array<[Principal, bigint]> | undefined;
  isLoading: boolean;
  currentPrincipal: string | undefined;
}

function shortenPrincipal(p: Principal): string {
  const str = p.toString();
  if (str.length <= 16) return str;
  return `${str.slice(0, 8)}...${str.slice(-5)}`;
}

const RANK_STYLES = [
  {
    bg: "oklch(0.78 0.16 85 / 0.15)",
    border: "oklch(0.78 0.16 85 / 0.4)",
    text: "oklch(0.78 0.16 85)",
    icon: Crown,
  },
  {
    bg: "oklch(0.75 0.01 280 / 0.12)",
    border: "oklch(0.6 0.01 280 / 0.35)",
    text: "oklch(0.75 0.01 280)",
    icon: Medal,
  },
  {
    bg: "oklch(0.65 0.18 60 / 0.12)",
    border: "oklch(0.65 0.18 60 / 0.35)",
    text: "oklch(0.65 0.18 60)",
    icon: Medal,
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
          <Skeleton key={k} className="h-14 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center"
          style={{ background: "oklch(0.18 0.008 280)" }}
        >
          <Trophy size={28} className="text-muted-foreground" />
        </div>
        <div className="text-center">
          <p className="font-display font-semibold text-foreground">
            No players yet
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Be the first on the leaderboard!
          </p>
        </div>
      </div>
    );
  }

  const top10 = data.slice(0, 10);

  return (
    <ScrollArea className="h-full max-h-[480px]">
      <div className="space-y-2 pr-2">
        {top10.map(([principal, balance], idx) => {
          const rankStyle = RANK_STYLES[idx] ?? {
            bg: "oklch(0.18 0.008 280)",
            border: "oklch(0.25 0.01 280)",
            text: "oklch(0.65 0.01 280)",
            icon: null,
          };
          const RankIcon = rankStyle.icon;
          const isCurrentUser = principal.toString() === currentPrincipal;

          return (
            <motion.div
              key={principal.toString()}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.3 }}
              className="flex items-center justify-between px-4 py-3 rounded-xl"
              style={{
                background: isCurrentUser
                  ? "oklch(0.78 0.16 85 / 0.08)"
                  : rankStyle.bg,
                border: `1px solid ${isCurrentUser ? "oklch(0.78 0.16 85 / 0.35)" : rankStyle.border}`,
              }}
            >
              {/* Rank + principal */}
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background:
                      idx < 3
                        ? `${rankStyle.text.replace(")", " / 0.15)")}`
                        : "oklch(0.22 0.01 280)",
                  }}
                >
                  {idx < 3 && RankIcon ? (
                    <RankIcon size={14} style={{ color: rankStyle.text }} />
                  ) : (
                    <span
                      className="text-xs font-bold font-mono"
                      style={{ color: rankStyle.text }}
                    >
                      {idx + 1}
                    </span>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono text-foreground">
                      {shortenPrincipal(principal)}
                    </span>
                    {isCurrentUser && (
                      <span
                        className="text-xs px-1.5 py-0.5 rounded font-bold"
                        style={{
                          background: "oklch(0.78 0.16 85 / 0.2)",
                          color: "oklch(0.78 0.16 85)",
                        }}
                      >
                        YOU
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Balance */}
              <div className="flex items-center gap-1">
                <span
                  className="font-display font-bold text-base"
                  style={{
                    color:
                      idx === 0 ? "oklch(0.78 0.16 85)" : "oklch(0.85 0.01 90)",
                  }}
                >
                  {Number(balance).toLocaleString()}
                </span>
                <span className="text-xs text-muted-foreground">c</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
