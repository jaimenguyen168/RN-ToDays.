export const hasTimePassed = (endTime: string | undefined): boolean => {
  if (!endTime) return false;

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  // Parse the endTime string (e.g., "7:30")
  const [endHour, endMinute] = endTime.split(":").map(Number);

  // Convert both times to minutes for easier comparison
  const currentTimeInMinutes = currentHour * 60 + currentMinute;
  const endTimeInMinutes = endHour * 60 + endMinute;

  return currentTimeInMinutes > endTimeInMinutes;
};
