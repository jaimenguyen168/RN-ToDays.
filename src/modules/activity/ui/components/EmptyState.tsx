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
    <View className="bg-muted-accent rounded-2xl p-8 items-center">
      <ThemedIcon
        name={icon}
        size={48}
        lightColor="#5B67CA"
        darkColor="#F9FAFD"
        library="fontawesome6"
      />
      <Text className="text-accent-foreground text-center mt-4 font-semibold">
        {title}
      </Text>
      <Text className="text-muted-foreground text-center text-sm">
        {description}
      </Text>
    </View>
  );
};

export default EmptyState;
