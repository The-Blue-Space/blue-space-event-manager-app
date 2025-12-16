import Spinner, { LOADER_TYPE } from "./spinner";
import * as React from "react";
import classnames from "classnames";

type LoadingBoxProps = {
	type?: "screen" | "responsive";
	position?: "top" | "center";
	spinnerSize?: "sm" | "md" | "lg";
	classNames?: string;
	load_type?: LOADER_TYPE
};

export default React.memo(function LoadingBox(props: LoadingBoxProps) {
	const { position = "center", spinnerSize = "md", type = "responsive", load_type="spinner" } = props;
	const cn = classnames(
		"flex justify-center col-span-full",
		{
			"w-full h-full": type === "responsive",
			"w-full h-screen": type === "screen",
			"py-10": position === "top",
			"items-center": position === "center",
		},
		props.classNames
	);
	return (
		<div className={cn}>
			<Spinner size={spinnerSize}  load_type={load_type} />
		</div>
	);
});
