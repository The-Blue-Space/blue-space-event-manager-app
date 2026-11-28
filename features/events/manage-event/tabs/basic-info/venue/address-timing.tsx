"use client";
import { Info } from "lucide-react";
import ChoiceCards from "@/components/app/choice-cards";
import Field, { controlProps } from "@/components/app/field";
import SelectField from "@/components/app/select-field";
import { DetailsFormApi } from "../use-details-form";
import { dayLabel, dayOf, timeLabel } from "../lagos-time";

type Timing = "now" | "later" | "tba";

const CHOICES: { value: Timing; title: string; detail: string }[] = [
	{ value: "now", title: "Straight away", detail: "On the event page as soon as it’s published." },
	{ value: "later", title: "Closer to the day", detail: "Hidden until a time you pick." },
	{ value: "tba", title: "Not decided yet", detail: "Shows “Venue to be announced”. Add it when you have it." },
];

const REVEAL_OPTIONS = [
	{ value: "60", label: "1 hour before it starts" },
	{ value: "180", label: "3 hours before it starts" },
	{ value: "1440", label: "1 day before it starts" },
];

/** When guests can see the address: straight away, closer to the day, or not decided yet. */
export default function AddressTiming({ api }: { api: DetailsFormApi }) {
	const { form, patch } = api;
	if (!form) return null;

	const timing: Timing = form.placeTBA ? "tba" : form.revealMinutes ? "later" : "now";
	const choose = (next: Timing) =>
		patch({ placeTBA: next === "tba", revealMinutes: next === "later" ? form.revealMinutes || "180" : "" });
	const shownAt = form.start !== null && form.revealMinutes ? form.start - Number(form.revealMinutes) * 60000 : null;
	const note =
		timing === "tba"
			? "Guests see “Venue to be announced”."
			: timing === "later" && shownAt !== null
				? `Until then guests see “Address shared ${dayLabel(dayOf(shownAt))} at ${timeLabel(shownAt)}”.`
				: "";

	return (
		<div className="grid gap-4">
			<ChoiceCards name="address-timing" legend="When can guests see the address?" value={timing} choices={CHOICES} onChange={choose} className="sm:grid-cols-3" />
			{timing === "later" && (
				<Field id="address-reveal" label="Show it">
					<SelectField
						{...controlProps("address-reveal", {})}
						value={form.revealMinutes}
						options={REVEAL_OPTIONS}
						onChange={(value) => patch({ revealMinutes: value })}
						placeholder="Pick when"
					/>
				</Field>
			)}
			{note && (
				<p className="flex gap-2.5 rounded-[10px] bg-auth-info-soft px-3.5 py-3 text-[13.5px] leading-[1.5] text-primary-500">
					<Info aria-hidden="true" className="mt-0.5 size-[18px] shrink-0" />
					<span>{note}</span>
				</p>
			)}
		</div>
	);
}
