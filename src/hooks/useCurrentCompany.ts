import { useAuthStore } from '@/store/authStore';
import { useCompanyStore } from '@/store/companyStore';

/**
 * Returns the active company_id for the signed-in user.
 * super_admin: uses selectedCompanyId from companyStore (can be switched),
 * falling back to their own company_id.
 * admin / regular: always their own company_id.
 */
export function useCurrentCompanyId(): string | undefined {
  const user = useAuthStore((s) => s.user);
  const selectedCompanyId = useCompanyStore((s) => s.selectedCompanyId);

  if (user?.user_type === 'super_admin') {
    return (selectedCompanyId ?? user.company_id) ?? undefined;
  }
  return user?.company_id ?? undefined;
}
