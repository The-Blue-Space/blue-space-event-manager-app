import * as React from "react";
import classnames from "classnames";
import { assets } from "@/constants";
import Image from "next/image";

type IconType = "default" | "event" | "analytics";
type EmptyDataProps = {
	title?: string;
	text?: string;
	lucideIcon?: React.ReactNode;
	icon?: string;
	iconType?: IconType;
	showIcon?: boolean;
	action?: React.ReactNode;
	className?: string;
	children?: React.ReactNode;
};
export default React.memo(function EmptyData({
	iconType = "default",
	showIcon = true,
	...props
}: EmptyDataProps) {
	const icons: Record<IconType, string> = {
		default: assets.empty_01,
		event: assets.empty_01,
		analytics: assets.empty_01,
	};
	const container = classnames(
		"w-full h-full flex col-span-full flex-col items-center justify-center gap-2",
		props.className
	);
	return (
		<div className={container}>
			{showIcon &&
				(props.lucideIcon ?? (
					<Image
						src={props.icon ?? icons[iconType]}
						alt="empty state illustration"
						width={96}
						height={96}
						className="size-24"
					/>
				))}
			{props.title && <h1 className="heading-7 text-neutral-900">{props.title}</h1>}
			<p className="text-center body-2 text-neutral-500 max-w-96">
				{props.text ?? "No Data available"}
			</p>
			<div className="">{props.children}</div>
			{props.action && props.action}
		</div>
	);
});
