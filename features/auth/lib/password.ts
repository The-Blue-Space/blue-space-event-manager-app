import { PASSWORD_MIN_LENGTH } from "../constants";

// Mirrors blue-space-server: binding "min=8" plus ValidatePasswordRequirements
// (internal/user/services/structs.go). The letter check there is ASCII-only, so this one is too.
export const PASSWORD_RULES = [
	{ id: "length", label: `At least ${PASSWORD_MIN_LENGTH} characters`, test: (p: string) => p.length >= PASSWORD_MIN_LENGTH },
	{ id: "letter", label: "At least one letter", test: (p: string) => /[a-zA-Z]/.test(p) },
	{ id: "number", label: "At least one number", test: (p: string) => /[0-9]/.test(p) },
] as const;

/** bcrypt's limit on the server: longer passwords can't be stored. Checked separately, it's shown only when broken. */
export const PASSWORD_MAX_BYTES = 72;
export const passwordTooLong = (password: string) => new TextEncoder().encode(password).length > PASSWORD_MAX_BYTES;

export const meetsPasswordRules = (password: string) => PASSWORD_RULES.every((rule) => rule.test(password)) && !passwordTooLong(password);
