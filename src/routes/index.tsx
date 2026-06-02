import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Upload, FileText, Sparkles, Gauge, FileDown, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Inkwell — AI ATS Resume Builder" },
      { name: "description", content: "Build, optimize, and export ATS-friendly resumes with AI. Upload your existing resume or start from a clean template." },
      { property: "og:title", content: "Inkwell — AI ATS Resume Builder" },
      { property: "og:description", content: "Build, optimize, and export ATS-friendly resumes with AI." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      {/* Hero */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-6 pt-20 pb-24 grid lg:grid-cols-12 gap-10 items-end">
          <div className="lg:col-span-7">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-6">
              An editorial resume studio · No. 01
            </div>
            <h1 className="font-display text-5xl sm:text-7xl leading-[0.95] tracking-tight">
              Write resumes that<br /><em className="italic">machines and humans</em> actually read.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl">
              Inkwell parses, polishes, and scores your resume against ATS criteria —
              with AI that knows the difference between “team player” and a quantified win.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="h-12 px-6 gap-2">
                <Link to="/builder"><FileText className="size-4" />Create new resume</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-6 gap-2">
                <Link to="/upload"><Upload className="size-4" />Upload existing</Link>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap gap-6 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><ShieldCheck className="size-3.5" /> ATS-safe fonts only</span>
              <span className="flex items-center gap-1.5"><FileDown className="size-3.5" /> PDF & DOCX export</span>
              <span className="flex items-center gap-1.5"><Sparkles className="size-3.5" /> AI polish</span>
            </div>
          </div>

          {/* Decorative resume preview */}
          <div className="lg:col-span-5">
            <div className="relative">
              <div className="absolute -top-6 -left-6 w-full h-full border border-rule rounded-sm" />
              <div className="relative bg-white text-neutral-900 rounded-sm shadow-xl p-8 aspect-[3/4] overflow-hidden">
                <div className="font-display text-3xl text-black">Jane Doe</div>
                <div className="text-xs text-neutral-600">Senior Software Engineer</div>
                <div className="text-[10px] text-neutral-600 mt-1">jane@doe.dev · linkedin.com/in/jane · Berlin, DE</div>
                <div className="border-t border-neutral-300 my-3" />
                <div className="text-[10px] font-bold uppercase tracking-wider border-b border-neutral-700 pb-0.5">Summary</div>
                <p className="text-[11px] mt-1.5 leading-snug text-neutral-800">
                  Engineer with 8+ years building distributed systems at scale. Led migration that cut p99 latency 62% and saved $1.4M / yr.
                </p>
                <div className="text-[10px] font-bold uppercase tracking-wider border-b border-neutral-700 pb-0.5 mt-4">Experience</div>
                <div className="mt-1.5 text-[11px]"><strong>Staff Engineer</strong> — Acme</div>
                <ul className="list-disc ml-4 text-[10px] text-neutral-800 space-y-0.5 mt-1">
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
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div className="grid md:grid-cols-2 gap-6">
          <PathCard
            to="/upload"
            kicker="Path 01"
            title="Upload & improve"
            body="Drop a PDF or DOCX. AI extracts your details, fills the editor, and scores your resume against ATS criteria."
            icon={<Upload className="size-5" />}
          />
          <PathCard
            to="/builder"
            kicker="Path 02"
            title="Start from scratch"
            body="Pick a clean, ATS-safe template. Write rough drafts — AI rewrites them into professional, keyword-optimized copy."
            icon={<FileText className="size-5" />}
          />
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border bg-secondary/50">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <h2 className="font-display text-4xl mb-10">What's inside</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <Feature icon={<Sparkles className="size-4" />} title="AI rewriting" body="Turn rough drafts into resume-grade prose with one click." />
            <Feature icon={<Gauge className="size-4" />} title="ATS scoring" body="Compatibility, readability, keyword and professionalism scores." />
            <Feature icon={<Upload className="size-4" />} title="Smart parsing" body="Upload PDF or DOCX and auto-fill every section." />
            <Feature icon={<FileDown className="size-4" />} title="Clean export" body="Single-column, selectable-text PDF + DOCX downloads." />
          </div>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between text-xs text-muted-foreground">
          <span>© {new Date().getFullYear()} Inkwell Resume</span>
          <span>Built for résumés that get read.</span>
        </div>
      </footer>
    </div>
  );
}

function PathCard({ to, kicker, title, body, icon }: { to: string; kicker: string; title: string; body: string; icon: React.ReactNode }) {
  return (
    <Link to={to} className="group block border border-border bg-card rounded-md p-8 hover:bg-secondary transition">
      <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-muted-foreground">
        <span>{kicker}</span>
        <span className="opacity-0 group-hover:opacity-100 transition flex items-center gap-1">Open <ArrowRight className="size-3.5" /></span>
      </div>
      <div className="mt-8 size-10 rounded-sm bg-primary text-primary-foreground grid place-items-center">{icon}</div>
      <h3 className="mt-4 font-display text-3xl">{title}</h3>
      <p className="mt-2 text-muted-foreground">{body}</p>
    </Link>
  );
}

function Feature({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div>
      <div className="size-8 rounded-sm border border-border grid place-items-center mb-3">{icon}</div>
      <h4 className="font-medium">{title}</h4>
      <p className="text-sm text-muted-foreground mt-1">{body}</p>
    </div>
  );
}
