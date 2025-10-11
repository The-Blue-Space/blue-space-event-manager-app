"use client";
import { underConstruction } from "@/constants/assets";
import useCustomNavigation from "@/hooks/use-navigation";
import Image from "next/image";

const UnderConstruction = () => {
	const { pathname } = useCustomNavigation();
	const links = pathname.split("/");
	const name = links[links.length > 0 ? links.length - 1 : links.length];
	return (
		<div className="flex flex-col items-center justify-center h-full lg:gap-3 grow">
			<h1 className="capitalize heading-4 text-primary">{name.split("-").join(" ")} page</h1>
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
