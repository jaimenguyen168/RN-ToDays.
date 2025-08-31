import { defineTable } from "convex/server";
import { v } from "convex/values";

export const TaskTypes = {
  PERSONAL: "Personal",
  JOB: "Job",
  EMERGENCY: "Emergency",
} as const;

// Table for individual task instances
export const tasks = defineTable({
  title: v.string(),
  description: v.optional(v.string()),
  date: v.number(),
  startTime: v.string(),
  endTime: v.string(),
  type: v.union(
    v.literal(TaskTypes.PERSONAL),
    v.literal(TaskTypes.JOB),
    v.literal(TaskTypes.EMERGENCY),
  ),
  tags: v.array(v.string()),
  note: v.optional(v.string()),

  // Completion tracking
  isCompleted: v.boolean(),
  completedAt: v.optional(v.number()),

  // Reference to recurring template (if this task is part of a recurring series)
  recurringId: v.optional(v.id("recurrings")),

  // Metadata
  updatedAt: v.number(),
  userId: v.string(),
})
  .index("by_user", ["userId"])
  .index("by_date", ["date"])
  .index("by_user_and_date", ["userId", "date"])
  .index("by_tags", ["tags"])
  .index("by_user_and_tags", ["userId", "tags"])
  .index("by_task_type", ["type"])
  .index("by_user_and_type", ["userId", "type"])
  .index("by_recurring", ["recurringId"])
  .index("by_user_and_recurring", ["userId", "recurringId"]);

// Table for recurring task templates
export const recurrings = defineTable({
  title: v.string(),
  startTime: v.string(),
  endTime: v.string(),
  type: v.union(
    v.literal(TaskTypes.PERSONAL),
    v.literal(TaskTypes.JOB),
    v.literal(TaskTypes.EMERGENCY),
  ),
  tags: v.array(v.string()),

  // Recurring pattern configuration
  selectedWeekDays: v.optional(v.array(v.string())), // ["monday", "wednesday", "friday"]

  // Date range for the recurring pattern
  startDate: v.number(), // When the recurring pattern starts
  endDate: v.number(), // When the recurring pattern ends (null for indefinite)

  // Status
  isActive: v.boolean(),

  // Metadata
  userId: v.string(),
})
  .index("by_user", ["userId"])
  .index("by_user_and_active", ["userId", "isActive"])
  .index("by_task_type", ["type"])
  .index("by_user_and_type", ["userId", "type"]);
