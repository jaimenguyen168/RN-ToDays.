import React, { useState, useEffect } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { ThemedIcon } from "@/components/ThemedIcon";

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
  onWeekChange?: (weekOffset: number) => void;
}

interface WeekNavigationReturn {
  weekDays: DayItem[];
  currentWeekOffset: number;
  handlePrevWeek: () => void;
  handleNextWeek: () => void;
  handleDateSelect: (date: Date) => void;
}

export const useWeekNavigation = (
  selectedDate: Date,
  onDateChange: (date: Date) => void,
): WeekNavigationReturn => {
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);

  // Helper function to calculate which week a date belongs to
  const calculateWeekOffset = (date: Date): number => {
    const today = new Date();
    const currentDay = today.getDay();
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;

    const thisWeekMonday = new Date(today);
    thisWeekMonday.setDate(today.getDate() + mondayOffset);
    thisWeekMonday.setHours(0, 0, 0, 0);

    const selectedDay = date.getDay();
    const selectedMondayOffset = selectedDay === 0 ? -6 : 1 - selectedDay;

    const selectedWeekMonday = new Date(date);
    selectedWeekMonday.setDate(date.getDate() + selectedMondayOffset);
    selectedWeekMonday.setHours(0, 0, 0, 0);

    const diffTime = selectedWeekMonday.getTime() - thisWeekMonday.getTime();
    return Math.round(diffTime / (1000 * 60 * 60 * 24 * 7));
  };

  const generateWeekDays = (weekOffset: number): DayItem[] => {
    const today = new Date();
    const currentDay = today.getDay();
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;

    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset + weekOffset * 7);

    const days = [];
    const dayNames = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];

    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);

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

  const [weekDays, setWeekDays] = useState(generateWeekDays(0));

  // Update week offset when selectedDate changes from outside
  useEffect(() => {
    const correctWeekOffset = calculateWeekOffset(selectedDate);
    if (correctWeekOffset !== currentWeekOffset) {
      setCurrentWeekOffset(correctWeekOffset);
    }
  }, [selectedDate]);

  useEffect(() => {
    const newWeekDays = generateWeekDays(currentWeekOffset);
    setWeekDays(newWeekDays);
  }, [currentWeekOffset, selectedDate]);

  const handlePrevWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() - 7);
    onDateChange(newDate);
    const newOffset = currentWeekOffset - 1;
    setCurrentWeekOffset(newOffset);
  };

  const handleNextWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + 7);
    onDateChange(newDate);
    const newOffset = currentWeekOffset + 1;
    setCurrentWeekOffset(newOffset);
  };

  const handleDateSelect = (date: Date) => {
    onDateChange(date);
  };

  return {
    weekDays,
    currentWeekOffset,
    handlePrevWeek,
    handleNextWeek,
    handleDateSelect,
  };
};

const WeekNavigation = ({
  selectedDate,
  onDateChange,
}: WeekNavigationProps) => {
  const { weekDays, handlePrevWeek, handleNextWeek, handleDateSelect } =
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
    <View className="flex-row justify-between items-center gap-2">
      <TouchableOpacity onPress={handlePrevWeek}>
        <ThemedIcon
          name="chevron-left"
          size={14}
          library="fontawesome6"
          lightColor="#64748B"
          darkColor="#94A3B8"
        />
      </TouchableOpacity>

      <FlatList
        data={weekDays}
        renderItem={renderDayItem}
        keyExtractor={(item) => item.dateString}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 10,
          justifyContent: "space-between",
          flex: 1,
        }}
      />

      <TouchableOpacity onPress={handleNextWeek}>
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
