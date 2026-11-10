"use client";
import * as React from "react";
import { X } from "lucide-react";
import Field, { controlClass, controlProps } from "@/components/app/field";
import SearchSelect from "@/components/app/search-select";
import { DESCRIPTION_LIMIT, DetailsFormApi } from "./use-details-form";

/** Name, short description, category and tags. */
export default function BasicsSection({ api }: { api: DetailsFormApi }) {
	const { form, set, errors, categoryOptions, commonCategories, loadingCategories } = api;
	const [tagDraft, setTagDraft] = React.useState("");
	if (!form) return null;

	const addTag = () => {
		const tag = tagDraft.trim().replace(/,$/, "").trim();
		if (tag && !form.tags.some((existing) => existing.toLowerCase() === tag.toLowerCase())) {
			set("tags", [...form.tags, tag]);
		}
		setTagDraft("");
	};

	return (
		<section id="basics" aria-labelledby="basics-title" className="grid gap-5 border-b border-auth-line pb-8">
			<h2 id="basics-title" className="text-[16px] font-bold text-auth-ink">
				Name, description and category
			</h2>

			<Field id="event-title" label="Event name" error={errors.title}>
				<input
					{...controlProps("event-title", { error: errors.title })}
					type="text"
					placeholder="What's it called?"
					value={form.title}
					onChange={(event) => set("title", event.target.value)}
					className={controlClass(Boolean(errors.title), "h-11")}
				/>
			</Field>

			<Field
				id="event-description"
				label="Short description"
				error={errors.description}
				aside={
					<span
						className={
							form.description.length > DESCRIPTION_LIMIT
								? "text-[12px] text-auth-error"
								: "text-[12px] text-auth-muted"
						}
					>
						{form.description.length} / {DESCRIPTION_LIMIT}
					</span>
				}
			>
				<textarea
					{...controlProps("event-description", { error: errors.description })}
					rows={2}
					placeholder="A line or two guests will see first."
					value={form.description}
					onChange={(event) => set("description", event.target.value)}
					className={controlClass(Boolean(errors.description), "resize-y py-2.5 leading-normal")}
				/>
			</Field>

			<Field id="event-category" label="Category">
				<SearchSelect
					{...controlProps("event-category", {})}
					value={form.categoryId}
					options={categoryOptions}
					common={commonCategories}
					restLabel="More categories"
					onChange={(value) => set("categoryId", value)}
					disabled={loadingCategories}
					placeholder={loadingCategories ? "Loading categories…" : "Choose a category"}
					searchPlaceholder="Search categories"
					noun="category"
				/>
			</Field>

			<Field id="event-tags" label="Tags" optional>
				<div className="grid gap-2">
					{form.tags.length > 0 && (
						<ul aria-label="Tags" className="flex flex-wrap gap-1.5">
							{form.tags.map((tag) => (
								<li
									key={tag}
									className="inline-flex h-[30px] items-center gap-1 rounded-full bg-auth-info-soft pl-2.5 pr-1 text-[13px] font-semibold text-primary-500"
								>
									{tag}
									<button
										type="button"
										aria-label={`Remove ${tag}`}
										onClick={() =>
											set(
												"tags",
												form.tags.filter((existing) => existing !== tag)
											)
										}
										className="grid size-6 place-items-center rounded-full hover:bg-white/60"
									>
										<X aria-hidden="true" className="size-3.5" strokeWidth={2.5} />
									</button>
								</li>
							))}
						</ul>
					)}
					<input
						{...controlProps("event-tags", {})}
						type="text"
						placeholder="Add a tag and press Enter"
						value={tagDraft}
						onChange={(event) => setTagDraft(event.target.value)}
						onKeyDown={(event) => {
							if (event.key === "Enter" || event.key === ",") {
								event.preventDefault();
								addTag();
							} else if (event.key === "Backspace" && !tagDraft && form.tags.length) {
								set("tags", form.tags.slice(0, -1));
							}
						}}
						onBlur={addTag}
						className={controlClass(false, "h-11")}
					/>
				</div>
			</Field>
		</section>
	);
}
