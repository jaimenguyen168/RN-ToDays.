import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  format,
  addDays,
  startOfWeek,
  startOfDay,
  addMinutes,
  isToday,
} from "date-fns";
import { ThemedIcon } from "@/components/ThemedIcon";
import DatePicker from "react-native-date-picker";
import { z } from "zod";
import { useMutation } from "convex/react";
import { api } from "~/convex/_generated/api";
import { NotificationTypes, TaskTypes } from "~/convex/schemas/tasks";
import { useNotifications } from "@/hooks/useNotifications";
import AppButton from "@/components/AppButton";

const taskSchemaForm = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.optional(z.string()),
  startDate: z.date(),
  endDate: z.optional(z.date()),
  startTime: z.date(),
  endTime: z.date(),
  type: z.nativeEnum(TaskTypes),
  tags: z.array(z.string()),
  hasEndDate: z.boolean(),
  selectedWeekDays: z.array(z.string()),
  note: z.optional(z.string()),
  notifications: z.array(z.string()),
});

type TaskFormData = z.infer<typeof taskSchemaForm>;

const AddTask = () => {
  const router = useRouter();
  const { scheduleTaskNotifications, permissionStatus } = useNotifications();

  const { selectedDate } = useLocalSearchParams<{ selectedDate?: string }>();

  const getInitialDate = () => {
    if (selectedDate) {
      const parsedDate = new Date(selectedDate);
      return isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
    }
    return new Date();
  };

  const [formData, setFormData] = useState<TaskFormData>({
    title: "",
    description: "",
    startDate: getInitialDate(),
    endDate: undefined,
    startTime: addMinutes(new Date(), 30),
    endTime: addMinutes(new Date(), 60),
    type: TaskTypes.PERSONAL,
    tags: [],
    hasEndDate: false,
    selectedWeekDays: [],
    note: "",
    notifications: [],
  });

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [newTagInputRef, setNewTagInputRef] = useState<TextInput | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const updateFormData = (field: keyof TaskFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddTag = () => {
    if (newTag.trim() !== "" && !availableTags.includes(newTag.trim())) {
      const trimmedTag = newTag.trim().toLowerCase();
      setAvailableTags((prev) => [...prev, trimmedTag]);
      updateFormData("tags", [...formData.tags, trimmedTag]);
    }
    setNewTag("");

    setTimeout(() => {
      newTagInputRef?.focus();
    }, 100);
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setAvailableTags((prev) => prev.filter((tag) => tag !== tagToRemove));
    updateFormData(
      "tags",
      formData.tags.filter((tag) => tag !== tagToRemove),
    );
  };

  // Generate week dates starting from the selected start date
  const getWeekDates = () => {
    const weekStart = startOfWeek(formData.startDate, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  };

  const weekDates = getWeekDates();

  const toggleWeekDay = (date: Date) => {
    const dayName = format(date, "EEEE").toLowerCase();

    if (formData.selectedWeekDays.includes(dayName)) {
      updateFormData(
        "selectedWeekDays",
        formData.selectedWeekDays.filter((day) => day !== dayName),
      );
    } else {
      updateFormData("selectedWeekDays", [
        ...formData.selectedWeekDays,
        dayName,
      ]);
    }
  };

  const isWeekDaySelected = (date: Date) => {
    const dayName = format(date, "EEEE").toLowerCase();
    return formData.selectedWeekDays.includes(dayName);
  };

  const formatDate = (date: Date) => {
    return format(date, "MM-dd-yyyy");
  };

  const formatTime = (date: Date) => {
    return format(date, "h:mm a");
  };

  const createTask = useMutation(api.private.tasks.create);
  const canSubmit = taskSchemaForm.safeParse(formData).success;

  const handleCreate = async () => {
    setIsCreating(true);

    try {
      const validatedData = taskSchemaForm.parse(formData);

      const taskData = {
        title: validatedData.title,
        description: validatedData.description,
        startDate: validatedData.startDate.getTime(),
        endDate: validatedData.endDate?.getTime(),
        startTime: validatedData.startTime.getTime(),
        endTime: validatedData.endTime.getTime(),
        type: validatedData.type,
        tags: validatedData.tags,
        hasEndDate: validatedData.hasEndDate,
        selectedWeekDays: validatedData.selectedWeekDays,
        note: validatedData.note,
        notifications: validatedData.notifications,
      };

      const result = await createTask(taskData);

      if (permissionStatus === "granted") {
        if (Array.isArray(result)) {
          console.log(`Created ${result.length} recurring tasks`);

          for (const task of result) {
            if (task.notifications && task.notifications.length > 0) {
              try {
                await scheduleTaskNotifications({
                  _id: task._id,
                  title: task.title,
                  notifications: task.notifications,
                });
              } catch (notificationError) {
                console.error(
                  `Error scheduling notifications for task ${task._id}:`,
                  notificationError,
                );
              }
            }
          }
        } else {
          if (result?.notifications && result?.notifications.length > 0) {
            try {
              await scheduleTaskNotifications({
                _id: result._id,
                title: result.title,
                notifications: result.notifications,
              });
            } catch (notificationError) {
              console.error(
                `Error scheduling notifications for task ${result._id}:`,
                notificationError,
              );
            }
          }
        }
      }

      Alert.alert("Success", "Task created successfully");
      router.back();
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Validation errors:", error.errors);
        Alert.alert("Error", "Validation errors");
      } else {
        console.error("Error creating task:", error);
        Alert.alert("Error", "Failed to create task");
      }
    } finally {
      setIsCreating(false);
    }
  };

  const getMinimumStartTime = (startDate: Date) => {
    if (isToday(startDate)) {
      return new Date();
    }
    return undefined;
  };

  const getMinimumEndTime = (startDate: Date, startTime: Date) => {
    if (isToday(startDate) && startTime) {
      return startTime;
    }
    if (startTime) {
      return startTime;
    }
    return undefined;
  };

  return (
    <>
      {/* Date/Time Pickers */}
      <DatePicker
        modal
        open={showStartDatePicker}
        date={formData.startDate}
        minimumDate={new Date()}
        mode="date"
        onConfirm={(date) => {
          setShowStartDatePicker(false);
          updateFormData("startDate", date);

          // Update times to match the selected date
          const newStartTime = new Date(date);
          newStartTime.setHours(
            formData.startTime.getHours(),
            formData.startTime.getMinutes(),
            0,
            0,
          );

          const newEndTime = new Date(date);
          newEndTime.setHours(
            formData.endTime.getHours(),
            formData.endTime.getMinutes(),
            0,
            0,
          );

          updateFormData("startTime", newStartTime);
          updateFormData("endTime", newEndTime);
        }}
        onCancel={() => {
          setShowStartDatePicker(false);
        }}
      />

      <DatePicker
        modal
        open={showEndDatePicker}
        date={formData.endDate || new Date()}
        mode="date"
        minimumDate={formData.startDate}
        onConfirm={(date) => {
          setShowEndDatePicker(false);
          updateFormData("endDate", date);
        }}
        onCancel={() => {
          setShowEndDatePicker(false);
        }}
      />

      <DatePicker
        modal
        open={showStartTimePicker}
        date={formData.startTime}
        mode="time"
        minimumDate={getMinimumStartTime(formData.startDate)}
        onConfirm={(time) => {
          setShowStartTimePicker(false);
          updateFormData("startTime", time);

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

      <View className="flex-1 bg-background rounded-t-4xl">
        {/* Header */}
        <View className="flex-row items-center justify-between p-6">
          <View className="w-12" />

          <Text className="text-xl font-semibold text-foreground mt-2">
            Add Task
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

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-8 pt-4 pb-12 gap-6">
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

            {/* Start Date */}
            <View className="gap-3">
              <Text className="text-sm text-muted-foreground">Start Date</Text>
              <TouchableOpacity
                onPress={() => setShowStartDatePicker(true)}
                className="flex-row items-center justify-between border-b border-border pb-3"
              >
                <Text className="text-foreground">
                  {formatDate(formData.startDate)}
                </Text>
                <ThemedIcon
                  name="calendar-outline"
                  size={20}
                  lightColor="#64748B"
                  darkColor="#94A3B8"
                />
              </TouchableOpacity>
            </View>

            {/* End Date Toggle */}
            <View>
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-sm text-muted-foreground">
                  Has End Date
                </Text>
                <Switch
                  value={formData.hasEndDate}
                  onValueChange={(value) => updateFormData("hasEndDate", value)}
                  trackColor={{ false: "#e5e7eb", true: "#6366f1" }}
                  thumbColor={formData.hasEndDate ? "#f9fafb" : "#f9fafb"}
                />
              </View>

              {formData.hasEndDate && (
                <>
                  <TouchableOpacity
                    onPress={() => setShowEndDatePicker(true)}
                    className="flex-row items-center justify-between border-b border-border pb-3 mt-6"
                  >
                    <Text className="text-foreground">
                      {formatDate(formData.endDate || new Date())}
                    </Text>
                    <ThemedIcon
                      name="calendar-outline"
                      size={20}
                      lightColor="#64748B"
                      darkColor="#94A3B8"
                    />
                  </TouchableOpacity>

                  {/* Week Days Selection */}
                  <View className="gap-4 mt-6">
                    <Text className="text-sm text-muted-foreground">
                      Select Days of Week
                    </Text>
                    <View className="flex-row justify-between">
                      {weekDates.map((date, index) => (
                        <TouchableOpacity
                          key={index}
                          onPress={() => toggleWeekDay(date)}
                          className={`px-1 py-2 rounded-lg border items-center justify-center w-[40px] ${
                            isWeekDaySelected(date)
                              ? "bg-primary-200 border-primary-200 dark:bg-primary-300/70 dark:border-primary-400/60"
                              : "bg-muted border-border"
                          }`}
                        >
                          <Text
                            className={`text-xs font-semibold ${
                              isWeekDaySelected(date)
                                ? "text-accent-foreground "
                                : "text-muted-foreground"
                            }`}
                          >
                            {format(date, "EEE")}
                          </Text>
                          <Text
                            className={`text-xs ${
                              isWeekDaySelected(date)
                                ? "text-accent-foreground"
                                : "text-muted-foreground"
                            }`}
                          >
                            {format(date, "dd")}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </>
              )}
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
                    {formatTime(formData.startTime)}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setShowEndTimePicker(true)}
                  className="flex-1 border-b border-border pb-3 items-center justify-center"
                >
                  <Text className="text-foreground font-medium">
                    {formatTime(formData.endTime)}
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
              <Text className="text-sm text-muted-foreground">Tags</Text>
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
                ref={(ref) => setNewTagInputRef(ref)}
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
                placeholder="Enter note"
                multiline
              />
            </View>
          </View>
        </ScrollView>

        {/* Create Button */}
        <View className="px-6 pb-12">
          <AppButton
            title="Create"
            loadingTitle="Creating..."
            onPress={handleCreate}
            disabled={isCreating || !canSubmit}
            isLoading={isCreating}
          />
        </View>
      </View>
    </>
  );
};

export default AddTask;
