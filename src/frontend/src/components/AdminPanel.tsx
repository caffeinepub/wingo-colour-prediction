import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Loader2,
  Play,
  Settings,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Round } from "../backend.d";
import { RoundStatus } from "../backend.d";
import { useResolveRound, useStartNewRound } from "../hooks/useQueries";

interface AdminPanelProps {
  round: Round | undefined;
}

export default function AdminPanel({ round }: AdminPanelProps) {
  const [resolveNumber, setResolveNumber] = useState<string>("0");
  const [isExpanded, setIsExpanded] = useState(false);
  const startRound = useStartNewRound();
  const resolveRound = useResolveRound();

  const handleStartRound = async () => {
    try {
      await startRound.mutateAsync();
      toast.success("New round started!");
    } catch {
      toast.error("Failed to start round");
    }
  };

  const handleResolveRound = async () => {
    const num = Number.parseInt(resolveNumber, 10);
    if (Number.isNaN(num) || num < 0 || num > 9) {
      toast.error("Enter a valid number (0-9)");
      return;
    }
    try {
      await resolveRound.mutateAsync(BigInt(num));
      toast.success(`Round resolved with ${num}!`);
    } catch {
      toast.error("Failed to resolve round");
    }
  };

  const isOpen = round?.status === RoundStatus.open;
  const isClosed = round?.status === RoundStatus.closed;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden"
      style={{
        background: "oklch(0.14 0.012 260)",
        border: "1px solid oklch(0.55 0.26 300 / 0.25)",
      }}
    >
      {/* Collapsible Header */}
      <button
        type="button"
        onClick={() => setIsExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 transition-colors hover:bg-white/5"
        style={{
          background: "oklch(0.55 0.26 300 / 0.1)",
          borderBottom: isExpanded
            ? "1px solid oklch(0.55 0.26 300 / 0.2)"
            : "none",
        }}
      >
        <div className="flex items-center gap-2">
          <Settings size={14} style={{ color: "oklch(0.72 0.22 300)" }} />
          <span
            className="text-xs font-mono font-bold tracking-widest uppercase"
            style={{ color: "oklch(0.72 0.22 300)" }}
          >
            Admin Panel
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp size={14} style={{ color: "oklch(0.55 0.22 300)" }} />
        ) : (
          <ChevronDown size={14} style={{ color: "oklch(0.55 0.22 300)" }} />
        )}
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-4">
              {/* Start round */}
              <motion.button
                type="button"
                onClick={handleStartRound}
                disabled={startRound.isPending || isOpen || isClosed}
                whileTap={{ scale: 0.97 }}
                className="w-full h-11 rounded-xl font-display font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background:
                    isOpen || isClosed
                      ? "oklch(0.18 0.01 260)"
                      : "oklch(0.62 0.22 148 / 0.15)",
                  color:
                    isOpen || isClosed
                      ? "oklch(0.4 0.012 260)"
                      : "oklch(0.72 0.2 148)",
                  border: `1px solid ${isOpen || isClosed ? "oklch(0.26 0.012 260)" : "oklch(0.62 0.22 148 / 0.4)"}`,
                }}
              >
                {startRound.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Play size={14} />
                )}
                {isOpen
                  ? "Round Active"
                  : isClosed
                    ? "Round Closing..."
                    : "Start New Round"}
              </motion.button>

              {/* Resolve round */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground font-mono">
                  Result Number (0–9)
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={resolveNumber}
                    onChange={(e) => setResolveNumber(e.target.value)}
                    min={0}
                    max={9}
                    className="font-mono h-10 w-20 text-center bg-muted border-border"
                    disabled={!isOpen && !isClosed}
                  />
                  <motion.button
                    type="button"
                    onClick={handleResolveRound}
                    disabled={resolveRound.isPending || (!isOpen && !isClosed)}
                    whileTap={{ scale: 0.97 }}
                    className="flex-1 h-10 rounded-xl font-display font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{
                      background:
                        !isOpen && !isClosed
                          ? "oklch(0.18 0.01 260)"
                          : "oklch(0.58 0.26 22 / 0.15)",
                      color:
                        !isOpen && !isClosed
                          ? "oklch(0.4 0.012 260)"
                          : "oklch(0.72 0.22 22)",
                      border: `1px solid ${!isOpen && !isClosed ? "oklch(0.26 0.012 260)" : "oklch(0.58 0.26 22 / 0.4)"}`,
                    }}
                  >
                    {resolveRound.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle size={14} />
                    )}
                    Resolve Round
                  </motion.button>
                </div>
                {!isOpen && !isClosed && (
                  <p className="text-xs text-muted-foreground font-mono">
                    Start a round first to resolve it
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
