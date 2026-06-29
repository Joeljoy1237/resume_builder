"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { FileText, Upload, PenTool, FilePlus, ExternalLink, Menu, X, Library } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useResumeStore } from "@/lib/resume-store";
import { createResume, setCurrentResumeId } from "@/lib/resume-storage";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/resumes", label: "Resumes", icon: Library },
  { href: "/upload", label: "Upload", icon: Upload },
];

export function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleNew = () => {
    const resume = createResume("Untitled resume");
    useResumeStore.getState().replace(resume.data);
    setCurrentResumeId(resume.id);
    router.push("/builder");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-2 motion-safe:duration-500">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="flex items-center gap-2 group rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          <div className="size-8 grid place-items-center bg-primary text-primary-foreground rounded-md shadow-sm transition-transform duration-200 group-hover:scale-105">
            <FileText className="size-4" />
          </div>
          <span className="font-display text-xl tracking-tight">
            Inkwell<span className="text-muted-foreground font-normal">/Resume</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  active
                    ? "bg-secondary font-medium text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
                )}
              >
                <Icon className="size-3.5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={handleNew}
            className="hidden sm:inline-flex gap-1.5 cursor-pointer transition-colors duration-200"
          >
            <FilePlus className="size-3.5" />
            New resume
          </Button>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="md:hidden inline-flex items-center justify-center size-9 rounded-md border border-border bg-background hover:text-foreground transition-colors duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            aria-label="Toggle menu"
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-border px-4 py-3 space-y-1 bg-background motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-1 motion-safe:duration-200">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors duration-200",
                  active
                    ? "bg-secondary font-medium text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </Link>
            );
          })}
          <a
            href="https://docs.lovable.dev"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            <ExternalLink className="size-4" />
            Docs
          </a>
          <div className="pt-2">
            <Button
              size="sm"
              className="w-full gap-1.5 cursor-pointer"
              onClick={() => {
                setOpen(false);
                handleNew();
              }}
            >
              <FilePlus className="size-3.5" />
              New resume
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
