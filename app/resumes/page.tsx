"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FileText, Plus, Trash2, Pencil, Upload, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { ConfirmModal } from "@/components/ui/confirm-modal";
import { useResumeStore } from "@/lib/resume-store";
import {
  createResume,
  deleteResume,
  getCurrentResumeId,
  getResumes,
  setCurrentResumeId,
  updateResume,
  type SavedResume,
} from "@/lib/resume-storage";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function ResumesPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [resumes, setResumes] = useState<SavedResume[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [currentId, setCurrentId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    setResumes(getResumes());
    setCurrentId(getCurrentResumeId());
  }, []);

  const refresh = () => {
    setResumes(getResumes());
    setCurrentId(getCurrentResumeId());
  };

  const handleNew = () => {
    const resume = createResume("Untitled resume");
    useResumeStore.getState().replace(resume.data);
    setCurrentResumeId(resume.id);
    toast.success("New resume created");
    router.push("/builder");
  };

  const handleLoad = (resume: SavedResume) => {
    useResumeStore.getState().replace(resume.data);
    setCurrentResumeId(resume.id);
    router.push("/builder");
  };

  const handleDelete = (id: string) => {
    deleteResume(id);
    setDeleteId(null);
    refresh();
    toast.success("Resume deleted");
  };

  const startRename = (resume: SavedResume) => {
    setRenameId(resume.id);
    setRenameValue(resume.name);
  };

  const commitRename = () => {
    if (renameId && renameValue.trim()) {
      updateResume(renameId, { name: renameValue.trim() });
      setRenameId(null);
      refresh();
      toast.success("Resume renamed");
    }
  };

  const deleting = deleteId ? resumes.find((r) => r.id === deleteId) : undefined;

  return (
    <div className="min-h-screen bg-background pt-14">
      <SiteHeader />

      <main className="mx-auto max-w-[1600px] px-4 sm:px-6 py-8 lg:py-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl sm:text-4xl tracking-tight">My resumes</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Create, edit, and manage your saved resumes.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="gap-1.5" asChild>
              <Link href="/upload">
                <Upload className="size-4" />
                Import
              </Link>
            </Button>
            <Button onClick={handleNew} className="gap-1.5 cursor-pointer">
              <Plus className="size-4" />
              New resume
            </Button>
          </div>
        </div>

        {mounted && resumes.length === 0 ? (
          <div className="mt-12 rounded-md border border-border bg-card p-10 text-center">
            <div className="mx-auto size-12 rounded-md bg-secondary grid place-items-center mb-4">
              <FileText className="size-6 text-muted-foreground" />
            </div>
            <h2 className="font-display text-xl">No resumes yet</h2>
            <p className="mt-1 text-sm text-muted-foreground max-w-sm mx-auto">
              Create a new resume or import an existing PDF/DOCX to get started.
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              <Button onClick={handleNew} className="gap-1.5 cursor-pointer">
                <Plus className="size-4" />
                New resume
              </Button>
              <Button variant="outline" className="gap-1.5" asChild>
                <Link href="/upload">
                  <Upload className="size-4" />
                  Upload
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {mounted &&
              resumes.map((resume) => {
                const current = currentId === resume.id;
                const isRenaming = renameId === resume.id;
                return (
                  <div
                    key={resume.id}
                    onClick={() => !isRenaming && handleLoad(resume)}
                    className={cn(
                      "group relative rounded-md border border-border bg-card p-5 transition-all duration-200 cursor-pointer hover:border-foreground/60 hover:bg-secondary/60 hover:shadow-sm",
                      current && "ring-1 ring-foreground/20",
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="size-10 rounded-md bg-primary text-primary-foreground grid place-items-center shrink-0">
                        <FileText className="size-5" />
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            startRename(resume);
                          }}
                          className="inline-flex items-center justify-center size-8 rounded-md hover:bg-secondary transition-colors cursor-pointer"
                          aria-label="Rename"
                        >
                          <Pencil className="size-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteId(resume.id);
                          }}
                          className="inline-flex items-center justify-center size-8 rounded-md hover:bg-destructive hover:text-destructive-foreground transition-colors cursor-pointer"
                          aria-label="Delete"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="mt-4">
                      {isRenaming ? (
                        <div
                          className="flex items-center gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            autoFocus
                            value={renameValue}
                            onChange={(e) => setRenameValue(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") commitRename();
                              if (e.key === "Escape") setRenameId(null);
                            }}
                            onBlur={commitRename}
                            className="w-full rounded-md border border-border bg-background px-2 py-1 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          />
                        </div>
                      ) : (
                        <h3 className="font-medium truncate">{resume.name}</h3>
                      )}
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="size-3" />
                        {formatDistanceToNow(resume.updatedAt, { addSuffix: true })}
                      </p>
                    </div>

                    {current && (
                      <div className="absolute top-3 right-3 sm:static sm:mt-3">
                        <span className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                          Open
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        )}
      </main>

      <ConfirmModal
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
        title="Delete resume?"
        description={`"${deleting?.name ?? "This resume"}" will be permanently removed.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={() => deleteId && handleDelete(deleteId)}
      />
    </div>
  );
}
