"use client";
import * as React from "react";
import classNames from "classnames";
import { Copy, EyeOff, Link2, MoreHorizontal, Trash2 } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ConfirmDialog from "@/components/app/confirm-dialog";
import useEventActions, { ActionableEvent, eventLink, whyNotDeletable } from "./use-event-actions";

type EventMenuProps = {
	event: ActionableEvent;
	/** "row" is the quiet button on a list row; "header" is the bordered one next to the page's main action. */
	variant?: "row" | "header";
	onDeleted?: () => void;
};

const itemClass =
	"flex min-h-9 cursor-pointer items-start gap-2.5 rounded-lg px-2.5 py-2 text-[14px] font-semibold text-auth-ink focus:bg-auth-page";

/** Copy event link, Duplicate, Unpublish and Delete, with Delete greyed out and explained when it isn't allowed. */
export default function EventMenu({ event, variant = "row", onDeleted }: EventMenuProps) {
	const actions = useEventActions({ onDeleted });
	const link = event.published ? eventLink(event.id) : "";
	// An ended event keeps its page for the album, so it can't be unpublished.
	const canUnpublish = event.published && event.status !== "ended";
	const deleteBlocked = whyNotDeletable(event);
	const [asking, setAsking] = React.useState<"delete" | "unpublish" | null>(null);

	return (
		<>
			<DropdownMenu modal={false}>
				<DropdownMenuTrigger
					aria-label={`More actions for ${event.title}`}
					className={classNames(
						"grid shrink-0 place-items-center rounded-lg text-auth-ink transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-auth-link",
						variant === "header"
							? "size-10 border border-auth-field bg-white hover:border-auth-field-hover data-[state=open]:border-auth-field-hover"
							: "size-9 text-auth-muted hover:bg-auth-page hover:text-auth-ink data-[state=open]:bg-auth-page",
					)}
				>
					<MoreHorizontal aria-hidden="true" className="size-[18px]" />
				</DropdownMenuTrigger>
				<DropdownMenuContent
					align="end"
					onClick={(e) => e.stopPropagation()}
					className="w-[264px] rounded-xl border-auth-line bg-white p-1.5 font-manrope text-auth-ink shadow-[0_16px_40px_-16px_rgba(25,24,55,0.35)]"
				>
					{link && (
						<DropdownMenuItem className={itemClass} onSelect={() => actions.copyLink(event)}>
							<Link2 aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-auth-muted" />
							Copy event link
						</DropdownMenuItem>
					)}
					<DropdownMenuItem className={itemClass} onSelect={() => actions.duplicate(event)}>
						<Copy aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-auth-muted" />
						Duplicate
					</DropdownMenuItem>
					{canUnpublish && (
						<DropdownMenuItem className={itemClass} onSelect={() => setAsking("unpublish")}>
							<EyeOff aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-auth-muted" />
							Unpublish
						</DropdownMenuItem>
					)}
					<DropdownMenuSeparator className="mx-1 my-1.5 bg-auth-line" />
					<DropdownMenuItem
						className={classNames(
							itemClass,
							deleteBlocked
								? "cursor-not-allowed text-auth-muted data-[disabled]:opacity-100"
								: "text-auth-error focus:text-auth-error",
						)}
						disabled={Boolean(deleteBlocked)}
						onSelect={() => setAsking("delete")}
					>
						<Trash2 aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
						<span className="grid gap-0.5">
							Delete
							{deleteBlocked && <span className="text-[12px] font-medium leading-snug text-auth-muted">{deleteBlocked}</span>}
						</span>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
			<ConfirmDialog
				open={asking === "delete"}
				onOpenChange={(open) => !open && setAsking(null)}
				title={`Delete ${event.title}?`}
				text="The draft goes for good, with its details, ticket types, agenda and the photos you uploaded. You can’t undo this."
				confirmLabel="Delete draft"
				icon={<Trash2 />}
				onConfirm={() => actions.remove(event)}
			/>
			<ConfirmDialog
				open={asking === "unpublish"}
				onOpenChange={(open) => !open && setAsking(null)}
				title={`Unpublish ${event.title}?`}
				text="Guests won’t be able to find it or buy tickets until you publish it again."
				confirmLabel="Unpublish"
				tone="primary"
				icon={<EyeOff />}
				onConfirm={() => actions.unpublish(event)}
			/>
		</>
	);
}
