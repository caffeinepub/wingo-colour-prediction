import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, Loader2, Play, Settings } from "lucide-react";
import { motion } from "motion/react";
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
  const _isResolved = round?.status === RoundStatus.resolved || !round;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden"
      style={{
        background: "oklch(0.14 0.008 280)",
        border: "1px solid oklch(0.58 0.22 295 / 0.3)",
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-4 py-3"
        style={{
          background: "oklch(0.58 0.22 295 / 0.12)",
          borderBottom: "1px solid oklch(0.58 0.22 295 / 0.2)",
        }}
      >
        <Settings size={14} style={{ color: "oklch(0.68 0.2 295)" }} />
        <span
          className="text-xs font-mono font-bold tracking-widest uppercase"
          style={{ color: "oklch(0.68 0.2 295)" }}
        >
          Admin Panel
        </span>
      </div>

      <div className="p-4 space-y-4">
        {/* Start round */}
        <div className="space-y-2">
          <Button
            onClick={handleStartRound}
            disabled={startRound.isPending || isOpen || isClosed}
            className="w-full h-10 font-display font-semibold text-sm rounded-lg"
            variant="outline"
            style={{
              borderColor: "oklch(0.65 0.2 145 / 0.4)",
              color: "oklch(0.65 0.2 145)",
            }}
          >
            {startRound.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Play className="mr-2 h-4 w-4" />
            )}
            {isOpen
              ? "Round Active"
              : isClosed
                ? "Round Closing"
                : "Start New Round"}
          </Button>
        </div>

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
              className="font-mono h-10 w-20 text-center"
              disabled={!isOpen && !isClosed}
            />
            <Button
              onClick={handleResolveRound}
              disabled={resolveRound.isPending || (!isOpen && !isClosed)}
              className="flex-1 h-10 font-display font-semibold text-sm rounded-lg"
              variant="outline"
              style={{
                borderColor: "oklch(0.62 0.24 27 / 0.4)",
                color: "oklch(0.7 0.2 27)",
              }}
            >
              {resolveRound.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle className="mr-2 h-4 w-4" />
              )}
              Resolve Round
            </Button>
          </div>
          {!isOpen && !isClosed && (
            <p className="text-xs text-muted-foreground">
              Start a round first to resolve it
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}
