// src/app/reports/page.tsx
'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PersonLoansTable } from '@/components/reports/PersonLoansTable';
import { PersonLoansFilters } from '@/components/reports/PersonLoansFilters';
import { PersonLoanSummary } from '@/types/reports.types';

export default function ReportsPage() {
  const [personLoans, setPersonLoans] = useState<PersonLoanSummary[]>([]);
  const [loading, setLoading] = useState(false);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Reportes de Préstamos</h1>
            <p className="text-gray-600">
              Gestión de préstamos por persona para fin de año
            </p>
          </div>
        </div>

        <PersonLoansFilters 
          onDataLoaded={setPersonLoans}
          onLoadingChange={setLoading}
        />

        <PersonLoansTable 
          data={personLoans}
          loading={loading}
          onDataUpdate={setPersonLoans}
        />
      </div>
    </DashboardLayout>
  );
}