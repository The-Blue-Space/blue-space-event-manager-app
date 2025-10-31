import { clientQuery } from "@/config/query-client-config";
import getCountries from "@/services/extras/get-countries";
import getCurrencies from "@/services/extras/get-currencies";
import useActions from "@/store/actions";
import useAppSelector from "@/store/hooks";
import * as React from "react";
import { toast } from "sonner";

/**
 * This hook is used to initialize the app utilities
 * It fetches all global data and sets them in a global state like store e.g(currencies, countries, etc)
 * the utilities that are initialized here should be public utilities that don't require authentication
 */
export default function useInit() {
	const { countries, currencies } = useAppSelector("init");
	const { init } = useActions();

	const query = clientQuery;

	const getCurrencyList = React.useCallback(async () => {
		if (currencies.length) return;
		try {
			const response = await query.fetchQuery({
				queryKey: ["currencies"],
				queryFn: getCurrencies,
			});

			if (response) {
				init.setCurrencies(response);
			}
		} catch (error) {
			toast.error("Error getting currencies");
			throw error;
		}
	}, [currencies.length, init]);

	const getCountryList = React.useCallback(async () => {
		if (countries.length) return;
		try {
			const response = await query.fetchQuery({
				queryKey: ["countries"],
				queryFn: getCountries,
			});

			if (response) {
				init.setCountries(response);
			}
		} catch (error) {
			toast.error("Error getting countries");
			throw error;
		}
	}, [countries.length, init]);

	// const getBankList = React.useCallback(async () => {
	// 	if (banks.docs.length) return;
	// 	try {
	// 		const response = await query.fetchQuery({
	// 			queryKey: ["banks"],
	// 			queryFn: () => getBanks({ limit: 100 }),
	// 		});
	// 		if (response) {
	// 			init.setBanks(response);
	// 		}
	// 	} catch (error) {
	// 		toast.error("Error getting banks");
	// 		throw error;
	// 	}
	// }, [banks.docs.length, init]);

	React.useLayoutEffect(() => {
		getCurrencyList();
	}, [getCurrencyList]);

	React.useLayoutEffect(() => {
		getCountryList();
	}, [getCountryList]);

	// React.useLayoutEffect(() => {
	// 	getBankList();
	// }, [getBankList]);
}
