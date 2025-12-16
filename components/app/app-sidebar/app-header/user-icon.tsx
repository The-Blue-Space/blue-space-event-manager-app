import { User } from "lucide-react";
import AppDropdown from "../../app-dropdown";
import useAppSelector from "@/store/hooks";

import LogOut from "./log-out";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export default function UserIcon() {
	const { account } = useAppSelector("account");
	const fullName = account?.name;
	return (
		<AppDropdown
			contentStyle="p-0"
			triggerStyle="hover:scale-110 transition-all duration-300 hover:bg-neutral-200 rounded-full"
			trigger={
				<Badge className="bg-primary-300/30 rounded-full p-0 size-8 flex items-center justify-center">
					<User className="!size-5 text-primary-500" />
				</Badge>
			}
		>
			<div className="space-y">
				<div className="flex flex-col gap-3">
					<div className="flex items-start gap-3 p-3 bg-neutral-200">
						<User />
						{/* <AppImage src={assets.temp_01} alt="user" className="!size-10 rounded-full" /> */}
						<div className="flex flex-col">
							<span className="font-semibold capitalize body-3 line-clamp-1 text-black-base">
								{fullName}
							</span>
							<small className="font-normal body-3 text-neutral-700">{account?.email}</small>
						</div>
					</div>
				</div>

				<Separator />
				<LogOut scope="header" />
			</div>
		</AppDropdown>
	);
}
