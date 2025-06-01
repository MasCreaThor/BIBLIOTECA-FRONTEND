'use client';

import { FiBarChart } from 'react-icons/fi';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ComingSoon } from '@/components/ui/ComingSoon';

export default function ReportsPage() {
  return (
    <DashboardLayout>
      <ComingSoon
        title="Reportes y Estadísticas"
        description="Aquí podrás generar reportes de préstamos, estadísticas de uso y otros análisis de la biblioteca. Esta funcionalidad está en desarrollo."
        icon={FiBarChart}
      />
    </DashboardLayout>
  );
}