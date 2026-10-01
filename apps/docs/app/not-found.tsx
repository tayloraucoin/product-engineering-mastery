import Link from "next/link";

import { buttonVariants } from "@pem/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-start gap-4">
      <h1 className="text-2xl font-semibold">No document here</h1>
      <p className="text-muted-foreground">
        Every page in this app is a markdown file under <code>docs/</code>.
      </p>
      <Link href="/" className={buttonVariants({ variant: "outline" })}>
        Back to the index
      </Link>
    </div>
  );
}
