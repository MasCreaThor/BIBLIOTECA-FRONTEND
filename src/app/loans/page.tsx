// src/app/loans/page.tsx
// ================================================================
// PÁGINA PRINCIPAL DE GESTIÓN DE PRÉSTAMOS - SIMPLIFICADA
// ================================================================

'use client';

import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Button,
  Heading,
  useDisclosure
} from '@chakra-ui/react';

import { FiPlus } from 'react-icons/fi';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import LoanManagement from '@/components/loans/LoanManagement';
import CreateLoanModal from '@/components/loans/CreateLoanModal';

// ===== COMPONENTE PRINCIPAL DE LA PÁGINA =====

const LoansPage: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleLoanCreated = () => {
    // Callback cuando se crea un préstamo exitosamente
    onClose();
    // Aquí podrías disparar eventos para actualizar la lista
    // O usar un context/estado global para manejar la actualización
    window.location.reload(); // Temporal - mejor usar estado/context
  };

  return (
    <DashboardLayout>
      <Box maxW="full" mx="auto" px={4} py={8}>
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <HStack justify="space-between" align="center">
            <Heading size="lg" color="gray.700">
              Gestión de Préstamos
            </Heading>
            <Button
              leftIcon={<FiPlus />}
              colorScheme="blue"
              onClick={onOpen}
              size="md"
            >
              Nuevo Préstamo
            </Button>
          </HStack>

          {/* ✅ SIMPLIFICADO: Solo gestión principal, sin estadísticas duplicadas */}
          <Box>
            <LoanManagement />
          </Box>

          {/* Modal de Crear Préstamo */}
          <CreateLoanModal 
            isOpen={isOpen}
            onClose={onClose}
            onSuccess={handleLoanCreated}
          />
        </VStack>
      </Box>
    </DashboardLayout>
  );
};

export default LoansPage;