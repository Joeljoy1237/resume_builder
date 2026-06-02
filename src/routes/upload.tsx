import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Upload, Loader2, FileText, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { extractTextFromFile } from "@/lib/parse-resume";
import { extractResume } from "@/lib/ai.functions";
import { useResumeStore } from "@/lib/resume-store";
import { emptyResume } from "@/lib/resume-types";

export const Route = createFileRoute("/upload")({
  head: () => ({
    meta: [
      { title: "Upload Resume · Inkwell" },
      { name: "description", content: "Upload your existing PDF or DOCX resume. AI will extract, structure, and optimize it." },
      { property: "og:title", content: "Upload Resume · Inkwell" },
      { property: "og:description", content: "AI-powered resume parsing — drop a file and start optimizing." },
    ],
  }),
  component: UploadPage,
});

function UploadPage() {
  const navigate = useNavigate();
  const extract = useServerFn(extractResume);
  const replace = useResumeStore((s) => s.replace);
  const [dragging, setDragging] = useState(false);
  const [phase, setPhase] = useState<"idle" | "reading" | "parsing">("idle");

  const handleFile = useCallback(async (file: File) => {
    if (file.size > 10 * 1024 * 1024) return toast.error("File too large (max 10MB).");
    try {
      setPhase("reading");
      const text = await extractTextFromFile(file);
      if (text.length < 30) throw new Error("Couldn't extract enough text. Try a different file.");
      setPhase("parsing");
      const parsed = await extract({ data: { text: text.slice(0, 40000) } });
      const uid = () => Math.random().toString(36).slice(2, 10);
      replace({
        ...emptyResume,
        template: "professional",
        fullName: parsed.fullName ?? "",
        title: parsed.title ?? "",
        email: parsed.email ?? "",
        phone: parsed.phone ?? "",
        location: parsed.location ?? "",
        linkedin: parsed.linkedin ?? "",
        github: parsed.github ?? "",
        website: parsed.website ?? "",
        summary: parsed.summary ?? "",
        skills: {
          technical: parsed.skills?.technical ?? [],
          soft: parsed.skills?.soft ?? [],
        },
        experience: (parsed.experience ?? []).map((e: Record<string, unknown>) => ({
          id: uid(),
          company: String(e.company ?? ""),
          role: String(e.role ?? ""),
          location: String(e.location ?? ""),
          startDate: String(e.startDate ?? ""),
          endDate: String(e.endDate ?? ""),
          bullets: Array.isArray(e.bullets) ? (e.bullets as string[]) : [],
        })),
        education: (parsed.education ?? []).map((e: Record<string, unknown>) => ({
          id: uid(),
          school: String(e.school ?? ""),
          degree: String(e.degree ?? ""),
          field: String(e.field ?? ""),
          startDate: String(e.startDate ?? ""),
          endDate: String(e.endDate ?? ""),
          details: String(e.details ?? ""),
        })),
        projects: (parsed.projects ?? []).map((p: Record<string, unknown>) => ({
          id: uid(),
          name: String(p.name ?? ""),
          link: String(p.link ?? ""),
          description: String(p.description ?? ""),
          tech: String(p.tech ?? ""),
        })),
        certifications: parsed.certifications ?? [],
        achievements: parsed.achievements ?? [],
        languages: parsed.languages ?? [],
      });
      toast.success("Resume imported. Review and refine.");
      navigate({ to: "/builder" });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
      setPhase("idle");
    }
  }, [extract, replace, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-16">
        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Step 01 · Import</div>
        <h1 className="font-display text-5xl mt-3">Upload your resume.</h1>
        <p className="mt-3 text-muted-foreground">PDF or DOCX. AI extracts every section and drops you into the editor.</p>

        <label
          onDragEnter={(e) => { e.preventDefault(); setDragging(true); }}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault(); setDragging(false);
            const f = e.dataTransfer.files?.[0]; if (f) handleFile(f);
          }}
          className={`mt-10 block cursor-pointer border-2 border-dashed rounded-md p-16 text-center transition ${
            dragging ? "border-foreground bg-secondary" : "border-border hover:border-foreground/60"
          } ${phase !== "idle" ? "pointer-events-none opacity-80" : ""}`}
        >
          <input
            type="file"
            accept=".pdf,.docx,.txt"
            className="sr-only"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />
          {phase === "idle" && (
            <>
              <div className="mx-auto size-12 rounded-full bg-secondary grid place-items-center"><Upload className="size-5" /></div>
              <div className="mt-4 font-medium">Drop your resume here</div>
              <div className="text-sm text-muted-foreground">or click to browse · PDF, DOCX up to 10MB</div>
            </>
          )}
          {phase === "reading" && (
            <Status icon={<FileText className="size-5" />} title="Reading file…" sub="Extracting text from your document." />
          )}
          {phase === "parsing" && (
            <Status icon={<Loader2 className="size-5 animate-spin" />} title="AI is structuring your resume…" sub="Identifying sections, dates, and skills." />
          )}
        </label>

        <div className="mt-8 grid sm:grid-cols-3 gap-3 text-sm">
          <Bullet>Auto-fills every section</Bullet>
          <Bullet>Keeps formatting clean</Bullet>
          <Bullet>Highlights missing fields</Bullet>
        </div>

        <div className="mt-12 text-sm text-muted-foreground">
          Prefer to start fresh?{" "}
          <Button variant="link" className="p-0 h-auto" onClick={() => navigate({ to: "/builder" })}>Create a new resume →</Button>
        </div>
      </main>
    </div>
  );
}

function Status({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <>
      <div className="mx-auto size-12 rounded-full bg-secondary grid place-items-center">{icon}</div>
      <div className="mt-4 font-medium">{title}</div>
      <div className="text-sm text-muted-foreground">{sub}</div>
    </>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <CheckCircle2 className="size-4 text-foreground" />{children}
    </div>
  );
}
