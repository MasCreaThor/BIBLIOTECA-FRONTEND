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
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiBookOpen, FiAlertTriangle, FiTrendingUp, FiArrowRight } from 'react-icons/fi';
import { useLoanStats } from '@/hooks/useLoans';

export function LoanWidget() {
  const { stats, loading, error, refresh } = useLoanStats();
  const router = useRouter();
  const cardBg = useColorModeValue('white', 'gray.800');

  if (error) {
    return (
      <Card bg={cardBg}>
        <CardBody>
          <Alert status="error" size="sm">
            <AlertIcon />
            Error al cargar datos de préstamos
          </Alert>
        </CardBody>
      </Card>
    );
  }

  if (loading || !stats) {
    return (
      <Card bg={cardBg}>
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

  const hasOverdueLoans = stats.overdueLoans > 0;
  const overduePercentage = stats.activeLoans > 0 ? (stats.overdueLoans / stats.activeLoans) * 100 : 0;

  return (
    <Card bg={cardBg}>
      <CardHeader>
        <HStack justify="space-between" align="center">
          <HStack spacing={2}>
            <FiBookOpen />
            <Text fontWeight="bold">Préstamos</Text>
          </HStack>
          {hasOverdueLoans && (
            <Badge colorScheme="orange" variant="subtle">
              {stats.overdueLoans} vencidos
            </Badge>
          )}
        </HStack>
      </CardHeader>

      <CardBody>
        <VStack spacing={4} align="stretch">
          {/* Estadísticas rápidas */}
          <SimpleGrid columns={2} spacing={4}>
            <Stat size="sm">
              <StatLabel>Activos</StatLabel>
              <StatNumber color="blue.500">{stats.activeLoans}</StatNumber>
              <StatHelpText>
                <FiTrendingUp />
                En curso
              </StatHelpText>
            </Stat>

            <Stat size="sm">
              <StatLabel>Total</StatLabel>
              <StatNumber color="gray.500">{stats.totalLoans}</StatNumber>
              <StatHelpText>
                Histórico
              </StatHelpText>
            </Stat>
          </SimpleGrid>

          {/* Alerta de vencidos */}
          {hasOverdueLoans && (
            <Alert status="warning" size="sm" borderRadius="md">
              <AlertIcon />
              <VStack spacing={0} align="start" flex={1}>
                <Text fontSize="sm" fontWeight="bold">
                  {stats.overdueLoans} préstamos vencidos
                </Text>
                <Text fontSize="xs">
                  {overduePercentage.toFixed(1)}% de los préstamos activos
                </Text>
              </VStack>
            </Alert>
          )}

          {/* Acciones rápidas */}
          <VStack spacing={2}>
            <Button
              size="sm"
              width="100%"
              onClick={() => router.push('/loans')}
              rightIcon={<FiArrowRight />}
              variant="outline"
            >
              Ver todos los préstamos
            </Button>
            
            {hasOverdueLoans && (
              <Button
                size="sm"
                width="100%"
                colorScheme="orange"
                onClick={() => router.push('/loans/overdue')}
                rightIcon={<FiAlertTriangle />}
                variant="outline"
              >
                Gestionar vencidos
              </Button>
            )}
          </VStack>
        </VStack>
      </CardBody>
    </Card>
  );
}