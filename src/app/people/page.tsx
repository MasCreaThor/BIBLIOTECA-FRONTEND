'use client';

import { FiUsers } from 'react-icons/fi';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ComingSoon } from '@/components/ui/ComingSoon';

export default function PeoplePage() {
  return (
    <DashboardLayout>
      <ComingSoon
        title="Gestión de Personas"
        description="Aquí podrás registrar y gestionar estudiantes y docentes. Esta funcionalidad está en desarrollo."
        icon={FiUsers}
      />
    </DashboardLayout>
  );
}