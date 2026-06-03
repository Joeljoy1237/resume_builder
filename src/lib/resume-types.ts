export type TemplateId =
  | "professional"
  | "minimalist"
  | "engineer"
  | "executive"
  | "academic"
  | "consultant"
  | "graduate"
  | "compact"
  | "technical-lead"
  | "sales"
  | "creative-clean"
  | "federal";

export interface Experience {
  id: string;
  company: string;
  role: string;
  location?: string;
  startDate: string;
  endDate: string;
  bullets: string[];
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  field?: string;
  startDate: string;
  endDate: string;
  details?: string;
}

export interface Project {
  id: string;
  name: string;
  link?: string;
  description: string;
  tech?: string;
}

export interface ResumeData {
  template: TemplateId;
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  website: string;
  summary: string;
  skills: { technical: string[]; soft: string[] };
  experience: Experience[];
  education: Education[];
  projects: Project[];
  certifications: string[];
  achievements: string[];
  languages: string[];
}

export const emptyResume: ResumeData = {
  template: "professional",
  fullName: "",
  title: "",
  email: "",
  phone: "",
  location: "",
  linkedin: "",
  github: "",
  website: "",
  summary: "",
  skills: { technical: [], soft: [] },
  experience: [],
  education: [],
  projects: [],
  certifications: [],
  achievements: [],
  languages: [],
};

export const TEMPLATES: { id: TemplateId; name: string; ats: number; description: string }[] = [
  { id: "professional", name: "Professional Corporate", ats: 98, description: "Classic single-column. Safe everywhere." },
  { id: "minimalist", name: "Modern Minimalist", ats: 96, description: "Generous whitespace, refined typography." },
  { id: "engineer", name: "Software Engineer", ats: 97, description: "Projects + tech-forward, dense and scannable." },
  { id: "executive", name: "Executive", ats: 95, description: "Leadership-first with achievement highlights." },
  { id: "academic", name: "Academic / CV", ats: 96, description: "Education-led for researchers and faculty." },
  { id: "consultant", name: "Management Consultant", ats: 97, description: "Impact-driven bullets, MBB-style structure." },
  { id: "graduate", name: "New Graduate", ats: 98, description: "Entry-level with education and projects up top." },
  { id: "compact", name: "Compact One-Page", ats: 96, description: "Tight spacing to fit a dense career on one page." },
  { id: "technical-lead", name: "Technical Lead", ats: 97, description: "Skills matrix prominent, leadership context." },
  { id: "sales", name: "Sales & Revenue", ats: 96, description: "Quota and revenue metrics emphasized." },
  { id: "creative-clean", name: "Creative Clean", ats: 94, description: "Subtle accent rule, still fully parseable." },
  { id: "federal", name: "Federal / Government", ats: 99, description: "Long-form, formal, maximum parser safety." },
];
