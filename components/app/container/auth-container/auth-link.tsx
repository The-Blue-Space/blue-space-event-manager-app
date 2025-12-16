import Link from "next/link";
import { AuthLinkType } from ".";

type AuthLinkProps = {
	link_type?: AuthLinkType;
};
export default function AuthLink({ link_type }: AuthLinkProps) {
	if (!link_type) return null;

	const data = authLinkData[link_type];

	if (!data) return null;

	return (
		<div className="flex items-center gap-0.5 flex-col lg:flex-row text-right lg:text-left">
			<p className="text-neutral-600 body-2  whitespace-nowrap">{data.text}</p>
			<Link href={data.link_href} className="w-full font-semibold body-2 text-primary-800">
				{data.link_text}
			</Link>
		</div>
	);
}

const authLinkData = {
	register: {
		text: "Don't have an account?",
		link_text: "Create Account",
		link_href: "/register",
	},
	login: {
		text: "Already have an account?",
		link_text: "Log in",
		link_href: "/",
	},
};
