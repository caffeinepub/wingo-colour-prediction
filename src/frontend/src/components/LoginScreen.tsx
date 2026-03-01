import { Button } from "@/components/ui/button";
import { Loader2, TrendingUp, Trophy, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function LoginScreen() {
  const { login, isLoggingIn, isInitializing } = useInternetIdentity();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background mesh gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 60% 50% at 20% 50%, oklch(0.62 0.24 27 / 0.08) 0%, transparent 70%),
            radial-gradient(ellipse 60% 50% at 80% 50%, oklch(0.58 0.22 295 / 0.08) 0%, transparent 70%),
            radial-gradient(ellipse 80% 40% at 50% 100%, oklch(0.78 0.16 85 / 0.05) 0%, transparent 60%)
          `,
        }}
      />

      {/* Decorative grid lines */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(oklch(0.96 0.01 90) 1px, transparent 1px),
            linear-gradient(90deg, oklch(0.96 0.01 90) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex flex-col items-center gap-10 px-6 w-full max-w-sm"
      >
        {/* Logo */}
        <div className="flex flex-col items-center gap-4">
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{
              delay: 0.1,
              duration: 0.5,
              ease: [0.34, 1.56, 0.64, 1],
            }}
            className="w-20 h-20 rounded-2xl flex items-center justify-center glow-gold"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.78 0.16 85) 0%, oklch(0.65 0.18 60) 100%)",
            }}
          >
            <span className="font-display font-black text-3xl text-background">
              W
            </span>
          </motion.div>

          <div className="text-center">
            <h1 className="font-display font-black text-5xl tracking-tight text-foreground">
              WIN<span style={{ color: "oklch(0.78 0.16 85)" }}>GO</span>
            </h1>
            <p className="text-muted-foreground text-sm mt-1 font-body">
              Predict. Bet. Win Big.
            </p>
          </div>
        </div>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="flex flex-wrap gap-2 justify-center"
        >
          {[
            { icon: Zap, label: "Live Rounds", color: "oklch(0.78 0.16 85)" },
            {
              icon: TrendingUp,
              label: "9x Payout",
              color: "oklch(0.62 0.24 27)",
            },
            {
              icon: Trophy,
              label: "Leaderboard",
              color: "oklch(0.58 0.22 295)",
            },
          ].map(({ icon: Icon, label, color }) => (
            <div
              key={label}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
              style={{
                background: `${color.replace(")", " / 0.12)")}`,
                color,
                border: `1px solid ${color.replace(")", " / 0.25)")}`,
              }}
            >
              <Icon size={12} />
              {label}
            </div>
          ))}
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="w-full glass-card rounded-2xl p-5"
          style={{ boxShadow: "0 4px 32px oklch(0 0 0 / 0.3)" }}
        >
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { value: "30s", label: "Round time" },
              { value: "9×", label: "Max payout" },
              { value: "1000", label: "Start coins" },
            ].map(({ value, label }) => (
              <div key={label}>
                <p
                  className="font-display font-bold text-xl"
                  style={{ color: "oklch(0.78 0.16 85)" }}
                >
                  {value}
                </p>
                <p className="text-muted-foreground text-xs mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Login button */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="w-full"
        >
          <Button
            onClick={login}
            disabled={isLoggingIn || isInitializing}
            className="w-full h-14 text-base font-semibold rounded-xl font-display transition-all duration-200"
            style={{
              background:
                "linear-gradient(135deg, oklch(0.78 0.16 85) 0%, oklch(0.65 0.18 60) 100%)",
              color: "oklch(0.1 0.005 280)",
              boxShadow: "0 4px 24px oklch(0.78 0.16 85 / 0.35)",
            }}
          >
            {isLoggingIn || isInitializing ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Connecting...
              </>
            ) : (
              "Login to Play"
            )}
          </Button>
          <p className="text-center text-xs text-muted-foreground mt-3">
            Secured by Internet Identity
          </p>
        </motion.div>
      </motion.div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="absolute bottom-6 text-center text-xs text-muted-foreground"
      >
        © {new Date().getFullYear()}.{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-foreground transition-colors"
        >
          Built with ❤️ using caffeine.ai
        </a>
      </motion.footer>
    </div>
  );
}
