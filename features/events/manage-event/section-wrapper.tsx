import { cn } from "@/lib/utils";
import AppButton from "@/components/app/app-button";
import { Edit3, Eye } from "lucide-react";
import { useState } from "react";
import ErrorBoundary from "@/components/app/error-boundary";

type Props = {
	title: string;
	icon: React.ReactNode;
	children: (mode: "view" | "edit") => React.ReactNode;
	onSave: () => Promise<void>;
	onCancel?: () => void;
	isLoading?: boolean;
	defaultMode?: "view" | "edit";
	className?: string;
};

export default function SectionWrapper({
	title,
	icon,
	children,
	onSave,
	onCancel,
	isLoading = false,
	defaultMode = "view",
	className,
}: Props) {
	const [mode, setMode] = useState<"view" | "edit">(defaultMode);

	const handleCancel = () => {
		setMode("view");
		onCancel?.();
	};

	const handleSave = async () => {
		await onSave();
		setMode("view");
	};

	const toggleMode = () => {
		setMode(mode === "view" ? "edit" : "view");
	};

	return (
		<div className={cn("border border-neutral-200 rounded-lg p-5 bg-white", className)}>
			<ErrorBoundary>
				{/* Section Header */}
				<div className="flex justify-between items-center mb-4 pb-3 border-b border-neutral-100">
					<h3 className="flex items-center gap-2 text-neutral-800">
						{icon}
						<span className="body-2 font-semibold">{title}</span>
					</h3>
					<AppButton
						variant="outline"
						className="gap-2 rounded-lg"
						onClick={toggleMode}
						disabled={isLoading}
						leftIcon={mode === "view" ? <Edit3 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
					>
						{mode === "view" ? "Edit" : "View"}
					</AppButton>
				</div>

				{/* Section Content */}
				<div>{children(mode)}</div>

				{/* Save/Cancel Actions (Only in Edit Mode) */}
				{mode === "edit" && (
					<div className="flex gap-3 justify-end mt-5 pt-4 border-t border-neutral-100">
						<AppButton
							variant="outline"
							className="rounded-lg"
							onClick={handleCancel}
							disabled={isLoading}
						>
							Cancel
						</AppButton>
						<AppButton
							variant="primary"
							className="rounded-lg"
							onClick={handleSave}
							isLoading={isLoading}
						>
							Save Changes
						</AppButton>
					</div>
				)}
			</ErrorBoundary>
		</div>
	);
}
