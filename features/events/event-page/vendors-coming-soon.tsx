import { Store } from "lucide-react";
import { Pill } from "@/features/home/dashboard/ui";

/** Vendors are parked until the vendor app exists, so the tab only says what's coming. */
export default function VendorsComingSoon() {
	return (
		<div className="max-w-[1000px] pt-2">
			<section
				aria-labelledby="vendors-soon-title"
				className="flex flex-wrap items-center gap-x-8 gap-y-6 rounded-[14px] border border-auth-line bg-auth-page p-6 sm:p-10"
			>
				<span
					aria-hidden="true"
					className="grid size-16 shrink-0 place-items-center rounded-2xl border border-auth-line bg-white text-primary-500"
				>
					<Store className="size-7" strokeWidth={1.75} />
				</span>
				<div className="flex min-w-0 flex-[1_1_420px] flex-col items-start gap-2">
					<Pill tone="neutral">Coming soon</Pill>
					<h2 id="vendors-soon-title" className="text-[20px] font-bold text-auth-ink">
						Vendor booths
					</h2>
					<p className="max-w-[60ch] text-pretty text-[15px] leading-[1.55] text-auth-muted">
						Soon you’ll be able to offer booths at your events to vendors, like food stalls and merch tables. There’s nothing
						to set up here yet.
					</p>
				</div>
			</section>
		</div>
	);
}
