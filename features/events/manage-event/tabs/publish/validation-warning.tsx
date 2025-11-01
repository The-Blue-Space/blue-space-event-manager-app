import { AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type ValidationWarningProps = {
	missingFields: string[];
};

export default function ValidationWarning({ missingFields }: ValidationWarningProps) {
	if (missingFields.length === 0) return null;

	return (
		<div className="bg-warning-50 border border-warning-200 rounded-lg p-4 flex items-start gap-3">
			<AlertTriangle className="w-5 h-5 text-warning-600 flex-shrink-0 mt-0.5" />
			<div className="flex-1">
				<h4 className="body-2 font-semibold text-warning-900 mb-1">
					Please complete required fields before publishing
				</h4>
				<p className="body-3 text-warning-700 mb-2">
					The following required fields are missing or incomplete:
				</p>
				<div className="flex flex-wrap gap-2">
					{missingFields.map((field) => (
						<Badge
							key={field}
							variant="outline"
							className="bg-warning-100 text-warning-700 border-warning-300"
						>
							{field}
						</Badge>
					))}
				</div>
				<p className="body-3 text-warning-700 mt-2">
					Please complete these fields in their respective tabs before publishing your event.
				</p>
			</div>
		</div>
	);
}
