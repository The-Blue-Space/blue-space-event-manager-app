import { clientQuery } from "@/config/query-client-config";

export default function useAppQueryClient() {

	const invalidateQueries = (queryKeys: string[]) => {
		clientQuery.invalidateQueries({
			queryKey: [...queryKeys],
		});
	};

	return { invalidateQueries };
}

