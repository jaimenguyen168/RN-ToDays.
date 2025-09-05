import { View, Text, TouchableOpacity } from "react-native";
import React from "react";

interface AppButtonProps {
  title: string;
  loadingTitle?: string;
  onPress: () => void;
  disabled?: boolean;
  isLoading?: boolean;
}

const AppButton = ({
  title,
  loadingTitle,
  onPress,
  disabled,
  isLoading,
}: AppButtonProps) => {
  return (
    <TouchableOpacity
      className={`py-4 rounded-2xl ${disabled ? "bg-primary-300" : "bg-primary-500"}`}
      onPress={onPress}
      disabled={disabled || isLoading}
    >
      <Text className="text-white text-center text-lg font-semibold">
        {isLoading ? loadingTitle : title}
      </Text>
    </TouchableOpacity>
  );
};
export default AppButton;
