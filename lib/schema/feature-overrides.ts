import {
  pgTable,
  text,
  timestamp,
  uuid,
  boolean,
  integer,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

/**
 * feature_overrides table
 *
 * Stores per-user, per-feature, or global tier overrides for the hybrid GatingService.
 *
 * Precedence (D-02): user-level override > global override > TypeScript config
 *
 * Schema per D-04. Indexes per D-05.
 * Soft delete via is_active=false — never hard delete (audit trail) per D-07.
 */
export const featureOverrides = pgTable(
  "feature_overrides",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    /**
     * Scope of this override:
     * - 'user': applies to a specific user (userId must be set)
     * - 'global': applies to all users (userId is null)
     * - 'cohort': applies to a cohort of users (cohortId must be set)
     */
    scope: text("scope").notNull(), // 'user' | 'global' | 'cohort'

    /**
     * Target user for user-scoped overrides. Null for global or cohort overrides.
     * On user deletion, set to null (preserve audit trail).
     */
    userId: text("user_id").references(() => user.id, { onDelete: "set null" }),

    /** Target cohort for cohort-scoped overrides. Null for user/global overrides. */
    cohortId: uuid("cohort_id"),

    /**
     * Feature name — must match a Feature enum value from lib/config/feature-tiers.ts.
     * Validated against the TypeScript enum on insert (D-03).
     * Stored as text, not a Postgres enum, so new features can be added without migrations.
     */
    feature: text("feature").notNull(),

    /**
     * Override tier: 1 (always free), 2 (preview free), or 3 (Pro only).
     * When this override is active, the GatingService uses this tier
     * instead of the value in FEATURE_TIER_CONFIG.
     */
    tierOverride: integer("tier_override").notNull(),

    /** Whether this override is currently active. Set to false to disable (never DELETE). */
    isActive: boolean("is_active").notNull().default(true),

    /**
     * Expiry timestamp. Null = permanent override.
     * Weekly background job soft-deletes expired overrides by setting is_active=false (D-07).
     */
    expiresAt: timestamp("expires_at"),

    /**
     * Admin user ID that granted this override, or 'system' for automated grants.
     * Required for audit trail.
     */
    grantedBy: text("granted_by").notNull(),

    /**
     * Human-readable reason for the override. Required.
     * Examples: 'beta_access', 'trial', 'founder_grant', 'support_exception'
     */
    reason: text("reason").notNull(),

    /**
     * Additional metadata for the override (e.g., grant source, campaign ID).
     * No default — per Pitfall 7 in RESEARCH.md: jsonb defaults cause migration issues.
     */
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    // D-05: Primary lookup index for per-user feature gate checks
    index("user_feature_active_idx").on(table.userId, table.feature, table.isActive),
    // D-05: Index for global and cohort override lookups
    index("scope_feature_active_idx").on(table.scope, table.feature, table.isActive),
    // D-05: Index for weekly expiry cleanup job (D-07)
    index("expires_at_idx").on(table.expiresAt),
  ]
);
