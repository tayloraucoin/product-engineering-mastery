import { Fragment } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@pem/ui/breadcrumb";

export interface Crumb {
  href: string;
  label: string;
}

/** 1440: the breadcrumb; 390: one back link to the last crumb. Then the h1. */
export function FormHeader({
  crumbs,
  current,
  title,
  titleId,
}: {
  crumbs: readonly Crumb[];
  current: string;
  title: string;
  titleId: string;
}) {
  const back = crumbs.at(-1)!;
  return (
    <header className="flex flex-col gap-4">
      <Breadcrumb className="hidden md:block">
        <BreadcrumbList>
          {crumbs.map((crumb) => (
            <Fragment key={crumb.href}>
              <BreadcrumbItem>
                <BreadcrumbLink render={<Link href={crumb.href} />}>
                  {crumb.label}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </Fragment>
          ))}
          <BreadcrumbItem>
            <BreadcrumbPage>{current}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <Link
        href={back.href}
        className="inline-flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground md:hidden"
      >
        <ChevronLeft aria-hidden="true" className="size-4" />
        {back.label}
      </Link>
      <h1 id={titleId} className="text-xl font-semibold">
        {title}
      </h1>
    </header>
  );
}
