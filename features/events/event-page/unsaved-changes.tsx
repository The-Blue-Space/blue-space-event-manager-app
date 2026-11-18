"use client";
import * as React from "react";

export type UnsavedChanges = {
	/** Something on the tab can't be saved right now (it needs a fix, or saving keeps failing). */
	readonly unsafeToLeave: boolean;
	/** Saves anything pending now. True when nothing is left unsaved. */
	flush: () => Promise<boolean>;
};

type Registry = React.MutableRefObject<UnsavedChanges | null>;

const UnsavedChangesContext = React.createContext<Registry | null>(null);

/** The event page asks the open tab to save before switching tabs or publishing. */
export const UnsavedChangesProvider = UnsavedChangesContext.Provider;

/** Lets the event page reach this tab's saving. */
export function useReportUnsavedChanges(state: UnsavedChanges) {
	const registry = React.useContext(UnsavedChangesContext);
	const latest = React.useRef(state);
	latest.current = state;
	React.useEffect(() => {
		if (!registry) return;
		const entry: UnsavedChanges = {
			get unsafeToLeave() {
				return latest.current.unsafeToLeave;
			},
			flush: () => latest.current.flush(),
		};
		registry.current = entry;
		return () => {
			if (registry.current === entry) registry.current = null;
		};
	}, [registry]);
}
