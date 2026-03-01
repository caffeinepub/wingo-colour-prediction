import { Input } from "@/components/ui/input";
import { Coins, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { Colour, RoundStatus } from "../backend.d";
import type { Bet, Round, UserProfile } from "../backend.d";
import { usePlaceBet } from "../hooks/useQueries";
import { COLOUR_STYLES, NUMBER_COLOURS } from "./ResultDisplay";

interface BettingPanelProps {
  round: Round | undefined;
  userProfile: UserProfile | null | undefined;
  currentBet: Bet | undefined;
}

type BetSelection =
  | { kind: "colour"; value: Colour }
  | { kind: "number"; value: number }
  | null;

const CHIP_AMOUNTS = [10, 50, 100, 500, 1000];

const CHIP_COLORS = [
  {
    amount: 10,
    bg: "oklch(0.55 0.26 300)",
    text: "#fff",
    border: "oklch(0.65 0.24 300)",
  },
  {
    amount: 50,
    bg: "oklch(0.58 0.26 22)",
    text: "#fff",
    border: "oklch(0.68 0.24 22)",
  },
  {
    amount: 100,
    bg: "oklch(0.45 0.18 260)",
    text: "#fff",
    border: "oklch(0.55 0.18 260)",
  },
  {
    amount: 500,
    bg: "oklch(0.62 0.22 148)",
    text: "#fff",
    border: "oklch(0.72 0.2 148)",
  },
  {
    amount: 1000,
    bg: "oklch(0.82 0.18 88)",
    text: "oklch(0.1 0.005 260)",
    border: "oklch(0.92 0.12 88)",
  },
];

export default function BettingPanel({
  round,
  userProfile,
  currentBet,
}: BettingPanelProps) {
  const [selection, setSelection] = useState<BetSelection>(null);
  const [amount, setAmount] = useState<string>("100");
  const placeBet = usePlaceBet();

  const isOpen = round?.status === RoundStatus.open;
  const balance = userProfile ? Number(userProfile.balance) : 0;
  const betAmount = Number.parseInt(amount, 10) || 0;
  const canBet =
    isOpen &&
    !!selection &&
    betAmount > 0 &&
    betAmount <= balance &&
    !currentBet &&
    !placeBet.isPending;

  const handlePlaceBet = async () => {
    if (!selection || !canBet) return;

    const betType =
      selection.kind === "colour"
        ? { __kind__: "colour" as const, colour: selection.value }
        : { __kind__: "number" as const, number: BigInt(selection.value) };

    try {
      await placeBet.mutateAsync({ betType, amount: BigInt(betAmount) });
      toast.success("Bet placed!", {
        description: `${betAmount} coins on ${selection.kind === "colour" ? selection.value.toUpperCase() : `number ${selection.value}`}`,
      });
      setSelection(null);
    } catch {
      toast.error("Failed to place bet", { description: "Please try again" });
    }
  };

  const disabled = !!currentBet || !isOpen;

  return (
    <div className="flex flex-col gap-5">
      {/* Current bet indicator */}
      {currentBet && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between px-4 py-3 rounded-xl"
          style={{
            background: "oklch(0.82 0.18 88 / 0.1)",
            border: "1px solid oklch(0.82 0.18 88 / 0.3)",
          }}
        >
          <div className="flex items-center gap-2">
            <Coins size={14} style={{ color: "oklch(0.82 0.18 88)" }} />
            <span className="text-sm font-medium">
              Bet placed — waiting for result
            </span>
          </div>
          <span
            className="text-sm font-bold font-mono"
            style={{ color: "oklch(0.82 0.18 88)" }}
          >
            {Number(currentBet.amount).toLocaleString()} coins
          </span>
        </motion.div>
      )}

      {/* Colour buttons */}
      <div>
        <p
          className="text-xs font-mono tracking-widest uppercase mb-3"
          style={{ color: "oklch(0.5 0.012 260)" }}
        >
          Predict Colour —{" "}
          <span style={{ color: "oklch(0.82 0.18 88)" }}>2× payout</span>
        </p>
        <div className="grid grid-cols-3 gap-3">
          {(
            [
              { colour: Colour.red, label: "RED", cls: "btn-red" },
              { colour: Colour.green, label: "GREEN", cls: "btn-green" },
              { colour: Colour.violet, label: "VIOLET", cls: "btn-violet" },
            ] as const
          ).map(({ colour, label, cls }) => {
            const isSelected =
              selection?.kind === "colour" && selection.value === colour;
            const style = COLOUR_STYLES[colour];
            return (
              <motion.button
                key={colour}
                type="button"
                onClick={() =>
                  !disabled &&
                  setSelection(
                    isSelected ? null : { kind: "colour", value: colour },
                  )
                }
                whileTap={{ scale: 0.94 }}
                whileHover={!disabled ? { scale: 1.02 } : {}}
                disabled={disabled}
                className={`relative h-14 rounded-2xl font-display font-bold text-sm tracking-wide transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex flex-col items-center justify-center gap-0.5 ${isSelected ? cls : ""}`}
                style={
                  isSelected
                    ? {
                        boxShadow:
                          `0 0 24px ${style.glow} / 0.45), 0 4px 16px ${style.glow} / 0.25)`.replace(
                            "/ 0",
                            "/ 0",
                          ),
                        outline: `2px solid ${style.border}`,
                        outlineOffset: "2px",
                      }
                    : {
                        background: "oklch(0.17 0.012 260)",
                        color: "oklch(0.6 0.012 260)",
                        border: "1.5px solid oklch(0.26 0.012 260)",
                      }
                }
              >
                <span className={isSelected ? "text-white" : ""}>{label}</span>
                <span
                  className="text-xs opacity-70 font-mono"
                  style={{
                    color: isSelected
                      ? "rgba(255,255,255,0.7)"
                      : "oklch(0.4 0.012 260)",
                  }}
                >
                  2×
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Number grid */}
      <div>
        <p
          className="text-xs font-mono tracking-widest uppercase mb-3"
          style={{ color: "oklch(0.5 0.012 260)" }}
        >
          Predict Number —{" "}
          <span style={{ color: "oklch(0.82 0.18 88)" }}>9× payout</span>
        </p>
        <div className="grid grid-cols-5 gap-2">
          {([0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const).map((num) => {
            const colour = NUMBER_COLOURS[num];
            const style = COLOUR_STYLES[colour];
            const isSelected =
              selection?.kind === "number" && selection.value === num;
            const gradientBg =
              colour === "red"
                ? "linear-gradient(135deg, oklch(0.66 0.28 18) 0%, oklch(0.50 0.26 28) 100%)"
                : colour === "green"
                  ? "linear-gradient(135deg, oklch(0.68 0.24 148) 0%, oklch(0.52 0.22 158) 100%)"
                  : "linear-gradient(135deg, oklch(0.62 0.28 300) 0%, oklch(0.46 0.26 310) 100%)";
            return (
              <motion.button
                key={num}
                type="button"
                onClick={() =>
                  !disabled &&
                  setSelection(
                    isSelected ? null : { kind: "number", value: num },
                  )
                }
                whileTap={{ scale: 0.88 }}
                whileHover={!disabled ? { scale: 1.05 } : {}}
                disabled={disabled}
                className="h-14 rounded-xl font-display font-bold text-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex flex-col items-center justify-center gap-1"
                style={
                  isSelected
                    ? {
                        background: gradientBg,
                        color: "#fff",
                        border: `2px solid ${style.border}`,
                        boxShadow:
                          `0 0 20px ${style.glow} / 0.4), 0 4px 12px ${style.glow} / 0.2)`.replace(
                            "/ 0",
                            "/ 0",
                          ),
                      }
                    : {
                        background:
                          colour === "red"
                            ? "oklch(0.58 0.26 22 / 0.1)"
                            : colour === "green"
                              ? "oklch(0.62 0.22 148 / 0.1)"
                              : "oklch(0.55 0.26 300 / 0.1)",
                        color: style.badgeText ?? "oklch(0.75 0.01 260)",
                        border:
                          colour === "red"
                            ? "1.5px solid oklch(0.58 0.26 22 / 0.25)"
                            : colour === "green"
                              ? "1.5px solid oklch(0.62 0.22 148 / 0.25)"
                              : "1.5px solid oklch(0.55 0.26 300 / 0.25)",
                      }
                }
              >
                <span>{num}</span>
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: style.glow }}
                />
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Casino chips */}
      <div>
        <p
          className="text-xs font-mono tracking-widest uppercase mb-3"
          style={{ color: "oklch(0.5 0.012 260)" }}
        >
          Bet Amount
        </p>
        <div className="flex gap-2 mb-3 flex-wrap">
          {CHIP_AMOUNTS.map((q) => {
            const chipColor = CHIP_COLORS.find((c) => c.amount === q)!;
            const isSelected = amount === q.toString();
            return (
              <motion.button
                key={q}
                type="button"
                onClick={() => setAmount(q.toString())}
                disabled={disabled}
                whileTap={{ scale: 0.9 }}
                className="flex-1 min-w-[52px] h-10 rounded-full text-xs font-bold font-mono transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed relative"
                style={{
                  background: isSelected
                    ? chipColor.bg
                    : "oklch(0.17 0.012 260)",
                  color: isSelected ? chipColor.text : "oklch(0.5 0.012 260)",
                  border: `2px solid ${isSelected ? chipColor.border : "oklch(0.26 0.012 260)"}`,
                  boxShadow: isSelected
                    ? `0 0 12px ${chipColor.bg} / 0.4), 0 2px 8px oklch(0 0 0 / 0.3)`.replace(
                        "/ 0",
                        "/ 0",
                      )
                    : "none",
                }}
              >
                {q >= 1000 ? `${q / 1000}K` : q}
              </motion.button>
            );
          })}
        </div>

        {/* Custom amount input */}
        <div className="relative">
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min={1}
            max={balance}
            disabled={disabled}
            className="font-mono text-right pr-14 h-11 bg-muted border-border text-sm"
            placeholder="Custom amount"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">
            coins
          </span>
        </div>

        {/* Balance indicator */}
        <div className="flex justify-between mt-2 text-xs">
          <span className="text-muted-foreground font-mono">Balance</span>
          <span
            className="font-mono font-bold"
            style={{ color: "oklch(0.82 0.18 88)" }}
          >
            {balance.toLocaleString()} coins
          </span>
        </div>
      </div>

      {/* Place bet button */}
      <motion.button
        type="button"
        onClick={handlePlaceBet}
        disabled={!canBet}
        whileTap={canBet ? { scale: 0.97 } : {}}
        className="w-full h-14 rounded-2xl font-display font-black text-base tracking-wide transition-all duration-200 flex items-center justify-center gap-2"
        style={
          canBet
            ? {
                background:
                  "linear-gradient(135deg, oklch(0.75 0.22 148) 0%, oklch(0.62 0.22 155) 50%, oklch(0.52 0.2 160) 100%)",
                color: "#fff",
                boxShadow:
                  "0 4px 24px oklch(0.62 0.22 148 / 0.4), 0 8px 32px oklch(0 0 0 / 0.3)",
                border: "1px solid oklch(0.72 0.2 148 / 0.6)",
              }
            : {
                background: "oklch(0.16 0.01 260)",
                color: "oklch(0.4 0.012 260)",
                border: "1px solid oklch(0.22 0.012 260)",
                cursor: "not-allowed",
              }
        }
      >
        {placeBet.isPending ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Placing Bet...
          </>
        ) : currentBet ? (
          "✓ Bet Placed"
        ) : !isOpen ? (
          "Round Not Open"
        ) : !selection ? (
          "Select a Prediction First"
        ) : betAmount > balance ? (
          "Insufficient Balance"
        ) : (
          `Place Bet — ${betAmount.toLocaleString()} Coins`
        )}
      </motion.button>
    </div>
  );
}
