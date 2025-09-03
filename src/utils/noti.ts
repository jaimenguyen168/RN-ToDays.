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

    console.log("Calculation debug:");
    console.log("Task date timestamp:", taskDate);
    console.log("Start time string:", startTime);
    console.log(
      "Task start datetime:",
      new Date(taskStartTime).toLocaleString(),
    );

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

    console.log(
      `${type} notification scheduled for:`,
      new Date(scheduledTime).toLocaleString(),
    );
    console.log("Current time:", new Date().toLocaleString());
    console.log("Is in future:", scheduledTime > Date.now());

    return {
      type: type as (typeof NotificationTypes)[keyof typeof NotificationTypes],
      scheduledTime,
    };
  });
};

// // New function for single date (keep for backward compatibility)
// export const createNotificationSettings = (
//   selectedTypes: string[],
//   taskDate: number,
//   startTime: string,
// ): TaskNotification[] => {
//   if (!selectedTypes.length) {
//     return [];
//   }
//
//   return selectedTypes.map((type) => {
//     const scheduledTime = calculateNotificationTime(taskDate, startTime, type);
//
//     return {
//       type: type as (typeof NotificationTypes)[keyof typeof NotificationTypes],
//       scheduledTime,
//       notificationId: undefined,
//     };
//   });
// };
//
// // New function for recurring tasks with multiple dates
// export const createRecurringNotificationSettings = (
//   selectedTypes: string[],
//   startDate: number,
//   endDate: number,
//   selectedWeekDays: string[],
//   startTime: string,
// ): { [taskDate: number]: TaskNotification[] } => {
//   if (!selectedTypes.length) {
//     return {};
//   }
//
//   const weekdays = [
//     "sunday",
//     "monday",
//     "tuesday",
//     "wednesday",
//     "thursday",
//     "friday",
//     "saturday",
//   ];
//   const isDaily = !selectedWeekDays || selectedWeekDays.length === 0;
//   const current = new Date(startDate);
//   const end = new Date(endDate);
//
//   const notificationsByDate: { [taskDate: number]: TaskNotification[] } = {};
//
//   while (current <= end) {
//     let shouldCreate = isDaily;
//
//     if (!isDaily) {
//       const currentDayName = weekdays[current.getDay()];
//       shouldCreate = selectedWeekDays.includes(currentDayName);
//     }
//
//     if (shouldCreate) {
//       const taskDateKey = current.getTime();
//       notificationsByDate[taskDateKey] = selectedTypes.map((type) => {
//         const scheduledTime = calculateNotificationTime(
//           taskDateKey,
//           startTime,
//           type,
//         );
//
//         return {
//           type: type as (typeof NotificationTypes)[keyof typeof NotificationTypes],
//           scheduledTime,
//           notificationId: undefined,
//         };
//       });
//     }
//
//     current.setDate(current.getDate() + 1);
//   }
//
//   return notificationsByDate;
// };
