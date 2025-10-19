import AppButton from "@/components/app/app-button";
import AppDialog from "@/components/app/app-dialog";
import { Badge } from "@/components/ui/badge";
import ensureError from "@/lib/ensure-error";

import useActions from "@/store/actions";
import useAppSelector from "@/store/hooks";
import { Info } from "lucide-react";
import React from "react";
import { toast } from "sonner";

export default React.memo(function InfoDialog() {
	const [isLoading, setIsLoading] = React.useState(false);
	const { dialog } = useAppSelector("ui");
	const { ui } = useActions();

	const open = React.useMemo(() => dialog.show && dialog.type === "info_dialog", [dialog]);

	const close = React.useCallback(() => {
		ui.resetDialog();
	}, []);

	const handleProceed = async () => {
		try {
			setIsLoading(true);
			if (dialog.action) {
				await dialog.action();
			}
			close();
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
			title={dialog.data?.title ?? "Exit"}
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
						variant="black"
						className="rounded-lg text-neutral-base_white"
						onClick={handleProceed}
						isLoading={isLoading}
					>
						Proceed
					</AppButton>
				</div>
			}
		>
			<div className="flex flex-col gap-2 justify-center items-center text-center">
				<Badge className="justify-center items-center rounded-full shadow-none bg-primary-10 size-14">
					<Info className="size-10 text-primary-300" />
				</Badge>
				<span className="body-2 text-neutral-700">
					{dialog.data?.text ?(dialog.data?.text as string)?.split("\n").map((line, idx) => (
						<React.Fragment key={idx}>
							{line}
							<br />
						</React.Fragment>
					)): "Are you sure you want to exit?"}
				</span>
			</div>
		</AppDialog>
	);
});
