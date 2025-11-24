/** @format */

import "@/global.css";

import { NAV_THEME } from "@/lib/theme";
import { ThemeProvider } from "@react-navigation/native";
import { PortalHost } from "@rn-primitives/portal";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useColorScheme } from "nativewind";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaView } from "react-native-safe-area-context";

export {
	// Catch any errors thrown by the Layout component.
	ErrorBoundary,
} from "expo-router";

export default function RootLayout() {
	const { colorScheme } = useColorScheme();

	return (
		<ThemeProvider value={NAV_THEME[colorScheme ?? "light"]}>
			<StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
			<SafeAreaView className="flex-1 bg-background">
				<GestureHandlerRootView>
					<Stack />
				</GestureHandlerRootView>
			</SafeAreaView>

			<PortalHost />
		</ThemeProvider>
	);
}
