/**
 * The example domain's shapes (D-STK-8): each defined once here, read by the
 * form that collects it, the procedure that receives it (STK-14) and the
 * service that acts on it. A product replaces notes with its own domain and
 * keeps the pattern: one file per domain, an input schema per operation.
 */

import { z } from "zod";

/** The longest body a note may hold, in characters. */
export const NOTE_BODY_MAX = 10_000;

/** The most notes one list call returns. */
export const NOTE_LIST_MAX = 100;

export const noteId = z.uuid({ error: "Choose a note by its id." });

export const createNoteInput = z.object({
  body: z
    .string({ error: "Write the note." })
    .trim()
    .min(1, { error: "Write the note." })
    .max(NOTE_BODY_MAX, {
      error: `Keep the note under ${NOTE_BODY_MAX.toLocaleString("en-US")} characters.`,
    }),
});

export const getNoteInput = z.object({ id: noteId });

export const listNotesInput = z.object({
  limit: z
    .number()
    .int()
    .min(1)
    .max(NOTE_LIST_MAX, {
      error: `Ask for at most ${NOTE_LIST_MAX} notes at a time.`,
    })
    .default(20),
});

/** A note as a service returns it: the owner is implied by who asked. */
export const noteOutput = z.object({
  id: z.uuid(),
  body: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type CreateNoteInput = z.input<typeof createNoteInput>;
export type GetNoteInput = z.input<typeof getNoteInput>;
export type ListNotesInput = z.input<typeof listNotesInput>;
export type NoteOutput = z.output<typeof noteOutput>;
