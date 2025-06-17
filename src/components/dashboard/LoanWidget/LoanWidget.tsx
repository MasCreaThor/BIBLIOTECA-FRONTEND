// components/dashboard/LoanWidget/LoanWidget.tsx
'use client';

import {
  Card,
  CardHeader,
  CardBody,
  VStack,
  HStack,
  Text,
  Badge,
  Button,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
  useColorModeValue,
  Skeleton,
  Alert,
  AlertIcon,
  Box,
  Icon,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiBookOpen, FiAlertTriangle, FiTrendingUp, FiArrowRight, FiRefreshCw } from 'react-icons/fi';
import { useLoanStats } from '@/hooks/useLoans';

export function LoanWidget() {
  const { stats, loading, error, refetch } = useLoanStats();
  const router = useRouter();
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  if (error) {
    return (
      <Card bg={cardBg} border="1px" borderColor={borderColor}>
        <CardBody>
          <Alert status="error" size="sm">
            <AlertIcon />
            <VStack align="start" spacing={1}>
              <Text fontSize="sm">Error al cargar datos de préstamos</Text>
              <Button size="xs" variant="outline" onClick={refetch} leftIcon={<FiRefreshCw />}>
                Reintentar
              </Button>
            </VStack>
          </Alert>
        </CardBody>
      </Card>
    );
  }

  if (loading || !stats) {
    return (
      <Card bg={cardBg} border="1px" borderColor={borderColor}>
        <CardHeader>
          <Skeleton height="20px" width="150px" />
        </CardHeader>
        <CardBody>
          <VStack spacing={4}>
            <SimpleGrid columns={2} spacing={4} width="100%">
              <Skeleton height="60px" />
              <Skeleton height="60px" />
            </SimpleGrid>
            <Skeleton height="40px" width="100%" />
          </VStack>
        </CardBody>
      </Card>
    );
  }

  // ✅ MEJORA: Validar que las propiedades existan antes de usarlas
  // Manejar diferentes estructuras de respuesta del backend
  const totalLoans = stats.totalLoans || 0;
  const activeLoans = stats.activeLoans || 0;
  const overdueLoans = stats.overdueLoans || 0;
  const returnedLoans = stats.returnedLoans || 0;
  const lostLoans = stats.lostLoans || 0;
  
  // Compatibilidad con respuesta del backend actual
  const returnedThisMonth = (stats as any).returnedThisMonth || returnedLoans;

  const hasOverdueLoans = overdueLoans > 0;
  const overduePercentage = activeLoans > 0 ? 
    Math.round((overdueLoans / activeLoans) * 100) : 0;

  const handleViewDetails = () => {
    router.push('/dashboard/loans');
  };

  const handleViewOverdue = () => {
    router.push('/dashboard/loans?status=overdue');
  };

  return (
    <Card bg={cardBg} border="1px" borderColor={borderColor}>
      <CardHeader pb={2}>
        <HStack justify="space-between" align="center">
          <HStack>
            <Icon as={FiBookOpen} color="blue.500" boxSize={5} />
            <Text fontSize="lg" fontWeight="semibold">
              Préstamos
            </Text>
          </HStack>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={refetch}
            isLoading={loading}
            leftIcon={<FiRefreshCw />}
          >
            Actualizar
          </Button>
        </HStack>
      </CardHeader>

      <CardBody pt={2}>
        <VStack spacing={4} align="stretch">
          {/* Estadísticas principales */}
          <SimpleGrid columns={2} spacing={4}>
            <Stat>
              <StatLabel fontSize="xs" color="gray.600">
                Total Préstamos
              </StatLabel>
              <StatNumber fontSize="2xl">{totalLoans}</StatNumber>
              <StatHelpText fontSize="xs" mb={0}>
                En el sistema
              </StatHelpText>
            </Stat>

            <Stat>
              <StatLabel fontSize="xs" color="gray.600">
                Activos
              </StatLabel>
              <StatNumber fontSize="2xl" color="blue.500">
                {activeLoans}
              </StatNumber>
              <StatHelpText fontSize="xs" mb={0}>
                En circulación
              </StatHelpText>
            </Stat>
          </SimpleGrid>

          {/* Préstamos vencidos */}
          {hasOverdueLoans && (
            <Box 
              p={3} 
              bg="red.50" 
              borderColor="red.200" 
              border="1px" 
              borderRadius="md"
            >
              <HStack justify="space-between" align="center">
                <HStack>
                  <Icon as={FiAlertTriangle} color="red.500" />
                  <VStack align="start" spacing={0}>
                    <Text fontSize="sm" fontWeight="medium" color="red.700">
                      {overdueLoans} préstamos vencidos
                    </Text>
                    <Text fontSize="xs" color="red.600">
                      {overduePercentage}% del total activo
                    </Text>
                  </VStack>
                </HStack>
                <Badge colorScheme="red" variant="solid">
                  ¡Acción requerida!
                </Badge>
              </HStack>
            </Box>
          )}

          {/* Estadística adicional - Devueltos */}
          <Box p={3} bg="green.50" borderColor="green.200" border="1px" borderRadius="md">
            <HStack justify="space-between">
              <VStack align="start" spacing={0}>
                <Text fontSize="sm" fontWeight="medium" color="green.700">
                  {returnedThisMonth > 0 ? 'Devueltos este mes' : 'Total devueltos'}
                </Text>
                <Text fontSize="2xl" fontWeight="bold" color="green.600">
                  {returnedThisMonth > 0 ? returnedThisMonth : returnedLoans}
                </Text>
                <Text fontSize="xs" color="green.600">
                  {lostLoans > 0 && `${lostLoans} perdidos`}
                </Text>
              </VStack>
              <Icon as={FiTrendingUp} color="green.500" boxSize={5} />
            </HStack>
          </Box>

          {/* Acciones rápidas */}
          <VStack spacing={2}>
            <Button
              variant="outline"
              size="sm"
              width="100%"
              onClick={handleViewDetails}
              rightIcon={<FiArrowRight />}
            >
              Ver todos los préstamos
            </Button>
            
            {hasOverdueLoans && (
              <Button
                colorScheme="red"
                variant="solid"
                size="sm"
                width="100%"
                onClick={handleViewOverdue}
                rightIcon={<FiAlertTriangle />}
              >
                Gestionar vencidos ({overdueLoans})
              </Button>
            )}
          </VStack>
        </VStack>
      </CardBody>
    </Card>
  );
}