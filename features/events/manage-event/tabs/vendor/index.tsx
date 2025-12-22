"use client";
import { Store } from "lucide-react";
import SectionWrapper from "../../section-wrapper";
import TabContainer from "../../tab-container";
import VendorPackageList from "./vendor-package-list";
import VendorDialogs from "./dialogs";

import useActions from "@/store/actions";
import AppButton from "@/components/app/app-button";

export default function VendorTab() {
	const { ui } = useActions();

	const handleAddPackage = () => {
		ui.changeDialog({
			show: true,
			type: "add_vendor_package",
		});
	};

	return (
		<TabContainer value="vendor" className="!max-w-5xl">
			<SectionWrapper
				title="Vendor Packages"
				icon={<Store className="w-5 h-5 text-primary-500" />}
				description="Create and manage vendor booth packages for your event"
				showSaveButton={false}
				showCancelButton={false}
				editComponent={
					<AppButton variant="outline" onClick={handleAddPackage}>
						Add Package
					</AppButton>
				}
			>
				{(sectionMode) => (sectionMode === "view" ? <VendorPackageList /> : null)}
			</SectionWrapper>

			<VendorDialogs />
		</TabContainer>
	);
}
