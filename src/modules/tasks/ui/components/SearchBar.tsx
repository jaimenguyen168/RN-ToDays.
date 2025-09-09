import { View, TextInput, TouchableOpacity } from "react-native";
import React from "react";
import { ThemedIcon } from "@/components/ThemedIcon";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
}

const SearchBar = ({ value, onChangeText }: SearchBarProps) => {
  return (
    <View className="flex-row items-center bg-muted rounded-2xl px-4 h-14 gap-3">
      <ThemedIcon name="search" size={20} />
      <TextInput
        placeholder="Search for task"
        className="flex-1 text-foreground"
        placeholderTextColor="#9CA3AF"
        onChangeText={onChangeText}
        value={value}
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={() => onChangeText("")} className="p-1">
          <ThemedIcon name="xmark" size={16} library="fontawesome6" />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default SearchBar;
