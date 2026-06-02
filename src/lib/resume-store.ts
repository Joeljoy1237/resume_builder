import { create } from "zustand";
import { persist } from "zustand/middleware";
import { emptyResume, type ResumeData, type TemplateId } from "./resume-types";

interface ResumeStore {
  data: ResumeData;
  set: (patch: Partial<ResumeData>) => void;
  setTemplate: (t: TemplateId) => void;
  replace: (data: ResumeData) => void;
  reset: () => void;
}

export const useResumeStore = create<ResumeStore>()(
  persist(
    (set) => ({
      data: emptyResume,
      set: (patch) => set((s) => ({ data: { ...s.data, ...patch } })),
      setTemplate: (t) => set((s) => ({ data: { ...s.data, template: t } })),
      replace: (data) => set({ data }),
      reset: () => set({ data: emptyResume }),
    }),
    { name: "ats-resume-v1" }
  )
);
