import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getAllDocs, getDocBySlug } from "@/lib/docs";

import { Markdown } from "../_components/markdown";

// Every doc is known at build time; anything else is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllDocs().map((doc) => ({ slug: doc.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[[...slug]]">): Promise<Metadata> {
  const { slug = [] } = await params;
  const doc = getDocBySlug(slug);
  return doc ? { title: doc.title } : {};
}

export default async function DocPage({ params }: PageProps<"/[[...slug]]">) {
  const { slug = [] } = await params;
  const doc = getDocBySlug(slug);
  if (!doc) notFound();

  return (
    <article className="prose max-w-none prose-neutral dark:prose-invert prose-code:before:content-none prose-code:after:content-none">
      <p className="not-prose mb-6 font-mono text-xs text-muted-foreground">
        {doc.relativePath}
      </p>
      <Markdown body={doc.body} fromPath={doc.relativePath} />
    </article>
  );
}
