import Link from "next/link";
import ReactMarkdown, { type Components } from "react-markdown";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";

import { resolveDocLink } from "@/lib/docs";

type MarkdownProps = {
  body: string;
  /** The rendered file's repo-relative path; relative links resolve from it. */
  fromPath: string;
};

const EXTERNAL_HREF = /^[a-z][a-z0-9+.-]*:/i;

/**
 * Renders a repo markdown file. Links are rewritten so the browser reading
 * matches the raw reading: a link to another rendered doc becomes a route, a
 * link to any other repo file is shown but inert (its title names the path).
 */
export function Markdown({ body, fromPath }: MarkdownProps) {
  const components: Components = {
    a({ href = "", children }) {
      if (href.startsWith("#")) return <a href={href}>{children}</a>;
      if (EXTERNAL_HREF.test(href)) {
        return (
          <a href={href} target="_blank" rel="noreferrer">
            {children}
          </a>
        );
      }
      const route = resolveDocLink(fromPath, href);
      if (route) return <Link href={route}>{children}</Link>;
      return (
        <span
          className="underline decoration-dotted underline-offset-4"
          title={`Repo file, not rendered here: ${href}`}
        >
          {children}
        </span>
      );
    },
  };

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeSlug]}
      components={components}
    >
      {body}
    </ReactMarkdown>
  );
}
