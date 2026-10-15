import { useQuery } from "@tanstack/react-query";
import { AdminAccountError, fetchAdminAccount } from "./admin-account";
import { useSessionAuth } from "./AuthProvider";

export function useAdminAccount() {
    const auth = useSessionAuth();
    const query = useQuery({
        queryKey: ["admin-account", auth.sessionId ?? "signed-out"],
        queryFn: async () => {
            if (!auth.signedIn) return { isAdmin: false, studioScope: null, profile: null };
            const token = await auth.getToken();
            if (!token) throw new Error("Your session could not be verified. Please sign in again.");
            try { return await fetchAdminAccount(token); }
            catch (error) {
                if (error instanceof AdminAccountError && error.status === 401) await auth.signOut();
                throw error;
            }
        },
        enabled: auth.ready, staleTime: 300000, refetchInterval: false, retry: false,
    });
    return { ...query, isAdmin: auth.signedIn && query.data?.isAdmin === true && !query.isError };
}
