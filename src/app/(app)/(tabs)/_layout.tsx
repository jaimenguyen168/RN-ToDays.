import { Tabs, useRouter } from "expo-router";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, useColorScheme, View } from "react-native";

const TabsLayout = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const router = useRouter();

  const handleAddPress = () => {
    router.push("/add-modal");
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#5B67CA",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarStyle: {
          backgroundColor: isDark ? "#1F2937" : "white",
          position: "absolute",
          bottom: 25,
          left: 20,
          right: 20,
          elevation: 10,
          shadowColor: "#F9FAFD",
          shadowOffset: {
            width: 0,
            height: 4,
          },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          borderRadius: 25,
          height: 70,
          paddingBottom: 8,
          paddingTop: 14,
          paddingHorizontal: 10,
          borderTopWidth: 0,
          marginHorizontal: 28,
        },
        headerShown: false,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon
              focused={focused}
              color={color}
              focusedIcon="home"
              unfocusedIcon="home-outline"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: "Tasks",
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon
              focused={focused}
              color={color}
              focusedIcon="list"
              unfocusedIcon="list-outline"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: "Add",
          tabBarIcon: () => (
            <TouchableOpacity
              onPress={handleAddPress}
              style={{
                width: 50,
                height: 50,
                borderRadius: 28,
                marginTop: 4,
                justifyContent: "center",
                alignItems: "center",
                elevation: 4,
                shadowColor: "#5B67CA",
                shadowOffset: {
                  width: 0,
                  height: 4,
                },
                backgroundColor: "#5B67CA",
              }}
            >
              <Ionicons name="add" size={24} color="white" />
            </TouchableOpacity>
          ),
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: "Activity",
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon
              focused={focused}
              color={color}
              focusedIcon="stats-chart"
              unfocusedIcon="stats-chart-outline"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ focused, color }) => (
            <TabBarIcon
              focused={focused}
              color={color}
              focusedIcon="person"
              unfocusedIcon="person-outline"
            />
          ),
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;

interface TabBarIconProps {
  focused: boolean;
  color: string;
  focusedIcon: keyof typeof Ionicons.glyphMap;
  unfocusedIcon: keyof typeof Ionicons.glyphMap;
}

const TabBarIcon = ({
  focused,
  color,
  focusedIcon,
  unfocusedIcon,
}: TabBarIconProps) => {
  return (
    <View className="items-center gap-1.5 justify-start h-6">
      <Ionicons
        name={focused ? focusedIcon : unfocusedIcon}
        size={22}
        color={color}
      />
      {focused && <View className="size-1 bg-primary-500 rounded-full" />}
    </View>
  );
};
