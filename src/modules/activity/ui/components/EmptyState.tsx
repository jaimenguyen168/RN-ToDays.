import React from "react";
import { View, Text } from "react-native";
import { ThemedIcon } from "@/components/ThemedIcon";

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
}

const EmptyState = ({ icon, title, description }: EmptyStateProps) => {
  return (
    <View className="bg-muted rounded-lg p-6 items-center">
      <ThemedIcon
        name={icon}
        size={48}
        library="fontawesome6"
        lightColor="#9CA3AF"
        darkColor="#6B7280"
      />
      <Text className="text-muted-foreground text-center mt-3 mb-2">
        {title}
      </Text>
      <Text className="text-muted-foreground text-center text-sm">
        {description}
      </Text>
    </View>
  );
};

export default EmptyState;
