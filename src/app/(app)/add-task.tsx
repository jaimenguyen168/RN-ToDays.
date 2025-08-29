import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { format, addDays, startOfWeek } from "date-fns";
import { ThemedIcon } from "@/components/ThemedIcon";
import DatePicker from "react-native-date-picker";
import { z } from "zod";

const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  startDate: z.date(),
  endDate: z.date().optional(),
  startTime: z.date(),
  endTime: z.date(),
  taskType: z.enum(["Personal", "Private", "Secret"]),
  tags: z.array(z.string()).nonempty("Select at least one tag"),
});

type TaskType = "Personal" | "Private" | "Secret";
type TagType = "Office" | "Home" | "Urgent" | "Work";

const AddTask = () => {
  const router = useRouter();

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [taskType, setTaskType] = useState<TaskType>("Personal");
  const [selectedTags, setSelectedTags] = useState<TagType[]>([
    "Office",
    "Work",
  ]);
  const [hasEndDate, setHasEndDate] = useState(false);

  // Date picker states
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  const [newTag, setNewTag] = useState("");

  const handleAddTag = () => {
    if (newTag.trim() !== "" && !availableTags.includes(newTag as TagType)) {
      setAvailableTags((prev) => [...prev, newTag as TagType]);
      setSelectedTags((prev) => [...prev, newTag as TagType]);
    }
    setNewTag("");
  };

  const taskTypes: TaskType[] = ["Personal", "Private", "Secret"];
  const [availableTags, setAvailableTags] = useState<TagType[]>([]);

  // Generate week dates starting from the selected start date
  const getWeekDates = () => {
    const weekStart = startOfWeek(startDate, { weekStartsOn: 1 }); // Start on Monday
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  };

  const weekDates = getWeekDates();
  const [selectedWeekDays, setSelectedWeekDays] = useState<Date[]>([]);

  const toggleTag = (tag: TagType) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const toggleWeekDay = (date: Date) => {
    setSelectedWeekDays((prev) => {
      const dateString = format(date, "yyyy-MM-dd");
      const exists = prev.some((d) => format(d, "yyyy-MM-dd") === dateString);

      if (exists) {
        return prev.filter((d) => format(d, "yyyy-MM-dd") !== dateString);
      } else {
        return [...prev, date];
      }
    });
  };

  const isWeekDaySelected = (date: Date) => {
    const dateString = format(date, "yyyy-MM-dd");
    return selectedWeekDays.some((d) => format(d, "yyyy-MM-dd") === dateString);
  };

  const formatDate = (date: Date) => {
    return format(date, "MM-dd-yyyy");
  };

  const formatTime = (date: Date) => {
    return format(date, "HH:mm a");
  };

  const handleCreate = () => {
    const result = taskSchema.safeParse({
      title,
      description,
      startDate,
      endDate: hasEndDate ? endDate : undefined,
      startTime,
      endTime,
      taskType,
      tags: selectedTags,
    });

    if (!result.success) {
      console.log(result.error.format());
      return;
    }

    console.log("Valid form:", result.data);
  };

  return (
    <>
      {/* Date/Time Pickers */}
      <DatePicker
        modal
        open={showStartDatePicker}
        date={startDate}
        mode="date"
        onConfirm={(date) => {
          setShowStartDatePicker(false);
          setStartDate(date);
        }}
        onCancel={() => {
          setShowStartDatePicker(false);
        }}
      />

      <DatePicker
        modal
        open={showEndDatePicker}
        date={endDate}
        mode="date"
        minimumDate={startDate}
        onConfirm={(date) => {
          setShowEndDatePicker(false);
          setEndDate(date);
        }}
        onCancel={() => {
          setShowEndDatePicker(false);
        }}
      />

      <DatePicker
        modal
        open={showStartTimePicker}
        date={startTime}
        mode="time"
        onConfirm={(time) => {
          setShowStartTimePicker(false);
          setStartTime(time);
        }}
        onCancel={() => {
          setShowStartTimePicker(false);
        }}
      />

      <DatePicker
        modal
        open={showEndTimePicker}
        date={endTime}
        mode="time"
        onConfirm={(time) => {
          setShowEndTimePicker(false);
          setEndTime(time);
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
          <View className="px-8 py-4 gap-6">
            {/* Title */}
            <View className="gap-3">
              <Text className="text-sm text-muted-foreground">Title</Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
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
                <Text className="text-foreground">{formatDate(startDate)}</Text>
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
                  value={hasEndDate}
                  onValueChange={setHasEndDate}
                  trackColor={{ false: "#e5e7eb", true: "#6366f1" }}
                  thumbColor={hasEndDate ? "#f9fafb" : "#f9fafb"}
                />
              </View>

              {hasEndDate && (
                <>
                  <TouchableOpacity
                    onPress={() => setShowEndDatePicker(true)}
                    className="flex-row items-center justify-between border-b border-border pb-3 mt-6"
                  >
                    <Text className="text-foreground">
                      {formatDate(startDate)}
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
                    {formatTime(startTime)}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setShowEndTimePicker(true)}
                  className="flex-1 border-b border-border pb-3 items-center justify-center"
                >
                  <Text className="text-foreground font-medium">
                    {formatTime(endTime)}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Description */}
            <View className="gap-3">
              <Text className="text-sm text-muted-foreground">Description</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                className="text-foreground border-b border-border pb-3"
                placeholder="Enter task description"
                multiline
              />
            </View>

            {/* Type */}
            <View className="gap-3">
              <Text className="text-sm text-muted-foreground">Type</Text>
              <View className="flex-row items-center justify-between mr-8">
                {taskTypes.map((type) => (
                  <TouchableOpacity
                    key={type}
                    onPress={() => setTaskType(type)}
                    className="flex-row items-center"
                  >
                    <View
                      className={`w-5 h-5 rounded-full border mr-2 ${
                        taskType === type
                          ? "bg-primary-500 border-primary-500"
                          : "border-border"
                      }`}
                    >
                      {taskType === type && (
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
                  <TouchableOpacity
                    key={tag}
                    onPress={() => toggleTag(tag)}
                    className={`px-3.5 py-1 rounded-2xl border items-center justify-center ${
                      selectedTags.includes(tag)
                        ? "bg-primary-200 border-primary-200 dark:bg-primary-300/70 dark:border-primary-400/60"
                        : "bg-muted border-border"
                    }`}
                  >
                    <Text
                      className={`text-sm font-semibold ${
                        selectedTags.includes(tag)
                          ? "text-accent-foreground"
                          : "text-muted-foreground"
                      }`}
                    >
                      {tag}
                    </Text>
                  </TouchableOpacity>
                ))}

                <TextInput
                  value={newTag}
                  onChangeText={setNewTag}
                  placeholder="Add new tag"
                  className="text-foreground border-b border-border pb-3 flex-1"
                  onSubmitEditing={handleAddTag} // press enter
                  returnKeyType="done"
                />
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Create Button */}
        <View className="px-6 pb-12">
          <TouchableOpacity
            className="bg-primary-500 py-4 rounded-2xl"
            onPress={handleCreate}
          >
            <Text className="text-white text-center text-lg font-semibold">
              Create
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
};

export default AddTask;
