/** @format */

import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { PulseCircle } from "@/screens/home";
import { Stack } from "expo-router";
import { Mic, MoreVertical, Settings } from "lucide-react-native";
import React from "react";
import { FlatList, View } from "react-native";

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
					<ModalButton>
						<ModalButtonIcon as={Settings} />
					</ModalButton>

					<Button className="relative aspect-square h-fit self-center rounded-full bg-accent p-8 active:bg-accent/50">
						{Array.from({ length: 3 }).map((_, index) => (
							<PulseCircle
								// eslint-disable-next-line @eslint-react/no-array-index-key
								key={index}
								index={index}
								className="bg-accent"
							/>
						))}

						<Icon as={Mic} size={52} />
					</Button>

					<ModalButton>
						<ModalButtonIcon as={MoreVertical} />
					</ModalButton>
				</View>
			</View>
		</>
	);
}
