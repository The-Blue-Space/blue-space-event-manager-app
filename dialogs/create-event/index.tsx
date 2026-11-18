"use client";
import * as React from "react";
import classNames from "classnames";
import { X } from "lucide-react";
import AppButton from "@/components/app/app-button";
import ChoiceCards from "@/components/app/choice-cards";
import Field, { controlClass, controlProps } from "@/components/app/field";
import RestoreBanner from "@/components/app/restore-banner";
import SearchSelect from "@/components/app/search-select";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { ACCESS_CHOICES, DESCRIPTION_MAX_LENGTH, VISIBILITY_CHOICES } from "./schema";
import useCreateEvent from "./use-create-event";

export default function CreateEventDialog() {
	const {
		open,
		form,
		errors,
		isLoading,
		categoryOptions,
		commonCategories,
		loadingCategories,
		countryName,
		set,
		close,
		submit,
		saving,
	} = useCreateEvent();
	const descriptionTooLong = form.description.length > DESCRIPTION_MAX_LENGTH;

	return (
		<Dialog open={open} onOpenChange={(next) => !next && close()}>
			<DialogContent className="flex max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-[620px] flex-col gap-0 overflow-hidden rounded-2xl border-0 bg-white p-0 font-manrope text-auth-ink shadow-[0_24px_64px_-24px_rgba(25,24,55,0.45)] max-sm:h-dvh max-sm:max-h-dvh max-sm:w-full max-sm:rounded-none">
				<form onSubmit={submit} noValidate className="flex min-h-0 flex-1 flex-col">
					<header className="flex items-start gap-4 px-4 pt-5 sm:px-6 sm:pt-[22px]">
						<div className="flex-1">
							<DialogTitle className="text-[20px] font-bold leading-tight">Create an event</DialogTitle>
							<DialogDescription className="mt-1 text-[14px] leading-normal text-auth-muted">
								Start with the basics. It stays a draft until you publish it.
							</DialogDescription>
						</div>
						<DialogClose
							aria-label="Close"
							className="grid size-10 shrink-0 place-items-center rounded-lg text-auth-muted transition-colors duration-150 hover:bg-auth-info-soft hover:text-auth-ink"
						>
							<X aria-hidden="true" className="size-5" />
						</DialogClose>
					</header>

					<fieldset
						disabled={isLoading}
						className="grid min-h-0 flex-1 content-start gap-[18px] overflow-y-auto px-4 py-5 sm:px-6"
					>
						{saving.offer && (
							<RestoreBanner
								variant="started"
								savedAt={saving.offer.savedAt}
								onRestore={saving.restore}
								onDiscard={saving.discard}
							/>
						)}
						<Field id="event-title" label="Event name" error={errors.title}>
							<input
								{...controlProps("event-title", { error: errors.title })}
								type="text"
								placeholder="What's it called?"
								value={form.title}
								onChange={(e) => set("title", e.target.value)}
								className={controlClass(Boolean(errors.title), "h-11")}
							/>
						</Field>

						<Field
							id="event-description"
							label="Short description"
							error={errors.description}
							aside={
								<span className={classNames("text-[12px]", descriptionTooLong ? "text-auth-error" : "text-auth-muted")}>
									{form.description.length} / {DESCRIPTION_MAX_LENGTH}
								</span>
							}
						>
							<textarea
								{...controlProps("event-description", { error: errors.description })}
								rows={2}
								placeholder="A line or two guests will see first. You can write more later."
								value={form.description}
								onChange={(e) => set("description", e.target.value)}
								className={controlClass(Boolean(errors.description), "resize-y py-2.5 leading-normal")}
							/>
						</Field>

						<Field id="event-category" label="Category" error={errors.event_category_id}>
							<SearchSelect
								{...controlProps("event-category", { error: errors.event_category_id })}
								value={form.event_category_id}
								options={categoryOptions}
								common={commonCategories}
								restLabel="More categories"
								onChange={(value) => set("event_category_id", value)}
								disabled={loadingCategories}
								placeholder={loadingCategories ? "Loading categories…" : "Choose a category"}
								searchPlaceholder="Search categories"
								noun="category"
							/>
						</Field>

						<ChoiceCards
							name="access_type"
							legend="How do guests get in?"
							hint="You can change this until you publish."
							value={form.access_type}
							choices={ACCESS_CHOICES}
							onChange={(value) => set("access_type", value)}
							className="sm:grid-cols-2"
						/>

						<ChoiceCards
							name="is_private"
							legend="Who can find it?"
							value={form.is_private}
							choices={VISIBILITY_CHOICES}
							onChange={(value) => set("is_private", value)}
							className="grid-cols-2"
						/>
					</fieldset>

					<footer className="flex flex-wrap items-center gap-3 border-t border-auth-line bg-auth-page px-4 py-4 sm:px-6">
						<p className="min-w-[200px] flex-1 text-[13px] leading-[1.45] text-auth-muted">
							Takes place in {countryName ?? "your operating country"}. Next you’ll add the date, venue
							{form.access_type === "ticket-based" ? " and tickets" : " and a cover image"}.
						</p>
						<button
							type="button"
							onClick={close}
							className="h-11 rounded-lg px-4 text-[15px] font-semibold text-auth-muted transition-colors duration-150 hover:bg-auth-info-soft hover:text-auth-ink"
						>
							Cancel
						</button>
						<AppButton
							type="submit"
							variant="primary"
							isLoading={isLoading}
							className="h-11 min-w-[140px] px-5 !text-[15px] font-semibold"
						>
							Create draft
						</AppButton>
					</footer>
				</form>
			</DialogContent>
		</Dialog>
	);
}
