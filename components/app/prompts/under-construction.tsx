import { underConstruction } from "@/constants/assets";
import Image from "next/image";

const UnderConstruction = () => {
	return (
		<div className="flex flex-col items-center justify-center h-full lg:gap-3 grow">
			<div className="text-center">
				<h1 className="capitalize heading-4 text-primary-500">Coming Soon</h1>
				<p className="body-1 text-neutral-700">we are working on it</p>
			</div>
			<Image
				src={underConstruction}
				alt="underConstruction"
				className="object-cover lg:w-1/3 h-96 lg:h-60"
			/>
			<div className="flex flex-col items-center justify-center">
				<span className="body-3 text-neutral-700">Under construction</span>
				<span className="body-3 text-neutral-700">coming soon</span>
			</div>
		</div>
	);
};

export default UnderConstruction;
