export const ACCOUNT_STATUS = [
	"pending_verification",
	"active",
	"deactivated",
	"deleted",
	"suspended",
] as const;
export type AccountStatus = (typeof ACCOUNT_STATUS)[number];

export type User = {
	id: string;
	email: string;
	username: string;
	name: string;
	avatar_url: string | null;
	is_verified: boolean;
	is_admin: boolean;
	account_status: AccountStatus;
	phone: string;
	status_changed_at: string;
	deleted_at: string | null;
	created_at: string;
	updated_at: string;
};

export type ManagerProfile = {
	id: string;
	name: string;
	logo: string | null;
	display_image: string | null;
	bio: string | null;
	user_id: string;
	user: User;
	created_at: string;
	updated_at: string;
};
