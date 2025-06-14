// app/loans/overdue/page.tsx
'use client';

import {
  Box,
  Container,
  VStack,
  HStack,
  Heading,
  Text,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Flex,
  Spacer,
  Button,
  useColorModeValue,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AuthenticatedRoute } from '@/components/auth/ProtectedRoute';
import { LoanList } from '@/components/loans';
import { Pagination } from '@/components/ui';
import { useLoans, useReturnLoan } from '@/hooks/useLoans';

export default function OverdueLoansPage() {
  const { loans, loading, error, changePage, refresh } = useLoans({
    isOverdue: true,
    limit: 12,
  });
  
  const { returnLoan, markAsLost } = useReturnLoan();
  
  const alertBg = useColorModeValue('orange.50', 'orange.900');

  const handleReturnLoan = async (loanId: string, observations?: string) => {
    const result = await returnLoan({
      loanId,
      returnObservations: observations,
    });
    if (result) {
      refresh();
    }
  };

  const handleMarkAsLost = async (loanId: string, observations: string) => {
    const result = await markAsLost(loanId, observations);
    if (result) {
      refresh();
    }
  };

  return (
    <AuthenticatedRoute>
      <DashboardLayout>
        <Container maxW="7xl" py={8}>
          <VStack spacing={8} align="stretch">
            {/* Header */}
            <Flex align="center">
              <VStack align="start" spacing={2}>
                <Heading size="lg" color="orange.500">
                  Préstamos Vencidos
                </Heading>
                <Text color="gray.600">
                  Gestiona los préstamos que han superado su fecha límite
                </Text>
              </VStack>
              <Spacer />
              <Button
                leftIcon={<FiRefreshCw />}
                onClick={refresh}
                isLoading={loading}
              >
                Actualizar
              </Button>
            </Flex>

            {/* Alerta informativa */}
            <Alert status="warning" bg={alertBg} borderRadius="md">
              <AlertIcon />
              <Box>
                <AlertTitle>¡Atención!</AlertTitle>
                <AlertDescription>
                  Estos préstamos han superado su fecha límite de devolución. 
                  Es importante gestionar las devoluciones para mantener el inventario actualizado.
                </AlertDescription>
              </Box>
            </Alert>

            {/* Estadísticas rápidas */}
            {loans.pagination.total > 0 && (
              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <Text>
                  Hay <strong>{loans.pagination.total}</strong> préstamos vencidos que requieren atención.
                </Text>
              </Alert>
            )}

            {/* Lista de préstamos vencidos */}
            <LoanList
              loans={loans.data}
              loading={loading}
              error={error}
              onReturn={handleReturnLoan}
              onMarkAsLost={handleMarkAsLost}
              onRetry={refresh}
              columns={2}
            />

            {/* Paginación */}
            {loans.pagination.totalPages > 1 && (
              <Flex justify="center">
                <Pagination
                  currentPage={loans.pagination.page}
                  totalPages={loans.pagination.totalPages}
                  onPageChange={changePage}
                />
              </Flex>
            )}
          </VStack>
        </Container>
      </DashboardLayout>
    </AuthenticatedRoute>
  );
}