import { v } from "convex/values";
import { defineTable } from "convex/server";

export const users = defineTable({
  externalId: v.string(),
  username: v.string(),
  fullName: v.optional(v.string()),
  email: v.optional(v.string()),
  imageUrl: v.optional(v.string()),
})
  .index("by_external_id", ["externalId"])
  .index("by_username", ["username"]);
