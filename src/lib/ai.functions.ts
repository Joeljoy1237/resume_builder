import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3-flash-preview";

async function callAI(opts: {
  system: string;
  user: string;
  json?: boolean;
}): Promise<string> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("LOVABLE_API_KEY is not configured");
  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: opts.system },
        { role: "user", content: opts.user },
      ],
      ...(opts.json ? { response_format: { type: "json_object" } } : {}),
    }),
  });
  if (res.status === 429) throw new Error("Rate limit hit. Please try again in a moment.");
  if (res.status === 402) throw new Error("AI credits exhausted. Add credits in Settings → Workspace → Usage.");
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`AI error ${res.status}: ${t.slice(0, 200)}`);
  }
  const data = (await res.json()) as { choices: { message: { content: string } }[] };
  return data.choices?.[0]?.message?.content ?? "";
}

/* ── Improve / rewrite text ───────────────────────────────────────── */
export const improveText = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        text: z.string().min(1).max(4000),
        mode: z.enum(["summary", "bullet", "project", "achievement"]),
        context: z.string().max(500).optional(),
      })
      .parse(d)
  )
  .handler(async ({ data }) => {
    const guides: Record<string, string> = {
      summary:
        "Rewrite as a 2–3 sentence professional resume summary. Strong, confident, ATS-friendly. No first-person pronouns. Plain prose, no bullets, no markdown.",
      bullet:
        "Rewrite as 3–5 resume bullet points. Start each with a strong past-tense action verb. Quantify when possible. Return as plain lines separated by newlines, NO bullet characters, NO markdown.",
      project:
        "Rewrite as 2–3 resume bullet points describing this project. Action verbs, technical detail, impact. Return plain lines separated by newlines, no bullets.",
      achievement:
        "Rewrite as a single concise resume achievement line. Strong verb, quantified, ATS-friendly. No bullets, no markdown.",
    };
    const out = await callAI({
      system:
        "You are an expert resume writer optimizing for ATS systems. Output ONLY the rewritten content, no preamble, no markdown, no quotes.",
      user: `${guides[data.mode]}\n\n${data.context ? `Context: ${data.context}\n\n` : ""}Input:\n${data.text}`,
    });
    return { text: out.trim() };
  });

/* ── Suggest skills for a role ────────────────────────────────────── */
export const suggestSkills = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ role: z.string().min(1).max(200) }).parse(d))
  .handler(async ({ data }) => {
    const out = await callAI({
      system:
        'Return JSON: {"technical":[...10 items],"soft":[...6 items]}. Skills should be specific, industry-relevant, ATS-keyword friendly.',
      user: `Role: ${data.role}`,
      json: true,
    });
    try {
      const parsed = JSON.parse(out);
      return {
        technical: Array.isArray(parsed.technical) ? parsed.technical.slice(0, 12) : [],
        soft: Array.isArray(parsed.soft) ? parsed.soft.slice(0, 8) : [],
      };
    } catch {
      return { technical: [], soft: [] };
    }
  });

/* ── Extract structured resume from raw text ──────────────────────── */
export const extractResume = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ text: z.string().min(20).max(40000) }).parse(d))
  .handler(async ({ data }) => {
    const out = await callAI({
      system: `Extract resume information from text. Return strict JSON matching this schema:
{
  "fullName": string, "title": string, "email": string, "phone": string,
  "location": string, "linkedin": string, "github": string, "website": string,
  "summary": string,
  "skills": { "technical": string[], "soft": string[] },
  "experience": [{"company":string,"role":string,"location":string,"startDate":string,"endDate":string,"bullets":string[]}],
  "education": [{"school":string,"degree":string,"field":string,"startDate":string,"endDate":string,"details":string}],
  "projects": [{"name":string,"link":string,"description":string,"tech":string}],
  "certifications": string[], "achievements": string[], "languages": string[]
}
Use "" or [] for missing fields. Keep bullets verbatim if present.`,
      user: data.text,
      json: true,
    });
    try {
      return JSON.parse(out);
    } catch {
      return {};
    }
  });

/* ── Score resume ─────────────────────────────────────────────────── */
export const scoreResume = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({ resumeText: z.string().min(20).max(20000), jobDescription: z.string().max(8000).optional() }).parse(d)
  )
  .handler(async ({ data }) => {
    const out = await callAI({
      system: `Score a resume against ATS criteria. Return strict JSON:
{
  "ats": number 0-100,
  "readability": number 0-100,
  "keyword": number 0-100,
  "professionalism": number 0-100,
  "missingKeywords": string[],
  "suggestions": string[],
  "matchPercent": number 0-100
}
If no job description provided, set matchPercent to 0 and base keyword score on general best practices for the role implied by the resume.`,
      user: `RESUME:\n${data.resumeText}\n\n${data.jobDescription ? `JOB DESCRIPTION:\n${data.jobDescription}` : "No job description provided."}`,
      json: true,
    });
    try {
      const p = JSON.parse(out);
      return {
        ats: Number(p.ats) || 0,
        readability: Number(p.readability) || 0,
        keyword: Number(p.keyword) || 0,
        professionalism: Number(p.professionalism) || 0,
        missingKeywords: Array.isArray(p.missingKeywords) ? p.missingKeywords.slice(0, 20) : [],
        suggestions: Array.isArray(p.suggestions) ? p.suggestions.slice(0, 10) : [],
        matchPercent: Number(p.matchPercent) || 0,
      };
    } catch {
      return {
        ats: 0, readability: 0, keyword: 0, professionalism: 0,
        missingKeywords: [], suggestions: [], matchPercent: 0,
      };
    }
  });
