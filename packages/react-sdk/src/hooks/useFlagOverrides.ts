"use client"
import {
  clearAllOverrides as clearAllOverridesCore,
  clearOverride as clearFlagOverrideCore,
  getAllOverrides as getAllOverridesCore,
  hasOverride as hasFlagOverrideCore,
  setOverride as setFlagOverrideCore,
} from "@hauses/flags-core";
import { useCallback, useEffect, useState } from "react";

export function useFlagOverrides() {
  const [overrides, setOverrides] = useState<Record<string, boolean>>(() => {
    return getAllOverridesCore();
  });

  useEffect(() => {
    // Sync overrides on mount and when storage changes
    const handleStorageChange = () => {
      setOverrides(getAllOverridesCore());
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const setOverride = useCallback((key: string, value: boolean) => {
    setFlagOverrideCore(key, value);
    setOverrides(getAllOverridesCore());
  }, []);

  const clearOverride = useCallback((key: string) => {
    clearFlagOverrideCore(key);
    setOverrides(getAllOverridesCore());
  }, []);

  const clearAllOverrides = useCallback(() => {
    clearAllOverridesCore();
    setOverrides({});
  }, []);

  const hasOverride = useCallback((key: string) => {
    return hasFlagOverrideCore(key);
  }, []);

  return {
    overrides,
    setOverride,
    clearOverride,
    clearAllOverrides,
    hasOverride,
  };
}
