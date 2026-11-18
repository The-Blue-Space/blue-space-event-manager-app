"use client";
import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { controlClass } from "@/components/app/field";
import { Toggle } from "@/features/events/manage-event/tabs/tickets/ui";
import ensureError from "@/lib/ensure-error";
import { AlbumSettings, saveAlbumSettings } from "@/services/album";

/** Who can add and save photos, how many each guest can add, and how full the album is. */
export default function SettingsCard({ eventId, settings, onSaved }: { eventId: string; settings: AlbumSettings; onSaved: () => void }) {
	const [perGuest, setPerGuest] = React.useState(String(settings.per_guest));
	const [saved, setSaved] = React.useState("");
	const [error, setError] = React.useState("");
	React.useEffect(() => setPerGuest(String(settings.per_guest)), [settings.per_guest]);

	const save = async (change: Parameters<typeof saveAlbumSettings>[1]) => {
		setError("");
		try {
			await saveAlbumSettings(eventId, change);
			setSaved("Saved");
			window.setTimeout(() => setSaved(""), 2000);
			onSaved();
		} catch (failure) {
			toast.error(ensureError(failure).message || "We couldn’t save that. Try again.");
		}
	};

	const savePerGuest = () => {
		const value = Number(perGuest);
		if (!Number.isInteger(value) || value < 1 || value > settings.limit) {
			setError(`Pick a number from 1 to ${settings.limit}.`);
			return;
		}
		if (value !== settings.per_guest) save({ per_guest: value });
	};

	const percent = settings.limit ? Math.min(100, Math.round((settings.used / settings.limit) * 100)) : 0;
	const switches: { key: "allow_guest_uploads" | "guests_can_save"; title: string; detail: string }[] = [
		{ key: "allow_guest_uploads", title: "Guests can add photos", detail: "From the Blue Space app, during and after the event." },
		{ key: "guests_can_save", title: "Guests can save photos", detail: "They can download photos and videos from the album." },
	];

	return (
		<section aria-labelledby="album-settings" className="grid gap-5 rounded-[14px] border border-auth-line bg-white p-5">
			<div className="flex items-baseline justify-between gap-3">
				<h2 id="album-settings" className="text-[16px] font-bold text-auth-ink">
					Album settings
				</h2>
				<span role="status" className="text-[13px] font-semibold text-auth-success">
					{saved}
				</span>
			</div>
			{switches.map((item) => (
				<div key={item.key} className="flex items-start justify-between gap-4">
					<div>
						<p id={`album-${item.key}`} className="text-[14px] font-bold text-auth-ink">
							{item.title}
						</p>
						<p className="text-[13px] text-auth-muted">{item.detail}</p>
					</div>
					<Toggle on={settings[item.key]} onChange={() => save({ [item.key]: !settings[item.key] })} labelledBy={`album-${item.key}`} />
				</div>
			))}
			<div className="grid gap-1.5 border-t border-auth-line pt-5">
				<label htmlFor="album-per-guest" className="text-[13px] font-semibold text-auth-ink">
					Photos and videos per guest
				</label>
				<input
					id="album-per-guest"
					inputMode="numeric"
					value={perGuest}
					onChange={(e) => setPerGuest(e.target.value.replace(/\D/g, "").slice(0, 2))}
					onBlur={savePerGuest}
					onKeyDown={(e) => e.key === "Enter" && savePerGuest()}
					aria-invalid={Boolean(error)}
					aria-describedby={error ? "album-per-guest-error" : undefined}
					className={controlClass(Boolean(error), "h-11")}
				/>
				{error && (
					<p id="album-per-guest-error" className="text-[13px] font-medium text-auth-error">
						{error}
					</p>
				)}
			</div>
			<div className="grid gap-1.5">
				<label htmlFor="album-limit" className="text-[13px] font-semibold text-auth-ink">
					Album limit
				</label>
				<input id="album-limit" value={settings.limit} disabled className={controlClass(false, "h-11")} />
				<div aria-hidden="true" className="mt-1 h-1.5 overflow-hidden rounded-full bg-auth-info-soft">
					<div className="h-full rounded-full bg-primary-500" style={{ width: `${percent}%` }} />
				</div>
				<p className="text-[13px] text-auth-muted">
					{settings.used} of {settings.limit} used. You can’t change the limit yet.
				</p>
			</div>
			<p className="text-[13px] text-auth-muted">
				New events start with your{" "}
				<Link href="/settings?tab=event-defaults" className="font-semibold text-auth-link hover:text-primary-500">
					event defaults
				</Link>
				.
			</p>
		</section>
	);
}
