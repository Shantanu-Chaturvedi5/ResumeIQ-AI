import { Navbar } from "@/components/navbar";

export default function Loading() {
  return (
    <>
      <Navbar />
      <main className="container pt-24 pb-24">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-foreground" />
          <p className="mt-4 text-sm text-muted-foreground">Loading…</p>
        </div>
      </main>
    </>
  );
}
