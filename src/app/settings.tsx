/** @format */

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { Stack, useRouter } from "expo-router";
import React from "react";
import { Pressable, TouchableOpacity, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import Animated, {
	SharedValue,
	useAnimatedReaction,
	useAnimatedStyle,
	useDerivedValue,
	useSharedValue,
	withDelay,
	withSpring,
	withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

const BottomSheet = ({
	isOpen,
	toggleSheet,
	duration = 500,
	children,
	className,
}: {
	isOpen: SharedValue<boolean>;
	toggleSheet: () => void;
	duration?: number;
	children: React.ReactNode;
	className?: string;
}) => {
	const height = useSharedValue(0);
	const dragTranslateY = useSharedValue(0);
	const progress = useDerivedValue(() =>
		withTiming(isOpen.value ? 0 : 1, { duration }),
	);

	// When the sheet is opened, reset dragTranslateY to 0
	useAnimatedReaction(
		() => isOpen.value,
		(isOpenValue) => {
			if (isOpenValue) {
				dragTranslateY.value = 0;
			}
		},
	);

	const panGesture = Gesture.Pan()
		.onUpdate((event) => {
			// Only allow dragging down (positive Y)
			dragTranslateY.value = Math.max(0, event.translationY);
		})
		.onEnd((event) => {
			// If dragged past 30% threshold, close the sheet
			if (event.translationY > height.value * 0.3) {
				scheduleOnRN(toggleSheet);
			} else {
				// Snap back with spring animation
				dragTranslateY.value = withSpring(0);
			}
		});

	const sheetStyle = useAnimatedStyle(() => ({
		transform: [
			{
				translateY:
					progress.value * 2 * height.value + dragTranslateY.value,
			},
		],
	}));

	const backdropStyle = useAnimatedStyle(() => ({
		opacity: 1 - progress.value,
		zIndex: isOpen.value
			? 1
			: withDelay(duration, withTiming(-1, { duration: 0 })),
	}));

	return (
		<>
			<Animated.View
				className={"absolute inset-0 bg-black/30"}
				style={backdropStyle}>
				<TouchableOpacity className="flex-1" onPress={toggleSheet} />
			</Animated.View>
			<Animated.View
				onLayout={(e) => {
					height.value = e.nativeEvent.layout.height;
				}}
				className={cn(
					"absolute bottom-0 z-10 w-full rounded-tl-3xl rounded-tr-3xl bg-popover px-8 pb-4",
					className,
				)}
				style={[sheetStyle]}>
				<GestureDetector gesture={panGesture}>
					<Animated.View>
						<Pressable
							className="mx-auto my-3 h-1 w-10 rounded-full bg-popover-foreground"
							hitSlop={16}
						/>
					</Animated.View>
				</GestureDetector>
				{children}
			</Animated.View>
		</>
	);
};

const formConfigs = [
	{
		key: "apiKey",
		label: "OpenAI API Key",
	},
	{
		key: "webhookUrl",
		label: "Webhook URL",
	},
	{
		key: "webhookAuth",
		label: "Webhook Header Auth Value (Key: Authorization)",
	},
] satisfies { key: string; label: string }[];

export default function SettingsPage() {
	const isOpen = useSharedValue(false);
	React.useEffect(
		function openSheetAfterRender() {
			isOpen.value = true;
		},
		[isOpen],
	);

	const ANIMATION_DURATION = 500;
	const router = useRouter();
	const toggleSheet = () => {
		const wasOpen = isOpen.value;
		// eslint-disable-next-line react-hooks/immutability
		isOpen.value = !wasOpen;
		if (wasOpen) {
			setTimeout(() => {
				router.back();
			}, ANIMATION_DURATION);
		}
	};
	return (
		<>
			<Stack.Screen
				options={{
					title: "Settings",
					headerShown: false,
					contentStyle: { backgroundColor: "transparent" },
					presentation: "transparentModal",
					animation: "none",
				}}
			/>

			<BottomSheet
				isOpen={isOpen}
				toggleSheet={toggleSheet}
				duration={ANIMATION_DURATION}>
				<Text className="my-6 text-2xl font-medium">Settings</Text>

				<KeyboardAwareScrollView
					contentContainerClassName="flex-1 gap-4"
					extraKeyboardSpace={-65}>
					{formConfigs.map(({ key, label }) => {
						return (
							<View key={key} className="gap-2">
								<Label nativeID={`${key}-label`}>{label}</Label>
								<Input
									aria-labelledby={`${key}-label`}
									className="border-ring focus:border-2 focus:border-popover-foreground"
								/>
							</View>
						);
					})}
					<Button className="my-4">
						<Text>Save</Text>
					</Button>
				</KeyboardAwareScrollView>
			</BottomSheet>
		</>
	);
}
