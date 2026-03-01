import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef } from "react";
import type { Bet, Round } from "../backend.d";
import { RoundStatus } from "../backend.d";

interface WinLossModalProps {
  round: Round | undefined;
  prevRound: Round | undefined;
  currentBet: Bet | undefined;
  onDismiss: () => void;
  isVisible: boolean;
}

interface ModalData {
  isWin: boolean;
  amount: number;
  payout: number;
  result: number;
}

function fireConfetti(isWin: boolean) {
  // Dynamic import to avoid SSR issues
  import("canvas-confetti").then((confettiModule) => {
    const confetti = confettiModule.default;

    if (isWin) {
      // Big win confetti - multiple bursts
      const count = 200;
      const defaults = { origin: { y: 0.7 } };

      function fire(particleRatio: number, opts: Record<string, unknown>) {
        confetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio),
        });
      }

      fire(0.25, {
        spread: 26,
        startVelocity: 55,
        colors: ["#ff4444", "#44ff44", "#aa44ff", "#ffaa00", "#44aaff"],
      });
      fire(0.2, {
        spread: 60,
        colors: ["#ffaa00", "#ff4444", "#ffffff"],
      });
      fire(0.35, {
        spread: 100,
        decay: 0.91,
        scalar: 0.8,
        colors: ["#44ff88", "#ffdd00", "#ff4488"],
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 25,
        decay: 0.92,
        scalar: 1.2,
      });
      fire(0.1, {
        spread: 120,
        startVelocity: 45,
        colors: ["#ff6600", "#ff0044", "#00ff88"],
      });
    } else {
      // Subtle loss confetti - just a small scatter
      confetti({
        particleCount: 30,
        spread: 60,
        origin: { y: 0.5 },
        colors: ["#444466", "#223344", "#334455"],
        gravity: 2,
      });
    }
  });
}

export default function WinLossModal({
  isVisible,
  currentBet,
  round,
  onDismiss,
}: WinLossModalProps) {
  const firedRef = useRef(false);

  const modalData: ModalData | null = (() => {
    if (!isVisible || !currentBet || !round) return null;
    if (round.status !== RoundStatus.resolved || round.result === undefined)
      return null;

    const isWin = Number(currentBet.payout) > 0;
    return {
      isWin,
      amount: Number(currentBet.amount),
      payout: Number(currentBet.payout),
      result: Number(round.result),
    };
  })();

  // Fire confetti when modal appears
  useEffect(() => {
    if (isVisible && modalData && !firedRef.current) {
      firedRef.current = true;
      setTimeout(() => fireConfetti(modalData.isWin), 300);
    }
    if (!isVisible) {
      firedRef.current = false;
    }
  }, [isVisible, modalData]);

  // Auto-dismiss after 4 seconds
  useEffect(() => {
    if (!isVisible) return;
    const t = setTimeout(onDismiss, 4000);
    return () => clearTimeout(t);
  }, [isVisible, onDismiss]);

  return (
    <AnimatePresence>
      {isVisible && modalData && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: "oklch(0.05 0.01 260 / 0.85)" }}
            onClick={onDismiss}
          >
            {/* Modal card */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: -20 }}
              transition={{
                type: "spring",
                stiffness: 350,
                damping: 22,
              }}
              className="relative mx-6 max-w-xs w-full overflow-hidden rounded-3xl"
              onClick={(e) => e.stopPropagation()}
              style={{
                background: modalData.isWin
                  ? "linear-gradient(160deg, oklch(0.2 0.06 148) 0%, oklch(0.12 0.02 160) 60%, oklch(0.09 0.01 260) 100%)"
                  : "linear-gradient(160deg, oklch(0.18 0.06 22) 0%, oklch(0.12 0.03 28) 60%, oklch(0.09 0.01 260) 100%)",
                border: `2px solid ${modalData.isWin ? "oklch(0.62 0.22 148 / 0.5)" : "oklch(0.58 0.26 22 / 0.4)"}`,
                boxShadow: modalData.isWin
                  ? "0 0 60px oklch(0.62 0.22 148 / 0.25), 0 20px 60px oklch(0 0 0 / 0.5)"
                  : "0 0 60px oklch(0.58 0.26 22 / 0.2), 0 20px 60px oklch(0 0 0 / 0.5)",
              }}
            >
              {/* Decorative top strip */}
              <div
                className="h-1.5 w-full"
                style={{
                  background: modalData.isWin
                    ? "linear-gradient(90deg, oklch(0.62 0.22 148), oklch(0.75 0.18 88), oklch(0.62 0.22 148))"
                    : "linear-gradient(90deg, oklch(0.58 0.26 22), oklch(0.7 0.2 50), oklch(0.58 0.26 22))",
                }}
              />

              <div className="p-8 flex flex-col items-center text-center gap-5">
                {/* Big emoji/icon */}
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.15, type: "spring", stiffness: 300 }}
                  className="text-6xl leading-none"
                >
                  {modalData.isWin ? "🎉" : "😔"}
                </motion.div>

                {/* Title */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <h2
                    className="font-display font-black text-4xl tracking-tight leading-none"
                    style={{
                      color: modalData.isWin
                        ? "oklch(0.88 0.2 148)"
                        : "oklch(0.82 0.2 22)",
                    }}
                  >
                    {modalData.isWin ? "YOU WIN!" : "BETTER LUCK!"}
                  </h2>
                </motion.div>

                {/* Amount display */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className="flex flex-col items-center gap-1"
                >
                  <div
                    className="font-display font-black text-3xl"
                    style={{
                      color: modalData.isWin
                        ? "oklch(0.88 0.2 148)"
                        : "oklch(0.72 0.22 22)",
                    }}
                  >
                    {modalData.isWin
                      ? `+${modalData.payout.toLocaleString()}`
                      : `-${modalData.amount.toLocaleString()}`}
                  </div>
                  <div className="text-sm text-muted-foreground font-mono">
                    coins
                  </div>
                </motion.div>

                {/* Result badge */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="flex items-center gap-2"
                >
                  <span className="text-xs text-muted-foreground font-mono">
                    Result:
                  </span>
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center font-mono font-bold text-sm"
                    style={{
                      background: [0, 5].includes(modalData.result)
                        ? "linear-gradient(135deg, oklch(0.62 0.28 300) 0%, oklch(0.48 0.26 310) 100%)"
                        : [1, 3, 7, 9].includes(modalData.result)
                          ? "linear-gradient(135deg, oklch(0.66 0.28 18) 0%, oklch(0.52 0.26 28) 100%)"
                          : "linear-gradient(135deg, oklch(0.68 0.24 148) 0%, oklch(0.54 0.22 158) 100%)",
                      color: "#fff",
                    }}
                  >
                    {modalData.result}
                  </div>
                </motion.div>

                {/* Tap to close hint */}
                <p className="text-xs text-muted-foreground mt-1">
                  Tap anywhere to close
                </p>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
