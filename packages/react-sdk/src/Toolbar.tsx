"use client";
import {
	autoUpdate,
	flip,
	offset,
	shift,
	useFloating,
} from "@floating-ui/react-dom";
import type React from "react";
import {
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import favicon from "./brand/favicon.png";
import { FlagsContext } from "./FlagsContext";
import { useFlagOverrides } from "./hooks/useFlagOverrides";
import { Switch } from "./Switch";

interface ToolbarProps {
	isVisible: boolean;
	onClose: () => void;
	placement?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}

export const Toolbar: React.FC<ToolbarProps> = ({
	isVisible,
	onClose,
	placement = "bottom-right",
}) => {
	const context = useContext(FlagsContext);
	const [isPanelOpen, setIsPanelOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");

	const {
		overrides,
		setOverride,
		clearOverride,
		hasOverride,
	} = useFlagOverrides();

	const { refs, floatingStyles } = useFloating({
		placement: placement.startsWith("top") ? "bottom-end" : "top-end",
		strategy: "absolute",
		middleware: [offset(8), flip({ padding: 10 }), shift({ padding: 10 })],
		whileElementsMounted: autoUpdate,
	});

	const handleToggleFlag = (flagKey: string) => {
		if (!context) return;
		if (hasOverride(flagKey)) {
			clearOverride(flagKey);
		} else {
			const currentValue = context.flags[flagKey]?.isEnabled ?? false;
			setOverride(flagKey, !currentValue);
		}
	};

	const handleHideToolbar = useCallback(() => {
		onClose();
		setIsPanelOpen(false);
	}, [onClose]);

	useEffect(() => {
		if (!isPanelOpen) return;
		const handleClickOutside = (e: MouseEvent) => {
			const composedPath = e.composedPath();
			const isInsidePanel =
				refs.floating.current instanceof Node &&
				composedPath.includes(refs.floating.current);
			const isInsideToggle =
				refs.reference.current instanceof Node &&
				composedPath.includes(refs.reference.current);

			if (!isInsidePanel && !isInsideToggle) {
				setIsPanelOpen(false);
			}
		};
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape") setIsPanelOpen(false);
		};
		// Note: Since we are in Shadow DOM, we need to listen for events inside the shadow root
		// or handle them via the shadow root's host. But document listeners still work
		// because events bubble up (unless stopped).
		document.addEventListener("mousedown", handleClickOutside);
		document.addEventListener("keydown", handleEscape);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			document.removeEventListener("keydown", handleEscape);
		};
	}, [isPanelOpen, refs]);
	const flagEntries = useMemo(
		() => (context ? Object.entries(context.flags) : []),
		[context],
	);
	const overrideCount = Object.keys(overrides).length;
	const hasAnyOverrides = overrideCount > 0;

	const filteredFlags = useMemo(() => {
		const query = searchQuery.toLowerCase().trim();
		const sorted = [...flagEntries].sort((a, b) => a[0].localeCompare(b[0]));

		if (!query) return sorted;

		return sorted
			.filter(([key]) => key.toLowerCase().includes(query))
			.sort((a, b) => {
				const aStarts = a[0].toLowerCase().startsWith(query);
				const bStarts = b[0].toLowerCase().startsWith(query);
				if (aStarts && !bStarts) return -1;
				if (bStarts && !aStarts) return 1;
				return a[0].localeCompare(b[0]);
			});
	}, [flagEntries, searchQuery]);

	if (!context || !isVisible) return null;

	const { dashboardUrl } = context;

	return (
		<div className="flags-toolbar-root">
			<button
				ref={refs.setReference}
				type="button"
				className="flags-toolbar-toggle"
				onClick={() => setIsPanelOpen(!isPanelOpen)}
				aria-label="Toggle feature flags"
				aria-expanded={isPanelOpen}
				aria-haspopup="dialog"
			>
				<div
					className={`flags-toolbar-indicator ${hasAnyOverrides ? "show" : ""}`}
				/>
				<img src={favicon} alt="" className="flags-toolbar-toggle-icon" />
			</button>

			{isPanelOpen && (
				<div
					ref={refs.setFloating}
					className="flags-toolbar-panel"
					style={floatingStyles}
					role="dialog"
					aria-modal="false"
					aria-label="Feature Flags Manager"
				>
					<div className="flags-toolbar-header">
						<input
							type="search"
							className="flags-toolbar-search"
							placeholder="Search flags"
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							aria-label="Search flags"
						/>
						<a
							href={dashboardUrl}
							target="_blank"
							rel="noreferrer"
							className="flags-toolbar-header-button"
							data-tooltip="Open dashboard"
							aria-label="Open dashboard"
						>
							<svg
								width="15"
								height="15"
								viewBox="0 0 24 24"
								fill="currentColor"
								aria-hidden="true"
							>
								<path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM9.71002 19.6674C8.74743 17.6259 8.15732 15.3742 8.02731 13H4.06189C4.458 16.1765 6.71639 18.7747 9.71002 19.6674ZM10.0307 13C10.1811 15.4388 10.8778 17.7297 12 19.752C13.1222 17.7297 13.8189 15.4388 13.9693 13H10.0307ZM19.9381 13H15.9727C15.8427 15.3742 15.2526 17.6259 14.29 19.6674C17.2836 18.7747 19.542 16.1765 19.9381 13ZM4.06189 11H8.02731C8.15732 8.62577 8.74743 6.37407 9.71002 4.33256C6.71639 5.22533 4.458 7.8235 4.06189 11ZM10.0307 11H13.9693C13.8189 8.56122 13.1222 6.27025 12 4.24799C10.8778 6.27025 10.1811 8.56122 10.0307 11ZM14.29 4.33256C15.2526 6.37407 15.8427 8.62577 15.9727 11H19.9381C19.542 7.8235 17.2836 5.22533 14.29 4.33256Z" />
							</svg>
						</a>
						<button
							className="flags-toolbar-header-button"
							onClick={handleHideToolbar}
							data-tooltip="Hide toolbar"
							type="button"
							aria-label="Hide toolbar"
						>
							<svg
								width="15"
								height="15"
								viewBox="0 0 24 24"
								fill="currentColor"
								aria-hidden="true"
							>
								<path d="M17.8827 19.2968C16.1814 20.3755 14.1638 21.0002 12.0003 21.0002C6.60812 21.0002 2.12215 17.1204 1.18164 12.0002C1.61832 9.62282 2.81932 7.5129 4.52047 5.93457L1.39366 2.80777L2.80788 1.39355L22.6069 21.1925L21.1927 22.6068L17.8827 19.2968ZM5.9356 7.3497C4.60673 8.56015 3.6378 10.1672 3.22278 12.0002C4.14022 16.0521 7.7646 19.0002 12.0003 19.0002C13.5997 19.0002 15.112 18.5798 16.4243 17.8384L14.396 15.8101C13.7023 16.2472 12.8808 16.5002 12.0003 16.5002C9.51498 16.5002 7.50026 14.4854 7.50026 12.0002C7.50026 11.1196 7.75317 10.2981 8.19031 9.60442L5.9356 7.3497ZM12.9139 14.328L9.67246 11.0866C9.5613 11.3696 9.50026 11.6777 9.50026 12.0002C9.50026 13.3809 10.6196 14.5002 12.0003 14.5002C12.3227 14.5002 12.6309 14.4391 12.9139 14.328ZM20.8068 16.5925L19.376 15.1617C20.0319 14.2268 20.5154 13.1586 20.7777 12.0002C19.8603 7.94818 16.2359 5.00016 12.0003 5.00016C11.1544 5.00016 10.3329 5.11773 9.55249 5.33818L7.97446 3.76015C9.22127 3.26959 10.5793 3.00016 12.0003 3.00016C17.3924 3.00016 21.8784 6.87992 22.8189 12.0002C22.5067 13.6998 21.8038 15.2628 20.8068 16.5925ZM11.7229 7.50857C11.8146 7.50299 11.9071 7.50016 12.0003 7.50016C14.4855 7.50016 16.5003 9.51488 16.5003 12.0002C16.5003 12.0933 16.4974 12.1858 16.4919 12.2775L11.7229 7.50857Z" />
							</svg>
						</button>
					</div>

					<div className="flags-toolbar-content">
						<table className="flags-toolbar-table">
							<tbody>
								{filteredFlags.map(([key, flag]) => {
									const isOverridden = hasOverride(key);
									const displayValue = isOverridden
										? (overrides[key] ?? false)
										: (flag as { isEnabled: boolean }).isEnabled;
									return (
										<tr key={key} className="flags-toolbar-row">
											<td className="flags-toolbar-cell-name">
												<a
													href={`${dashboardUrl}/flags/${key}`}
													target="_blank"
													rel="noreferrer"
													className="flags-toolbar-flag-link"
												>
													{key}
												</a>
											</td>
											<td className="flags-toolbar-cell-reset">
												<Switch
													checked={displayValue}
													onChange={() => handleToggleFlag(key)}
												/>
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
						{filteredFlags.length === 0 && (
							<div
								style={{
									padding: "12px",
									color: "var(--gray-500)",
									textAlign: "center",
								}}
							>
								No flags found
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
};

export default Toolbar;
