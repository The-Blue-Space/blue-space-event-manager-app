import Link from "next/link";
import { CloudOff, RefreshCw } from "lucide-react";

const block = "rounded-md bg-auth-info-soft";

export function DashboardSkeleton() {
	return (
		<div aria-busy="true" className="grid gap-8 motion-safe:animate-pulse">
			<span className="sr-only">Loading your dashboard</span>
			<div className="flex flex-wrap items-start gap-8">
				<div className="grid min-w-0 flex-[999_1_560px] gap-8">
					<div className="overflow-hidden rounded-[14px] border border-auth-info-soft">
						<div className="aspect-[3/1] bg-auth-info-soft" />
						<div className="grid gap-3 p-6">
							<span className={`${block} h-3 w-36`} />
							<span className={`${block} h-5 w-80 max-w-full`} />
							<span className={`${block} h-3 w-60`} />
							<span className={`${block} mt-2 h-2 w-full rounded-full`} />
						</div>
					</div>
					<div className="flex h-[168px] items-end gap-1 border-b border-auth-info-soft">
						{[30, 45, 25, 55, 40, 60, 35, 50, 70, 45, 30, 55, 65, 40, 50].map((height, index) => (
							<span key={index} className="flex-1 rounded-t bg-auth-page" style={{ height: `${height}%` }} />
						))}
					</div>
				</div>
				<div className="grid min-w-0 max-w-[360px] flex-[1_1_300px] gap-3.5">
					<span className={`${block} h-3.5 w-28`} />
					{[0, 1, 2].map((row) => (
						<div key={row} className="grid gap-2 border-t border-auth-info-soft py-3.5">
							<span className={`${block} h-3 w-24`} />
							<span className={`${block} h-6 w-36`} />
						</div>
					))}
					<span className="h-36 rounded-xl border border-auth-info-soft bg-auth-page" />
				</div>
			</div>
		</div>
	);
}

export function DashboardError({ onRetry, isRetrying }: { onRetry: () => void; isRetrying: boolean }) {
	return (
		<section
			role="alert"
			aria-labelledby="dashboard-error"
			className="grid justify-items-center gap-3.5 rounded-[14px] border border-auth-line px-6 py-12 text-center"
		>
			<span aria-hidden="true" className="grid size-12 place-items-center rounded-full bg-auth-info-soft text-primary-500">
				<CloudOff className="size-[22px]" />
			</span>
			<h2 id="dashboard-error" className="text-[20px] font-bold text-auth-ink">
				We couldn’t load your dashboard
			</h2>
			<p className="max-w-[46ch] text-[15px] leading-[1.55] text-auth-muted">
				Something went wrong while getting your events and sales. This is usually temporary.
			</p>
			<div className="mt-1.5 flex flex-wrap justify-center gap-2.5">
				<button
					type="button"
					onClick={onRetry}
					disabled={isRetrying}
					className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary-500 px-[18px] text-[14px] font-semibold text-white transition-colors duration-150 hover:bg-primary-600 disabled:bg-[#8E8DB0]"
				>
					<RefreshCw aria-hidden="true" className={`size-4 ${isRetrying ? "motion-safe:animate-spin" : ""}`} />
					{isRetrying ? "Trying again…" : "Try again"}
				</button>
				<Link
					href="/events"
					className="inline-flex h-10 items-center rounded-lg border border-auth-field px-4 text-[14px] font-semibold text-auth-ink transition-colors duration-150 hover:border-auth-field-hover"
				>
					Go to Events
				</Link>
			</div>
		</section>
	);
}
