import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { IconLibrary, ThemedIcon } from "@/components/ThemedIcon";

interface ActionButtonProps {
  onPress: () => void;
  icon: string;
  iconLibrary: IconLibrary;
  size: number;
  disabled?: boolean;
}

const ActionButton = ({
  onPress,
  icon,
  iconLibrary,
  size,
  disabled,
}: ActionButtonProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      className="p-2 rounded-xl bg-background"
      disabled={disabled}
      style={{
        shadowColor: "#8F99EB",
        shadowOffset: {
          width: 0,
          height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 3,
        elevation: 3,
      }}
    >
      <ThemedIcon name={icon as any} size={size} library={iconLibrary} />
    </TouchableOpacity>
  );
};

export default ActionButton;
