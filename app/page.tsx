import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Hero } from "@/components/landing/section-hero";
import { Features } from "@/components/landing/section-features";
import { HowItWorks } from "@/components/landing/section-how";
import { Faq } from "@/components/landing/section-faq";
import { Cta } from "@/components/landing/section-cta";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Faq />
        <Cta />
      </main>
      <Footer />
    </>
  );
}
