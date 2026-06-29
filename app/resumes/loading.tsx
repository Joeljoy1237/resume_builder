export default function ResumesLoading() {
  return (
    <div className="min-h-screen bg-background pt-14">
      <div className="h-14 border-b border-border bg-background animate-pulse" />
      <main className="mx-auto max-w-[1600px] px-4 sm:px-6 py-8 lg:py-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="h-10 w-48 rounded-md bg-secondary/50 animate-pulse" />
          <div className="h-10 w-40 rounded-md bg-secondary/50 animate-pulse" />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-40 rounded-md bg-secondary/50 animate-pulse" />
          ))}
        </div>
      </main>
    </div>
  );
}
