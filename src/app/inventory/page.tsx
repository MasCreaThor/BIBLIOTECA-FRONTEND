'use client';

import { FiBook } from 'react-icons/fi';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ComingSoon } from '@/components/ui/ComingSoon';

export default function InventoryPage() {
  return (
    <DashboardLayout>
      <ComingSoon
        title="Gestión de Inventario"
        description="Aquí podrás registrar y gestionar libros, juegos, mapas y otros recursos de la biblioteca. Esta funcionalidad está en desarrollo."
        icon={FiBook}
      />
    </DashboardLayout>
  );
}