import { useState, useEffect, useRef } from "react";
import { useQuery, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface HologramChatProps {
  sessionId: Id<"sessions">;
  onBack: () => void;
}

const PERSONA_INFO: Record<
  string,
  { name: string; avatar: React.ReactNode; greeting: string }
> = {
  steve_jobs: {
    name: "STEVE JOBS",
    greeting:
      "The people who are crazy enough to think they can change the world are the ones who do. What would you like to explore?",
    avatar: (
      <svg viewBox="0 0 60 60" className="w-full h-full" fill="none">
        <circle
          cx="30"
          cy="30"
          r="28"
          stroke="currentColor"
          strokeWidth="1"
          opacity="0.5"
        />
        <circle
          cx="30"
          cy="25"
          r="10"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="rgba(0, 212, 255, 0.1)"
        />
        <path
          d="M15 50 Q30 35 45 50"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="rgba(0, 212, 255, 0.1)"
        />
      </svg>
    ),
  },
  jack_kirby: {
    name: "JACK KIRBY",
    greeting:
      "Comics are the modern mythology! The dreams we put on paper become the worlds others live in. What cosmic tales shall we explore?",
    avatar: (
      <svg viewBox="0 0 60 60" className="w-full h-full" fill="none">
        <polygon
          points="30,5 35,20 50,10 45,25 55,30 45,35 50,50 35,40 30,55 25,40 10,50 15,35 5,30 15,25 10,10 25,20"
          stroke="currentColor"
          strokeWidth="1"
          fill="rgba(0, 212, 255, 0.1)"
          opacity="0.5"
        />
        <circle cx="30" cy="30" r="12" stroke="currentColor" strokeWidth="1.5" />
        <text
          x="30"
          y="35"
          textAnchor="middle"
          fill="currentColor"
          fontSize="14"
          fontWeight="bold"
        >
          K
        </text>
      </svg>
    ),
  },
};

export function HologramChat({ sessionId, onBack }: HologramChatProps) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const session = useQuery(api.sessions.get, { id: sessionId });
  const messages = useQuery(api.messages.listBySession, { sessionId });
  const chat = useAction(api.hologram.chat);

  const persona = session?.persona
    ? PERSONA_INFO[session.persona]
    : PERSONA_INFO.steve_jobs;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !session) return;

    const userMessage = input.trim();
    setInput("");
    setError(null);
    setIsLoading(true);

    try {
      const history =
        messages?.map((m: { role: string; content: string }) => ({
          role: m.role,
          content: m.content,
        })) || [];

      await chat({
        sessionId,
        userMessage,
        persona: session.persona,
        conversationHistory: history,
      });
    } catch (err) {
      console.error("Chat error:", err);
      setError("Transmission interrupted. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  if (!session) {
    return (
      <div className="min-h-screen hologram-container grid-background flex items-center justify-center">
        <div className="hologram-text font-orbitron">
          ESTABLISHING CONNECTION...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen hologram-container grid-background flex flex-col">
      <div className="scanline-overlay" />

      {/* Header */}
      <header className="relative z-10 border-b border-cyan-400/20 bg-black/30 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-cyan-400/60 hover:text-cyan-400 transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span className="font-share-tech text-xs md:text-sm tracking-wider hidden sm:inline">
              [ BACK ]
            </span>
          </button>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 text-cyan-400 hologram-figure">
              {persona.avatar}
            </div>
            <div>
              <h1 className="hologram-text font-orbitron text-sm md:text-base font-bold">
                {persona.name}
              </h1>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-cyan-400/50 font-share-tech text-xs">
                  TRANSMISSION ACTIVE
                </span>
              </div>
            </div>
          </div>

          <div className="w-16" /> {/* Spacer for centering */}
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto relative z-10">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
          {/* Initial greeting */}
          {(!messages || messages.length === 0) && (
            <div className="flex gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 text-cyan-400 flex-shrink-0 hologram-figure">
                {persona.avatar}
              </div>
              <div className="flex-1">
                <div className="message-bubble rounded-lg p-4 md:p-5">
                  <p className="text-cyan-100/90 font-share-tech text-sm md:text-base leading-relaxed">
                    {persona.greeting}
                  </p>
                </div>
                <span className="text-cyan-400/30 font-share-tech text-xs mt-1 block">
                  HOLOGRAM INITIALIZED
                </span>
              </div>
            </div>
          )}

          {/* Message history */}
          {messages?.map((message: { _id: string; role: string; content: string; createdAt: number }) => (
            <div
              key={message._id}
              className={`flex gap-3 md:gap-4 ${
                message.role === "user" ? "flex-row-reverse" : ""
              }`}
            >
              {message.role === "assistant" && (
                <div className="w-10 h-10 md:w-12 md:h-12 text-cyan-400 flex-shrink-0 hologram-figure">
                  {persona.avatar}
                </div>
              )}
              <div
                className={`flex-1 ${
                  message.role === "user" ? "flex justify-end" : ""
                }`}
              >
                <div
                  className={`rounded-lg p-4 md:p-5 max-w-[85%] md:max-w-[80%] ${
                    message.role === "user"
                      ? "message-bubble user-message"
                      : "message-bubble"
                  }`}
                >
                  <p className="text-cyan-100/90 font-share-tech text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
                </div>
                <span className="text-cyan-400/30 font-share-tech text-xs mt-1 block">
                  {new Date(message.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 text-cyan-400 flex-shrink-0 hologram-figure">
                {persona.avatar}
              </div>
              <div className="message-bubble rounded-lg">
                <div className="typing-indicator">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 font-share-tech text-sm">
              {error}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input area */}
      <footer className="relative z-10 projector-base">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Transmit your message..."
                rows={1}
                className="input-hologram w-full px-4 py-3 rounded-lg font-share-tech text-sm md:text-base resize-none"
                style={{ minHeight: "48px", maxHeight: "120px" }}
              />
            </div>
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="btn-hologram px-4 md:px-6 rounded-lg font-orbitron text-xs md:text-sm tracking-wider flex items-center gap-2"
            >
              <span className="hidden sm:inline">TRANSMIT</span>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </button>
          </form>
          <p className="text-cyan-400/30 font-share-tech text-xs mt-2 text-center">
            POWERED BY GROK AI + FIRECRAWL • PRESS ENTER TO TRANSMIT
          </p>
        </div>
      </footer>
    </div>
  );
}
