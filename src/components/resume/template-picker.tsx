import { TEMPLATES, type TemplateId } from "@/lib/resume-types";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function TemplatePicker({ value, onChange }: { value: TemplateId; onChange: (t: TemplateId) => void }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {TEMPLATES.map((t) => {
        const active = value === t.id;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => onChange(t.id)}
            className={cn(
              "group relative text-left border rounded-md overflow-hidden bg-card transition",
              active ? "border-foreground ring-1 ring-foreground" : "border-border hover:border-foreground/60"
            )}
          >
            <div className="aspect-[3/4] bg-white p-2.5">
              <ThumbPreview kind={t.id} />
            </div>
            <div className="p-2.5 border-t border-border">
              <div className="text-sm font-medium leading-tight">{t.name}</div>
              <div className="text-[11px] text-muted-foreground">ATS {t.ats}/100</div>
            </div>
            {active && (
              <div className="absolute top-1.5 right-1.5 size-5 rounded-full bg-foreground text-background grid place-items-center">
                <Check className="size-3" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

function ThumbPreview({ kind }: { kind: TemplateId }) {
  const bar = "h-1 bg-neutral-200 rounded-sm";
  const dark = "h-1 bg-neutral-700 rounded-sm";
  return (
    <div className="h-full w-full text-neutral-800 flex flex-col gap-1.5">
      <div className={kind === "executive" ? "text-center" : ""}>
        <div className={cn("h-2 w-3/5 bg-neutral-800 rounded-sm", kind === "executive" && "mx-auto")} />
        <div className={cn("h-1 w-2/5 bg-neutral-400 rounded-sm mt-1", kind === "executive" && "mx-auto")} />
      </div>
      <div className="h-px bg-neutral-300 my-1" />
      <div className={dark + " w-1/4"} />
      <div className={bar} /><div className={bar + " w-11/12"} /><div className={bar + " w-10/12"} />
      <div className={dark + " w-1/3 mt-1"} />
      <div className={bar} /><div className={bar + " w-11/12"} />
      {kind === "engineer" && <><div className={dark + " w-1/4 mt-1"}/><div className={bar}/><div className={bar+" w-3/4"}/></>}
      <div className={dark + " w-1/4 mt-1"} />
      <div className={bar} /><div className={bar + " w-2/3"} />
    </div>
  );
}
