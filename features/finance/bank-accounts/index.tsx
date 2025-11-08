"use client";

import { BankDetails, FinanceDashboard } from "@/types/finance.types";
import BankCard from "./bank-card";
import AppButton from "@/components/app/app-button";
import { Plus } from "lucide-react";
import EmptyData from "@/components/app/empty-data";
import { useEffect, useState } from "react";

type BankAccountsProps = {
	data: FinanceDashboard | undefined;
	isLoading: boolean;
	onAddBank: () => void;
	onSetDefault: (bankId: string) => void;
	onDelete: (bankId: string) => void;
};

export default function BankAccounts({
	data,
	isLoading,
	onAddBank,
	onSetDefault,
	onDelete,
}: BankAccountsProps) {
	const [bankList, setBankList] = useState<BankDetails[]>(data?.bank_details || []);

	useEffect(() => {
		setBankList(data?.bank_details || []);
	}, [data]);

	if (isLoading) {
		return (
			<div className="space-y-3">
				<div className="flex items-center justify-between">
					<h2 className="body-1 font-semibold text-neutral-900">Bank Accounts</h2>
				</div>
				<div className="flex gap-4 py-1 overflow-auto snap-x snap-mandatory hide-scrollbar w-full">
					{[1, 2].map((i) => (
						<div
							key={i}
							className="bg-neutral-200 rounded-lg p-4 h-20 animate-pulse w-full min-w-[320px] lg:min-w-0 snap-start"
						/>
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="space-y-3">
			<div className="flex items-center justify-between">
				<h2 className="body-1 font-semibold text-neutral-900">Bank Accounts</h2>
				<AppButton variant="outline" onClick={onAddBank} leftIcon={<Plus className="w-4 h-4" />}>
					Add Bank
				</AppButton>
			</div>

			{bankList.length === 0 ? (
				<EmptyData
					title="No banks added"
					text="Add a bank account to start receiving payouts"
					className="!justify-start py-8 border border-dashed border-neutral-300 rounded-lg"
				/>
			) : (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-1 overflow-auto snap-x snap-mandatory hide-scrollbar w-full">
					{bankList.map((bank) => (
						<BankCard key={bank.id} bank={bank} onSetDefault={onSetDefault} onDelete={onDelete} />
					))}
				</div>
			)}
		</div>
	);
}

// <div className="flex gap-4 py-1 overflow-auto snap-x snap-mandatory hide-scrollbar w-full">
// 	{banks.map((bank) => (
// 		<BankCard key={bank.id} bank={bank} onSetDefault={onSetDefault} onDelete={onDelete} />
// 	))}
// </div>;
