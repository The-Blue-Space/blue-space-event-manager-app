import classNames from "classnames";
import "./spinner.css";
import * as React from "react";

export type LOADER_TYPE =
	| "simple"
	| "spinner"
	| "dots"
	| "bars"
	| "bars-dots"
	| "ring"
	| "polygon"
	| "custom";

type SpinnerProps = {
	load_type?: LOADER_TYPE;
	size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
	className?: string;
};

export default React.memo(function Spinner({ load_type = "simple", size = "sm",className }: SpinnerProps) {
	const cn = classNames(`${load_type}`, {
		"size-3": size === "xs",
		"size-5": size === "sm",
		"size-12": size === "md",
		"size-24": size === "lg",
		"size-32": size === "xl",
		"size-44": size === "2xl",
	},className);

	return <div className={cn} />;
});
