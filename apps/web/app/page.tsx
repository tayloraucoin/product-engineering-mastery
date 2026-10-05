import { buttonVariants } from "@pem/ui/button";

export default function HomePage() {
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
