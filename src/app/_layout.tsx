import { Slot } from "expo-router";
import "@/global.css";
import * as SplashScreen from "expo-splash-screen";
import { useFonts } from "expo-font";
import {
  HindSiliguri_300Light,
  HindSiliguri_400Regular,
  HindSiliguri_500Medium,
  HindSiliguri_600SemiBold,
  HindSiliguri_700Bold,
} from "@expo-google-fonts/hind-siliguri";
import { useEffect } from "react";
import { useColorScheme } from "react-native";
import { DarkTheme, DefaultTheme } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ThemeProvider } from "@react-navigation/core";
import { ConvexReactClient } from "convex/react";
import {
  ClerkProvider,
  ClerkLoaded,
  useAuth,
  useUser,
} from "@clerk/clerk-expo";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { MenuProvider } from "react-native-popup-menu";
import { KeyboardProvider } from "react-native-keyboard-controller";

SplashScreen.setOptions({
  duration: 1000,
  fade: true,
});

SplashScreen.preventAutoHideAsync();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;
const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, {
  unsavedChangesWarning: false,
});

const InitialLayout = function () {
  const user = useUser();

  const [fontsLoaded] = useFonts({
    HindSiliguri_300Light,
    HindSiliguri_400Regular,
    HindSiliguri_500Medium,
    HindSiliguri_600SemiBold,
    HindSiliguri_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hide();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return <Slot />;
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ClerkLoaded>
        <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
          <KeyboardProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <ThemeProvider
                value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
              >
                <MenuProvider>
                  <InitialLayout />
                </MenuProvider>
              </ThemeProvider>
            </GestureHandlerRootView>
          </KeyboardProvider>
        </ConvexProviderWithClerk>
      </ClerkLoaded>
    </ClerkProvider>
  );
}
