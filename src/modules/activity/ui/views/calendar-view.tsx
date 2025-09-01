import { View, Text } from "react-native";
import React from "react";
import TasksCalendar from "@/modules/activity/ui/components/TasksCalendar";
import { Task } from "@/types";
import TaskStats from "@/modules/activity/ui/components/TaskStats";
import { isToday } from "date-fns";
import TaskItem from "@/components/TaskItem";
import EmptyState from "@/modules/activity/ui/components/EmptyState";

interface CalendarViewProps {
  tasks: Task[];
  selectedDate: number;
  setSelectedDate: (date: number) => void;
}

const CalendarView = ({
  tasks,
  selectedDate,
  setSelectedDate,
}: CalendarViewProps) => {
  const getTodayTasks = (): Task[] => {
    if (!tasks) return [];

    return tasks
      .filter((task) => isToday(task.date))
      .map((task) => ({
        _id: task._id,
        title: task.title,
        startTime: task.startTime,
        endTime: task.endTime,
        tags: task.tags,
        type: task.type,
        isCompleted: task.isCompleted,
        note: task.note,
        date: task.date,
      }))
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };
  const todayTasks = getTodayTasks();

  return (
    <View className="flex-1 gap-6">
      <TasksCalendar
        tasks={tasks}
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
      />

      {/* Selected Date Info */}
      <View className="px-6">
        <TaskStats selectedDate={selectedDate} tasks={tasks} />
      </View>

      {/*/!* Tasks for Selected Date *!/*/}
      <View className="px-6 gap-3">
        <View className="flex-row justify-between items-center">
          <Text className="text-lg font-semibold text-foreground">
            Task List
          </Text>
        </View>

        {/*  /!* Task List *!/*/}
        {todayTasks.length > 0 ? (
          <View className="gap-3">
            {todayTasks.map((task: Task) => (
              <TaskItem task={task} key={task._id} />
            ))}
          </View>
        ) : (
          <EmptyState
            icon="calendar-xmark"
            title="No tasks for this day"
            description="Select a different date or add a new task"
          />
        )}
      </View>
    </View>
  );
};
export default CalendarView;
