import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="container flex min-h-[80vh] flex-col items-center justify-center pt-24 text-center">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          404
        </p>
        <h1 className="mt-3 text-balance text-4xl font-semibold tracking-tight md:text-5xl">
          That page took a personal day.
        </h1>
        <p className="mt-3 max-w-md text-pretty text-muted-foreground">
          The page you're looking for has either moved or never existed. Let's
          get you back to the analyzer.
        </p>
        <div className="mt-8">
          <Button asChild variant="gradient" size="lg">
            <Link href="/">Back home</Link>
          </Button>
        </div>
      </main>
      <Footer />
    </>
  );
}
