import { ManagerProfile } from "@/types/user.types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type ManagerProfileState = {
	managerProfile: ManagerProfile|null;
};

const initialState: ManagerProfileState = {
	managerProfile: null,
};

const managerProfileSlice = createSlice({
	name: "manager_profile",
	initialState,
	reducers: {
		changeProfile: (state, action: PayloadAction<ManagerProfile>) => {
			return {
				...state,
				managerProfile: action.payload,
			};
		},

		updateProfile: (state, action: PayloadAction<Partial<ManagerProfile>>) => {
			if (!state.managerProfile) {
				return {
					...state,
				}
			}
			return {
				...state,
				managerProfile: { ...state.managerProfile, ...action.payload },
			};
		},
	},
});

export const { changeProfile, updateProfile } = managerProfileSlice.actions;
export default managerProfileSlice.reducer;
