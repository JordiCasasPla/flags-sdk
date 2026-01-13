import { useEffect } from 'react'
import { useFlagOverrides, useFlags, useToolbar } from "react-sdk";
import viteLogo from "/vite.svg";
import reactLogo from "./assets/react.svg";
import "./App.css";

function App() {
	const { isEnabled: showToolbarFlag } = useFlags("show-toolbar");
	const { isEnabled: isNewFeatureEnabled, isLoading } = useFlags("test");
	const { setVisible } = useToolbar(showToolbarFlag);
	const { overrides } = useFlagOverrides();

	useEffect(() => {
		setVisible(showToolbarFlag)
	}, [showToolbarFlag, setVisible])

	return (
		<>
			<div>
				<a href="https://vite.dev" target="_blank" rel="noopener">
					<img src={viteLogo} className="logo" alt="Vite logo" />
				</a>
				<a href="https://react.dev" target="_blank" rel="noopener">
					<img src={reactLogo} className="logo react" alt="React logo" />
				</a>
			</div>
			<h1>Feature Flags Toolbar Demo</h1>
			<div className="card">
				{isLoading ? (
					<p>Loading flags...</p>
				) : (
					<>
						<p>
							New Feature Flag:{" "}
							<strong>
								{isNewFeatureEnabled ? "Enabled ✅" : "Disabled ❌"}
							</strong>
						</p>
						<p>
							Show Toolbar (Flag):{" "}
							<strong>
								{showToolbarFlag ? "Enabled ✅" : "Disabled ❌"}
							</strong>
						</p>
						<p style={{ fontSize: "14px", color: "#666" }}>
							Active Overrides: {Object.keys(overrides).length}
						</p>
					</>
				)}
			</div>
		</>
	);
}

export default App;
