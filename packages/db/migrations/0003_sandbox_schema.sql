CREATE TABLE "sandbox_reviewers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"label" text NOT NULL,
	"display_name" text,
	"code_hash" "bytea" NOT NULL,
	"code_version" integer DEFAULT 1 NOT NULL,
	"revoked_at" timestamp with time zone,
	"first_design" text,
	"last_design" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sandbox_reviewers_code_hash_unique" UNIQUE("code_hash"),
	CONSTRAINT "sandbox_reviewers_id_slug_key" UNIQUE("id","slug"),
	CONSTRAINT "sandbox_reviewers_slug_check" CHECK (("sandbox_reviewers"."slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length("sandbox_reviewers"."slug") <= 48)),
	CONSTRAINT "sandbox_reviewers_code_version_check" CHECK ("sandbox_reviewers"."code_version" >= 1)
);
--> statement-breakpoint
ALTER TABLE "sandbox_reviewers" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "sandbox_accesses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reviewer_id" uuid NOT NULL,
	"email" text,
	"user_id" uuid,
	"code_version" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_seen_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sandbox_accesses_id_reviewer_key" UNIQUE("id","reviewer_id"),
	CONSTRAINT "sandbox_accesses_one_identity_check" CHECK (("sandbox_accesses"."email" is null) <> ("sandbox_accesses"."user_id" is null))
);
--> statement-breakpoint
ALTER TABLE "sandbox_accesses" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "sandbox_view_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reviewer_id" uuid NOT NULL,
	"access_id" uuid NOT NULL,
	"slug" text NOT NULL,
	"kind" text NOT NULL,
	"design" text NOT NULL,
	"at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sandbox_view_events_slug_check" CHECK (("sandbox_view_events"."slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length("sandbox_view_events"."slug") <= 48)),
	CONSTRAINT "sandbox_view_events_kind_check" CHECK ("sandbox_view_events"."kind" in ('load', 'switch'))
);
--> statement-breakpoint
ALTER TABLE "sandbox_view_events" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "sandbox_comments" (
	"id" uuid PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"design" text NOT NULL,
	"number" integer NOT NULL,
	"kind" text,
	"body" text NOT NULL,
	"anchor" jsonb NOT NULL,
	"viewport_w" integer NOT NULL,
	"viewport_h" integer NOT NULL,
	"client_created_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"reviewer_id" uuid,
	"access_id" uuid,
	"team_user_id" uuid,
	"parent_id" uuid,
	CONSTRAINT "sandbox_comments_slug_check" CHECK (("sandbox_comments"."slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length("sandbox_comments"."slug") <= 48)),
	CONSTRAINT "sandbox_comments_kind_check" CHECK ("sandbox_comments"."kind" is null or "sandbox_comments"."kind" in ('problem', 'question', 'suggestion', 'keep')),
	CONSTRAINT "sandbox_comments_body_check" CHECK (char_length("sandbox_comments"."body") <= 2000),
	CONSTRAINT "sandbox_comments_one_author_check" CHECK (("sandbox_comments"."reviewer_id" is not null and "sandbox_comments"."access_id" is not null and "sandbox_comments"."team_user_id" is null) or ("sandbox_comments"."reviewer_id" is null and "sandbox_comments"."access_id" is null and "sandbox_comments"."team_user_id" is not null))
);
--> statement-breakpoint
ALTER TABLE "sandbox_comments" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "sandbox_review_versions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"reviewer_id" uuid NOT NULL,
	"access_id" uuid NOT NULL,
	"slug" text NOT NULL,
	"number" integer NOT NULL,
	"core_version" text NOT NULL,
	"answers" jsonb NOT NULL,
	"triage" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sandbox_review_versions_reviewer_number_key" UNIQUE("reviewer_id","number"),
	CONSTRAINT "sandbox_review_versions_slug_check" CHECK (("sandbox_review_versions"."slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length("sandbox_review_versions"."slug") <= 48)),
	CONSTRAINT "sandbox_review_versions_number_check" CHECK ("sandbox_review_versions"."number" >= 1)
);
--> statement-breakpoint
ALTER TABLE "sandbox_review_versions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "sandbox_actions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"at" timestamp with time zone DEFAULT now() NOT NULL,
	"actor_user_id" uuid NOT NULL,
	"actor_email" text NOT NULL,
	"action" text NOT NULL,
	"slug" text,
	"target_email" text,
	"counts" jsonb,
	CONSTRAINT "sandbox_actions_slug_check" CHECK ("sandbox_actions"."slug" is null or ("sandbox_actions"."slug" ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length("sandbox_actions"."slug") <= 48)),
	CONSTRAINT "sandbox_actions_counts_check" CHECK ("sandbox_actions"."counts" is null or (jsonb_typeof("sandbox_actions"."counts") = 'object' and "sandbox_actions"."counts" - '{reviewers,accesses,viewEvents,comments,reviewVersions,teamNotes,labelsScrubbed,reviewersRevoked}'::text[] = '{}'::jsonb))
);
--> statement-breakpoint
ALTER TABLE "sandbox_actions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "sandbox_gate_attempts" (
	"key_hash" "bytea" PRIMARY KEY NOT NULL,
	"failures" integer DEFAULT 0 NOT NULL,
	"window_ends_at" timestamp with time zone NOT NULL,
	"locked_until" timestamp with time zone,
	CONSTRAINT "sandbox_gate_attempts_failures_check" CHECK ("sandbox_gate_attempts"."failures" >= 0)
);
--> statement-breakpoint
ALTER TABLE "sandbox_gate_attempts" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "sandbox_accesses" ADD CONSTRAINT "sandbox_accesses_reviewer_id_sandbox_reviewers_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."sandbox_reviewers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sandbox_accesses" ADD CONSTRAINT "sandbox_accesses_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sandbox_view_events" ADD CONSTRAINT "sandbox_view_events_access_fk" FOREIGN KEY ("access_id","reviewer_id") REFERENCES "public"."sandbox_accesses"("id","reviewer_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sandbox_view_events" ADD CONSTRAINT "sandbox_view_events_reviewer_fk" FOREIGN KEY ("reviewer_id","slug") REFERENCES "public"."sandbox_reviewers"("id","slug") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sandbox_comments" ADD CONSTRAINT "sandbox_comments_team_user_id_users_id_fk" FOREIGN KEY ("team_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sandbox_comments" ADD CONSTRAINT "sandbox_comments_access_fk" FOREIGN KEY ("access_id","reviewer_id") REFERENCES "public"."sandbox_accesses"("id","reviewer_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sandbox_comments" ADD CONSTRAINT "sandbox_comments_reviewer_fk" FOREIGN KEY ("reviewer_id","slug") REFERENCES "public"."sandbox_reviewers"("id","slug") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sandbox_review_versions" ADD CONSTRAINT "sandbox_review_versions_access_fk" FOREIGN KEY ("access_id","reviewer_id") REFERENCES "public"."sandbox_accesses"("id","reviewer_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sandbox_review_versions" ADD CONSTRAINT "sandbox_review_versions_reviewer_fk" FOREIGN KEY ("reviewer_id","slug") REFERENCES "public"."sandbox_reviewers"("id","slug") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "sandbox_reviewers_slug_idx" ON "sandbox_reviewers" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "sandbox_accesses_reviewer_idx" ON "sandbox_accesses" USING btree ("reviewer_id");--> statement-breakpoint
CREATE INDEX "sandbox_accesses_email_idx" ON "sandbox_accesses" USING btree ("email");--> statement-breakpoint
CREATE INDEX "sandbox_accesses_user_idx" ON "sandbox_accesses" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "sandbox_view_events_access_idx" ON "sandbox_view_events" USING btree ("access_id");--> statement-breakpoint
CREATE INDEX "sandbox_view_events_reviewer_at_idx" ON "sandbox_view_events" USING btree ("reviewer_id","at");--> statement-breakpoint
CREATE INDEX "sandbox_comments_slug_reviewer_idx" ON "sandbox_comments" USING btree ("slug","reviewer_id");--> statement-breakpoint
CREATE INDEX "sandbox_comments_access_idx" ON "sandbox_comments" USING btree ("access_id");--> statement-breakpoint
CREATE INDEX "sandbox_comments_parent_idx" ON "sandbox_comments" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "sandbox_review_versions_access_idx" ON "sandbox_review_versions" USING btree ("access_id");--> statement-breakpoint
CREATE INDEX "sandbox_review_versions_slug_idx" ON "sandbox_review_versions" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "sandbox_actions_at_idx" ON "sandbox_actions" USING btree ("at");--> statement-breakpoint
CREATE POLICY "sandbox_reviewers_all_denied" ON "sandbox_reviewers" AS PERMISSIVE FOR ALL TO "authenticated" USING (false) WITH CHECK (false);--> statement-breakpoint
CREATE POLICY "sandbox_accesses_all_denied" ON "sandbox_accesses" AS PERMISSIVE FOR ALL TO "authenticated" USING (false) WITH CHECK (false);--> statement-breakpoint
CREATE POLICY "sandbox_view_events_all_denied" ON "sandbox_view_events" AS PERMISSIVE FOR ALL TO "authenticated" USING (false) WITH CHECK (false);--> statement-breakpoint
CREATE POLICY "sandbox_comments_all_denied" ON "sandbox_comments" AS PERMISSIVE FOR ALL TO "authenticated" USING (false) WITH CHECK (false);--> statement-breakpoint
CREATE POLICY "sandbox_review_versions_all_denied" ON "sandbox_review_versions" AS PERMISSIVE FOR ALL TO "authenticated" USING (false) WITH CHECK (false);--> statement-breakpoint
CREATE POLICY "sandbox_actions_all_denied" ON "sandbox_actions" AS PERMISSIVE FOR ALL TO "authenticated" USING (false) WITH CHECK (false);--> statement-breakpoint
CREATE POLICY "sandbox_gate_attempts_all_denied" ON "sandbox_gate_attempts" AS PERMISSIVE FOR ALL TO "authenticated" USING (false) WITH CHECK (false);