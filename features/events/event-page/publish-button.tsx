"use client";
import { CalendarClock, ChevronDown, Send } from "lucide-react";
import AppButton from "@/components/app/app-button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

type PublishButtonProps = {
	stepsLeft: number;
	isBusy: boolean;
	onPublishNow: () => void;
	onPublishLater: () => void;
};

const itemClass = "flex cursor-pointer items-start gap-2.5 rounded-lg p-2.5 focus:bg-auth-page";

/** Publish, with a menu beside it for publishing now or at a time you pick. */
export default function PublishButton({ stepsLeft, isBusy, onPublishNow, onPublishLater }: PublishButtonProps) {
	const blocked = stepsLeft > 0 || isBusy;
	return (
		<div className="grid justify-items-end gap-1">
			<div className="flex overflow-hidden rounded-lg">
				<AppButton
					variant="primary"
					onClick={onPublishNow}
					disabled={blocked}
					isLoading={isBusy}
					className="h-11 min-w-[104px] rounded-none px-5 !text-[15px] font-semibold disabled:bg-[#8E8DB0] disabled:opacity-100"
				>
					Publish
				</AppButton>
				<DropdownMenu modal={false}>
					<DropdownMenuTrigger
						aria-label="More ways to publish"
						disabled={blocked}
						className="grid h-11 w-10 place-items-center border-l border-[#4B4A7A] bg-primary-500 text-white transition-colors duration-150 hover:bg-primary-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-auth-link disabled:bg-[#8E8DB0] data-[state=open]:bg-[#191837]"
					>
						<ChevronDown aria-hidden="true" className="size-[18px]" />
					</DropdownMenuTrigger>
					<DropdownMenuContent
						align="end"
						className="w-[280px] rounded-xl border-auth-line bg-white p-1.5 font-manrope text-auth-ink shadow-[0_16px_40px_-16px_rgba(25,24,55,0.35)]"
					>
						<DropdownMenuItem className={itemClass} onSelect={onPublishNow}>
							<Send aria-hidden="true" className="mt-0.5 size-[18px] shrink-0 text-auth-muted" />
							<span className="grid gap-0.5">
								<span className="text-[14px] font-semibold">Publish now</span>
								<span className="text-[12.5px] text-auth-muted">Guests can find it straight away.</span>
							</span>
						</DropdownMenuItem>
						<DropdownMenuItem className={itemClass} onSelect={onPublishLater}>
							<CalendarClock aria-hidden="true" className="mt-0.5 size-[18px] shrink-0 text-auth-muted" />
							<span className="grid gap-0.5">
								<span className="text-[14px] font-semibold">Publish later</span>
								<span className="text-[12.5px] text-auth-muted">Pick the day and time it goes live.</span>
							</span>
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
			<span className="text-[12px] text-auth-muted">{stepsLeft > 0 ? `${stepsLeft} ${stepsLeft === 1 ? "step" : "steps"} left` : "Ready to publish"}</span>
		</div>
	);
}
