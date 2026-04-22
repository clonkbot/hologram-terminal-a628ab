import { useState } from "react";
import { useAuthActions } from "@convex-dev/auth/react";

export function AuthScreen() {
  const { signIn } = useAuthActions();
  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    try {
      await signIn("password", formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  const handleAnonymous = async () => {
    setError(null);
    setLoading(true);
    try {
      await signIn("anonymous");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to continue as guest");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen hologram-container grid-background flex items-center justify-center p-4">
      <div className="scanline-overlay" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo/Title */}
        <div className="text-center mb-8 md:mb-12">
          <div className="hologram-figure inline-block mb-4">
            <svg
              viewBox="0 0 100 100"
              className="w-20 h-20 md:w-24 md:h-24 mx-auto"
              fill="none"
              stroke="#00D4FF"
              strokeWidth="1"
            >
              <circle cx="50" cy="50" r="45" opacity="0.3" />
              <circle cx="50" cy="50" r="35" opacity="0.5" />
              <circle cx="50" cy="50" r="25" opacity="0.7" />
              <polygon
                points="50,20 70,40 70,65 50,85 30,65 30,40"
                fill="rgba(0, 212, 255, 0.1)"
                stroke="#00D4FF"
                strokeWidth="1.5"
              />
              <circle cx="50" cy="50" r="8" fill="#00D4FF" opacity="0.8" />
            </svg>
          </div>
          <h1 className="hologram-text font-orbitron text-2xl md:text-4xl font-bold tracking-wider mb-2">
            HOLOGRAM TERMINAL
          </h1>
          <p className="text-cyan-300/60 font-share-tech text-sm md:text-base tracking-widest">
            ESTABLISH QUANTUM LINK
          </p>
        </div>

        {/* Auth Card */}
        <div className="message-bubble rounded-lg p-6 md:p-8">
          <div className="text-center mb-6">
            <h2 className="hologram-text font-orbitron text-lg md:text-xl mb-2">
              {flow === "signIn" ? "AUTHENTICATE" : "NEW REGISTRATION"}
            </h2>
            <div className="h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-cyan-300/70 font-share-tech text-xs mb-2 tracking-wider">
                IDENTIFICATION CODE
              </label>
              <input
                name="email"
                type="email"
                required
                placeholder="user@domain.com"
                className="input-hologram w-full px-4 py-3 rounded font-share-tech"
              />
            </div>

            <div>
              <label className="block text-cyan-300/70 font-share-tech text-xs mb-2 tracking-wider">
                ACCESS KEY
              </label>
              <input
                name="password"
                type="password"
                required
                placeholder="••••••••"
                className="input-hologram w-full px-4 py-3 rounded font-share-tech"
              />
            </div>

            <input name="flow" type="hidden" value={flow} />

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded p-3 text-red-400 text-sm font-share-tech">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-hologram w-full py-3 rounded font-orbitron text-sm tracking-wider"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
                  PROCESSING...
                </span>
              ) : flow === "signIn" ? (
                "ESTABLISH LINK"
              ) : (
                "CREATE PROFILE"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setFlow(flow === "signIn" ? "signUp" : "signIn")}
              className="text-cyan-400/60 hover:text-cyan-400 font-share-tech text-sm transition-colors"
            >
              {flow === "signIn"
                ? "[ NEW USER? CREATE PROFILE ]"
                : "[ EXISTING USER? AUTHENTICATE ]"}
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-cyan-400/20">
            <button
              onClick={handleAnonymous}
              disabled={loading}
              className="w-full py-3 rounded font-share-tech text-sm tracking-wider text-cyan-300/60 hover:text-cyan-300 border border-cyan-400/20 hover:border-cyan-400/40 transition-all"
            >
              [ CONTINUE AS GUEST ]
            </button>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="flex justify-center gap-2 mt-8">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-cyan-400/30"
              style={{
                animation: `pulse 2s ease-in-out infinite`,
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
