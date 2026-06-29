"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Upload, Loader2, FileText, CheckCircle2, FileUp, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FadeIn, StaggerContainer } from "@/components/motion";
import { extractTextFromFile } from "@/lib/parse-resume";
import { extractResume } from "@/lib/ai.functions";
import { useResumeStore } from "@/lib/resume-store";
import { uid } from "@/lib/utils";
import { createResume, setCurrentResumeId } from "@/lib/resume-storage";
import { emptyResume, type ResumeData } from "@/lib/resume-types";

type ParsedResume = Partial<ResumeData>;

export default function UploadPage() {
  const router = useRouter();
  const [dragging, setDragging] = useState(false);
  const [phase, setPhase] = useState<"idle" | "reading" | "parsing">("idle");

  const handleFile = useCallback(
    async (file: File) => {
      if (file.size > 10 * 1024 * 1024) return toast.error("File too large (max 10MB).");
      try {
        setPhase("reading");
        const text = await extractTextFromFile(file);
        if (text.length < 30)
          throw new Error("Couldn't extract enough text. Try a different file.");
        setPhase("parsing");
        const parsed = (await extractResume({
          text: text.slice(0, 40000),
        })) as ParsedResume;
        const resumeData = {
          ...emptyResume,
          template: "professional" as const,
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
          experience: (parsed.experience ?? []).map((e) => ({
            id: uid(),
            company: String(e.company ?? ""),
            role: String(e.role ?? ""),
            location: String(e.location ?? ""),
            startDate: String(e.startDate ?? ""),
            endDate: String(e.endDate ?? ""),
            bullets: Array.isArray(e.bullets) ? e.bullets.map(String) : [],
          })),
          education: (parsed.education ?? []).map((e) => ({
            id: uid(),
            school: String(e.school ?? ""),
            degree: String(e.degree ?? ""),
            field: String(e.field ?? ""),
            startDate: String(e.startDate ?? ""),
            endDate: String(e.endDate ?? ""),
            details: String(e.details ?? ""),
          })),
          projects: (parsed.projects ?? []).map((p) => ({
            id: uid(),
            name: String(p.name ?? ""),
            link: String(p.link ?? ""),
            description: String(p.description ?? ""),
            tech: String(p.tech ?? ""),
          })),
          certifications: parsed.certifications ?? [],
          achievements: parsed.achievements ?? [],
          languages: parsed.languages ?? [],
        };

        const name =
          resumeData.fullName.trim() || file.name.replace(/\.[^/.]+$/, "") || "Imported resume";
        const saved = createResume(name, resumeData);
        useResumeStore.getState().replace(resumeData);
        setCurrentResumeId(saved.id);

        toast.success("Resume imported and saved to your resumes.");
        router.push("/builder");
      } catch (e) {
        console.error("[upload] failed:", e);
        toast.error(e instanceof Error ? e.message : "Upload failed");
        setPhase("idle");
      }
    },
    [router],
  );

  const isBusy = phase !== "idle";

  return (
    <div className="min-h-screen bg-background">
      <main className="mx-auto max-w-3xl px-4 sm:px-6 pt-20 sm:pt-24 pb-16 sm:pb-24">
        <FadeIn>
          <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Step 01 · Import
          </div>
          <h1 className="font-display text-4xl sm:text-5xl mt-3">Upload your resume.</h1>
          <p className="mt-3 text-muted-foreground leading-relaxed">
            PDF or DOCX. AI extracts every section and drops you into the editor.
          </p>
        </FadeIn>

        <FadeIn delay={100}>
          <label
            htmlFor="resume-upload"
            onDragEnter={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              const f = e.dataTransfer.files?.[0];
              if (f) handleFile(f);
            }}
            className={`
              mt-8 sm:mt-10 block cursor-pointer rounded-md border-2 border-dashed p-10 sm:p-16 text-center
              transition-all duration-200
              focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background
              ${
                dragging
                  ? "border-foreground bg-secondary scale-[1.01]"
                  : "border-border hover:border-foreground/60 hover:bg-secondary/30"
              }
              ${isBusy ? "pointer-events-none opacity-70" : ""}
            `}
          >
            <input
              id="resume-upload"
              type="file"
              accept=".pdf,.docx,.txt"
              className="sr-only"
              disabled={isBusy}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
            <div className="transition-all duration-200">
              {phase === "idle" && (
                <>
                  <div className="mx-auto size-14 rounded-full bg-secondary grid place-items-center transition-colors duration-200 group-hover:bg-secondary/80">
                    <FileUp className="size-6" />
                  </div>
                  <div className="mt-4 font-medium text-base">Drop your resume here</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    or click to browse · PDF, DOCX up to 10MB
                  </div>
                </>
              )}
              {phase === "reading" && (
                <Status
                  icon={<FileText className="size-5" />}
                  title="Reading file…"
                  sub="Extracting text from your document."
                />
              )}
              {phase === "parsing" && (
                <Status
                  icon={<Loader2 className="size-5 animate-spin" />}
                  title="AI is structuring your resume…"
                  sub="Identifying sections, dates, and skills."
                />
              )}
            </div>
          </label>
        </FadeIn>

        <StaggerContainer stagger={100} className="mt-6 sm:mt-8 grid sm:grid-cols-3 gap-3 text-sm">
          <Bullet>Auto-fills every section</Bullet>
          <Bullet>Keeps formatting clean</Bullet>
          <Bullet>Highlights missing fields</Bullet>
        </StaggerContainer>

        <FadeIn delay={300}>
          <div className="mt-10 sm:mt-12 text-sm text-muted-foreground">
            Prefer to start fresh?{" "}
            <Button variant="link" className="p-0 h-auto cursor-pointer" asChild>
              <Link href="/builder">Create a new resume →</Link>
            </Button>
          </div>
        </FadeIn>

        <FadeIn delay={400}>
          <div className="mt-8 rounded-md border border-border bg-secondary/30 p-4 flex items-start gap-3 text-sm text-muted-foreground">
            <AlertCircle className="size-4 mt-0.5 shrink-0" />
            <p>
              Your file is processed locally where possible. We never store your resume on our
              servers unless you explicitly save it.
            </p>
          </div>
        </FadeIn>
      </main>
    </div>
  );
}

function Status({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <>
      <div className="mx-auto size-14 rounded-full bg-secondary grid place-items-center">
        {icon}
      </div>
      <div className="mt-4 font-medium text-base">{title}</div>
      <div className="text-sm text-muted-foreground mt-1">{sub}</div>
    </>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <CheckCircle2 className="size-4 text-foreground" />
      {children}
    </div>
  );
}
