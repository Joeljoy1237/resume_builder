"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Sparkles, Plus, X, Loader2, Lightbulb, GripVertical } from "lucide-react";
import { useShallow } from "zustand/react/shallow";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useResumeStore } from "@/lib/resume-store";
import { improveText, suggestSkills } from "@/lib/ai.functions";
import type { Experience, Education, Project } from "@/lib/resume-types";

const uid = () => Math.random().toString(36).slice(2, 10);

function AIButton({
  onClick,
  loading,
  label = "Improve with AI",
}: {
  onClick: () => void;
  loading: boolean;
  label?: string;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={onClick}
      disabled={loading}
      className="gap-1.5 h-8 bg-background hover:bg-secondary transition-colors duration-200 cursor-pointer"
    >
      {loading ? <Loader2 className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5" />}
      {label}
    </Button>
  );
}

async function aiImprove() {
  const { data, set } = useResumeStore.getState();
  const text = data.summary;
  if (!text?.trim()) return toast.error("Write a draft first, then I'll polish it.");
  try {
    const { text: out } = await improveText({ text, mode: "summary", context: data.title });
    set({ summary: out });
    toast.success("Rewritten");
  } catch (e) {
    toast.error(e instanceof Error ? e.message : "AI failed");
  }
}

async function aiBullets(expIndex: number) {
  const { data, set } = useResumeStore.getState();
  const exp = data.experience[expIndex];
  const raw = exp.bullets.join("\n") || `${exp.role} at ${exp.company}`;
  try {
    const { text: out } = await improveText({
      text: raw,
      mode: "bullet",
      context: `${exp.role} at ${exp.company}`,
    });
    const lines = out
      .split("\n")
      .map((s) => s.replace(/^[-•*]\s*/, "").trim())
      .filter(Boolean);
    const next = [...data.experience];
    next[expIndex] = { ...exp, bullets: lines };
    set({ experience: next });
    toast.success("Bullets generated");
  } catch (e) {
    toast.error(e instanceof Error ? e.message : "AI failed");
  }
}

async function aiProject(idx: number) {
  const { data, set } = useResumeStore.getState();
  const p = data.projects[idx];
  if (!p.description.trim()) return toast.error("Add a short description first.");
  try {
    const { text: out } = await improveText({
      text: p.description,
      mode: "project",
      context: p.name,
    });
    const next = [...data.projects];
    next[idx] = { ...p, description: out };
    set({ projects: next });
  } catch (e) {
    toast.error(e instanceof Error ? e.message : "AI failed");
  }
}

async function aiSkills() {
  const { data, set } = useResumeStore.getState();
  if (!data.title.trim())
    return toast.error("Add your role / title in Personal Information first.");
  try {
    const res = await suggestSkills({ role: data.title });
    set({
      skills: {
        technical: Array.from(new Set([...data.skills.technical, ...res.technical])),
        soft: Array.from(new Set([...data.skills.soft, ...res.soft])),
      },
    });
    toast.success("Skills suggested");
  } catch (e) {
    toast.error(e instanceof Error ? e.message : "AI failed");
  }
}

export function ResumeForm() {
  return (
    <div className="space-y-10">
      <PersonalSection />
      <SummarySection />
      <SkillsSection />
      <ExperienceSection />
      <ProjectsSection />
      <EducationSection />
      <ExtrasSection />
    </div>
  );
}

function PersonalSection() {
  const set = useResumeStore((s) => s.set);
  const { fullName, title, email, phone, location, linkedin, github, website } = useResumeStore(
    useShallow((s) => ({
      fullName: s.data.fullName,
      title: s.data.title,
      email: s.data.email,
      phone: s.data.phone,
      location: s.data.location,
      linkedin: s.data.linkedin,
      github: s.data.github,
      website: s.data.website,
    })),
  );

  return (
    <FormSection id="personal" title="Personal Information" sub="Name, title, and contact details.">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Full name">
          <Input
            value={fullName}
            onChange={(e) => set({ fullName: e.target.value })}
            placeholder="e.g. Jane Doe"
          />
        </Field>
        <Field label="Role / title">
          <Input
            value={title}
            onChange={(e) => set({ title: e.target.value })}
            placeholder="e.g. Senior Software Engineer"
          />
        </Field>
        <Field label="Email">
          <Input
            type="email"
            value={email}
            onChange={(e) => set({ email: e.target.value })}
            placeholder="e.g. jane@example.com"
          />
        </Field>
        <Field label="Phone">
          <Input
            value={phone}
            onChange={(e) => set({ phone: e.target.value })}
            placeholder="e.g. +1 555 123 4567"
          />
        </Field>
        <Field label="Location">
          <Input
            value={location}
            onChange={(e) => set({ location: e.target.value })}
            placeholder="e.g. Berlin, DE"
          />
        </Field>
        <Field label="LinkedIn">
          <Input
            value={linkedin}
            onChange={(e) => set({ linkedin: e.target.value })}
            placeholder="e.g. linkedin.com/in/janedoe"
          />
        </Field>
        <Field label="GitHub">
          <Input
            value={github}
            onChange={(e) => set({ github: e.target.value })}
            placeholder="e.g. github.com/janedoe"
          />
        </Field>
        <Field label="Website">
          <Input
            value={website}
            onChange={(e) => set({ website: e.target.value })}
            placeholder="e.g. janedoe.com"
          />
        </Field>
      </div>
    </FormSection>
  );
}

function SummarySection() {
  const summary = useResumeStore((s) => s.data.summary);
  const set = useResumeStore((s) => s.set);
  const [loading, setLoading] = useState(false);

  const handleImprove = async () => {
    setLoading(true);
    await aiImprove();
    setLoading(false);
  };

  return (
    <FormSection
      id="summary"
      title="Professional Summary"
      sub="2–3 sentences. AI can rewrite a rough draft."
      action={<AIButton onClick={handleImprove} loading={loading} />}
    >
      <Textarea
        rows={4}
        value={summary}
        onChange={(e) => set({ summary: e.target.value })}
        placeholder="Write a rough draft — anything. AI will polish it."
      />
    </FormSection>
  );
}

function SkillsSection() {
  const { technical, soft } = useResumeStore(
    useShallow((s) => ({ technical: s.data.skills.technical, soft: s.data.skills.soft })),
  );
  const set = useResumeStore((s) => s.set);
  const [loading, setLoading] = useState(false);

  const handleSuggest = async () => {
    setLoading(true);
    await aiSkills();
    setLoading(false);
  };

  return (
    <FormSection
      id="skills"
      title="Skills"
      sub="Comma-separated tags. AI can suggest based on your title."
      action={<AIButton onClick={handleSuggest} loading={loading} label="Suggest skills" />}
    >
      <div className="space-y-4">
        <Field label="Technical">
          <TagsInput
            value={technical}
            onChange={(v) => set({ skills: { technical: v, soft } })}
            placeholder="React, TypeScript, AWS"
          />
        </Field>
        <Field label="Soft">
          <TagsInput
            value={soft}
            onChange={(v) => set({ skills: { technical, soft: v } })}
            placeholder="Leadership, Communication"
          />
        </Field>
      </div>
    </FormSection>
  );
}

function ExperienceSection() {
  const experience = useResumeStore((s) => s.data.experience);
  const set = useResumeStore((s) => s.set);
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);

  const addExp = () =>
    set({
      experience: [
        ...experience,
        {
          id: uid(),
          company: "",
          role: "",
          location: "",
          startDate: "",
          endDate: "",
          bullets: [""],
        },
      ],
    });
  const updExp = (i: number, patch: Partial<Experience>) => {
    const n = [...experience];
    n[i] = { ...n[i], ...patch };
    set({ experience: n });
  };
  const delExp = (i: number) => set({ experience: experience.filter((_, x) => x !== i) });

  const handleRewrite = async (i: number) => {
    setLoadingIndex(i);
    await aiBullets(i);
    setLoadingIndex(null);
  };

  return (
    <FormSection
      id="experience"
      title="Work Experience"
      sub="Reverse chronological. Use action verbs and metrics."
      action={
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addExp}
          className="gap-1.5 h-8 cursor-pointer transition-colors duration-200"
        >
          <Plus className="size-3.5" />
          Add role
        </Button>
      }
    >
      <div className="space-y-5">
        {experience.map((e, i) => (
          <Card key={e.id} className="p-5 space-y-4 bg-card border-border/60">
            <div className="flex items-start gap-2">
              <GripVertical className="size-4 text-muted-foreground mt-2 shrink-0" />
              <div className="flex-1 grid sm:grid-cols-2 gap-4">
                <Field label="Role">
                  <Input value={e.role} onChange={(ev) => updExp(i, { role: ev.target.value })} />
                </Field>
                <Field label="Company">
                  <Input
                    value={e.company}
                    onChange={(ev) => updExp(i, { company: ev.target.value })}
                  />
                </Field>
                <Field label="Location">
                  <Input
                    value={e.location ?? ""}
                    onChange={(ev) => updExp(i, { location: ev.target.value })}
                  />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Start">
                    <Input
                      value={e.startDate}
                      onChange={(ev) => updExp(i, { startDate: ev.target.value })}
                      placeholder="Jan 2022"
                    />
                  </Field>
                  <Field label="End">
                    <Input
                      value={e.endDate}
                      onChange={(ev) => updExp(i, { endDate: ev.target.value })}
                      placeholder="Present"
                    />
                  </Field>
                </div>
              </div>
            </div>
            <Field label="Bullet points (one per line)">
              <Textarea
                rows={4}
                value={e.bullets.join("\n")}
                onChange={(ev) => updExp(i, { bullets: ev.target.value.split("\n") })}
                placeholder="Led migration that cut p99 latency 62%..."
              />
            </Field>
            <div className="flex items-center justify-between pt-1">
              <AIButton
                onClick={() => handleRewrite(i)}
                loading={loadingIndex === i}
                label="Rewrite bullets"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => delExp(i)}
                className="text-destructive gap-1.5 cursor-pointer transition-colors duration-200"
              >
                <X className="size-3.5" />
                Remove
              </Button>
            </div>
          </Card>
        ))}
        {experience.length === 0 && (
          <EmptyHint text="No roles yet — add your most recent first." onClick={addExp} />
        )}
      </div>
    </FormSection>
  );
}

function ProjectsSection() {
  const projects = useResumeStore((s) => s.data.projects);
  const set = useResumeStore((s) => s.set);
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);

  const addProj = () =>
    set({
      projects: [...projects, { id: uid(), name: "", link: "", description: "", tech: "" }],
    });
  const updProj = (i: number, patch: Partial<Project>) => {
    const n = [...projects];
    n[i] = { ...n[i], ...patch };
    set({ projects: n });
  };
  const delProj = (i: number) => set({ projects: projects.filter((_, x) => x !== i) });

  const handleRewrite = async (i: number) => {
    setLoadingIndex(i);
    await aiProject(i);
    setLoadingIndex(null);
  };

  return (
    <FormSection
      id="projects"
      title="Projects"
      sub="Helpful for engineers, creatives, and new grads."
      action={
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addProj}
          className="gap-1.5 h-8 cursor-pointer transition-colors duration-200"
        >
          <Plus className="size-3.5" />
          Add project
        </Button>
      }
    >
      <div className="space-y-5">
        {projects.map((p, i) => (
          <Card key={p.id} className="p-5 space-y-4 bg-card border-border/60">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Name">
                <Input value={p.name} onChange={(ev) => updProj(i, { name: ev.target.value })} />
              </Field>
              <Field label="Tech">
                <Input
                  value={p.tech ?? ""}
                  onChange={(ev) => updProj(i, { tech: ev.target.value })}
                  placeholder="React, Postgres"
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Link">
                  <Input
                    value={p.link ?? ""}
                    onChange={(ev) => updProj(i, { link: ev.target.value })}
                  />
                </Field>
              </div>
            </div>
            <Field label="Description">
              <Textarea
                rows={3}
                value={p.description}
                onChange={(ev) => updProj(i, { description: ev.target.value })}
                placeholder="Built a real-time analytics pipeline..."
              />
            </Field>
            <div className="flex items-center justify-between pt-1">
              <AIButton
                onClick={() => handleRewrite(i)}
                loading={loadingIndex === i}
                label="Rewrite"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => delProj(i)}
                className="text-destructive gap-1.5 cursor-pointer transition-colors duration-200"
              >
                <X className="size-3.5" />
                Remove
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </FormSection>
  );
}

function EducationSection() {
  const education = useResumeStore((s) => s.data.education);
  const set = useResumeStore((s) => s.set);

  const addEdu = () =>
    set({
      education: [
        ...education,
        { id: uid(), school: "", degree: "", field: "", startDate: "", endDate: "", details: "" },
      ],
    });
  const updEdu = (i: number, patch: Partial<Education>) => {
    const n = [...education];
    n[i] = { ...n[i], ...patch };
    set({ education: n });
  };
  const delEdu = (i: number) => set({ education: education.filter((_, x) => x !== i) });

  return (
    <FormSection
      id="education"
      title="Education"
      action={
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addEdu}
          className="gap-1.5 h-8 cursor-pointer transition-colors duration-200"
        >
          <Plus className="size-3.5" />
          Add
        </Button>
      }
    >
      <div className="space-y-5">
        {education.map((e, i) => (
          <Card key={e.id} className="p-5 space-y-4 bg-card border-border/60">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="School">
                <Input value={e.school} onChange={(ev) => updEdu(i, { school: ev.target.value })} />
              </Field>
              <Field label="Degree">
                <Input value={e.degree} onChange={(ev) => updEdu(i, { degree: ev.target.value })} />
              </Field>
              <Field label="Field">
                <Input
                  value={e.field ?? ""}
                  onChange={(ev) => updEdu(i, { field: ev.target.value })}
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Start">
                  <Input
                    value={e.startDate}
                    onChange={(ev) => updEdu(i, { startDate: ev.target.value })}
                  />
                </Field>
                <Field label="End">
                  <Input
                    value={e.endDate}
                    onChange={(ev) => updEdu(i, { endDate: ev.target.value })}
                  />
                </Field>
              </div>
            </div>
            <Field label="Details">
              <Textarea
                rows={2}
                value={e.details ?? ""}
                onChange={(ev) => updEdu(i, { details: ev.target.value })}
                placeholder="GPA, honors, coursework"
              />
            </Field>
            <div className="flex justify-end pt-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => delEdu(i)}
                className="text-destructive gap-1.5 cursor-pointer transition-colors duration-200"
              >
                <X className="size-3.5" />
                Remove
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </FormSection>
  );
}

function ExtrasSection() {
  const { certifications, achievements, languages } = useResumeStore(
    useShallow((s) => ({
      certifications: s.data.certifications,
      achievements: s.data.achievements,
      languages: s.data.languages,
    })),
  );
  const set = useResumeStore((s) => s.set);

  return (
    <FormSection id="extras" title="Extras" sub="Certifications, achievements, and languages.">
      <div className="space-y-4">
        <Field label="Certifications">
          <TagsInput
            value={certifications}
            onChange={(v) => set({ certifications: v })}
            placeholder="AWS Solutions Architect"
          />
        </Field>
        <Separator />
        <Field label="Achievements">
          <TagsInput
            value={achievements}
            onChange={(v) => set({ achievements: v })}
            placeholder="Reduced infra cost by 40%"
          />
        </Field>
        <Separator />
        <Field label="Languages">
          <TagsInput
            value={languages}
            onChange={(v) => set({ languages: v })}
            placeholder="English (native), German (B2)"
          />
        </Field>
      </div>
    </FormSection>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}

function FormSection({
  id,
  title,
  sub,
  action,
  children,
}: {
  id: string;
  title: string;
  sub?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-[9rem]">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-4">
        <div>
          <h3 className="font-display text-2xl tracking-tight">{title}</h3>
          {sub && <p className="text-sm text-muted-foreground mt-0.5">{sub}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {children}
    </section>
  );
}

function EmptyHint({ text, onClick }: { text: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full border border-dashed border-border rounded-lg p-6 text-sm text-muted-foreground hover:bg-secondary/50 hover:text-foreground text-left flex items-center gap-2 transition-colors duration-200 cursor-pointer"
    >
      <Lightbulb className="size-4" /> {text}
    </button>
  );
}

function TagsInput({
  value,
  onChange,
  placeholder,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  const [input, setInput] = useState("");
  const add = () => {
    const t = input.trim();
    if (!t) return;
    onChange([...value, t]);
    setInput("");
  };
  return (
    <div className="rounded-md border border-input bg-background px-2.5 py-2 flex flex-wrap gap-2 focus-within:ring-1 focus-within:ring-ring transition-shadow duration-200">
      {value.map((v, i) => (
        <Badge key={i} variant="secondary" className="gap-1 font-normal py-1 pl-2 pr-1">
          {v}
          <button
            type="button"
            onClick={() => onChange(value.filter((_, x) => x !== i))}
            className="opacity-60 hover:opacity-100 hover:bg-secondary rounded-sm p-0.5 transition-colors duration-200 cursor-pointer"
          >
            <X className="size-3" />
          </button>
        </Badge>
      ))}
      <input
        className="flex-1 min-w-[140px] bg-transparent outline-none text-sm px-1 py-0.5"
        placeholder={placeholder ?? "Type and press Enter…"}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            add();
          }
          if (e.key === "Backspace" && !input && value.length) onChange(value.slice(0, -1));
        }}
        onBlur={add}
      />
    </div>
  );
}
