import { Globe, Lock } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { PublishEventFormData } from "./schema";

type EventPrivacySectionProps = {
	formData: PublishEventFormData;
	updateForm: (field: keyof PublishEventFormData, value: any) => void;
};

export default function EventPrivacySection({ formData, updateForm }: EventPrivacySectionProps) {
	return (
		<div className="bg-neutral-50 rounded-lg border border-neutral-200 p-4 space-y-3">
			<div className="flex items-center gap-2">
				{formData.is_private ? (
					<Lock className="w-4 h-4 text-accent-500" />
				) : (
					<Globe className="w-4 h-4 text-accent-500" />
				)}
				<h3 className="body-2 font-semibold text-neutral-900">Is your event private?</h3>
			</div>

			<RadioGroup
				value={formData.is_private ? "private" : "public"}
				onValueChange={(value) => updateForm("is_private", value === "private")}
				className="space-y-3"
			>
				<div className="flex items-center gap-2">
					<RadioGroupItem value="public" id="privacy-public" />
					<Label htmlFor="privacy-public" className="body-3 text-neutral-700 cursor-pointer">
						Public - publish it publicly on Blue Space
					</Label>
				</div>
				<div className="flex items-center gap-2">
					<RadioGroupItem value="private" id="privacy-private" />
					<Label htmlFor="privacy-private" className="body-3 text-neutral-700 cursor-pointer">
						Private - strictly on invite only
					</Label>
				</div>
			</RadioGroup>
		</div>
	);
}
