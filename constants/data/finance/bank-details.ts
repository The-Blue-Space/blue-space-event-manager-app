import { BankDetails } from "@/types/finance.types";

export const bankDetails: BankDetails[] = [
	{
		id: "bank_001",
		event_manager_id: "manager_001",
		bank_name: "Chase Bank",
		account_number: "1234567890",
		account_name: "John Doe",
		is_default: true,
		created_at: "2024-01-15T10:00:00.000Z",
		updated_at: "2024-01-15T10:00:00.000Z",
	},
	{
		id: "bank_002",
		event_manager_id: "manager_001",
		bank_name: "Bank of America",
		account_number: "9876543210",
		account_name: "John Doe",
		is_default: false,
		created_at: "2024-02-20T14:30:00.000Z",
		updated_at: "2024-02-20T14:30:00.000Z",
	},
];

