/** @format */

import React from "react";
import * as SecureStore from "expo-secure-store";
import { useEffectEvent } from "@/hooks/use-effect-event";

interface AuthCredentials {
	sessionId: string;
	apiKey: string;
	webhookUrl: string;
	webhookAuth: string;
}

interface AuthCredentialsContextType {
	credentials: AuthCredentials | null;
	setCredentials: React.Dispatch<
		React.SetStateAction<AuthCredentials | null>
	>;
}

const AuthCredentialsContext = React.createContext<{
	credentials: AuthCredentials | null;
	setCredentials: React.Dispatch<
		React.SetStateAction<AuthCredentials | null>
	>;
} | null>(null);

const CREDENTIALS_STORAGE_KEY = "authCredentials";

const AuthCredentialsProvider = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	const [credentials, setCredentials_] =
		React.useState<AuthCredentials | null>(null);
	const setCredentials: AuthCredentialsContextType["setCredentials"] =
		React.useCallback((newCredentials) => {
			setCredentials_(newCredentials);
			if (newCredentials) {
				SecureStore.setItemAsync(
					CREDENTIALS_STORAGE_KEY,
					JSON.stringify(newCredentials),
				).catch(console.error);
			} else {
				SecureStore.deleteItemAsync(CREDENTIALS_STORAGE_KEY).catch(
					console.error,
				);
			}
		}, []);

	const onLoadCredentials = useEffectEvent(async () => {
		const storedCredentials = await SecureStore.getItemAsync(
			CREDENTIALS_STORAGE_KEY,
		);
		const hasOptimisticState = credentials !== null;
		if (storedCredentials && !hasOptimisticState) {
			setCredentials(JSON.parse(storedCredentials) as AuthCredentials);
		}
	});

	React.useEffect(() => {
		onLoadCredentials().catch(console.error);
	}, []);

	const ctx = React.useMemo(
		() => ({ credentials, setCredentials }),
		[credentials, setCredentials],
	);

	return (
		<AuthCredentialsContext value={ctx}>{children}</AuthCredentialsContext>
	);
};

const useAuthCredentials = () => {
	const context = React.use(AuthCredentialsContext);
	if (!context) {
		throw new Error(
			"useAuthCredentials must be used within an AuthCredentialsProvider",
		);
	}
	return context;
};

export { AuthCredentialsProvider, useAuthCredentials, type AuthCredentials };
