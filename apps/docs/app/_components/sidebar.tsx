import { getGroups, getHiddenCount, type Group } from "@/lib/docs";

import { NavLink } from "./nav-link";
import { Search } from "./search";

/** Search, then every visible document grouped by its `layer`. Research is searchable, not listed. */
export function Sidebar() {
  const groups = getGroups();
  const hidden = getHiddenCount();

  return (
    <div className="flex flex-col gap-6">
      <Search />
      <details className="md:hidden">
        <summary className="cursor-pointer text-sm font-medium">
          Browse documents
        </summary>
        <div className="mt-4">
          <Nav groups={groups} hidden={hidden} />
        </div>
      </details>
      <div className="hidden md:block">
        <Nav groups={groups} hidden={hidden} />
      </div>
    </div>
  );
}

function Nav({ groups, hidden }: { groups: Group[]; hidden: number }) {
  return (
    <nav aria-label="Documents" className="flex flex-col gap-6">
      {groups.map((group) => (
        <div key={group.key} className="flex flex-col gap-1">
          <p className="px-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {group.label}
          </p>
          {group.docs.map((doc, i) => {
            const newFolder =
              doc.folder !== "" && doc.folder !== group.docs[i - 1]?.folder;
            return (
              <div key={doc.href} className="flex flex-col gap-1">
                {newFolder && (
                  <p className="mt-2 px-3 font-mono text-xs text-muted-foreground">
                    {doc.folder}/
                  </p>
                )}
                <NavLink href={doc.href}>{doc.title}</NavLink>
              </div>
            );
          })}
        </div>
      ))}
      <p className="px-3 text-xs text-muted-foreground">
        {hidden} archived and generated files are searchable but not listed.
      </p>
    </nav>
  );
}
