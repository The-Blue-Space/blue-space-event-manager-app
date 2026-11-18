"use client";
import { variables } from "@/constants";
import useCookie from "@/hooks/use-cookie";
import { ManagerProfile } from "@/types/user.types";

type Session = {
	access_token: string;
	manager_profile?: ManagerProfile | null;
	expires_in: number;
};

/** Stores a finished sign-in: from the emailed link (verify-mfa), or from logging in on a browser we know. */
export default function useFinishSignIn() {
	const { set: setCookie, delete: deleteCookie } = useCookie();

	return (session: Session) => {
		setCookie(variables.STORAGE_KEYS.session, session.access_token, {
			expires: new Date(session.expires_in * 1000),
		});
		// Always replace it: a profile id left by someone who used this browser before isn't this person's
		if (session.manager_profile?.id) {
			setCookie(variables.STORAGE_KEYS.manager_profile_id, session.manager_profile.id);
		} else {
			deleteCookie(variables.STORAGE_KEYS.manager_profile_id);
		}
		// Only needed while a sign-in is pending (to resend the link)
		deleteCookie(variables.STORAGE_KEYS.email);
	};
}
