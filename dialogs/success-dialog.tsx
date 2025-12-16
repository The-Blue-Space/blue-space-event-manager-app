import AppButton from "@/components/app/app-button";
import AppDialog from "@/components/app/app-dialog";
import { assets } from "@/constants";
import useActions from "@/store/actions";
import useAppSelector from "@/store/hooks";
import Image from "next/image";
import * as React from "react";

export default React.memo(function SuccessDialog() {
	const { dialog } = useAppSelector("ui");
	const { ui } = useActions();
	const open = React.useMemo(() => {
		return dialog.show && dialog.type === "success";
	}, [dialog.show, dialog.type]);

	const data = React.useMemo(() => dialog.staticData, [dialog.staticData]);

	const close = React.useCallback(() => {
		if (!data?.allowDismiss) return;
		if (dialog.dismiss) {
			dialog.dismiss();
		}
		ui.resetDialog();
	}, [dialog.dismiss, data?.allowDismiss]);

	const action = async () => {
		if (!dialog.action) return;
		try {
			await dialog.action();
		} catch (error) {
			throw error;
		}
	};

	return (
		<AppDialog
			open={open}
			onClose={close}
			showCloseButton={data?.showCloseButton ?? true}
			footer={
				<div className="flex gap-5 justify-between w-full">
					{data?.showDismissButton && (
						<AppButton
							variant={data?.dismissButtonVariant ?? "primary"}
							onClick={close}
							className="w-full"
						>
							{data?.dismissButtonText ?? "Okay"}
						</AppButton>
					)}
					{data?.showActionButton && (
						<AppButton
							variant={data?.actionButtonVariant ?? "primary"}
							onClick={action}
							className="w-full"
						>
							{data?.actionButtonText ?? "Proceed"}
						</AppButton>
					)}
				</div>
			}
			containerClassName="gap-2 h-96 w-96 pt-0"
		>
			<div className="flex flex-col gap-0 items-center min-h-40">
				<Image src={assets.temp_image_01} alt="success-badge" className="size-52" />

				<div className="text-center pb-5">
					{data?.customContent ? (
						data?.customContent
					) : (
						<>
							{data?.customTitle && data?.customTitle}
							{data?.showTitle && (
								<h1 className="font-bold heading-6 text-primary-800">
									{data?.title ?? "Successful"}{" "}
								</h1>
							)}
							{data?.customText && data?.customText}
							{data?.showText && (
								<p className="text-center body-2 text-neutral-500">{data?.text ?? "success"}</p>
							)}
						</>
					)}
				</div>
			</div>
		</AppDialog>
	);
});
