import ErrorBoundary from "@/components/app/error-boundary";
import BrandPanel from "./brand-panel";

type AuthShellProps = {
	children: React.ReactNode;
};

/** Split layout for every signed-out screen: indigo brand panel on the left, the task on the right. */
export default function AuthShell({ children }: AuthShellProps) {
	return (
		<div className="min-h-dvh bg-auth-page font-manrope text-auth-ink lg:grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
			<BrandPanel />
			<main className="flex min-h-[calc(100dvh-58px)] flex-col px-5 pb-5 pt-7 lg:min-h-dvh lg:px-8 lg:pb-6 lg:pt-10">
				<div className="mx-auto flex w-full max-w-[400px] flex-1 flex-col justify-start py-2 lg:justify-center lg:py-6">
					<ErrorBoundary>{children}</ErrorBoundary>
				</div>
				<p className="mt-8 text-center text-[12px] text-auth-muted">© {new Date().getFullYear()} Blue Space</p>
			</main>
		</div>
	);
}
