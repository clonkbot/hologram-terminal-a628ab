import { useState } from "react";
import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { Id } from "../convex/_generated/dataModel";
import { AuthScreen } from "./components/AuthScreen";
import { PersonaSelect } from "./components/PersonaSelect";
import { HologramChat } from "./components/HologramChat";
import "./hologram.css";

type View = "select" | "chat";

function App() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { signOut } = useAuthActions();
  const [view, setView] = useState<View>("select");
  const [activeSessionId, setActiveSessionId] = useState<Id<"sessions"> | null>(
    null
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen hologram-container grid-background flex items-center justify-center">
        <div className="scanline-overlay" />
        <div className="relative z-10 text-center">
          <div className="hologram-figure mb-6">
            <div className="w-20 h-20 mx-auto border-2 border-cyan-400/50 rounded-full flex items-center justify-center">
              <div className="w-10 h-10 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
            </div>
          </div>
          <p className="hologram-text font-orbitron text-lg tracking-wider">
            INITIALIZING HOLOGRAM MATRIX
          </p>
          <p className="text-cyan-300/50 font-share-tech text-sm mt-2 tracking-widest">
            PLEASE STAND BY...
          </p>
        </div>
      </div>
    );
  }

  // Auth screen
  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  const handleSelectSession = (sessionId: Id<"sessions">) => {
    setActiveSessionId(sessionId);
    setView("chat");
  };

  const handleBackToSelect = () => {
    setActiveSessionId(null);
    setView("select");
  };

  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Sign out button */}
      <button
        onClick={() => signOut()}
        className="fixed top-4 right-4 z-50 px-3 py-2 text-cyan-400/50 hover:text-cyan-400 font-share-tech text-xs tracking-wider border border-cyan-400/20 hover:border-cyan-400/40 rounded transition-all bg-black/30 backdrop-blur-sm"
      >
        [ DISCONNECT ]
      </button>

      {/* Main content */}
      <div className="flex-1">
        {view === "select" && (
          <PersonaSelect onSelectSession={handleSelectSession} />
        )}
        {view === "chat" && activeSessionId && (
          <HologramChat sessionId={activeSessionId} onBack={handleBackToSelect} />
        )}
      </div>

      {/* Footer */}
      <footer className="relative z-10 py-4 text-center border-t border-cyan-400/10 bg-black/20">
        <p className="text-cyan-400/30 font-share-tech text-xs tracking-wider">
          Requested by{" "}
          <a
            href="https://twitter.com/LBallz77283"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-cyan-400/50 transition-colors"
          >
            @LBallz77283
          </a>
          {" · "}Built by{" "}
          <a
            href="https://twitter.com/clonkbot"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-cyan-400/50 transition-colors"
          >
            @clonkbot
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;
