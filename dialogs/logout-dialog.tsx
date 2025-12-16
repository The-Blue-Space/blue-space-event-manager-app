import AppButton from "@/components/app/app-button";
import AppDialog from "@/components/app/app-dialog";
import { useAuth } from "@/contexts/use-auth-gate";
import ensureError from "@/lib/ensure-error";

import useActions from "@/store/actions";
import useAppSelector from "@/store/hooks";

import * as React from "react";
import { toast } from "sonner";

export default React.memo(function LogoutDialog() {
	const { dialog } = useAppSelector("ui");

	const [isLoading, setIsLoading] = React.useState(false);

	const { logout: logoutAccount } = useAuth();

	const { ui } = useActions();

	const open = React.useMemo(() => {
		return (dialog.show && dialog.type === "logout") ?? false;
	}, [dialog.show, dialog.type]);

	const close = () => {
		if (isLoading) return;
		ui.resetDialog();
	};

	const logout = async () => {
		setIsLoading(true);
		try {
			await logoutAccount();
			ui.resetDialog();
		} catch (error) {
			const errMsg = ensureError(error).message;
			toast.error(errMsg);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<AppDialog
			open={open}
			onClose={close}
			title="Logout"
			footer={
				<div className="flex justify-between gap-5 [&_button]:w-full w-full">
					<AppButton
						variant="outline"
						className="rounded-lg text-neutral-700"
						onClick={close}
						disabled={isLoading}
					>
						Cancel
					</AppButton>

					<AppButton
						variant="destructive"
						className="rounded-lg text-neutral-base_white"
						onClick={logout}
						isLoading={isLoading}
					>
						Logout
					</AppButton>
				</div>
			}
		>
			<div className="text-center">
				<span className="caption-standard text-neutral-500">Are you sure you want to logout ?</span>
			</div>
		</AppDialog>
	);

	// return (
	// 	<PopupModal
	// 		handleClose={close}
	// 		open={open}
	// 		className="relative h-60 w-full space-y-5 rounded-xl py-8 lg:h-auto lg:w-[30%] lg:rounded-3xl"
	// 		showCloseBtn
	// 	>
	// 		<div className="text-center">
	// 			<h1 className="feature-accent text-neutral-1000">Logout</h1>
	// 			<span className="caption-standard text-neutral-500">Are you sure you want to logout ?</span>
	// 		</div>
	// <div className="flex justify-between gap-5 [&_button]:w-full">
	// 	<AppButton
	// 		variant="outline"
	// 		className="rounded-lg text-neutral-700"
	// 		onClick={close}
	// 		disabled={isLoading}
	// 	>
	// 		Cancel
	// 	</AppButton>

	// 	<AppButton
	// 		variant="destructive"
	// 		className="rounded-lg text-neutral-base_white"
	// 		onClick={logout}
	// 		isLoading={isLoading}
	// 	>
	// 		Logout
	// 	</AppButton>
	// </div>
	// 	</PopupModal>
	// );
});
