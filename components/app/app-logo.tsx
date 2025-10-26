"use client";
import { assets } from "@/constants";
import classNames from "classnames";
import Image, { ImageProps } from "next/image";
import { useRouter } from "next/navigation";

export type LogoScope =
	| "logo_black"
	| "logo_blue"
	| "logo_text_black"
	| "logo_text_white"
	| "logo_text_blue"
	| "logo_white"
	| "logo_with_text_black"
	| "logo_with_text_blue"
	| "logo_with_text_white";

type AppLogoProps = {
	scope: LogoScope;
	size?: number;
	className?: string;
	clickable?: boolean;
	businessId?: string;
};
/**
 *this is the logo component for the app all logos variants are handled here
 *
 * @param {AppLogoProps} { scope = "logo_black", className = "size-20" }
 * scope definition - these are the scopes variants for the logo
 * logo_black
 * logo_blue
 * logo_text_black
 * logo_text_white
 * logo_text_blue
 * logo_white
 * logo_with_text_black
 * logo_with_text_blue
 * logo_with_text_white
 * logo_with_text_yellow
 *
 
 
 */
export default function AppLogo({
	scope = "logo_with_text_blue",
	className,
	size = 20,
	clickable = false,
}: AppLogoProps) {
	const width = size;
	const height = size;
	const cn = classNames("", className, { "cursor-pointer": clickable });

	const router = useRouter();
	const logo = assets[scope];

	const click = () => {
		if (clickable) {
			router.push("/");
		}
	};

	const imageProps: Omit<ImageProps, "src" | "alt"> = {
		width: width,
		height: height,
		className: cn,
		onClick: click,
	};

	if (logo) {
		return <Image src={logo} alt="logo" {...imageProps} />;
	}
	return null;
}
