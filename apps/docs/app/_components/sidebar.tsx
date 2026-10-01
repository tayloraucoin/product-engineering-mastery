import { getAllDocs, type Doc } from "@/lib/docs";

import { NavLink } from "./nav-link";

export function Sidebar() {
  const sections = groupBySection(getAllDocs());

  return (
    <nav aria-label="Documents" className="flex flex-col gap-6">
      {sections.map(([section, docs]) => (
        <div key={section} className="flex flex-col gap-1">
          <p className="px-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {section}
          </p>
          {docs.map((doc) => (
            <NavLink key={doc.href} href={doc.href}>
              {doc.title}
            </NavLink>
          ))}
        </div>
      ))}
    </nav>
  );
}

function groupBySection(docs: Doc[]) {
  const sections = new Map<string, Doc[]>();
  for (const doc of docs) {
    sections.set(doc.section, [...(sections.get(doc.section) ?? []), doc]);
  }
  return [...sections.entries()];
}
