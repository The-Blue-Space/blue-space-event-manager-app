import { ManagerProfile } from "@/types/user.types";
import { users } from "./user";

export const manager_profiles: ManagerProfile[] = [
	{
		id: "1",
		name: "Blue space",
		logo: "https://example.com/logo.png",
		display_image: "https://example.com/display_image.png",
		bio: "Lorem ipsum dolor sit amet",
		user_id: "1",
		user: users[0],
		created_at: "2021-01-01",
		updated_at: "2021-01-01",
	},
];
