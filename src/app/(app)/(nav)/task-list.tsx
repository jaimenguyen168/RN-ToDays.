import React from "react";
import { useLocalSearchParams } from "expo-router";
import TaskListView from "@/modules/tasks/ui/views/task-list-view";
import SearchTasksView from "@/modules/tasks/ui/views/search-tasks-view";

const TaskList = () => {
  const { mode } = useLocalSearchParams<{
    mode: string;
  }>();

  const renderView = () => {
    if (mode === "search") {
      return <SearchTasksView />;
    }

    return <TaskListView />;
  };

  return renderView();
};

export default TaskList;
