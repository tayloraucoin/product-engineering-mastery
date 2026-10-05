/** The app's router: one entry per domain router in `routers/`. */

import { notesRouter } from "./routers/notes.ts";
import { router } from "./trpc.ts";

export const appRouter = router({
  notes: notesRouter,
});

export type AppRouter = typeof appRouter;
