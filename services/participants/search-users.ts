import { variables } from "@/constants";
import { users } from "@/constants/data/user";
import axios from "@/lib/axios";
import { User } from "@/types/user.types";

type Parameters = {
	query: string;
	searchBy: "email" | "username";
};

type Response = User[];

export async function production(params: Parameters): Promise<Response> {
	const { query, searchBy } = params;
	const response = await axios.get(`/v1/users/lookup?${searchBy}=${query}`);
	return response.data;
}

export async function development(params: Parameters): Promise<Response> {
	const { query, searchBy } = params;

	// Filter users based on search query
	const filteredUsers = users.filter((user) => {
		const searchValue = searchBy === "email" ? user.email : user.username;
		return searchValue?.toLowerCase().includes(query.toLowerCase());
	});

	return new Promise((resolve) => {
		setTimeout(() => resolve(filteredUsers), 800);
	});
}

export default async function searchUsers(params: Parameters): Promise<Response> {
	if (variables.SERVICE_ENV === "development") return development(params);
	return production(params);
}
