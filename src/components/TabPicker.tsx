import React from "react";
import { View, TouchableOpacity, Text } from "react-native";

interface TabOption {
  value: string;
  label: string;
}

interface TabPickerProps {
  options: TabOption[];
  selectedValue: string;
  onSelect: (value: string) => void;
}

const TabPicker = ({ options, selectedValue, onSelect }: TabPickerProps) => {
  return (
    <View className="flex-row bg-card rounded-lg p-1">
      {options.map((option) => (
        <TouchableOpacity
          key={option.value}
          className={`flex-1 py-2 px-4 rounded-md ${
            selectedValue === option.value ? "bg-background" : ""
          }`}
          onPress={() => onSelect(option.value)}
        >
          <Text
            className={`text-center font-medium ${
              selectedValue === option.value
                ? "text-foreground"
                : "text-muted-foreground"
            }`}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

export default TabPicker;
