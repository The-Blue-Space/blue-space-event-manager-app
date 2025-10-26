// config/auth-context.tsx
"use client";

import LoadingBox from "@/components/app/loading-box";
import { clientQuery } from "@/config/query-client-config";
import { variables } from "@/constants";
import useCookie from "@/hooks/use-cookie";
import useCustomNavigation from "@/hooks/use-navigation";
import axios from "@/lib/axios";
import logoutAccount from "@/services/account/logout";
import whoami from "@/services/account/whoami";
import useActions from "@/store/actions";
import useAppSelector from "@/store/hooks";
import { User } from "@/types/user.types";
import Link from "next/link";
import * as React from "react";
import { toast } from "sonner";

// Define the shape of the context
interface AuthContextType {
	isLoading: boolean;
	isAuthenticated: boolean;
	logout: () => Promise<void>;
	account: User;
}

// Create the context with a default value
const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

// Custom hook to access the context
export function useAuth() {
	const context = React.useContext(AuthContext);
	if (!context) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}

// AuthProvider component
interface AuthProviderProps {
	children: React.ReactNode;
}

export const AuthGateProvider: React.FC<AuthProviderProps> = ({ children }) => {
	const [isLoading, setIsLoading] = React.useState(true);
	const [isAuthenticated, setIsAuthenticated] = React.useState(false);
	const { account } = useAppSelector("account");
	const interceptor = React.useRef<number | null>(null);
	const { get: getCookie, delete: deleteCookie } = useCookie();
	const { account: accountActions, managerProfile: managerProfileActions } = useActions();
	const { navigate } = useCustomNavigation();
	const query = clientQuery;
	const sessionKey = variables.STORAGE_KEYS.session;

	const businessIdKey = variables.STORAGE_KEYS.manager_profile_id;

	const authToken = React.useMemo(() => getCookie(sessionKey, ""), [getCookie, sessionKey]);
	const businessId = React.useMemo(() => getCookie(businessIdKey, ""), [getCookie, businessIdKey]);
	// Setup interceptor function
	const setupInterceptor = React.useCallback(() => {
		if (interceptor.current !== null) {
			// Remove existing interceptor first
			axios.interceptors.request.eject(interceptor.current);
		}

		if (authToken) {
			const value = axios.interceptors.request.use(
				(config) => {
					try {
						config.headers.Authorization = `Bearer ${authToken}`;
						if (businessId) {
							config.headers["X-Business-ID"] = businessId;
						}
						return config;
					} catch (error) {
						return Promise.reject(error);
					}
				},
				(error) => Promise.reject(error)
			);
			interceptor.current = value;
		}
	}, [authToken, businessId]);

	const logout = React.useCallback(async () => {
		try {
			await logoutAccount();
		} catch (error) {
			throw error;
		} finally {
			// Clean up interceptor
			if (interceptor.current !== null) {
				axios.interceptors.request.eject(interceptor.current);
				interceptor.current = null;
			}
			deleteCookie(sessionKey);
			setIsAuthenticated(false);
			navigate("/", { replace: true });
		}
	}, [deleteCookie, navigate, sessionKey]);

	const session = React.useCallback(async () => {
		if (isAuthenticated) {
			setIsLoading(false);
			return;
		}

		setIsLoading(true);

		if (!authToken) {
			setIsAuthenticated(false);
			setIsLoading(false);
			return;
		}

		try {
			// Setup interceptor before making the whoami call
			setupInterceptor();

			const response = await query.fetchQuery({
				queryKey: ["whoami"],
				queryFn: whoami,
			});
			accountActions.changeAccount(response.user);
			managerProfileActions.changeProfile(response.managerProfile);
			setIsAuthenticated(true);
		} catch (error) {
			toast.error("Failed to authenticate user");

			logout();
			throw error;
		} finally {
			setIsLoading(false);
		}
	}, [authToken, isAuthenticated, logout, accountActions, setupInterceptor]);

	// Setup interceptor whenever authToken changes and user is authenticated
	React.useEffect(() => {
		if (isAuthenticated && authToken) {
			setupInterceptor();
		}
	}, [authToken, isAuthenticated, setupInterceptor]);

	React.useEffect(() => {
		session();

		// // Cleanup function
		return () => {
			if (interceptor.current !== null) {
				axios.interceptors.request.eject(interceptor.current);
			}
		};
	}, []);

	// Memoize context value to prevent unnecessary re-renders
	const contextValue = React.useMemo(
		() => ({
			isLoading,
			isAuthenticated,
			logout,
			account: account,
		}),
		[isLoading, isAuthenticated, logout, account]
	);

	if (isLoading) return <LoadingBox type="screen" load_type="spinner" />;

	return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export default function AuthGate({ children }: { children: React.ReactNode }) {
	const { isAuthenticated } = useAuth();
	if (!isAuthenticated) {
		return <Link href="/" replace />;
	}
	return <React.Fragment>{children}</React.Fragment>;
}
