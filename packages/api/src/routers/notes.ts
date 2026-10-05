/**
 * The example domain's procedures. Each body is one service call (D-STK-8);
 * a product replaces notes with its own domain, one router file per domain.
 */

import { createNote, getNote, listNotes } from "@pem/services/notes";
import {
  createNoteInput,
  getNoteInput,
  listNotesInput,
} from "@pem/validators/notes";

import { protectedProcedure, router } from "../trpc.ts";

export const notesRouter = router({
  list: protectedProcedure
    .input(listNotesInput.optional())
    .query(({ ctx, input }) => listNotes(ctx.service, input)),
  get: protectedProcedure
    .input(getNoteInput)
    .query(({ ctx, input }) => getNote(ctx.service, input)),
  create: protectedProcedure
    .input(createNoteInput)
    .mutation(({ ctx, input }) => createNote(ctx.service, input)),
});
