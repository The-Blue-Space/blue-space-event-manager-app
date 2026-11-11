"use client";
import * as React from "react";
import classNames from "classnames";
import { useQuery } from "@tanstack/react-query";
import AppButton from "@/components/app/app-button";
import Field, { controlClass, controlProps } from "@/components/app/field";
import SelectField from "@/components/app/select-field";
import getCountries from "@/services/extras/get-countries";
import { CoverField, LogoField } from "./image-fields";
import ProfilePreview from "./profile-preview";
import { BIO_MAX_LENGTH } from "./schema";
import RestoreBanner from "@/components/app/restore-banner";
import useSetUpProfile from "./use-set-up-profile";

export function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
	const id = React.useId();
	return (
		<section aria-labelledby={id} className="grid gap-5 border-b border-auth-line pb-8">
			<h2 id={id} className="text-[16px] font-bold leading-[1.3] text-auth-ink">
				{title}
			</h2>
			{children}
		</section>
	);
}

export default function SetUpProfile() {
	const {
		form,
		errors,
		logo,
		cover,
		isLoading,
		saving,
		accountEmail,
		update,
		setValue,
		pickLogo,
		pickCover,
		removeLogo,
		removeCover,
		submit,
	} = useSetUpProfile();

	const { data: countries = [], isLoading: loadingCountries } = useQuery({
		queryKey: ["countries"],
		queryFn: getCountries,
	});
	const countryName = countries.find((country) => country.id === form.operating_country_id)?.country_name;
	const bioTooLong = form.bio.length > BIO_MAX_LENGTH;
	const emailHint =
		accountEmail && form.email === accountEmail
			? "We filled in your account email. You can use a different one."
			: undefined;

	return (
		<section aria-labelledby="set-up-profile-title" className="mt-4 text-auth-ink">
			<header className="mb-8 grid max-w-[600px] gap-2">
				<h1
					id="set-up-profile-title"
					className="text-[26px] font-bold leading-[1.25] tracking-[-0.01em] [text-wrap:balance]"
				>
					Set up your organizer profile
				</h1>
				<p className="text-[15px] leading-[1.55] text-auth-muted">
					Guests see this on your events and on your public profile.
				</p>
			</header>

			<form
				onSubmit={submit}
				noValidate
				className="grid gap-8 lg:grid-cols-[minmax(0,560px)_minmax(0,380px)] lg:gap-x-16"
			>
				<fieldset disabled={isLoading} className="contents">
					{saving.offer && (
						<RestoreBanner
							variant="started"
							savedAt={saving.offer.savedAt}
							files={saving.offer.files}
							onRestore={saving.restore}
							onDiscard={saving.discard}
							className="lg:col-span-2"
						/>
					)}
					<div className="grid gap-8">
						<FormSection title="Your brand">
							<Field id="org-name" label="Organizer name" error={errors.name}>
								<input
									{...controlProps("org-name", { error: errors.name })}
									type="text"
									autoComplete="organization"
									placeholder="Company, brand or your own name"
									value={form.name}
									onChange={update("name")}
									className={controlClass(Boolean(errors.name), "h-11")}
								/>
							</Field>

							<LogoField image={logo} onPick={pickLogo} onRemove={removeLogo} />
							<CoverField image={cover} onPick={pickCover} onRemove={removeCover} />

							<Field
								id="org-bio"
								label="Bio"
								optional
								error={errors.bio}
								aside={
									<span className={classNames("text-[12px]", bioTooLong ? "text-auth-error" : "text-auth-muted")}>
										{form.bio.length} / {BIO_MAX_LENGTH}
									</span>
								}
							>
								<textarea
									{...controlProps("org-bio", { error: errors.bio })}
									rows={4}
									placeholder="What kind of events do you run?"
									value={form.bio}
									onChange={update("bio")}
									className={controlClass(Boolean(errors.bio), "min-h-28 resize-y py-2.5 leading-normal")}
								/>
							</Field>
						</FormSection>

						<FormSection title="Contact and location">
							<Field id="org-email" label="Email" error={errors.email} hint={emailHint}>
								<input
									{...controlProps("org-email", { error: errors.email, hint: emailHint })}
									type="email"
									autoComplete="email"
									placeholder="you@example.com"
									value={form.email}
									onChange={update("email")}
									className={controlClass(Boolean(errors.email), "h-11")}
								/>
							</Field>

							<Field id="org-phone" label="Phone number" error={errors.phone}>
								<input
									{...controlProps("org-phone", { error: errors.phone })}
									type="tel"
									autoComplete="tel"
									placeholder="+234 800 000 0000"
									value={form.phone}
									onChange={update("phone")}
									className={controlClass(Boolean(errors.phone), "h-11")}
								/>
							</Field>

							<Field id="org-country" label="Country you operate in" error={errors.operating_country_id}>
								<SelectField
									{...controlProps("org-country", { error: errors.operating_country_id })}
									value={form.operating_country_id}
									options={countries.map((country) => ({ value: country.id, label: country.country_name }))}
									onChange={(value) => setValue("operating_country_id", value)}
									disabled={loadingCountries}
									placeholder={loadingCountries ? "Loading countries…" : "Choose a country"}
								/>
							</Field>
						</FormSection>
					</div>

					<ProfilePreview
						name={form.name}
						bio={form.bio}
						country={countryName}
						logo={logo?.preview}
						cover={cover?.preview}
						className="lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start"
					/>

					<div className="flex flex-wrap items-center gap-x-4 gap-y-3">
						<AppButton
							type="submit"
							variant="primary"
							isLoading={isLoading}
							className="h-11 w-full px-5 !text-[15px] font-semibold sm:w-auto sm:min-w-[220px]"
						>
							Create organizer profile
						</AppButton>
						<p className="text-[13px] leading-[1.45] text-auth-muted">You can change any of this later in Settings.</p>
					</div>
				</fieldset>
			</form>
		</section>
	);
}
