import { pgTable, text, timestamp, uuid, integer, jsonb } from "drizzle-orm/pg-core";
import { user } from "./auth";

/**
 * usage_log table
 *
 * Every metered action is logged BEFORE execution (D-12, METER-01).
 * Log: user_id, timestamp, action_type, cost_estimate_cents, api_provider,
 *      property_id (nullable), metadata JSON, plan_at_time_of_action.
 *
 * Schema expanded per D-13 from the original 6-column table.
 * Column rename: lookupType -> actionType (more accurate; covers all action types not just lookups).
 * propertyAddress retained for backward compatibility.
 */
export const usageLog = pgTable("usage_log", {
  id: uuid("id").defaultRandom().primaryKey(),

  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  /**
   * Action type — matches ActionType enum values from lib/config/feature-tiers.ts.
   * Renamed from lookupType (migration: ALTER TABLE usage_log RENAME COLUMN lookup_type TO action_type).
   */
  actionType: text("action_type").notNull(),

  /** Property address as entered by user. Retained for backward compatibility. */
  propertyAddress: text("property_address"),

  /** Processing status: pending | success | failed */
  status: text("status").notNull().default("pending"),

  /**
   * Estimated cost of this action in cents.
   * Based on ACTION_COST_ESTIMATES from lib/config/feature-tiers.ts.
   * Logged at action time; actual cost may differ if API pricing changes.
   */
  costEstimateCents: integer("cost_estimate_cents").notNull().default(0),

  /**
   * External API provider called for this action.
   * Values: county_api | gis_api | openstreetmap | rentcast | attom | internal | skip_trace
   * Default 'internal' for actions with no external API call.
   */
  apiProvider: text("api_provider").notNull().default("internal"),

  /**
   * Property ID from the properties table (nullable — not yet available at Stage 1 lookup time).
   * Set once the property record is created from the enrichment response.
   */
  propertyId: uuid("property_id"),

  /**
   * JSON metadata for the action — additional context not captured in other columns.
   * Examples: county name, address normalization result, error codes, cache hit/miss.
   * No default — null when no extra context needed.
   */
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),

  /**
   * Subscription tier at the time the action was executed.
   * Captured before any plan changes to preserve accurate historical cost accounting.
   * Values: 'free' | 'pro'
   */
  planAtTimeOfAction: text("plan_at_time_of_action").notNull().default("free"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
});
