/**
 * People (LAB-9, people.md, S2): an admin sets each person's role to user,
 * developer or admin. Pure: `people-data.ts` binds the Auth admin API, the
 * role-change lock and the record of actions; this file holds the rules and
 * the words, so it runs under `node --test`.
 *
 * The last-admin guard runs here, inside the lock: the admins are counted
 * through the Auth API, never from the session, and a change that would
 * leave none is refused whatever the page showed. The disabled select is a
 * courtesy only.
 *
 * Each change writes one record row naming the actor and the changed team
 * member's email (D-LAB-28 allows only a role change to name anyone), in the
 * lock's transaction, before the role is written: if the write fails, the
 * row rolls back with it.
 */

import type { AppRole } from "@pem/db/rls";

import type { TeamMember } from "./team-check.ts";

export const PEOPLE_PAGE_SIZE = 50;

/**
 * The roles People can set: `APP_ROLES` by name, held here so the client
 * table never pulls `@pem/db/rls` (and drizzle) into the browser. A
 * `Record` over `AppRole` fails to compile if a role is added or dropped.
 */
const ROLE_SET: Record<AppRole, true> = {
  user: true,
  developer: true,
  admin: true,
};
export const PEOPLE_ROLES = Object.keys(ROLE_SET) as AppRole[];

export const PEOPLE_WORDS = {
  heading: "People",
  // R11: getUser() reads the Auth database on every request.
  timing: "Changes take effect the next time they open a page.",
  filterLabel: "Find by email",
  caption: "People",
  columns: {
    email: "Email",
    role: "Role",
    signedUp: "Signed up",
    lastSignIn: "Last sign-in",
  },
  you: "(you)",
  roles: { user: "User", developer: "Developer", admin: "Admin" },
  empty: "Only you so far. People appear here once they sign up.",
  error: "Couldn't load people. Reload the page.",
  offline: "You're offline. Roles can't be changed until you're back.",
  filterEmpty: "No one matches that email.",
  lastAdmin: "You're the only admin. Make someone else an admin first.",
  changeFailed: "The role wasn't changed. Try again.",
  selfDemotion: "You'll lose access to People.",
  cancel: "Cancel",
  missing: "—",
} as const;

export const roleSelectLabel = (email: string) => `Role for ${email}`;

/** "3 people match." `[ASSUMPTION]` the singular is "1 person matches." */
export function matchAnnouncement(count: number): string {
  return count === 1 ? "1 person matches." : `${count} people match.`;
}

/** The role `app_metadata` names, or `user` for anything else, as the request seam reads it. */
export function roleFromMetadata(
  appMetadata: Record<string, unknown> | null | undefined,
): AppRole {
  const role = appMetadata?.role;
  return (PEOPLE_ROLES as readonly unknown[]).includes(role)
    ? (role as AppRole)
    : "user";
}

/** The confirmation that names the consequence (people.md, C-LAB-people-4). */
export function roleChangeConfirmation(
  email: string,
  from: AppRole,
  to: AppRole,
  isSelf: boolean,
): { description: string; action: string } {
  let description: string;
  let action: string;
  if (to === "admin") {
    description = `Make ${email} an admin? Admins open every experiment, read every review and change anyone's role.`;
    action = "Make admin";
  } else if (to === "developer") {
    description = `Make ${email} a developer? Developers open every experiment and read every review, but can't change roles or delete an experiment's data.`;
    action = "Make developer";
  } else {
    description = `Remove ${email}'s ${from === "admin" ? "admin" : "developer"} role? They'll lose access to experiments and Admin.`;
    action = "Remove role";
  }
  if (isSelf && from === "admin" && to !== "admin")
    description = `${description} ${PEOPLE_WORDS.selfDemotion}`;
  return { description, action };
}

/** The toast after a change (people.md). */
export function roleChangedMessage(email: string, to: AppRole): string {
  if (to === "admin") return `${email} is now an admin.`;
  if (to === "developer") return `${email} is now a developer.`;
  return `${email}'s role was removed.`;
}

export type ChangeRoleResult =
  | {
      outcome: "changed";
      message: string;
      userId: string;
      role: AppRole;
      /** The admin changed their own role; the page sends them on (people.md). */
      self: boolean;
    }
  | { outcome: "last-admin"; message: string }
  | { outcome: "refused" }
  | { outcome: "failed"; message: string };

export const ROLE_CHANGE_REFUSED: ChangeRoleResult = Object.freeze({
  outcome: "refused",
});

/** One account as the Auth admin API returns it, trimmed to what People reads. */
export type AuthPerson = {
  id: string;
  email: string | null;
  appMetadata: Record<string, unknown>;
  createdAt: string | null;
  lastSignInAt: string | null;
};

export type ChangeRoleDeps<Tx> = {
  /** Runs `fn` inside the role-change lock's transaction, as the acting admin. */
  withLock<T>(fn: (tx: Tx) => Promise<T>): Promise<T>;
  readPerson(userId: string): Promise<AuthPerson | null>;
  countAdmins(): Promise<number>;
  /** Writes the whole app_metadata object: the caller merges the role into what it read. */
  writeAppMetadata(
    userId: string,
    appMetadata: Record<string, unknown>,
  ): Promise<void>;
  recordRoleChange(tx: Tx, targetEmail: string): Promise<void>;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** `{ userId, role }` from the form, or null for anything else. */
export function parseRoleChange(
  input: unknown,
): { userId: string; role: AppRole } | null {
  if (!input || typeof input !== "object") return null;
  const { userId, role } = input as Record<string, unknown>;
  if (typeof userId !== "string" || !UUID.test(userId)) return null;
  if (!(PEOPLE_ROLES as readonly unknown[]).includes(role)) return null;
  return { userId, role: role as AppRole };
}

/**
 * Sets one person's role. The caller has already passed `requireTeamAction`;
 * this refuses anyone but an admin again, so it is safe on its own.
 */
export async function changeRoleWith<Tx>(
  deps: ChangeRoleDeps<Tx>,
  actor: TeamMember,
  input: unknown,
): Promise<ChangeRoleResult> {
  if (actor.role !== "admin") return ROLE_CHANGE_REFUSED;
  const change = parseRoleChange(input);
  if (!change) return ROLE_CHANGE_REFUSED;
  const failed: ChangeRoleResult = {
    outcome: "failed",
    message: PEOPLE_WORDS.changeFailed,
  };
  try {
    return await deps.withLock(async (tx): Promise<ChangeRoleResult> => {
      const person = await deps.readPerson(change.userId);
      if (!person?.email) return failed;
      const email = person.email.trim().toLowerCase();
      const from = roleFromMetadata(person.appMetadata);
      const result: ChangeRoleResult = {
        outcome: "changed",
        message: roleChangedMessage(email, change.role),
        userId: person.id,
        role: change.role,
        self: person.id === actor.userId,
      };
      if (from === change.role) return result;
      if (from === "admin" && (await deps.countAdmins()) <= 1)
        return { outcome: "last-admin", message: PEOPLE_WORDS.lastAdmin };
      await deps.recordRoleChange(tx, email);
      // The whole object read above goes back with the new role. The lock
      // orders role changes, not GoTrue: a key Auth adds between the read and
      // this write (an identity link extending providers) is overwritten.
      await deps.writeAppMetadata(person.id, {
        ...person.appMetadata,
        role: change.role,
      });
      return result;
    });
  } catch {
    return failed;
  }
}

export type PersonRow = {
  id: string;
  email: string;
  role: AppRole;
  signedUp: string | null;
  lastSignIn: string | null;
  isYou: boolean;
  /** Your own select, when you are the only admin: disabled, with the reason. */
  locked: boolean;
};

/** The table's rows: you first, then by email; your select locked when you are the only admin. */
export function peopleRows(
  people: readonly AuthPerson[],
  me: string,
): PersonRow[] {
  const withEmail = people.filter((p) => p.email);
  const admins = withEmail.filter(
    (p) => roleFromMetadata(p.appMetadata) === "admin",
  ).length;
  return withEmail
    .map((p) => {
      const role = roleFromMetadata(p.appMetadata);
      const isYou = p.id === me;
      return {
        id: p.id,
        email: p.email!.toLowerCase(),
        role,
        signedUp: p.createdAt,
        lastSignIn: p.lastSignInAt,
        isYou,
        locked: isYou && role === "admin" && admins <= 1,
      };
    })
    .sort((a, b) =>
      a.isYou !== b.isYou ? (a.isYou ? -1 : 1) : a.email.localeCompare(b.email),
    );
}

/** Rows whose email contains the filter, ignoring case and spaces at either end. */
export function filterPeople(
  rows: readonly PersonRow[],
  query: string,
): PersonRow[] {
  const q = query.trim().toLowerCase();
  return q ? rows.filter((r) => r.email.includes(q)) : [...rows];
}

/** People's `?state=` keys (people.md), each registered as `team` in state.ts. */
export const PEOPLE_STATE_KEYS = [
  "people-empty",
  "people-loading",
  "people-error",
  "people-partial",
  "people-offline",
  "people-success",
  "people-filter-empty",
  "people-last-admin",
  "people-change-error",
] as const;
export type PeopleStateKey = (typeof PEOPLE_STATE_KEYS)[number];

export type PeopleView = {
  /** The rows, or null when loading or when the list failed. */
  rows: PersonRow[] | null;
  loading: boolean;
  error: boolean;
  offline: boolean;
  /** A filter already typed, for `people-filter-empty`. */
  query: string;
  /** Opens with the failed-change toast, for `people-change-error`. */
  changeFailed: boolean;
};

const ISO = (day: number) =>
  `2026-09-${String(day).padStart(2, "0")}T09:30:00Z`;

/** Synthetic accounts for the state keys; never a real person. */
/**
 * The viewer the state keys show as "(you)": synthetic, never the real
 * member, so no change made on a fixture row can reach a real account, and
 * no real address appears in a fixture view.
 */
export const PEOPLE_FIXTURE_VIEWER = {
  id: "00000000-0000-4000-8000-00000000f001",
  email: "ana@example.com",
} as const;

function fixturePeople(
  me: { id: string; email: string } = PEOPLE_FIXTURE_VIEWER,
): AuthPerson[] {
  const person = (
    n: number,
    email: string,
    role: AppRole,
    lastSignIn: string | null = ISO(20 + (n % 9)),
  ): AuthPerson => ({
    id: `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`,
    email,
    appMetadata: { provider: "email", providers: ["email"], role },
    createdAt: ISO(1 + n),
    lastSignInAt: lastSignIn,
  });
  return [
    { ...person(0, me.email, "admin"), id: me.id },
    person(1, "fay@example.com", "admin"),
    person(2, "ben@example.com", "developer"),
    person(3, "chloe@example.com", "user"),
    person(4, "dev@example.com", "developer"),
    person(5, "eli@example.com", "user"),
  ];
}

/**
 * What People shows for a `?state=` key that passed `readSandboxState`, or
 * null for the real page. Fixtures are synthetic, with the viewer as an admin.
 */
export function peopleStateView(state: string | null): PeopleView | null {
  const me = PEOPLE_FIXTURE_VIEWER;
  const base: PeopleView = {
    rows: peopleRows(fixturePeople(me), me.id),
    loading: false,
    error: false,
    offline: false,
    query: "",
    changeFailed: false,
  };
  switch (state as PeopleStateKey | null) {
    case "people-empty":
      return {
        ...base,
        rows: peopleRows(fixturePeople(me).slice(0, 1), me.id),
      };
    case "people-loading":
      return { ...base, rows: null, loading: true };
    case "people-error":
      return { ...base, rows: null, error: true };
    case "people-partial":
      return {
        ...base,
        rows: peopleRows(
          fixturePeople(me).map((p, i) =>
            i % 2 ? { ...p, lastSignInAt: null } : p,
          ),
          me.id,
        ),
      };
    case "people-offline":
      return { ...base, offline: true };
    case "people-success":
      return base;
    case "people-filter-empty":
      return { ...base, query: "nobody@" };
    case "people-last-admin":
      return {
        ...base,
        rows: peopleRows(
          fixturePeople(me).filter(
            (p) =>
              p.id === me.id || roleFromMetadata(p.appMetadata) !== "admin",
          ),
          me.id,
        ),
      };
    case "people-change-error":
      return { ...base, changeFailed: true };
    default:
      return null;
  }
}
