export default function BuilderLoading() {
  return (
    <div className="min-h-screen bg-background pt-14">
      <div className="h-14 border-b border-border bg-background animate-pulse" />
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 py-6 lg:py-8">
        <div className="grid lg:grid-cols-[200px_1fr_480px] xl:grid-cols-[220px_1fr_600px] gap-6 lg:gap-8">
          <div className="hidden lg:block space-y-4">
            <div className="h-64 rounded-md bg-secondary/50 animate-pulse" />
          </div>
          <div className="space-y-4">
            <div className="h-32 rounded-md bg-secondary/50 animate-pulse" />
            <div className="h-64 rounded-md bg-secondary/50 animate-pulse" />
            <div className="h-48 rounded-md bg-secondary/50 animate-pulse" />
          </div>
          <div className="hidden lg:block">
            <div className="h-[calc(100vh-12rem)] rounded-md bg-secondary/50 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
