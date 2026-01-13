import type React from "react";

interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
	checked: boolean;
	width?: number;
	height?: number;
}

const GUTTER = 1;

export const Switch: React.FC<SwitchProps> = ({
	checked,
	width = 24,
	height = 14,
	...props
}) => {
	return (
		<label className="flags-toolbar-switch" data-enabled={checked}>
			<input
				checked={checked}
				className="flags-toolbar-switch-input"
				name="enabled"
				type="checkbox"
				{...props}
			/>
			<div
				className="flags-toolbar-switch-track"
				style={{
					width: `${width}px`,
					height: `${height}px`,
					borderRadius: `${height}px`,
				}}
			>
				<div
					className="flags-toolbar-switch-dot"
					style={{
						width: `${height - GUTTER * 2}px`,
						height: `${height - GUTTER * 2}px`,
						transform: checked
							? `translateX(${width - (height - GUTTER * 2) - GUTTER}px)`
							: `translateX(${GUTTER}px)`,
						top: `${GUTTER}px`,
					}}
				/>
			</div>
		</label>
	);
};
