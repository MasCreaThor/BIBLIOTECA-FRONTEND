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
import { SystemConfigEditor } from '@/components/admin/SystemConfigEditor';
import { AdminRoute } from '@/components/auth/ProtectedRoute';

export default function SystemConfigPage() {
  return (
    <AdminRoute>
      <DashboardLayout>
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <Box>
            <HStack spacing={3} mb={4}>
              <Box p={2} bg="teal.50" borderRadius="lg">
                <Icon as={FiSettings} boxSize={6} color="teal.600" />
              </Box>
              <VStack align="start" spacing={0}>
                <Heading size="lg" color="gray.800">
                  Configuración del Sistema
                </Heading>
                <Text color="gray.600">
                  Personaliza el título, subtítulo e icono del menú lateral
                </Text>
              </VStack>
            </HStack>
          </Box>

          {/* Editor de configuración */}
          <SystemConfigEditor />
        </VStack>
      </DashboardLayout>
    </AdminRoute>
  );
} 