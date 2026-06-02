import type { ResumeData } from "@/lib/resume-types";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-5">
      <h2 className="text-[10pt] font-bold uppercase tracking-wider border-b border-black/70 pb-1 mb-2">{title}</h2>
      {children}
    </section>
  );
}

export function ResumePreview({ data }: { data: ResumeData }) {
  const r = data;
  const t = r.template;
  const contact = [r.email, r.phone, r.location, r.linkedin, r.github, r.website].filter(Boolean);

  const HeaderBlock = (
    <header className={t === "executive" ? "text-center" : ""}>
      <h1
        className={`font-bold leading-tight ${
          t === "minimalist" ? "text-[26pt] tracking-tight" : "text-[22pt]"
        }`}
      >
        {r.fullName || "Your Name"}
      </h1>
      {r.title && <p className="text-[11pt] mt-0.5 text-neutral-700">{r.title}</p>}
      {contact.length > 0 && (
        <p className="text-[9pt] mt-1 text-neutral-700">
          {contact.join("  |  ")}
        </p>
      )}
    </header>
  );

  return (
    <div className="resume-canvas mx-auto shadow-sm" style={{ width: "8.5in", minHeight: "11in", padding: "0.75in" }}>
      {HeaderBlock}
      <div className="border-t border-black/70 mt-3" />

      {r.summary && (
        <Section title={t === "executive" ? "Executive Summary" : "Professional Summary"}>
          <p className="text-[10.5pt]">{r.summary}</p>
        </Section>
      )}

      {(r.skills.technical.length > 0 || r.skills.soft.length > 0) && (
        <Section title="Skills">
          {r.skills.technical.length > 0 && (
            <p className="text-[10pt]"><span className="font-semibold">Technical:</span> {r.skills.technical.join(", ")}</p>
          )}
          {r.skills.soft.length > 0 && (
            <p className="text-[10pt] mt-0.5"><span className="font-semibold">Soft:</span> {r.skills.soft.join(", ")}</p>
          )}
        </Section>
      )}

      {r.experience.length > 0 && (
        <Section title="Experience">
          {r.experience.map((e) => (
            <div key={e.id} className="mb-3">
              <div className="flex justify-between gap-3 text-[11pt]">
                <strong>{e.role}{e.company ? <> — <span className="font-normal">{e.company}</span></> : null}</strong>
                <span className="text-[9.5pt] text-neutral-700 whitespace-nowrap">
                  {[e.startDate, e.endDate].filter(Boolean).join(" – ")}
                </span>
              </div>
              {e.location && <p className="text-[9pt] text-neutral-600">{e.location}</p>}
              <ul className="list-disc ml-5 mt-1 text-[10pt] space-y-0.5">
                {e.bullets.filter(Boolean).map((b, i) => <li key={i}>{b}</li>)}
              </ul>
            </div>
          ))}
        </Section>
      )}

      {(t === "engineer" || r.projects.length > 0) && r.projects.length > 0 && (
        <Section title="Projects">
          {r.projects.map((p) => (
            <div key={p.id} className="mb-2">
              <div className="text-[11pt]"><strong>{p.name}</strong>{p.tech && <span className="text-neutral-700"> · {p.tech}</span>}</div>
              {p.description && <p className="text-[10pt]">{p.description}</p>}
              {p.link && <p className="text-[9pt] text-neutral-700">{p.link}</p>}
            </div>
          ))}
        </Section>
      )}

      {r.education.length > 0 && (
        <Section title="Education">
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
        </Section>
      )}

      {r.certifications.length > 0 && (
        <Section title="Certifications">
          <ul className="list-disc ml-5 text-[10pt]">{r.certifications.map((c, i) => <li key={i}>{c}</li>)}</ul>
        </Section>
      )}

      {r.achievements.length > 0 && (
        <Section title="Achievements">
          <ul className="list-disc ml-5 text-[10pt]">{r.achievements.map((c, i) => <li key={i}>{c}</li>)}</ul>
        </Section>
      )}

      {r.languages.length > 0 && (
        <Section title="Languages">
          <p className="text-[10pt]">{r.languages.join(", ")}</p>
        </Section>
      )}
    </div>
  );
}
