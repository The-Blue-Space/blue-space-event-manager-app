import { User } from "@/types/user.types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type AccountState = {
	account: User;
	token: string;
};

const initialState: AccountState = {
	account: {} as User,
	token: "",
};

const accountSlice = createSlice({
	name: "account",
	initialState,
	reducers: {
		changeAccount: (state, action: PayloadAction<User>) => {
			return {
				...state,
				account: action.payload,
			};
		},

		changeToken: (state, action: PayloadAction<string>) => {
			return {
				...state,
				token: action.payload,
			};
		},

		updateAccount: (state, action: PayloadAction<Partial<User>>) => {
			return {
				...state,
				account: { ...state.account, ...action.payload },
			};
		},
	},
});

export const { changeAccount, changeToken, updateAccount } = accountSlice.actions;
export default accountSlice.reducer;
