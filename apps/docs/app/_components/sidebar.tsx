import { getGroups, getHiddenCount, type Doc } from "@/lib/docs";

import {
  DocsNav,
  type NavFolder,
  type NavGroup,
  type NavItem,
} from "./docs-nav";
import { Search } from "./search";

/**
 * The full-height left panel: search pinned at the top, then every visible
 * document grouped by its `layer`, with sub-folders nested inside each group.
 * Research is searchable, not listed.
 */
export function Sidebar() {
  const groups: NavGroup[] = getGroups().map((group) => ({
    key: group.key,
    label: group.label,
    items: toTree(group.docs),
  }));
  const hidden = getHiddenCount();

  return (
    <div className="flex flex-col">
      <div className="sticky top-0 z-10 border-b border-border bg-muted px-4 py-4">
        <Search />
      </div>
      <details className="px-4 py-4 md:hidden">
        <summary className="cursor-pointer text-sm font-medium">
          Browse documents
        </summary>
        <div className="mt-4">
          <DocsNav groups={groups} hidden={hidden} />
        </div>
      </details>
      <div className="hidden px-4 py-4 md:block">
        <DocsNav groups={groups} hidden={hidden} />
      </div>
    </div>
  );
}

/** Nests a group's documents by their folder path (`templates/refs` → templates → refs). */
function toTree(docs: Doc[]): NavItem[] {
  const root: NavItem[] = [];
  for (const doc of docs) {
    let level = root;
    for (const name of doc.folder ? doc.folder.split("/") : []) {
      let folder = level.find(
        (item): item is NavFolder =>
          item.kind === "folder" && item.name === name,
      );
      if (!folder) {
        folder = { kind: "folder", name, items: [] };
        level.push(folder);
      }
      level = folder.items;
    }
    level.push({ kind: "doc", href: doc.href, title: doc.title });
  }
  return root;
}
