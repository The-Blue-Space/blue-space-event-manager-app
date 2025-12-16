import { clientQuery } from "@/config/query-client-config";

export default function invalidateQuery(queryKeys: string | string[]) {
	if (Array.isArray(queryKeys)) {
		queryKeys.forEach((queryKey) => {
			clientQuery.invalidateQueries({
				queryKey: [queryKey],
			});
		});
	} else {
		clientQuery.invalidateQueries({
			queryKey: [queryKeys],
		});
	}
}
