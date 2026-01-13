"use client"
import { useCallback, useEffect, useState } from "react";

const TOOLBAR_STORAGE_KEY = "flags-sdk-toolbar";

/**
 * Check if toolbar should be enabled based on multiple activation methods
 * Priority: URL param > sessionStorage
 */
function checkToolbarEnabled(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  // Check URL param
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get("flags-toolbar") === "true") {
    return true;
  }

  // If explicitly hidden by user, return false
  if (window.sessionStorage?.getItem("flags-toolbar-hidden") === "true") {
    return false;
  }

  // Check if explicitly enabled by session
  if (window.sessionStorage?.getItem(TOOLBAR_STORAGE_KEY) === "true") {
    return true;
  }

  return false;
}

export function useToolbar(enabledByProp: boolean = false) {
  const [isVisible, setIsVisible] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    // Initial state: storage OR URL
    return checkToolbarEnabled();
  });

  // Sync with prop changes: if prop is true, it overrides local state to show
  // but if prop is false, we still respect checkToolbarEnabled() (URL/Session)
  useEffect(() => {
    if (enabledByProp) {
      setIsVisible(true);
    }
  }, [enabledByProp]);

  /*
   * Listen for changes from other components (e.g. App component toggling toolbar)
   */
  useEffect(() => {
    const handleStorageChange = () => {
      setIsVisible(checkToolbarEnabled());
    };

    window.addEventListener("flags-toolbar-changed", handleStorageChange);
    return () => {
      window.removeEventListener("flags-toolbar-changed", handleStorageChange);
    };
  }, []);

  const toggle = useCallback(() => {
    setIsVisible((prev) => {
      const newValue = !prev;
      if (typeof window !== "undefined") {
        if (newValue) {
          sessionStorage.setItem(TOOLBAR_STORAGE_KEY, "true");
          sessionStorage.removeItem("flags-toolbar-hidden");
        } else {
          sessionStorage.setItem("flags-toolbar-hidden", "true");
          sessionStorage.removeItem(TOOLBAR_STORAGE_KEY);
        }
        window.dispatchEvent(new Event("flags-toolbar-changed"));
      }
      return newValue;
    });
  }, []);

  const setVisible = useCallback((value: boolean) => {
    setIsVisible(value);
    if (typeof window !== "undefined") {
      if (value) {
        sessionStorage.setItem(TOOLBAR_STORAGE_KEY, "true");
        sessionStorage.removeItem("flags-toolbar-hidden");
      } else {
        sessionStorage.setItem("flags-toolbar-hidden", "true");
        sessionStorage.removeItem(TOOLBAR_STORAGE_KEY);
      }
      window.dispatchEvent(new Event("flags-toolbar-changed"));
    }
  }, []);

  return {
    isVisible: enabledByProp || isVisible,
    toggle,
    setVisible,
  };
}
