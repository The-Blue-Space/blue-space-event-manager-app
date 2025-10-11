// import { BankResponse } from "@/services/bank/get-banks";
// import { Country } from "@/types/country.types";
// import { Currency } from "@/types/currency.types";
// import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// type InitState = {
// 	currencies: Currency[];
// 	countries: Country[];
// 	banks: BankResponse;
// };

// const initialState: InitState = {

// };

// /**
//  * This slice is used to initialize the app
//  * It fetches all global data and sets them in a global state like store e.g(currencies, countries, etc)
//  */
// const initSlice = createSlice({
// 	name: "init",
// 	initialState,
// 	reducers: {
// 		// setCurrencies: (state, action: PayloadAction<Currency[]>) => {
// 		// 	return {
// 		// 		...state,
// 		// 		currencies: action.payload,
// 		// 	};
// 		// },
// 		// setCountries: (state, action: PayloadAction<Country[]>) => {
// 		// 	return {
// 		// 		...state,
// 		// 		countries: action.payload,
// 		// 	};
// 		// },
// 		// setBanks: (state, action: PayloadAction<BankResponse>) => {
// 		// 	return {
// 		// 		...state,
// 		// 		banks: action.payload,
// 		// 	};
// 		// },
// 	},
// });

// // export const { setCurrencies, setCountries, setBanks } = initSlice.actions;
// export default initSlice.reducer;
