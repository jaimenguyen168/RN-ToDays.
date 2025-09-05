import { View, Text, TextInput, TouchableOpacity, Image } from "react-native";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import { ThemedIcon } from "@/components/ThemedIcon";
import AppButton from "@/components/AppButton";
import { images } from "@/constants/images";
import { z } from "zod";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

const LoginView = () => {
  const router = useRouter();
  const [form, setForm] = useState<LoginForm>({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof LoginForm, string>>
  >({});

  const handleInputChange = (field: keyof LoginForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    try {
      loginSchema.parse(form);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof LoginForm, string>> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as keyof LoginForm] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleLogin = () => {
    if (validateForm()) {
      console.log("Login data:", form);
      // Handle login logic here
    }
  };

  const handleGoogleLogin = () => {
    console.log("Google login pressed");
  };

  const handleAppleLogin = () => {
    console.log("Apple login pressed");
  };

  const handleFacebookLogin = () => {
    console.log("Facebook login pressed");
  };

  const handleForgotPassword = () => {
    console.log("Forgot password pressed");
  };

  const handleSignUp = () => {
    router.push("/signup");
  };

  return (
    <View className="flex-1 bg-background px-10 py-20">
      {/* Header */}
      <View className="items-start mt-16 mb-20">
        <Text className="text-accent-foreground text-[36px] font-semibold">
          Login
        </Text>
      </View>

      {/* Form Section */}
      <View className="flex-1 gap-8">
        {/* Email Input */}
        <View>
          <View className="flex-row items-center border-b border-border pb-3 gap-4">
            <ThemedIcon
              name="mail-outline"
              size={20}
              lightColor="#64748B"
              darkColor="#94A3B8"
            />
            <TextInput
              placeholder="Username"
              placeholderTextColor="#9CA3AF"
              value={form.username}
              onChangeText={(value) => handleInputChange("username", value)}
              className="flex-1 text-foreground font-light text-lg tracking-wider"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          {errors.username && (
            <Text className="text-red-500 text-sm mt-1">{errors.username}</Text>
          )}
        </View>

        {/* Password Input */}
        <View>
          <View className="flex-row items-center border-b border-border pb-3 gap-4">
            <ThemedIcon
              name="lock"
              size={20}
              library="feather"
              lightColor="#64748B"
              darkColor="#94A3B8"
            />
            <TextInput
              placeholder="Password"
              placeholderTextColor="#9CA3AF"
              value={form.password}
              onChangeText={(value) => handleInputChange("password", value)}
              secureTextEntry={!showPassword}
              className="flex-1 text-foreground font-light text-lg tracking-wider"
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <ThemedIcon
                name={showPassword ? "eye-outline" : "eye-off-outline"}
                size={20}
                lightColor="#64748B"
                darkColor="#94A3B8"
              />
            </TouchableOpacity>
          </View>
          {errors.password && (
            <Text className="text-red-500 text-sm mt-1">{errors.password}</Text>
          )}
        </View>

        {/* Forgot Password */}
        <View className="items-end">
          <TouchableOpacity onPress={handleForgotPassword}>
            <Text className="text-accent-foreground font-light">
              Forgot Password ?
            </Text>
          </TouchableOpacity>
        </View>

        {/* Login Button */}
        <View className="mt-8">
          <AppButton title="Login" onPress={handleLogin} />
        </View>

        {/* Divider */}
        <View className="items-center mt-8">
          <View className="flex-row items-center w-full">
            <View className="flex-1 h-px bg-border" />
            <Text className="mx-4 text-gray-400 dark:text-gray-500">
              or with
            </Text>
            <View className="flex-1 h-px bg-border" />
          </View>
        </View>

        {/* Social Login Buttons */}
        <View className="flex-row justify-center gap-6">
          {/* Google Button */}
          <TouchableOpacity
            onPress={handleGoogleLogin}
            className="w-14 h-14 rounded-full bg-background items-center justify-center border border-border"
          >
            <Image source={images.google} className="size-8" />
          </TouchableOpacity>

          {/* Apple Button */}
          <TouchableOpacity
            onPress={handleAppleLogin}
            className="w-14 h-14 rounded-full bg-background items-center justify-center border border-border pb-1"
          >
            <ThemedIcon name="apple" size={28} library="fontawesome6" />
          </TouchableOpacity>

          {/* Facebook Button */}
          <TouchableOpacity
            onPress={handleFacebookLogin}
            className="w-14 h-14 rounded-full bg-background items-center justify-center border border-border"
          >
            <Image source={images.facebook} className="size-8" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Sign Up Link */}
      <View className="items-center mt-8">
        <View className="flex-row items-center">
          <Text className="text-muted-foreground">Don't have an account?</Text>
          <TouchableOpacity onPress={handleSignUp} className="ml-1">
            <Text className="text-accent-foreground font-semibold">
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
export default LoginView;
