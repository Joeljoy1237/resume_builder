export default function UploadLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="h-14 border-b border-border bg-background animate-pulse" />
      <main className="mx-auto max-w-3xl px-4 sm:px-6 pt-20 sm:pt-24 pb-16 sm:pb-24">
        <div className="h-4 w-24 rounded-md bg-secondary/50 animate-pulse mb-5" />
        <div className="h-12 w-3/4 rounded-md bg-secondary/50 animate-pulse mb-3" />
        <div className="h-6 w-1/2 rounded-md bg-secondary/50 animate-pulse mb-10" />
        <div className="h-64 rounded-md bg-secondary/50 animate-pulse" />
      </main>
    </div>
  );
}
