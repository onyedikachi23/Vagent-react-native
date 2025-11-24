/** @format */

import { Text } from "@/components/ui/text";
import { Stack } from "expo-router";
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

	const toggleSheet = () => {
		isOpen.value = !isOpen.value;
	};
	return (
		<>
			<Stack.Screen options={{ title: "Settings", headerShown: false }} />
			<View className="relative flex-1 items-center justify-center">
				<BottomSheet isOpen={isOpen} toggleSheet={toggleSheet}>
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
				<Pressable
					className="rounded-lg bg-slate-500 p-3"
					onPress={toggleSheet}>
					<Text className="p-2 text-white">
						Toggle bottom sheetasdasdf
					</Text>
				</Pressable>
			</View>
		</>
	);
}
