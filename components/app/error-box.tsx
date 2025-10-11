import classnames from "classnames";
import * as React from "react";

type ErrorBoxProps = {
	error: unknown;
};

export default React.memo(function ErrorBox(props: ErrorBoxProps) {
	const [error, setError] = React.useState<Error | null>(null);
	const cn = classnames("w-full h-full flex items-center justify-center");

	React.useLayoutEffect(() => {
		if (!props.error) return;
		if (props.error instanceof Error) return setError(props.error);
		let msg = "[error cannot be stringified]";
		try {
			msg = JSON.stringify(props.error);
		} catch (err) {
			if (err) throw err;
		}
		const newError = new Error(`error thrown as is: ${msg}`);
		setError(newError);
	}, [props.error]);

	return (
		<div className={cn}>
			<h1>Error occurred: {error?.message}</h1>
		</div>
	);
});
