"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { buttonVariants } from "@pem/ui/button";
import { cn } from "@pem/ui/cn";

type NavLinkProps = {
  href: string;
  children: ReactNode;
};

/** The one client leaf: it needs the current path to mark itself active. */
export function NavLink({ href, children }: NavLinkProps) {
  const isActive = usePathname() === href;

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        buttonVariants({ variant: "ghost", size: "sm" }),
        "h-auto w-full justify-start py-1.5 text-left font-normal whitespace-normal",
        isActive && "bg-accent font-medium text-accent-foreground",
      )}
    >
      {children}
    </Link>
  );
}
