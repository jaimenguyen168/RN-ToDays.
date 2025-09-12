import { View, Text, SafeAreaView, ScrollView } from "react-native";
import React, { useState } from "react";
import { useScrollHeader } from "@/hooks/useScrollHeader";
import { useQuery } from "convex/react";
import { api } from "~/convex/_generated/api";
import { ScrollHeader } from "@/components/ScrollHeader";
import TabPicker from "@/components/TabPicker";
import AnalyticsView from "@/modules/activity/ui/views/analytics-view";
import CalendarView from "@/modules/activity/ui/views/calendar-view";

const ActivityView = () => {
  const [activeTab, setActiveTab] = useState("calendar");

  const { headerOpacity, handleScroll } = useScrollHeader(15);

  const monthlyTasks = useQuery(api.private.tasks.getTasksWithFilters, {});

  const tabOptions = [
    { value: "calendar", label: "Calendar" },
    { value: "charts", label: "Analytics" },
  ];

  const isLoading = monthlyTasks === undefined;

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background">
        <View className="flex-1 justify-center items-center">
          <Text className="text-muted-foreground text-lg">Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollHeader opacity={headerOpacity}>
        <Text className="text-foreground text-lg font-semibold text-center">
          Activity
        </Text>
      </ScrollHeader>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Header */}
        <View className="tab-container pb-6">
          <Text className="text-3xl font-semibold text-foreground">
            Activity
          </Text>
          <Text className="text-muted-foreground font-medium">
            Track your tasks and productivity
          </Text>
        </View>

        {/* Tab Picker */}
        <View className="px-6 mb-6">
          <TabPicker
            options={tabOptions}
            selectedValue={activeTab}
            onSelect={setActiveTab}
          />
        </View>

        {/* Content based on active tab */}
        {activeTab === "calendar" ? (
          <CalendarView tasks={monthlyTasks} />
        ) : (
          <AnalyticsView tasks={monthlyTasks} />
        )}

        <View className="h-24" />
      </ScrollView>
    </SafeAreaView>
  );
};
export default ActivityView;
