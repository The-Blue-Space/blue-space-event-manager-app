"use client";

import useAppSelector from "@/store/hooks";

export default function Welcome() {
	const { account } = useAppSelector("account");

	return (
		<div className="body-1 font-bold text-primary-500">
			<span>Welcome, {account.username}</span>
			<span>👋🏾</span>
			<small className="text-neutral-500 block font-semibold">What will you be doing today?</small>
		</div>
	);
}
