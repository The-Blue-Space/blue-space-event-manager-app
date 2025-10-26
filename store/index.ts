import { configureStore, Tuple } from "@reduxjs/toolkit";
import accountSlice from "./account.slice";
import uiSlice from "./ui.slice";
import { variables } from "@/constants";
import managerProfileSlice from "./manager-profile.slice";
import initSlice from "./init.slice";

export const store = configureStore({
	reducer: {
		ui: uiSlice,
		init: initSlice,
		account: accountSlice,
		manager_profile: managerProfileSlice,
	},
	devTools: variables.SERVICE_ENV === "development",
	middleware: () => new Tuple(),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
