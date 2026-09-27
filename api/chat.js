import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT } from "../lib/knowledge.js";

const client = process.env.ANTHROPIC_API_KEY ? new Anthropic() : null;

const MAX_TURNS = 16;
const MAX_CHARS = 1200;
const RATE_LIMIT = 30;
const RATE_WINDOW_MS = 10 * 60 * 1000;
// Best-effort per-instance limiter; Vercel may run several instances, so this caps abuse rather than guaranteeing a quota.
const hits = new Map();

function rateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > RATE_LIMIT;
}

function cleanHistory(raw) {
  if (!Array.isArray(raw)) return null;
  const msgs = raw
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string" && m.content.trim())
    .slice(-MAX_TURNS)
    .map((m) => ({ role: m.role, content: m.content.trim().slice(0, MAX_CHARS) }));
  while (msgs.length && msgs[0].role !== "user") msgs.shift();
  if (!msgs.length || msgs[msgs.length - 1].role !== "user") return null;
  return msgs;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "method_not_allowed" });
  }
  if (!client) return res.status(503).json({ error: "not_configured" });

  const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "unknown";
  if (rateLimited(ip)) return res.status(429).json({ error: "rate_limited" });

  const messages = cleanHistory(req.body && req.body.messages);
  if (!messages) return res.status(400).json({ error: "bad_request" });

  try {
    const response = await client.beta.messages.create({
      model: "claude-opus-5",
      max_tokens: 2048,
      system: [{ type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } }],
      messages,
      output_config: { effort: "low" },
      fallbacks: "default",
      betas: ["server-side-fallback-2026-07-01"],
    });

    if (response.stop_reason === "refusal") {
      return res.status(200).json({
        reply: "I can't help with that one, but I'm happy to answer questions about Ayush's experience, projects or how to reach him.",
      });
    }

    const reply = response.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("")
      .trim();
    if (!reply) return res.status(502).json({ error: "empty_reply" });
    return res.status(200).json({ reply });
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) return res.status(429).json({ error: "upstream_busy" });
    if (err instanceof Anthropic.AuthenticationError) {
      console.error("Anthropic auth failed - check ANTHROPIC_API_KEY");
      return res.status(503).json({ error: "not_configured" });
    }
    if (err instanceof Anthropic.APIError) {
      console.error("Anthropic API error", err.status, err.message);
      return res.status(502).json({ error: "upstream_error" });
    }
    console.error("Chat handler failed", err);
    return res.status(500).json({ error: "server_error" });
  }
}
