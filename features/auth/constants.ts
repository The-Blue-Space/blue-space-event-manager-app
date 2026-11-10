// Link lifetimes come from blue-space-server (internal/user/services). Keep in sync if they change there.
export const SIGN_IN_LINK_MINUTES = 10;
export const RESET_LINK_HOURS = 1;
export const VERIFY_LINK_HOURS = 24;

// Seconds before someone can ask for another email.
export const RESEND_COOLDOWN_SECONDS = 45;

export const PASSWORD_MIN_LENGTH = 8;
export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 30;
