import { ConvexError, v } from "convex/values";
import { query } from "../_generated/server";

export const getUser = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);

    if (!user) {
      throw new ConvexError({
        code: "USER_NOT_FOUND",
        message: "User not found in database",
      });
    }

    return user;
  },
});
