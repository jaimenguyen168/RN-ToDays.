import { eachDayOfInterval, format, getDay } from "date-fns";

export const getSelectedDayNames = (selectedWeekDays: Date[]): string[] => {
  const dayNames = selectedWeekDays.map((date) => format(date, "EEEE"));

  const uniqueDays = [...new Set(dayNames)];
  const dayOrder = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return uniqueDays.sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b));
};

export const calculateRecurringDates = (
  startDate: Date,
  endDate: Date | undefined,
  selectedWeekDays: Date[],
  hasEndDate: boolean,
): number[] => {
  if (!hasEndDate || !endDate || selectedWeekDays.length === 0) {
    return [];
  }

  const selectedDayNumbers = selectedWeekDays.map((date) => getDay(date));

  // Get all dates in the range
  const allDatesInRange = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  // Filter to only include dates that match the selected week days
  const recurringDates = allDatesInRange.filter((date) => {
    const dayOfWeek = getDay(date);
    return selectedDayNumbers.includes(dayOfWeek);
  });

  // Convert to timestamps
  return recurringDates.map((date) => date.getTime());
};
