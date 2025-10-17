import { Badge } from "@/components/ui/badge";
import { Bell } from "lucide-react";

import * as React from "react";

export default React.memo(function Notifications() {
	const [showIndicator, setShowIndicator] = React.useState(true);

	const showNotification = () => {
		setShowIndicator(true);
	};
	
	return (
		<Badge className="bg-primary-300/30 rounded-full p-0 size-8 flex items-center justify-center">
			<button onClick={showNotification} className="relative p-0 button-ghost">
				{showIndicator && (
					<Badge className="absolute right-0.5 top-0 !size-1.5 rounded-full bg-accent-500 p-0" />
				)}
				<Bell className="size-5 text-primary-500" />
				{/* <Image src={assets.notification_icon_01} alt="notification" className="" /> */}
			</button>
		</Badge>
	);
});
