import { cn } from "@/lib/utils";
import AppButton from "@/components/app/app-button";
import { Edit3, Eye } from "lucide-react";
import { useEffect, useState } from "react";
import ErrorBoundary from "@/components/app/error-boundary";

type Props = {
	title: string;
	icon: React.ReactNode;
	children: (mode: "view" | "edit") => React.ReactNode;
	onSave?: () => Promise<void>;
	onCancel?: () => void;
	isLoading?: boolean;
	mode?: "view" | "edit";
	defaultMode?: "view" | "edit";
	className?: string;
	description?: string;
	onModeChange?: (mode: "view" | "edit") => void;
	showSaveButton?: boolean;
	showCancelButton?: boolean;
	editComponent?: React.ReactNode;
};

export default function SectionWrapper({
	title,
	icon,
	children,
	onSave,
	onCancel,
	isLoading = false,
	defaultMode = "view",
	description,
	className,
	mode: externalMode,
	onModeChange,
	showSaveButton = true,
	showCancelButton = true,
	editComponent,
}: Props) {
	const [internalMode, setInternalMode] = useState<"view" | "edit">(externalMode || defaultMode);
	const mode = externalMode !== undefined ? externalMode : internalMode;

	useEffect(() => {
		if (externalMode !== undefined) {
			setInternalMode(externalMode);
		}
	}, [externalMode]);

	const handleCancel = () => {
		const newMode = "view";
		if (externalMode === undefined) {
			setInternalMode(newMode);
		}
		onModeChange?.(newMode);
		onCancel?.();
	};

	const handleSave = async () => {
		if (onSave) {
			await onSave();
		}
		const newMode = "view";
		if (externalMode === undefined) {
			setInternalMode(newMode);
		}
		onModeChange?.(newMode);
	};

	const toggleMode = () => {
		const newMode = mode === "view" ? "edit" : "view";
		if (externalMode === undefined) {
			setInternalMode(newMode);
		}
		onModeChange?.(newMode);
	};

	return (
		<div className={cn("border border-neutral-200 rounded-lg p-5 bg-white", className)}>
			<ErrorBoundary>
				{/* Section Header */}
				<div className="mb-4 pb-3 border-b border-neutral-100 space-y-1">
					<div className="flex justify-between items-center">
						<h3 className="flex items-center gap-2 text-neutral-800">
							{icon}
							<span className="body-2 font-semibold text-primary-500">{title}</span>
						</h3>
						{editComponent ? (
							editComponent
						) : (
							<AppButton
								variant="outline"
								className="gap-2 rounded-lg"
								onClick={toggleMode}
								disabled={isLoading}
								leftIcon={
									mode === "view" ? <Edit3 className="w-4 h-4" /> : <Eye className="w-4 h-4" />
								}
							>
								{mode === "view" ? "Edit" : "View"}
							</AppButton>
						)}
					</div>
					{description && <p className="body-3 text-neutral-500">{description}</p>}
				</div>

				{/* Section Content */}
				<div>{children(mode)}</div>

				{/* Save/Cancel Actions (Only in Edit Mode) */}
				{mode === "edit" && (
					<div className="flex gap-3 justify-end mt-5 pt-4 border-t border-neutral-100">
						{showCancelButton && (
							<AppButton
								variant="outline"
								className="rounded-lg"
								onClick={handleCancel}
								disabled={isLoading}
							>
								Cancel
							</AppButton>
						)}
						{showSaveButton && (
							<AppButton
								variant="primary"
								className="rounded-lg"
								onClick={handleSave}
								isLoading={isLoading}
							>
								Save Changes
							</AppButton>
						)}
					</div>
				)}
			</ErrorBoundary>
		</div>
	);
}
