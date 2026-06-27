import type { Metadata } from "next";
import type { ReactNode } from "react";

// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: "Upload — Inkwell Resume",
  description: "Import an existing PDF or DOCX resume and let AI structure it.",
};

export default function UploadLayout({ children }: { children: ReactNode }) {
  return children;
}
