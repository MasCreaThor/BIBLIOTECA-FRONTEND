'use client';

import { FiBookOpen } from 'react-icons/fi';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ComingSoon } from '@/components/ui/ComingSoon';

export default function LoansPage() {
  return (
    <DashboardLayout>
      <ComingSoon
        title="Gestión de Préstamos"
        description="Aquí podrás registrar préstamos, devoluciones y gestionar préstamos vencidos. Esta funcionalidad está en desarrollo."
        icon={FiBookOpen}
      />
    </DashboardLayout>
  );
}