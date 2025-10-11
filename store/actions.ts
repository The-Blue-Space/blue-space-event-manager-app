import { User } from "@/types/user.types";
import { changeToken } from "./account.slice";
import { updateAccount } from "./account.slice";
import { changeAccount } from "./account.slice";
import { useAppDispatch } from "./hooks";
import { changePageTitle, DialogPayload, resetDialog } from "./ui.slice";
import { changeDialog } from "./ui.slice";
import { ManagerProfile } from "@/types/user.types";
import { changeProfile, updateProfile } from "./manager-profile.slice";

export default function useActions() {
	const dispatch = useAppDispatch();

	const ui = {
		changeDialog: (dialog: DialogPayload) => dispatch(changeDialog(dialog)),
		changePageTitle: (title: string) => dispatch(changePageTitle(title)),
		resetDialog: () => dispatch(resetDialog()),
	};

	const init = {};

	const account = {
		changeAccount: (account: User) => dispatch(changeAccount(account)),
		changeToken: (token: string) => dispatch(changeToken(token)),
		updateAccount: (account: Partial<User>) => dispatch(updateAccount(account)),
	};

	const managerProfile = {
		changeBusiness: (business: ManagerProfile) => dispatch(changeProfile(business)),
		updateBusiness: (business: Partial<ManagerProfile>) => dispatch(updateProfile(business)),
	};

	return {
		ui,
		init,
		account,
		managerProfile,
	};
}
