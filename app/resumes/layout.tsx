import type { Metadata } from "next";
import type { ReactNode } from "react";

// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: "My Resumes — Inkwell Resume",
  description: "Create, edit, and manage your saved resumes.",
};

export default function ResumesLayout({ children }: { children: ReactNode }) {
  return children;
}
