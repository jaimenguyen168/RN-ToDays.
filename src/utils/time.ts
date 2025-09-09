import { format, isPast, subMinutes } from "date-fns";

export const calculateFreeTime = (
  startTime: number,
  endTime: number,
): string => {
  const diffMinutes = Math.floor((endTime - startTime) / (1000 * 60));

  if (diffMinutes <= 0) return "";

  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;

  if (hours === 0) {
    return `${minutes} min free`;
  } else if (minutes === 0) {
    return `${hours} ${hours === 1 ? "hour" : "hours"} free`;
  } else {
    return `${hours}:${minutes.toString().padStart(2, "0")} hours free`;
  }
};

export const subtractMinutes = (timestamp: number, minutes: number): string => {
  const newTimestamp = subMinutes(timestamp, minutes);
  return format(newTimestamp, "HH:mm");
};

export const hasPassed = (timestamp: number): boolean => {
  return isPast(timestamp);
};

type FormatType =
  | "date"
  | "time"
  | "datetime"
  | "short-date"
  | "long-date"
  | "time-24"
  | "datetime-24"
  | "compact";

export const formatDateTime = (
  date: Date,
  type: FormatType = "date",
): string => {
  switch (type) {
    case "date":
      return format(date, "MM-dd-yyyy");

    case "time":
      return format(date, "h:mm a");

    case "datetime":
      return format(date, "MM-dd-yyyy h:mm a");

    case "short-date":
      return format(date, "MM/dd/yy");

    case "long-date":
      return format(date, "MMMM dd, yyyy");

    case "time-24":
      return format(date, "HH:mm");

    case "datetime-24":
      return format(date, "MM-dd-yyyy HH:mm");

    case "compact":
      return format(date, "MMddyy");

    default:
      return format(date, "MM-dd-yyyy");
  }
};

export const formatWeekDays = (weekDays?: string[]) => {
  if (!weekDays || weekDays.length === 0) return "Daily";

  const dayAbbrevs: { [key: string]: string } = {
    monday: "Mon",
    tuesday: "Tue",
    wednesday: "Wed",
    thursday: "Thu",
    friday: "Fri",
    saturday: "Sat",
    sunday: "Sun",
  };

  if (weekDays.length === 7) return "Daily";
  if (
    weekDays.length === 5 &&
    !weekDays.includes("saturday") &&
    !weekDays.includes("sunday")
  ) {
    return "Weekdays";
  }
  if (
    weekDays.length === 2 &&
    weekDays.includes("saturday") &&
    weekDays.includes("sunday")
  ) {
    return "Weekends";
  }

  return weekDays.map((day) => dayAbbrevs[day] || day).join(", ");
};
