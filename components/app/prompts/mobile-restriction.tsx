import { Construction } from "lucide-react";

export default function MobileRestriction() {
	return (
		<div className="flex flex-col items-center justify-center h-screen lg:gap-3 grow">
			<h1 className="capitalize heading-4">Mobile Device Detected</h1>
			<Construction className="w-10 h-10 text-orange-500" />
			{/* <Image
				src={underConstruction}
				alt="underConstruction"
				className="object-cover lg:w-1/3 h-96 lg:h-60"
			/> */}
			<span className="body-3 text-neutral-700">coming soon</span>
			<div className="flex flex-col items-center justify-center">
				<span className="text-center body-2 text-neutral-700">
					This app currently does not support mobile devices, <br /> kindly use a desktop device to
					access the app.
				</span>
			</div>
		</div>
	);
}
