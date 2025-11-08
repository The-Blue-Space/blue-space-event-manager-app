"use client";

import React from "react";
import AppContainer from "@/components/app/container/container";
import { useQuery } from "@tanstack/react-query";
import getFinanceDashboard from "@/services/finance/get-finance-dashboard";
import deleteBankAccount from "@/services/finance/delete-bank-account";
import setDefaultBank from "@/services/finance/set-default-bank";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import OverviewCards from "./overview-cards";
import BankAccounts from "./bank-accounts";
import AddBankDrawer from "./add-bank-drawer";
import DeleteBankDialog from "./delete-bank-dialog";
import RequestPayoutTab from "./request-payout";
import PayoutHistoryTab from "./payout-history";
import DisputeDrawer from "./dispute-drawer";
import { BankDetails, Payout } from "@/types/finance.types";
import { toast } from "sonner";
import Render from "@/components/app/render";
import invalidateQuery from "@/lib/invalidate-query";

export default function Finance() {
	const [addBankDrawerOpen, setAddBankDrawerOpen] = React.useState(false);
	const [deleteBankDialogOpen, setDeleteBankDialogOpen] = React.useState(false);
	const [selectedBank, setSelectedBank] = React.useState<BankDetails | null>(null);
	const [isDeletingBank, setIsDeletingBank] = React.useState(false);
	const [disputeDrawerOpen, setDisputeDrawerOpen] = React.useState(false);
	const [selectedPayout, setSelectedPayout] = React.useState<Payout | null>(null);

	const {
		data: dashboardData,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["finance-dashboard"],
		queryFn: () => getFinanceDashboard(),
	});

	const handleSetDefault = async (bankId: string) => {
		try {
			await setDefaultBank({ bank_id: bankId });
			toast.success("Default bank updated successfully");
			invalidateQuery(["finance-dashboard"]);
		} catch (error: any) {
			toast.error(error?.message || "Failed to set default bank");
		}
	};

	const handleDeleteClick = (bankId: string) => {
		const bank = dashboardData?.bank_details.find((b) => b.id === bankId);
		if (bank) {
			setSelectedBank(bank);
			setDeleteBankDialogOpen(true);
		}
	};

	const handleDeleteConfirm = async () => {
		if (!selectedBank) return;

		setIsDeletingBank(true);
		try {
			await deleteBankAccount({ bank_id: selectedBank.id });
			toast.success("Bank account deleted successfully");
			invalidateQuery(["finance-dashboard"]);
			setDeleteBankDialogOpen(false);
			setSelectedBank(null);
		} catch (error: any) {
			toast.error(error?.message || "Failed to delete bank account");
		} finally {
			setIsDeletingBank(false);
		}
	};

	const handleDispute = (payout: Payout) => {
		setSelectedPayout(payout);
		setDisputeDrawerOpen(true);
	};

	const handleDisputeDrawerClose = () => {
		setDisputeDrawerOpen(false);
		setTimeout(() => setSelectedPayout(null), 300);
	};

	return (
		<>
			<AppContainer className="flex flex-col gap-5 overflow-hidden w-full">
				{/* Header */}
				<div>
					<h1 className="text-2xl font-bold text-neutral-900">Finance</h1>
					<p className="body-3 text-neutral-600 mt-1">Manage your payouts and bank accounts</p>
				</div>

				<Render isLoading={isLoading} error={error}>
					{/* Overview Cards */}
					<OverviewCards data={dashboardData} isLoading={isLoading} />

					{/* Bank Accounts */}
					<BankAccounts
						data={dashboardData}
						isLoading={isLoading}
						onAddBank={() => setAddBankDrawerOpen(true)}
						onSetDefault={handleSetDefault}
						onDelete={handleDeleteClick}
					/>

					{/* Tabs Section */}
					<Tabs defaultValue="request" className="w-full">
						<TabsList>
							<TabsTrigger value="request">Request Payout</TabsTrigger>
							<TabsTrigger value="history">Payout History</TabsTrigger>
						</TabsList>
						<TabsContent value="request" className="mt-4">
							<RequestPayoutTab />
						</TabsContent>
						<TabsContent value="history" className="mt-4">
							<PayoutHistoryTab onDispute={handleDispute} />
						</TabsContent>
					</Tabs>
				</Render>
			</AppContainer>

			{/* Drawers */}
			<AddBankDrawer open={addBankDrawerOpen} onClose={() => setAddBankDrawerOpen(false)} />
			<DisputeDrawer
				open={disputeDrawerOpen}
				onClose={handleDisputeDrawerClose}
				payout={selectedPayout}
			/>

			{/* Delete Bank Dialog */}
			<DeleteBankDialog
				open={deleteBankDialogOpen}
				bank={selectedBank}
				onClose={() => {
					setDeleteBankDialogOpen(false);
					setTimeout(() => setSelectedBank(null), 300);
				}}
				onConfirm={handleDeleteConfirm}
				isLoading={isDeletingBank}
			/>
		</>
	);
}
