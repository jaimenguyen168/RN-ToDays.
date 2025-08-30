import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { TaskTypes } from "../schemas/tasks";

export const create = mutation({
  args: {
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
    hasEndDate: v.boolean(),
    selectedWeekDays: v.array(v.string()),
    recurringDates: v.array(v.number()),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    if (
      args.hasEndDate &&
      (!args.selectedWeekDays || args.selectedWeekDays.length === 0)
    ) {
      throw new Error(
        "Must select at least one day of the week for recurring tasks",
      );
    }

    const taskData = {
      title: args.title.trim(),
      description: args.description?.trim() || undefined,
      startDate: args.startDate,
      endDate: args.endDate,
      startTime: args.startTime,
      endTime: args.endTime,
      type: args.type,
      tags: args.tags,
      hasEndDate: args.hasEndDate,
      selectedWeekDays: args.selectedWeekDays,
      recurringDates: args.recurringDates,

      weeklyCompletions: args.hasEndDate ? {} : undefined,
      isCompleted: false,
      completedAt: undefined,

      updatedAt: now,
      userId: args.userId,
    };

    await ctx.db.insert("tasks", taskData);
  },
});
