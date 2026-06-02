import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Sparkles, Plus, X, Loader2, Lightbulb } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useResumeStore } from "@/lib/resume-store";
import { improveText, suggestSkills } from "@/lib/ai.functions";
import type { Experience, Education, Project } from "@/lib/resume-types";

const uid = () => Math.random().toString(36).slice(2, 10);

function AIButton({ onClick, loading, label = "Improve with AI" }: { onClick: () => void; loading: boolean; label?: string }) {
  return (
    <Button type="button" variant="outline" size="sm" onClick={onClick} disabled={loading} className="gap-1.5 h-8">
      {loading ? <Loader2 className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5" />}
      {label}
    </Button>
  );
}

export function ResumeForm() {
  const { data, set } = useResumeStore();
  const improve = useServerFn(improveText);
  const suggest = useServerFn(suggestSkills);
  const [loading, setLoading] = useState<string | null>(null);

  async function aiImprove(field: "summary", mode: "summary") {
    const text = data[field];
    if (!text?.trim()) return toast.error("Write a draft first, then I'll polish it.");
    setLoading(field);
    try {
      const { text: out } = await improve({ data: { text, mode, context: data.title } });
      set({ [field]: out } as Partial<typeof data>);
      toast.success("Rewritten");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "AI failed");
    } finally {
      setLoading(null);
    }
  }

  async function aiBullets(expIndex: number) {
    const exp = data.experience[expIndex];
    const raw = exp.bullets.join("\n") || `${exp.role} at ${exp.company}`;
    setLoading(`exp-${expIndex}`);
    try {
      const { text: out } = await improve({
        data: { text: raw, mode: "bullet", context: `${exp.role} at ${exp.company}` },
      });
      const lines = out.split("\n").map((s) => s.replace(/^[-•*]\s*/, "").trim()).filter(Boolean);
      const next = [...data.experience];
      next[expIndex] = { ...exp, bullets: lines };
      set({ experience: next });
      toast.success("Bullets generated");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "AI failed");
    } finally {
      setLoading(null);
    }
  }

  async function aiProject(idx: number) {
    const p = data.projects[idx];
    if (!p.description.trim()) return toast.error("Add a short description first.");
    setLoading(`proj-${idx}`);
    try {
      const { text: out } = await improve({
        data: { text: p.description, mode: "project", context: p.name },
      });
      const next = [...data.projects];
      next[idx] = { ...p, description: out };
      set({ projects: next });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "AI failed");
    } finally {
      setLoading(null);
    }
  }

  async function aiSkills() {
    if (!data.title.trim()) return toast.error("Add your role/title at the top first.");
    setLoading("skills");
    try {
      const res = await suggest({ data: { role: data.title } });
      set({
        skills: {
          technical: Array.from(new Set([...data.skills.technical, ...res.technical])),
          soft: Array.from(new Set([...data.skills.soft, ...res.soft])),
        },
      });
      toast.success("Skills suggested");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "AI failed");
    } finally {
      setLoading(null);
    }
  }

  // helpers for arrays
  const addExp = () => set({ experience: [...data.experience, { id: uid(), company: "", role: "", location: "", startDate: "", endDate: "", bullets: [""] }] });
  const updExp = (i: number, patch: Partial<Experience>) => { const n=[...data.experience]; n[i]={...n[i],...patch}; set({experience:n}); };
  const delExp = (i: number) => set({ experience: data.experience.filter((_,x)=>x!==i) });

  const addEdu = () => set({ education: [...data.education, { id: uid(), school: "", degree: "", field: "", startDate: "", endDate: "", details: "" }] });
  const updEdu = (i: number, patch: Partial<Education>) => { const n=[...data.education]; n[i]={...n[i],...patch}; set({education:n}); };
  const delEdu = (i: number) => set({ education: data.education.filter((_,x)=>x!==i) });

  const addProj = () => set({ projects: [...data.projects, { id: uid(), name: "", link: "", description: "", tech: "" }] });
  const updProj = (i: number, patch: Partial<Project>) => { const n=[...data.projects]; n[i]={...n[i],...patch}; set({projects:n}); };
  const delProj = (i: number) => set({ projects: data.projects.filter((_,x)=>x!==i) });

  return (
    <div className="space-y-8">
      {/* Personal */}
      <FormSection title="Personal Information" sub="Used in the header. Keep emails and links current.">
        <div className="grid sm:grid-cols-2 gap-3">
          <Field label="Full name"><Input value={data.fullName} onChange={(e)=>set({fullName:e.target.value})} placeholder="Jane Doe"/></Field>
          <Field label="Professional title"><Input value={data.title} onChange={(e)=>set({title:e.target.value})} placeholder="Senior Software Engineer"/></Field>
          <Field label="Email"><Input type="email" value={data.email} onChange={(e)=>set({email:e.target.value})}/></Field>
          <Field label="Phone"><Input value={data.phone} onChange={(e)=>set({phone:e.target.value})}/></Field>
          <Field label="Location"><Input value={data.location} onChange={(e)=>set({location:e.target.value})} placeholder="Berlin, DE"/></Field>
          <Field label="LinkedIn"><Input value={data.linkedin} onChange={(e)=>set({linkedin:e.target.value})}/></Field>
          <Field label="GitHub"><Input value={data.github} onChange={(e)=>set({github:e.target.value})}/></Field>
          <Field label="Website"><Input value={data.website} onChange={(e)=>set({website:e.target.value})}/></Field>
        </div>
      </FormSection>

      {/* Summary */}
      <FormSection
        title="Professional Summary"
        sub="2–3 sentences. Let AI rewrite a rough draft into ATS-friendly prose."
        action={<AIButton onClick={()=>aiImprove("summary","summary")} loading={loading==="summary"}/>}
      >
        <Textarea rows={4} value={data.summary} onChange={(e)=>set({summary:e.target.value})} placeholder="Write a rough draft — anything. AI will polish it."/>
      </FormSection>

      {/* Skills */}
      <FormSection
        title="Skills"
        sub="Comma-separated. AI can suggest based on your title."
        action={<AIButton onClick={aiSkills} loading={loading==="skills"} label="Suggest skills"/>}
      >
        <Field label="Technical">
          <TagsInput value={data.skills.technical} onChange={(v)=>set({skills:{...data.skills,technical:v}})}/>
        </Field>
        <div className="h-3" />
        <Field label="Soft">
          <TagsInput value={data.skills.soft} onChange={(v)=>set({skills:{...data.skills,soft:v}})}/>
        </Field>
      </FormSection>

      {/* Experience */}
      <FormSection title="Work Experience" sub="Reverse chronological. Use action verbs and metrics." action={<Button type="button" variant="outline" size="sm" onClick={addExp} className="gap-1.5 h-8"><Plus className="size-3.5"/>Add role</Button>}>
        <div className="space-y-5">
          {data.experience.map((e, i) => (
            <Card key={e.id} className="p-4 space-y-3 bg-card">
              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="Role"><Input value={e.role} onChange={(ev)=>updExp(i,{role:ev.target.value})}/></Field>
                <Field label="Company"><Input value={e.company} onChange={(ev)=>updExp(i,{company:ev.target.value})}/></Field>
                <Field label="Location"><Input value={e.location ?? ""} onChange={(ev)=>updExp(i,{location:ev.target.value})}/></Field>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Start"><Input value={e.startDate} onChange={(ev)=>updExp(i,{startDate:ev.target.value})} placeholder="Jan 2022"/></Field>
                  <Field label="End"><Input value={e.endDate} onChange={(ev)=>updExp(i,{endDate:ev.target.value})} placeholder="Present"/></Field>
                </div>
              </div>
              <Field label="Bullet points (one per line)">
                <Textarea rows={4} value={e.bullets.join("\n")} onChange={(ev)=>updExp(i,{bullets: ev.target.value.split("\n")})}/>
              </Field>
              <div className="flex justify-between">
                <AIButton onClick={()=>aiBullets(i)} loading={loading===`exp-${i}`} label="Rewrite bullets"/>
                <Button type="button" variant="ghost" size="sm" onClick={()=>delExp(i)} className="text-destructive gap-1.5"><X className="size-3.5"/>Remove</Button>
              </div>
            </Card>
          ))}
          {data.experience.length === 0 && <EmptyHint text="No roles yet — add your most recent first." onClick={addExp}/>}
        </div>
      </FormSection>

      {/* Projects */}
      <FormSection title="Projects" sub="Helpful for engineers, creatives, and new grads." action={<Button type="button" variant="outline" size="sm" onClick={addProj} className="gap-1.5 h-8"><Plus className="size-3.5"/>Add project</Button>}>
        <div className="space-y-5">
          {data.projects.map((p, i) => (
            <Card key={p.id} className="p-4 space-y-3 bg-card">
              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="Name"><Input value={p.name} onChange={(ev)=>updProj(i,{name:ev.target.value})}/></Field>
                <Field label="Tech"><Input value={p.tech ?? ""} onChange={(ev)=>updProj(i,{tech:ev.target.value})} placeholder="React, Postgres"/></Field>
                <div className="sm:col-span-2"><Field label="Link"><Input value={p.link ?? ""} onChange={(ev)=>updProj(i,{link:ev.target.value})}/></Field></div>
              </div>
              <Field label="Description"><Textarea rows={3} value={p.description} onChange={(ev)=>updProj(i,{description:ev.target.value})}/></Field>
              <div className="flex justify-between">
                <AIButton onClick={()=>aiProject(i)} loading={loading===`proj-${i}`} label="Rewrite"/>
                <Button type="button" variant="ghost" size="sm" onClick={()=>delProj(i)} className="text-destructive gap-1.5"><X className="size-3.5"/>Remove</Button>
              </div>
            </Card>
          ))}
        </div>
      </FormSection>

      {/* Education */}
      <FormSection title="Education" action={<Button type="button" variant="outline" size="sm" onClick={addEdu} className="gap-1.5 h-8"><Plus className="size-3.5"/>Add</Button>}>
        <div className="space-y-5">
          {data.education.map((e, i) => (
            <Card key={e.id} className="p-4 space-y-3 bg-card">
              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="School"><Input value={e.school} onChange={(ev)=>updEdu(i,{school:ev.target.value})}/></Field>
                <Field label="Degree"><Input value={e.degree} onChange={(ev)=>updEdu(i,{degree:ev.target.value})}/></Field>
                <Field label="Field"><Input value={e.field ?? ""} onChange={(ev)=>updEdu(i,{field:ev.target.value})}/></Field>
                <div className="grid grid-cols-2 gap-2">
                  <Field label="Start"><Input value={e.startDate} onChange={(ev)=>updEdu(i,{startDate:ev.target.value})}/></Field>
                  <Field label="End"><Input value={e.endDate} onChange={(ev)=>updEdu(i,{endDate:ev.target.value})}/></Field>
                </div>
              </div>
              <Field label="Details"><Textarea rows={2} value={e.details ?? ""} onChange={(ev)=>updEdu(i,{details:ev.target.value})} placeholder="GPA, honors, coursework"/></Field>
              <div className="flex justify-end">
                <Button type="button" variant="ghost" size="sm" onClick={()=>delEdu(i)} className="text-destructive gap-1.5"><X className="size-3.5"/>Remove</Button>
              </div>
            </Card>
          ))}
        </div>
      </FormSection>

      {/* Lists */}
      <FormSection title="Certifications">
        <TagsInput value={data.certifications} onChange={(v)=>set({certifications:v})} placeholder="AWS Solutions Architect"/>
      </FormSection>
      <FormSection title="Achievements">
        <TagsInput value={data.achievements} onChange={(v)=>set({achievements:v})} placeholder="Reduced infra cost by 40%"/>
      </FormSection>
      <FormSection title="Languages">
        <TagsInput value={data.languages} onChange={(v)=>set({languages:v})} placeholder="English (native), German (B2)"/>
      </FormSection>
    </div>
  );
}

/* ── small primitives ─────────────────────────────────────────────── */
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function FormSection({ title, sub, action, children }: { title: string; sub?: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-end justify-between gap-3 mb-3">
        <div>
          <h3 className="font-display text-2xl">{title}</h3>
          {sub && <p className="text-sm text-muted-foreground">{sub}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function EmptyHint({ text, onClick }: { text: string; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="w-full border border-dashed border-border rounded-md p-6 text-sm text-muted-foreground hover:bg-muted text-left flex items-center gap-2">
      <Lightbulb className="size-4" /> {text}
    </button>
  );
}

function TagsInput({ value, onChange, placeholder }: { value: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const [input, setInput] = useState("");
  const add = () => {
    const t = input.trim();
    if (!t) return;
    onChange([...value, t]);
    setInput("");
  };
  return (
    <div className="rounded-md border border-input bg-background px-2 py-1.5 flex flex-wrap gap-1.5">
      {value.map((v, i) => (
        <Badge key={i} variant="secondary" className="gap-1 font-normal">
          {v}
          <button type="button" onClick={() => onChange(value.filter((_, x) => x !== i))} className="opacity-60 hover:opacity-100">
            <X className="size-3" />
          </button>
        </Badge>
      ))}
      <input
        className="flex-1 min-w-[140px] bg-transparent outline-none text-sm px-1 py-1"
        placeholder={placeholder ?? "Type and press Enter…"}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add(); }
          if (e.key === "Backspace" && !input && value.length) onChange(value.slice(0, -1));
        }}
        onBlur={add}
      />
    </div>
  );
}
