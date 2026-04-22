import { action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

// Persona system prompts for authentic responses
const PERSONA_PROMPTS: Record<string, string> = {
  steve_jobs: `You are a holographic projection of Steve Jobs, the legendary co-founder of Apple.
You embody his passion for design, innovation, and "making a dent in the universe."
Speak with his characteristic intensity, vision, and occasional brutally honest feedback.
Reference your work at Apple, NeXT, Pixar. Talk about design philosophy, simplicity, connecting the dots looking backwards.
Use phrases like "insanely great", "one more thing", "think different".
Be inspiring but also challenging - push people to do their best work.
Keep responses conversational and engaging, 2-3 paragraphs max unless diving deep into a topic.`,

  jack_kirby: `You are a holographic projection of Jack Kirby, the King of Comics.
You co-created Captain America, the Fantastic Four, X-Men, New Gods, and countless other legendary characters.
Speak with the passion of a true artist and storyteller. You believe in BIG IDEAS - cosmic scale, mythic themes.
Reference your work - the Fourth World, Galactus, the Eternals, your time at Marvel and DC.
Talk about visual storytelling, the power of imagination, and standing up for creators' rights.
Use dramatic language befitting a cosmic storyteller. Be encouraging to aspiring creators.
Keep responses engaging and vivid, 2-3 paragraphs max unless telling a story.`,
};

// Firecrawl scraping action for knowledge enhancement
export const scrapeKnowledge = action({
  args: {
    persona: v.string(),
    topic: v.string(),
  },
  handler: async (ctx, args): Promise<string | null> => {
    const apiKey = process.env.FIRECRAWL_API_KEY;
    if (!apiKey) {
      console.log("Firecrawl API key not configured, skipping scrape");
      return null;
    }

    const searchQueries: Record<string, string> = {
      steve_jobs: `Steve Jobs ${args.topic} Apple innovation design`,
      jack_kirby: `Jack Kirby ${args.topic} comics Marvel DC Fourth World`,
    };

    const searchQuery = searchQueries[args.persona] || args.topic;

    try {
      // Use Firecrawl search to find relevant content
      const response = await fetch("https://api.firecrawl.dev/v1/search", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: searchQuery,
          limit: 3,
          scrapeOptions: {
            formats: ["markdown"],
            onlyMainContent: true,
          },
        }),
      });

      if (!response.ok) {
        console.error("Firecrawl search failed:", response.status);
        return null;
      }

      const data = await response.json();

      if (data.data && data.data.length > 0) {
        // Combine content from search results
        const combinedContent = data.data
          .slice(0, 3)
          .map((result: { markdown?: string; title?: string }) => result.markdown || result.title || "")
          .join("\n\n---\n\n")
          .slice(0, 4000); // Limit content size

        return combinedContent;
      }

      return null;
    } catch (error) {
      console.error("Firecrawl error:", error);
      return null;
    }
  },
});

// Main chat action combining Firecrawl + Grok
export const chat = action({
  args: {
    sessionId: v.id("sessions"),
    userMessage: v.string(),
    persona: v.string(),
    conversationHistory: v.array(v.object({
      role: v.string(),
      content: v.string(),
    })),
  },
  handler: async (ctx, args): Promise<string> => {
    // Save user message
    await ctx.runMutation(api.messages.send, {
      sessionId: args.sessionId,
      content: args.userMessage,
      role: "user",
    });

    // Try to scrape relevant knowledge for context
    let scrapedContext = "";
    try {
      const knowledge = await ctx.runAction(api.hologram.scrapeKnowledge, {
        persona: args.persona,
        topic: args.userMessage,
      });
      if (knowledge) {
        scrapedContext = `\n\n[KNOWLEDGE CONTEXT from web research:\n${knowledge}\n]`;
      }
    } catch (e) {
      console.log("Scraping skipped:", e);
    }

    // Build conversation for Grok
    const systemPrompt = PERSONA_PROMPTS[args.persona] || PERSONA_PROMPTS.steve_jobs;
    const enhancedSystemPrompt = systemPrompt + scrapedContext;

    const messages = [
      ...args.conversationHistory.map(m => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user" as const, content: args.userMessage },
    ];

    // Call Grok via the pre-built chat action
    const response = await ctx.runAction(api.ai.chat, {
      messages,
      systemPrompt: enhancedSystemPrompt,
    });

    // Save assistant response
    await ctx.runMutation(api.messages.send, {
      sessionId: args.sessionId,
      content: response,
      role: "assistant",
    });

    return response;
  },
});
