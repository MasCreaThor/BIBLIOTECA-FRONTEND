'use client';

import { FiFileText } from 'react-icons/fi';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ComingSoon } from '@/components/ui/ComingSoon';

export default function RequestsPage() {
  return (
    <DashboardLayout>
      <ComingSoon
        title="Recursos Solicitados"
        description="Aquí podrás gestionar recursos solicitados que no están disponibles en la biblioteca. Esta funcionalidad está en desarrollo."
        icon={FiFileText}
      />
    </DashboardLayout>
  );
}