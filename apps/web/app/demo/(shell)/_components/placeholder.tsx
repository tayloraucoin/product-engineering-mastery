"use client";

import { Button } from "@pem/ui/button";

import { useDemoStore } from "../../_components/demo-store";

/** Stands in until the surface's own ticket lands (DEMO-8, DEMO-11). */
export function SurfacePlaceholder({ title }: { title: string }) {
  const { state, dispatch } = useDemoStore();
  const first = state.records[0];
  return (
    <section className="flex max-w-2xl flex-col gap-4">
      <h1 className="text-xl font-semibold">{title}</h1>
      <p className="text-sm text-muted-foreground">
        This surface is built in its own ticket.{" "}
        <span data-testid="record-count">{state.records.length} records</span>{" "}
        in the store.
      </p>
      {first ? (
        <div>
          <Button
            variant="outline"
            onClick={() => dispatch({ type: "delete", id: first.id })}
          >
            Delete {first.vendor}
          </Button>
        </div>
      ) : null}
    </section>
  );
}
