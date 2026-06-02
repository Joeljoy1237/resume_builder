export type TemplateId =
  | "professional"
  | "minimalist"
  | "engineer"
  | "executive";

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
];
