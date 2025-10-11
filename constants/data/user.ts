import { User } from "@/types/user.types";

export const users: User[] = [
	{
		id: "1",
		email: "john.doe@example.com",
		username: "john.doe",
		name: "John Doe",
		avatar_url: "https://example.com/avatar.png",
		is_verified: true,
		is_admin: true,
		account_status: "active",
		phone: "1234567890",
		status_changed_at: "2021-01-01",
		deleted_at: null,
		created_at: "2021-01-01",
		updated_at: "2021-01-01",
	},
	{
		id: "2",
		email: "jane.doe@example.com",
		username: "jane.doe",
		name: "Jane Doe",
		avatar_url: "https://example.com/avatar.png",
		is_verified: true,
		is_admin: true,
		account_status: "pending_verification",
		phone: "1234567890",
		status_changed_at: "2021-01-01",
		deleted_at: null,
		created_at: "2021-01-01",
		updated_at: "2021-01-01",
	},
];
