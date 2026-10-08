"use client";

/**
 * An experiment's tabs (D-LAB-22): Results, Reviewers, Access codes, Data.
 * Each is its own route, so they are links, and the back button works; the
 * current one carries aria-current and the selected surface, not colour alone.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@pem/ui/cn";

import type { ExperimentTab } from "../../../../../lib/sandbox/admin-experiments";

export function ExperimentTabs({ tabs }: { tabs: ExperimentTab[] }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Experiment" className="overflow-x-auto border-b">
      <ul className="flex gap-1">
        {tabs.map((tab) => {
          const current = pathname === tab.href;
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={current ? "page" : undefined}
                className={cn(
                  "-mb-px inline-flex h-9 items-center border-b-2 px-3 text-sm whitespace-nowrap text-muted-foreground hover:text-foreground",
                  current
                    ? "border-foreground font-medium text-foreground"
                    : "border-transparent",
                )}
              >
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
