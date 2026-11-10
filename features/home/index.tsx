"use client";
import AppContainer from "@/components/app/container/container";
import useAppSelector from "@/store/hooks";
import Dashboard from "./dashboard";
import SetUpProfile from "./set-up-profile";
import Welcome from "./welcome";

export default function Home() {
	const { managerProfile } = useAppSelector("manager_profile");

	if (!managerProfile) {
		return (
			<AppContainer className="flex w-full flex-col gap-5 overflow-hidden">
				<Welcome />
				<SetUpProfile />
			</AppContainer>
		);
	}

	return <Dashboard />;
}
