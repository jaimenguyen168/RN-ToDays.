import { TaskNotification } from "@/utils/noti";
import { Id } from "~/convex/_generated/dataModel";

export interface Task {
  _id: string;
  title: string;
  startTime: number;
  endTime: number;
  tags: string[];
  type: string;
  date: number;
  isCompleted: boolean;
  note?: string;
  recurringId?: string;
  notifications?: TaskNotification[];
}

export interface RecurringTask {
  _id: Id<"recurrings">;
  title: string;
  type: string;
  tags: string[];
  selectedWeekDays?: string[];
  startDate: number;
  endDate: number;
  isActive: boolean;
  userId: string;
  taskCount: number;
}
