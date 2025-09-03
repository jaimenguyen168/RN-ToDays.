import { useState, useEffect } from "react";
import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import { TaskNotification } from "@/utils/noti";

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface Task {
  _id: string;
  title: string;
  notifications?: TaskNotification[];
}

export const useNotifications = () => {
  const [notification, setNotification] = useState<
    Notifications.Notification | undefined
  >();
  const [permissionStatus, setPermissionStatus] =
    useState<string>("undetermined");
  const [isLoading, setIsLoading] = useState(true);

  // Request notification permissions
  const requestPermissions = async () => {
    try {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      setPermissionStatus(finalStatus);

      if (finalStatus !== "granted") {
        alert("Permission to show notifications was denied");
        return false;
      }

      // Set up Android notification channel
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("taskNotifications", {
          name: "Task Notifications",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#6366f1",
        });
      }

      return true;
    } catch (error) {
      console.error("Error requesting permissions:", error);
      return false;
    }
  };

  // Schedule a single notification
  const scheduleNotification = async (
    title: string,
    body: string,
    scheduledTime: number,
    identifier?: string,
    data?: any,
  ): Promise<string | undefined> => {
    try {
      if (permissionStatus !== "granted") {
        console.warn("Notification permission not granted");
        return;
      }

      const now = Date.now();
      if (scheduledTime <= now) {
        console.warn("Cannot schedule notification in the past");
        return;
      }

      return await Notifications.scheduleNotificationAsync({
        identifier: identifier,
        content: {
          title,
          body,
          data: data || {},
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: new Date(scheduledTime),
        },
      });
    } catch (error) {
      console.error("Error scheduling notification:", error);
    }
  };

  const scheduleTaskNotifications = async (task: Task): Promise<string[]> => {
    const identifiers: string[] = [];

    if (!task.notifications || task.notifications.length === 0) {
      console.log("No notifications to schedule");
      return identifiers;
    }

    for (const notification of task.notifications) {
      const { scheduledTime, type } = notification;

      // Generate notification body based on type
      let body = "";
      switch (type) {
        case "at_start":
          body = `Your task "${task.title}" is starting now!`;
          break;
        case "5_minutes":
          body = `Your task "${task.title}" starts in 5 minutes`;
          break;
        case "15_minutes":
          body = `Your task "${task.title}" starts in 15 minutes`;
          break;
        default:
          body = `Reminder: ${task.title}`;
      }

      // Use the already calculated scheduledTime directly
      const identifier = await scheduleNotification(
        "Task Reminder",
        body,
        scheduledTime,
        `${task._id}_${type}`,
        {
          taskId: task._id,
          taskTitle: task.title,
          notificationType: type,
        },
      );

      console.log("Received identifier:", identifier);

      if (identifier) {
        identifiers.push(identifier);
      }
    }

    return identifiers;
  };

  const cancelTaskNotifications = async (taskId: string, types: string[]) => {
    try {
      const cancelPromises = types.map((type) =>
        Notifications.cancelScheduledNotificationAsync(`${taskId}_${type}`),
      );
      await Promise.all(cancelPromises);
      console.log(`Cancelled notifications for task: ${taskId}`);
    } catch (error) {
      console.error("Error cancelling task notifications:", error);
    }
  };

  const getScheduledNotifications = async () => {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error("Error getting scheduled notifications:", error);
      return [];
    }
  };

  // Test notification (2 seconds from now)
  const scheduleTestNotification = async () => {
    return await scheduleNotification(
      "Test Notification",
      "This is a test notification!",
      Date.now() + 2000,
      "test",
      { test: true },
    );
  };

  const clearAllNotifications = async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log("All scheduled notifications have been cancelled");
    } catch (error) {
      console.error("Error clearing all notifications:", error);
    }
  };

  // Initialize
  useEffect(() => {
    const initialize = async () => {
      setIsLoading(true);
      await requestPermissions();
      setIsLoading(false);
    };

    initialize();

    const notificationListener = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("Notification received:", notification);
        setNotification(notification);
      },
    );

    const responseListener =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notification tapped:", response);

        const data = response.notification.request.content.data;
        if (data?.taskId) {
          console.log("Task ID from notification:", data.taskId);
          // Handle navigation here if needed
        }
      });

    return () => {
      notificationListener.remove();
      responseListener.remove();
    };
  }, []);

  return {
    // State
    notification,
    permissionStatus,
    isLoading,

    // Functions
    requestPermissions,
    scheduleNotification,
    scheduleTaskNotifications,
    cancelTaskNotifications,
    getScheduledNotifications,
    scheduleTestNotification,
    clearAllNotifications,
  };
};
