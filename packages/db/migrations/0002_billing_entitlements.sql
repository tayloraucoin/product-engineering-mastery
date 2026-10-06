CREATE TABLE "billing_entitlements" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"stripe_customer_id" text NOT NULL,
	"stripe_subscription_id" text,
	"price_id" text,
	"status" text NOT NULL,
	"current_period_end" timestamp with time zone,
	"stripe_event_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "billing_entitlements_stripe_customer_id_unique" UNIQUE("stripe_customer_id")
);
--> statement-breakpoint
ALTER TABLE "billing_entitlements" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "billing_entitlements" ADD CONSTRAINT "billing_entitlements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "stripe_events_processed_at_idx" ON "stripe_events" USING btree ("processed_at") WHERE "stripe_events"."status" = 'processed';--> statement-breakpoint
CREATE POLICY "billing_entitlements_all_denied" ON "billing_entitlements" AS PERMISSIVE FOR ALL TO "authenticated" USING (false) WITH CHECK (false);