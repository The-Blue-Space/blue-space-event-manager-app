import Link from "next/link";
import { CloudOff, RefreshCw } from "lucide-react";

const block = "rounded-md bg-auth-info-soft";
const primaryAction =
	"inline-flex h-10 items-center gap-2 rounded-lg bg-primary-500 px-4 text-[14px] font-semibold text-white " +
	"transition-colors duration-150 hover:bg-primary-600 disabled:bg-[#8E8DB0]";

export function SettingsSkeleton() {
	return (
		<div aria-busy="true" className="flex flex-wrap items-start gap-x-16 gap-y-12 motion-safe:animate-pulse">
			<span className="sr-only">Loading your settings</span>
			<div className="grid min-w-0 max-w-[560px] flex-[999_1_420px] gap-6">
				<span className={`${block} h-4 w-28`} />
				{[0, 1, 2, 3].map((row) => (
					<div key={row} className="grid gap-2">
						<span className={`${block} h-3 w-32`} />
						<span className="h-11 rounded-lg border border-auth-info-soft" />
					</div>
				))}
			</div>
			<div className="hidden min-w-0 max-w-[380px] flex-[1_1_300px] overflow-hidden rounded-[14px] border border-auth-info-soft lg:block">
				<div className="aspect-[3/1] bg-auth-info-soft" />
				<div className="grid gap-3 p-5">
					<span className={`${block} h-4 w-40`} />
					<span className={`${block} h-3 w-24`} />
					<span className={`${block} h-3 w-full`} />
				</div>
			</div>
		</div>
	);
}

export function SettingsError({ onRetry, isRetrying }: { onRetry: () => void; isRetrying: boolean }) {
	return (
		<section
			role="alert"
			aria-labelledby="settings-error"
			className="grid justify-items-center gap-3.5 rounded-[14px] border border-auth-line px-6 py-12 text-center"
		>
			<span aria-hidden="true" className="grid size-12 place-items-center rounded-full bg-auth-info-soft text-primary-500">
				<CloudOff className="size-[22px]" />
			</span>
			<h2 id="settings-error" className="text-[20px] font-bold text-auth-ink">
				We couldn’t load your settings
			</h2>
			<p className="max-w-[46ch] text-[15px] leading-[1.55] text-auth-muted">
				Something went wrong while getting your organizer profile. This is usually temporary.
			</p>
			<button
				type="button"
				onClick={onRetry}
				disabled={isRetrying}
				className={`${primaryAction} mt-1.5`}
			>
				<RefreshCw aria-hidden="true" className={`size-4 ${isRetrying ? "motion-safe:animate-spin" : ""}`} />
				{isRetrying ? "Trying again…" : "Try again"}
			</button>
		</section>
	);
}

export function NoProfile() {
	return (
		<section aria-labelledby="no-profile" className="grid justify-items-start gap-2 rounded-[14px] border border-auth-line p-6">
			<h2 id="no-profile" className="text-[18px] font-bold text-auth-ink">
				Set up your organizer profile first
			</h2>
			<p className="text-[14px] text-auth-muted">Once it’s set up, you can change it here and choose your event defaults.</p>
			<Link href="/home" className={`${primaryAction} mt-2`}>
				Set up profile
			</Link>
		</section>
	);
}
