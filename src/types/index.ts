import { TaskNotification } from "@/utils/noti";

export interface Task {
  _id: string;
  title: string;
  startTime: string;
  endTime: string;
  tags: string[];
  type: string;
  date: number;
  isCompleted: boolean;
  note?: string;
  recurringId?: string;
  notifications?: TaskNotification[];
}
