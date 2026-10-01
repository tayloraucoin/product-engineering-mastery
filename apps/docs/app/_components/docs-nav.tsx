"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { buttonVariants } from "@pem/ui/button";
import { cn } from "@pem/ui/cn";

export type NavDoc = { kind: "doc"; href: string; title: string };
export type NavFolder = { kind: "folder"; name: string; items: NavItem[] };
export type NavItem = NavDoc | NavFolder;
export type NavGroup = { key: string; label: string; items: NavItem[] };

type DocsNavProps = {
  groups: NavGroup[];
  /** Archived and generated files: searchable, never listed. */
  hidden: number;
};

/**
 * The client leaf of the sidebar: it needs the current path to mark the
 * active link and to open the groups and folders that contain it. Every
 * group and folder is a native <details> accordion, so it works with the
 * keyboard and without JavaScript; the reader's own toggles are kept until
 * navigation moves into a different group.
 */
export function DocsNav({ groups, hidden }: DocsNavProps) {
  const pathname = usePathname();

  return (
    <nav aria-label="Documents" className="flex flex-col gap-1">
      {groups.map((group) =>
        group.key === "start" ? (
          <div key={group.key} className="mb-2 flex flex-col gap-0.5">
            {group.items.map((item) => (
              <Item key={key(item)} item={item} pathname={pathname} />
            ))}
          </div>
        ) : (
          <details
            key={group.key}
            open={contains(group.items, pathname)}
            className="group/section"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between rounded-md px-3 py-2 text-xs font-medium tracking-wide text-muted-foreground uppercase select-none hover:bg-background hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
              <span>{group.label}</span>
              <span className="flex items-center gap-2">
                <span className="font-normal tabular-nums">
                  {count(group.items)}
                </span>
                <Chevron className="group-open/section:rotate-90" />
              </span>
            </summary>
            <div className="mt-0.5 mb-2 flex flex-col gap-0.5">
              {group.items.map((item) => (
                <Item key={key(item)} item={item} pathname={pathname} />
              ))}
            </div>
          </details>
        ),
      )}
      <p className="mt-4 px-3 text-xs text-muted-foreground">
        {hidden} archived and generated files are searchable but not listed.
      </p>
    </nav>
  );
}

function Item({ item, pathname }: { item: NavItem; pathname: string }) {
  if (item.kind === "doc") {
    const isActive = pathname === item.href;
    return (
      <Link
        href={item.href}
        aria-current={isActive ? "page" : undefined}
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "h-auto w-full justify-start py-1 text-left text-[13px] leading-5 font-normal whitespace-normal",
          // The panel sits on the muted surface, where accent is invisible; links lift to the page surface instead.
          "hover:bg-background hover:text-foreground",
          isActive &&
            "bg-background font-medium text-foreground ring-1 ring-border",
        )}
      >
        {item.title}
      </Link>
    );
  }
  return (
    <details open={contains(item.items, pathname)} className="group/folder">
      <summary className="flex cursor-pointer list-none items-center gap-1.5 rounded-md px-3 py-1.5 font-mono text-xs text-muted-foreground select-none hover:bg-background hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
        <Chevron className="group-open/folder:rotate-90" />
        <span>{item.name}/</span>
        <span className="ml-auto font-sans tabular-nums">
          {count(item.items)}
        </span>
      </summary>
      <div className="ml-4 flex flex-col gap-0.5 border-l border-border pl-1">
        {item.items.map((child) => (
          <Item key={key(child)} item={child} pathname={pathname} />
        ))}
      </div>
    </details>
  );
}

function Chevron({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className={cn("size-3 shrink-0 transition-transform", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 4l4 4-4 4" />
    </svg>
  );
}

function key(item: NavItem) {
  return item.kind === "doc" ? item.href : `folder:${item.name}`;
}

function count(items: NavItem[]): number {
  return items.reduce(
    (n, item) => n + (item.kind === "doc" ? 1 : count(item.items)),
    0,
  );
}

function contains(items: NavItem[], pathname: string): boolean {
  return items.some((item) =>
    item.kind === "doc"
      ? item.href === pathname
      : contains(item.items, pathname),
  );
}
