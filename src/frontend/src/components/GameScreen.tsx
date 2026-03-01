import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Coins,
  Gamepad2,
  History,
  LogOut,
  Settings,
  Trophy,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";
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
import RoundTimer from "./RoundTimer";

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

  // Find current user's bet in this round
  const currentBet: Bet | undefined = round?.bets.find(
    (b) => principal && b.user.toString() === principal.toString(),
  );

  const balance = userProfile ? Number(userProfile.balance) : 0;

  const handleLogout = () => {
    clear();
    toast.info("Logged out");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-md mx-auto">
      <Toaster
        position="top-center"
        theme="dark"
        toastOptions={{
          style: {
            background: "oklch(0.16 0.008 280)",
            border: "1px solid oklch(0.28 0.01 280)",
            color: "oklch(0.96 0.01 90)",
          },
        }}
      />

      {/* ─── Top Bar ─────────────────────────────────── */}
      <header
        className="sticky top-0 z-20 flex items-center justify-between px-4 py-3"
        style={{
          background: "oklch(0.12 0.006 280 / 0.95)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid oklch(0.22 0.01 280)",
        }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.78 0.16 85) 0%, oklch(0.65 0.18 60) 100%)",
            }}
          >
            <span className="font-display font-black text-sm text-background">
              W
            </span>
          </div>
          <span className="font-display font-black text-xl tracking-tight">
            WIN<span style={{ color: "oklch(0.78 0.16 85)" }}>GO</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Balance */}
          <motion.div
            key={balance}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{
              background: "oklch(0.78 0.16 85 / 0.1)",
              border: "1px solid oklch(0.78 0.16 85 / 0.25)",
            }}
          >
            <Coins size={14} style={{ color: "oklch(0.78 0.16 85)" }} />
            {profileLoading ? (
              <Skeleton className="w-12 h-4" />
            ) : (
              <span
                className="text-sm font-bold font-mono"
                style={{ color: "oklch(0.78 0.16 85)" }}
              >
                {balance.toLocaleString()}
              </span>
            )}
          </motion.div>

          {/* Logout */}
          <button
            type="button"
            onClick={handleLogout}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            style={{
              background: "oklch(0.18 0.008 280)",
              border: "1px solid oklch(0.25 0.01 280)",
            }}
          >
            <LogOut size={14} />
          </button>
        </div>
      </header>

      {/* ─── Main Tabs ───────────────────────────────── */}
      <main className="flex-1 flex flex-col">
        <Tabs defaultValue="game" className="flex-1 flex flex-col">
          {/* Tab content */}
          <div className="flex-1 overflow-y-auto">
            {/* ── Game Tab ── */}
            <TabsContent value="game" className="m-0 p-4 space-y-5">
              {/* Round status header: timer + result */}
              <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-2 gap-4"
              >
                {/* Timer card */}
                <div
                  className="flex flex-col items-center justify-center py-5 rounded-2xl"
                  style={{
                    background: "oklch(0.14 0.008 280)",
                    border: "1px solid oklch(0.22 0.01 280)",
                    boxShadow: "0 4px 24px oklch(0 0 0 / 0.3)",
                  }}
                >
                  <RoundTimer round={round} isLoading={roundLoading} />
                </div>

                {/* Result card */}
                <div
                  className="flex flex-col items-center justify-center py-5 rounded-2xl"
                  style={{
                    background: "oklch(0.14 0.008 280)",
                    border: "1px solid oklch(0.22 0.01 280)",
                    boxShadow: "0 4px 24px oklch(0 0 0 / 0.3)",
                  }}
                >
                  <ResultDisplay round={round} />
                </div>
              </motion.div>

              {/* Round ID strip */}
              {round && (
                <div
                  className="flex items-center justify-between px-4 py-2 rounded-xl text-xs font-mono"
                  style={{
                    background: "oklch(0.16 0.008 280)",
                    border: "1px solid oklch(0.22 0.01 280)",
                  }}
                >
                  <span className="text-muted-foreground">
                    Round #{Number(round.id)}
                  </span>
                  <span
                    className="font-medium"
                    style={{
                      color:
                        round.status === RoundStatus.open
                          ? "oklch(0.65 0.2 145)"
                          : round.status === RoundStatus.closed
                            ? "oklch(0.78 0.16 85)"
                            : "oklch(0.55 0.01 280)",
                    }}
                  >
                    {round.status === RoundStatus.open
                      ? "● OPEN"
                      : round.status === RoundStatus.closed
                        ? "◌ CLOSING"
                        : "○ IDLE"}
                  </span>
                </div>
              )}

              {/* Betting panel */}
              <AnimatePresence>
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="rounded-2xl p-5"
                  style={{
                    background: "oklch(0.14 0.008 280)",
                    border: "1px solid oklch(0.22 0.01 280)",
                    boxShadow: "0 4px 24px oklch(0 0 0 / 0.3)",
                  }}
                >
                  <div className="flex items-center gap-2 mb-5">
                    <Gamepad2
                      size={16}
                      style={{ color: "oklch(0.78 0.16 85)" }}
                    />
                    <h2 className="font-display font-bold text-base">
                      Place Your Bet
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
                  transition={{ delay: 0.2 }}
                >
                  <AdminPanel round={round} />
                </motion.div>
              )}

              {/* Colour legend */}
              <div
                className="rounded-xl px-4 py-3"
                style={{
                  background: "oklch(0.14 0.008 280)",
                  border: "1px solid oklch(0.22 0.01 280)",
                }}
              >
                <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider mb-2">
                  Colour Legend
                </p>
                <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                  {[
                    {
                      label: "RED",
                      nums: "1,3,7,9",
                      color: "oklch(0.62 0.24 27)",
                    },
                    {
                      label: "GREEN",
                      nums: "2,4,6,8",
                      color: "oklch(0.65 0.2 145)",
                    },
                    {
                      label: "VIOLET",
                      nums: "0,5",
                      color: "oklch(0.58 0.22 295)",
                    },
                  ].map(({ label, nums, color }) => (
                    <div key={label} className="flex flex-col gap-1">
                      <span className="font-bold text-xs" style={{ color }}>
                        {label}
                      </span>
                      <span className="text-muted-foreground">{nums}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 pt-2 border-t border-border text-xs text-muted-foreground">
                  <span className="text-foreground font-medium">Payouts:</span>{" "}
                  Number = 9× · Colour = 2×
                </div>
              </div>

              {/* Spacer for bottom nav */}
              <div className="h-4" />
            </TabsContent>

            {/* ── History Tab ── */}
            <TabsContent value="history" className="m-0 p-4">
              <div className="mb-4">
                <h2 className="font-display font-bold text-lg">My Bets</h2>
                <p className="text-sm text-muted-foreground">
                  Your prediction history
                </p>
              </div>
              <HistoryTab bets={betHistory} isLoading={historyLoading} />
              <div className="h-4" />
            </TabsContent>

            {/* ── Leaderboard Tab ── */}
            <TabsContent value="leaderboard" className="m-0 p-4">
              <div className="mb-4">
                <h2 className="font-display font-bold text-lg">Top Players</h2>
                <p className="text-sm text-muted-foreground">
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
            className="sticky bottom-0 z-20 px-4 py-2"
            style={{
              background: "oklch(0.12 0.006 280 / 0.97)",
              backdropFilter: "blur(12px)",
              borderTop: "1px solid oklch(0.22 0.01 280)",
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
                  className="flex flex-col gap-1 h-full rounded-xl data-[state=active]:text-foreground data-[state=inactive]:text-muted-foreground transition-all"
                  style={{
                    background: "transparent",
                  }}
                >
                  <Icon size={18} />
                  <span className="text-xs font-medium">{label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </Tabs>
      </main>

      {/* Footer */}
      <div className="text-center py-2 text-xs text-muted-foreground">
        © {new Date().getFullYear()}.{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-foreground transition-colors"
        >
          Built with ❤️ using caffeine.ai
        </a>
      </div>
    </div>
  );
}
