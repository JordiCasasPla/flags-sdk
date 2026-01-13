import { useFlags } from "react-sdk";
import viteLogo from "/vite.svg";
import reactLogo from "./assets/react.svg";
import "./App.css";

function App() {
	const { isEnabled: isNewFeatureEnabled, isLoading } = useFlags("test");

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
			<div className="card">
				{isLoading ? (
					<p>Loading flags...</p>
				) : (
					<p>
						New Feature Flag:{" "}
						<strong>
							{isNewFeatureEnabled ? "Enabled ✅" : "Disabled ❌"}
						</strong>
					</p>
				)}
			</div>
		</>
	);
}

export default App;
