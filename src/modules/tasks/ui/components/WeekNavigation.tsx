import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { ThemedIcon } from "@/components/ThemedIcon";
import { screenWidth } from "react-native-gifted-charts/dist/utils";

interface DayItem {
  date: Date;
  dayName: string;
  dayNumber: number;
  isSelected: boolean;
  dateString: string;
}

interface WeekNavigationProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

interface WeekNavigationReturn {
  days: DayItem[];
  handlePrevWeek: () => void;
  handleNextWeek: () => void;
  handleDateSelect: (date: Date) => void;
}

export const useWeekNavigation = (
  selectedDate: Date,
  onDateChange: (date: Date) => void,
): WeekNavigationReturn => {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    // Get the Monday of the week containing selectedDate
    const date = new Date(selectedDate);
    const day = date.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    const monday = new Date(date);
    monday.setDate(date.getDate() + mondayOffset);
    monday.setHours(0, 0, 0, 0);
    return monday;
  });

  const generateWeekDays = (weekStart: Date): DayItem[] => {
    const days = [];
    const dayNames = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];

    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);

      const dateString = date.toISOString().split("T")[0];
      const isSelected =
        dateString === selectedDate.toISOString().split("T")[0];

      days.push({
        date,
        dayName: dayNames[i],
        dayNumber: date.getDate(),
        isSelected,
        dateString,
      });
    }

    return days;
  };

  const days = generateWeekDays(currentWeekStart);

  const handlePrevWeek = () => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(currentWeekStart.getDate() - 7);
    setCurrentWeekStart(newWeekStart);

    // Keep the same day of week selected
    const newSelectedDate = new Date(selectedDate);
    newSelectedDate.setDate(selectedDate.getDate() - 7);
    onDateChange(newSelectedDate);
  };

  const handleNextWeek = () => {
    const newWeekStart = new Date(currentWeekStart);
    newWeekStart.setDate(currentWeekStart.getDate() + 7);
    setCurrentWeekStart(newWeekStart);

    // Keep the same day of week selected
    const newSelectedDate = new Date(selectedDate);
    newSelectedDate.setDate(selectedDate.getDate() + 7);
    onDateChange(newSelectedDate);
  };

  const handleDateSelect = (date: Date) => {
    onDateChange(date);
  };

  return {
    days,
    handlePrevWeek,
    handleNextWeek,
    handleDateSelect,
  };
};

const WeekNavigation = ({
  selectedDate,
  onDateChange,
}: WeekNavigationProps) => {
  const { days, handlePrevWeek, handleNextWeek, handleDateSelect } =
    useWeekNavigation(selectedDate, onDateChange);

  const renderDayItem = ({ item }: { item: DayItem }) => (
    <TouchableOpacity
      className={`items-center justify-center py-2 w-10 rounded-xl ${
        item.isSelected ? "bg-primary-500" : "bg-transparent"
      }`}
      onPress={() => handleDateSelect(item.date)}
    >
      <Text
        className={`font-semibold ${
          item.isSelected ? "text-white" : "text-foreground"
        }`}
      >
        {item.dayName}
      </Text>
      <Text
        className={`mt-1 text-sm ${
          item.isSelected ? "text-white" : "text-muted-foreground"
        }`}
      >
        {item.dayNumber}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View className="flex-row justify-between items-center gap-1">
      <TouchableOpacity onPress={handlePrevWeek} className="p-3">
        <ThemedIcon
          name="chevron-left"
          size={14}
          library="fontawesome6"
          lightColor="#64748B"
          darkColor="#94A3B8"
        />
      </TouchableOpacity>

      <View
        className="flex-row justify-between px-2"
        style={{ width: screenWidth - 120 }}
      >
        {days.map((day) => (
          <View key={day.dateString}>{renderDayItem({ item: day })}</View>
        ))}
      </View>

      <TouchableOpacity onPress={handleNextWeek} className="p-3">
        <ThemedIcon
          name="chevron-right"
          size={14}
          library="fontawesome6"
          lightColor="#64748B"
          darkColor="#94A3B8"
        />
      </TouchableOpacity>
    </View>
  );
};

export default WeekNavigation;
