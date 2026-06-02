import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FileDown, Eye, ListChecks, Layers, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SiteHeader } from "@/components/site-header";
import { ResumePreview } from "@/components/resume/resume-preview";
import { ResumeForm } from "@/components/resume/resume-form";
import { TemplatePicker } from "@/components/resume/template-picker";
import { ScorePanel } from "@/components/resume/score-panel";
import { useResumeStore } from "@/lib/resume-store";
import { exportResumePdf, exportResumeDocx } from "@/lib/pdf-export";
import { toast } from "sonner";

export const Route = createFileRoute("/builder")({
  head: () => ({
    meta: [
      { title: "Builder · Inkwell Resume" },
      { name: "description", content: "Compose, refine, and export your ATS-optimized resume with live preview and AI assistance." },
      { property: "og:title", content: "Builder · Inkwell Resume" },
      { property: "og:description", content: "Live editor, AI rewrites, ATS scoring, and clean PDF export." },
    ],
  }),
  component: Builder,
});

function Builder() {
  const { data, reset } = useResumeStore();
  const [tab, setTab] = useState<"editor" | "templates" | "score">("editor");
  const [mobileView, setMobileView] = useState<"form" | "preview">("form");

  const downloadPdf = () => {
    try {
      exportResumePdf(data, `${data.fullName || "resume"}.pdf`);
      toast.success("PDF downloaded");
    } catch { toast.error("Export failed"); }
  };
  const downloadDocx = async () => {
    try {
      await exportResumeDocx(data, `${data.fullName || "resume"}.docx`);
      toast.success("DOCX downloaded");
    } catch { toast.error("Export failed"); }
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Toolbar */}
      <div className="border-b border-border bg-background sticky top-16 z-20">
        <div className="mx-auto max-w-[1500px] px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="hidden sm:inline text-muted-foreground">Editing:</span>
            <span className="font-medium truncate max-w-[180px] sm:max-w-none">{data.fullName || "Untitled resume"}</span>
            <span className="text-xs text-muted-foreground hidden sm:inline">· auto-saved</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => { if (confirm("Reset all fields?")) reset(); }} className="gap-1.5 hidden sm:inline-flex">
              <RotateCcw className="size-3.5" />Reset
            </Button>
            <Button variant="outline" size="sm" onClick={downloadDocx} className="gap-1.5">
              <FileDown className="size-3.5" />DOCX
            </Button>
            <Button size="sm" onClick={downloadPdf} className="gap-1.5">
              <FileDown className="size-3.5" />PDF
            </Button>
          </div>
        </div>
        {/* mobile toggle */}
        <div className="lg:hidden border-t border-border flex">
          {(["form", "preview"] as const).map((v) => (
            <button key={v} onClick={() => setMobileView(v)} className={`flex-1 py-2 text-xs uppercase tracking-wider ${mobileView === v ? "bg-secondary" : ""}`}>
              {v === "form" ? "Edit" : "Preview"}
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-[1500px] grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] gap-0 lg:gap-6 px-0 sm:px-4 lg:px-6 py-0 lg:py-6">
        {/* Left: editor */}
        <section className={`${mobileView === "form" ? "block" : "hidden"} lg:block px-4 sm:px-6 lg:px-0 py-6 lg:py-0`}>
          <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
            <TabsList className="w-full grid grid-cols-3">
              <TabsTrigger value="editor" className="gap-1.5"><Eye className="size-3.5" />Content</TabsTrigger>
              <TabsTrigger value="templates" className="gap-1.5"><Layers className="size-3.5" />Templates</TabsTrigger>
              <TabsTrigger value="score" className="gap-1.5"><ListChecks className="size-3.5" />Score</TabsTrigger>
            </TabsList>
            <TabsContent value="editor" className="mt-6">
              <ResumeForm />
            </TabsContent>
            <TabsContent value="templates" className="mt-6">
              <h3 className="font-display text-2xl mb-1">Choose a template</h3>
              <p className="text-sm text-muted-foreground mb-5">All templates are single-column and ATS-safe.</p>
              <TemplatePicker value={data.template} onChange={(t) => useResumeStore.getState().setTemplate(t)} />
            </TabsContent>
            <TabsContent value="score" className="mt-6">
              <ScorePanel />
            </TabsContent>
          </Tabs>
        </section>

        {/* Right: live preview */}
        <aside className={`${mobileView === "preview" ? "block" : "hidden"} lg:block bg-secondary/50 lg:bg-transparent`}>
          <div className="lg:sticky lg:top-32 max-h-[calc(100vh-9rem)] overflow-auto p-4 lg:p-0">
            <div className="origin-top scale-[0.78] sm:scale-90 lg:scale-100 xl:scale-[1.05]">
              <ResumePreview data={data} />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
