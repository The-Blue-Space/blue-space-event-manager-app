import { Badge } from "@/components/ui/badge";
import { Bell } from "lucide-react";

import * as React from "react";

export default React.memo(function Notifications() {
	const [showIndicator, setShowIndicator] = React.useState(true);

	const showNotification = () => {
		setShowIndicator(true);
	};
	
	return (
		<button onClick={showNotification} className="relative p-0 button-ghost">
			{showIndicator && (
				<Badge className="absolute right-0.5 top-0 !size-1.5 rounded-full bg-primary-300 p-0" />
			)}
			<Bell className="size-5" />
			{/* <Image src={assets.notification_icon_01} alt="notification" className="" /> */}
		</button>
	);
});
