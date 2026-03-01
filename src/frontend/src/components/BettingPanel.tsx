import { Button } from "@/components/ui/button";
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

const QUICK_AMOUNTS = [50, 100, 200, 500];

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
      toast.error("Failed to place bet", {
        description: "Please try again",
      });
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Current bet indicator */}
      {currentBet && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between px-4 py-3 rounded-xl"
          style={{
            background: "oklch(0.78 0.16 85 / 0.1)",
            border: "1px solid oklch(0.78 0.16 85 / 0.3)",
          }}
        >
          <div className="flex items-center gap-2">
            <Coins size={14} style={{ color: "oklch(0.78 0.16 85)" }} />
            <span className="text-sm font-medium">Bet placed</span>
          </div>
          <span
            className="text-sm font-bold font-mono"
            style={{ color: "oklch(0.78 0.16 85)" }}
          >
            {Number(currentBet.amount)} coins
          </span>
        </motion.div>
      )}

      {/* Colour buttons */}
      <div>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider mb-3">
          Predict Colour
        </p>
        <div className="grid grid-cols-3 gap-3">
          {(
            [
              { colour: Colour.red, label: "RED", style: COLOUR_STYLES.red },
              {
                colour: Colour.green,
                label: "GREEN",
                style: COLOUR_STYLES.green,
              },
              {
                colour: Colour.violet,
                label: "VIOLET",
                style: COLOUR_STYLES.violet,
              },
            ] as const
          ).map(({ colour, label, style }) => {
            const isSelected =
              selection?.kind === "colour" && selection.value === colour;
            return (
              <motion.button
                key={colour}
                onClick={() =>
                  !currentBet &&
                  isOpen &&
                  setSelection(
                    isSelected ? null : { kind: "colour", value: colour },
                  )
                }
                whileTap={{ scale: 0.95 }}
                disabled={!!currentBet || !isOpen}
                className="relative h-12 rounded-xl font-display font-bold text-sm tracking-wide transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: isSelected ? style.bg : "oklch(0.18 0.008 280)",
                  color: isSelected ? style.text : "oklch(0.65 0.01 280)",
                  border: `2px solid ${isSelected ? style.border : "oklch(0.25 0.01 280)"}`,
                  boxShadow: isSelected
                    ? `0 0 16px ${style.glow} / 0.25)`
                    : "none",
                }}
              >
                {label}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Number grid */}
      <div>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider mb-3">
          Predict Number (9× payout)
        </p>
        <div className="grid grid-cols-5 gap-2">
          {([0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const).map((num) => {
            const colour = NUMBER_COLOURS[num];
            const style = COLOUR_STYLES[colour];
            const isSelected =
              selection?.kind === "number" && selection.value === num;
            return (
              <motion.button
                key={num}
                type="button"
                onClick={() =>
                  !currentBet &&
                  isOpen &&
                  setSelection(
                    isSelected ? null : { kind: "number", value: num },
                  )
                }
                whileTap={{ scale: 0.9 }}
                disabled={!!currentBet || !isOpen}
                className="h-12 rounded-xl font-display font-bold text-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center justify-center gap-0.5"
                style={{
                  background: isSelected ? style.bg : "oklch(0.18 0.008 280)",
                  color: isSelected ? style.text : "oklch(0.75 0.01 280)",
                  border: `2px solid ${isSelected ? style.border : "oklch(0.25 0.01 280)"}`,
                  boxShadow: isSelected
                    ? `0 0 16px ${style.glow} / 0.3)`
                    : "none",
                }}
              >
                <span>{num}</span>
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: style.glow }}
                />
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Bet amount */}
      <div>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider mb-3">
          Bet Amount
        </p>

        {/* Quick amounts */}
        <div className="flex gap-2 mb-3">
          {QUICK_AMOUNTS.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => setAmount(q.toString())}
              disabled={!!currentBet || !isOpen}
              className="flex-1 h-8 rounded-lg text-xs font-mono font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background:
                  amount === q.toString()
                    ? "oklch(0.78 0.16 85 / 0.15)"
                    : "oklch(0.18 0.008 280)",
                color:
                  amount === q.toString()
                    ? "oklch(0.78 0.16 85)"
                    : "oklch(0.55 0.01 280)",
                border: `1px solid ${amount === q.toString() ? "oklch(0.78 0.16 85 / 0.3)" : "oklch(0.25 0.01 280)"}`,
              }}
            >
              {q}
            </button>
          ))}
        </div>

        <div className="relative">
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min={1}
            max={balance}
            disabled={!!currentBet || !isOpen}
            className="font-mono text-right pr-14 h-11 bg-muted border-border"
            placeholder="Amount"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-mono">
            coins
          </span>
        </div>

        {/* Balance indicator */}
        <div className="flex justify-between mt-2 text-xs">
          <span className="text-muted-foreground">Balance</span>
          <span className="font-mono" style={{ color: "oklch(0.78 0.16 85)" }}>
            {balance.toLocaleString()} coins
          </span>
        </div>
      </div>

      {/* Place bet button */}
      <Button
        onClick={handlePlaceBet}
        disabled={!canBet}
        className="w-full h-13 text-base font-display font-bold rounded-xl transition-all duration-200"
        style={
          canBet
            ? {
                background:
                  "linear-gradient(135deg, oklch(0.78 0.16 85) 0%, oklch(0.65 0.18 60) 100%)",
                color: "oklch(0.1 0.005 280)",
                boxShadow: "0 4px 20px oklch(0.78 0.16 85 / 0.3)",
              }
            : {}
        }
      >
        {placeBet.isPending ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Placing Bet...
          </>
        ) : currentBet ? (
          "Bet Already Placed"
        ) : !isOpen ? (
          "Round Not Open"
        ) : !selection ? (
          "Select a Prediction"
        ) : betAmount > balance ? (
          "Insufficient Balance"
        ) : (
          `Place Bet — ${betAmount} Coins`
        )}
      </Button>
    </div>
  );
}
