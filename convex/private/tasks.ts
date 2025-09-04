import { ConvexError, v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { TaskTypes } from "../schemas/tasks";
import { calculateNotifications } from "../../src/utils/noti";

export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    startDate: v.number(),
    endDate: v.optional(v.number()),
    startTime: v.number(), // Now a timestamp instead of string
    endTime: v.number(), // Now a timestamp instead of string
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
      const taskId = await ctx.db.insert("tasks", {
        title: args.title,
        description: args.description,
        date: args.startDate,
        startTime: args.startTime,
        endTime: args.endTime,
        type: args.type,
        tags: args.tags,
        isCompleted: false,
        notifications: calculateNotifications(
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

    // Start with the original timestamps
    let currentStartTime = args.startTime;
    let currentEndTime = args.endTime;
    let currentDate = args.startDate;

    while (currentDate <= args.endDate!) {
      const dateObj = new Date(currentDate);
      const shouldCreate =
        isDaily || args.selectedWeekDays?.includes(weekdays[dateObj.getDay()]);

      if (shouldCreate) {
        const taskId = await ctx.db.insert("tasks", {
          title: args.title,
          description: args.description,
          date: currentDate,
          startTime: currentStartTime,
          endTime: currentEndTime,
          type: args.type,
          tags: args.tags,
          isCompleted: false,
          recurringId,
          notifications: calculateNotifications(
            currentStartTime,
            args.notifications || [],
          ),
          note: args.note,
          updatedAt: now,
          userId: args.userId,
        });

        const task = await ctx.db.get(taskId);
        if (task) tasks.push(task);
      }

      // Simply add 24 hours to all timestamps for next day
      currentDate += oneDayMs;
      currentStartTime += oneDayMs;
      currentEndTime += oneDayMs;
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

    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) =>
        q.and(
          q.gte(q.field("date"), startTimestamp),
          q.lte(q.field("date"), endTimestamp),
        ),
      )
      .collect();

    return tasks.sort((a, b) => a.startTime - b.startTime);
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
      startTime: v.optional(v.number()),
      endTime: v.optional(v.number()),
      type: v.optional(
        v.union(
          v.literal(TaskTypes.PERSONAL),
          v.literal(TaskTypes.WORK),
          v.literal(TaskTypes.EMERGENCY),
        ),
      ),
      tags: v.optional(v.array(v.string())),
      note: v.optional(v.string()),
      notifications: v.optional(v.array(v.string())),
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

    const now = Date.now();

    // Prepare updates with recalculated notifications if needed
    const prepareUpdates = (taskToUpdate: any) => {
      const { notifications, ...otherUpdates } = args.updates;
      const baseUpdates = { ...otherUpdates, updatedAt: now };

      // Recalculate notifications if provided
      if (notifications !== undefined) {
        const startTimeToUse = args.updates.startTime || taskToUpdate.startTime;
        const calculatedNotifications = calculateNotifications(
          startTimeToUse, // Use timestamp directly like create
          notifications || [],
        );

        return {
          ...baseUpdates,
          notifications: calculatedNotifications,
        };
      }

      return baseUpdates;
    };

    // Handle one-time task
    if (!task?.recurringId) {
      const updates = prepareUpdates(task);
      await ctx.db.patch(args.taskId, updates);
      const updatedTask = await ctx.db.get(args.taskId);
      return updatedTask ? [updatedTask] : [];
    }

    // Handle recurring tasks
    const updatedTasks = [];

    switch (args.editScope) {
      case "this_only":
        const thisOnlyUpdates = {
          ...prepareUpdates(task),
          recurringId: undefined, // Detach from recurring series
        };
        await ctx.db.patch(args.taskId, thisOnlyUpdates);
        const singleTask = await ctx.db.get(args.taskId);
        if (singleTask) updatedTasks.push(singleTask);
        break;

      case "all":
        const allTasks = await ctx.db
          .query("tasks")
          .withIndex("by_recurring", (q) =>
            q.eq("recurringId", task.recurringId),
          )
          .collect();

        for (const t of allTasks) {
          const updates = prepareUpdates(t);
          await ctx.db.patch(t._id, updates);
          const updatedTask = await ctx.db.get(t._id);
          if (updatedTask) updatedTasks.push(updatedTask);
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
          const updates = prepareUpdates(t);
          await ctx.db.patch(t._id, updates);
          const updatedTask = await ctx.db.get(t._id);
          if (updatedTask) updatedTasks.push(updatedTask);
        }
        break;
    }

    return updatedTasks;
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
