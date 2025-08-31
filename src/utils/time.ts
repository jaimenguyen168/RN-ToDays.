export const timeToMinutes = (timeStr: string): number => {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
};

export const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
};

export const calculateFreeTime = (
  startTime: string,
  endTime: string,
): string => {
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);
  const diffMinutes = endMinutes - startMinutes;

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

export const subtractOneMinute = (timeStr: string | undefined): string => {
  if (!timeStr) return "";

  const [hours, minutes] = timeStr.split(":").map(Number);
  let totalMinutes = hours * 60 + minutes;

  totalMinutes -= 1;

  if (totalMinutes < 0) {
    totalMinutes = 1439; // 23:59
  }

  const newHours = Math.floor(totalMinutes / 60);
  const newMinutes = totalMinutes % 60;

  return `${newHours.toString().padStart(2, "0")}:${newMinutes.toString().padStart(2, "0")}`;
};

export const hasTimePassed = (
  endTime: string | undefined,
  targetDate: number | undefined,
): boolean => {
  if (!endTime || !targetDate) return false;

  const now = new Date();
  const targetDateOnly = new Date(targetDate);
  targetDateOnly.setHours(0, 0, 0, 0);

  const todayOnly = new Date(now);
  todayOnly.setHours(0, 0, 0, 0);

  // If the target date is in the future, time hasn't passed yet
  if (targetDateOnly > todayOnly) {
    return false;
  }

  // If the target date is in the past, time has passed
  if (targetDateOnly < todayOnly) {
    return true;
  }

  // If it's today, compare the actual times
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  // Parse the endTime string (e.g., "7:30")
  const [endHour, endMinute] = endTime.split(":").map(Number);

  // Convert both times to minutes for easier comparison
  const currentTimeInMinutes = currentHour * 60 + currentMinute;
  const endTimeInMinutes = endHour * 60 + endMinute;

  return currentTimeInMinutes > endTimeInMinutes;
};
