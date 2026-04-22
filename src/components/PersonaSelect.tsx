import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface PersonaSelectProps {
  onSelectSession: (sessionId: Id<"sessions">) => void;
}

const PERSONAS = [
  {
    id: "steve_jobs",
    name: "STEVE JOBS",
    title: "Co-founder of Apple",
    description: "Visionary. Innovator. Design perfectionist. Ask about technology, creativity, and making a dent in the universe.",
    quote: '"Stay hungry. Stay foolish."',
    icon: (
      <svg viewBox="0 0 80 80" className="w-full h-full" fill="none">
        {/* Apple-inspired icon */}
        <path
          d="M40 10 C55 10 65 25 65 40 C65 55 55 70 40 70 C25 70 15 55 15 40 C15 25 25 10 40 10"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="rgba(0, 212, 255, 0.1)"
        />
        <path
          d="M40 5 Q45 15 40 20"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="none"
        />
        <circle cx="40" cy="40" r="15" stroke="currentColor" strokeWidth="1" opacity="0.5" />
        <circle cx="40" cy="40" r="5" fill="currentColor" opacity="0.8" />
      </svg>
    ),
  },
  {
    id: "jack_kirby",
    name: "JACK KIRBY",
    title: "The King of Comics",
    description: "Creator of worlds. Master of cosmic storytelling. Ask about art, mythology, and the power of imagination.",
    quote: '"Comics are not kid stuff. They\'re a valid art form."',
    icon: (
      <svg viewBox="0 0 80 80" className="w-full h-full" fill="none">
        {/* Comic/burst style icon */}
        <polygon
          points="40,5 45,25 65,10 55,30 75,35 55,45 70,65 45,55 40,75 35,55 10,65 25,45 5,35 25,30 15,10 35,25"
          stroke="currentColor"
          strokeWidth="1.5"
          fill="rgba(0, 212, 255, 0.1)"
        />
        <circle cx="40" cy="40" r="12" stroke="currentColor" strokeWidth="1" opacity="0.5" />
        <text
          x="40"
          y="45"
          textAnchor="middle"
          fill="currentColor"
          fontSize="12"
          fontWeight="bold"
        >
          K
        </text>
      </svg>
    ),
  },
];

export function PersonaSelect({ onSelectSession }: PersonaSelectProps) {
  const sessions = useQuery(api.sessions.list);
  const createSession = useMutation(api.sessions.create);
  const deleteSession = useMutation(api.sessions.remove);

  const handleSelectPersona = async (personaId: string) => {
    const persona = PERSONAS.find((p) => p.id === personaId);
    if (!persona) return;

    const sessionId = await createSession({
      persona: personaId,
      title: `Transmission with ${persona.name}`,
    });
    onSelectSession(sessionId);
  };

  const handleResumeSession = (sessionId: Id<"sessions">) => {
    onSelectSession(sessionId);
  };

  const handleDeleteSession = async (
    e: React.MouseEvent,
    sessionId: Id<"sessions">
  ) => {
    e.stopPropagation();
    if (confirm("Delete this transmission log?")) {
      await deleteSession({ id: sessionId });
    }
  };

  return (
    <div className="min-h-screen hologram-container grid-background p-4 md:p-8">
      <div className="scanline-overlay" />

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <div className="hologram-figure inline-block mb-4">
            <div className="w-16 h-16 md:w-20 md:h-20 mx-auto border-2 border-cyan-400/50 rounded-full flex items-center justify-center">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-cyan-400/20 rounded-full animate-pulse" />
            </div>
          </div>
          <h1 className="hologram-text font-orbitron text-xl md:text-3xl font-bold tracking-wider mb-2">
            SELECT HOLOGRAM PROJECTION
          </h1>
          <p className="text-cyan-300/60 font-share-tech text-xs md:text-sm tracking-widest">
            CHOOSE A VISIONARY TO CHANNEL
          </p>
        </div>

        {/* Persona Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8 md:mb-12">
          {PERSONAS.map((persona) => (
            <button
              key={persona.id}
              onClick={() => handleSelectPersona(persona.id)}
              className="persona-card message-bubble rounded-lg p-6 text-left"
            >
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 md:w-20 md:h-20 text-cyan-400 flex-shrink-0 hologram-figure">
                  {persona.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="hologram-text font-orbitron text-lg md:text-xl font-bold mb-1">
                    {persona.name}
                  </h3>
                  <p className="text-cyan-300/70 font-share-tech text-xs tracking-wider mb-2">
                    {persona.title}
                  </p>
                  <p className="text-cyan-200/50 font-share-tech text-xs md:text-sm leading-relaxed mb-3">
                    {persona.description}
                  </p>
                  <p className="text-cyan-400/40 font-share-tech text-xs italic">
                    {persona.quote}
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-cyan-400/20 flex items-center justify-between">
                <span className="text-cyan-400/50 font-share-tech text-xs tracking-wider">
                  [ INITIATE TRANSMISSION ]
                </span>
                <svg
                  className="w-5 h-5 text-cyan-400/50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </button>
          ))}
        </div>

        {/* Previous Sessions */}
        {sessions && sessions.length > 0 && (
          <div>
            <h2 className="hologram-text font-orbitron text-sm md:text-base font-bold tracking-wider mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
              TRANSMISSION LOGS
            </h2>
            <div className="space-y-2">
              {sessions.slice(0, 5).map((session: { _id: Id<"sessions">; persona: string; title: string; createdAt: number }) => (
                <div
                  key={session._id}
                  onClick={() => handleResumeSession(session._id)}
                  className="message-bubble rounded-lg p-4 cursor-pointer hover:bg-cyan-400/5 transition-colors flex items-center justify-between gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-cyan-400/70 font-orbitron text-xs md:text-sm">
                        {session.persona === "steve_jobs"
                          ? "STEVE JOBS"
                          : "JACK KIRBY"}
                      </span>
                      <span className="text-cyan-400/30 font-share-tech text-xs">
                        •
                      </span>
                      <span className="text-cyan-400/40 font-share-tech text-xs">
                        {new Date(session.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-cyan-200/50 font-share-tech text-xs truncate">
                      {session.title}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleDeleteSession(e, session._id)}
                      className="p-2 text-red-400/50 hover:text-red-400 transition-colors"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                    <svg
                      className="w-5 h-5 text-cyan-400/40"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
