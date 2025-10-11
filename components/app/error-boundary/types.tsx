export type ErrorBoundaryState = {
	errorInfo: React.ErrorInfo;
	error: Error;
	hasError: boolean;
	showError: boolean;
};

export type ErrorBoundaryProps = {
	children?: any;
	user?: string;
};
