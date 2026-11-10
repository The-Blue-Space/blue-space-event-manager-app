"use client";
import * as React from "react";
import { APILoadingStatus, useApiLoadingStatus } from "@vis.gl/react-google-maps";

// Google can load the Maps script yet refuse to draw maps or answer searches (for example when billing is off on
// the key's project). Anything that sees that refusal reports it here, and the tab stops offering maps.
const MapsHealthContext = React.createContext<{ broken: boolean; reportBroken: () => void }>({
	broken: false,
	reportBroken: () => {},
});

export function MapsHealthProvider({ children }: { children: React.ReactNode }) {
	const [broken, setBroken] = React.useState(false);
	const reportBroken = React.useCallback(() => setBroken(true), []);
	const value = React.useMemo(() => ({ broken, reportBroken }), [broken, reportBroken]);
	return <MapsHealthContext.Provider value={value}>{children}</MapsHealthContext.Provider>;
}

export const useReportMapsBroken = () => React.useContext(MapsHealthContext).reportBroken;

/** Whether Google Maps works here: "pending" while loading. */
export function useMapsState(): "pending" | "ready" | "failed" {
	const status = useApiLoadingStatus();
	const { broken } = React.useContext(MapsHealthContext);
	if (broken || status === APILoadingStatus.FAILED || status === APILoadingStatus.AUTH_FAILURE) return "failed";
	if (status === APILoadingStatus.LOADED) return "ready";
	return "pending";
}
