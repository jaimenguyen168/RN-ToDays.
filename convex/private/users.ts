import { ConvexError, v } from "convex/values";
import { mutation, query } from "../_generated/server";

const getCurrentUser = async (ctx: any) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new ConvexError({
      code: "UNAUTHORIZED",
      message: "Not authenticated",
    });
  }

  const user = await ctx.db
    .query("users")
    .withIndex("by_external_id", (q: any) =>
      q.eq("externalId", identity.subject),
    )
    .unique();

  if (!user) {
    throw new ConvexError({
      code: "USER_NOT_FOUND",
      message: "User not found in database",
    });
  }

  return user;
};

export const getUser = query({
  args: {},
  handler: async (ctx) => {
    return await getCurrentUser(ctx);
  },
});

export const updateProfileImage = mutation({
  args: {
    imageUrl: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);

    await ctx.db.patch(user._id, {
      imageUrl: args.imageUrl,
    });
  },
});
