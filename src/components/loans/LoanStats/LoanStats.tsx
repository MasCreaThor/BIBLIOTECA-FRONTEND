// components/loans/LoanStats/LoanStats.tsx
'use client';

import {
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Card,
  CardBody,
  VStack,
  HStack,
  Text,
  Progress,
  Badge,
  useColorModeValue,
  Skeleton,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { FiTrendingUp, FiTrendingDown, FiMinus } from 'react-icons/fi';
import { LoanStats as LoanStatsType } from '@/types/loan.types';

interface LoanStatsProps {
  stats: LoanStatsType | null;
  loading?: boolean;
  error?: string | null;
  compact?: boolean;
}

export function LoanStats({ stats, loading = false, error = null, compact = false }: LoanStatsProps) {
  const cardBg = useColorModeValue('white', 'gray.800');

  if (error) {
    return (
      <Alert status="error" borderRadius="md">
        <AlertIcon />
        Error al cargar estadísticas: {error}
      </Alert>
    );
  }

  if (loading || !stats) {
    return (
      <SimpleGrid columns={{ base: 2, md: compact ? 2 : 4 }} spacing={4}>
        {Array.from({ length: compact ? 2 : 4 }).map((_, i) => (
          <Skeleton key={i} height="120px" borderRadius="md" />
        ))}
      </SimpleGrid>
    );
  }

  const activePercentage = stats.totalLoans > 0 ? (stats.activeLoans / stats.totalLoans) * 100 : 0;
  const overduePercentage = stats.activeLoans > 0 ? (stats.overdueLoans / stats.activeLoans) * 100 : 0;

  return (
    <VStack spacing={6} align="stretch">
      {/* Estadísticas principales */}
      <SimpleGrid columns={{ base: 2, md: compact ? 2 : 4 }} spacing={4}>
        <Card bg={cardBg}>
          <CardBody>
            <Stat>
              <StatLabel>Total Préstamos</StatLabel>
              <StatNumber color="blue.500">{stats.totalLoans.toLocaleString()}</StatNumber>
              <StatHelpText>
                Histórico completo
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={cardBg}>
          <CardBody>
            <Stat>
              <StatLabel>Préstamos Activos</StatLabel>
              <StatNumber color="green.500">{stats.activeLoans}</StatNumber>
              <StatHelpText>
                {activePercentage.toFixed(1)}% del total
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        {!compact && (
          <>
            <Card bg={cardBg}>
              <CardBody>
                <Stat>
                  <StatLabel>Préstamos Vencidos</StatLabel>
                  <StatNumber color="orange.500">{stats.overdueLoans}</StatNumber>
                  <StatHelpText>
                    {overduePercentage.toFixed(1)}% de activos
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>

            <Card bg={cardBg}>
              <CardBody>
                <Stat>
                  <StatLabel>Duración Promedio</StatLabel>
                  <StatNumber color="purple.500">{stats.averageLoanDuration}</StatNumber>
                  <StatHelpText>
                    días por préstamo
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </>
        )}
      </SimpleGrid>

      {/* Indicadores de salud */}
      {!compact && (
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          <Card bg={cardBg}>
            <CardBody>
              <VStack spacing={3} align="stretch">
                <Text fontWeight="bold" fontSize="sm" color="gray.600">
                  ESTADO DE PRÉSTAMOS ACTIVOS
                </Text>
                
                <VStack spacing={2} align="stretch">
                  <HStack justify="space-between">
                    <Text fontSize="sm">Al día</Text>
                    <Text fontSize="sm" fontWeight="bold" color="green.500">
                      {stats.activeLoans - stats.overdueLoans}
                    </Text>
                  </HStack>
                  <Progress 
                    value={((stats.activeLoans - stats.overdueLoans) / Math.max(stats.activeLoans, 1)) * 100} 
                    colorScheme="green" 
                    size="sm" 
                  />
                </VStack>

                <VStack spacing={2} align="stretch">
                  <HStack justify="space-between">
                    <Text fontSize="sm">Vencidos</Text>
                    <Text fontSize="sm" fontWeight="bold" color="orange.500">
                      {stats.overdueLoans}
                    </Text>
                  </HStack>
                  <Progress 
                    value={overduePercentage} 
                    colorScheme="orange" 
                    size="sm" 
                  />
                </VStack>
              </VStack>
            </CardBody>
          </Card>

          <Card bg={cardBg}>
            <CardBody>
              <VStack spacing={3} align="stretch">
                <Text fontWeight="bold" fontSize="sm" color="gray.600">
                  RECURSOS MÁS PRESTADOS
                </Text>
                
                {stats.mostBorrowedResources.length > 0 ? (
                  <VStack spacing={2} align="stretch">
                    {stats.mostBorrowedResources.slice(0, 3).map((resource, index) => (
                      <HStack key={resource.resourceId} justify="space-between">
                        <HStack spacing={2}>
                          <Badge colorScheme="blue" variant="solid" borderRadius="full">
                            {index + 1}
                          </Badge>
                          <Text fontSize="sm" noOfLines={1} title={resource.title}>
                            {resource.title}
                          </Text>
                        </HStack>
                        <Badge colorScheme="green" variant="outline">
                          {resource.borrowCount}
                        </Badge>
                      </HStack>
                    ))}
                  </VStack>
                ) : (
                  <Text fontSize="sm" color="gray.500" textAlign="center" py={4}>
                    No hay datos disponibles
                  </Text>
                )}
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>
      )}
    </VStack>
  );
}