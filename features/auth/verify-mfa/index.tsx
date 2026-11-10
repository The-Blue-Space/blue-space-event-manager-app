"use client";
import * as React from "react";
import { Check, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { variables } from "@/constants";
import useCookie from "@/hooks/use-cookie";
import useCustomNavigation from "@/hooks/use-navigation";
import sendMFACode from "@/services/account/send-mfa-code";
import verifyMFA from "@/services/account/verify-mfa";
import AuthButton, { authButtonClass } from "../components/auth-button";
import AuthShell from "../components/auth-shell";
import { AuthHeading, AuthSwitch, AuthTextLink, StatusTile } from "../components/auth-ui";
import { SIGN_IN_LINK_MINUTES } from "../constants";
import { describeError } from "../lib/messages";
import Link from "next/link";

type State = "loading" | "success" | "error";

export default function VerifyMFA() {
	const { get: getCookie, set: setCookie } = useCookie();
	const { queryParams, navigate } = useCustomNavigation();
	const [state, setState] = React.useState<State>("loading");
	const [email, setEmail] = React.useState("");
	const [isSending, setIsSending] = React.useState(false);
	// Sign-in links work once. Dev strict mode runs effects twice, so only verify once.
	const started = React.useRef(false);

	React.useEffect(() => {
		if (started.current) return;
		started.current = true;
		setEmail(getCookie<string>(variables.STORAGE_KEYS.email, "") ?? "");

		const token = queryParams.get("token");
		if (!token) {
			setState("error");
			return;
		}

		verifyMFA({ token })
			.then((res) => {
				if (!res) {
					setState("error");
					return;
				}
				setCookie(variables.STORAGE_KEYS.session, res.access_token, {
					expires: new Date(res.expires_in * 1000),
				});
				if (res.manager_profile?.id) {
					setCookie(variables.STORAGE_KEYS.manager_profile_id, res.manager_profile.id);
				}
				setState("success");
				navigate("/home", { replace: true });
			})
			.catch(() => setState("error"));
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const sendNewLink = async () => {
		setIsSending(true);
		try {
			await sendMFACode({ email });
			navigate("/mfa");
		} catch (error) {
			toast.error(describeError(error));
			setIsSending(false);
		}
	};

	return (
		<AuthShell>
			{state === "loading" && (
				<div className="grid gap-6" aria-live="polite">
					<StatusTile kind="info" icon={LoaderCircle} spin />
					<AuthHeading title="Logging you in…" description="Checking your sign-in link. Keep this page open." />
				</div>
			)}

			{state === "success" && (
				<div className="grid gap-6" aria-live="polite">
					<StatusTile kind="success" icon={Check} />
					<AuthHeading title="You’re logged in" description="Taking you to your dashboard." />
				</div>
			)}

			{state === "error" && (
				<div className="grid gap-6">
					<StatusTile kind="error" />
					<AuthHeading
						title="That sign-in link didn’t work"
						description={`It may have expired or already been used. Sign-in links last ${SIGN_IN_LINK_MINUTES} minutes and work once.`}
					/>
					{email ? (
						<AuthButton onClick={sendNewLink} isLoading={isSending} loadingText="Sending…">
							Send a new link
						</AuthButton>
					) : (
						<Link href="/" className={authButtonClass("primary")}>
							Log in again
						</Link>
					)}
					<AuthSwitch>
						<AuthTextLink href="/">Back to log in</AuthTextLink>
					</AuthSwitch>
				</div>
			)}
		</AuthShell>
	);
}
