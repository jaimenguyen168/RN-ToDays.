import React from "react";
import ActivityView from "@/modules/activity/ui/views/activity-view";

const ActivityScreen = () => {
  return <ActivityView />;
};
//   const userId = "j57fgqzy3wkwx3381xw5ezvjcs7pga7v";
//   const [selectedDate, setSelectedDate] = useState(
//     new Date().toISOString().split("T")[0],
//   );
//   const [activeTab, setActiveTab] = useState("calendar"); // calendar, charts
//
//   // Get all tasks for marking dates
//   const monthlyTasks = useQuery(api.private.tasks.getTasksWithFilters, {
//     userId,
//   });
//
//   // Task type colors for dots using brighter versions for better visibility
//   const getTaskColors = (type: string) => {
//     switch (type) {
//       case TaskTypes.EMERGENCY:
//         return {
//           dotColor: "#f87171", // red-400 (brighter)
//           chartColor: "#EF4444", // red-500
//         };
//       case TaskTypes.PERSONAL:
//         return {
//           dotColor: "#8b5cf6", // violet-500 (brighter)
//           chartColor: "#8B5CF6", // violet-500
//         };
//       case TaskTypes.JOB:
//         return {
//           dotColor: "#34d399", // emerald-400 (brighter)
//           chartColor: "#10B981", // emerald-500
//         };
//       default:
//         return {
//           dotColor: "#9ca3af", // gray-400 (brighter)
//           chartColor: "#6B7280", // gray-500
//         };
//     }
//   };
//
//   // Filter tasks for the selected date
//   const selectedDateTasks = useMemo(() => {
//     if (!monthlyTasks) return [];
//
//     return monthlyTasks.filter((task: Task) => {
//       const taskDate = new Date(task.date).toISOString().split("T")[0];
//       return taskDate === selectedDate;
//     });
//   }, [monthlyTasks, selectedDate]);
//
//   // Calculate task statistics for the selected date
//   const getTaskStats = () => {
//     if (!selectedDateTasks) {
//       return { total: 0, completed: 0 };
//     }
//
//     const total = selectedDateTasks.length;
//     const completed = selectedDateTasks.filter(
//       (task: Task) => task.isCompleted,
//     ).length;
//
//     return { total, completed };
//   };
//
//   // Chart data calculations
//   const chartData = useMemo(() => {
//     if (!monthlyTasks) return null;
//
//     // 1. Task completion over last 7 days (Line Chart Data)
//     const last7DaysCompleted = [];
//     const last7DaysTotal = [];
//
//     for (let i = 6; i >= 0; i--) {
//       const date = new Date();
//       date.setDate(date.getDate() - i);
//       const dateString = date.toISOString().split("T")[0];
//
//       const dayTasks = monthlyTasks.filter((task: Task) => {
//         const taskDate = new Date(task.date).toISOString().split("T")[0];
//         return taskDate === dateString;
//       });
//
//       const completed = dayTasks.filter((task) => task.isCompleted).length;
//       const total = dayTasks.length;
//
//       last7DaysCompleted.push({
//         value: completed,
//         label: date.toLocaleDateString("en-US", { weekday: "short" }),
//         labelTextStyle: { color: "#64748B" },
//         dataPointText: completed.toString(),
//         textShiftY: -15,
//         textShiftX: -5,
//         textColor: "#10B981",
//         textFontSize: 10,
//       });
//
//       last7DaysTotal.push({
//         value: total,
//         label: date.toLocaleDateString("en-US", { weekday: "short" }),
//         labelTextStyle: { color: "#64748B" },
//         dataPointText: total.toString(),
//         textShiftY: -15,
//         textShiftX: -5,
//         textColor: "#3B82F6",
//         textFontSize: 10,
//       });
//     }
//
//     // 2. Current week stacked bar chart (Mon-Sun)
//     const currentWeekData = [];
//     const today = new Date();
//     const currentWeekStart = new Date(today);
//     // Get Monday of current week
//     const dayOfWeek = today.getDay();
//     const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // If Sunday (0), go back 6 days, else go back (dayOfWeek - 1)
//     currentWeekStart.setDate(today.getDate() - daysToSubtract);
//
//     for (let i = 0; i < 7; i++) {
//       const date = new Date(currentWeekStart);
//       date.setDate(currentWeekStart.getDate() + i);
//       const dateString = date.toISOString().split("T")[0];
//
//       const dayTasks = monthlyTasks.filter((task: Task) => {
//         const taskDate = new Date(task.date).toISOString().split("T")[0];
//         return taskDate === dateString;
//       });
//
//       const personalCount = dayTasks.filter(
//         (task) => task.type === TaskTypes.PERSONAL,
//       ).length;
//       const jobCount = dayTasks.filter(
//         (task) => task.type === TaskTypes.JOB,
//       ).length;
//       const emergencyCount = dayTasks.filter(
//         (task) => task.type === TaskTypes.EMERGENCY,
//       ).length;
//
//       currentWeekData.push({
//         label: date.toLocaleDateString("en-US", { weekday: "short" }),
//         value: personalCount,
//         spacing: 2,
//         labelWidth: 30,
//         labelTextStyle: { color: "#64748B", fontWeight: "bold" as const },
//         frontColor: getTaskColors(TaskTypes.PERSONAL).chartColor,
//         // Stack data
//         stacks: [
//           {
//             value: personalCount,
//             color: getTaskColors(TaskTypes.PERSONAL).chartColor,
//           },
//           {
//             value: jobCount,
//             color: getTaskColors(TaskTypes.JOB).chartColor,
//           },
//           {
//             value: emergencyCount,
//             color: getTaskColors(TaskTypes.EMERGENCY).chartColor,
//           },
//         ],
//         topLabelComponent: () => (
//           <Text style={{ color: "#64748B", fontSize: 10, marginBottom: 6 }}>
//             {personalCount + jobCount + emergencyCount}
//           </Text>
//         ),
//       });
//     }
//
//     // 2. Task distribution by type (Pie Chart)
//     const tasksByType: Record<string, number> = {
//       [TaskTypes.PERSONAL]: 0,
//       [TaskTypes.JOB]: 0,
//       [TaskTypes.EMERGENCY]: 0,
//     };
//
//     monthlyTasks.forEach((task: Task) => {
//       if (tasksByType.hasOwnProperty(task.type)) {
//         tasksByType[task.type]++;
//       }
//     });
//
//     const pieData = Object.entries(tasksByType)
//       .filter(([, count]) => count > 0)
//       .map(([type, count]) => ({
//         value: count,
//         color: getTaskColors(type).chartColor,
//         text: count.toString(),
//         label: type,
//       }));
//
//     // 3. Weekly completion trend (Line Chart)
//     const weeklyTrend = [];
//     for (let i = 4; i >= 0; i--) {
//       const weekStart = new Date();
//       weekStart.setDate(weekStart.getDate() - i * 7);
//       const weekEnd = new Date(weekStart);
//       weekEnd.setDate(weekEnd.getDate() + 6);
//
//       const weekTasks = monthlyTasks.filter((task: Task) => {
//         const taskDate = new Date(task.date);
//         return taskDate >= weekStart && taskDate <= weekEnd;
//       });
//
//       const completed = weekTasks.filter((task) => task.isCompleted).length;
//       const total = weekTasks.length;
//       const completionRate = total > 0 ? (completed / total) * 100 : 0;
//
//       weeklyTrend.push({
//         value: Math.round(completionRate),
//         label: `W${i === 0 ? "eek" : i + 1}`,
//         labelTextStyle: { color: "#64748B" },
//         dataPointText: `${Math.round(completionRate)}%`,
//         textShiftY: -10,
//         textShiftX: -10,
//         textColor: "#3B82F6",
//         textFontSize: 10,
//       });
//     }
//
//     return {
//       dailyCompletedLine: last7DaysCompleted,
//       dailyTotalLine: last7DaysTotal,
//       currentWeekStacked: currentWeekData,
//       taskDistribution: pieData,
//       weeklyTrend: weeklyTrend,
//     };
//   }, [monthlyTasks]);
//
//   // Create marked dates for tasks (multi-dot)
//   const taskMarkedDates = useMemo(() => {
//     if (!monthlyTasks) return {};
//
//     const marked: { [key: string]: any } = {};
//
//     // Group tasks by date
//     const tasksByDate = monthlyTasks.reduce(
//       (acc: { [key: string]: Task[] }, task: Task) => {
//         const dateString = new Date(task.date).toISOString().split("T")[0];
//         if (!acc[dateString]) {
//           acc[dateString] = [];
//         }
//         acc[dateString].push(task);
//         return acc;
//       },
//       {},
//     );
//
//     // Create dots for each date
//     Object.keys(tasksByDate).forEach((dateString) => {
//       const tasksForDate = tasksByDate[dateString];
//
//       // Group by task type and count
//       const typeCount: { [key: string]: number } = {};
//       tasksForDate.forEach((task) => {
//         typeCount[task.type] = (typeCount[task.type] || 0) + 1;
//       });
//
//       // Create dots (max 3)
//       const dots = Object.entries(typeCount)
//         .sort(([, a], [, b]) => b - a) // Sort by count descending
//         .slice(0, 3) // Take max 3 types
//         .map(([type, count]) => ({
//           key: type,
//           color: getTaskColors(type).dotColor,
//           selectedDotColor: "white",
//         }));
//
//       marked[dateString] = {
//         dots,
//         selected: dateString === selectedDate,
//         selectedColor: dateString === selectedDate ? "#3B82F6" : undefined,
//       };
//     });
//
//     // Mark selected date even if no tasks
//     if (!marked[selectedDate]) {
//       marked[selectedDate] = {
//         selected: true,
//         selectedColor: "#3B82F6",
//         dots: [],
//       };
//     }
//
//     return marked;
//   }, [monthlyTasks, selectedDate]);
//
//   const formatSelectedDate = (dateString: string) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString("en-US", {
//       weekday: "long",
//       month: "long",
//       day: "numeric",
//       year: "numeric",
//     });
//   };
//
//   const { total, completed } = getTaskStats();
//
//   // Check if data is still loading
//   const isLoading = monthlyTasks === undefined;
//
//   if (isLoading) {
//     return (
//       <SafeAreaView className="flex-1 bg-background">
//         <View className="flex-1 justify-center items-center">
//           <Text className="text-muted-foreground text-lg">Loading...</Text>
//         </View>
//       </SafeAreaView>
//     );
//   }
//
//   const renderTabButtons = () => (
//     <View className="px-6 mb-4">
//       <View className="flex-row bg-muted rounded-lg p-1">
//         <TouchableOpacity
//           className={`flex-1 py-2 px-4 rounded-md ${
//             activeTab === "calendar" ? "bg-background" : ""
//           }`}
//           onPress={() => setActiveTab("calendar")}
//         >
//           <Text
//             className={`text-center font-medium ${
//               activeTab === "calendar"
//                 ? "text-foreground"
//                 : "text-muted-foreground"
//             }`}
//           >
//             Calendar
//           </Text>
//         </TouchableOpacity>
//         <TouchableOpacity
//           className={`flex-1 py-2 px-4 rounded-md ${
//             activeTab === "charts" ? "bg-background" : ""
//           }`}
//           onPress={() => setActiveTab("charts")}
//         >
//           <Text
//             className={`text-center font-medium ${
//               activeTab === "charts"
//                 ? "text-foreground"
//                 : "text-muted-foreground"
//             }`}
//           >
//             Analytics
//           </Text>
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
//
//   const renderChartsView = () => {
//     if (!chartData || !monthlyTasks?.length) {
//       return (
//         <View className="px-6">
//           <View className="bg-muted rounded-lg p-6 items-center">
//             <ThemedIcon
//               name="chart-line"
//               size={48}
//               library="fontawesome6"
//               lightColor="#9CA3AF"
//               darkColor="#6B7280"
//             />
//             <Text className="text-muted-foreground text-center mt-3 mb-2">
//               No data for analytics yet
//             </Text>
//             <Text className="text-muted-foreground text-center text-sm">
//               Complete some tasks to see your productivity insights
//             </Text>
//           </View>
//         </View>
//       );
//     }
//
//     return (
//       <View className="px-6 gap-6">
//         {/* Task Distribution Pie Chart */}
//         {chartData.taskDistribution.length > 0 && (
//           <View className="bg-card rounded-lg p-4">
//             <Text className="text-lg font-semibold text-foreground mb-4">
//               Task Distribution
//             </Text>
//             <View className="items-center">
//               <PieChart
//                 data={chartData.taskDistribution}
//                 donut
//                 showGradient
//                 sectionAutoFocus
//                 radius={80}
//                 innerRadius={60}
//                 innerCircleColor="transparent"
//                 centerLabelComponent={() => (
//                   <View
//                     style={{ justifyContent: "center", alignItems: "center" }}
//                   >
//                     <Text
//                       style={{
//                         fontSize: 18,
//                         color: "#1F2937",
//                         fontWeight: "bold",
//                       }}
//                     >
//                       {monthlyTasks.length}
//                     </Text>
//                     <Text style={{ fontSize: 12, color: "#6B7280" }}>
//                       Total
//                     </Text>
//                   </View>
//                 )}
//               />
//             </View>
//             <View className="flex-row justify-center gap-4 mt-4">
//               {chartData.taskDistribution.map((item, index) => (
//                 <View key={index} className="flex-row items-center gap-2">
//                   <View
//                     className="w-3 h-3 rounded-full"
//                     style={{ backgroundColor: item.color }}
//                   />
//                   <Text className="text-foreground text-sm">
//                     {item.label} ({item.value})
//                   </Text>
//                 </View>
//               ))}
//             </View>
//           </View>
//         )}
//
//         {/* Current Week Stacked Bar Chart */}
//         <View className="bg-card rounded-lg p-4">
//           <Text className="text-lg font-semibold text-foreground mb-4">
//             This Week's Tasks (Mon - Sun)
//           </Text>
//           <BarChart
//             stackData={chartData.currentWeekStacked}
//             width={300}
//             height={220}
//             barWidth={35}
//             spacing={24}
//             hideRules
//             xAxisThickness={0}
//             yAxisThickness={0}
//             yAxisTextStyle={{ color: "#6B7280" }}
//             noOfSections={3}
//             maxValue={
//               Math.max(
//                 ...chartData.currentWeekStacked.map(
//                   (d) =>
//                     d.stacks?.reduce((sum, stack) => sum + stack.value, 0) ||
//                     d.value,
//                 ),
//               ) + 1
//             }
//             isAnimated
//           />
//           <View className="flex-row justify-center gap-4 mt-4">
//             <View className="flex-row items-center gap-2">
//               <View
//                 className="w-3 h-3 rounded-full"
//                 style={{
//                   backgroundColor: getTaskColors(TaskTypes.PERSONAL).chartColor,
//                 }}
//               />
//               <Text className="text-foreground text-sm">Personal</Text>
//             </View>
//             <View className="flex-row items-center gap-2">
//               <View
//                 className="w-3 h-3 rounded-full"
//                 style={{
//                   backgroundColor: getTaskColors(TaskTypes.JOB).chartColor,
//                 }}
//               />
//               <Text className="text-foreground text-sm">Job</Text>
//             </View>
//             <View className="flex-row items-center gap-2">
//               <View
//                 className="w-3 h-3 rounded-full"
//                 style={{
//                   backgroundColor: getTaskColors(TaskTypes.EMERGENCY)
//                     .chartColor,
//                 }}
//               />
//               <Text className="text-foreground text-sm">Emergency</Text>
//             </View>
//           </View>
//         </View>
//
//         {/* Daily Completion vs Total Line Chart */}
//         <View className="bg-card rounded-lg p-4">
//           <Text className="text-lg font-semibold text-foreground mb-4">
//             Daily Progress (Last 7 Days)
//           </Text>
//           <LineChart
//             data={chartData.dailyCompletedLine}
//             data2={chartData.dailyTotalLine}
//             width={300}
//             height={220}
//             color1="#10B981"
//             color2="#3B82F6"
//             thickness1={3}
//             thickness2={3}
//             dataPointsColor1="#10B981"
//             dataPointsColor2="#3B82F6"
//             dataPointsRadius1={5}
//             dataPointsRadius2={5}
//             hideRules
//             hideAxesAndRules
//             isAnimated
//             animateTogether
//             yAxisTextStyle={{ color: "#6B7280" }}
//             showVerticalLines
//             verticalLinesColor="rgba(14,165,233,0.1)"
//             xAxisColor="rgba(107,114,128,0.3)"
//             yAxisColor="rgba(107,114,128,0.3)"
//             maxValue={
//               Math.max(
//                 ...chartData.dailyTotalLine.map((d) => d.value),
//                 ...chartData.dailyCompletedLine.map((d) => d.value),
//               ) + 1
//             }
//           />
//           <View className="flex-row justify-center gap-6 mt-4">
//             <View className="flex-row items-center gap-2">
//               <View className="w-3 h-3 rounded-full bg-green-500" />
//               <Text className="text-foreground text-sm">Completed</Text>
//             </View>
//             <View className="flex-row items-center gap-2">
//               <View className="w-3 h-3 rounded-full bg-blue-500" />
//               <Text className="text-foreground text-sm">Total Tasks</Text>
//             </View>
//           </View>
//         </View>
//
//         {/* Weekly Completion Trend Line Chart */}
//         {chartData.weeklyTrend.some((d) => d.value > 0) && (
//           <View className="bg-card rounded-lg p-4">
//             <Text className="text-lg font-semibold text-foreground mb-4">
//               Weekly Completion Rate
//             </Text>
//             <LineChart
//               data={chartData.weeklyTrend}
//               width={300}
//               height={200}
//               color="#3B82F6"
//               thickness={3}
//               dataPointsColor="#3B82F6"
//               dataPointsRadius={5}
//               hideRules
//               hideAxesAndRules
//               isAnimated
//               animateTogether
//               yAxisTextStyle={{ color: "#6B7280" }}
//               showVerticalLines
//               verticalLinesColor="rgba(14,165,233,0.1)"
//               xAxisColor="rgba(107,114,128,0.3)"
//               yAxisColor="rgba(107,114,128,0.3)"
//               areaChart
//               startFillColor="rgba(59,130,246,0.1)"
//               endFillColor="rgba(59,130,246,0.05)"
//             />
//           </View>
//         )}
//
//         {/* Quick Stats */}
//         <View className="bg-card rounded-lg p-4">
//           <Text className="text-lg font-semibold text-foreground mb-4">
//             Quick Stats
//           </Text>
//           <View className="flex-row justify-between">
//             <View className="items-center flex-1">
//               <Text className="text-2xl font-bold text-blue-600">
//                 {monthlyTasks.length}
//               </Text>
//               <Text className="text-muted-foreground text-sm">Total Tasks</Text>
//             </View>
//             <View className="items-center flex-1">
//               <Text className="text-2xl font-bold text-green-600">
//                 {monthlyTasks.filter((t) => t.isCompleted).length}
//               </Text>
//               <Text className="text-muted-foreground text-sm">Completed</Text>
//             </View>
//             <View className="items-center flex-1">
//               <Text className="text-2xl font-bold text-orange-600">
//                 {Math.round(
//                   (monthlyTasks.filter((t) => t.isCompleted).length /
//                     Math.max(monthlyTasks.length, 1)) *
//                     100,
//                 )}
//                 %
//               </Text>
//               <Text className="text-muted-foreground text-sm">
//                 Success Rate
//               </Text>
//             </View>
//           </View>
//         </View>
//       </View>
//     );
//   };
//
//   const renderCalendarView = () => (
//     <>
//       {/* Legend */}
//       <View className="px-6">
//         <View className="bg-card rounded-lg p-4 gap-3 flex-row justify-between">
//           <View className="flex-row items-center gap-3">
//             <View
//               className="size-2 rounded-full"
//               style={{
//                 backgroundColor: getTaskColors(TaskTypes.PERSONAL).dotColor,
//               }}
//             />
//             <Text className="text-foreground">Personal</Text>
//           </View>
//           <View className="flex-row items-center gap-3">
//             <View
//               className="size-2 rounded-full"
//               style={{
//                 backgroundColor: getTaskColors(TaskTypes.JOB).dotColor,
//               }}
//             />
//             <Text className="text-foreground">Job</Text>
//           </View>
//           <View className="flex-row items-center gap-3">
//             <View
//               className="size-2 rounded-full"
//               style={{
//                 backgroundColor: getTaskColors(TaskTypes.EMERGENCY).dotColor,
//               }}
//             />
//             <Text className="text-foreground">Emergency</Text>
//           </View>
//         </View>
//       </View>
//
//       {/* Calendar */}
//       <View className="px-6 mb-6">
//         <Calendar
//           current={selectedDate}
//           onDayPress={(day) => {
//             setSelectedDate(day.dateString);
//           }}
//           markingType="multi-dot"
//           markedDates={taskMarkedDates}
//           theme={{
//             backgroundColor: "transparent",
//             calendarBackground: "transparent",
//             textSectionTitleColor: "#64748B",
//             selectedDayBackgroundColor: "#3B82F6",
//             selectedDayTextColor: "#ffffff",
//             todayTextColor: "#3B82F6",
//             dayTextColor: "#1F2937",
//             textDisabledColor: "#D1D5DB",
//             dotColor: "#F59E0B",
//             selectedDotColor: "#ffffff",
//             arrowColor: "#3B82F6",
//             monthTextColor: "#1F2937",
//             indicatorColor: "#3B82F6",
//             textDayFontWeight: "500",
//             textMonthFontWeight: "600",
//             textDayHeaderFontWeight: "500",
//             textDayFontSize: 16,
//             textMonthFontSize: 18,
//             textDayHeaderFontSize: 14,
//           }}
//           enableSwipeMonths={true}
//           hideExtraDays={true}
//           firstDay={1} // Monday as first day
//         />
//       </View>
//
//       {/* Selected Date Info */}
//       <View className="px-6 mb-4">
//         <View className="bg-muted rounded-lg p-4">
//           <Text className="text-lg font-semibold text-foreground mb-2">
//             {formatSelectedDate(selectedDate)}
//           </Text>
//
//           {/* Task Statistics */}
//           <View className="flex-row items-center gap-4">
//             <View className="flex-row items-center gap-2">
//               <View className="w-3 h-3 bg-blue-500 rounded-full" />
//               <Text className="text-muted-foreground text-sm">
//                 {total} {total === 1 ? "task" : "tasks"}
//               </Text>
//             </View>
//
//             {total > 0 && (
//               <View className="flex-row items-center gap-2">
//                 <View className="w-3 h-3 bg-green-500 rounded-full" />
//                 <Text className="text-muted-foreground text-sm">
//                   {completed} completed
//                 </Text>
//               </View>
//             )}
//
//             {total > 0 && (
//               <View className="flex-row items-center gap-2">
//                 <ThemedIcon
//                   name="trending-up"
//                   size={14}
//                   library="feather"
//                   lightColor="#10B981"
//                   darkColor="#34D399"
//                 />
//                 <Text className="text-green-600 text-sm font-medium">
//                   {Math.round((completed / total) * 100)}%
//                 </Text>
//               </View>
//             )}
//           </View>
//         </View>
//       </View>
//
//       {/* Tasks for Selected Date */}
//       <View className="px-6">
//         <View className="flex-row justify-between items-center mb-4">
//           <Text className="text-lg font-semibold text-foreground">
//             Tasks for this day
//           </Text>
//         </View>
//
//         {/* Task List */}
//         {selectedDateTasks && selectedDateTasks.length > 0 ? (
//           <View className="gap-3">
//             {selectedDateTasks.map((task: Task) => (
//               <View key={task._id} className="bg-card rounded-lg p-1">
//                 <TaskItem task={task} />
//               </View>
//             ))}
//           </View>
//         ) : (
//           <View className="bg-muted rounded-lg p-6 items-center">
//             <ThemedIcon
//               name="calendar-xmark"
//               size={48}
//               library="fontawesome6"
//               lightColor="#9CA3AF"
//               darkColor="#6B7280"
//             />
//             <Text className="text-muted-foreground text-center mt-3 mb-2">
//               No tasks for this day
//             </Text>
//             <Text className="text-muted-foreground text-center text-sm">
//               Select a different date or add a new task
//             </Text>
//           </View>
//         )}
//       </View>
//     </>
//   );
//
//   return (
//     <SafeAreaView className="flex-1 bg-background">
//       <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
//         {/* Header */}
//         <View className="px-6 pt-4 pb-6">
//           <Text className="text-2xl font-semibold text-foreground mb-2">
//             Activity
//           </Text>
//           <Text className="text-muted-foreground">
//             Track your tasks and productivity
//           </Text>
//         </View>
//
//         {/* Tab Buttons */}
//         {renderTabButtons()}
//
//         {/* Content based on active tab */}
//         {activeTab === "calendar" ? renderCalendarView() : renderChartsView()}
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

export default ActivityScreen;
