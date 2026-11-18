"use client";
import classNames from "classnames";
import { Plus } from "lucide-react";
import Field, { controlClass, controlProps } from "@/components/app/field";
import RichTextEditor from "@/components/app/rich-text-editor";
import SelectField from "@/components/app/select-field";
import { AGE_RESTRICTIONS, PARKING_TYPES } from "@/types/event.types";
import { DetailsFormApi } from "./use-details-form";

const AGE_OPTIONS = [
	{ value: "none", label: "All ages" },
	...AGE_RESTRICTIONS.map((age) => ({ value: age, label: `${age.replace("+", "")} and over` })),
];

const PARKING_LABELS: Record<(typeof PARKING_TYPES)[number], string> = {
	"free-parking": "Free parking",
	"paid-parking": "Paid parking",
	"no-parking": "No parking",
};

// The editor reports an empty document as an empty paragraph.
const cleanHtml = (html: string) => (html.replace(/<p><\/p>/g, "").trim() ? html : "");

/** Overview, age limit, parking and the questions guests ask. */
export default function GoodToKnowSection({ api }: { api: DetailsFormApi }) {
	const { form, set, errors } = api;
	if (!form) return null;

	const updateFaq = (index: number, field: "question" | "answer", value: string) =>
		set(
			"faqs",
			form.faqs.map((faq, i) => (i === index ? { ...faq, [field]: value } : faq))
		);

	return (
		<section id="good-to-know" aria-labelledby="gtk-title" className="grid gap-5 pb-2">
			<div>
				<h2 id="gtk-title" className="text-[16px] font-bold text-auth-ink">
					Good to know
				</h2>
				<p className="mt-1 text-[14px] text-auth-muted">
					The longer story, and the answers guests look for before they come.
				</p>
			</div>

			<div className="grid gap-1.5">
				<p id="overview-label" className="text-[13px] font-semibold text-auth-ink">
					Overview <span className="font-medium text-auth-muted">(optional)</span>
				</p>
				<div aria-labelledby="overview-label" role="group">
					<RichTextEditor
						content={form.overview}
						onChange={(html) => set("overview", cleanHtml(html))}
						placeholder="Who’s playing, what to wear, what’s included."
						className="border-auth-field [&_.ProseMirror]:min-h-[110px] [&_.ProseMirror]:px-3.5 [&_.ProseMirror]:py-2.5 [&_.ProseMirror]:text-[15px]"
					/>
				</div>
			</div>

			<Field id="event-age" label="Age limit">
				<SelectField
					{...controlProps("event-age", {})}
					value={form.age}
					options={AGE_OPTIONS}
					onChange={(value) => set("age", value)}
					placeholder="All ages"
				/>
			</Field>

			<fieldset className="grid gap-2">
				<legend className="mb-2 text-[13px] font-semibold text-auth-ink">Parking</legend>
				<div role="radiogroup" aria-label="Parking" className="flex flex-wrap gap-2">
					{PARKING_TYPES.map((type) => {
						const checked = form.parking === type;
						return (
							<button
								key={type}
								type="button"
								role="radio"
								aria-checked={checked}
								onClick={() => set("parking", type)}
								className={classNames(
									"inline-flex h-10 items-center gap-2 rounded-full border px-3.5 text-[14px] font-semibold text-auth-ink transition-colors duration-150",
									checked ? "border-primary-500 bg-auth-page" : "border-auth-line bg-white hover:border-auth-field"
								)}
							>
								<span
									aria-hidden="true"
									className={classNames(
										"size-3.5 rounded-full",
										checked ? "border-4 border-primary-500" : "border border-auth-field"
									)}
								/>
								{PARKING_LABELS[type]}
							</button>
						);
					})}
				</div>
			</fieldset>

			<div className="grid gap-2">
				<p className="text-[13px] font-semibold text-auth-ink">Questions guests ask</p>
				{form.faqs.map((faq, index) => {
					const faqErrors = errors.faqs?.[index];
					return (
						<div key={index} className="grid gap-3 rounded-xl border border-auth-line p-4">
							<Field id={`faq-${index}-question`} label="Question" error={faqErrors?.question}>
								<input
									{...controlProps(`faq-${index}-question`, { error: faqErrors?.question })}
									type="text"
									placeholder="Like: Is there a dress code?"
									value={faq.question}
									onChange={(event) => updateFaq(index, "question", event.target.value)}
									className={controlClass(Boolean(faqErrors?.question), "h-11")}
								/>
							</Field>
							<Field id={`faq-${index}-answer`} label="Answer" error={faqErrors?.answer}>
								<textarea
									{...controlProps(`faq-${index}-answer`, { error: faqErrors?.answer })}
									rows={2}
									value={faq.answer}
									onChange={(event) => updateFaq(index, "answer", event.target.value)}
									className={controlClass(Boolean(faqErrors?.answer), "resize-y py-2.5 leading-normal")}
								/>
							</Field>
							<button
								type="button"
								onClick={() =>
									set(
										"faqs",
										form.faqs.filter((_, i) => i !== index)
									)
								}
								className="justify-self-start text-[14px] font-semibold text-auth-muted hover:text-auth-ink"
							>
								Remove question
							</button>
						</div>
					);
				})}
				<button
					type="button"
					onClick={() => set("faqs", [...form.faqs, { question: "", answer: "" }])}
					className="inline-flex h-10 items-center gap-2 justify-self-start rounded-lg border border-auth-field bg-white px-3.5 text-[14px] font-semibold text-auth-ink transition-colors duration-150 hover:border-auth-field-hover"
				>
					<Plus aria-hidden="true" className="size-4" />
					Add a question
				</button>
			</div>
		</section>
	);
}
