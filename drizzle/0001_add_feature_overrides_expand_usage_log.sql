-- Custom SQL migration file, put your code below! --

-- Safe column rename: lookup_type -> action_type
-- Using RENAME COLUMN instead of DROP+ADD to preserve existing data (D-13)
ALTER TABLE "usage_log" RENAME COLUMN "lookup_type" TO "action_type";
--> statement-breakpoint

-- Expand usage_log with new metering columns (METER-01, D-12, D-13)
ALTER TABLE "usage_log" ADD COLUMN "cost_estimate_cents" integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE "usage_log" ADD COLUMN "api_provider" text DEFAULT 'internal' NOT NULL;
--> statement-breakpoint
ALTER TABLE "usage_log" ADD COLUMN "property_id" uuid;
--> statement-breakpoint
ALTER TABLE "usage_log" ADD COLUMN "metadata" jsonb;
--> statement-breakpoint
ALTER TABLE "usage_log" ADD COLUMN "plan_at_time_of_action" text DEFAULT 'free' NOT NULL;
--> statement-breakpoint

-- Create feature_overrides table (D-04)
-- Stores per-user, per-feature, or global tier overrides for the hybrid GatingService
CREATE TABLE "feature_overrides" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"scope" text NOT NULL,
	"user_id" text,
	"cohort_id" uuid,
	"feature" text NOT NULL,
	"tier_override" integer NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"expires_at" timestamp,
	"granted_by" text NOT NULL,
	"reason" text NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- Indexes per D-05
CREATE INDEX "user_feature_active_idx" ON "feature_overrides" ("user_id","feature","is_active");
--> statement-breakpoint
CREATE INDEX "scope_feature_active_idx" ON "feature_overrides" ("scope","feature","is_active");
--> statement-breakpoint
CREATE INDEX "expires_at_idx" ON "feature_overrides" ("expires_at");
--> statement-breakpoint

-- Foreign key: feature_overrides.user_id -> user.id (set null on user delete)
ALTER TABLE "feature_overrides" ADD CONSTRAINT "feature_overrides_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
