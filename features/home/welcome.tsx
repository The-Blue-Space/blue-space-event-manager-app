"use client";
import useAppSelector from "@/store/hooks";

export default function Welcome() {
	const { account } = useAppSelector("account");
	const { managerProfile } = useAppSelector("manager_profile");

	
	const hasManagerProfile = managerProfile !== null;

	const welcomeMessage = hasManagerProfile
		? "What will you be doing today"
		: "Let's get you started";
	return (
		<div className="body-1 font-bold text-primary-500">
			<span>Welcome, {account.username}</span>
			<span>👋🏾</span>
			<small className="text-neutral-500 block font-semibold">{welcomeMessage}</small>
		</div>
	);
}
