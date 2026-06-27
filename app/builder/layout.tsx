import type { Metadata } from "next";
import type { ReactNode } from "react";

// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: "Builder — Inkwell Resume",
  description: "Edit and optimize your ATS-friendly resume.",
};

export default function BuilderLayout({ children }: { children: ReactNode }) {
  return children;
}
