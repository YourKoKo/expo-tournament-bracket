import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { PlatformColor, useColorScheme } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";

const RootLayout = () => {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen
            name="index"
            options={{
              title: "Tournament",
              headerTransparent: true,
              headerLargeTitle: true,
              headerBlurEffect: "regular",
              headerShadowVisible: true,
              headerLargeTitleShadowVisible: false,
              headerLargeStyle: {
                backgroundColor: PlatformColor(
                  "systemGroupedBackgroundColor"
                ) as unknown as string,
              },
              headerStyle: {
                backgroundColor:
                  colorScheme === "dark"
                    ? "rgba(0,0,0,0.1)"
                    : "rgba(255,255,255,0.1)",
              },
            }}
          />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </GestureHandlerRootView>
  );
};

export default RootLayout;
