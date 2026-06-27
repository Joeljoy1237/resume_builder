import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight,
  Upload,
  FileText,
  Sparkles,
  Gauge,
  FileDown,
  ShieldCheck,
  FilePlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";

// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: "Inkwell — AI ATS Resume Builder",
  description:
    "Build, optimize, and export ATS-friendly resumes with AI. Upload your existing resume or start from a clean template.",
  openGraph: {
    title: "Inkwell — AI ATS Resume Builder",
    description: "Build, optimize, and export ATS-friendly resumes with AI.",
  },
};

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      {/* Hero */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-16 sm:pt-24 pb-16 sm:pb-20 grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
          <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-700">
            <div className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-5 px-3 py-1.5 rounded-md border border-border bg-secondary/50">
              <Sparkles className="size-3" />
              An editorial resume studio · No. 01
            </div>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl leading-[0.95] tracking-tight">
              Write resumes that
              <br />
              <em className="italic">machines and humans</em> actually read.
            </h1>
            <p className="mt-5 text-base sm:text-lg text-muted-foreground max-w-lg leading-relaxed">
              Inkwell parses, polishes, and scores your resume against ATS criteria — with AI that
              knows the difference between &quot;team player&quot; and a quantified win.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row flex-wrap gap-3">
              <Button
                asChild
                className="h-11 px-5 gap-2 transition-all duration-200 cursor-pointer"
              >
                <Link href="/builder">
                  <FilePlus className="size-4" />
                  Create new resume
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-11 px-5 gap-2 transition-all duration-200 cursor-pointer"
              >
                <Link href="/upload">
                  <Upload className="size-4" />
                  Upload existing
                </Link>
              </Button>
            </div>
            <div className="mt-6 flex flex-wrap gap-4 sm:gap-6 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="size-3.5" /> ATS-safe fonts only
              </span>
              <span className="flex items-center gap-1.5">
                <FileDown className="size-3.5" /> PDF &amp; DOCX export
              </span>
              <span className="flex items-center gap-1.5">
                <Gauge className="size-3.5" /> AI polish
              </span>
            </div>
          </div>

          {/* Decorative resume preview */}
          <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-6 motion-safe:duration-700 motion-safe:delay-150">
            <div className="relative max-w-md mx-auto lg:max-w-none">
              <div className="absolute -top-3 sm:-top-4 -left-3 sm:-left-4 w-full h-full border border-neutral-200 rounded-md" />
              <div className="relative bg-white text-neutral-900 rounded-md border border-neutral-200 shadow-sm p-6 sm:p-7 aspect-[3/4] overflow-hidden">
                <div className="font-display text-2xl sm:text-3xl text-neutral-900">Jane Doe</div>
                <div className="text-xs text-neutral-600">Senior Software Engineer</div>
                <div className="text-[10px] text-neutral-600 mt-1">
                  jane@doe.dev · linkedin.com/in/jane · Berlin, DE
                </div>
                <div className="border-t border-neutral-200 my-3" />
                <div className="text-[10px] font-bold uppercase tracking-wider border-b border-neutral-700 pb-0.5">
                  Summary
                </div>
                <p className="text-[11px] mt-1.5 leading-snug text-neutral-700">
                  Engineer with 8+ years building distributed systems at scale. Led migration that
                  cut p99 latency 62% and saved $1.4M / yr.
                </p>
                <div className="text-[10px] font-bold uppercase tracking-wider border-b border-neutral-700 pb-0.5 mt-4">
                  Experience
                </div>
                <div className="mt-1.5 text-[11px]">
                  <strong>Staff Engineer</strong> — Acme
                </div>
                <ul className="list-disc ml-4 text-[10px] text-neutral-700 space-y-0.5 mt-1">
                  <li>Architected event-driven platform serving 4B events/day.</li>
                  <li>Mentored 6 engineers; 2 promoted to senior in 12 months.</li>
                  <li>Reduced infra spend 38% via autoscaling redesign.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Two paths */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
          <PathCard
            href="/upload"
            kicker="Path 01"
            title="Upload & improve"
            body="Drop a PDF or DOCX. AI extracts your details, fills the editor, and scores your resume against ATS criteria."
            icon={<Upload className="size-5" />}
          />
          <PathCard
            href="/builder"
            kicker="Path 02"
            title="Start from scratch"
            body="Pick a clean, ATS-safe template. Write rough drafts — AI rewrites them into professional, keyword-optimized copy."
            icon={<FileText className="size-5" />}
          />
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border bg-secondary/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-12 sm:py-16">
          <h2 className="font-display text-3xl mb-8">What&apos;s inside</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Feature
              icon={<Sparkles className="size-4" />}
              title="AI rewriting"
              body="Turn rough drafts into resume-grade prose with one click."
            />
            <Feature
              icon={<Gauge className="size-4" />}
              title="ATS scoring"
              body="Compatibility, readability, keyword and professionalism scores."
            />
            <Feature
              icon={<Upload className="size-4" />}
              title="Smart parsing"
              body="Upload PDF or DOCX and auto-fill every section."
            />
            <Feature
              icon={<FileDown className="size-4" />}
              title="Clean export"
              body="Single-column, selectable-text PDF + DOCX downloads."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-14 flex items-center justify-between text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} Inkwell Resume</span>
          <span>Built for résumés that get read.</span>
        </div>
      </footer>
    </div>
  );
}

function PathCard({
  href,
  kicker,
  title,
  body,
  icon,
}: {
  href: string;
  kicker: string;
  title: string;
  body: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="group block border border-border bg-card rounded-md p-6 transition-all duration-200 hover:border-foreground/60 hover:bg-secondary/60 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background cursor-pointer"
    >
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-muted-foreground">
        <span>{kicker}</span>
        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1">
          Open <ArrowRight className="size-3.5" />
        </span>
      </div>
      <div className="mt-6 size-10 rounded-md bg-primary text-primary-foreground grid place-items-center transition-colors duration-200 group-hover:bg-primary/90">
        {icon}
      </div>
      <h3 className="mt-3 font-display text-2xl">{title}</h3>
      <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{body}</p>
    </Link>
  );
}

function Feature({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div className="group">
      <div className="size-10 rounded-md border border-border bg-background grid place-items-center mb-3 transition-colors duration-200 group-hover:border-foreground/60 group-hover:bg-secondary/50">
        {icon}
      </div>
      <h4 className="font-medium">{title}</h4>
      <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{body}</p>
    </div>
  );
}
