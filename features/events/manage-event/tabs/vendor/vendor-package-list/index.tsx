"use client";
import EmptyData from "@/components/app/empty-data";
import Render from "@/components/app/render";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import useCustomNavigation from "@/hooks/use-navigation";
import { cn } from "@/lib/utils";
import getVendorPackages from "@/services/events/vendor-packages/get-vendor-packages";
import deleteVendorPackage from "@/services/events/vendor-packages/delete-vendor-package";
import useActions from "@/store/actions";
import { useQuery } from "@tanstack/react-query";
import { vendorPackageTypes } from "../data";
import { VendorPackage } from "@/types/vendor.types";
import { toast } from "sonner";
import ensureError from "@/lib/ensure-error";
import invalidateQuery from "@/lib/invalidate-query";
import PackagesTable from "./packages-table";
import { useState } from "react";

export default function VendorPackageList() {
	const { params } = useCustomNavigation();
	const { ui } = useActions();
	const event_id = params.event_id as string;
	const [selectedPackageId, setSelectedPackageId] = useState<string | null>(null);

	const { data, isLoading, isError, error } = useQuery({
		queryKey: ["vendor-packages", event_id],
		queryFn: () => getVendorPackages({ event_id }),
		enabled: !!event_id,
	});

	const handleCreatePackage = (packageType: string) => {
		ui.changeDialog({
			show: true,
			type: "add_vendor_package",
			data: {
				packageType,
			},
		});
	};

	const handleEditPackage = (pkg: VendorPackage) => {
		ui.changeDialog({
			show: true,
			type: "edit_vendor_package",
			data: pkg,
		});
	};

	const handleDeletePackage = async (packageId: string) => {
		try {
			await deleteVendorPackage({ id: packageId, event_id });
			toast.success("Package deleted successfully");
			invalidateQuery(["vendor-packages"]);
		} catch (err) {
			const errMsg = ensureError(err).message;
			toast.error(errMsg);
		}
	};

	const handleViewPackage = (packageId: string) => {
		setSelectedPackageId(packageId);
		// Could open a details drawer here if needed
	};

	return (
		<div className="min-h-60">
			<Render isLoading={isLoading} isError={isError} error={error}>
				{data && data.length > 0 ? (
					<div className="w-full max-h-screen overflow-y-auto rounded-lg border border-neutral-200">
						<PackagesTable
							data={data}
							isEmpty={false}
							onViewDetails={handleViewPackage}
							onEdit={handleEditPackage}
							onDelete={handleDeletePackage}
						/>
					</div>
				) : (
					<EmptyData
						showIcon={false}
						text="Create your first vendor package. Select a package type to get started."
						action={
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								{vendorPackageTypes.map((item) => (
									<Card
										key={item.id}
										className="p-4 flex items-start gap-3 hover:bg-badge/10 cursor-pointer transition-all duration-300"
										onClick={() => handleCreatePackage(item.value)}
									>
										<Badge className={cn("p-2 rounded-full", item.badgeBg)}>{item.icon}</Badge>
										<div>
											<h5 className="body-2 font-medium text-primary-500">{item.name}</h5>
											<p className="body-2 text-neutral-500">{item.description}</p>
										</div>
									</Card>
								))}
							</div>
						}
					/>
				)}
			</Render>
		</div>
	);
}
