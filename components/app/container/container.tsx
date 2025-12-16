import classNames from "classnames";
import ErrorBoundary from "../error-boundary";

type ContainerProps = {
  children: React.ReactNode;
  className?: string;
};

export default function AppContainer({ children, className }: ContainerProps) {
  // md:max-w-4xl lg:max-w-7xl
	const cn = classNames(
		"px-5 lg:px-10 py-5 flex-wrap xl:flex-nowrap  md:max-w-4xl lg:max-w-7xl mx-auto w-full",
		className
	);
  return (
    <div className={cn}>
      <ErrorBoundary> {children}</ErrorBoundary>
    </div>
  );
}
