"use client";
import * as React from "react";

const UnsavedChangesContext = React.createContext<React.MutableRefObject<boolean> | null>(null);

/** The event page reads this before switching tabs, so unsaved edits aren't lost without asking. */
export const UnsavedChangesProvider = UnsavedChangesContext.Provider;

/** Tells the event page whether this tab has unsaved changes. */
export function useReportUnsavedChanges(dirty: boolean) {
	const ref = React.useContext(UnsavedChangesContext);
	React.useEffect(() => {
		if (!ref) return;
		ref.current = dirty;
		return () => {
			ref.current = false;
		};
	}, [ref, dirty]);
}
