"use client";

import AppContainer from "@/components/app/container/container";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ManagerProfileTab from "./manager-profile";
import EventSettingsTab from "./event-settings";

export default function Settings() {
	return (
		<AppContainer>
			<div className="w-ful">
				<div className="mb-8">
					<h1 className="text-2xl font-bold text-neutral-900 mb-2">Settings</h1>
					<p className="body-2 text-neutral-600">
						Manage your manager profile and configure default event settings
					</p>
				</div>

				<Tabs defaultValue="manager-profile" className="w-full">
					<TabsList className=" mb-6">
						<TabsTrigger value="manager-profile" className="body-2">
							Manager Profile
						</TabsTrigger>
						<TabsTrigger value="event-settings" className="body-2">
							Event Settings
						</TabsTrigger>
					</TabsList>

					<TabsContent value="manager-profile">
						<ManagerProfileTab />
					</TabsContent>

					<TabsContent value="event-settings">
						<EventSettingsTab />
					</TabsContent>
				</Tabs>
			</div>
		</AppContainer>
	);
}
