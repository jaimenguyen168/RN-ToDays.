import { View, Text, Image } from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import AppButton from "@/components/AppButton";
import { images } from "@/constants/images";

const WelcomeView = () => {
  const router = useRouter();

  return (
    <View className="flex-1 bg-background px-8 justify-center items-center gap-16 py-20">
      <View className="size-80 items-center justify-center mt-16">
        <Image source={images.welcome} className="w-full h-full" />
      </View>

      <View className="items-center justify-center flex-1 gap-4">
        <Text className="text-accent-foreground text-[36px] font-bold">
          To-Days<Text className="text-orange-400">.</Text>
        </Text>

        <View className="items-center px-4">
          <Text className="text-foreground text-center leading-6">
            Plan what you will do to be more organized for today, tomorrow and
            beyond
          </Text>
        </View>
      </View>

      {/* Bottom Buttons */}
      <View className="gap-4 w-full">
        {/* Login Button */}
        <AppButton title="Get Started" onPress={() => router.push("/login")} />
      </View>
    </View>
  );
};
export default WelcomeView;
