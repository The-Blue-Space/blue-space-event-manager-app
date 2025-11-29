import { Currency } from "@/types/global.types";
import { Country } from "@/types/global.types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type AccountBalancePayload = {
	available_balance: string;
};



type InitState = {
	activeCurrency: Currency;
	accountBalance: AccountBalancePayload;
	countries: Country[];
	currencies: Currency[];
};

const initialState: InitState = {
	activeCurrency: {} as Currency,
	accountBalance: {
		available_balance: "0.00",
	},
	countries: [],
	currencies: [],
};

/**
 * This slice is used to initialize the app
 * It fetches all global data and sets them in a global state like store e.g(currencies, countries, etc)
 */
const initSlice = createSlice({
	name: "init",
	initialState,
	reducers: {
		setActiveCurrency: (state, action: PayloadAction<Currency>) => {
			return {
				...state,
				activeCurrency: action.payload,
			};
		},
		setAccountBalance: (state, action: PayloadAction<AccountBalancePayload>) => {
			return {
				...state,
				accountBalance: action.payload,
			};
		},
		setCountries: (state, action: PayloadAction<Country[]>) => {
			return {
				...state,
				countries: action.payload,
			};
		},
		setCurrencies: (state, action: PayloadAction<Currency[]>) => {
			return {
				...state,
				currencies: action.payload,
			};
		},
	},
});

export const { setActiveCurrency, setAccountBalance, setCountries, setCurrencies } = initSlice.actions;
export default initSlice.reducer;
