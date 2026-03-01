import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Coins, Gamepad2, History, LogOut, Trophy } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Bet } from "../backend.d";
import { RoundStatus } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useBetHistory,
  useCurrentRound,
  useIsAdmin,
  useLeaderboard,
  useSaveProfile,
  useUserProfile,
} from "../hooks/useQueries";
import AdminPanel from "./AdminPanel";
import BettingPanel from "./BettingPanel";
import HistoryTab from "./HistoryTab";
import LeaderboardTab from "./LeaderboardTab";
import ResultDisplay from "./ResultDisplay";
import ResultHistoryStrip from "./ResultHistoryStrip";
import RoundTimer from "./RoundTimer";
import WinLossModal from "./WinLossModal";

type ResultEntry = { number: number; roundId: bigint };

export default function GameScreen() {
  const { identity, clear } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading } = useUserProfile();
  const { data: round, isLoading: roundLoading } = useCurrentRound();
  const { data: isAdmin } = useIsAdmin();
  const { data: leaderboard, isLoading: leaderboardLoading } = useLeaderboard();
  const saveProfile = useSaveProfile();

  const principal = identity?.getPrincipal();
  const { data: betHistory, isLoading: historyLoading } =
    useBetHistory(principal);

  // Result history state - accumulate all seen results
  const [resultHistory, setResultHistory] = useState<ResultEntry[]>([]);
  const lastResolvedRoundId = useRef<bigint | null>(null);

  // Win/Loss modal state
  const [showWinLoss, setShowWinLoss] = useState(false);
  const [winLossBet, setWinLossBet] = useState<Bet | undefined>(undefined);
  const prevRoundStatusRef = useRef<RoundStatus | null>(null);
  const prevRoundIdRef = useRef<bigint | null>(null);

  // Track previous round for win/loss detection
  const [prevRound, setPrevRound] = useState(round);

  // Auto-create profile for new users
  useEffect(() => {
    if (userProfile === null && !saveProfile.isPending) {
      saveProfile.mutate(
        { balance: 1000n, betHistory: [] },
        {
          onSuccess: () => {
            toast.success("Welcome to WinGo!", {
              description: "You've received 1,000 starting coins!",
            });
          },
          onError: () => {
            toast.error("Failed to create profile");
          },
        },
      );
    }
  }, [userProfile, saveProfile]);

  // Detect round resolution, accumulate history, trigger win/loss modal
  useEffect(() => {
    if (!round) return;

    const wasOpen =
      prevRoundStatusRef.current === RoundStatus.open ||
      prevRoundStatusRef.current === RoundStatus.closed;
    const isNowResolved = round.status === RoundStatus.resolved;
    const isNewRound = prevRoundIdRef.current !== round.id;

    // Accumulate resolved results into history
    if (
      isNowResolved &&
      round.result !== undefined &&
      lastResolvedRoundId.current !== round.id
    ) {
      lastResolvedRoundId.current = round.id;
      setResultHistory((prev) => {
        // Avoid duplicates
        if (prev.some((r) => r.roundId === round.id)) return prev;
        return [...prev, { number: Number(round.result!), roundId: round.id }];
      });

      // Check if user had a bet in this round
      if (principal) {
        const userBet = round.bets.find(
          (b) => b.user.toString() === principal.toString(),
        );
        if (userBet && (wasOpen || isNewRound)) {
          setPrevRound(round);
          setWinLossBet(userBet);
          setShowWinLoss(true);
        }
      }
    }

    prevRoundStatusRef.current = round.status;
    prevRoundIdRef.current = round.id;
  }, [round, principal]);

  // Find current user's bet in this round
  const currentBet: Bet | undefined = round?.bets.find(
    (b) => principal && b.user.toString() === principal.toString(),
  );

  const balance = userProfile ? Number(userProfile.balance) : 0;

  const handleLogout = () => {
    clear();
    toast.info("Logged out");
  };

  const handleDismissModal = useCallback(() => {
    setShowWinLoss(false);
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col max-w-[430px] mx-auto"
      style={{ background: "oklch(0.09 0.012 260)" }}
    >
      <Toaster
        position="top-center"
        theme="dark"
        toastOptions={{
          style: {
            background: "oklch(0.15 0.012 260)",
            border: "1px solid oklch(0.28 0.012 260)",
            color: "oklch(0.96 0.008 90)",
          },
        }}
      />

      {/* Win/Loss Modal */}
      <WinLossModal
        isVisible={showWinLoss}
        currentBet={winLossBet}
        round={prevRound}
        prevRound={undefined}
        onDismiss={handleDismissModal}
      />

      {/* ─── Header ──────────────────────────────────────── */}
      <header
        className="sticky top-0 z-20 flex items-center justify-between px-4 py-3"
        style={{
          background:
            "linear-gradient(180deg, oklch(0.14 0.022 275) 0%, oklch(0.11 0.015 265) 100%)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid oklch(0.24 0.018 270 / 0.7)",
          boxShadow: "0 4px 24px oklch(0 0 0 / 0.4)",
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center font-display font-black text-lg"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.88 0.18 88) 0%, oklch(0.72 0.18 75) 100%)",
              color: "oklch(0.1 0.005 260)",
              boxShadow: "0 2px 12px oklch(0.82 0.18 88 / 0.4)",
            }}
          >
            W
          </div>
          <div className="flex flex-col">
            <span className="font-display font-black text-xl tracking-tight leading-none">
              WIN<span className="shimmer-text">GO</span>
            </span>
            <span
              className="text-xs font-mono"
              style={{ color: "oklch(0.5 0.012 260)" }}
            >
              Colour Prediction
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Balance chip */}
          <motion.div
            key={balance}
            initial={{ scale: 1.12, opacity: 0.7 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-full"
            style={{
              background: "oklch(0.82 0.18 88 / 0.12)",
              border: "1px solid oklch(0.82 0.18 88 / 0.28)",
            }}
          >
            <Coins size={13} style={{ color: "oklch(0.82 0.18 88)" }} />
            {profileLoading ? (
              <Skeleton className="w-14 h-4" />
            ) : (
              <span
                className="text-sm font-bold font-mono"
                style={{ color: "oklch(0.88 0.16 88)" }}
              >
                {balance.toLocaleString()}
              </span>
            )}
          </motion.div>

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            style={{
              background: "oklch(0.18 0.012 260)",
              border: "1px solid oklch(0.26 0.012 260)",
            }}
          >
            <LogOut size={14} />
          </button>
        </div>
      </header>

      {/* ─── Main Tabs ───────────────────────────────────── */}
      <main className="flex-1 flex flex-col">
        <Tabs defaultValue="game" className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto">
            {/* ── Game Tab ── */}
            <TabsContent value="game" className="m-0">
              {/* Result history strip */}
              <ResultHistoryStrip round={round} allResults={resultHistory} />

              <div className="p-4 space-y-4">
                {/* Timer + Result grid */}
                <motion.div
                  initial={{ opacity: 0, y: -12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid grid-cols-2 gap-3"
                >
                  {/* Timer card — primary, elevated with animated glow */}
                  <div
                    className="flex flex-col items-center justify-center py-5 rounded-2xl border-glow-pulse"
                    style={{
                      background:
                        "linear-gradient(145deg, oklch(0.16 0.02 275) 0%, oklch(0.12 0.012 265) 100%)",
                      border: "1px solid oklch(0.38 0.06 280 / 0.6)",
                      boxShadow:
                        "0 8px 32px oklch(0 0 0 / 0.45), inset 0 1px 0 oklch(0.4 0.04 280 / 0.2)",
                    }}
                  >
                    <RoundTimer round={round} isLoading={roundLoading} />
                  </div>

                  {/* Result card — reactive inset highlight by result colour */}
                  <div
                    className="flex flex-col items-center justify-center py-5 rounded-2xl"
                    style={{
                      background:
                        round?.status === "resolved" &&
                        round.result !== undefined
                          ? [0, 5].includes(Number(round.result))
                            ? "linear-gradient(145deg, oklch(0.17 0.025 300) 0%, oklch(0.12 0.01 260) 100%)"
                            : [1, 3, 7, 9].includes(Number(round.result))
                              ? "linear-gradient(145deg, oklch(0.17 0.025 22) 0%, oklch(0.12 0.01 260) 100%)"
                              : "linear-gradient(145deg, oklch(0.17 0.025 148) 0%, oklch(0.12 0.01 260) 100%)"
                          : "linear-gradient(145deg, oklch(0.15 0.015 260) 0%, oklch(0.12 0.01 260) 100%)",
                      border:
                        round?.status === "resolved" &&
                        round.result !== undefined
                          ? [0, 5].includes(Number(round.result))
                            ? "1px solid oklch(0.55 0.26 300 / 0.45)"
                            : [1, 3, 7, 9].includes(Number(round.result))
                              ? "1px solid oklch(0.58 0.26 22 / 0.45)"
                              : "1px solid oklch(0.62 0.22 148 / 0.45)"
                          : "1px solid oklch(0.24 0.012 260)",
                      boxShadow:
                        round?.status === "resolved" &&
                        round.result !== undefined
                          ? "0 4px 24px oklch(0 0 0 / 0.4), inset 0 1px 0 oklch(1 0 0 / 0.05)"
                          : "0 4px 20px oklch(0 0 0 / 0.35)",
                    }}
                  >
                    <ResultDisplay round={round} />
                  </div>
                </motion.div>

                {/* Round info strip */}
                {round && (
                  <div
                    className="flex items-center justify-between px-3 py-2 rounded-xl"
                    style={{
                      background: "oklch(0.14 0.01 260)",
                      border: "1px solid oklch(0.22 0.012 260)",
                    }}
                  >
                    <span className="text-xs font-mono text-muted-foreground">
                      Round #{Number(round.id)}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-1.5 h-1.5 rounded-full"
                        style={{
                          background:
                            round.status === RoundStatus.open
                              ? "oklch(0.68 0.22 148)"
                              : round.status === RoundStatus.closed
                                ? "oklch(0.82 0.18 88)"
                                : "oklch(0.38 0.012 260)",
                        }}
                      />
                      <span
                        className="text-xs font-mono font-semibold"
                        style={{
                          color:
                            round.status === RoundStatus.open
                              ? "oklch(0.72 0.2 148)"
                              : round.status === RoundStatus.closed
                                ? "oklch(0.88 0.16 88)"
                                : "oklch(0.45 0.012 260)",
                        }}
                      >
                        {round.status === RoundStatus.open
                          ? "OPEN"
                          : round.status === RoundStatus.closed
                            ? "CLOSING"
                            : "IDLE"}
                      </span>
                    </div>
                  </div>
                )}

                {/* Betting panel */}
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 }}
                    className="rounded-2xl p-4"
                    style={{
                      background:
                        "linear-gradient(145deg, oklch(0.15 0.015 260) 0%, oklch(0.12 0.01 260) 100%)",
                      border: "1px solid oklch(0.24 0.012 260)",
                      boxShadow: "0 4px 20px oklch(0 0 0 / 0.3)",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <div
                        className="w-6 h-6 rounded-lg flex items-center justify-center"
                        style={{ background: "oklch(0.82 0.18 88 / 0.15)" }}
                      >
                        <Gamepad2
                          size={13}
                          style={{ color: "oklch(0.82 0.18 88)" }}
                        />
                      </div>
                      <h2 className="font-display font-bold text-sm tracking-wide">
                        PLACE YOUR BET
                      </h2>
                    </div>
                    <BettingPanel
                      round={round}
                      userProfile={userProfile}
                      currentBet={currentBet}
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Admin panel */}
                {isAdmin && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.15 }}
                  >
                    <AdminPanel round={round} />
                  </motion.div>
                )}

                {/* Colour legend */}
                <div
                  className="rounded-2xl px-4 py-3"
                  style={{
                    background: "oklch(0.13 0.01 260)",
                    border: "1px solid oklch(0.22 0.012 260)",
                  }}
                >
                  <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest mb-3">
                    Colour Legend
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    {[
                      {
                        label: "RED",
                        nums: "1, 3, 7, 9",
                        color: "oklch(0.72 0.22 22)",
                        dot: "oklch(0.62 0.26 22)",
                      },
                      {
                        label: "GREEN",
                        nums: "2, 4, 6, 8",
                        color: "oklch(0.72 0.2 148)",
                        dot: "oklch(0.62 0.22 148)",
                      },
                      {
                        label: "VIOLET",
                        nums: "0, 5",
                        color: "oklch(0.72 0.22 300)",
                        dot: "oklch(0.58 0.26 300)",
                      },
                    ].map(({ label, nums, color, dot }) => (
                      <div key={label} className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ background: dot }}
                          />
                          <span className="font-bold text-xs" style={{ color }}>
                            {label}
                          </span>
                        </div>
                        <span className="text-muted-foreground font-mono text-xs">
                          {nums}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div
                    className="mt-3 pt-3 text-xs font-mono"
                    style={{
                      borderTop: "1px solid oklch(0.22 0.012 260)",
                      color: "oklch(0.45 0.012 260)",
                    }}
                  >
                    Colour ={" "}
                    <span style={{ color: "oklch(0.82 0.18 88)" }}>2×</span> ·
                    Number ={" "}
                    <span style={{ color: "oklch(0.82 0.18 88)" }}>9×</span>
                  </div>
                </div>

                <div className="h-4" />
              </div>
            </TabsContent>

            {/* ── History Tab ── */}
            <TabsContent value="history" className="m-0 p-4">
              <div className="mb-5">
                <h2 className="font-display font-bold text-xl">My Bets</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Your prediction history
                </p>
              </div>
              <HistoryTab bets={betHistory} isLoading={historyLoading} />
              <div className="h-4" />
            </TabsContent>

            {/* ── Leaderboard Tab ── */}
            <TabsContent value="leaderboard" className="m-0 p-4">
              <div className="mb-5">
                <h2 className="font-display font-bold text-xl">Top Players</h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Ranked by coin balance
                </p>
              </div>
              <LeaderboardTab
                data={leaderboard}
                isLoading={leaderboardLoading}
                currentPrincipal={principal?.toString()}
              />
              <div className="h-4" />
            </TabsContent>
          </div>

          {/* Bottom Tab Bar */}
          <div
            className="sticky bottom-0 z-20 px-3 py-2.5"
            style={{
              background: "oklch(0.10 0.016 265 / 0.98)",
              backdropFilter: "blur(20px)",
              borderTop: "1px solid oklch(0.24 0.016 270 / 0.9)",
              boxShadow:
                "0 -8px 32px oklch(0 0 0 / 0.5), 0 -1px 0 oklch(0.3 0.02 270 / 0.3)",
            }}
          >
            <TabsList className="w-full grid grid-cols-3 h-14 bg-transparent gap-1 p-0">
              {[
                { value: "game", icon: Gamepad2, label: "Game" },
                { value: "history", icon: History, label: "History" },
                { value: "leaderboard", icon: Trophy, label: "Leaders" },
              ].map(({ value, icon: Icon, label }) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="tab-trigger relative flex flex-col gap-1 h-full rounded-xl transition-all duration-200
                    data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground"
                >
                  <Icon size={18} />
                  <span className="text-xs font-bold">{label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </Tabs>
      </main>

      {/* Footer */}
      <div
        className="text-center py-2 text-xs"
        style={{ color: "oklch(0.38 0.012 260)" }}
      >
        © {new Date().getFullYear()}.{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-muted-foreground transition-colors"
        >
          Built with ❤️ using caffeine.ai
        </a>
      </div>
    </div>
  );
}
