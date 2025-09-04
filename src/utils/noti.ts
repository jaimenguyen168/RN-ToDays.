const NotificationTypes = {
  FIFTEEN_MINUTES: "15_minutes",
  FIVE_MINUTES: "5_minutes",
  AT_START: "at_start",
} as const;

export type TaskNotification = {
  type: (typeof NotificationTypes)[keyof typeof NotificationTypes];
  scheduledTime: number;
};

export const calculateNotifications = (
  taskDate: number,
  startTime: string,
  types: string[],
) => {
  if (!types || types.length === 0) return undefined;

  return types.map((type) => {
    const [hours, minutes] = startTime.split(":").map(Number);

    // Since taskDate is already a timestamp, just add the hours and minutes
    const taskStartTime =
      taskDate + hours * 60 * 60 * 1000 + minutes * 60 * 1000;

    let scheduledTime;
    switch (type) {
      case NotificationTypes.FIFTEEN_MINUTES:
        scheduledTime = taskStartTime - 15 * 60 * 1000;
        break;
      case NotificationTypes.FIVE_MINUTES:
        scheduledTime = taskStartTime - 5 * 60 * 1000;
        break;
      case NotificationTypes.AT_START:
        scheduledTime = taskStartTime;
        break;
      default:
        scheduledTime = taskStartTime;
    }

    return {
      type: type as (typeof NotificationTypes)[keyof typeof NotificationTypes],
      scheduledTime,
    };
  });
};
