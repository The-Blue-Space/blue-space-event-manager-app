import { VendorPackageType } from "@/types/vendor.types";
import { CircleSlash, DollarSign } from "lucide-react";

export const vendorPackageTypes: {
	id: string;
	name: string;
	description: string;
	icon: React.ReactNode;
	badgeBg: string;
	value: VendorPackageType;
	smallIcon: React.ReactNode;
}[] = [
	{
		id: "1",
		name: "Paid",
		description: "Vendors pay for booth space at your event",
		icon: <DollarSign className="w-5 h-5 text-success-700" />,
		badgeBg: "bg-success-100/50",
		value: "paid",
		smallIcon: <DollarSign className="w-3 h-3 text-success-700" />,
	},
	{
		id: "2",
		name: "Free",
		description: "Offer free booth space to vendors",
		icon: <CircleSlash className="w-5 h-5 text-neutral-700" />,
		smallIcon: <CircleSlash className="w-3 h-3 text-neutral-700" />,
		badgeBg: "bg-neutral-200/50",
		value: "free",
	},
];

export const formFieldTypes = [
	{ value: "text", label: "Text Input" },
	{ value: "textarea", label: "Text Area" },
	{ value: "number", label: "Number" },
	{ value: "select", label: "Dropdown Select" },
	{ value: "checkbox", label: "Checkbox" },
];
