CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "notes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "notes_owner_id_idx" ON "notes" USING btree ("owner_id");--> statement-breakpoint
CREATE POLICY "users_select_owner_or_admin" ON "users" AS PERMISSIVE FOR SELECT TO "authenticated" USING (("users"."id" = nullif(current_setting('app.user_id', true), '')::uuid or coalesce(current_setting('app.user_role', true), '') = 'admin'));--> statement-breakpoint
CREATE POLICY "users_update_owner" ON "users" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ("users"."id" = nullif(current_setting('app.user_id', true), '')::uuid) WITH CHECK ("users"."id" = nullif(current_setting('app.user_id', true), '')::uuid);--> statement-breakpoint
CREATE POLICY "users_insert_denied" ON "users" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK (false);--> statement-breakpoint
CREATE POLICY "users_delete_denied" ON "users" AS PERMISSIVE FOR DELETE TO "authenticated" USING (false);--> statement-breakpoint
CREATE POLICY "notes_select_owner" ON "notes" AS PERMISSIVE FOR SELECT TO "authenticated" USING ("notes"."owner_id" = nullif(current_setting('app.user_id', true), '')::uuid);--> statement-breakpoint
CREATE POLICY "notes_insert_owner" ON "notes" AS PERMISSIVE FOR INSERT TO "authenticated" WITH CHECK ("notes"."owner_id" = nullif(current_setting('app.user_id', true), '')::uuid);--> statement-breakpoint
CREATE POLICY "notes_update_owner" ON "notes" AS PERMISSIVE FOR UPDATE TO "authenticated" USING ("notes"."owner_id" = nullif(current_setting('app.user_id', true), '')::uuid) WITH CHECK ("notes"."owner_id" = nullif(current_setting('app.user_id', true), '')::uuid);--> statement-breakpoint
CREATE POLICY "notes_delete_owner" ON "notes" AS PERMISSIVE FOR DELETE TO "authenticated" USING ("notes"."owner_id" = nullif(current_setting('app.user_id', true), '')::uuid);