import AppLogo from "@/components/app/app-logo";
import AuthLink from "./auth-link";
import ErrorBoundary from "../../error-boundary";
import classNames from "classnames";

export type AuthLinkType = "login" | "register";

type ContainerProps = {
	children: React.ReactNode;
	auth_link?: AuthLinkType;
	className?: string;
	showHero?: boolean;
};
export default function AuthContainer({ children, auth_link, className }: ContainerProps) {
	const container = classNames("flex flex-col gap-12 p-10 px-5 lg:px-20 w-full", className);
	return (
		<div className="flex justify-between h-screen xl:overflow-hidden">
			<div className={container}>
				<header className="flex items-center justify-between border-b border-neutral-200 pb-3">
					<AppLogo scope="logo_blue" size={50} />
					<AuthLink link_type={auth_link} />
				</header>
				<div className="w-full mx-auto max-w-md">
					<ErrorBoundary>
						<div className="flex justify-center">
							<AppLogo scope="logo_text_blue" size={200} />
						</div>
						{children}
					</ErrorBoundary>
				</div>
			</div>
		</div>
	);
}
