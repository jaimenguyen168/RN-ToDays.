import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import * as z from "zod";
import { ThemedIcon } from "@/components/ThemedIcon";
import AppButton from "@/components/AppButton";
import { images } from "@/constants/images";
import { useSignUp } from "@clerk/clerk-expo";

const signupSchema = z
  .object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SignupForm = z.infer<typeof signupSchema>;

const SignupView = () => {
  const router = useRouter();
  const { signUp, setActive, isLoaded } = useSignUp();

  const [form, setForm] = useState<SignupForm>({
    username: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof SignupForm, string>>
  >({});
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: keyof SignupForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    try {
      signupSchema.parse(form);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof SignupForm, string>> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0] as keyof SignupForm] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSignup = async () => {
    if (validateForm()) {
      setLoading(true);

      try {
        const result = await signUp?.create({
          username: form.username,
          password: form.password,
        });

        if (result?.status === "complete") {
          await setActive?.({ session: result.createdSessionId });
          router.push("/");
        }
      } catch (error: any) {
        Alert.alert("Error", error.errors[0]?.message || "Sign up failed");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleGoogleSignup = () => {
    console.log("Google signup pressed");
  };

  const handleAppleSignup = () => {
    console.log("Apple signup pressed");
  };

  const handleFacebookSignup = () => {
    console.log("Facebook signup pressed");
  };

  const handleSignIn = () => {
    router.back();
  };

  const disabled =
    loading || !isLoaded || form.username === "" || form.password === "";

  return (
    <View className="flex-1 bg-background px-10 py-20">
      {/* Header */}
      <View className="items-start mt-16 mb-20">
        <Text className="text-accent-foreground text-[36px] font-semibold">
          Sign Up
        </Text>
      </View>

      {/* Form Section */}
      <View className="flex-1 gap-8">
        {/* Username Input */}
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

        {/* Confirm Password Input */}
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
              placeholder="Confirm Password"
              placeholderTextColor="#9CA3AF"
              value={form.confirmPassword}
              onChangeText={(value) =>
                handleInputChange("confirmPassword", value)
              }
              secureTextEntry={!showConfirmPassword}
              className="flex-1 text-foreground font-light text-lg tracking-wider"
              autoCapitalize="none"
            />
            <TouchableOpacity
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <ThemedIcon
                name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
                size={20}
                lightColor="#64748B"
                darkColor="#94A3B8"
              />
            </TouchableOpacity>
          </View>
          {errors.confirmPassword && (
            <Text className="text-red-500 text-sm mt-1">
              {errors.confirmPassword}
            </Text>
          )}
        </View>

        {/* Create Button */}
        <View className="mt-12">
          <AppButton
            title="Create"
            onPress={handleSignup}
            disabled={disabled}
          />
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

        {/* Social Signup Buttons */}
        <View className="flex-row justify-center gap-6">
          {/* Google Button */}
          <TouchableOpacity
            onPress={handleGoogleSignup}
            className="w-14 h-14 rounded-full bg-background items-center justify-center border border-border"
          >
            <Image source={images.google} className="size-8" />
          </TouchableOpacity>

          {/* Apple Button */}
          <TouchableOpacity
            onPress={handleAppleSignup}
            className="w-14 h-14 rounded-full bg-background items-center justify-center border border-border pb-1"
          >
            <ThemedIcon name="apple" size={28} library="fontawesome6" />
          </TouchableOpacity>

          {/* Facebook Button */}
          <TouchableOpacity
            onPress={handleFacebookSignup}
            className="w-14 h-14 rounded-full bg-background items-center justify-center border border-border"
          >
            <Image source={images.facebook} className="size-8" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Sign In Link */}
      <View className="items-center mt-8">
        <View className="flex-row items-center">
          <Text className="text-muted-foreground">Have any account?</Text>
          <TouchableOpacity onPress={handleSignIn} className="ml-1">
            <Text className="text-accent-foreground font-semibold">
              Sign In
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default SignupView;
