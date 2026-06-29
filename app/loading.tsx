import { FileText } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 text-muted-foreground">
      <div className="relative">
        <FileText className="size-8 animate-pulse" />
      </div>
      <p className="text-sm animate-pulse">Loading…</p>
    </div>
  );
}
