/* Client-side resume file parsing: PDF via pdfjs, DOCX via mammoth */

export async function extractTextFromFile(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  if (name.endsWith(".pdf")) return extractFromPdf(file);
  if (name.endsWith(".docx")) return extractFromDocx(file);
  if (name.endsWith(".txt")) return file.text();
  throw new Error("Unsupported file type. Upload PDF or DOCX.");
}

async function extractFromPdf(file: File): Promise<string> {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
  const buf = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: new Uint8Array(buf) }).promise;
  let text = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text +=
      content.items.map((it: unknown) => (it as { str?: string }).str ?? "").join(" ") + "\n\n";
  }
  return text.trim();
}

async function extractFromDocx(file: File): Promise<string> {
  const mammoth = await import("mammoth");
  const buf = await file.arrayBuffer();
  const res = await mammoth.extractRawText({ arrayBuffer: buf });
  return res.value.trim();
}

/* Convert resume data back to plain text for scoring */
import { formatContact } from "./pdf-export";
import type { ResumeData } from "./resume-types";
export function resumeToText(r: ResumeData): string {
  const lines: string[] = [];
  lines.push(r.fullName, r.title, formatContact(r).replace(/ {2}\| {2}/g, " | "));

  if (r.summary) lines.push("\nSUMMARY", r.summary);
  if (r.skills.technical.length || r.skills.soft.length) {
    lines.push("\nSKILLS", [...r.skills.technical, ...r.skills.soft].join(", "));
  }
  if (r.experience.length) {
    lines.push("\nEXPERIENCE");
    r.experience.forEach((e) => {
      lines.push(`${e.role} — ${e.company} (${e.startDate}–${e.endDate})`);
      e.bullets.forEach((b) => lines.push(`- ${b}`));
    });
  }
  if (r.education.length) {
    lines.push("\nEDUCATION");
    r.education.forEach((e) =>
      lines.push(`${e.degree} ${e.field ?? ""} — ${e.school} (${e.startDate}–${e.endDate})`),
    );
  }
  if (r.projects.length) {
    lines.push("\nPROJECTS");
    r.projects.forEach((p) =>
      lines.push(`${p.name}: ${p.description}${p.tech ? ` [${p.tech}]` : ""}`),
    );
  }
  if (r.certifications.length) lines.push("\nCERTIFICATIONS", r.certifications.join(", "));
  if (r.achievements.length) lines.push("\nACHIEVEMENTS", r.achievements.join("\n"));
  if (r.languages.length) lines.push("\nLANGUAGES", r.languages.join(", "));
  return lines.filter(Boolean).join("\n");
}
