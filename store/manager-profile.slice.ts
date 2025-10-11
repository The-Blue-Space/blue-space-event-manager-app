import { ManagerProfile } from "@/types/user.types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type ManagerProfileState = {
	manager_profile: ManagerProfile;
};

const initialState: ManagerProfileState = {
	manager_profile: {} as ManagerProfile,
};

const managerProfileSlice = createSlice({
	name: "manager_profile",
	initialState,
	reducers: {
		changeProfile: (state, action: PayloadAction<ManagerProfile>) => {
			return {
				...state,
				manager_profile: action.payload,
			};
		},

		updateProfile: (state, action: PayloadAction<Partial<ManagerProfile>>) => {
			return {
				...state,
				manager_profile: { ...state.manager_profile, ...action.payload },
			};
		},
	},
});

export const { changeProfile, updateProfile } = managerProfileSlice.actions;
export default managerProfileSlice.reducer;
