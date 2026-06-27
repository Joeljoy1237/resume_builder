import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

// eslint-disable-next-line react-refresh/only-export-components
export const metadata: Metadata = {
  title: "ResumeBuilder",
  description:
    "AI Resume Pro builds ATS-friendly resumes with AI-powered analysis, content generation, and optimization.",
  authors: [{ name: "Inkwell" }],
  openGraph: {
    title: "ResumeBuilder",
    description:
      "AI Resume Pro builds ATS-friendly resumes with AI-powered analysis, content generation, and optimization.",
    type: "website",
    images: [
      "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/272b566e-08a1-4e88-b4b5-6bce4c41f2ba/id-preview-669938f3--8432838e-66e3-4487-89d4-63888cb1ae6d.lovable.app-1780385892128.png",
    ],
  },
  twitter: {
    card: "summary",
    title: "ResumeBuilder",
    description:
      "AI Resume Pro builds ATS-friendly resumes with AI-powered analysis, content generation, and optimization.",
    images: [
      "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/272b566e-08a1-4e88-b4b5-6bce4c41f2ba/id-preview-669938f3--8432838e-66e3-4487-89d4-63888cb1ae6d.lovable.app-1780385892128.png",
    ],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          {children}
          <Toaster richColors position="top-center" />
        </Providers>
      </body>
    </html>
  );
}
