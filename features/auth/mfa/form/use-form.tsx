import { variables } from "@/constants";
import useCookie from "@/hooks/use-cookie";
import useCustomNavigation from "@/hooks/use-navigation";
import ensureError from "@/lib/ensure-error";
import verifyMFA from "@/services/account/verify-mfa";
import useActions from "@/store/actions";
import * as React from "react";

import { toast } from "sonner";
import { z } from "zod";

const validate = z.object({
	code: z.string().trim().length(6, "Authentication code must be 6 digits"),
});

type FormData = z.infer<typeof validate>;

const initial: FormData = {
	code: "",
};
export default function useForm() {
	const [isLoading, setIsLoading] = React.useState(false);
	const [formData, setFormData] = React.useState<FormData>(initial);
	const [errorMsg, setErrorMsg] = React.useState("");
	const { navigate, queryParams } = useCustomNavigation();
	const { get: getCookie, set: setCookie } = useCookie();
	const { account, managerProfile } = useActions();

	const sessionKey = variables.STORAGE_KEYS.session;
	const managerProfileIdKey = variables.STORAGE_KEYS.manager_profile_id;

	const token = queryParams.get("token");
	const updateForm = (e: string) => {
		setErrorMsg("");
		setFormData((prev) => ({
			...prev,
			code: e,
		}));
	};

	const submit = async (e: React.FormEvent) => {
		e.preventDefault();
		setErrorMsg("");
		setIsLoading(true);
		try {
			if (!token) throw new Error("No token found, try logging in again");

			const payload = {
				token: token,
			};
			const response = await verifyMFA(payload);
			if (response) {
				setCookie(sessionKey, response.access_token, { expires: response.expires_in });
				setCookie(managerProfileIdKey, response?.manager_profile?.id);
				account.changeToken(response.access_token);
				managerProfile.changeBusiness(response.manager_profile);

				toast.success("2FA code verified successfully");
				navigate("/dashboard", { replace: true });
			} else {
				throw new Error("Failed to verify 2FA code");
			}
		} catch (error) {
			const errMsg = ensureError(error);
			setErrorMsg(errMsg.message);
			toast.error(errMsg.message, {
				position: "top-left",
			});
		} finally {
			setIsLoading(false);
		}
	};

	return {
		isLoading,
		formData,
		errorMsg,
		updateForm,
		submit,
	};
}
