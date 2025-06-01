'use client';

import { FiSettings } from 'react-icons/fi';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ComingSoon } from '@/components/ui/ComingSoon';
import { AdminRoute } from '@/components/auth/ProtectedRoute';

export default function AdminPage() {
  return (
    <AdminRoute>
      <DashboardLayout>
        <ComingSoon
          title="Panel de Administración"
          description="Aquí podrás gestionar usuarios del sistema, configuraciones y otras funciones administrativas. Esta funcionalidad está en desarrollo."
          icon={FiSettings}
        />
      </DashboardLayout>
    </AdminRoute>
  );
}