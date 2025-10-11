import { Toaster } from "sonner";

export default function AppToaster() {
	return (
		<Toaster
			// richColors
			position={"bottom-right"}
			visibleToasts={1}
			toastOptions={{
				classNames: {
					// error: "!text-error-500",
					// success: "!text-success-500",
				},
			}}
		/>
	);
}
