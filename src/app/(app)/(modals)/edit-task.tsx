import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { ThemedIcon } from "@/components/ThemedIcon";
import DatePicker from "react-native-date-picker";
import { z } from "zod";
import { useMutation, useQuery } from "convex/react";
import { api } from "~/convex/_generated/api";
import { NotificationTypes, TaskTypes } from "~/convex/schemas/tasks";
import { Id } from "~/convex/_generated/dataModel";
import ScopeSelectionModal from "@/components/ScopeSelectionModal";
import { useNotifications } from "@/hooks/useNotifications";
import { formatDateTime } from "@/utils/time";
import AppButton from "@/components/AppButton";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

const taskSchemaForm = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.optional(z.string()),
  startTime: z.date(),
  endTime: z.date(),
  type: z.nativeEnum(TaskTypes),
  tags: z.array(z.string()),
  note: z.optional(z.string()),
  notifications: z.array(z.string()),
});

type TaskFormData = z.infer<typeof taskSchemaForm>;

const EditTask = () => {
  const router = useRouter();
  const { taskId } = useLocalSearchParams<{ taskId: string }>();

  const {
    scheduleTaskNotifications,
    cancelTaskNotifications,
    permissionStatus,
  } = useNotifications();

  const task = useQuery(api.private.tasks.getTaskById, {
    taskId: taskId as Id<"tasks">,
  });

  const [formData, setFormData] = useState<TaskFormData>({
    title: "",
    description: "",
    startTime: new Date(),
    endTime: new Date(),
    type: TaskTypes.PERSONAL,
    tags: [],
    note: "",
    notifications: [],
  });

  const [originalStartTime, setOriginalStartTime] = useState<Date | null>(null);
  const [originalNotifications, setOriginalNotifications] = useState<string[]>(
    [],
  );
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [showEditScopeModal, setShowEditScopeModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [didEdit, setDidEdit] = useState(false);

  const updateFormData = (field: keyof TaskFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setDidEdit(true);
  };

  // Load task data when component mounts
  useEffect(() => {
    if (task) {
      // Convert timestamps back to Date objects
      const startTime = new Date(task.startTime);
      const endTime = new Date(task.endTime);

      const notifications = task.notifications?.map((n) => n.type) || [];

      setFormData({
        title: task.title,
        description: task.description || "",
        startTime,
        endTime,
        type: task.type,
        tags: task.tags,
        note: task.note || "",
        notifications,
      });

      // Store original values for comparison
      setOriginalStartTime(startTime);
      setOriginalNotifications(notifications);
      setAvailableTags(task.tags);
    }
  }, [task]);

  const handleAddTag = () => {
    if (newTag.trim() !== "" && !availableTags.includes(newTag.trim())) {
      const trimmedTag = newTag.trim();
      setAvailableTags((prev) => [...prev, trimmedTag]);
      updateFormData("tags", [...formData.tags, trimmedTag]);
    }
    setNewTag("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setAvailableTags((prev) => prev.filter((tag) => tag !== tagToRemove));
    updateFormData(
      "tags",
      formData.tags.filter((tag) => tag !== tagToRemove),
    );
  };

  const editTask = useMutation(api.private.tasks.editTask);

  const handleUpdate = async () => {
    if (!task) return;
    setIsUpdating(true);

    try {
      if (task.recurringId) {
        setShowEditScopeModal(true);
        return;
      }

      await updateTask("this_only");
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Validation errors:", error.errors);
        Alert.alert("Error", "Please fill in all required fields");
      } else {
        console.error("Error updating task:", error);
        Alert.alert("Error", "Failed to update task");
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const updateTask = async (
    editScope: "this_only" | "all" | "this_and_future",
  ) => {
    if (!task || !originalStartTime) return;
    setIsUpdating(true);

    try {
      const validatedData = taskSchemaForm.parse(formData);

      const updates = {
        title: validatedData.title,
        description: validatedData.description,
        startTime: validatedData.startTime.getTime(), // Convert to timestamp
        endTime: validatedData.endTime.getTime(), // Convert to timestamp
        type: validatedData.type,
        tags: validatedData.tags,
        note: validatedData.note,
        notifications: validatedData.notifications,
      };

      const result = await editTask({
        taskId: taskId as Id<"tasks">,
        updates,
        editScope,
      });

      // Check if we need to update notifications (start time or notifications changed)
      const startTimeChanged =
        originalStartTime.getTime() !== validatedData.startTime.getTime();
      const notificationsChanged =
        originalNotifications.length !== validatedData.notifications.length ||
        !originalNotifications.every((n) =>
          validatedData.notifications.includes(n),
        );

      if (
        permissionStatus === "granted" &&
        (startTimeChanged || notificationsChanged)
      ) {
        console.log(`Updated ${result.length} tasks`);

        for (const updatedTask of result) {
          // Cancel existing notifications for this task
          if (task.notifications && task.notifications.length > 0) {
            const existingTypes = task.notifications.map((n) => n.type);
            await cancelTaskNotifications(updatedTask._id, existingTypes);
          }

          // Schedule new notifications if they exist
          if (
            updatedTask.notifications &&
            updatedTask.notifications.length > 0
          ) {
            try {
              await scheduleTaskNotifications({
                _id: updatedTask._id,
                title: updatedTask.title,
                notifications: updatedTask.notifications,
              });
            } catch (notificationError) {
              console.error(
                `Error scheduling notifications for task ${updatedTask._id}:`,
                notificationError,
              );
            }
          }
        }
      }

      setShowEditScopeModal(false);
      Alert.alert("Success", "Task updated successfully");
      router.back();
    } catch (error) {
      console.error("Error updating task:", error);
      Alert.alert("Error", "Failed to update task");
    } finally {
      setIsUpdating(false);
    }
  };

  if (!task) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <Text className="text-foreground">Loading task...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <DatePicker
        modal
        open={showStartTimePicker}
        date={formData.startTime}
        mode="time"
        onConfirm={(time) => {
          setShowStartTimePicker(false);
          updateFormData("startTime", time);

          // Auto-adjust end time if it becomes before start time
          if (formData.endTime && formData.endTime <= time) {
            const newEndTime = new Date(time.getTime() + 30 * 60 * 1000);
            updateFormData("endTime", newEndTime);
          }
        }}
        onCancel={() => {
          setShowStartTimePicker(false);
        }}
      />

      <DatePicker
        modal
        open={showEndTimePicker}
        date={formData.endTime}
        mode="time"
        minimumDate={formData.startTime}
        onConfirm={(time) => {
          setShowEndTimePicker(false);
          updateFormData("endTime", time);
        }}
        onCancel={() => {
          setShowEndTimePicker(false);
        }}
      />

      <ScopeSelectionModal
        visible={showEditScopeModal}
        onClose={() => setShowEditScopeModal(false)}
        onScopeSelect={updateTask}
        title="Edit Recurring Task"
        subtitle="This task is part of a recurring series. What would you like to edit?"
        actionType="edit"
      />

      <View className="flex-1 bg-background rounded-t-4xl">
        {/* Header */}
        <View className="flex-row items-center justify-between p-6">
          <View className="w-12" />

          <Text className="text-xl font-semibold text-foreground mt-2">
            Edit Task
          </Text>

          <TouchableOpacity
            onPress={() => router.back()}
            className="p-2 rounded-xl bg-background"
            style={{
              shadowColor: "#8F99EB",
              shadowOffset: {
                width: 0,
                height: 4,
              },
              shadowOpacity: 0.15,
              shadowRadius: 3,
              elevation: 3,
            }}
          >
            <ThemedIcon name="x" size={24} library="feather" />
          </TouchableOpacity>
        </View>

        {/* Scrollable Content with KeyboardAwareScrollView */}
        <KeyboardAwareScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingBottom: 120, // Space for fixed button
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          enableOnAndroid={true}
          extraHeight={120}
          extraScrollHeight={120}
          enableAutomaticScroll={true}
        >
          <View className="px-8 pt-4 gap-6">
            {/* Recurring Info Display */}
            {task?.recurringId && (
              <View className="flex-row justify-end">
                <View className="px-3.5 py-1 rounded-2xl border bg-primary-200 border-primary-200 dark:bg-primary-300/70 dark:border-primary-400/60 flex-row items-center gap-1">
                  <ThemedIcon
                    name="refresh"
                    size={16}
                    lightColor="#8F99EB"
                    darkColor="#F9FAFD"
                  />
                  <Text className="font-medium text-accent-foreground">
                    This is a recurring task
                  </Text>
                </View>
              </View>
            )}

            {/* Title */}
            <View className="gap-3">
              <Text className="text-sm text-muted-foreground">Title</Text>
              <TextInput
                value={formData.title}
                onChangeText={(value) => updateFormData("title", value)}
                className="text-foreground border-b border-border pb-3"
                placeholder="Enter task title"
              />
            </View>

            {/* Date - Disabled */}
            <View className="gap-3">
              <Text className="text-sm text-muted-foreground">Date</Text>
              <View className="flex-row items-center justify-between border-b border-border pb-3 opacity-50">
                <Text className="text-muted-foreground">
                  {formatDateTime(new Date(task.date), "date")}
                </Text>
                <ThemedIcon
                  name="calendar-outline"
                  size={20}
                  lightColor="#64748B"
                  darkColor="#94A3B8"
                />
              </View>
            </View>

            {/* Time */}
            <View className="gap-3">
              <Text className="text-sm text-muted-foreground mb-2">Time</Text>
              <View className="flex-row items-center gap-6">
                <TouchableOpacity
                  onPress={() => setShowStartTimePicker(true)}
                  className="flex-1 border-b border-border pb-3 items-center justify-center"
                >
                  <Text className="text-foreground font-medium">
                    {formatDateTime(formData.startTime, "time")}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setShowEndTimePicker(true)}
                  className="flex-1 border-b border-border pb-3 items-center justify-center"
                >
                  <Text className="text-foreground font-medium">
                    {formatDateTime(formData.endTime, "time")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Notifications */}
            <View className="gap-4 mt-1">
              <Text className="text-sm text-muted-foreground">
                Notifications (optional)
              </Text>
              <View className="gap-3">
                {Object.values(NotificationTypes).map((notificationType) => (
                  <TouchableOpacity
                    key={notificationType}
                    onPress={() => {
                      const isSelected =
                        formData.notifications.includes(notificationType);
                      if (isSelected) {
                        updateFormData(
                          "notifications",
                          formData.notifications.filter(
                            (n) => n !== notificationType,
                          ),
                        );
                      } else {
                        updateFormData("notifications", [
                          ...formData.notifications,
                          notificationType,
                        ]);
                      }
                    }}
                    className="flex-row items-center"
                  >
                    <View
                      className={`w-5 h-5 rounded border mr-3 ${
                        formData.notifications.includes(notificationType)
                          ? "bg-primary-500 border-primary-500"
                          : "border-border"
                      }`}
                    >
                      {formData.notifications.includes(notificationType) && (
                        <Ionicons
                          name="checkmark"
                          size={12}
                          color="white"
                          style={{ alignSelf: "center", marginTop: 1 }}
                        />
                      )}
                    </View>
                    <Text className="text-foreground">
                      {notificationType === NotificationTypes.FIFTEEN_MINUTES &&
                        "15 minutes before task"}
                      {notificationType === NotificationTypes.FIVE_MINUTES &&
                        "5 minutes before task"}
                      {notificationType === NotificationTypes.AT_START &&
                        "At start of task"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Description */}
            <View className="gap-3">
              <Text className="text-sm text-muted-foreground">
                Description (optional)
              </Text>
              <TextInput
                value={formData.description}
                onChangeText={(value) => updateFormData("description", value)}
                className="text-foreground border-b border-border pb-3"
                placeholder="Enter task description"
                multiline
              />
            </View>

            {/* Type */}
            <View className="gap-3">
              <Text className="text-sm text-muted-foreground">Type</Text>
              <View className="flex-row items-center justify-between mr-8">
                {Object.values(TaskTypes).map((type) => (
                  <TouchableOpacity
                    key={type}
                    onPress={() => updateFormData("type", type)}
                    className="flex-row items-center"
                  >
                    <View
                      className={`w-5 h-5 rounded-full border mr-2 ${
                        formData.type === type
                          ? "bg-primary-500 border-primary-500"
                          : "border-border"
                      }`}
                    >
                      {formData.type === type && (
                        <Ionicons
                          name="checkmark"
                          size={12}
                          color="white"
                          style={{ alignSelf: "center", marginTop: 1 }}
                        />
                      )}
                    </View>
                    <Text className="text-foreground">{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Tags */}
            <View className="gap-4 mt-1">
              <Text className="text-sm text-muted-foreground">
                Tags (optional)
              </Text>
              <View className="flex-row flex-wrap gap-2 items-center">
                {availableTags.map((tag) => (
                  <View
                    key={tag}
                    className="px-3.5 py-1 rounded-2xl border bg-primary-200 border-primary-200 dark:bg-primary-300/70 dark:border-primary-400/60 flex-row items-center gap-1"
                  >
                    <Text className="text-sm font-semibold text-accent-foreground mt-0.5">
                      {tag}
                    </Text>
                    <TouchableOpacity onPress={() => handleRemoveTag(tag)}>
                      <ThemedIcon
                        name="close"
                        size={14}
                        lightColor="#8F99EB"
                        darkColor="#F9FAFD"
                      />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>

              <TextInput
                value={newTag}
                onChangeText={setNewTag}
                placeholder="Add new tag"
                className="text-foreground border-b border-border pb-3 shrink-0 flex-1"
                onSubmitEditing={handleAddTag}
                returnKeyType="done"
              />
            </View>

            {/* Note */}
            <View className="gap-3">
              <Text className="text-sm text-muted-foreground">
                Note (optional)
              </Text>
              <TextInput
                value={formData.note}
                onChangeText={(value) => updateFormData("note", value)}
                className="text-foreground border-b border-border pb-3"
                placeholder="Add a personal note"
                multiline
              />
            </View>
          </View>
        </KeyboardAwareScrollView>

        {/* Update Button - Fixed at bottom, stays in place when keyboard appears */}
        <View className="absolute bottom-0 left-0 right-0 px-6 pb-12 bg-background">
          <AppButton
            title="Update"
            loadingTitle="Updating..."
            onPress={handleUpdate}
            disabled={isUpdating || !didEdit}
            isLoading={isUpdating}
          />
        </View>
      </View>
    </View>
  );
};

export default EditTask;
