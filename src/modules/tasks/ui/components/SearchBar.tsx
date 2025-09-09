import { View, TextInput, TouchableOpacity } from "react-native";
import React from "react";
import { ThemedIcon } from "@/components/ThemedIcon";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

const SearchBar = ({
  value,
  onChangeText,
  placeholder = "Search for task",
  disabled = false,
}: SearchBarProps) => {
  return (
    <View className="flex-row items-center rounded-2xl px-4 h-14 gap-3 bg-muted">
      <ThemedIcon name="search" size={20} />
      <TextInput
        placeholder={placeholder}
        className={`flex-1 ${
          disabled ? "text-muted-foreground" : "text-foreground"
        }`}
        placeholderTextColor={disabled ? "#6B7280" : "#9CA3AF"}
        onChangeText={disabled ? undefined : onChangeText}
        value={value}
        editable={!disabled}
        pointerEvents={disabled ? "none" : "auto"}
      />
      {value.length > 0 && !disabled && (
        <TouchableOpacity onPress={() => onChangeText("")} className="p-1">
          <ThemedIcon name="xmark" size={16} library="fontawesome6" />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default SearchBar;
