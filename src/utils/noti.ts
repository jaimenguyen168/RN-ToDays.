import { NotificationTypes } from "~/convex/schemas/tasks";

export type TaskNotification = {
  type: (typeof NotificationTypes)[keyof typeof NotificationTypes];
  scheduledTime: number;
  notificationId?: string;
};

export const calculateNotificationTime = (
  taskDate: number,
  startTime: string,
  notificationType: string,
): number => {
  const [hours, minutes] = startTime.split(":").map(Number);

  const taskStartDate = new Date(taskDate);
  taskStartDate.setHours(hours, minutes, 0, 0);
  const taskStartTime = taskStartDate.getTime();

  switch (notificationType) {
    case NotificationTypes.FIFTEEN_MINUTES:
      return taskStartTime - 15 * 60 * 1000;
    case NotificationTypes.FIVE_MINUTES:
      return taskStartTime - 5 * 60 * 1000;
    case NotificationTypes.AT_START:
      return taskStartTime;
    default:
      return taskStartTime;
  }
};

export const createNotificationSettings = (
  selectedTypes: string[],
  taskDate: number,
  startTime: string,
): TaskNotification[] => {
  if (!selectedTypes.length) {
    return [];
  }

  return selectedTypes.map((type) => {
    const scheduledTime = calculateNotificationTime(taskDate, startTime, type);

    return {
      type: type as (typeof NotificationTypes)[keyof typeof NotificationTypes],
      scheduledTime,
      notificationId: undefined,
    };
  });
};
