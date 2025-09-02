import { calculateFreeTime, minutesToTime, timeToMinutes } from "@/utils/time";
import { Task } from "@/types";
import { useMemo } from "react";

export interface TimeSlot {
  id: string;
  time: string;
  tasks: Task[];
  isEmpty: boolean;
  freeTime?: string;
  isFreeTime?: boolean;
  endTime?: string;
  hasOverlap?: boolean;
}

const createFreeTimeSlot = (
  id: string,
  startTime: string,
  endTime: string,
  freeTimeText?: string,
): TimeSlot => ({
  id,
  time: startTime,
  tasks: [],
  isEmpty: true,
  freeTime: freeTimeText || calculateFreeTime(startTime, endTime),
  isFreeTime: true,
  endTime,
});

const createTaskSlot = (
  id: string,
  time: string,
  tasks: Task[],
  endTime: string,
  hasOverlap: boolean = false,
): TimeSlot => ({
  id,
  time,
  tasks,
  isEmpty: false,
  endTime,
  hasOverlap,
});

const generateTimeSlots = (tasks: Task[]): TimeSlot[] => {
  // Handle empty day
  if (tasks.length === 0) {
    return [
      createFreeTimeSlot(
        "empty-day",
        "00:00",
        "24:00",
        "No tasks scheduled for today",
      ),
    ];
  }

  const sortedTasks = [...tasks].sort(
    (a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime),
  );

  const slots: TimeSlot[] = [];
  let lastEndTime: string | null = null;

  // Add free time before first task if exists
  const firstTask = sortedTasks[0];
  const firstTaskStart = timeToMinutes(firstTask.startTime);
  if (firstTaskStart > 0) {
    slots.push(createFreeTimeSlot("free-start", "00:00", firstTask.startTime));
  }

  // Process each task
  sortedTasks.forEach((task, taskIndex) => {
    const startMinutes = timeToMinutes(task.startTime);
    const endMinutes = timeToMinutes(task.endTime);

    // Add free time slot if there's a gap between tasks
    if (lastEndTime && timeToMinutes(lastEndTime) < startMinutes) {
      slots.push(
        createFreeTimeSlot(
          `free-${lastEndTime}-${task.startTime}`,
          lastEndTime,
          task.startTime,
        ),
      );
    }

    // Check for overlap with previous slot
    const prevSlot = slots[slots.length - 1];
    const shouldMergeWithPrevious =
      prevSlot &&
      !prevSlot.isFreeTime &&
      timeToMinutes(prevSlot.time) <= startMinutes &&
      timeToMinutes(prevSlot.endTime || prevSlot.time) > startMinutes;

    if (shouldMergeWithPrevious) {
      // Merge with previous slot (overlap)
      prevSlot.tasks.push(task);
      prevSlot.hasOverlap = true;
      prevSlot.endTime = minutesToTime(
        Math.max(timeToMinutes(prevSlot.endTime || prevSlot.time), endMinutes),
      );
      prevSlot.id = `task-overlap-${prevSlot.time}`;
    } else {
      // Create new task slot
      slots.push(
        createTaskSlot(
          `task-${task._id}-${taskIndex}`,
          task.startTime,
          [task],
          task.endTime,
          false,
        ),
      );
    }

    // Update lastEndTime for non-free-time slots
    const currentSlot = slots[slots.length - 1];
    if (!currentSlot.isFreeTime) {
      const maxEndTime = Math.max(
        ...currentSlot.tasks.map((t) => timeToMinutes(t.endTime)),
      );
      lastEndTime = minutesToTime(maxEndTime);
      currentSlot.endTime = lastEndTime;
    }
  });

  // Add free time after last task if needed
  if (lastEndTime && timeToMinutes(lastEndTime) < 1440) {
    slots.push(createFreeTimeSlot("free-end", lastEndTime, "24:00"));
  }

  return slots;
};

export const useTimeSlots = (tasks: Task[] | undefined): TimeSlot[] => {
  return useMemo(() => {
    if (!tasks) return [];
    return generateTimeSlots(tasks);
  }, [tasks]);
};
