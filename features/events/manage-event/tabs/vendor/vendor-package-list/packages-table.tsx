"use client";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { VendorPackage } from "@/types/vendor.types";
import { vendorPackageTypes } from "../data";
import { cn } from "@/lib/utils";
import TableActions from "./table-actions";
import { amountSeparator } from "@/lib/amount-separator";

type Props = {
	data: VendorPackage[];
	isEmpty: boolean;
	onViewDetails: (id: string) => void;
	onEdit: (pkg: VendorPackage) => void;
	onDelete: (id: string) => void;
};

export default function PackagesTable({
	data,
	isEmpty,
	onViewDetails,
	onEdit,
	onDelete,
}: Props) {
	const getPackageType = (price: number) => {
		return price > 0 ? "paid" : "free";
	};

	const getPackageTypeInfo = (price: number) => {
		const type = getPackageType(price);
		return vendorPackageTypes.find((t) => t.value === type);
	};

	return (
		<Table>
			<TableHeader>
				<TableRow className="bg-neutral-50">
					<TableHead className="w-[250px]">Package Name</TableHead>
					<TableHead>Price</TableHead>
					<TableHead>Quantity</TableHead>
					<TableHead>Remaining</TableHead>
					<TableHead>Max Per Vendor</TableHead>
					<TableHead>Approval</TableHead>
					<TableHead className="text-right">Actions</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{data.map((pkg) => {
					const typeInfo = getPackageTypeInfo(pkg.price);
					return (
						<TableRow
							key={pkg.id}
							className="cursor-pointer hover:bg-neutral-50"
							onDoubleClick={() => onViewDetails(pkg.id)}
						>
							<TableCell className="font-medium">
								<div className="flex items-center gap-2">
									<Badge className={cn("p-1 rounded-full", typeInfo?.badgeBg)}>
										{typeInfo?.smallIcon}
									</Badge>
									<div>
										<p className="font-medium">{pkg.name}</p>
										{pkg.description && (
											<p className="text-xs text-neutral-500 line-clamp-1">
												{pkg.description}
											</p>
										)}
									</div>
								</div>
							</TableCell>
							<TableCell>
								{pkg.price > 0 ? (
									<span className="font-medium">
										{pkg.currency?.symbol || ""} {amountSeparator(pkg.price)}
									</span>
								) : (
									<span className="text-neutral-500">Free</span>
								)}
							</TableCell>
							<TableCell>{pkg.total_quantity}</TableCell>
							<TableCell>
								<Badge
									variant={
										(pkg.remaining_slots ?? pkg.total_quantity) > 0
											? "default"
											: "destructive"
									}
								>
									{pkg.remaining_slots ?? pkg.total_quantity}
								</Badge>
							</TableCell>
							<TableCell>{pkg.max_per_vendor}</TableCell>
							<TableCell>
								<Badge
									variant={pkg.requires_approval ? "secondary" : "outline"}
								>
									{pkg.requires_approval ? "Required" : "Auto"}
								</Badge>
							</TableCell>
							<TableCell className="text-right">
								<TableActions
									pkg={pkg}
									onEdit={() => onEdit(pkg)}
									onDelete={() => onDelete(pkg.id)}
								/>
							</TableCell>
						</TableRow>
					);
				})}
			</TableBody>
		</Table>
	);
}
