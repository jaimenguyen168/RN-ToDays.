import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  Modal,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { format, addDays, startOfWeek } from "date-fns";
import { ThemedIcon } from "@/components/ThemedIcon";
import DatePicker from "react-native-date-picker";
import { z } from "zod";
import { useMutation, useQuery } from "convex/react";
import { api } from "~/convex/_generated/api";
import { TaskTypes } from "~/convex/schemas/tasks";
import { Id } from "~/convex/_generated/dataModel";

const taskSchemaForm = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  startTime: z.date(),
  endTime: z.date(),
  type: z.nativeEnum(TaskTypes),
  tags: z.array(z.string()),
  note: z.string().optional(),
});

type TaskFormData = z.infer<typeof taskSchemaForm>;

const EditTask = () => {
  const router = useRouter();
  const { taskId } = useLocalSearchParams<{ taskId: string }>();

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
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [showEditScopeModal, setShowEditScopeModal] = useState(false);

  const updateFormData = (field: keyof TaskFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Load task data when component mounts
  useEffect(() => {
    if (task) {
      const [startHour, startMinute] = task.startTime.split(":").map(Number);
      const [endHour, endMinute] = task.endTime.split(":").map(Number);

      const startTime = new Date();
      startTime.setHours(startHour, startMinute, 0, 0);

      const endTime = new Date();
      endTime.setHours(endHour, endMinute, 0, 0);

      setFormData({
        title: task.title,
        description: task.description || "",
        startTime,
        endTime,
        type: task.type,
        tags: task.tags,
        note: task.note || "",
      });
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

  const formatDate = (date: Date) => {
    return format(date, "MM-dd-yyyy");
  };

  const formatTime = (date: Date) => {
    return format(date, "h:mm a");
  };

  const editTask = useMutation(api.private.tasks.editTask);

  const handleUpdate = async () => {
    if (!task) return;

    try {
      const validatedData = taskSchemaForm.parse(formData);

      // If task has recurringId, show scope selection modal
      if (task.recurringId) {
        setShowEditScopeModal(true);
        return;
      }

      // Direct update for one-time tasks
      await updateTask("this_only");
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Validation errors:", error.errors);
        Alert.alert("Error", "Please fill in all required fields");
      } else {
        console.error("Error updating task:", error);
        Alert.alert("Error", "Failed to update task");
      }
    }
  };

  const updateTask = async (
    editScope: "this_only" | "all" | "this_and_future",
  ) => {
    try {
      const validatedData = taskSchemaForm.parse(formData);

      const updates = {
        title: validatedData.title,
        description: validatedData.description,
        startTime: validatedData.startTime.toTimeString().slice(0, 5),
        endTime: validatedData.endTime.toTimeString().slice(0, 5),
        type: validatedData.type,
        tags: validatedData.tags,
        note: validatedData.note,
      };

      await editTask({
        taskId: taskId as Id<"tasks">,
        updates,
        editScope,
      });

      setShowEditScopeModal(false);
      Alert.alert("Success", "Task updated successfully");
      router.back();
    } catch (error) {
      console.error("Error updating task:", error);
      Alert.alert("Error", "Failed to update task");
    }
  };

  const EditScopeModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showEditScopeModal}
      onRequestClose={() => setShowEditScopeModal(false)}
    >
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-background rounded-t-3xl p-6">
          <View className="items-center mb-6">
            <View className="w-12 h-1 bg-muted rounded-full mb-4" />
            <Text className="text-xl font-semibold text-foreground">
              Edit Recurring Task
            </Text>
            <Text className="text-muted-foreground text-center mt-2">
              This task is part of a recurring series. What would you like to
              edit?
            </Text>
          </View>

          <View className="gap-3">
            <TouchableOpacity
              onPress={() => updateTask("this_only")}
              className="p-4 bg-muted rounded-xl"
            >
              <Text className="text-foreground font-semibold">
                This task only
              </Text>
              <Text className="text-muted-foreground text-sm">
                Edit only this specific instance
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => updateTask("all")}
              className="p-4 bg-muted rounded-xl"
            >
              <Text className="text-foreground font-semibold">All tasks</Text>
              <Text className="text-muted-foreground text-sm">
                Edit all tasks in this recurring series
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => updateTask("this_and_future")}
              className="p-4 bg-muted rounded-xl"
            >
              <Text className="text-foreground font-semibold">
                This and future tasks
              </Text>
              <Text className="text-muted-foreground text-sm">
                Edit this task and all future ones in the series
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => setShowEditScopeModal(false)}
            className="mt-6 p-4 bg-secondary rounded-xl"
          >
            <Text className="text-center text-foreground font-semibold">
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  if (!task) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <Text className="text-foreground">Loading task...</Text>
      </View>
    );
  }

  return (
    <>
      <DatePicker
        modal
        open={showStartTimePicker}
        date={formData.startTime}
        mode="time"
        onConfirm={(time) => {
          setShowStartTimePicker(false);
          updateFormData("startTime", time);
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

      <EditScopeModal />

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

        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="px-8 pt-4 pb-8 gap-6">
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

            {/* Date */}
            <View className="gap-3">
              <Text className="text-sm text-muted-foreground">Date</Text>
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                className="flex-row items-center justify-between border-b border-border pb-3"
              >
                <Text className="text-foreground">
                  {formatDate(new Date(task.date))}
                </Text>
                <ThemedIcon
                  name="calendar-outline"
                  size={20}
                  lightColor="#64748B"
                  darkColor="#94A3B8"
                />
              </TouchableOpacity>
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

            {/* Description */}
            <View className="gap-3">
              <Text className="text-sm text-muted-foreground">Description</Text>
              <TextInput
                value={formData.description}
                onChangeText={(value) => updateFormData("description", value)}
                className="text-foreground border-b border-border pb-3"
                placeholder="Enter task description"
                multiline
              />
            </View>

            {/* Note */}
            <View className="gap-3">
              <Text className="text-sm text-muted-foreground">Note</Text>
              <TextInput
                value={formData.note}
                onChangeText={(value) => updateFormData("note", value)}
                className="text-foreground border-b border-border pb-3"
                placeholder="Add a personal note"
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
                value={newTag}
                onChangeText={setNewTag}
                placeholder="Add new tag"
                className="text-foreground border-b border-border pb-3 shrink-0 flex-1"
                onSubmitEditing={handleAddTag}
                returnKeyType="done"
              />
            </View>

            {/* Recurring Info Display */}
            {task?.recurringId && (
              <View className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
                <View className="flex-row items-center gap-2">
                  <ThemedIcon
                    name="refresh"
                    size={16}
                    lightColor="#6366f1"
                    darkColor="#818cf8"
                  />
                  <Text className="text-primary-600 dark:text-primary-400 font-medium">
                    This is a recurring task
                  </Text>
                </View>
                <Text className="text-primary-500 dark:text-primary-300 text-sm mt-1">
                  You'll be asked how you want to apply changes when you update
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Update Button */}
        <View className="px-6 pb-12">
          <TouchableOpacity
            className="bg-primary-500 py-4 rounded-2xl"
            onPress={handleUpdate}
          >
            <Text className="text-white text-center text-lg font-semibold">
              Update
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Edit Scope Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showEditScopeModal}
        onRequestClose={() => setShowEditScopeModal(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-background rounded-t-3xl p-6">
            <View className="items-center mb-6">
              <View className="w-12 h-1 bg-muted rounded-full mb-4" />
              <Text className="text-xl font-semibold text-foreground">
                Edit Recurring Task
              </Text>
              <Text className="text-muted-foreground text-center mt-2">
                This task is part of a recurring series. What would you like to
                edit?
              </Text>
            </View>

            <View className="gap-3">
              <TouchableOpacity
                onPress={() => updateTask("this_only")}
                className="p-4 bg-muted rounded-xl"
              >
                <Text className="text-foreground font-semibold">
                  This task only
                </Text>
                <Text className="text-muted-foreground text-sm">
                  Edit only this specific instance
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => updateTask("all")}
                className="p-4 bg-muted rounded-xl"
              >
                <Text className="text-foreground font-semibold">All tasks</Text>
                <Text className="text-muted-foreground text-sm">
                  Edit all tasks in this recurring series
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => updateTask("this_and_future")}
                className="p-4 bg-muted rounded-xl"
              >
                <Text className="text-foreground font-semibold">
                  This and future tasks
                </Text>
                <Text className="text-muted-foreground text-sm">
                  Edit this task and all future ones in the series
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => setShowEditScopeModal(false)}
              className="mt-6 p-4 bg-secondary rounded-xl"
            >
              <Text className="text-center text-foreground font-semibold">
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default EditTask;
