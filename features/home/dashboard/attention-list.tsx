import Link from "next/link";
import { FilePen, RotateCcw, Wallet, type LucideIcon } from "lucide-react";
import { HomeDashboard } from "@/types/home.types";
import { plural } from "./format";
import { IconCircle } from "./ui";

type Item = { key: string; icon: LucideIcon; title: string; detail: string; href: string; action: string };

const MAX_DRAFTS = 2;

export default function AttentionList({ attention }: { attention: HomeDashboard["attention"] }) {
	const items: Item[] = [];

	if (attention.pending_refunds > 0) {
		items.push({
			key: "refunds",
			icon: RotateCcw,
			title: `${plural(attention.pending_refunds, "refund request")} ${attention.pending_refunds === 1 ? "is" : "are"} waiting for you`,
			detail: "Approve or reject them on the Refunds page.",
			href: "/refunds",
			action: "Review refunds",
		});
	}
	for (const draft of attention.drafts.slice(0, MAX_DRAFTS)) {
		items.push({
			key: draft.id,
			icon: FilePen,
			title: `${draft.title} is still a draft`,
			detail: "Guests can't buy tickets until you publish it.",
			href: `/events/${draft.id}`,
			action: "Open draft",
		});
	}
	if (!attention.has_bank_account) {
		items.push({
			key: "bank",
			icon: Wallet,
			title: "Add a bank account",
			detail: "You'll need one to withdraw ticket money after each event.",
			href: "/finance",
			action: "Add bank account",
		});
	}

	if (!items.length) return null;

	return (
		<section aria-labelledby="attention" className="grid gap-2.5">
			<h2 id="attention" className="text-[15px] font-bold text-auth-ink">
				Needs your attention
			</h2>
			<ul className="divide-y divide-auth-line overflow-hidden rounded-xl border border-auth-line">
				{items.map(({ key, icon: Icon, title, detail, href, action }) => (
					<li key={key} className="flex flex-wrap items-center gap-x-3.5 gap-y-2 px-4 py-3.5">
						<IconCircle>
							<Icon className="size-[17px]" />
						</IconCircle>
						<div className="min-w-0 flex-1 basis-56">
							<p className="text-[14px] font-semibold text-auth-ink">{title}</p>
							<p className="mt-0.5 text-[13px] text-auth-muted">{detail}</p>
						</div>
						<Link href={href} className="ml-[48px] shrink-0 text-[14px] font-semibold text-auth-link hover:text-primary-500 sm:ml-0">
							{action}
						</Link>
					</li>
				))}
			</ul>
		</section>
	);
}
