"use client";
import { APIProvider } from "@vis.gl/react-google-maps";
import { Info } from "lucide-react";
import Field, { controlProps } from "@/components/app/field";
import RestoreBanner from "@/components/app/restore-banner";
import SaveStatus from "@/components/app/save-status";
import SelectField from "@/components/app/select-field";
import { TabsContent } from "@/components/ui/tabs";
import { variables } from "@/constants";
import SaveBar from "@/features/settings/save-bar";
import BasicsSection from "./basics-section";
import CoverField from "./cover-field";
import DateTimeField from "./date-time-field";
import GoodToKnowSection from "./good-to-know-section";
import { dayLabel, dayOf, longDuration, timeLabel } from "./lagos-time";
import PreviewCard from "./preview-card";
import useDetailsForm, { DetailsFormApi, DOOR_OFFSETS } from "./use-details-form";
import VenueSection from "./venue";
import { MapsHealthProvider } from "./venue/maps-health";

function doorLabel(minutes: number) {
	if (minutes === 0) return "When it starts";
	if (minutes === 60) return "1 hour before";
	if (minutes === 120) return "2 hours before";
	return `${minutes} minutes before`;
}

function DateTimeSection({ api }: { api: DetailsFormApi }) {
	const { form, set, setStart } = api;
	if (!form) return null;

	const endHint =
		form.start !== null && form.end !== null
			? `${dayOf(form.end) === dayOf(form.start) + 1 ? "Ends the next day, " : dayOf(form.end) > dayOf(form.start) + 1 ? `Ends ${dayLabel(dayOf(form.end))}, ` : ""}${longDuration(form.end - form.start)} after it starts.`
			: undefined;

	const offsets = [...DOOR_OFFSETS];
	if (form.doors !== "" && !offsets.includes(Number(form.doors))) {
		offsets.push(Number(form.doors));
		offsets.sort((a, b) => a - b);
	}
	const doorOptions = [
		{ value: "unset", label: "Not set" },
		...offsets.map((minutes) => ({
			value: String(minutes),
			label:
				form.start !== null ? `${doorLabel(minutes)} (${timeLabel(form.start - minutes * 60000)})` : doorLabel(minutes),
		})),
	];

	return (
		<section id="when" aria-labelledby="when-title" className="grid gap-5 border-b border-auth-line pb-8">
			<div>
				<h2 id="when-title" className="text-[16px] font-bold text-auth-ink">
					Date and time
				</h2>
				<p className="mt-1 text-[14px] text-auth-muted">All times are Lagos time (WAT).</p>
			</div>

			<Field id="event-starts" label="Starts">
				<DateTimeField
					{...controlProps("event-starts", {})}
					kind="start"
					value={form.start}
					onChange={setStart}
					placeholder="Pick a date and time"
				/>
			</Field>

			<Field id="event-ends" label="Ends" hint={endHint}>
				<DateTimeField
					{...controlProps("event-ends", { hint: endHint })}
					kind="end"
					start={form.start}
					value={form.end}
					onChange={(end) => set("end", end)}
					disabled={form.start === null}
					placeholder={form.start === null ? "Set when it starts first" : "Pick a date and time"}
				/>
			</Field>

			<Field id="event-doors" label="Doors open" optional>
				<SelectField
					{...controlProps("event-doors", {})}
					value={form.start === null ? "" : form.doors === "" ? "unset" : form.doors}
					options={doorOptions}
					onChange={(value) => set("doors", value === "unset" ? "" : value)}
					disabled={form.start === null}
					placeholder={form.start === null ? "Set when it starts first" : "Not set"}
				/>
			</Field>
		</section>
	);
}

function DetailsTab() {
	const api = useDetailsForm();
	const { form, event, published, dirty, isSaving, save, errorCount, attempted, coverUrl, pickCover, removeCover } =
		api;
	const { saving } = api;
	if (!form || !event) return null;

	return (
		<div className="flex flex-wrap items-start gap-x-16 gap-y-10 pt-2">
			<form
				onSubmit={save}
				{...saving.formProps}
				noValidate
				aria-label="Event details"
				className="grid min-w-0 max-w-[600px] flex-[999_1_460px] gap-8"
			>
				{saving.offer && (
					<RestoreBanner
						savedAt={saving.offer.savedAt}
						files={saving.offer.files}
						onRestore={saving.restore}
						onDiscard={saving.discard}
					/>
				)}

				{published && (
					<div role="note" className="flex gap-3 rounded-xl bg-auth-info-soft px-4 py-3.5 text-primary-500">
						<Info aria-hidden="true" className="mt-0.5 size-[18px] shrink-0" />
						<p className="text-[14px] leading-normal">
							It’s published, so guests see your changes as soon as you save. Blue Space doesn’t message them when the
							date or venue changes.
						</p>
					</div>
				)}

				<DateTimeSection api={api} />
				<VenueSection api={api} />

				<section id="cover" aria-labelledby="cover-title" className="grid gap-4 border-b border-auth-line pb-8">
					<div>
						<h2 id="cover-title" className="text-[16px] font-bold text-auth-ink">
							Cover image
						</h2>
						<p className="mt-1 text-[14px] text-auth-muted">The first thing guests see. 2100 × 900 px works best.</p>
					</div>
					<CoverField url={coverUrl} onPick={pickCover} onRemove={removeCover} />
				</section>

				<BasicsSection api={api} />
				<GoodToKnowSection api={api} />

				<div className="sticky bottom-0 z-10 -mt-2 border-t border-auth-line bg-white pb-6 pt-4">
					{published ? (
						<SaveBar
							dirty={dirty}
							isSaving={isSaving}
							savedAt={event.updated_at}
							errorCount={attempted ? errorCount : 0}
						/>
					) : (
						<SaveStatus status={saving.status} onRetry={() => void saving.retry()} />
					)}
				</div>
			</form>

			<PreviewCard
				form={form}
				coverUrl={coverUrl}
				className="min-w-0 max-w-[360px] flex-[1_1_300px] lg:sticky lg:top-6"
			/>
		</div>
	);
}

export default function BasicInfo() {
	return (
		<TabsContent value="basic-information" className="mt-5">
			<APIProvider apiKey={variables.GOOGLE_MAPS_API_KEY} region="NG">
				<MapsHealthProvider>
					<DetailsTab />
				</MapsHealthProvider>
			</APIProvider>
		</TabsContent>
	);
}
