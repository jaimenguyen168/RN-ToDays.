import { TaskTypes } from "~/convex/schemas/tasks";

export const getTaskColors = (type: string) => {
  switch (type) {
    case TaskTypes.EMERGENCY:
      return "#ff6b6b";
    case TaskTypes.PERSONAL:
      return "#a855f7";
    case TaskTypes.JOB:
      return "#22c55e";
    default:
      return "#94a3b8";
  }
};
