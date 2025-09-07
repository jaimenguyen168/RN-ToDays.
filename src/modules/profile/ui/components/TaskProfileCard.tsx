import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { IconLibrary, ThemedIcon } from "@/components/ThemedIcon";
import { LinearGradient } from "expo-linear-gradient";

interface TaskProfileCardProps {
  title: string;
  count: number;
  icon?: string;
  iconLibrary?: IconLibrary;
  iconColor: string;
  colors: any;
  onPress?: () => void;
}

const TaskProfileCard = ({
  title,
  count,
  icon,
  iconLibrary,
  iconColor,
  colors,
  onPress,
}: TaskProfileCardProps) => (
  <TouchableOpacity
    onPress={onPress}
    className="flex-1 mx-2 mb-4"
    style={{
      elevation: 10,
      shadowColor: "#8F99EB",
      shadowOffset: {
        width: 0,
        height: 12,
      },
      shadowOpacity: 0.25,
      shadowRadius: 8,
    }}
  >
    <View className="rounded-2xl p-6 items-center justify-center min-h-[120px] overflow-hidden relative">
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 1 }}
        end={{ x: 1, y: 0 }}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
        }}
      />

      <View
        className="w-12 h-12 rounded-xl items-center justify-center mb-3 z-10"
        style={{ backgroundColor: iconColor }}
      >
        <ThemedIcon
          name={icon as any}
          size={24}
          lightColor="white"
          darkColor="white"
          library={iconLibrary}
        />
      </View>

      <Text className="text-primary-100 text-lg font-semibold mb-1 z-10">
        {title}
      </Text>

      <Text className="text-primary-100 text-sm opacity-90 z-10">
        {count} Task{count !== 1 ? "s" : ""}
      </Text>
    </View>
  </TouchableOpacity>
);

export default TaskProfileCard;
