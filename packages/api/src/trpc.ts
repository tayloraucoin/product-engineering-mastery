/**
 * The tRPC instance and its three procedure tiers (D-STK-8). A procedure is
 * transport only: its input schema comes from `@pem/validators`, and its body
 * is one call into `@pem/services`, handed `ctx.service`.
 *
 * - public: anyone; `ctx.user` may be null.
 * - protected: a signed-in user, or UNAUTHORIZED; adds `ctx.service`.
 * - admin: a user whose role is admin, or FORBIDDEN.
 */

import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";

import type { ApiContext } from "./context.ts";
import { failedFields, toTRPCError } from "./errors.ts";

const t = initTRPC.context<ApiContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    // A fault's message may carry SQL or a vendor's words; the client gets a plain one, the log the cause.
    const message =
      error.code === "INTERNAL_SERVER_ERROR"
        ? "Something went wrong on our side. Try again."
        : shape.message;
    return {
      ...shape,
      message,
      data: { ...shape.data, fields: failedFields(error) },
    };
  },
});

export const router = t.router;
export const createCallerFactory = t.createCallerFactory;

/** Runs the one error mapper on whatever the procedure's service threw. */
const mapDomainErrors = t.middleware(async ({ next }) => {
  const result = await next();
  if (!result.ok) {
    const mapped = toTRPCError(result.error.cause);
    if (mapped) throw mapped;
  }
  return result;
});

export const publicProcedure = t.procedure.use(mapDomainErrors);

export const protectedProcedure = publicProcedure.use(({ ctx, next }) => {
  if (!ctx.user)
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "Sign in to do this.",
    });
  return next({
    ctx: { user: ctx.user, service: ctx.serviceContextFor(ctx.user) },
  });
});

export const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin")
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Only an admin can do this.",
    });
  return next();
});
