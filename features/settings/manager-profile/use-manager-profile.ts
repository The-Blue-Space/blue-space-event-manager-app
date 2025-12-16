import React from "react";
import { ZodError } from "zod";
import { toast } from "sonner";
import { managerProfileSchema, ManagerProfileFormData } from "./schema";
import ensureError, { formatZodErrors } from "@/lib/ensure-error";
import updateManagerProfile from "@/services/account/update-manager-profile";
import invalidateQuery from "@/lib/invalidate-query";
import useAppSelector from "@/store/hooks";

export default function useManagerProfile() {
	const { managerProfile } = useAppSelector("manager_profile");
	const [isLoading, setIsLoading] = React.useState(false);
	const [errors, setErrors] = React.useState<Record<string, string>>({});

	// File states for image uploads
	const [logoFile, setLogoFile] = React.useState<File | null>(null);
	const [displayImageFile, setDisplayImageFile] = React.useState<File | null>(null);
	const [logoPreview, setLogoPreview] = React.useState<string | null>(null);
	const [displayImagePreview, setDisplayImagePreview] = React.useState<string | null>(null);

	const initialFormData: ManagerProfileFormData = React.useMemo(
		() => ({
			name: managerProfile?.name ?? "",
			logo: managerProfile?.logo ?? "",
			display_image: managerProfile?.display_image ?? "",
			bio: managerProfile?.bio ?? "",
			phone: managerProfile?.phone ?? "",
			email: managerProfile?.email ?? "",
			operating_country_id: managerProfile?.operating_country_id ?? "",
		}),
		[managerProfile]
	);

	const [formData, setFormData] = React.useState<ManagerProfileFormData>(initialFormData);

	React.useEffect(() => {
		if (managerProfile) {
			setFormData({
				name: managerProfile.name ?? "",
				logo: managerProfile.logo ?? "",
				display_image: managerProfile.display_image ?? "",
				bio: managerProfile.bio ?? "",
				phone: managerProfile.phone ?? "",
				email: managerProfile.email ?? "",
				operating_country_id: managerProfile.operating_country_id ?? "",
			});
			// Set initial previews from existing images
			setLogoPreview(managerProfile.logo);
			setDisplayImagePreview(managerProfile.display_image);
		}
	}, [managerProfile]);

	// Handle logo file selection
	const handleLogoChange = (file: File) => {
		setLogoFile(file);
		const reader = new FileReader();
		reader.onloadend = () => {
			setLogoPreview(reader.result as string);
		};
		reader.readAsDataURL(file);
		setErrors((prev) => ({ ...prev, logo: "" }));
	};

	// Handle display image file selection
	const handleDisplayImageChange = (file: File) => {
		setDisplayImageFile(file);
		const reader = new FileReader();
		reader.onloadend = () => {
			setDisplayImagePreview(reader.result as string);
		};
		reader.readAsDataURL(file);
		setErrors((prev) => ({ ...prev, display_image: "" }));
	};

	// Remove logo
	const handleLogoRemove = () => {
		setLogoFile(null);
		setLogoPreview(null);
		updateForm("logo", "");
	};

	// Remove display image
	const handleDisplayImageRemove = () => {
		setDisplayImageFile(null);
		setDisplayImagePreview(null);
		updateForm("display_image", "");
	};

	const updateForm = (field: keyof ManagerProfileFormData, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		setErrors((prev) => ({ ...prev, [field]: "" }));
	};

	const submit = async () => {
		if (!managerProfile?.id) {
			toast.error("Manager profile not found");
			return;
		}

		setErrors({});
		setIsLoading(true);

		try {
			const validated = managerProfileSchema.parse(formData);

			// Prepare payload with files
			const payload: any = {
				...validated,
				bio: validated.bio || null,
				phone: validated.phone || null,
			};

			// If new files are selected, send them
			if (logoFile) {
				payload.logo = logoFile;
			} else if (!logoPreview) {
				payload.logo = null;
			}

			if (displayImageFile) {
				payload.display_image = displayImageFile;
			} else if (!displayImagePreview) {
				payload.display_image = null;
			}

			await updateManagerProfile({
				id: managerProfile.id,
				name: validated.name,
				logo: logoFile,
				display_image: displayImageFile,
				bio: validated.bio || null,
				phone: validated.phone || null,
				email: validated.email,
				operating_country_id: validated.operating_country_id,
			});

			toast.success("Manager profile updated successfully");
			invalidateQuery(["manager-profile"]);

			// Reset file states after successful update
			setLogoFile(null);
			setDisplayImageFile(null);
		} catch (err) {
			if (err instanceof ZodError) {
				const formattedErrors = formatZodErrors(err);
				setErrors(formattedErrors);
				toast.error("Please fix the form errors");
			} else {
				const errMsg = ensureError(err).message;
				toast.error(errMsg);
			}
		} finally {
			setIsLoading(false);
		}
	};

	return {
		formData,
		errors,
		isLoading,
		updateForm,
		submit,
		managerProfile,
		// Image handling
		logoPreview,
		displayImagePreview,
		handleLogoChange,
		handleDisplayImageChange,
		handleLogoRemove,
		handleDisplayImageRemove,
	};
}
