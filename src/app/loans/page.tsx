// src/app/loans/page.tsx
// ================================================================
// PÁGINA PRINCIPAL DE GESTIÓN DE PRÉSTAMOS - SIMPLIFICADA
// ================================================================

'use client';

import React from 'react';
import { Box } from '@chakra-ui/react';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import LoanManagement from '@/components/loans/LoanManagement';

// ===== COMPONENTE PRINCIPAL DE LA PÁGINA =====

const LoansPage: React.FC = () => {
  return (
    <DashboardLayout>
      <Box maxW="full" mx="auto">
        {/* ✅ SIMPLIFICADO: Solo gestión principal, sin redundancia */}
        <LoanManagement />
      </Box>
    </DashboardLayout>
  );
};

export default LoansPage;