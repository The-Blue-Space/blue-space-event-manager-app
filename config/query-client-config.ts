import { QueryClient, QueryClientConfig } from "@tanstack/react-query";

export const queryClientConfig: QueryClientConfig = {
	defaultOptions: {
		queries: {
			// refetchOnWindowFocus: variables.SERVICE_ENV !== "development",
			refetchOnWindowFocus:false
		},
	},
};

export const clientQuery = new QueryClient(queryClientConfig);
