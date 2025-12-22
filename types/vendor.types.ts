import { Currency } from "./global.types";

// Vendor Package Types
export type VendorPackageType = "paid" | "free";

export interface FormSchemaField {
	field_name: string;
	field_type: "text" | "textarea" | "number" | "select" | "checkbox";
	label: string;
	required: boolean;
	placeholder?: string;
	options?: string[]; // For select fields
}

export interface VendorPackage {
	id: string;
	event_id: string;
	name: string;
	description: string;
	price: number;
	currency_id: string;
	currency?: Currency;
	total_quantity: number;
	max_per_vendor: number;
	requires_approval: boolean | null;
	amenities: Record<string, unknown>;
	form_schema: FormSchemaField[];
	remaining_slots?: number;
	is_active: boolean;
	created_at: string;
	updated_at: string;
}

// Vendor Application Types
export type VendorApplicationStatus =
	| "pending"
	| "approved"
	| "rejected"
	| "waitlisted"
	| "cancelled";

export interface VendorApplication {
	id: string;
	event_id: string;
	package_id: string;
	vendor_profile_id: string;
	quantity: number;
	status: VendorApplicationStatus;
	form_responses: Record<string, unknown>;
	notes?: string;
	rejection_reason?: string;
	waitlist_position?: number;
	approved_at?: string;
	rejected_at?: string;
	created_at: string;
	updated_at: string;
	// Relations
	package?: VendorPackage;
	vendor_profile?: VendorProfile;
}

// Vendor Profile Types
export interface VendorProfile {
	id: string;
	user_id: string;
	business_name: string;
	business_category?: string;
	description?: string;
	website_url?: string;
	logo_url?: string;
	tax_id?: string;
	created_at: string;
	updated_at: string;
}

// Vendor Payment Types
export type VendorPaymentStatus = "pending" | "success" | "failed";

export interface VendorPayment {
	id: string;
	application_id: string;
	amount: number;
	currency_id: string;
	reference: string;
	status: VendorPaymentStatus;
	payment_url?: string;
	paid_at?: string;
	created_at: string;
	updated_at: string;
}

// Response types
export interface VendorPaymentResponse {
	payment_url: string;
	reference: string;
	amount: number;
}
