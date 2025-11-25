/** @format */

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { useEffectEvent } from "@/hooks/use-effect-event";
import { cn } from "@/lib/utils";
import { PulseCircle } from "@/screens/home";
import {
	AudioModule,
	RecordingPresets,
	setAudioModeAsync,
	useAudioRecorder,
} from "expo-audio";
import { Link, Stack } from "expo-router";
import { Mic, MoreVertical, Settings, Square } from "lucide-react-native";
import React from "react";
import { ActivityIndicator, Alert, FlatList, View } from "react-native";

const DATA = [
	{
		id: "1",
		text: "Hello, I'm kachi. Tell me things you can do. Tell me things that you can do. Hello, I'm kachi. Tell me things you can do. Tell me things that you can do. Hello, I'm kachi. Tell me things you can do. Tell me things that you can do.",
		from: "me",
	},
	{
		id: " 2",
		text: "Hello, I'm kachi. Tell me things you can do. Tell me things that you can do. Hello, I'm kachi. Tell me things you can do. Tell me things that you can do. Hello, I'm kachi. Tell me things you can do. Tell me things that you can do.",
		from: "them",
	},
	{
		id: "3",
		text: "Hello, I'm kachi. Tell me things you can do. Tell me things that you can do. Hello, I'm kachi. Tell me things you can do. Tell me things that you can do. Hello, I'm kachi. Tell me things you can do. Tell me things that you can do.",
		from: "me",
	},
	{
		id: "4",
		text: "Hello, I'm kachi. Tell me things you can do. Tell me things that you can do. Hello, I'm kachi. Tell me things you can do. Tell me things that you can do. Hello, I'm kachi. Tell me things you can do. Tell me things that you can do.",
		from: "them",
	},
];

const ModalButton = ({
	className,
	...props
}: React.ComponentProps<typeof Button>) => (
	<Button
		{...props}
		className={cn("aspect-square h-fit", className)}
		variant={"ghost"}
	/>
);

const ModalButtonIcon = (props: React.ComponentProps<typeof Icon>) => (
	<Icon size={32} {...props} />
);

const RecordButton = () => {
	const [recordingState, setRecordingState] = React.useState<
		"idle" | "starting" | "recording"
	>("idle");

	const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY!);
	// const recorderState = useAudioRecorderState(audioRecorder);

	const record = async () => {
		try {
			setRecordingState("starting");
			audioRecorder.record();
			setRecordingState("recording");
		} catch (error) {
			Alert.alert(
				"Error",
				error instanceof Error ? error.message : String(error),
			);
			setRecordingState("idle");
		}
	};

	const stopRecording = async () => {
		// The recording will be available on `audioRecorder.uri`.
		await audioRecorder.stop();
		setRecordingState("idle");
	};

	const onInitialLoad = useEffectEvent(async () => {
		try {
			const [status] = await Promise.all([
				AudioModule.requestRecordingPermissionsAsync(),
				audioRecorder.prepareToRecordAsync(),
			]);
			if (!status.granted) {
				throw new Error("Permission to access microphone was denied");
			}
			await setAudioModeAsync({
				playsInSilentMode: true,
				allowsRecording: true,
			});
		} catch (error) {
			Alert.alert(
				"Error",
				error instanceof Error ? error.message : String(error),
			);
		}
	});

	React.useEffect(() => {
		void onInitialLoad();
	}, []);

	return (
		<Button
			className="relative aspect-square h-fit self-center rounded-full bg-accent p-8 active:bg-accent/50"
			onPress={() => {
				if (recordingState === "idle") {
					void record();
					return;
				}
				if (recordingState === "recording") {
					void stopRecording();
				}
			}}>
			{recordingState === "idle" && <Icon as={Mic} size={40} />}

			{recordingState === "starting" && (
				<ActivityIndicator className="fill-foreground" size={40} />
			)}

			{recordingState === "recording" && (
				<>
					{Array.from({ length: 3 }).map((_, index) => (
						<PulseCircle
							// eslint-disable-next-line @eslint-react/no-array-index-key
							key={index}
							index={index}
							className="bg-accent"
						/>
					))}
					<Icon as={Square} className="fill-foreground" size={40} />
				</>
			)}
		</Button>
	);
};

export default function Home() {
	return (
		<>
			<Stack.Screen options={{ headerShown: false, title: "Chat" }} />
			<View className="flex-1">
				<FlatList
					data={DATA}
					contentContainerClassName="gap-4"
					keyExtractor={(item) => item.id}
					showsVerticalScrollIndicator={false}
					renderItem={({ item }) => (
						<Text
							className={cn(
								"max-w-[80%] rounded-2xl p-4",
								item.from === "me"
									? "self-end bg-primary"
									: "self-start bg-secondary",
							)}>
							{item.text}
						</Text>
					)}
				/>

				<View className="flex-row items-end justify-between p-4">
					<Link href="/settings" asChild>
						<ModalButton>
							<ModalButtonIcon as={Settings} />
						</ModalButton>
					</Link>

					<RecordButton />

					<ModalButton>
						<ModalButtonIcon as={MoreVertical} />
					</ModalButton>
				</View>
			</View>
		</>
	);
}
