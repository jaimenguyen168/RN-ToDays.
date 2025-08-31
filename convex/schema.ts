import { defineSchema } from "convex/server";
import { users } from "./schemas/users";
import { recurrings, tasks } from "./schemas/tasks";

export default defineSchema({
  users: users,
  tasks: tasks,
  recurrings: recurrings,
});
