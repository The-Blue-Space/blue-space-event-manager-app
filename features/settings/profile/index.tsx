"use client";
import classNames from "classnames";
import { useQuery } from "@tanstack/react-query";
import Field, { controlClass, controlProps } from "@/components/app/field";
import SelectField from "@/components/app/select-field";
import { FormSection } from "@/features/home/set-up-profile";
import { CoverField, LogoField } from "@/features/home/set-up-profile/image-fields";
import ProfilePreview from "@/features/home/set-up-profile/profile-preview";
import { BIO_MAX_LENGTH } from "@/features/home/set-up-profile/schema";
import getCountries from "@/services/extras/get-countries";
import { ManagerProfile } from "@/types/user.types";
import RestoreBanner from "@/components/app/restore-banner";
import SaveBar from "../save-bar";
import useProfileForm from "./use-profile-form";

export default function OrganizerProfile({ profile }: { profile: ManagerProfile }) {
	const {
		form,
		errors,
		logo,
		cover,
		logoUrl,
		coverUrl,
		dirty,
		isSaving,
		update,
		setValue,
		pickLogo,
		pickCover,
		removeLogo,
		removeCover,
		submit,
		saving,
	} = useProfileForm(profile);

	const { data: countries = [], isLoading: loadingCountries } = useQuery({
		queryKey: ["countries"],
		queryFn: getCountries,
	});
	const countryName = countries.find((country) => country.id === form.operating_country_id)?.country_name;
	const bioTooLong = form.bio.length > BIO_MAX_LENGTH;

	return (
		<form
			onSubmit={submit}
			noValidate
			className="grid gap-8 lg:grid-cols-[minmax(0,560px)_minmax(0,380px)] lg:gap-x-16"
		>
			<fieldset disabled={isSaving} className="contents">
				{saving.offer && (
					<RestoreBanner
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

						<LogoField image={logo} currentUrl={logoUrl} onPick={pickLogo} onRemove={removeLogo} />
						<CoverField image={cover} currentUrl={coverUrl} onPick={pickCover} onRemove={removeCover} />

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
						<Field id="org-email" label="Email" error={errors.email}>
							<input
								{...controlProps("org-email", { error: errors.email })}
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
					logo={logo?.preview ?? logoUrl ?? undefined}
					cover={cover?.preview ?? coverUrl ?? undefined}
					className="lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start"
				/>

				<SaveBar dirty={dirty} isSaving={isSaving} savedAt={profile.updated_at} />
			</fieldset>
		</form>
	);
}
