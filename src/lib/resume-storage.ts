import { uid } from "./utils";
import { emptyResume, type ResumeData } from "./resume-types";

const RESUMES_KEY = "ats-resumes-v1";
const CURRENT_RESUME_KEY = "ats-current-resume-id";

export interface SavedResume {
  id: string;
  name: string;
  updatedAt: number;
  data: ResumeData;
}

function parse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function getResumes(): SavedResume[] {
  if (typeof window === "undefined") return [];
  return parse<SavedResume[]>(localStorage.getItem(RESUMES_KEY), []);
}

export function setResumes(resumes: SavedResume[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(RESUMES_KEY, JSON.stringify(resumes));
}

export function getCurrentResumeId(): string | null {
  if (typeof window === "undefined") return null;
  return parse<string | null>(localStorage.getItem(CURRENT_RESUME_KEY), null);
}

export function setCurrentResumeId(id: string | null) {
  if (typeof window === "undefined") return;
  if (id) {
    localStorage.setItem(CURRENT_RESUME_KEY, JSON.stringify(id));
  } else {
    localStorage.removeItem(CURRENT_RESUME_KEY);
  }
}

export function getResumeById(id: string): SavedResume | undefined {
  return getResumes().find((r) => r.id === id);
}

export function createResume(name: string, data: ResumeData = emptyResume): SavedResume {
  const resume: SavedResume = {
    id: uid(),
    name,
    updatedAt: Date.now(),
    data,
  };
  const resumes = getResumes();
  setResumes([resume, ...resumes]);
  return resume;
}

export function updateResume(id: string, patch: Partial<Pick<SavedResume, "name" | "data">>) {
  const resumes = getResumes();
  const next = resumes.map((r) => (r.id === id ? { ...r, ...patch, updatedAt: Date.now() } : r));
  setResumes(next);
}

export function deleteResume(id: string) {
  const resumes = getResumes().filter((r) => r.id !== id);
  setResumes(resumes);
  if (getCurrentResumeId() === id) {
    setCurrentResumeId(null);
  }
}

export function saveCurrent(data: ResumeData, fallbackName?: string) {
  const currentId = getCurrentResumeId();
  if (currentId) {
    updateResume(currentId, { data });
    return currentId;
  }
  const name = fallbackName?.trim() || "Untitled resume";
  const resume = createResume(name, data);
  setCurrentResumeId(resume.id);
  return resume.id;
}
