import { calculateFreeTime } from "@/utils/time";
import { Task } from "@/types";
import { useMemo } from "react";
import { startOfDay, endOfDay } from "date-fns";

export interface TimeSlot {
  id: string;
  startTimestamp: number;
  endTimestamp: number;
  tasks: Task[];
  isEmpty: boolean;
  freeTime?: string;
  isFreeTime?: boolean;
  hasOverlap?: boolean;
}

const createFreeTimeSlot = (
  id: string,
  startTimestamp: number,
  endTimestamp: number,
  freeTimeText?: string,
): TimeSlot => ({
  id,
  startTimestamp,
  endTimestamp,
  tasks: [],
  isEmpty: true,
  freeTime: freeTimeText || calculateFreeTime(startTimestamp, endTimestamp),
  isFreeTime: true,
});

const createTaskSlot = (
  id: string,
  startTimestamp: number,
  endTimestamp: number,
  tasks: Task[],
  hasOverlap: boolean = false,
): TimeSlot => ({
  id,
  startTimestamp,
  endTimestamp,
  tasks,
  isEmpty: false,
  hasOverlap,
});

const generateTimeSlots = (tasks: Task[]): TimeSlot[] => {
  // Handle empty day
  if (tasks.length === 0) {
    // Get start and end of the current day
    const today = new Date();
    const dayStart = startOfDay(today).getTime();
    const dayEnd = endOfDay(today).getTime();

    return [
      createFreeTimeSlot(
        "empty-day",
        dayStart,
        dayEnd,
        "No tasks scheduled for today",
      ),
    ];
  }

  // Sort tasks by startTime timestamp
  const sortedTasks = [...tasks].sort((a, b) => a.startTime - b.startTime);

  const slots: TimeSlot[] = [];
  let lastEndTimestamp: number | null = null;

  // Get the day boundaries from the first task's actual startTime, not the date field
  const firstTaskStartTime = sortedTasks[0].startTime;
  const dayStart = startOfDay(new Date(firstTaskStartTime)).getTime();
  const dayEnd = endOfDay(new Date(firstTaskStartTime)).getTime();

  // Add free time before first task if exists
  if (firstTaskStartTime > dayStart) {
    slots.push(createFreeTimeSlot("free-start", dayStart, firstTaskStartTime));
  }

  // Process each task
  sortedTasks.forEach((task, taskIndex) => {
    const startTimestamp = task.startTime;
    const endTimestamp = task.endTime;

    // Add free time slot if there's a gap between tasks
    if (lastEndTimestamp && lastEndTimestamp < startTimestamp) {
      slots.push(
        createFreeTimeSlot(
          `free-${lastEndTimestamp}-${startTimestamp}`,
          lastEndTimestamp,
          startTimestamp,
        ),
      );
    }

    // Check for overlap with previous slot
    const prevSlot = slots[slots.length - 1];
    const shouldMergeWithPrevious =
      prevSlot &&
      !prevSlot.isFreeTime &&
      prevSlot.startTimestamp <= startTimestamp &&
      prevSlot.endTimestamp > startTimestamp;

    if (shouldMergeWithPrevious) {
      // Merge with previous slot (overlap)
      prevSlot.tasks.push(task);
      prevSlot.hasOverlap = true;
      prevSlot.endTimestamp = Math.max(prevSlot.endTimestamp, endTimestamp);
      prevSlot.id = `task-overlap-${prevSlot.startTimestamp}`;
    } else {
      // Create new task slot
      slots.push(
        createTaskSlot(
          `task-${task._id}-${taskIndex}`,
          startTimestamp,
          endTimestamp,
          [task],
          false,
        ),
      );
    }

    // Update lastEndTimestamp for non-free-time slots
    const currentSlot = slots[slots.length - 1];
    if (!currentSlot.isFreeTime) {
      const maxEndTimestamp = Math.max(
        ...currentSlot.tasks.map((t) => t.endTime),
      );
      lastEndTimestamp = maxEndTimestamp;
      currentSlot.endTimestamp = maxEndTimestamp;
    }
  });

  // Add free time after last task if needed
  if (lastEndTimestamp && lastEndTimestamp < dayEnd) {
    slots.push(createFreeTimeSlot("free-end", lastEndTimestamp, dayEnd));
  }

  return slots;
};

export const useTimeSlots = (tasks: Task[] | undefined): TimeSlot[] => {
  return useMemo(() => {
    if (!tasks) return [];
    return generateTimeSlots(tasks);
  }, [tasks]);
};
