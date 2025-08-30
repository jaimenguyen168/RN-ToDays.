import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
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

export const getAllTasks = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

export const getTasksWithFilters = query({
  args: {
    userId: v.string(),
    type: v.optional(
      v.union(
        v.literal(TaskTypes.PERSONAL),
        v.literal(TaskTypes.JOB),
        v.literal(TaskTypes.EMERGENCY),
      ),
    ),
    isCompleted: v.optional(v.boolean()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", args.userId));

    let filteredTasks = await query.collect();

    if (args.type) {
      filteredTasks = filteredTasks.filter((task) => task.type === args.type);
    }

    if (args.isCompleted !== undefined) {
      filteredTasks = filteredTasks.filter(
        (task) => task.isCompleted === args.isCompleted,
      );
    }

    if (args.tags && args.tags.length > 0) {
      filteredTasks = filteredTasks.filter((task) =>
        args.tags!.some((tag) => task.tags.includes(tag)),
      );
    }

    filteredTasks.sort((a, b) => b.startDate - a.startDate);

    return filteredTasks;
  },
});

export const getTasksForDate = query({
  args: {
    userId: v.string(),
    date: v.number(),
  },
  handler: async (ctx, args) => {
    const startOfDay = new Date(args.date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(args.date);
    endOfDay.setHours(23, 59, 59, 999);

    return await ctx.db
      .query("tasks")
      .withIndex("by_user_and_date", (q) =>
        q
          .eq("userId", args.userId)
          .gte("startDate", startOfDay.getTime())
          .lte("startDate", endOfDay.getTime()),
      )
      .collect();
  },
});
