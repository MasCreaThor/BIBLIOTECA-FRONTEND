'use client';

import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Icon,
} from '@chakra-ui/react';
import { FiSettings } from 'react-icons/fi';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AdminNavigation } from '@/components/admin/AdminNavigation';
import { AdminRoute } from '@/components/auth/ProtectedRoute';

export default function AdminPage() {
  return (
    <AdminRoute>
      <DashboardLayout>
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <Box>
            <HStack spacing={3} mb={4}>
              <Box p={2} bg="red.50" borderRadius="lg">
                <Icon as={FiSettings} boxSize={6} color="red.600" />
              </Box>
              <VStack align="start" spacing={0}>
                <Heading size="lg" color="gray.800">
                  Panel de Administración
                </Heading>
                <Text color="gray.600">
                  Gestiona la configuración del sistema y los recursos auxiliares
                </Text>
              </VStack>
            </HStack>
          </Box>

          {/* Navegación de administración */}
          <AdminNavigation />
        </VStack>
      </DashboardLayout>
    </AdminRoute>
  );
}