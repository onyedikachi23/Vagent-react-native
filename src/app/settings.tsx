/** @format */

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { Stack, useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React from "react";
import {
	ActivityIndicator,
	Pressable,
	TextInput,
	TouchableOpacity,
	View,
} from "react-native";
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

interface AuthCredentials {
	sessionId: string;
	apiKey: string;
	webhookUrl: string;
	webhookAuth: string;
}

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
] satisfies { key: keyof AuthCredentials; label: string }[];

const CREDENTIALS_STORAGE_KEY = "authCredentials";

export default function SettingsScreen() {
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
		isOpen.value = !wasOpen;
		if (wasOpen) {
			setTimeout(() => {
				router.back();
			}, ANIMATION_DURATION);
		}
	};

	const [form, setForm] = React.useState<AuthCredentials>({
		sessionId: "",
		apiKey: "",
		webhookUrl: "",
		webhookAuth: "",
	});
	const inputsRef = React.useRef<
		{ input: TextInput; key: keyof AuthCredentials }[]
	>([]);
	React.useEffect(() => {
		async function loadCredentials() {
			const sheetEnterPromise = new Promise<void>((resolve) =>
				// eslint-disable-next-line @eslint-react/web-api/no-leaked-timeout
				setTimeout(resolve, ANIMATION_DURATION),
			);
			const credentials = await SecureStore.getItemAsync(
				CREDENTIALS_STORAGE_KEY,
			);
			if (credentials) {
				const parsedCredentials = JSON.parse(
					credentials,
				) as AuthCredentials;

				// Populate input fields directly to avoid UI lag
				inputsRef.current.forEach(({ input, key }) => {
					input.setNativeProps({ text: parsedCredentials[key] });
				});

				await sheetEnterPromise; // Wait for the sheet to finish entering to avoid UI flickering
				setForm(parsedCredentials);
			}
		}
		loadCredentials().catch(console.error);
	}, []);

	const [isSaving, setIsSaving] = React.useState(false);
	const handleSaveCredentials = async () => {
		setIsSaving(true);
		try {
			await SecureStore.setItemAsync(
				CREDENTIALS_STORAGE_KEY,
				JSON.stringify(form),
			);
			toggleSheet();
		} catch (error) {
			console.error("Error saving credentials:", error);
		} finally {
			setIsSaving(false);
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
				<Text variant={"h1"} className="my-6 text-left">
					Settings
				</Text>

				<KeyboardAwareScrollView
					contentContainerClassName="flex-1 gap-4"
					extraKeyboardSpace={-65}>
					{formConfigs.map(({ key, label }, index, array) => {
						const isLast = index === array.length - 1;
						return (
							<View key={key} className="gap-2">
								<Label nativeID={`${key}-label`}>{label}</Label>
								<Input
									aria-labelledby={`${key}-label`}
									className="border-ring focus:border-2 focus:border-popover-foreground"
									ref={(input) => {
										if (input) {
											inputsRef.current[index] = {
												input,
												key,
											};
										}
										return () => {
											inputsRef.current =
												inputsRef.current.filter(
													(ref) => ref.key !== key,
												);
										};
									}}
									value={form[key]}
									onChangeText={(value) => {
										setForm((prev) => ({
											...prev,
											[key]: value,
										}));
									}}
									onSubmitEditing={() => {
										if (isLast) {
											void handleSaveCredentials();
											return;
										}

										inputsRef.current[
											index + 1
										]?.input.focus();
									}}
									submitBehavior={
										isLast ? "blurAndSubmit" : "submit"
									}
									returnKeyType={isLast ? "done" : "next"}
								/>
							</View>
						);
					})}
					<Button
						className="my-4"
						onPress={() => void handleSaveCredentials()}
						disabled={isSaving}>
						{isSaving ? (
							<>
								<Text>Saving</Text>

								<ActivityIndicator className="text-foreground" />
							</>
						) : (
							<Text>Save</Text>
						)}
					</Button>
				</KeyboardAwareScrollView>
			</BottomSheet>
		</>
	);
}
