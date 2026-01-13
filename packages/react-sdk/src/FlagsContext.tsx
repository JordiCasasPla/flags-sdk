"use client";
import {
	FlagsClient,
	type FlagsClientOptions,
	type RawFlags,
	type FlagsContext as SDKContext,
} from "@hauses/flags-core";
import type React from "react";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useToolbar } from "./hooks/useToolbar";
import { ShadowToolbar } from "./ShadowToolbar";

export type FlagValues = {};

export type FlagKey = keyof FlagValues extends never
	? string
	: keyof FlagValues;

interface FlagsProviderProps {
	publishableKey: string;
	options?: FlagsClientOptions;
	context?: SDKContext;
	children: React.ReactNode;
	toolbar?: boolean;
	dashboardUrl?: string;
	placement?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}

export interface FlagsContextValue {
	flags: RawFlags;
	client: FlagsClient;
	isLoading: boolean;
	dashboardUrl: string;
}

export const FlagsContext = createContext<FlagsContextValue | undefined>(
	undefined,
);

const flagsClients = new Map<string, FlagsClient>();

function useFlagsClient(
	publishableKey: string,
	options?: FlagsClientOptions,
	context?: SDKContext,
): FlagsClient {
	const isServer = typeof window === "undefined";

	if (isServer || !flagsClients.has(publishableKey)) {
		const client = new FlagsClient(publishableKey, context || {}, options);

		if (!isServer) {
			flagsClients.set(publishableKey, client);
		}
		return client;
	}

	const client = flagsClients.get(publishableKey);

	if (client && context) {
		client.setContext(context);
	}
	return client!;
}

export const FlagsProvider: React.FC<FlagsProviderProps> = ({
	publishableKey,
	options,
	context = {},
	children,
	toolbar = false,
	dashboardUrl = "https://app.flags.hauses.dev",
	placement = "bottom-right",
}) => {
	const client = useFlagsClient(publishableKey, options, context);
	const [flags, setFlags] = useState<RawFlags>(client.getFlags());
	const [isLoading, setIsLoading] = useState(false);
	const { isVisible, setVisible } = useToolbar(toolbar);

	useEffect(() => {
		if (toolbar) {
			setVisible(true);
		}
	}, [toolbar, setVisible]);

	useEffect(() => {
		if (client.isInitialized()) return;
		const init = async () => {
			try {
				setIsLoading(true);
				await client.initialize();
				setFlags(client.getFlags());
			} catch {
				console.error("Error initializing FlagsClient");
			} finally {
				setIsLoading(false);
			}
		};

		void init();
	}, [client]);

	useEffect(() => {
		void client.setContext(context);
	}, [context, client]);

	// Listen for override changes
	useEffect(() => {
		const handleStorageChange = () => {
			setFlags(client.getFlags());
		};

		// Custom event for same-tab override changes
		window.addEventListener("flags-override-changed", handleStorageChange);

		return () => {
			window.removeEventListener("flags-override-changed", handleStorageChange);
		};
	}, [client]);

	const value = useMemo(
		() => ({
			flags,
			client,
			isLoading,
			dashboardUrl,
		}),
		[flags, client, isLoading, dashboardUrl],
	);

	return (
		<FlagsContext.Provider value={value}>
			{children}
			<ShadowToolbar
				isVisible={isVisible}
				onClose={() => setVisible(false)}
				flagsContext={value}
				placement={placement}
			/>
		</FlagsContext.Provider>
	);
};

export const useFlags = (key: FlagKey) => {
	const context = useContext(FlagsContext);
	if (context === undefined) {
		throw new Error("useFlags must be used within a FlagsProvider");
	}

	if (context.isLoading) {
		return {
			isEnabled: false,
			isLoading: true,
		};
	}

	const flag = context.flags[key as string];

	return {
		isEnabled: flag ? flag.isEnabled : false,
		isLoading: false,
	};
};
