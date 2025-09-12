import React, { useState, useEffect, useRef } from "react";
import { View, Text, FlatList, TouchableOpacity } from "react-native";
import { ThemedIcon } from "@/components/ThemedIcon";
import { screenWidth } from "react-native-gifted-charts/dist/utils";

interface DayItem {
  date: Date;
  dayName: string;
  dayNumber: number;
  isSelected: boolean;
  dateString: string;
}

interface WeekData {
  weekOffset: number;
  days: DayItem[];
}

interface WeekNavigationProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onWeekChange?: (weekOffset: number) => void;
}

interface WeekNavigationReturn {
  weeks: WeekData[];
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
  const flatListRef = useRef<FlatList>(null);

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

  // Generate 3 weeks: previous, current, and next
  const generateThreeWeeks = (centerWeekOffset: number): WeekData[] => {
    return [
      {
        weekOffset: centerWeekOffset - 1,
        days: generateWeekDays(centerWeekOffset - 1),
      },
      {
        weekOffset: centerWeekOffset,
        days: generateWeekDays(centerWeekOffset),
      },
      {
        weekOffset: centerWeekOffset + 1,
        days: generateWeekDays(centerWeekOffset + 1),
      },
    ];
  };

  const [weeks, setWeeks] = useState(generateThreeWeeks(0));

  // Update week offset when selectedDate changes from outside
  useEffect(() => {
    const correctWeekOffset = calculateWeekOffset(selectedDate);
    if (correctWeekOffset !== currentWeekOffset) {
      setCurrentWeekOffset(correctWeekOffset);
    }
  }, [selectedDate]);

  useEffect(() => {
    const newWeeks = generateThreeWeeks(currentWeekOffset);
    setWeeks(newWeeks);

    // Ensure we're scrolled to the middle week (index 1)
    setTimeout(() => {
      flatListRef.current?.scrollToIndex({ index: 1, animated: false });
    }, 50);
  }, [currentWeekOffset, selectedDate]);

  const handlePrevWeek = () => {
    const newOffset = currentWeekOffset - 1;
    setCurrentWeekOffset(newOffset);

    // Find a date from the previous week and select it
    const prevWeekDays = generateWeekDays(newOffset);
    const newDate =
      prevWeekDays.find(
        (day) => day.dateString === selectedDate.toISOString().split("T")[0],
      )?.date ||
      prevWeekDays[selectedDate.getDay() === 0 ? 6 : selectedDate.getDay() - 1]
        .date;

    onDateChange(newDate);
  };

  const handleNextWeek = () => {
    const newOffset = currentWeekOffset + 1;
    setCurrentWeekOffset(newOffset);

    // Find a date from the next week and select it
    const nextWeekDays = generateWeekDays(newOffset);
    const newDate =
      nextWeekDays.find(
        (day) => day.dateString === selectedDate.toISOString().split("T")[0],
      )?.date ||
      nextWeekDays[selectedDate.getDay() === 0 ? 6 : selectedDate.getDay() - 1]
        .date;

    onDateChange(newDate);
  };

  const handleDateSelect = (date: Date) => {
    onDateChange(date);
  };

  return {
    weeks,
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
  const { weeks, handlePrevWeek, handleNextWeek, handleDateSelect } =
    useWeekNavigation(selectedDate, onDateChange);

  const flatListRef = useRef<FlatList>(null);

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

  const renderWeekItem = ({ item }: { item: WeekData }) => (
    <View style={{ width: screenWidth - 120 }}>
      <View className="flex-row justify-between px-2">
        {item.days.map((day) => (
          <View key={day.dateString}>{renderDayItem({ item: day })}</View>
        ))}
      </View>
    </View>
  );

  const handleScroll = (event: any) => {
    const { contentOffset } = event.nativeEvent;
    const weekWidth = screenWidth - 120;
    const pageIndex = Math.round(contentOffset.x / weekWidth);

    // If user scrolled to previous week (index 0)
    if (pageIndex === 0) {
      handlePrevWeek();
    }
    // If user scrolled to next week (index 2)
    else if (pageIndex === 2) {
      handleNextWeek();
    }
    // Always ensure we're back at the center (index 1) after the scroll
    setTimeout(() => {
      flatListRef.current?.scrollToIndex({ index: 1, animated: false });
    }, 100);
  };

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

      <FlatList
        ref={flatListRef}
        data={weeks}
        renderItem={renderWeekItem}
        keyExtractor={(item) => item.weekOffset.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        onMomentumScrollEnd={handleScroll}
        initialScrollIndex={1}
        getItemLayout={(data, index) => ({
          length: screenWidth - 80,
          offset: (screenWidth - 80) * index,
          index,
        })}
        style={{ flex: 1 }}
      />

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
