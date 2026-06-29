"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  FileDown,
  RotateCcw,
  Save,
  User,
  FileText,
  Wrench,
  Briefcase,
  FolderKanban,
  GraduationCap,
  Plus,
  LayoutTemplate,
  BarChart3,
  ChevronDown,
  Eye,
  PenLine,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { ScaledPreview } from "@/components/resume/scaled-preview";
import { ResumeForm } from "@/components/resume/resume-form";
import { TemplatePicker } from "@/components/resume/template-picker";
import { ScorePanel } from "@/components/resume/score-panel";
import { Progress } from "@/components/ui/progress";
import { useResumeStore } from "@/lib/resume-store";
import {
  getCurrentResumeId,
  getResumeById,
  saveCurrent,
  setCurrentResumeId,
} from "@/lib/resume-storage";
import { emptyResume } from "@/lib/resume-types";
import { exportResumePdf, exportResumeDocx } from "@/lib/pdf-export";
import { FadeIn, StaggerContainer } from "@/components/motion";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const SECTIONS = [
  { id: "personal", label: "Personal", icon: User },
  { id: "summary", label: "Summary", icon: FileText },
  { id: "skills", label: "Skills", icon: Wrench },
  { id: "experience", label: "Experience", icon: Briefcase },
  { id: "projects", label: "Projects", icon: FolderKanban },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "extras", label: "Extras", icon: Plus },
  { id: "templates", label: "Templates", icon: LayoutTemplate },
  { id: "score", label: "Score", icon: BarChart3 },
];

export default function Builder() {
  const { data, reset } = useResumeStore();
  const [activeSection, setActiveSection] = useState("personal");
  const [mobileView, setMobileView] = useState<"form" | "preview">("form");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const MIN_ZOOM = 0.25;
  const MAX_ZOOM = 3;

  const [zoom, setZoom] = useState(0.7);
  const [currentResumeName, setCurrentResumeName] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement>(null);

  const zoomStep = 0.1;

  useEffect(() => {
    const id = getCurrentResumeId();
    if (id) {
      const resume = getResumeById(id);
      setCurrentResumeName(resume?.name ?? null);
    } else {
      setCurrentResumeName(null);
    }
  }, []);

  const zoomOut = () => setZoom((z) => Math.max(MIN_ZOOM, Math.round((z - zoomStep) * 100) / 100));
  const zoomIn = () => setZoom((z) => Math.min(MAX_ZOOM, Math.round((z + zoomStep) * 100) / 100));

  const progress = useMemo(() => computeProgress(data), [data]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY + 180;
      for (let i = SECTIONS.length - 1; i >= 0; i--) {
        const el = document.getElementById(SECTIONS[i].id);
        if (el && el.offsetTop <= scrollY) {
          setActiveSection(SECTIONS[i].id);
          break;
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (JSON.stringify(data) === JSON.stringify(emptyResume)) return;

    const timer = setTimeout(() => {
      const id = saveCurrent(data, data.fullName || "Untitled resume");
      const saved = getResumeById(id);
      setCurrentResumeName(saved?.name ?? null);
    }, 1000);

    return () => clearTimeout(timer);
  }, [data]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setActiveSection(id);
      setMobileNavOpen(false);
      setMobileView("form");
    }
  };

  const downloadPdf = () => {
    try {
      exportResumePdf(data, `${data.fullName || "resume"}.pdf`);
      toast.success("PDF downloaded");
    } catch {
      toast.error("Export failed");
    }
  };

  const downloadDocx = async () => {
    try {
      await exportResumeDocx(data, `${data.fullName || "resume"}.docx`);
      toast.success("DOCX downloaded");
    } catch {
      toast.error("Export failed");
    }
  };

  const handleSave = () => {
    const id = saveCurrent(data, data.fullName || "Untitled resume");
    const saved = getResumeById(id);
    setCurrentResumeName(saved?.name ?? null);
    toast.success(currentResumeName ? "Resume saved" : "Resume created");
  };

  return (
    <div className="min-h-screen bg-background pt-14">

      <ConfirmModal
        open={resetDialogOpen}
        onOpenChange={setResetDialogOpen}
        title="Reset all fields?"
        description="This will clear everything you've entered and cannot be undone."
        confirmText="Reset"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={() => reset()}
      />

      {/* Toolbar */}
      <div className="border-b border-border bg-background sticky top-14 z-20 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-2 motion-safe:duration-500">
        <div className="mx-auto max-w-[1600px] px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="hidden sm:flex flex-col leading-none">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Editing
              </span>
              <span className="font-medium text-sm truncate max-w-[200px]">
                {currentResumeName || data.fullName || "Untitled resume"}
              </span>
            </div>
            <div className="h-6 w-px bg-border hidden sm:block" />
            <div className="flex items-center gap-2 min-w-0">
              <Progress value={progress} className="w-20 sm:w-28 h-2" />
              <span className="text-xs text-muted-foreground whitespace-nowrap">{progress}%</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setResetDialogOpen(true)}
              className="gap-1.5 hidden sm:inline-flex cursor-pointer transition-colors duration-200"
            >
              <RotateCcw className="size-3.5" />
              Reset
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSave}
              className="gap-1.5 hidden sm:inline-flex cursor-pointer transition-colors duration-200"
            >
              <Save className="size-3.5" />
              Save
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={downloadDocx}
              className="gap-1.5 cursor-pointer transition-all duration-200"
            >
              <FileDown className="size-3.5" />
              <span className="hidden sm:inline">DOCX</span>
            </Button>
            <Button
              size="sm"
              onClick={downloadPdf}
              className="gap-1.5 cursor-pointer transition-all duration-200"
            >
              <FileDown className="size-3.5" />
              <span className="hidden sm:inline">PDF</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile view toggle */}
      <div className="lg:hidden border-b border-border flex sticky top-[7rem] z-10 bg-background motion-safe:animate-in motion-safe:fade-in motion-safe:duration-300">
        <button
          type="button"
          onClick={() => setMobileView("form")}
          className={cn(
            "flex-1 py-2.5 text-xs uppercase tracking-wider transition-colors duration-200 cursor-pointer flex items-center justify-center gap-1.5",
            mobileView === "form"
              ? "bg-secondary font-medium text-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
          )}
        >
          <PenLine className="size-3.5" /> Edit
        </button>
        <button
          type="button"
          onClick={() => setMobileView("preview")}
          className={cn(
            "flex-1 py-2.5 text-xs uppercase tracking-wider transition-colors duration-200 cursor-pointer flex items-center justify-center gap-1.5",
            mobileView === "preview"
              ? "bg-secondary font-medium text-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
          )}
        >
          <Eye className="size-3.5" /> Preview
        </button>
      </div>

      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 py-6 lg:py-8">
        <div className="grid lg:grid-cols-[200px_1fr_480px] xl:grid-cols-[220px_1fr_600px] gap-6 lg:gap-8">
          {/* Sidebar nav */}
          <aside className="hidden lg:block">
            <div className="sticky top-[8.5rem] space-y-6">
              <nav className="space-y-1">
                <StaggerContainer stagger={100}>
                  {SECTIONS.map((s) => {
                    const Icon = s.icon;
                    const active = activeSection === s.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => scrollTo(s.id)}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                          active
                            ? "bg-secondary font-medium text-foreground"
                            : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
                        )}
                      >
                        <span className="flex items-center gap-2.5">
                          <Icon className="size-4" />
                          {s.label}
                        </span>
                        {isSectionCompleted(s.id, data) && (
                          <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </StaggerContainer>
              </nav>

              <div className="rounded-lg border border-border p-4 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Profile completion</span>
                  <span className="font-medium">{progress}%</span>
                </div>
                <Progress value={progress} className="h-1.5" />
                <p className="text-[11px] text-muted-foreground leading-snug">
                  Fill in each section to improve your ATS score.
                </p>
              </div>
            </div>
          </aside>

          {/* Mobile nav dropdown */}
          <div className="lg:hidden col-span-1">
            <div className="relative">
              <button
                type="button"
                onClick={() => setMobileNavOpen((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-md border border-border bg-card text-sm cursor-pointer transition-colors duration-200 hover:bg-secondary/50"
              >
                <span className="flex items-center gap-2">
                  {(() => {
                    const s = SECTIONS.find((x) => x.id === activeSection);
                    const Icon = s?.icon ?? User;
                    return <Icon className="size-4 text-muted-foreground" />;
                  })()}
                  {SECTIONS.find((s) => s.id === activeSection)?.label}
                  {isSectionCompleted(activeSection, data) && (
                    <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0 inline-block ml-1" />
                  )}
                </span>
                <ChevronDown
                  className={cn(
                    "size-4 text-muted-foreground transition-transform duration-200",
                    mobileNavOpen && "rotate-180",
                  )}
                />
              </button>
              {mobileNavOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 rounded-md border border-border bg-card shadow-sm z-30 py-1">
                  {SECTIONS.map((s) => {
                    const Icon = s.icon;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => scrollTo(s.id)}
                        className={cn(
                          "w-full flex items-center justify-between px-4 py-2 text-sm transition-colors duration-200 cursor-pointer",
                          activeSection === s.id
                            ? "bg-secondary font-medium text-foreground"
                            : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
                        )}
                      >
                        <span className="flex items-center gap-2.5">
                          <Icon className="size-4" />
                          {s.label}
                        </span>
                        {isSectionCompleted(s.id, data) && (
                          <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Form area */}
          <main
            ref={formRef}
            className={cn(
              "min-w-0 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 motion-safe:duration-500 motion-safe:delay-100",
              mobileView === "form" ? "block" : "hidden lg:block",
            )}
          >
            <ResumeForm />

            <section
              id="templates"
              className="scroll-mt-[10rem] mt-10 pt-10 border-t border-border"
            >
              <div className="mb-5">
                <h3 className="font-display text-2xl tracking-tight flex items-center gap-2">
                  <LayoutTemplate className="size-5" />
                  Choose a template
                </h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  All templates are single-column and ATS-safe.
                </p>
              </div>
              <TemplatePicker
                value={data.template}
                onChange={(t) => useResumeStore.getState().setTemplate(t)}
              />
            </section>

            <section id="score" className="scroll-mt-[10rem] mt-10 pt-10 border-t border-border">
              <ScorePanel />
            </section>
          </main>

          {/* Preview */}
          <aside className={cn("min-w-0", mobileView === "preview" ? "block" : "hidden lg:block")}>
            <div className="lg:sticky lg:top-[8.5rem]">
              <div className="rounded-lg border border-border bg-card p-4 shadow-sm transition-all duration-200 hover:shadow-md motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-3 motion-safe:duration-500 motion-safe:delay-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-sm flex items-center gap-2">
                    <Eye className="size-4 text-muted-foreground" />
                    Live preview
                  </h3>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={zoomOut}
                      disabled={zoom <= MIN_ZOOM}
                      className="inline-flex items-center justify-center size-7 rounded-md border border-border bg-background text-sm hover:bg-secondary transition-colors duration-200 disabled:opacity-40 cursor-pointer"
                      aria-label="Zoom out"
                    >
                      −
                    </button>
                    <span className="text-xs font-medium w-10 text-center">
                      {Math.round(zoom * 100)}%
                    </span>
                    <button
                      type="button"
                      onClick={zoomIn}
                      disabled={zoom >= MAX_ZOOM}
                      className="inline-flex items-center justify-center size-7 rounded-md border border-border bg-background text-sm hover:bg-secondary transition-colors duration-200 disabled:opacity-40 cursor-pointer"
                      aria-label="Zoom in"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="bg-secondary/30 rounded-md p-2 pb-4 -mx-1 max-h-[calc(100vh-12rem)] overflow-auto">
                  <ScaledPreview data={data} scale={zoom} />
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
function isSectionCompleted(sectionId: string, data: ReturnType<typeof useResumeStore.getState>["data"]): boolean {
  switch (sectionId) {
    case "personal":
      return !!(
        data.fullName?.trim() &&
        data.title?.trim() &&
        data.email?.trim() &&
        data.phone?.trim() &&
        data.location?.trim()
      );
    case "summary":
      return !!data.summary?.trim();
    case "skills":
      return Array.isArray(data.skills?.technical) && data.skills.technical.length > 0;
    case "experience":
      return (
        Array.isArray(data.experience) &&
        data.experience.length > 0 &&
        data.experience.every(
          (e) =>
            e.role?.trim() &&
            e.company?.trim() &&
            e.startDate?.trim() &&
            e.endDate?.trim() &&
            Array.isArray(e.bullets) &&
            e.bullets.length > 0 &&
            e.bullets.some((b) => b.trim() !== "")
        )
      );
    case "projects":
      return (
        Array.isArray(data.projects) &&
        data.projects.length > 0 &&
        data.projects.every((p) => p.name?.trim() && p.description?.trim())
      );
    case "education":
      return (
        Array.isArray(data.education) &&
        data.education.length > 0 &&
        data.education.every(
          (e) =>
            e.school?.trim() &&
            e.degree?.trim() &&
            e.startDate?.trim() &&
            e.endDate?.trim()
        )
      );
    case "extras":
      return (
        (Array.isArray(data.certifications) && data.certifications.length > 0) ||
        (Array.isArray(data.achievements) && data.achievements.length > 0) ||
        (Array.isArray(data.languages) && data.languages.length > 0)
      );
    default:
      return false;
  }
}

function computeProgress(data: ReturnType<typeof useResumeStore.getState>["data"]): number {
  let filled = 0;
  let total = 0;

  const check = (isFilled: boolean) => {
    total++;
    if (isFilled) filled++;
  };

  // Personal Info
  check(!!data.fullName?.trim());
  check(!!data.title?.trim());
  check(!!data.email?.trim());
  check(!!data.phone?.trim());
  check(!!data.location?.trim());

  // Summary
  check(!!data.summary?.trim());

  // Skills
  check(Array.isArray(data.skills?.technical) && data.skills.technical.length > 0);

  // Experience
  check(Array.isArray(data.experience) && data.experience.length > 0);
  if (Array.isArray(data.experience)) {
    data.experience.forEach((e) => {
      check(!!e.role?.trim());
      check(!!e.company?.trim());
      check(!!e.startDate?.trim());
      check(!!e.endDate?.trim());
      check(Array.isArray(e.bullets) && e.bullets.length > 0 && e.bullets.some((b) => b.trim() !== ""));
    });
  }

  // Projects
  check(Array.isArray(data.projects) && data.projects.length > 0);
  if (Array.isArray(data.projects)) {
    data.projects.forEach((p) => {
      check(!!p.name?.trim());
      check(!!p.description?.trim());
    });
  }

  // Education
  check(Array.isArray(data.education) && data.education.length > 0);
  if (Array.isArray(data.education)) {
    data.education.forEach((edu) => {
      check(!!edu.school?.trim());
      check(!!edu.degree?.trim());
      check(!!edu.startDate?.trim());
      check(!!edu.endDate?.trim());
    });
  }

  if (total === 0) return 0;
  return Math.round((filled / total) * 100);
}
