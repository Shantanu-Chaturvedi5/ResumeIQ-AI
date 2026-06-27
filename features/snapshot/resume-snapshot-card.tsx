"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  Briefcase,
  GraduationCap,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  User,
  Wrench,
  Link as LinkIcon,
  FolderGit2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAppStore } from "@/hooks/use-app-store";
import type { ParsedResume } from "@/types/resume";
import { cn } from "@/lib/utils";

interface SnapshotField {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
  /** When true, render as a missing-data warning. */
  missing?: boolean;
}

/**
 * Surfaces what ResumeIQ parsed out of the resume: contact basics on the
 * left, section counts on the right. Helps the user verify parsing was
 * correct before trusting the score.
 */
export function ResumeSnapshotCard() {
  const result = useAppStore((s) => s.result);

  if (!result) return null;
  const parsed: ParsedResume = result.parsed;
  const basics = parsed.basics;

  const fields: SnapshotField[] = [
    {
      icon: User,
      label: "Name",
      value: basics.name || "Not detected",
      missing: !basics.name,
    },
    {
      icon: Mail,
      label: "Email",
      value: basics.email || "Missing",
      missing: !basics.email,
    },
    {
      icon: Phone,
      label: "Phone",
      value: basics.phone || "Missing",
      missing: !basics.phone,
    },
    {
      icon: MapPin,
      label: "Location",
      value: basics.location || "—",
      missing: false,
    },
  ];

  const sectionCounts = [
    {
      icon: Wrench,
      label: "Skills",
      count: parsed.skills.length,
      ok: parsed.skills.length >= 5,
    },
    {
      icon: Briefcase,
      label: "Experience",
      count: parsed.experience.length,
      suffix: parsed.experience.length === 1 ? "role" : "roles",
      ok: parsed.experience.length >= 1,
    },
    {
      icon: GraduationCap,
      label: "Education",
      count: parsed.education.length,
      suffix: parsed.education.length === 1 ? "entry" : "entries",
      ok: parsed.education.length >= 1,
    },
    {
      icon: FolderGit2,
      label: "Projects",
      count: parsed.projects.length,
      ok: true, // projects are optional
    },
  ];

  // Compact, copy-friendly links list (cap at 3 to keep the card short)
  const links = (basics.links ?? []).slice(0, 3);

  // Aggregate "what's missing" so we can show a single warning badge
  const missingBasics = fields.filter((f) => f.missing).length;
  const missingSections = sectionCounts.filter((s) => !s.ok).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-2xl border border-border bg-card p-5"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-violet-500" />
          <h3 className="text-sm font-medium">Parsed snapshot</h3>
        </div>
        {(missingBasics > 0 || missingSections > 0) && (
          <Badge variant="outline" className="gap-1 text-[10px] text-amber-600 dark:text-amber-400">
            <AlertCircle className="h-3 w-3" />
            {missingBasics + missingSections} gap{missingBasics + missingSections === 1 ? "" : "s"}
          </Badge>
        )}
      </div>

      <div className="mt-4 grid gap-x-6 gap-y-4 sm:grid-cols-2">
        {/* Left column — basics */}
        <div className="space-y-2.5">
          {fields.map((f) => (
            <SnapshotRow key={f.label} field={f} />
          ))}
        </div>

        {/* Right column — section counts */}
        <div className="space-y-2.5">
          {sectionCounts.map((s) => (
            <div key={s.label} className="flex items-center gap-3">
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                  s.ok ? "bg-secondary text-foreground" : "bg-rose-500/10 text-rose-600 dark:text-rose-400",
                )}
              >
                <s.icon className="h-3.5 w-3.5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  {s.label}
                </p>
                <p className="text-sm font-medium tabular-nums">
                  {s.count}
                  {s.suffix && (
                    <span className="ml-1 text-xs text-muted-foreground">
                      {s.suffix}
                    </span>
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Links strip — only shown when we have at least one */}
      {links.length > 0 && (
        <div className="mt-4 border-t border-border pt-3">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Links
          </p>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {links.map((l) => (
              <li key={l}>
                <a
                  href={l.startsWith("http") ? l : `https://${l}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-0.5 text-[11px] font-medium transition-colors hover:border-foreground/30"
                >
                  <LinkIcon className="h-3 w-3" />
                  {prettyLink(l)}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </motion.div>
  );
}

function SnapshotRow({ field }: { field: SnapshotField }) {
  const Icon = field.icon;
  return (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
          field.missing
            ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
            : "bg-secondary text-foreground",
        )}
      >
        <Icon className="h-3.5 w-3.5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
          {field.label}
        </p>
        <p
          className={cn(
            "truncate text-sm font-medium",
            field.missing && "text-rose-600 dark:text-rose-400",
          )}
        >
          {field.value}
        </p>
      </div>
    </div>
  );
}

/**
 * Strip protocol + trailing slash so the chip reads "github.com/user"
 * rather than the full URL.
 */
function prettyLink(raw: string): string {
  return raw
    .replace(/^https?:\/\//i, "")
    .replace(/\/$/, "")
    .slice(0, 32);
}