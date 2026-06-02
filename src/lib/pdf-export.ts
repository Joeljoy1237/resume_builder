import { jsPDF } from "jspdf";
import type { ResumeData } from "./resume-types";

/* Single-column, selectable-text, ATS-friendly PDF.
 * Font: Helvetica (jsPDF built-in; visually similar to Arial/Calibri). */

const MARGIN = 54; // 0.75in @ 72dpi
const PAGE_W = 612; // US Letter
const PAGE_H = 792;
const CONTENT_W = PAGE_W - MARGIN * 2;

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

  // Header
  if (r.fullName) writeWrapped(r.fullName, { size: 20, bold: true });
  if (r.title) writeWrapped(r.title, { size: 11, gap: 2 });
  const contact = [r.email, r.phone, r.location, r.linkedin, r.github, r.website].filter(Boolean).join("  |  ");
  if (contact) writeWrapped(contact, { size: 9, gap: 4 });

  // Summary
  if (r.summary) {
    heading("Professional Summary");
    writeWrapped(r.summary, { size: 10 });
  }

  // Skills
  if (r.skills.technical.length || r.skills.soft.length) {
    heading("Skills");
    if (r.skills.technical.length)
      writeWrapped(`Technical: ${r.skills.technical.join(", ")}`, { size: 10 });
    if (r.skills.soft.length)
      writeWrapped(`Soft: ${r.skills.soft.join(", ")}`, { size: 10 });
  }

  // Experience
  if (r.experience.length) {
    heading("Experience");
    r.experience.forEach((e) => {
      writeWrapped(`${e.role}${e.company ? ` — ${e.company}` : ""}`, { size: 11, bold: true });
      const meta = [e.location, [e.startDate, e.endDate].filter(Boolean).join(" – ")].filter(Boolean).join("  |  ");
      if (meta) writeWrapped(meta, { size: 9, gap: 2 });
      e.bullets.filter(Boolean).forEach((b) => writeWrapped(`•  ${b}`, { size: 10 }));
      y += 4;
    });
  }

  // Projects
  if (r.projects.length) {
    heading("Projects");
    r.projects.forEach((p) => {
      writeWrapped(`${p.name}${p.tech ? ` (${p.tech})` : ""}`, { size: 11, bold: true });
      if (p.link) writeWrapped(p.link, { size: 9, gap: 2 });
      if (p.description) writeWrapped(p.description, { size: 10, gap: 4 });
    });
  }

  // Education
  if (r.education.length) {
    heading("Education");
    r.education.forEach((e) => {
      writeWrapped(`${e.degree}${e.field ? `, ${e.field}` : ""}${e.school ? ` — ${e.school}` : ""}`, {
        size: 11,
        bold: true,
      });
      const meta = [e.startDate, e.endDate].filter(Boolean).join(" – ");
      if (meta) writeWrapped(meta, { size: 9, gap: 2 });
      if (e.details) writeWrapped(e.details, { size: 10, gap: 2 });
    });
  }

  if (r.certifications.length) {
    heading("Certifications");
    r.certifications.forEach((c) => writeWrapped(`•  ${c}`, { size: 10 }));
  }
  if (r.achievements.length) {
    heading("Achievements");
    r.achievements.forEach((a) => writeWrapped(`•  ${a}`, { size: 10 }));
  }
  if (r.languages.length) {
    heading("Languages");
    writeWrapped(r.languages.join(", "), { size: 10 });
  }

  doc.save(filename);
}

/* Minimal DOCX export — well-formed Office Open XML */
export async function exportResumeDocx(r: ResumeData, filename = "resume.docx") {
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const para = (text: string, opts: { bold?: boolean; size?: number; heading?: boolean } = {}) => {
    const sz = (opts.size ?? 22).toString(); // half-points: 22 = 11pt
    const b = opts.bold ? "<w:b/>" : "";
    return `<w:p><w:pPr>${opts.heading ? '<w:pStyle w:val="Heading1"/>' : ""}</w:pPr><w:r><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>${b}<w:sz w:val="${sz}"/></w:rPr><w:t xml:space="preserve">${esc(text)}</w:t></w:r></w:p>`;
  };
  const heading = (t: string) => para(t.toUpperCase(), { bold: true, size: 24, heading: true });

  const body: string[] = [];
  if (r.fullName) body.push(para(r.fullName, { bold: true, size: 36 }));
  if (r.title) body.push(para(r.title, { size: 22 }));
  const contact = [r.email, r.phone, r.location, r.linkedin, r.github, r.website].filter(Boolean).join("  |  ");
  if (contact) body.push(para(contact, { size: 18 }));

  if (r.summary) { body.push(heading("Professional Summary")); body.push(para(r.summary)); }
  if (r.skills.technical.length || r.skills.soft.length) {
    body.push(heading("Skills"));
    if (r.skills.technical.length) body.push(para(`Technical: ${r.skills.technical.join(", ")}`));
    if (r.skills.soft.length) body.push(para(`Soft: ${r.skills.soft.join(", ")}`));
  }
  if (r.experience.length) {
    body.push(heading("Experience"));
    r.experience.forEach((e) => {
      body.push(para(`${e.role} — ${e.company}`, { bold: true }));
      body.push(para([e.location, [e.startDate, e.endDate].filter(Boolean).join(" – ")].filter(Boolean).join("  |  "), { size: 18 }));
      e.bullets.forEach((b) => body.push(para(`•  ${b}`)));
    });
  }
  if (r.projects.length) {
    body.push(heading("Projects"));
    r.projects.forEach((p) => {
      body.push(para(`${p.name}${p.tech ? ` (${p.tech})` : ""}`, { bold: true }));
      if (p.description) body.push(para(p.description));
    });
  }
  if (r.education.length) {
    body.push(heading("Education"));
    r.education.forEach((e) => {
      body.push(para(`${e.degree}${e.field ? `, ${e.field}` : ""} — ${e.school}`, { bold: true }));
      body.push(para([e.startDate, e.endDate].filter(Boolean).join(" – "), { size: 18 }));
    });
  }
  if (r.certifications.length) { body.push(heading("Certifications")); r.certifications.forEach((c) => body.push(para(`•  ${c}`))); }
  if (r.achievements.length) { body.push(heading("Achievements")); r.achievements.forEach((a) => body.push(para(`•  ${a}`))); }
  if (r.languages.length) { body.push(heading("Languages")); body.push(para(r.languages.join(", "))); }

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

  // Build zip via tiny inline zipper using browser CompressionStream
  const blob = await buildZip([
    { path: "[Content_Types].xml", data: contentTypesXml },
    { path: "_rels/.rels", data: relsXml },
    { path: "word/document.xml", data: documentXml },
  ]);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* ── Minimal STORE-only ZIP writer (no deps) ───────────────────────── */
async function buildZip(files: { path: string; data: string }[]): Promise<Blob> {
  const enc = new TextEncoder();
  const fileRecords: Uint8Array[] = [];
  const centralRecords: Uint8Array[] = [];
  let offset = 0;

  const crc32 = (data: Uint8Array) => {
    let c = 0xffffffff;
    for (let i = 0; i < data.length; i++) {
      c ^= data[i];
      for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
    }
    return (c ^ 0xffffffff) >>> 0;
  };

  for (const f of files) {
    const nameBytes = enc.encode(f.path);
    const dataBytes = enc.encode(f.data);
    const crc = crc32(dataBytes);
    const local = new Uint8Array(30 + nameBytes.length + dataBytes.length);
    const dv = new DataView(local.buffer);
    dv.setUint32(0, 0x04034b50, true);
    dv.setUint16(4, 20, true); dv.setUint16(6, 0, true); dv.setUint16(8, 0, true);
    dv.setUint16(10, 0, true); dv.setUint16(12, 0, true);
    dv.setUint32(14, crc, true);
    dv.setUint32(18, dataBytes.length, true);
    dv.setUint32(22, dataBytes.length, true);
    dv.setUint16(26, nameBytes.length, true); dv.setUint16(28, 0, true);
    local.set(nameBytes, 30);
    local.set(dataBytes, 30 + nameBytes.length);
    fileRecords.push(local);

    const central = new Uint8Array(46 + nameBytes.length);
    const cv = new DataView(central.buffer);
    cv.setUint32(0, 0x02014b50, true);
    cv.setUint16(4, 20, true); cv.setUint16(6, 20, true);
    cv.setUint16(8, 0, true); cv.setUint16(10, 0, true);
    cv.setUint16(12, 0, true); cv.setUint16(14, 0, true);
    cv.setUint32(16, crc, true);
    cv.setUint32(20, dataBytes.length, true);
    cv.setUint32(24, dataBytes.length, true);
    cv.setUint16(28, nameBytes.length, true);
    cv.setUint16(30, 0, true); cv.setUint16(32, 0, true);
    cv.setUint16(34, 0, true); cv.setUint16(36, 0, true);
    cv.setUint32(38, 0, true);
    cv.setUint32(42, offset, true);
    central.set(nameBytes, 46);
    centralRecords.push(central);

    offset += local.length;
  }

  const centralSize = centralRecords.reduce((s, r) => s + r.length, 0);
  const end = new Uint8Array(22);
  const ev = new DataView(end.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(8, files.length, true);
  ev.setUint16(10, files.length, true);
  ev.setUint32(12, centralSize, true);
  ev.setUint32(16, offset, true);

  const parts: BlobPart[] = [
    ...fileRecords.map((u) => u.buffer.slice(u.byteOffset, u.byteOffset + u.byteLength) as ArrayBuffer),
    ...centralRecords.map((u) => u.buffer.slice(u.byteOffset, u.byteOffset + u.byteLength) as ArrayBuffer),
    end.buffer.slice(end.byteOffset, end.byteOffset + end.byteLength) as ArrayBuffer,
  ];
  return new Blob(parts, {
    type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
}
