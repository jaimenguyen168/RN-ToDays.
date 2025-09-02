import { Text, TouchableOpacity, View, Image } from "react-native";
import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

interface TaskGroupCardProps {
  title: string;
  count: number;
  colors: any;
  icon?: string;
  image?: any;
  height?: number;
}

const TaskGroupCard = ({
  title,
  count,
  colors,
  icon,
  image,
  height,
}: TaskGroupCardProps) => (
  <TouchableOpacity
    className={`${height && `h-${height}`} rounded-3xl px-6 pt-6 pb-4 justify-between flex-1 overflow-hidden`}
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

    <View className="w-full">
      <View className="flex-row items-start justify-between gap-2">
        {icon && <FontAwesome6 name={icon} size={20} color="white" />}
        {image && (
          <Image source={image} className="size-20" resizeMode="cover" />
        )}
        <Ionicons name="arrow-forward" size={16} color="white" />
      </View>
    </View>

    <View className="mt-8">
      <Text className="text-primary-100 text-xl font-semibold">{title}</Text>
      <Text className="text-primary-100 font-medium opacity-90">
        {count} {count === 1 ? "Task" : "Tasks"}
      </Text>
    </View>
  </TouchableOpacity>
);

export default TaskGroupCard;
