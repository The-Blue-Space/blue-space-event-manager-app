import * as React from "react";
import classnames from "classnames";
import ErrorBoundary from "../error-boundary";

type MaximumProps = {
	children?: any;
	className?: string;
};
export default React.memo(function Maximum({ children, className }: MaximumProps) {
	const maximum = classnames("flex flex-col flex-1 md:max-w-4xl lg:max-w-7xl mx-auto", className);
	return (
		<div className={maximum}>
			<ErrorBoundary>{children}</ErrorBoundary>
		</div>
	);
});


