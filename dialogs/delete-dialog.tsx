import AppButton from "@/components/app/app-button";
import AppDialog from "@/components/app/app-dialog";
import ensureError from "@/lib/ensure-error";

import useActions from "@/store/actions";
import useAppSelector from "@/store/hooks";
import * as React from "react";
import { toast } from "sonner";

export default React.memo(function DeleteBusinessTypeDialog() {
	const [isLoading, setIsLoading] = React.useState(false);
	const { dialog } = useAppSelector("ui");
	const { ui } = useActions();

	const open = React.useMemo(() => dialog.show && dialog.type === "delete_dialog", [dialog]);

	const data = React.useMemo(() => dialog.staticData, [dialog.staticData]);

	const close = React.useCallback(() => {
		ui.resetDialog();
	}, []);

	const handleDelete = async () => {
		try {
			setIsLoading(true);
			if (dialog.action) {
				await dialog.action();
			}
			if (data?.dismissAfterAction) {
				close();
			}
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
			showCloseButton={data?.showCloseButton}
			footer={
				<div className="flex justify-between gap-5 [&_button]:w-full w-full [&_button]:py-3">
					{data?.showDismissButton && (
						<AppButton
							variant={data?.dismissButtonVariant ?? "primary"}
							onClick={close}
							className="w-full text-primary-800"
						>
							{data?.dismissButtonText ?? "Okay"}
						</AppButton>
					)}
					{data?.showActionButton && (
						<AppButton
							variant={data?.actionButtonVariant ?? "primary"}
							onClick={handleDelete}
							className="w-full"
							isLoading={isLoading}
						>
							{data?.actionButtonText ?? "Proceed"}
						</AppButton>
					)}
				</div>
			}
		>
			<div className="flex flex-col gap-5 justify-center items-center py-3 text-center max-w-80 mx-auto">
				{/* <Badge className="justify-center items-center rounded-full shadow-none bg-primary-10 size-14">
					
					<AlertCircle className="size-10 text-red-500" />
				</Badge> */}

				{data?.customContent ? (
					data?.customContent
				) : (
					<>
						{data?.customTitle && data?.customTitle}

						{data?.showTitle && (
							<h1 className="font-bold heading-6 text-primary-800">{data?.title ?? "Delete"} </h1>
						)}
						{data?.customText && data?.customText}
						{data?.showText && (
							<p className="text-center body-2 text-neutral-500">
								{data?.text ?? "Are you sure you want to delete this?"}
							</p>
						)}
					</>
				)}
			</div>
		</AppDialog>
	);
});
