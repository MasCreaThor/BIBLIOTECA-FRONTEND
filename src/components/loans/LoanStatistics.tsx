// src/components/loans/LoanStatistics.tsx
// ================================================================
// COMPONENTE DE ESTADÍSTICAS DE PRÉSTAMOS - CORREGIDO
// ================================================================

import React from 'react';
import {
  Box,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  VStack,
  HStack,
  Text,
  Badge,
  Progress,
  Skeleton,
  Alert,
  AlertIcon,
  useColorModeValue
} from '@chakra-ui/react';

// FIX: Usar react-icons en lugar de recharts que no está disponible
import {
  FiBook,
  FiUsers,
  FiAlertTriangle,
  FiCheckCircle,
  FiClock,
  FiTrendingUp,
  FiTrendingDown,
  FiActivity
} from 'react-icons/fi';

// Importar hooks
import { useLoanStats } from '@/hooks/useLoans';
import type { LoanStats, OverdueStats, StockStats } from '@/types/loan.types';

// ===== INTERFACES =====

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: 'blue' | 'green' | 'red' | 'purple';
  trend?: {
    value: number;
    isPositive: boolean;
  };
  suffix?: string;
}

interface StatsSectionProps {
  title: string;
  children: React.ReactNode;
}

// ===== COMPONENTE DE TARJETA DE MÉTRICA =====

// FIX: Tipos explícitos para todos los parámetros
const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  trend, 
  suffix = '' 
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  // FIX: Objeto con tipos explícitos para colorClasses
  const colorClasses: Record<'blue' | 'green' | 'red' | 'purple', string> = {
    blue: 'blue.500',
    green: 'green.500', 
    red: 'red.500',
    purple: 'purple.500'
  };

  return (
    <Box
      bg={bgColor}
      p={6}
      rounded="lg"
      shadow="md"
      border="1px"
      borderColor={borderColor}
    >
      <Stat>
        <HStack justify="space-between" align="start">
          <VStack align="start" spacing={1}>
            <StatLabel fontSize="sm" fontWeight="medium" color="gray.600">
              {title}
            </StatLabel>
            <StatNumber fontSize="2xl" fontWeight="bold">
              {typeof value === 'number' ? value.toLocaleString() : value}
              {suffix}
            </StatNumber>
            {trend && (
              <StatHelpText mb={0}>
                <StatArrow type={trend.isPositive ? 'increase' : 'decrease'} />
                {Math.abs(trend.value)}%
              </StatHelpText>
            )}
          </VStack>
          <Box
            p={3}
            rounded="full"
            bg={`${colorClasses[color]}.100`}
            color={colorClasses[color]}
          >
            <Icon size={24} />
          </Box>
        </HStack>
      </Stat>
    </Box>
  );
};

// ===== COMPONENTE DE SECCIÓN DE ESTADÍSTICAS =====

const StatsSection: React.FC<StatsSectionProps> = ({ title, children }) => {
  return (
    <VStack align="stretch" spacing={4}>
      <Text fontSize="lg" fontWeight="bold" color="gray.700">
        {title}
      </Text>
      {children}
    </VStack>
  );
};

// ===== COMPONENTE DE GRÁFICO SIMPLE (SIN RECHARTS) =====

interface SimpleChartProps {
  data: Array<{ name: string; value: number; color?: string }>;
  title: string;
}

const SimpleChart: React.FC<SimpleChartProps> = ({ data, title }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  return (
    <Box bg="white" p={6} rounded="lg" shadow="md" border="1px" borderColor="gray.200">
      <Text fontSize="md" fontWeight="bold" mb={4}>
        {title}
      </Text>
      <VStack spacing={3} align="stretch">
        {data.map((item, index) => (
          <Box key={item.name}>
            <HStack justify="space-between" mb={1}>
              <Text fontSize="sm" fontWeight="medium">
                {item.name}
              </Text>
              <HStack>
                <Text fontSize="sm" fontWeight="bold">
                  {item.value}
                </Text>
                <Text fontSize="xs" color="gray.500">
                  ({total > 0 ? Math.round((item.value / total) * 100) : 0}%)
                </Text>
              </HStack>
            </HStack>
            <Progress
              value={total > 0 ? (item.value / total) * 100 : 0}
              size="sm"
              colorScheme={item.color || 'blue'}
              bg="gray.100"
            />
          </Box>
        ))}
      </VStack>
    </Box>
  );
};

// ===== COMPONENTE PRINCIPAL =====

export const LoanStatistics: React.FC = () => {
  const { stats, overdueStats, stockStats, loading, error, refetch } = useLoanStats();

  if (loading) {
    return (
      <VStack spacing={6} align="stretch">
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} height="120px" rounded="lg" />
          ))}
        </SimpleGrid>
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
          {[...Array(2)].map((_, i) => (
            <Skeleton key={i} height="300px" rounded="lg" />
          ))}
        </SimpleGrid>
      </VStack>
    );
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        <VStack align="start" spacing={2}>
          <Text fontWeight="bold">Error al cargar estadísticas</Text>
          <Text fontSize="sm">{error}</Text>
          <Text 
            fontSize="sm" 
            color="blue.500" 
            cursor="pointer" 
            textDecoration="underline"
            onClick={refetch}
          >
            Reintentar
          </Text>
        </VStack>
      </Alert>
    );
  }

  // Preparar datos para gráficos
  const loanStatusData = stats ? [
    { name: 'Activos', value: stats.activeLoans, color: 'blue' },
    { name: 'Devueltos', value: stats.returnedLoans, color: 'green' },
    { name: 'Vencidos', value: stats.overdueLoans, color: 'red' },
    { name: 'Perdidos', value: stats.lostLoans, color: 'orange' }
  ] : [];

  const overdueByDaysData = overdueStats ? [
    { name: '1-7 días', value: overdueStats.byDaysOverdue['1-7'], color: 'yellow' },
    { name: '8-14 días', value: overdueStats.byDaysOverdue['8-14'], color: 'orange' },
    { name: '15-30 días', value: overdueStats.byDaysOverdue['15-30'], color: 'red' },
    { name: 'Más de 30 días', value: overdueStats.byDaysOverdue['30+'], color: 'purple' }
  ] : [];

  return (
    <VStack spacing={8} align="stretch">
      {/* Métricas Principales */}
      <StatsSection title="Métricas Generales">
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
          <MetricCard
            title="Total de Préstamos"
            value={stats?.totalLoans || 0}
            icon={FiBook}
            color="blue"
          />
          <MetricCard
            title="Préstamos Activos"
            value={stats?.activeLoans || 0}
            icon={FiActivity}
            color="green"
          />
          <MetricCard
            title="Préstamos Vencidos"
            value={stats?.overdueLoans || 0}
            icon={FiAlertTriangle}
            color="red"
          />
          <MetricCard
            title="Duración Promedio"
            value={stats?.averageLoanDuration || 0}
            icon={FiClock}
            color="purple"
            suffix=" días"
          />
        </SimpleGrid>
      </StatsSection>

      {/* Estadísticas de Stock */}
      {stockStats && (
        <StatsSection title="Estado del Stock">
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
            <MetricCard
              title="Total de Recursos"
              value={stockStats.totalResources}
              icon={FiBook}
              color="blue"
            />
            <MetricCard
              title="Unidades Disponibles"
              value={stockStats.availableUnits}
              icon={FiCheckCircle}
              color="green"
            />
            <MetricCard
              title="Unidades Prestadas"
              value={stockStats.loanedUnits}
              icon={FiUsers}
              color="purple"
            />
            <MetricCard
              title="Sin Stock"
              value={stockStats.resourcesWithoutStock}
              icon={FiAlertTriangle}
              color="red"
            />
          </SimpleGrid>
        </StatsSection>
      )}

      {/* Gráficos */}
      <StatsSection title="Distribución y Análisis">
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
          <SimpleChart
            data={loanStatusData}
            title="Préstamos por Estado"
          />
          
          {overdueStats && (
            <SimpleChart
              data={overdueByDaysData}
              title="Préstamos Vencidos por Días"
            />
          )}
        </SimpleGrid>
      </StatsSection>

      {/* Top Rankings */}
      <StatsSection title="Rankings">
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
          {/* Top Recursos Prestados */}
          {stats?.topBorrowedResources && stats.topBorrowedResources.length > 0 && (
            <Box bg="white" p={6} rounded="lg" shadow="md" border="1px" borderColor="gray.200">
              <Text fontSize="md" fontWeight="bold" mb={4}>
                Recursos Más Prestados
              </Text>
              <VStack spacing={3} align="stretch">
                {stats.topBorrowedResources.slice(0, 5).map((resource, index) => (
                  <HStack key={resource.resourceId} justify="space-between">
                    <HStack>
                      <Badge colorScheme="blue" variant="solid">
                        {index + 1}
                      </Badge>
                      <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
                        {resource.title}
                      </Text>
                    </HStack>
                    <Text fontSize="sm" fontWeight="bold" color="blue.500">
                      {resource.count} préstamos
                    </Text>
                  </HStack>
                ))}
              </VStack>
            </Box>
          )}

          {/* Top Usuarios */}
          {stats?.topBorrowers && stats.topBorrowers.length > 0 && (
            <Box bg="white" p={6} rounded="lg" shadow="md" border="1px" borderColor="gray.200">
              <Text fontSize="md" fontWeight="bold" mb={4}>
                Usuarios Más Activos
              </Text>
              <VStack spacing={3} align="stretch">
                {stats.topBorrowers.slice(0, 5).map((borrower, index) => (
                  <HStack key={borrower.personId} justify="space-between">
                    <HStack>
                      <Badge colorScheme="green" variant="solid">
                        {index + 1}
                      </Badge>
                      <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
                        {borrower.fullName}
                      </Text>
                    </HStack>
                    <Text fontSize="sm" fontWeight="bold" color="green.500">
                      {borrower.count} préstamos
                    </Text>
                  </HStack>
                ))}
              </VStack>
            </Box>
          )}
        </SimpleGrid>
      </StatsSection>

      {/* Estadísticas Adicionales de Vencidos */}
      {overdueStats && (
        <StatsSection title="Análisis de Préstamos Vencidos">
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
            <MetricCard
              title="Total Vencidos"
              value={overdueStats.totalOverdue}
              icon={FiAlertTriangle}
              color="red"
            />
            <MetricCard
              title="Promedio Días Vencidos"
              value={Math.round(overdueStats.averageDaysOverdue || 0)}
              icon={FiClock}
              color="red"
              suffix=" días"
            />
            <Box bg="white" p={6} rounded="lg" shadow="md" border="1px" borderColor="gray.200">
              <Text fontSize="sm" fontWeight="medium" color="gray.600" mb={2}>
                Por Tipo de Usuario
              </Text>
              <VStack spacing={2} align="stretch">
                <HStack justify="space-between">
                  <Text fontSize="sm">Estudiantes</Text>
                  <Badge colorScheme="blue">{overdueStats.byPersonType.students}</Badge>
                </HStack>
                <HStack justify="space-between">
                  <Text fontSize="sm">Profesores</Text>
                  <Badge colorScheme="purple">{overdueStats.byPersonType.teachers}</Badge>
                </HStack>
              </VStack>
            </Box>
          </SimpleGrid>
        </StatsSection>
      )}
    </VStack>
  );
};

export default LoanStatistics;