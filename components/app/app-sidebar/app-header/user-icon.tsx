import { User } from "lucide-react";
import AppDropdown from "../../app-dropdown";
// import useAppSelector from "@/store/hooks";
// import mergeText from "@/lib/transform-text";
import Logout from "./log-out";
import { Separator } from "@/components/ui/separator";

export default function UserIcon() {
	// const { account } = useAppSelector("account");
	const fullName = "";
	return (
		<AppDropdown
			contentStyle="p-0"
			triggerStyle="hover:scale-110 transition-all duration-300 hover:bg-neutral-200 rounded-full"
			trigger={<User className="!size-5" />}
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
							<small className="font-normal body-3 text-neutral-700">
								{/* {account?.user_id?.email} */}
							</small>
						</div>
					</div>
				</div>

				<Separator />
				<Logout />
			</div>
		</AppDropdown>
	);
}
