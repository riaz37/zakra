import type { ReactNode } from "react";
import { AdminShell } from "@/components/admin/shell";
import { AuthGuard } from "@/components/admin/auth-guard";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <AdminShell>{children}</AdminShell>
    </AuthGuard>
  );
}
