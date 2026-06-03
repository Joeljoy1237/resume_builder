import type { ResumeData, TemplateId } from "@/lib/resume-types";

type SectionKey =
  | "summary"
  | "skills"
  | "experience"
  | "projects"
  | "education"
  | "certifications"
  | "achievements"
  | "languages";

interface TemplateStyle {
  headerAlign: "left" | "center";
  nameSize: string;
  nameTracking: string;
  accentRule: "solid" | "double" | "thin" | "none";
  headingStyle: "underline" | "boxed" | "caps-thin" | "left-bar";
  summaryLabel: string;
  bodySize: string;
  order: SectionKey[];
  bullet: "•" | "▪" | "–";
  padding: string;
}

const baseOrder: SectionKey[] = [
  "summary",
  "skills",
  "experience",
  "projects",
  "education",
  "certifications",
  "achievements",
  "languages",
];

const STYLES: Record<TemplateId, TemplateStyle> = {
  professional: { headerAlign: "left", nameSize: "text-[22pt]", nameTracking: "", accentRule: "solid", headingStyle: "underline", summaryLabel: "Professional Summary", bodySize: "text-[10.5pt]", order: baseOrder, bullet: "•", padding: "0.75in" },
  minimalist: { headerAlign: "left", nameSize: "text-[26pt]", nameTracking: "tracking-tight", accentRule: "thin", headingStyle: "caps-thin", summaryLabel: "Profile", bodySize: "text-[10.5pt]", order: baseOrder, bullet: "–", padding: "0.85in" },
  engineer: { headerAlign: "left", nameSize: "text-[22pt]", nameTracking: "", accentRule: "solid", headingStyle: "underline", summaryLabel: "Summary", bodySize: "text-[10pt]", order: ["summary","skills","experience","projects","education","certifications","achievements","languages"], bullet: "▪", padding: "0.7in" },
  executive: { headerAlign: "center", nameSize: "text-[24pt]", nameTracking: "tracking-wide", accentRule: "double", headingStyle: "underline", summaryLabel: "Executive Summary", bodySize: "text-[10.5pt]", order: ["summary","experience","achievements","skills","education","certifications","languages","projects"], bullet: "•", padding: "0.8in" },
  academic: { headerAlign: "center", nameSize: "text-[22pt]", nameTracking: "", accentRule: "thin", headingStyle: "caps-thin", summaryLabel: "Research Interests", bodySize: "text-[10.5pt]", order: ["summary","education","experience","projects","achievements","certifications","skills","languages"], bullet: "•", padding: "0.85in" },
  consultant: { headerAlign: "left", nameSize: "text-[22pt]", nameTracking: "", accentRule: "solid", headingStyle: "underline", summaryLabel: "Professional Summary", bodySize: "text-[10.5pt]", order: ["summary","experience","education","skills","achievements","certifications","languages","projects"], bullet: "•", padding: "0.75in" },
  graduate: { headerAlign: "left", nameSize: "text-[22pt]", nameTracking: "", accentRule: "solid", headingStyle: "underline", summaryLabel: "Objective", bodySize: "text-[10.5pt]", order: ["summary","education","projects","experience","skills","certifications","achievements","languages"], bullet: "•", padding: "0.75in" },
  compact: { headerAlign: "left", nameSize: "text-[18pt]", nameTracking: "", accentRule: "thin", headingStyle: "caps-thin", summaryLabel: "Summary", bodySize: "text-[9.5pt]", order: baseOrder, bullet: "•", padding: "0.55in" },
  "technical-lead": { headerAlign: "left", nameSize: "text-[22pt]", nameTracking: "", accentRule: "solid", headingStyle: "left-bar", summaryLabel: "Summary", bodySize: "text-[10pt]", order: ["summary","skills","experience","projects","achievements","education","certifications","languages"], bullet: "▪", padding: "0.7in" },
  sales: { headerAlign: "left", nameSize: "text-[22pt]", nameTracking: "", accentRule: "solid", headingStyle: "underline", summaryLabel: "Sales Profile", bodySize: "text-[10.5pt]", order: ["summary","achievements","experience","skills","education","certifications","languages","projects"], bullet: "•", padding: "0.75in" },
  "creative-clean": { headerAlign: "left", nameSize: "text-[24pt]", nameTracking: "tracking-tight", accentRule: "thin", headingStyle: "left-bar", summaryLabel: "About", bodySize: "text-[10.5pt]", order: baseOrder, bullet: "–", padding: "0.8in" },
  federal: { headerAlign: "left", nameSize: "text-[20pt]", nameTracking: "", accentRule: "solid", headingStyle: "boxed", summaryLabel: "Professional Summary", bodySize: "text-[10.5pt]", order: baseOrder, bullet: "•", padding: "0.9in" },
};

function Heading({ title, style }: { title: string; style: TemplateStyle["headingStyle"] }) {
  if (style === "boxed")
    return <h2 className="text-[10pt] font-bold uppercase tracking-wider border border-black px-2 py-0.5 mb-2 mt-5">{title}</h2>;
  if (style === "caps-thin")
    return <h2 className="text-[9.5pt] font-semibold uppercase tracking-[0.2em] text-neutral-700 mt-5 mb-2">{title}</h2>;
  if (style === "left-bar")
    return <h2 className="text-[10pt] font-bold uppercase tracking-wider border-l-2 border-black pl-2 mt-5 mb-2">{title}</h2>;
  return <h2 className="text-[10pt] font-bold uppercase tracking-wider border-b border-black/70 pb-1 mb-2 mt-5">{title}</h2>;
}

export function ResumePreview({ data }: { data: ResumeData }) {
  const r = data;
  const s = STYLES[r.template] ?? STYLES.professional;
  const contact = [r.email, r.phone, r.location, r.linkedin, r.github, r.website].filter(Boolean);

  const renderSection = (key: SectionKey) => {
    switch (key) {
      case "summary":
        return r.summary ? (
          <section key={key}>
            <Heading title={s.summaryLabel} style={s.headingStyle} />
            <p className={s.bodySize}>{r.summary}</p>
          </section>
        ) : null;
      case "skills":
        return (r.skills.technical.length || r.skills.soft.length) ? (
          <section key={key}>
            <Heading title="Skills" style={s.headingStyle} />
            {r.skills.technical.length > 0 && (
              <p className="text-[10pt]"><span className="font-semibold">Technical:</span> {r.skills.technical.join(", ")}</p>
            )}
            {r.skills.soft.length > 0 && (
              <p className="text-[10pt] mt-0.5"><span className="font-semibold">Soft:</span> {r.skills.soft.join(", ")}</p>
            )}
          </section>
        ) : null;
      case "experience":
        return r.experience.length ? (
          <section key={key}>
            <Heading title="Experience" style={s.headingStyle} />
            {r.experience.map((e) => (
              <div key={e.id} className="mb-3">
                <div className="flex justify-between gap-3 text-[11pt]">
                  <strong>{e.role}{e.company ? <> — <span className="font-normal">{e.company}</span></> : null}</strong>
                  <span className="text-[9.5pt] text-neutral-700 whitespace-nowrap">
                    {[e.startDate, e.endDate].filter(Boolean).join(" – ")}
                  </span>
                </div>
                {e.location && <p className="text-[9pt] text-neutral-600">{e.location}</p>}
                <ul className="list-none ml-0 mt-1 text-[10pt] space-y-0.5">
                  {e.bullets.filter(Boolean).map((b, i) => (
                    <li key={i} className="pl-4 -indent-4">{s.bullet}  {b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        ) : null;
      case "projects":
        return r.projects.length ? (
          <section key={key}>
            <Heading title="Projects" style={s.headingStyle} />
            {r.projects.map((p) => (
              <div key={p.id} className="mb-2">
                <div className="text-[11pt]"><strong>{p.name}</strong>{p.tech && <span className="text-neutral-700"> · {p.tech}</span>}</div>
                {p.description && <p className="text-[10pt]">{p.description}</p>}
                {p.link && <p className="text-[9pt] text-neutral-700">{p.link}</p>}
              </div>
            ))}
          </section>
        ) : null;
      case "education":
        return r.education.length ? (
          <section key={key}>
            <Heading title="Education" style={s.headingStyle} />
            {r.education.map((e) => (
              <div key={e.id} className="mb-1.5">
                <div className="flex justify-between text-[11pt]">
                  <strong>{e.degree}{e.field ? `, ${e.field}` : ""}{e.school ? <> — <span className="font-normal">{e.school}</span></> : null}</strong>
                  <span className="text-[9.5pt] text-neutral-700 whitespace-nowrap">
                    {[e.startDate, e.endDate].filter(Boolean).join(" – ")}
                  </span>
                </div>
                {e.details && <p className="text-[10pt]">{e.details}</p>}
              </div>
            ))}
          </section>
        ) : null;
      case "certifications":
        return r.certifications.length ? (
          <section key={key}>
            <Heading title="Certifications" style={s.headingStyle} />
            <ul className="list-disc ml-5 text-[10pt]">{r.certifications.map((c, i) => <li key={i}>{c}</li>)}</ul>
          </section>
        ) : null;
      case "achievements":
        return r.achievements.length ? (
          <section key={key}>
            <Heading title="Achievements" style={s.headingStyle} />
            <ul className="list-disc ml-5 text-[10pt]">{r.achievements.map((c, i) => <li key={i}>{c}</li>)}</ul>
          </section>
        ) : null;
      case "languages":
        return r.languages.length ? (
          <section key={key}>
            <Heading title="Languages" style={s.headingStyle} />
            <p className="text-[10pt]">{r.languages.join(", ")}</p>
          </section>
        ) : null;
    }
  };

  const rule =
    s.accentRule === "double" ? "border-t-[3px] border-double border-black mt-3" :
    s.accentRule === "thin" ? "border-t border-neutral-400 mt-3" :
    s.accentRule === "none" ? "mt-3" :
    "border-t border-black/70 mt-3";

  return (
    <div className="resume-canvas mx-auto shadow-sm" style={{ width: "8.5in", minHeight: "11in", padding: s.padding }}>
      <header className={s.headerAlign === "center" ? "text-center" : ""}>
        <h1 className={`font-bold leading-tight ${s.nameSize} ${s.nameTracking}`}>
          {r.fullName || "Your Name"}
        </h1>
        {r.title && <p className="text-[11pt] mt-0.5 text-neutral-700">{r.title}</p>}
        {contact.length > 0 && (
          <p className="text-[9pt] mt-1 text-neutral-700">{contact.join("  |  ")}</p>
        )}
      </header>
      <div className={rule} />

      {s.order.map((k) => renderSection(k))}
    </div>
  );
}
