"use client";

import { useEffect, useState } from "react";
import { useForm, FormProvider, useFormContext, Controller, useFieldArray } from "react-hook-form";
import { toast } from "sonner";
import { Sparkles, Plus, X, Loader2, Lightbulb, GripVertical, CheckCircle2, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { uid, cn } from "@/lib/utils";
import { useResumeStore } from "@/lib/resume-store";
import { improveText, suggestSkills } from "@/lib/ai.functions";
import type { Experience, Education, Project, ResumeData } from "@/lib/resume-types";

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
  const storeData = useResumeStore((s) => s.data);
  const setStore = useResumeStore((s) => s.set);

  const methods = useForm<ResumeData>({
    defaultValues: storeData,
  });

  const { watch, reset } = methods;

  // Sync from store to react-hook-form (e.g. when AI rewrite updates the store, or active resume changes)
  useEffect(() => {
    const currentValues = watch();
    if (JSON.stringify(currentValues) !== JSON.stringify(storeData)) {
      reset(storeData);
    }
  }, [storeData, reset, watch]);

  // Sync from react-hook-form to store
  useEffect(() => {
    const subscription = watch((values) => {
      const storeState = useResumeStore.getState().data;
      if (JSON.stringify(storeState) !== JSON.stringify(values)) {
        setStore(values as Partial<ResumeData>);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, setStore]);

  return (
    <FormProvider {...methods}>
      <form onSubmit={(e) => e.preventDefault()} className="space-y-10">
        <PersonalSection />
        <SummarySection />
        <SkillsSection />
        <ExperienceSection />
        <ProjectsSection />
        <EducationSection />
        <ExtrasSection />
      </form>
    </FormProvider>
  );
}

function PersonalSection() {
  const { register } = useFormContext<ResumeData>();

  return (
    <FormSection id="personal" title="Personal Information" sub="Name, title, and contact details.">
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="Full name" name="fullName" required>
          <Input
            {...register("fullName")}
            placeholder="e.g. Jane Doe"
          />
        </Field>
        <Field label="Role / title" name="title" required>
          <Input
            {...register("title")}
            placeholder="e.g. Senior Software Engineer"
          />
        </Field>
        <Field label="Email" name="email" required>
          <Input
            type="email"
            {...register("email")}
            placeholder="e.g. jane@example.com"
          />
        </Field>
        <Field label="Phone" name="phone" required>
          <Input
            {...register("phone")}
            placeholder="e.g. +1 555 123 4567"
          />
        </Field>
        <Field label="Location" name="location" required>
          <Input
            {...register("location")}
            placeholder="e.g. Berlin, DE"
          />
        </Field>
        <Field label="LinkedIn" name="linkedin">
          <Input
            {...register("linkedin")}
            placeholder="e.g. linkedin.com/in/janedoe"
          />
        </Field>
        <Field label="GitHub" name="github">
          <Input
            {...register("github")}
            placeholder="e.g. github.com/janedoe"
          />
        </Field>
        <Field label="Website" name="website">
          <Input
            {...register("website")}
            placeholder="e.g. janedoe.com"
          />
        </Field>
      </div>
    </FormSection>
  );
}

function SummarySection() {
  const { register } = useFormContext<ResumeData>();
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
      <Field label="Summary" name="summary" required>
        <Textarea
          rows={4}
          {...register("summary")}
          placeholder="Write a rough draft — anything. AI will polish it."
        />
      </Field>
    </FormSection>
  );
}

function SkillsSection() {
  const { control } = useFormContext<ResumeData>();
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
        <Field label="Technical" name="skills.technical" required>
          <Controller
            control={control}
            name="skills.technical"
            render={({ field: { value, onChange } }) => (
              <TagsInput
                value={value || []}
                onChange={onChange}
                placeholder="React, TypeScript, AWS"
              />
            )}
          />
        </Field>
        <Field label="Soft" name="skills.soft">
          <Controller
            control={control}
            name="skills.soft"
            render={({ field: { value, onChange } }) => (
              <TagsInput
                value={value || []}
                onChange={onChange}
                placeholder="Leadership, Communication"
              />
            )}
          />
        </Field>
      </div>
    </FormSection>
  );
}

function ExperienceSection() {
  const { control, register } = useFormContext<ResumeData>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "experience",
  });
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);

  const addExp = () =>
    append({
      id: uid(),
      company: "",
      role: "",
      location: "",
      startDate: "",
      endDate: "",
      bullets: [""],
    });

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
        {fields.map((e, i) => (
          <Card key={e.id} className="p-5 space-y-4 bg-card border-border/60">
            <div className="flex items-start gap-2">
              <GripVertical className="size-4 text-muted-foreground mt-2 shrink-0" />
              <div className="flex-1 grid sm:grid-cols-2 gap-4">
                <Field label="Role" name={`experience.${i}.role`} required>
                  <Input {...register(`experience.${i}.role` as const)} />
                </Field>
                <Field label="Company" name={`experience.${i}.company`} required>
                  <Input {...register(`experience.${i}.company` as const)} />
                </Field>
                <Field label="Location" name={`experience.${i}.location`}>
                  <Input {...register(`experience.${i}.location` as const)} />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Start" name={`experience.${i}.startDate`} required>
                    <Input
                      {...register(`experience.${i}.startDate` as const)}
                      placeholder="Jan 2022"
                    />
                  </Field>
                  <Field label="End" name={`experience.${i}.endDate`} required>
                    <Input
                      {...register(`experience.${i}.endDate` as const)}
                      placeholder="Present"
                    />
                  </Field>
                </div>
              </div>
            </div>
            <Field label="Bullet points (one per line)" name={`experience.${i}.bullets`} required>
              <Controller
                control={control}
                name={`experience.${i}.bullets`}
                render={({ field: { value, onChange } }) => (
                  <Textarea
                    rows={4}
                    value={value ? value.join("\n") : ""}
                    onChange={(ev) => onChange(ev.target.value.split("\n"))}
                    placeholder="Led migration that cut p99 latency 62%..."
                  />
                )}
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
                onClick={() => remove(i)}
                className="text-destructive gap-1.5 cursor-pointer transition-colors duration-200"
              >
                <X className="size-3.5" />
                Remove
              </Button>
            </div>
          </Card>
        ))}
        {fields.length === 0 && (
          <EmptyHint text="No roles yet — add your most recent first." onClick={addExp} />
        )}
      </div>
    </FormSection>
  );
}

function ProjectsSection() {
  const { control, register } = useFormContext<ResumeData>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "projects",
  });
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);

  const addProj = () =>
    append({ id: uid(), name: "", link: "", description: "", tech: "" });

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
        {fields.map((p, i) => (
          <Card key={p.id} className="p-5 space-y-4 bg-card border-border/60">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Name" name={`projects.${i}.name`} required>
                <Input {...register(`projects.${i}.name` as const)} />
              </Field>
              <Field label="Tech" name={`projects.${i}.tech`}>
                <Input
                  {...register(`projects.${i}.tech` as const)}
                  placeholder="React, Postgres"
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Link" name={`projects.${i}.link`}>
                  <Input {...register(`projects.${i}.link` as const)} />
                </Field>
              </div>
            </div>
            <Field label="Description" name={`projects.${i}.description`} required>
              <Textarea
                rows={3}
                {...register(`projects.${i}.description` as const)}
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
                onClick={() => remove(i)}
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
  const { control, register } = useFormContext<ResumeData>();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "education",
  });

  const addEdu = () =>
    append({ id: uid(), school: "", degree: "", field: "", startDate: "", endDate: "", details: "" });

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
        {fields.map((e, i) => (
          <Card key={e.id} className="p-5 space-y-4 bg-card border-border/60">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="School" name={`education.${i}.school`} required>
                <Input {...register(`education.${i}.school` as const)} />
              </Field>
              <Field label="Degree" name={`education.${i}.degree`} required>
                <Input {...register(`education.${i}.degree` as const)} />
              </Field>
              <Field label="Field" name={`education.${i}.field`}>
                <Input {...register(`education.${i}.field` as const)} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Start" name={`education.${i}.startDate`} required>
                  <Input {...register(`education.${i}.startDate` as const)} />
                </Field>
                <Field label="End" name={`education.${i}.endDate`} required>
                  <Input {...register(`education.${i}.endDate` as const)} />
                </Field>
              </div>
            </div>
            <Field label="Details" name={`education.${i}.details`}>
              <Textarea
                rows={2}
                {...register(`education.${i}.details` as const)}
                placeholder="GPA, honors, coursework"
              />
            </Field>
            <div className="flex justify-end pt-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => remove(i)}
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
  const { control } = useFormContext<ResumeData>();

  return (
    <FormSection id="extras" title="Extras" sub="Certifications, achievements, and languages.">
      <div className="space-y-4">
        <Field label="Certifications" name="certifications">
          <Controller
            control={control}
            name="certifications"
            render={({ field: { value, onChange } }) => (
              <TagsInput
                value={value || []}
                onChange={onChange}
                placeholder="AWS Solutions Architect"
              />
            )}
          />
        </Field>
        <Separator />
        <Field label="Achievements" name="achievements">
          <Controller
            control={control}
            name="achievements"
            render={({ field: { value, onChange } }) => (
              <TagsInput
                value={value || []}
                onChange={onChange}
                placeholder="Reduced infra cost by 40%"
              />
            )}
          />
        </Field>
        <Separator />
        <Field label="Languages" name="languages">
          <Controller
            control={control}
            name="languages"
            render={({ field: { value, onChange } }) => (
              <TagsInput
                value={value || []}
                onChange={onChange}
                placeholder="English (native), German (B2)"
              />
            )}
          />
        </Field>
      </div>
    </FormSection>
  );
}

function Field({
  label,
  name,
  required,
  children,
}: {
  label: string;
  name?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  const { watch } = useFormContext();
  const value = name ? watch(name) : undefined;

  let isEmptyRequired = false;
  if (required && name) {
    if (value === undefined || value === null) {
      isEmptyRequired = true;
    } else if (typeof value === "string") {
      isEmptyRequired = value.trim() === "";
    } else if (Array.isArray(value)) {
      isEmptyRequired = value.length === 0 || !value.some((v) => typeof v === "string" ? v.trim() !== "" : !!v);
    }
  }

  return (
    <div className="space-y-1.5 group w-full">
      <Label className={cn(
        "flex items-center justify-between gap-1 select-none text-xs font-medium uppercase tracking-wider transition-colors duration-200",
        isEmptyRequired ? "text-amber-500/90" : "text-muted-foreground"
      )}>
        <span className="flex items-center gap-1">
          {label}
          {required && (
            <span className={cn("font-bold transition-colors duration-200", isEmptyRequired ? "text-amber-500" : "text-destructive")} title="Required">*</span>
          )}
        </span>
        {isEmptyRequired && (
          <span className="text-[10px] text-amber-500/80 normal-case font-normal select-none animate-pulse">
            Required
          </span>
        )}
      </Label>
      <div className={cn(
        "rounded-md transition-all duration-200",
        isEmptyRequired && "[&>input]:border-amber-500/40 [&>textarea]:border-amber-500/40 [&>input]:bg-amber-500/[0.01] [&>textarea]:bg-amber-500/[0.01] focus-within:ring-2 focus-within:ring-amber-500/20"
      )}>
        {children}
      </div>
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
