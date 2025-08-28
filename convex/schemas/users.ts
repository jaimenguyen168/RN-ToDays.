import { v } from "convex/values";
import { defineTable } from "convex/server";

export const users = defineTable({
  email: v.string(),
  externalId: v.string(),
  fullName: v.string(),
  imageUrl: v.optional(v.string()),
}).index("by_external_id", ["externalId"]);
