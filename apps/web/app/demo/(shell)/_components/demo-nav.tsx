"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@pem/ui/cn";

const ENTRIES = [
  { href: "/demo/records", label: "Records" },
  { href: "/demo/settings", label: "Settings" },
] as const;

/** A client leaf only for `aria-current`: the current entry takes the pill (C-P07). */
export function DemoNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Demo">
      <ul className="flex items-center gap-1">
        {ENTRIES.map(({ href, label }) => {
          const current = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={current ? "page" : undefined}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground",
                  current && "bg-muted text-foreground",
                )}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
