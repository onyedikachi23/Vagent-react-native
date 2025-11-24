/** @format */

import { Text } from "@/components/ui/text";
import { Stack, useRouter } from "expo-router";
import React from "react";
import { Pressable, TouchableOpacity, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
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
}: {
	isOpen: SharedValue<boolean>;
	toggleSheet: () => void;
	duration?: number;
	children: React.ReactNode;
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
				className={
					"absolute bottom-0 z-10 w-full items-center justify-center rounded-tl-3xl rounded-tr-3xl bg-popover px-8 pb-4"
				}
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

			<View className="relative flex-1 items-center justify-center bg-transparent">
				<BottomSheet
					isOpen={isOpen}
					toggleSheet={toggleSheet}
					duration={ANIMATION_DURATION}>
					<Text className="text-lg font-medium">
						This is the bottom sheet content.
					</Text>
					<Pressable
						className="rounded-lg bg-slate-500 p-3"
						onPress={toggleSheet}>
						<Text className="p-2 text-white">
							Toggle bottom sheetasdasdf
						</Text>
					</Pressable>
				</BottomSheet>
			</View>
		</>
	);
}
