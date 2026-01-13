"use client";
import type React from "react";
import { useEffect, useRef } from "react";
import type { Root } from "react-dom/client";
import { createRoot } from "react-dom/client";
import { FlagsContext, type FlagsContextValue } from "./FlagsContext";
import Toolbar from "./Toolbar";
import toolbarCss from "./toolbar.css?inline";
import { attachShadowContainer, injectStyles } from "./utils/shadowDom";

interface ShadowToolbarProps {
	isVisible: boolean;
	onClose: () => void;
	flagsContext: FlagsContextValue;
	placement?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}

/**
 * Renders the toolbar in a Shadow DOM for style isolation
 */
export const ShadowToolbar: React.FC<ShadowToolbarProps> = ({
	isVisible,
	onClose,
	flagsContext,
	placement = "bottom-right",
}) => {
	const rootRef = useRef<Root | null>(null);
	const shadowRootRef = useRef<ShadowRoot | null>(null);

	useEffect(() => {
		const shadowRoot = attachShadowContainer(placement);
		shadowRootRef.current = shadowRoot;

		injectStyles(shadowRoot, toolbarCss);

		let container = shadowRoot.querySelector(".flags-toolbar-react-root");
		if (!container) {
			container = document.createElement("div");
			container.className = "flags-toolbar-react-root";
			shadowRoot.appendChild(container);
		}

		if (!rootRef.current) {
			rootRef.current = createRoot(container);
		}

		return () => {
			// Clean up the React root to prevent memory leaks.
			// This might cause a re-mount flicker if placement changes, but ensures
			// we don't leak roots or keep listeners active on unmounted components.
			if (rootRef.current) {
				setTimeout(() => {
					rootRef.current?.unmount();
					rootRef.current = null;
				}, 0);
			}
		};
	}, [placement]);

	useEffect(() => {
		if (rootRef.current && shadowRootRef.current) {
			rootRef.current.render(
				<FlagsContext.Provider value={flagsContext}>
					<Toolbar
						isVisible={isVisible}
						onClose={onClose}
						placement={placement}
					/>
				</FlagsContext.Provider>,
			);
		}
	}, [isVisible, onClose, flagsContext, placement]);

	// This component doesn't render anything in the normal React tree
	return null;
};

export default ShadowToolbar;
