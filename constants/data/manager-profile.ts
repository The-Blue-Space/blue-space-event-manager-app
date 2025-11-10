import { ManagerProfile } from "@/types/user.types";
import { users } from "./user";
import { images } from "./images";

export const manager_profiles: ManagerProfile[] = [
	{
		id: "1",
		name: "Blue space",
		logo: images[0],
		display_image: images[1],
		bio: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. We create amazing events and experiences for our community.",
		phone: "+1234567890",
		email: "bluespace@example.com",
		operating_country_id: "1",
		operating_country: {
			id: "1",
			country_name: "Nigeria",
			country_code: "NG",
			country_flag: "https://flagcdn.com/ng.svg",
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
		},
		user_id: "1",
		user: users[0],
		refund_policy_type: "no-refund",
		refund_policy_days: null,
		automate_refunds: false,
		enable_downloads: false,
		allow_individual_upload: false,
		allow_professional_upload: false,
		created_at: "2021-01-01",
		updated_at: "2021-01-01",
	},
];
