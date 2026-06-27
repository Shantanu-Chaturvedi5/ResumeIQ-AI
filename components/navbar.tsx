"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Logo } from "./logo";
import { ThemeToggle } from "./ui/theme-toggle";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Features", href: "/#features" },
  { label: "How it works", href: "/#how" },
  { label: "FAQ", href: "/#faq" },
];

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-border/60 bg-background/70 backdrop-blur-xl"
          : "bg-transparent"
      )}
    >
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <Logo className="h-7 w-7" />
          <span className="font-semibold tracking-tight">ResumeIQ</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {pathname === "/analyzer" ? (
            <Button asChild variant="gradient" size="sm">
              <Link href="/analyzer">Analyzer</Link>
            </Button>
          ) : (
            <Button asChild variant="gradient" size="sm">
              <Link href="/analyzer">Open analyzer</Link>
            </Button>
          )}
        </div>
      </div>
    </motion.header>
  );
}
