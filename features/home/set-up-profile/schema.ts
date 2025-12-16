import { z } from "zod";

export const managerProfileSchema = z.object({
	name: z.string().min(3, "Name must be at least 3 characters"),
	logo: z.string().optional().or(z.literal("")),
	display_image: z.string().optional().or(z.literal("")),
	bio: z.string().max(500, "Bio must be at most 500 characters").optional().or(z.literal("")),
	phone: z.string().optional().or(z.literal("")),
	email: z.string().email("Invalid email address"),
	operating_country_id: z.string().min(1, "Operating country is required"),
});

export type ManagerProfileFormData = z.infer<typeof managerProfileSchema>;
