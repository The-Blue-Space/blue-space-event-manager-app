import { Building2, Mail, MapPin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Input, Textarea } from "@/components/app/form-input";
import SelectBox from "@/components/app/form-input/select-box";
import AppButton from "@/components/app/app-button";
import useManagerProfile from "./use-manager-profile";
import getCountries from "@/services/extras/get-countries";
import ProfileImages from "./profile-images";
import React from "react";

export default function SetUpProfile() {
	const {
		formData,
		errors,
		isLoading,
		updateForm,
		submit,
		logoPreview,
		displayImagePreview,
		handleLogoChange,
		handleDisplayImageChange,
		handleLogoRemove,
		handleDisplayImageRemove,
	} = useManagerProfile();

	const { data: countries, isLoading: loadingCountries } = useQuery({
		queryKey: ["countries"],
		queryFn: getCountries,
	});

	const countryOptions = React.useMemo(() => {
		return (
			countries?.map((country) => ({
				value: country.id,
				title: country.country_name,
			})) ?? []
		);
	}, [countries]);

	return (
		<div className="max-w-2xl mx-auto space-y-6">
			<div className="space-y-2">
				<h2 className="text-xl font-semibold text-neutral-900">Setup Organization Profile</h2>
				<p className="body-3 text-neutral-600">
					Setup your organization profile information. This information will be displayed on your events
					and public profile.
				</p>
			</div>

			{/* Profile Images Section */}
			<div className="bg-neutral-50 rounded-lg border border-neutral-200 p-4 space-y-4">
				<ProfileImages
					displayImage={displayImagePreview}
					logo={logoPreview}
					onDisplayImageChange={handleDisplayImageChange}
					onLogoChange={handleLogoChange}
					onDisplayImageRemove={handleDisplayImageRemove}
					onLogoRemove={handleLogoRemove}
					disabled={isLoading}
				/>
			</div>

			{/* Basic Information Section */}
			<div className="bg-neutral-50 rounded-lg border border-neutral-200 p-4 space-y-4">
				<div className="flex items-center gap-2">
					<Building2 className="w-4 h-4 text-accent-500" />
					<h3 className="body-2 font-semibold text-neutral-900">Basic Information</h3>
				</div>

				<div className="space-y-4">
					{/* Name */}
					<Input
						name="name"
						type="text"
						label="Organization Name"
						placeholder="e.g., Blue Space Events"
						value={formData.name}
						onChange={(e) => updateForm("name", e.target.value)}
						disabled={isLoading}
						errorMessage={errors.name}
						required
						floatingLabel={true}
					/>

					{/* Bio */}
					<Textarea
						name="bio"
						label="Bio"
						placeholder="Tell us about your organization..."
						value={formData.bio ?? ""}
						onChange={(e) => updateForm("bio", e.target.value)}
						disabled={isLoading}
						errorMessage={errors.bio}
						floatingLabel={true}
						rows={4}
					/>
				</div>
			</div>

			{/* Contact Information Section */}
			<div className="bg-neutral-50 rounded-lg border border-neutral-200 p-4 space-y-4">
				<div className="flex items-center gap-2">
					<Mail className="w-4 h-4 text-accent-500" />
					<h3 className="body-2 font-semibold text-neutral-900">Contact Information</h3>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{/* Email */}
					<Input
						name="email"
						type="email"
						label="Email"
						placeholder="contact@example.com"
						value={formData.email}
						onChange={(e) => updateForm("email", e.target.value)}
						disabled={isLoading}
						errorMessage={errors.email}
						required
						floatingLabel={true}
					/>

					{/* Phone */}
					<Input
						name="phone"
						type="tel"
						label="Phone"
						placeholder="+1234567890"
						value={formData.phone ?? ""}
						onChange={(e) => updateForm("phone", e.target.value)}
						disabled={isLoading}
						errorMessage={errors.phone}
						floatingLabel={true}
					/>
				</div>
			</div>

			{/* Location Section */}
			<div className="bg-neutral-50 rounded-lg border border-neutral-200 p-4 space-y-4">
				<div className="flex items-center gap-2">
					<MapPin className="w-4 h-4 text-accent-500" />
					<h3 className="body-2 font-semibold text-neutral-900">Operating Location</h3>
				</div>

				<SelectBox
					name="operating_country_id"
					label="Operating Country"
					placeholder="Select Country"
					value={formData.operating_country_id}
					onchange={(value) => updateForm("operating_country_id", value)}
					disabled={isLoading || loadingCountries}
					options={countryOptions}
					errorMessage={errors.operating_country_id}
					required
					floatingLabel={true}
					showSearch={true}
				/>
			</div>

			{/* Save Button */}
			<div className="flex justify-end pt-2">
				<AppButton
					variant="primary"
					className="rounded-lg px-8"
					onClick={submit}
					isLoading={isLoading}
					disabled={isLoading}
				>
					Create Profile
				</AppButton>
			</div>
		</div>
	);
}
