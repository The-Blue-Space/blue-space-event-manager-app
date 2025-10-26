export type EnvironmentVariables = {
	base_url: string;
	server: string;
	socket: string;
	socket_url: string;
};

export type StorageKeys = {
	email: string;
	session: string;
	currency_id: string;
	manager_profile_id: string;
	register_token: string;
	user_multi_account: string;
};

export type ExternalLinks = {
	terms: string;
	privacy: string;
	mobile_app: string;
	website: string;
};

export type SupportLinks = {
	support: string;
};

const NODE_ENV = (process.env.NODE_ENV as string) ?? "";

export type Environment = "production" | "development";
const SERVICE_ENV: Environment =
	(process.env.NEXT_PUBLIC_SERVICE_ENV as Environment) ?? "production";
const IS_DEV = SERVICE_ENV === "development";

const BASE_URL = (process.env.NEXT_PUBLIC_BASE_URL as string) ?? "";
const SERVER = `${BASE_URL}/api`;
const SOCKET = "";
const SOCKET_URL = ``;
const CLIENT_BASE_URL = ``;
const GOOGLE_MAPS_API_KEY = (process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY as string) ?? "";

const STORAGE_KEYS: StorageKeys = {
	email: "_BSM_email",
	session: "_BSM_session",
	currency_id: "_BSM_currency_id",
	manager_profile_id: "_BSM_manager_profile_id",
	register_token: "_BSM_register_token",
	user_multi_account: "_BSM_multi_account",
};

const EXTERNAL_LINKS: ExternalLinks = {
	terms: "",
	privacy: "",
	mobile_app: (process.env.NEXT_PUBLIC_MOBILE_APP_URL as string) ?? "",
	website: (process.env.NEXT_PUBLIC_WEBSITE_URL as string) ?? "",
};

const SUPPORT_LINKS: SupportLinks = {
	support: "",
};

const ACTIVE: EnvironmentVariables = {
	base_url: BASE_URL,
	server: SERVER,
	socket: SOCKET,
	socket_url: SOCKET_URL,
};

export {
	NODE_ENV,
	SERVICE_ENV,
	ACTIVE,
	BASE_URL,
	CLIENT_BASE_URL,
	SERVER,
	SOCKET,
	SOCKET_URL,
	STORAGE_KEYS,
	EXTERNAL_LINKS,
	SUPPORT_LINKS,
	IS_DEV,
	GOOGLE_MAPS_API_KEY,
};
