import { jsPDF } from "jspdf";
import { strToU8, zip } from "fflate";
import type { Education, Experience, Project, ResumeData } from "./resume-types";

/* Single-column, selectable-text, ATS-friendly PDF.
 * Font: Helvetica (jsPDF built-in; visually similar to Arial/Calibri). */

const MARGIN = 54; // 0.75in @ 72dpi
const PAGE_W = 612; // US Letter
const PAGE_H = 792;
const CONTENT_W = PAGE_W - MARGIN * 2;

export function formatContact(r: ResumeData) {
  return [r.email, r.phone, r.location, r.linkedin, r.github, r.website]
    .filter(Boolean)
    .join("  |  ");
}

type ResumeSection =
  | { kind: "summary"; text: string }
  | { kind: "skills"; technical: string[]; soft: string[] }
  | { kind: "experience"; items: Experience[] }
  | { kind: "projects"; items: Project[] }
  | { kind: "education"; items: Education[] }
  | { kind: "list"; title: string; items: string[] };

function buildSections(r: ResumeData): ResumeSection[] {
  const sections: ResumeSection[] = [];
  if (r.summary) sections.push({ kind: "summary", text: r.summary });
  if (r.skills.technical.length || r.skills.soft.length) {
    sections.push({ kind: "skills", technical: r.skills.technical, soft: r.skills.soft });
  }
  if (r.experience.length) sections.push({ kind: "experience", items: r.experience });
  if (r.projects.length) sections.push({ kind: "projects", items: r.projects });
  if (r.education.length) sections.push({ kind: "education", items: r.education });
  if (r.certifications.length)
    sections.push({ kind: "list", title: "Certifications", items: r.certifications });
  if (r.achievements.length)
    sections.push({ kind: "list", title: "Achievements", items: r.achievements });
  if (r.languages.length) sections.push({ kind: "list", title: "Languages", items: r.languages });
  return sections;
}

export function exportResumePdf(r: ResumeData, filename = "resume.pdf") {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  let y = MARGIN;

  const ensureSpace = (h: number) => {
    if (y + h > PAGE_H - MARGIN) {
      doc.addPage();
      y = MARGIN;
    }
  };

  const writeWrapped = (text: string, opts: { size: number; bold?: boolean; gap?: number }) => {
    doc.setFont("helvetica", opts.bold ? "bold" : "normal");
    doc.setFontSize(opts.size);
    const lines = doc.splitTextToSize(text, CONTENT_W) as string[];
    const lh = opts.size * 1.25;
    for (const ln of lines) {
      ensureSpace(lh);
      doc.text(ln, MARGIN, y);
      y += lh;
    }
    if (opts.gap) y += opts.gap;
  };

  const heading = (label: string) => {
    ensureSpace(28);
    y += 6;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(label.toUpperCase(), MARGIN, y);
    y += 4;
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.line(MARGIN, y, MARGIN + CONTENT_W, y);
    y += 12;
  };

  if (r.fullName) writeWrapped(r.fullName, { size: 20, bold: true });
  if (r.title) writeWrapped(r.title, { size: 11, gap: 2 });
  const contact = formatContact(r);
  if (contact) writeWrapped(contact, { size: 9, gap: 4 });

  for (const section of buildSections(r)) {
    switch (section.kind) {
      case "summary":
        heading("Professional Summary");
        writeWrapped(section.text, { size: 10 });
        break;
      case "skills":
        heading("Skills");
        if (section.technical.length)
          writeWrapped(`Technical: ${section.technical.join(", ")}`, { size: 10 });
        if (section.soft.length) writeWrapped(`Soft: ${section.soft.join(", ")}`, { size: 10 });
        break;
      case "experience":
        heading("Experience");
        for (const e of section.items) {
          writeWrapped(`${e.role}${e.company ? ` — ${e.company}` : ""}`, { size: 11, bold: true });
          const meta = [e.location, [e.startDate, e.endDate].filter(Boolean).join(" – ")]
            .filter(Boolean)
            .join("  |  ");
          if (meta) writeWrapped(meta, { size: 9, gap: 2 });
          e.bullets.filter(Boolean).forEach((b) => writeWrapped(`•  ${b}`, { size: 10 }));
          y += 4;
        }
        break;
      case "projects":
        heading("Projects");
        for (const p of section.items) {
          writeWrapped(`${p.name}${p.tech ? ` (${p.tech})` : ""}`, { size: 11, bold: true });
          if (p.link) writeWrapped(p.link, { size: 9, gap: 2 });
          if (p.description) writeWrapped(p.description, { size: 10, gap: 4 });
        }
        break;
      case "education":
        heading("Education");
        for (const e of section.items) {
          writeWrapped(
            `${e.degree}${e.field ? `, ${e.field}` : ""}${e.school ? ` — ${e.school}` : ""}`,
            { size: 11, bold: true },
          );
          const meta = [e.startDate, e.endDate].filter(Boolean).join(" – ");
          if (meta) writeWrapped(meta, { size: 9, gap: 2 });
          if (e.details) writeWrapped(e.details, { size: 10, gap: 2 });
        }
        break;
      case "list":
        heading(section.title);
        if (section.title === "Languages") {
          writeWrapped(section.items.join(", "), { size: 10 });
        } else {
          section.items.forEach((item) => writeWrapped(`•  ${item}`, { size: 10 }));
        }
        break;
    }
  }

  doc.save(filename);
}

/* Minimal DOCX export — well-formed Office Open XML */
export async function exportResumeDocx(r: ResumeData, filename = "resume.docx") {
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const para = (text: string, opts: { bold?: boolean; size?: number; heading?: boolean } = {}) => {
    const sz = (opts.size ?? 22).toString();
    const b = opts.bold ? "<w:b/>" : "";
    return `<w:p><w:pPr>${opts.heading ? '<w:pStyle w:val="Heading1"/>' : ""}</w:pPr><w:r><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>${b}<w:sz w:val="${sz}"/></w:rPr><w:t xml:space="preserve">${esc(text)}</w:t></w:r></w:p>`;
  };
  const heading = (t: string) => para(t.toUpperCase(), { bold: true, size: 24, heading: true });

  const body: string[] = [];
  if (r.fullName) body.push(para(r.fullName, { bold: true, size: 36 }));
  if (r.title) body.push(para(r.title, { size: 22 }));
  const contact = formatContact(r);
  if (contact) body.push(para(contact, { size: 18 }));

  for (const section of buildSections(r)) {
    switch (section.kind) {
      case "summary":
        body.push(heading("Professional Summary"));
        body.push(para(section.text));
        break;
      case "skills":
        body.push(heading("Skills"));
        if (section.technical.length) body.push(para(`Technical: ${section.technical.join(", ")}`));
        if (section.soft.length) body.push(para(`Soft: ${section.soft.join(", ")}`));
        break;
      case "experience":
        body.push(heading("Experience"));
        for (const e of section.items) {
          body.push(para(`${e.role} — ${e.company}`, { bold: true }));
          body.push(
            para(
              [e.location, [e.startDate, e.endDate].filter(Boolean).join(" – ")]
                .filter(Boolean)
                .join("  |  "),
              { size: 18 },
            ),
          );
          e.bullets.forEach((b) => body.push(para(`•  ${b}`)));
        }
        break;
      case "projects":
        body.push(heading("Projects"));
        for (const p of section.items) {
          body.push(para(`${p.name}${p.tech ? ` (${p.tech})` : ""}`, { bold: true }));
          if (p.link) body.push(para(p.link, { size: 18 }));
          if (p.description) body.push(para(p.description));
        }
        break;
      case "education":
        body.push(heading("Education"));
        for (const e of section.items) {
          body.push(
            para(`${e.degree}${e.field ? `, ${e.field}` : ""} — ${e.school}`, { bold: true }),
          );
          body.push(para([e.startDate, e.endDate].filter(Boolean).join(" – "), { size: 18 }));
          if (e.details) body.push(para(e.details));
        }
        break;
      case "list":
        body.push(heading(section.title));
        if (section.title === "Languages") {
          body.push(para(section.items.join(", ")));
        } else {
          section.items.forEach((item) => body.push(para(`•  ${item}`)));
        }
        break;
    }
  }

  const documentXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
<w:body>${body.join("")}<w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1080" w:right="1080" w:bottom="1080" w:left="1080" w:header="720" w:footer="720" w:gutter="0"/></w:sectPr></w:body>
</w:document>`;

  const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
<Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`;

  const relsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`;

  const zipped = await new Promise<Uint8Array>((resolve, reject) => {
    zip(
      {
        "[Content_Types].xml": strToU8(contentTypesXml),
        "_rels/.rels": strToU8(relsXml),
        "word/document.xml": strToU8(documentXml),
      },
      (err, data) => (err ? reject(err) : resolve(data)),
    );
  });

  const blob = new Blob([zipped.buffer as ArrayBuffer], {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
