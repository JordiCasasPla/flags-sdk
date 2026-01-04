"use client"
import React, { createContext, useContext, useEffect, useState, useMemo } from "react";
import {
  FlagsClient,
  type FlagsContext as SDKContext,
  type RawFlags,
  type HttpClientOptions,
} from "@hauses/flags-core";

export interface FlagValues {}

export type FlagKey = keyof FlagValues extends never ? string : keyof FlagValues;

interface FlagsProviderProps {
  publishableKey: string;
  options?: HttpClientOptions;
  context?: SDKContext;
  children: React.ReactNode;
}

interface FlagsContextValue {
  flags: RawFlags;
  client: FlagsClient;
  isLoading: boolean;
}

const FlagsContext = createContext<FlagsContextValue | undefined>(undefined);

const flagsClients = new Map<string, FlagsClient>();

function useFlagsClient(
  publishableKey: string,
  options?: HttpClientOptions,
  context?: SDKContext
) {
  const isServer = typeof window === "undefined";

  if (isServer || !flagsClients.has(publishableKey)) {
    const client = new FlagsClient(publishableKey, context || {}, options);

    if (!isServer) {
      flagsClients.set(publishableKey, client);
    }
    return client;
  }

  const client = flagsClients.get(publishableKey)!;
  if (context) {
    client.setContext(context);
  }
  return client;
}

export const FlagsProvider: React.FC<FlagsProviderProps> = ({
  publishableKey,
  options,
  context = {},
  children,
}) => {
  const client = useFlagsClient(publishableKey, options, context);
  const [flags, setFlags] = useState<RawFlags>(client.getFlags());
  const [isLoading, setIsLoading] = useState(false);

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
  }, [context])

  const value = useMemo(
    () => ({
      flags,
      client,
      isLoading,
    }),
    [flags, client, isLoading]
  );

  return (
    <FlagsContext.Provider value={value}>{children}</FlagsContext.Provider>
  );
};

// should type flags key to be the current flags when do the cli will create a flags.d.ts with the flags keys
export const useFlags = (key: FlagKey) => {
  const context = useContext(FlagsContext);
  if (context === undefined) {
    throw new Error("useFlags must be used within a FlagsProvider");
  }

  useEffect(() => {
    if (!context.isLoading) {
      context.client.getFlag(key as string);
    }
  }, [key, context.client, context.isLoading]);

  if (context.isLoading) {
    return {
      isEnabled: false,
      isLoading: true,
    }
  }

  const flag = context.flags[key as string];

  return {
    isEnabled: flag ? flag.isEnabled : false,
    isLoading: false,
  };
};
