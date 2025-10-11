"use client";

import { Provider } from "react-redux";
import { store } from "@/store";
import { QueryClientProvider } from "@tanstack/react-query";
import AppToaster from "@/components/app/toaster";
import * as React from "react";

import { clientQuery } from "@/config/query-client-config";
import { TooltipProvider } from "@/components/ui/tooltip";

type Props = {
	children: React.ReactNode;
};
export default function AppLayout({ children }: Props) {
	return (
		<React.Fragment>
			<Provider store={store}>
				<QueryClientProvider client={clientQuery}>
					<TooltipProvider>
						{/* <Init /> */}
						{children}
						<AppToaster />
					</TooltipProvider>
				</QueryClientProvider>
			</Provider>
		</React.Fragment>
	);
}
