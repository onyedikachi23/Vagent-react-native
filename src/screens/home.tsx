/** @format */

import { cn } from "@/lib/utils";
import React from "react";
import Animated, {
	Easing,
	useAnimatedStyle,
	useSharedValue,
	withDelay,
	withRepeat,
	withSequence,
	withTiming,
} from "react-native-reanimated";

export const PulseCircle = ({
	index,
	className,
}: {
	index: number;
	className?: string;
}) => {
	const START_SCALE = 1;
	const START_OPACITY = 0.7;
	const TARGET_SCALE = 1.2;
	const TARGET_OPACITY = 0;
	const scale = useSharedValue(START_SCALE);
	const opacity = useSharedValue(START_OPACITY);

	const duration = 500;
	const delay = index * 300;
	const PAUSE_DURATION = 1500;

	React.useEffect(() => {
		scale.value = withDelay(
			delay,
			withRepeat(
				withSequence(
					// 1. Animate out (Scale start -> target)
					withTiming(TARGET_SCALE, {
						duration,
						easing: Easing.out(Easing.ease),
					}),
					// 2. Instant Reset (Scale 1.2 -> 1)
					withTiming(START_SCALE, { duration: 0 }),
					// 3. Pause (Hold at Scale start for PAUSE_DURATION)
					withDelay(
						PAUSE_DURATION,
						withTiming(START_SCALE, { duration: 0 }),
					),
				),
				-1,
				false,
			),
		);
		opacity.value = withDelay(
			delay,
			withRepeat(
				withSequence(
					// 1. Animate out (Opacity start -> target)
					withTiming(TARGET_OPACITY, {
						duration,
						easing: Easing.out(Easing.ease),
					}),
					// 2. Instant Reset (Opacity target -> start)
					withTiming(START_OPACITY, { duration: 0 }),
					// 3. Pause (Hold at Opacity start for PAUSE_DURATION)
					withDelay(
						PAUSE_DURATION,
						withTiming(START_OPACITY, { duration: 0 }),
					),
				),
				-1,
				false,
			),
		);
	}, [delay, opacity, scale]);

	const pulseStyle = useAnimatedStyle(() => {
		return {
			transform: [{ scale: scale.value }],
			opacity: opacity.value,
		};
	});

	return (
		<Animated.View
			className={cn("absolute inset-0 rounded-full", className)}
			style={pulseStyle}
		/>
	);
};
