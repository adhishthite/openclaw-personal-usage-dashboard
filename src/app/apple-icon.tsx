import { ImageResponse } from "next/og";

export const size = {
	width: 180,
	height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
	return new ImageResponse(
		(
			<div
				style={{
					width: "100%",
					height: "100%",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					borderRadius: "40px",
					background:
						"linear-gradient(135deg, rgb(14,165,233) 0%, rgb(15,118,110) 100%)",
				}}
			>
				<div
					style={{
						width: 104,
						height: 104,
						borderRadius: "999px",
						border: "12px solid rgba(248,250,252,0.92)",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						color: "#f8fafc",
						fontSize: 54,
						fontWeight: 800,
						fontFamily: "Arial, sans-serif",
						lineHeight: 1,
					}}
				>
					C
				</div>
			</div>
		),
		{
			...size,
		},
	);
}
