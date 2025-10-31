"use client";

import AppDrawer from "@/components/app/app-drawer";
import AppButton from "@/components/app/app-button";
import { SelectBox } from "@/components/app/form-input";
import AppSwitch from "@/components/app/app-switch";
import Render from "@/components/app/render";
import useTicketPromo from "./use-ticket-promo";
import DiscountForm from "./discount-form";
import FreebieForm from "./freebie-form";
import { PROMO_TYPES } from "@/types/event-ticket.types";

export default function TicketPromo() {
	const {
		open,
		onOpenChange,
		isLoading,
		tickets,
		selectedTicketId,
		setSelectedTicketId,
		isActive,
		setIsActive,
		promoType,
		setPromoType,
		initialValues,
		saving,
		handleSave,
	} = useTicketPromo();

	const ticketOptions = tickets.map((t) => ({ value: t.id, title: t.name }));
	const promoTypeOptions = PROMO_TYPES.map((t) => ({ value: t, title: t.split("_").join(" ") }));
	return (
		<AppDrawer
			title="Ticket Promo"
			open={open}
			direction="right"
			handleChange={onOpenChange}
			className="hide-scrollbar"
			showLogo={false}
			footer={
				<div className="flex justify-between border-t border-neutral-200 pt-2">
					<AppButton variant="outline" onClick={() => onOpenChange()}>
						Cancel
					</AppButton>
					<AppButton
						onClick={handleSave}
						isLoading={saving}
						variant="primary"
						disabled={!isActive || !selectedTicketId}
					>
						Save Promo
					</AppButton>
				</div>
			}
		>
			<Render isLoading={isLoading}>
				<div className="p-4 space-y-6">
					<SelectBox
						label="Select Ticket"
						placeholder="Choose ticket"
						options={ticketOptions}
						value={selectedTicketId || ""}
						onchange={(val) => setSelectedTicketId(val)}
						required
					/>

					<div className="flex items-center justify-between">
						<div>
							<p className="body-2 font-medium text-neutral-800">Promo Active</p>
							<p className="body-3 text-neutral-500">
								Toggle to enable or disable this ticket promo
							</p>
						</div>
						<AppSwitch
							disabled={!selectedTicketId}
							checked={isActive}
							onCheckedChange={setIsActive}
						/>
					</div>

					{isActive && selectedTicketId ? (
						<>
							<SelectBox
								label="Promo Type"
								placeholder="Choose promo type"
								options={promoTypeOptions}
								value={promoType}
								onchange={(val) => setPromoType(val as any)}
								required
							/>
							{promoType === "discount" ? (
								<DiscountForm initialValues={initialValues} />
							) : (
								<FreebieForm initialValues={initialValues} />
							)}
						</>
					) : null}
				</div>
			</Render>
		</AppDrawer>
	);
}
