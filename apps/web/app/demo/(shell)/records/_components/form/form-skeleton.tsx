"use client";

import { Skeleton } from "@pem/ui/skeleton";

import { FormActions } from "./form-actions";

function Label({ children }: { children: string }) {
  return <p className="text-sm font-medium">{children}</p>;
}

function Control({ tall = false }: { tall?: boolean }) {
  return <Skeleton className={tall ? "h-40" : "h-9"} />;
}

/**
 * `loading`: the final layout with static labels as text and the controls as
 * skeletons (D-DEMO-16). Save is held; Cancel still leaves.
 */
export function FormSkeleton({ onCancel }: { onCancel: () => void }) {
  return (
    <div aria-busy="true" className="mt-8 flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <Label>Vendor name</Label>
        <Control />
      </div>
      <div className="grid gap-8 md:grid-cols-2 md:gap-x-4">
        <div className="flex flex-col gap-3">
          <Label>Owner</Label>
          <Control />
        </div>
        <div className="flex flex-col gap-3">
          <Label>Status</Label>
          <Control />
        </div>
      </div>
      <div className="grid gap-8 md:grid-cols-2 md:gap-x-4">
        <div className="flex flex-col gap-3">
          <Label>Annual value (USD)</Label>
          <Control />
        </div>
        <div className="flex flex-col gap-3">
          <Label>Renewal date</Label>
          <Control />
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <Label>Terms</Label>
        <Control tall />
      </div>
      <FormActions saveLabel="Save" pending={false} held onCancel={onCancel} />
    </div>
  );
}
