/**
 * Starts an epic (A4): its folder from the templates, and the shaping branch.
 *
 *   yarn spec:init <app | _shared> <EPIC> <slug>
 *
 * Writes specs/<app>/epics/<EPIC>-<slug>/ with brief.md (from the brief
 * template), and empty prompts/, ux/ and tickets/, and creates the branch
 * agent/<EPIC>. Refuses a prefix already in use by an app, the toolkit or
 * another epic.
 */

import { readText, splitFrontmatter } from "./lib/docs.ts";
import { getCurrentBranch, switchToNewBranch } from "./lib/git.ts";
import {
  branchFor,
  EPIC_PREFIX,
  readSpecsTree,
  refreshStatusFile,
  reservedPrefixes,
  SLUG,
  writeRepoText,
} from "./lib/specs.ts";
import { loadToolkit } from "./lib/toolkit.ts";

const BRIEF_TEMPLATE = "docs/product/brief.template.md";

function stop(message: string): never {
  console.error(`spec:init — ${message}`);
  process.exit(1);
}

const toolkit = loadToolkit();
const [app, prefix, slug] = process.argv.slice(2);
if (!app || !prefix || !slug)
  stop("usage: yarn spec:init <app | _shared> <EPIC> <slug>");
if (app !== "_shared" && !(app in toolkit.apps))
  stop(
    `${app} is not an app in toolkit.json; use one of ${[...Object.keys(toolkit.apps), "_shared"].join(", ")}`,
  );
if (!EPIC_PREFIX.test(prefix))
  stop(
    `${prefix} is not an epic prefix: 2 to 5 upper-case letters or digits, letter first`,
  );
if (!SLUG.test(slug)) stop(`"${slug}" is not a kebab-case slug`);

const tree = readSpecsTree(toolkit);
if (reservedPrefixes(toolkit).includes(prefix))
  stop(`${prefix} is a toolkit or app prefix in toolkit.json; choose another`);
const taken = tree.epics.find((epic) => epic.prefix === prefix);
if (taken)
  stop(
    `${prefix} is already the epic ${taken.dir}; an epic prefix is unique in the repo`,
  );

const branch = branchFor(toolkit, prefix);
if (getCurrentBranch() !== branch && !switchToNewBranch(branch))
  stop(`could not create ${branch}; does it exist already?`);

const dir = `${toolkit.specsRoot}/${app}/epics/${prefix}-${slug}`;
const { body } = splitFrontmatter(readText(BRIEF_TEMPLATE));
writeRepoText(
  `${dir}/brief.md`,
  `---\nepic: ${prefix}\nstatus: draft\n---\n${body}`,
);
for (const folder of ["prompts", "ux", "tickets"])
  writeRepoText(`${dir}/${folder}/.gitkeep`, "");
refreshStatusFile(toolkit);
console.log(
  `spec:init — ${prefix} started at ${dir}/ on ${branch}. Next: the Frame stage fills brief.md.`,
);
