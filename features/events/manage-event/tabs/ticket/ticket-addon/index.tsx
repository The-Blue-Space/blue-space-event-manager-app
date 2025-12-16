"use client";
import { Package } from "lucide-react";
import SectionWrapper from "../../../section-wrapper";
import AddonList from "./addon-list";
import useActions from "@/store/actions";
import AppButton from "@/components/app/app-button";

export default function TicketAddonTab() {
	const { ui } = useActions();

	const handleAddAddon = () => {
		ui.changeDialog({
			show: true,
			type: "add_event_addon",
		});
	};

	return (
		<SectionWrapper
			title="Event Ticket Addons"
			className="!mt-20"
			icon={<Package className="w-5 h-5 text-primary-500" />}
			description="Create and manage addons (parking, extra tables, drinks, etc.) that can be attached to tickets or sold standalone"
			showSaveButton={false}
			showCancelButton={false}
			editComponent={
				<AppButton variant="outline" onClick={handleAddAddon}>
					Add Addon
				</AppButton>
			}
		>
			{() => <AddonList />}
		</SectionWrapper>
	);
}
