import { View, Text } from "react-native";
import React, { useState } from "react";
import TasksCalendar from "@/modules/activity/ui/components/TasksCalendar";
import { Task } from "@/types";
import TaskStats from "@/modules/activity/ui/components/TaskStats";
import TaskItem from "@/modules/tasks/ui/components/TaskItem";
import EmptyState from "@/modules/activity/ui/components/EmptyState";
import { isSameDay } from "date-fns";

interface CalendarViewProps {
  tasks: Task[];
}

const CalendarView = ({ tasks }: CalendarViewProps) => {
  const [selectedDate, setSelectedDate] = useState(new Date().getTime());

  const todayTasks = tasks.filter((task) => isSameDay(task.date, selectedDate));

  return (
    <View className="flex-1 gap-6">
      <TasksCalendar
        tasks={tasks}
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
      />

      {/* Selected Date Info */}
      <View className="px-6">
        <TaskStats selectedDate={selectedDate} />
      </View>

      {/*/!* Tasks for Selected Date *!/*/}
      <View className="px-6 gap-3">
        {/*  /!* Task List *!/*/}
        {todayTasks.length > 0 ? (
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">
              Task List
            </Text>
            <View className="gap-3">
              {todayTasks.map((task: Task) => (
                <TaskItem task={task} key={task._id} />
              ))}
            </View>
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
