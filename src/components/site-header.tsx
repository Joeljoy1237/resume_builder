import { Link } from "@tanstack/react-router";
import { FileText } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="border-b border-border bg-background/80 backdrop-blur sticky top-0 z-30">
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="size-8 grid place-items-center bg-primary text-primary-foreground rounded-sm">
            <FileText className="size-4" />
          </div>
          <span className="font-display text-xl">Inkwell<span className="text-muted-foreground">/Resume</span></span>
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link to="/upload" className="hover:underline underline-offset-4">Upload</Link>
          <Link to="/builder" className="hover:underline underline-offset-4">Builder</Link>
          <a
            href="https://docs.lovable.dev"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline text-muted-foreground hover:text-foreground"
          >
            Docs
          </a>
        </nav>
      </div>
    </header>
  );
}
