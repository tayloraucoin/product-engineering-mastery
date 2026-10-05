/**
 * The example domain's service (D-STK-8): create, read and list a note. Each
 * function takes the context and raw input, validates the input with
 * @pem/validators, and runs its queries through ctx.db, so row-level security
 * decides what the user may see and write. No transport, no framework: a tRPC
 * procedure (STK-14), a Route Handler or a webhook calls these the same way.
 */

import { desc, eq } from "drizzle-orm";

import { notes } from "@pem/db/schema";
import {
  createNoteInput,
  getNoteInput,
  listNotesInput,
  type NoteOutput,
} from "@pem/validators/notes";

import type { ServiceContext } from "../context.ts";
import { NotFound, toDomainError } from "../errors.ts";
import { parseInput } from "../parse-input.ts";

/** The columns a note is returned with; the owner is the caller. */
const noteColumns = {
  id: notes.id,
  body: notes.body,
  createdAt: notes.createdAt,
  updatedAt: notes.updatedAt,
};

async function guarded<T>(work: () => Promise<T>): Promise<T> {
  try {
    return await work();
  } catch (error) {
    throw toDomainError(error, "note");
  }
}

/** Writes a note owned by the caller. A policy that refuses the insert is Forbidden. */
export async function createNote(
  ctx: ServiceContext,
  input: unknown,
): Promise<NoteOutput> {
  const { body } = parseInput(createNoteInput, input);
  return guarded(() =>
    ctx.db.execute(async (tx) => {
      const [row] = await tx
        .insert(notes)
        .values({ ownerId: ctx.userId, body })
        .returning(noteColumns);
      if (!row) throw new NotFound("The note was not saved.");
      return row;
    }),
  );
}

/** One note. Absent, or withheld by row-level security, it is NotFound: the caller cannot tell which. */
export async function getNote(
  ctx: ServiceContext,
  input: unknown,
): Promise<NoteOutput> {
  const { id } = parseInput(getNoteInput, input);
  return guarded(() =>
    ctx.db.execute(async (tx) => {
      const [row] = await tx
        .select(noteColumns)
        .from(notes)
        .where(eq(notes.id, id))
        .limit(1);
      if (!row) throw new NotFound("There is no note with that id.");
      return row;
    }),
  );
}

/** The caller's notes, newest first. */
export async function listNotes(
  ctx: ServiceContext,
  input: unknown = {},
): Promise<NoteOutput[]> {
  const { limit } = parseInput(listNotesInput, input);
  return guarded(() =>
    ctx.db.execute((tx) =>
      tx
        .select(noteColumns)
        .from(notes)
        .orderBy(desc(notes.createdAt))
        .limit(limit),
    ),
  );
}
