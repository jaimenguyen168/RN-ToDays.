import { ConvexError, v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { NotificationTypes, TaskTypes } from "../schemas/tasks";
import { calculateNotifications } from "../../src/utils/noti";
import { normalizeDateTo6AM } from "../../src/utils/time";

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
      v.literal(TaskTypes.WORK),
      v.literal(TaskTypes.EMERGENCY),
    ),
    tags: v.array(v.string()),
    hasEndDate: v.boolean(),
    selectedWeekDays: v.optional(v.array(v.string())),
    note: v.optional(v.string()),
    notifications: v.optional(v.array(v.string())),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // One-time task
    if (!args.hasEndDate || !args.endDate) {
      const normalizedDate = normalizeDateTo6AM(args.startDate);

      const taskId = await ctx.db.insert("tasks", {
        title: args.title,
        description: args.description,
        date: normalizedDate,
        startTime: args.startTime,
        endTime: args.endTime,
        type: args.type,
        tags: args.tags,
        isCompleted: false,
        notifications: calculateNotifications(
          args.startDate,
          args.startTime,
          args.notifications || [],
        ),
        note: args.note,
        updatedAt: now,
        userId: args.userId,
      });

      return await ctx.db.get(taskId);
    }

    const recurringId = await ctx.db.insert("recurrings", {
      title: args.title,
      startTime: args.startTime,
      endTime: args.endTime,
      type: args.type,
      tags: args.tags,
      selectedWeekDays: args.selectedWeekDays,
      startDate: args.startDate,
      endDate: args.endDate,
      isActive: true,
      userId: args.userId,
    });

    const tasks = [];
    const isDaily =
      !args.selectedWeekDays || args.selectedWeekDays.length === 0;
    const weekdays = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    const oneDayMs = 24 * 60 * 60 * 1000;

    let currentTimestamp = args.startDate;

    while (currentTimestamp <= args.endDate!) {
      const currentDate = new Date(currentTimestamp);
      const shouldCreate =
        isDaily ||
        args.selectedWeekDays?.includes(weekdays[currentDate.getDay()]);

      if (shouldCreate) {
        const normalizedDate = normalizeDateTo6AM(currentTimestamp);

        const taskId = await ctx.db.insert("tasks", {
          title: args.title,
          description: args.description,
          date: normalizedDate,
          startTime: args.startTime,
          endTime: args.endTime,
          type: args.type,
          tags: args.tags,
          isCompleted: false,
          recurringId,
          notifications: calculateNotifications(
            currentDate.getTime(),
            args.startTime,
            args.notifications || [],
          ),
          note: args.note,
          updatedAt: now,
          userId: args.userId,
        });

        const task = await ctx.db.get(taskId);
        if (task) tasks.push(task);
      }

      currentTimestamp += oneDayMs;
    }

    return tasks;
  },
});

export const getTaskById = query({
  args: {
    taskId: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.taskId);
  },
});

export const getTasksWithFilters = query({
  args: {
    userId: v.string(),
    type: v.optional(
      v.union(
        v.literal(TaskTypes.PERSONAL),
        v.literal(TaskTypes.WORK),
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

    filteredTasks.sort((a, b) => b.date - a.date);

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
    startOfDay.setUTCHours(0, 0, 0, 0);
    const startTimestamp = startOfDay.getTime();

    const endOfDay = new Date(args.date);
    endOfDay.setUTCHours(23, 59, 59, 999);
    const endTimestamp = endOfDay.getTime();

    return await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) =>
        q.and(
          q.gte(q.field("date"), startTimestamp),
          q.lte(q.field("date"), endTimestamp),
        ),
      )
      .collect();
  },
});

export const toggleCompleted = mutation({
  args: {
    taskId: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);

    if (!task) {
      throw new Error("Task not found");
    }

    const now = Date.now();

    await ctx.db.patch(args.taskId, {
      isCompleted: !task.isCompleted,
      completedAt: !task.isCompleted ? now : undefined,
      updatedAt: now,
    });
  },
});

export const getRecurringTasks = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("recurrings")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

export const getRecurringTaskIds = query({
  args: {
    recurringId: v.optional(v.id("recurrings")),
  },
  handler: async (ctx, args) => {
    if (!args.recurringId) {
      return [];
    }

    const allTasks = await ctx.db
      .query("tasks")
      .withIndex("by_recurring", (q) => q.eq("recurringId", args.recurringId))
      .collect();

    return allTasks.map((task) => task._id);
  },
});

export const editTask = mutation({
  args: {
    taskId: v.id("tasks"),
    updates: v.object({
      title: v.optional(v.string()),
      description: v.optional(v.string()),
      startTime: v.optional(v.string()),
      endTime: v.optional(v.string()),
      type: v.union(
        v.literal(TaskTypes.PERSONAL),
        v.literal(TaskTypes.WORK),
        v.literal(TaskTypes.EMERGENCY),
      ),
      tags: v.optional(v.array(v.string())),
      note: v.optional(v.string()),
      notifications: v.optional(
        v.array(
          v.object({
            type: v.union(
              v.literal(NotificationTypes.FIFTEEN_MINUTES),
              v.literal(NotificationTypes.FIVE_MINUTES),
              v.literal(NotificationTypes.AT_START),
            ),
            scheduledTime: v.number(),
            notificationId: v.optional(v.string()),
          }),
        ),
      ),
    }),
    editScope: v.union(
      v.literal("this_only"),
      v.literal("all"),
      v.literal("this_and_future"),
    ),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);

    if (!task) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Task not found",
      });
    }

    if (!task?.recurringId) {
      return await ctx.db.patch(args.taskId, args.updates);
    }

    const now = Date.now();

    switch (args.editScope) {
      case "this_only":
        await ctx.db.patch(args.taskId, {
          ...args.updates,
          recurringId: undefined,
          updatedAt: now,
        });
        break;

      case "all":
        const allTasks = await ctx.db
          .query("tasks")
          .withIndex("by_recurring", (q) =>
            q.eq("recurringId", task.recurringId),
          )
          .collect();

        for (const t of allTasks) {
          await ctx.db.patch(t._id, { ...args.updates, updatedAt: now });
        }
        break;

      case "this_and_future":
        const futureTasks = await ctx.db
          .query("tasks")
          .withIndex("by_recurring", (q) =>
            q.eq("recurringId", task.recurringId),
          )
          .filter((q) => q.gte(q.field("date"), task.date))
          .collect();

        for (const t of futureTasks) {
          await ctx.db.patch(t._id, { ...args.updates, updatedAt: now });
        }
        break;
    }
  },
});

export const deleteTask = mutation({
  args: {
    taskId: v.id("tasks"),
    deleteScope: v.optional(
      v.union(
        v.literal("this_only"),
        v.literal("all"),
        v.literal("this_and_future"),
      ),
    ),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);

    if (!task) {
      throw new ConvexError({
        code: "NOT_FOUND",
        message: "Task not found",
      });
    }

    if (!task.recurringId || !args.deleteScope) {
      await ctx.db.delete(args.taskId);
      return;
    }

    switch (args.deleteScope) {
      case "this_only":
        await ctx.db.delete(args.taskId);
        break;

      case "all":
        const allTasks = await ctx.db
          .query("tasks")
          .withIndex("by_recurring", (q) =>
            q.eq("recurringId", task.recurringId),
          )
          .collect();

        await ctx.db.delete(task.recurringId);
        for (const t of allTasks) {
          await ctx.db.delete(t._id);
        }
        break;

      case "this_and_future":
        const futureTasks = await ctx.db
          .query("tasks")
          .withIndex("by_recurring", (q) =>
            q.eq("recurringId", task.recurringId),
          )
          .filter((q) => q.gte(q.field("date"), task.date))
          .collect();

        for (const t of futureTasks) {
          await ctx.db.delete(t._id);
        }
        break;
    }
  },
});
