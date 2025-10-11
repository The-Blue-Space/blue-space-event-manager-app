import * as React from 'react';
import classnames from 'classnames';
import ErrorBoundary from '../error-boundary';

type MinimumProps = {
  children?: any;
  className?: string;
};
export default React.memo(function Minimum({
  children,
  className,
}: MinimumProps) {
  const minimum = classnames('w-full xl:w-3/12 2xl:w-2/12', className);

  return (
    <div className={minimum}>
      <ErrorBoundary>{children}</ErrorBoundary>
    </div>
  );
});
