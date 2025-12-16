import * as React from "react";
import LoadingBox from "./loading-box";
import ErrorBox from "./error-box";
import classNames from "classnames";
import { LOADER_TYPE } from "./spinner";
import ErrorBoundary from "./error-boundary";

type RenderProps = {
	children?: any;
	isError?: boolean;
	error?: unknown;
	loadingComponent?:
		| React.ReactNode
		| (() => React.ReactNode)
		| ((...args: any[]) => React.ReactNode);
	loadingComponentArgs?: any[];
	errorComponent?: React.ReactNode;
	isLoading?: boolean;
	roundedBg?: boolean;
	loadingPosition?: "top" | "center";
	loadingBoxClass?: string;
	loadType?: LOADER_TYPE;
	size?: "sm" | "md" | "lg";

};

export default React.memo(function Render(props: RenderProps) {
	const {
		children,
		isLoading = false,
		isError = false,
		error,
		errorComponent,
		loadingComponent,
		loadingPosition = "top",
		size = "md",
		roundedBg = false,
		loadingBoxClass,
		loadType = "spinner",
	} = props;

	const loadingBoxClx = classNames(loadingBoxClass, {
		"rounded-xl": roundedBg,
	});
	if (isLoading) {
		if (loadingComponent) {
			if (typeof loadingComponent === "function")
				return loadingComponent(...(props?.loadingComponentArgs ?? []));
			return loadingComponent;
		} else
			return (
				<LoadingBox
					classNames={loadingBoxClx}
					spinnerSize={size}
					position={loadingPosition}
					load_type={loadType}
				/>
			);
	}

	if (isError) {
		if (errorComponent) return errorComponent;
		else return <ErrorBox error={error} />;
	}

	return (
		<React.Fragment>
			<ErrorBoundary>{!isLoading && children}</ErrorBoundary>
		</React.Fragment>
	);
});
