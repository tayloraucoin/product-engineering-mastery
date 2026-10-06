CREATE TABLE "stripe_events" (
	"id" text PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"status" text DEFAULT 'processing' NOT NULL,
	"claimed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"processed_at" timestamp with time zone,
	CONSTRAINT "stripe_events_status_check" CHECK ("stripe_events"."status" in ('processing', 'processed'))
);
--> statement-breakpoint
ALTER TABLE "stripe_events" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE POLICY "stripe_events_all_denied" ON "stripe_events" AS PERMISSIVE FOR ALL TO "authenticated" USING (false) WITH CHECK (false);