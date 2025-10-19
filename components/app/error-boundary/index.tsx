"use client";
import type { ErrorBoundaryProps, ErrorBoundaryState } from "./types";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import * as React from "react";
import { variables } from "@/constants";

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
	state = {
		error: {} as Error,
		errorInfo: {} as React.ErrorInfo,
		hasError: false,
		showError: false,
	};

	componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
		// const sendData = {
		// 	source: "web",
		// 	message: error.message,
		// 	context: JSON.stringify(error),
		// 	userId: this.props.user ?? null,
		// 	isCritical: true,
		// };

		// axios.post(`/errors/`, sendData).catch(() => null);

		return this.setState({
			hasError: true,
			error: error,
			errorInfo: errorInfo,
			showError: false,
		});
	}

	render() {
		const handlePress = () => {
			this.setState({ hasError: false, showError: false });
		};
		const handleToggleError = () => {
			this.setState({ showError: !this.state.showError });
		};

		if (!this.state.hasError) return this.props.children;
		const mailTo = `mailto:${
			variables.SUPPORT_LINKS.support
		}?subject=Error Report&body=I'm experiencing an error on the app. Here's the error details: ${
			this.state.error && this.state.error.toString()
		}`;
		return (
			<div className="py-20 w-full">
				<div className="flex flex-col gap-1 justify-center items-center mx-auto w-fit">
					<AlertCircle name="bus-alert" className="size-20 text-primary-50" />
					<p className="text-xl">Oops....</p>
					<p className="text-lg">Something Went Wrong</p>
					<small className="text-sm text-neutral-600 text-center">
						Please try again later or{" "}
						<a href={mailTo} target="_blank" className="text-blue-500 underline">
							contact support
						</a>{" "}
						<br />
						if the problem persists.
					</small>

					{this.state.showError && (
						<div className="bg-muted p-2 rounded-md lg:max-w-96">
							<p className="text-sm break-words break-all">
								{this.state.error && this.state.error.toString()}
							</p>
						</div>
					)}
					<div className="flex flex-col gap-2">
						<Button
							type="button"
							onClick={handleToggleError}
							className="mt-2 bg-muted"
							variant="ghost"
						>
							{this.state.showError ? "Hide Error" : "Show Error"}
						</Button>
						<Button onClick={handlePress} className="mt-2">
							Retry
						</Button>
					</div>
				</div>
			</div>
		);
	}
}

export default ErrorBoundary;
