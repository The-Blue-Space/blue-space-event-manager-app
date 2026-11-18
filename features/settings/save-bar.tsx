import classNames from "classnames";
import AppButton from "@/components/app/app-button";
import { formatDayMonth, formatTime } from "@/features/home/dashboard/format";

type SaveBarProps = {
	dirty: boolean;
	isSaving: boolean;
	savedAt: string;
	/** After a save attempt, how many fields still need fixing. */
	errorCount?: number;
};

export default function SaveBar({ dirty, isSaving, savedAt, errorCount = 0 }: SaveBarProps) {
	return (
		<div className="flex flex-col gap-2.5 pt-1.5 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4 sm:gap-y-3 sm:pt-0">
			<AppButton
				type="submit"
				variant="primary"
				isLoading={isSaving}
				disabled={!dirty}
				className="h-12 w-full px-5 !text-[15px] font-semibold disabled:bg-[#8E8DB0] disabled:opacity-100 sm:h-11 sm:w-auto"
			>
				Save changes
			</AppButton>
			<p
				aria-live="polite"
				className={classNames(
					"text-center text-[13px] leading-[1.45] sm:text-left",
					errorCount ? "text-auth-error" : "text-auth-muted"
				)}
			>
				{errorCount
					? `Fix ${errorCount} ${errorCount === 1 ? "thing" : "things"} above to save.`
					: dirty
						? "You have unsaved changes."
						: `Last saved ${formatDayMonth(savedAt)} at ${formatTime(savedAt)}.`}
			</p>
		</div>
	);
}
