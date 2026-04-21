import { useAuthStore } from "@/store/authStore";

/**
 * Returns the active company_id for the signed-in user.
 * Most data endpoints require company_id as a query param.
 */
export function useCurrentCompanyId(): string | undefined {
  return useAuthStore((s) => s.user?.company_id ?? undefined);
}
