import { defineTable } from "convex/server";
import { v } from "convex/values";

export const TaskTypes = {
  PERSONAL: "Personal",
  JOB: "Job",
  EMERGENCY: "Emergency",
} as const;

export default defineTable({
  title: v.string(),
  description: v.optional(v.string()),
  startDate: v.number(),
  endDate: v.optional(v.number()),
  startTime: v.string(),
  endTime: v.string(),
  type: v.union(
    v.literal(TaskTypes.PERSONAL),
    v.literal(TaskTypes.JOB),
    v.literal(TaskTypes.EMERGENCY),
  ),
  tags: v.array(v.string()),

  // Recurring task fields
  hasEndDate: v.boolean(),
  selectedWeekDays: v.optional(v.array(v.string())),
  recurringDates: v.optional(v.array(v.number())),

  // Completion tracking for recurring tasks
  weeklyCompletions: v.optional(v.object({})),

  // One-time task completion
  isCompleted: v.boolean(),
  completedAt: v.optional(v.number()),

  // Metadata
  updatedAt: v.number(),
  userId: v.string(),
})
  .index("by_user", ["userId"])
  .index("by_date", ["startDate"])
  .index("by_user_and_date", ["userId", "startDate"])
  .index("by_tags", ["tags"])
  .index("by_user_and_tags", ["userId", "tags"])
  .index("by_task_type", ["type"])
  .index("by_user_and_type", ["userId", "type"]);
