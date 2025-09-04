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
  startTime: number,
  types: string[],
): TaskNotification[] | undefined => {
  if (!types || types.length === 0) return undefined;

  return types.map((type) => {
    let scheduledTime: number;

    switch (type) {
      case NotificationTypes.FIFTEEN_MINUTES:
        scheduledTime = startTime - 15 * 60 * 1000;
        break;
      case NotificationTypes.FIVE_MINUTES:
        scheduledTime = startTime - 5 * 60 * 1000;
        break;
      case NotificationTypes.AT_START:
        scheduledTime = startTime;
        break;
      default:
        scheduledTime = startTime;
    }

    return {
      type: type as (typeof NotificationTypes)[keyof typeof NotificationTypes],
      scheduledTime,
    };
  });
};
