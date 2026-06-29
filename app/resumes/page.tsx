import { ResumeList } from "@/components/resume/resume-list";

export const metadata = {
  title: "My Resumes — Inkwell Resume",
  description: "Create, edit, and manage your saved resumes.",
};

export default function ResumesPage() {
  return (
    <div className="min-h-screen bg-background pt-14">
      <main className="mx-auto max-w-[1600px] px-4 sm:px-6 py-8 lg:py-10">
        <ResumeList />
      </main>
    </div>
  );
}
