import { Image as ImageIcon } from "lucide-react";
import AppCheckbox from "@/components/app/app-checkbox";
import { PublishEventFormData } from "./schema";

type AlbumSettingsSectionProps = {
	formData: PublishEventFormData;
	updateForm: (field: keyof PublishEventFormData, value: any) => void;
};

export default function AlbumSettingsSection({ formData, updateForm }: AlbumSettingsSectionProps) {
	return (
		<div className="bg-neutral-50 rounded-lg border border-neutral-200 p-4 space-y-3">
			<div className="flex items-center gap-2">
				<ImageIcon className="w-4 h-4 text-accent-500" />
				<h3 className="body-2 font-semibold text-neutral-900">Album setting</h3>
			</div>

			<div className="space-y-3">
				<div>
					<AppCheckbox
						id="allow-individual-upload"
						checked={formData.allow_individual_upload}
						onCheckedChange={(checked) => updateForm("allow_individual_upload", checked)}
						label="Allow individual upload"
						labelClassName="font-medium !body-1"
						placement="right"
					/>
					<p className="body-3 -mt-1 text-neutral-700 ml-6">Attendees can upload to event album</p>
				</div>

				<div>
					<AppCheckbox
						id="allow-professional-upload"
						checked={formData.allow_professional_upload}
						onCheckedChange={(checked) => updateForm("allow_professional_upload", checked)}
						label="Allow professional upload"
						labelClassName="font-medium !body-1"
						placement="right"
					/>
					<p className="body-3 -mt-1 text-neutral-700 ml-6">Allow professionals to upload to album (e.g., freelance photographers)</p>
				</div>
			</div>
		</div>
	);
}
