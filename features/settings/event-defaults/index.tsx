"use client";
import * as RadioGroup from "@radix-ui/react-radio-group";
import * as Switch from "@radix-ui/react-switch";
import classNames from "classnames";
import Field, { controlClass, controlProps } from "@/components/app/field";
import { RefundPolicyType } from "@/types/event.types";
import { ManagerProfile } from "@/types/user.types";
import RestoreBanner from "@/components/app/restore-banner";
import SaveStatus from "@/components/app/save-status";
import useEventDefaults, { EventDefaultsForm, MAX_REFUND_DAYS } from "./use-event-defaults";

const POLICIES: { value: RefundPolicyType; title: string; detail: string }[] = [
	{ value: "no-refund", title: "No refunds", detail: "Tickets can’t be refunded once they’re bought." },
	{
		value: "partial-refund",
		title: "Partial refund",
		detail: "Guests get part of their money back if they ask early enough.",
	},
	{ value: "full-refund", title: "Full refund", detail: "Guests get all their money back if they ask early enough." },
];

type SwitchField = Exclude<keyof EventDefaultsForm, "refund_policy_type" | "refund_policy_days">;

const ALBUM: { field: SwitchField; title: string; detail: string }[] = [
	{
		field: "allow_individual_upload",
		title: "Guests can add photos",
		detail: "Attendees can upload photos to the event’s shared album.",
	},
	{
		field: "allow_professional_upload",
		title: "Photographers can add photos",
		detail: "Professionals you bring in, like a freelance photographer, can upload to the album.",
	},
	{
		field: "enable_downloads",
		title: "Guests can save photos",
		detail: "Attendees can download photos and videos from the album.",
	},
];

const focusRing = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-auth-link focus-visible:ring-offset-2";

const radioCardClass = classNames(
	"group flex items-start gap-3 rounded-xl border border-auth-line bg-white p-3.5 text-left sm:px-4",
	"transition-[border-color,background-color,box-shadow] duration-150 disabled:cursor-not-allowed",
	"data-[state=unchecked]:hover:border-auth-field data-[state=checked]:border-primary-500",
	"data-[state=checked]:bg-auth-page data-[state=checked]:shadow-[0_0_0_1px_#29285C]",
	focusRing
);

const radioDotClass = classNames(
	"mt-px size-[18px] shrink-0 rounded-full border border-auth-field transition-[border] duration-150",
	"group-data-[state=checked]:border-[5px] group-data-[state=checked]:border-primary-500"
);

const switchClass = classNames(
	"h-[26px] w-11 shrink-0 rounded-full bg-auth-field p-[3px] transition-colors duration-150",
	"disabled:cursor-not-allowed data-[state=checked]:bg-primary-500",
	focusRing
);

const thumbClass = classNames(
	"block size-5 rounded-full bg-white shadow-[0_1px_2px_rgba(25,24,55,0.25)]",
	"transition-transform duration-150 data-[state=checked]:translate-x-[18px]"
);

const AUTO_REFUNDS_DETAIL =
	"Requests that fit your policy are approved straight away when the event’s balance can cover them. " +
	"Anything else waits for you to review.";

function SectionHeading({ id, title, children }: { id: string; title: string; children: string }) {
	return (
		<div>
			<h2 id={id} className="text-[16px] font-bold leading-[1.3] text-auth-ink">
				{title}
			</h2>
			<p className="mt-1 text-[14px] leading-normal text-auth-muted">{children}</p>
		</div>
	);
}

type SwitchRowProps = {
	id: string;
	title: string;
	detail: string;
	checked: boolean;
	onCheckedChange: (checked: boolean) => void;
};

function SwitchRow({ id, title, detail, checked, onCheckedChange }: SwitchRowProps) {
	return (
		<div className="flex items-start gap-3.5 sm:gap-4">
			<div className="grid flex-1 gap-0.5">
				<label htmlFor={id} className="text-[15px] font-semibold text-auth-ink">
					{title}
				</label>
				<p id={`${id}-detail`} className="text-[13px] leading-[1.45] text-auth-muted">
					{detail}
				</p>
			</div>
			<Switch.Root
				id={id}
				checked={checked}
				onCheckedChange={onCheckedChange}
				aria-describedby={`${id}-detail`}
				className={switchClass}
			>
				<Switch.Thumb className={thumbClass} />
			</Switch.Root>
		</div>
	);
}

export default function EventDefaults({ profile }: { profile: ManagerProfile }) {
	const { form, daysError, needsDays, saving, set, submit } = useEventDefaults(profile);

	// These save themselves, so the fields stay usable while a save is on its way.
	return (
		<form onSubmit={submit} {...saving.formProps} noValidate className="grid max-w-[640px] gap-[22px] sm:gap-8">
			<div className="contents">
				{saving.offer && (
					<RestoreBanner
						savedAt={saving.offer.savedAt}
						onRestore={saving.restore}
						onDiscard={saving.discard}
					/>
				)}
				<section aria-labelledby="refunds-title" className="grid gap-3.5 sm:gap-[18px]">
					<SectionHeading id="refunds-title" title="Refunds">
						What guests can get back if they can’t make it.
					</SectionHeading>

					<RadioGroup.Root
						value={form.refund_policy_type}
						onValueChange={(value) => set("refund_policy_type", value as RefundPolicyType)}
						aria-labelledby="refunds-title"
						className="grid gap-2.5"
					>
						{POLICIES.map(({ value, title, detail }) => (
							<RadioGroup.Item
								key={value}
								value={value}
								aria-labelledby={`${value}-title`}
								aria-describedby={`${value}-detail`}
								className={radioCardClass}
							>
								<span aria-hidden="true" className={radioDotClass} />
								<span className="grid gap-0.5">
									<span id={`${value}-title`} className="text-[15px] font-semibold text-auth-ink">
										{title}
									</span>
									<span id={`${value}-detail`} className="text-[13px] leading-[1.45] text-auth-muted">
										{detail}
									</span>
								</span>
							</RadioGroup.Item>
						))}
					</RadioGroup.Root>

					{needsDays && (
						<Field id="refund-days" label="Refund window" error={daysError}>
							<div className="flex flex-wrap items-center gap-x-2.5 gap-y-2 text-[15px] text-auth-muted">
								<span>Guests can ask until</span>
								<input
									{...controlProps("refund-days", { error: daysError })}
									type="number"
									inputMode="numeric"
									min={1}
									max={MAX_REFUND_DAYS}
									value={form.refund_policy_days}
									onChange={(e) => set("refund_policy_days", e.target.value)}
									className={controlClass(Boolean(daysError), "h-11 w-[72px] font-semibold max-sm:text-[16px] sm:w-[84px]")}
								/>
								<span>days before the event</span>
							</div>
						</Field>
					)}

					<div className="pt-1 sm:pt-1.5">
						<SwitchRow
							id="automate_refunds"
							title="Approve refunds automatically"
							detail={AUTO_REFUNDS_DETAIL}
							checked={form.automate_refunds}
							onCheckedChange={(checked) => set("automate_refunds", checked)}
						/>
					</div>
				</section>

				<hr className="border-auth-line" />

				<section aria-labelledby="album-title" className="grid gap-4 sm:gap-[18px]">
					<SectionHeading id="album-title" title="Photo album">
						Who can add to each event’s shared album, and who can save from it.
					</SectionHeading>
					{ALBUM.map(({ field, title, detail }) => (
						<SwitchRow
							key={field}
							id={field}
							title={title}
							detail={detail}
							checked={form[field]}
							onCheckedChange={(checked) => set(field, checked)}
						/>
					))}
				</section>

				<hr className="border-auth-line" />

				<SaveStatus status={saving.status} onRetry={() => void saving.retry()} />
			</div>
		</form>
	);
}
