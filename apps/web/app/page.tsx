import { buttonVariants } from "@pem/ui/button";

import { productionRuntime } from "../env";

/**
 * `?state=error` throws, so the error page (global-error.tsx) and the error
 * reporting behind it can be reached on purpose (STK-18 C5). Never where real
 * users may be served (`productionRuntime`, which holds even when the tier is
 * unset), since anyone could fill the error inbox.
 */
export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ state?: string | string[] }>;
}) {
  const { state } = await searchParams;
  if (state === "error" && !productionRuntime)
    throw new Error("Synthetic render error from ?state=error");

  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center gap-6 px-6">
      <h1 className="text-3xl font-semibold tracking-tight">
        Product Engineering Mastery
      </h1>
      <p className="text-muted-foreground">
        The product surface. Start in <code>apps/web/app/page.tsx</code>; read
        the conventions first in the docs app (<code>yarn docs:dev</code>).
      </p>
      <div>
        <a
          href="https://nextjs.org/docs"
          className={buttonVariants({ variant: "outline" })}
        >
          Next.js docs
        </a>
      </div>
    </main>
  );
}
