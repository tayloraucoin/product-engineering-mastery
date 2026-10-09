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
const HTML_COMMENT = /^\s*<!--[\s\S]*?-->\s*$/;

/** A cell longer than this marks its column as prose, which gets the wider minimum. */
const PROSE_CELL = 60;
/** A column whose cells all fit this stays on one line (an ID such as WT-01). */
const KEY_CELL = 16;

type MdNode = { type: string; value?: string; children?: MdNode[] };
type HtmlNode = {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: HtmlNode[];
};

/** Drops HTML comments (build markers, notes to editors), which would otherwise print as text. */
function remarkDropComments() {
  const drop = (node: MdNode) => {
    if (!node.children) return;
    node.children = node.children.filter(
      (child) =>
        !(child.type === "html" && HTML_COMMENT.test(child.value ?? "")),
    );
    node.children.forEach(drop);
  };
  return drop;
}

function textOf(node: HtmlNode): string {
  return node.value ?? (node.children ?? []).map(textOf).join("");
}

/**
 * Classes each table cell by its column: prose (any cell longer than
 * PROSE_CELL) keeps a readable width when its table scrolls instead of
 * collapsing to a few words per line; a key (every cell within KEY_CELL)
 * never breaks.
 */
function rehypeTableColumns() {
  const cellsOf = (row: HtmlNode) =>
    (row.children ?? []).filter(
      (cell) => cell.tagName === "td" || cell.tagName === "th",
    );
  const mark = (table: HtmlNode) => {
    const rows = (table.children ?? []).flatMap((section) =>
      (section.children ?? []).filter((row) => row.tagName === "tr"),
    );
    const longest: number[] = [];
    for (const row of rows) {
      cellsOf(row).forEach((cell, i) => {
        longest[i] = Math.max(longest[i] ?? 0, textOf(cell).length);
      });
    }
    for (const row of rows) {
      cellsOf(row).forEach((cell, i) => {
        const length = longest[i] ?? 0;
        const kind =
          length > PROSE_CELL
            ? "docs-col-prose"
            : length <= KEY_CELL
              ? "docs-col-key"
              : null;
        if (kind) cell.properties = { ...cell.properties, className: [kind] };
      });
    }
  };
  const walk = (node: HtmlNode) => {
    if (node.tagName === "table") mark(node);
    (node.children ?? []).forEach(walk);
  };
  return walk;
}

/**
 * Renders a repo markdown file. Links are rewritten so the browser reading
 * matches the raw reading: a link to another rendered doc becomes a route, a
 * link to any other repo file is shown but inert (its title names the path).
 * HTML comments are dropped; every table gets its own scrolling frame.
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
    // A wide table scrolls inside its own frame, never the page.
    table({ children }) {
      return (
        <div
          className="docs-table"
          role="region"
          aria-label="Table, scrolls sideways"
          tabIndex={0}
        >
          <table>{children}</table>
        </div>
      );
    },
  };

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkDropComments]}
      rehypePlugins={[rehypeSlug, rehypeTableColumns]}
      components={components}
    >
      {body}
    </ReactMarkdown>
  );
}
