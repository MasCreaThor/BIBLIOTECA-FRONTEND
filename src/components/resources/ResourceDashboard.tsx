// src/components/resources/ResourceDashboard.tsx - DASHBOARD COMPLETO DE RECURSOS
// ================================================================
// COMPONENTE DE DASHBOARD CON ESTADÍSTICAS Y GESTIÓN DE RECURSOS
// ================================================================

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardHeader,
  CardBody,
  Text,
  Badge,
  Button,
  IconButton,
  HStack,
  VStack,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Progress,
  Divider,
  useDisclosure,
  Tooltip,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Skeleton,
  SkeletonText,
  useColorModeValue,
  Tab,
  Tabs,
  TabList,
  TabPanel,
  TabPanels,
} from '@chakra-ui/react';

import {
  FiPackage,
  FiTrendingUp,
  FiTrendingDown,
  FiAlertTriangle,
  FiCheckCircle,
  FiBook,
  FiUsers,
  FiCalendar,
  FiRefreshCw,
  FiPlus,
  FiBarChart,
  FiPieChart,
  FiActivity,
  FiEye,
} from 'react-icons/fi';

// Componentes
import { ResourceForm } from './ResourceForm';
import { ResourceList } from './ResourceList';
import { StockAlerts } from './StockAlerts';

// Hooks y tipos
import { 
  useResourceStats, 
  useStockAlerts,
  useLowStockResources,
  useNoStockResources 
} from '@/hooks/useResources';
import type { Resource } from '@/types/api.types';

// ===== INTERFACES =====
interface ResourceDashboardProps {
  showDetailedStats?: boolean;
  lowStockThreshold?: number;
}

// ===== COMPONENTE DE ESTADÍSTICAS RÁPIDAS =====
const QuickStats: React.FC<{ lowStockThreshold: number }> = ({ lowStockThreshold }) => {
  const { data: stats, isLoading, error, refetch } = useResourceStats();
  const { totalAlertsCount, lowStockCount, noStockCount } = useStockAlerts(lowStockThreshold);

  const cardBg = useColorModeValue('white', 'gray.800');

  if (isLoading) {
    return (
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} bg={cardBg}>
            <CardBody>
              <Skeleton height="80px" />
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>
    );
  }

  if (error || !stats) {
    return (
      <Alert status="error">
        <AlertIcon />
        <VStack align="start" flex={1}>
          <AlertTitle>Error al cargar estadísticas</AlertTitle>
          <AlertDescription>No se pudieron cargar las estadísticas de recursos</AlertDescription>
          <Button size="sm" onClick={() => refetch()}>Reintentar</Button>
        </VStack>
      </Alert>
    );
  }

  const stockPercentage = stats.total > 0 ? (stats.available / stats.total) * 100 : 0;
  const utilizationPercentage = stats.totalUnits > 0 ? (stats.loanedUnits / stats.totalUnits) * 100 : 0;

  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
      {/* Total de Recursos */}
      <Card bg={cardBg}>
        <CardBody>
          <Stat>
            <StatLabel>Total de Recursos</StatLabel>
            <StatNumber color="blue.500">{stats.total}</StatNumber>
            <StatHelpText>
              <HStack spacing={2}>
                <FiBook />
                <Text>Registrados en el sistema</Text>
              </HStack>
            </StatHelpText>
          </Stat>
        </CardBody>
      </Card>

      {/* Recursos Disponibles */}
      <Card bg={cardBg}>
        <CardBody>
          <Stat>
            <StatLabel>Con Stock Disponible</StatLabel>
            <StatNumber color="green.500">{stats.stockStatus.withStock}</StatNumber>
            <StatHelpText>
              <StatArrow type={stockPercentage >= 80 ? 'increase' : 'decrease'} />
              {stockPercentage.toFixed(1)}% del total
            </StatHelpText>
          </Stat>
        </CardBody>
      </Card>

      {/* Alertas de Stock */}
      <Card bg={cardBg}>
        <CardBody>
          <Stat>
            <StatLabel>Alertas de Stock</StatLabel>
            <StatNumber color={totalAlertsCount > 0 ? "red.500" : "green.500"}>
              {totalAlertsCount}
            </StatNumber>
            <StatHelpText>
              <HStack spacing={1}>
                {totalAlertsCount > 0 ? <FiAlertTriangle /> : <FiCheckCircle />}
                <Text>
                  {totalAlertsCount === 0 
                    ? 'Todo en orden' 
                    : `${noStockCount} sin stock, ${lowStockCount} bajo`
                  }
                </Text>
              </HStack>
            </StatHelpText>
          </Stat>
        </CardBody>
      </Card>

      {/* Utilización */}
      <Card bg={cardBg}>
        <CardBody>
          <Stat>
            <StatLabel>Unidades en Préstamo</StatLabel>
            <StatNumber color="orange.500">{stats.loanedUnits}</StatNumber>
            <StatHelpText>
              <StatArrow type={utilizationPercentage >= 50 ? 'increase' : 'decrease'} />
              {utilizationPercentage.toFixed(1)}% del total
            </StatHelpText>
          </Stat>
        </CardBody>
      </Card>
    </SimpleGrid>
  );
};

// ===== COMPONENTE DE DISTRIBUCIÓN POR CATEGORÍA =====
const CategoryDistribution: React.FC = () => {
  const { data: stats, isLoading } = useResourceStats();
  const cardBg = useColorModeValue('white', 'gray.800');

  if (isLoading) {
    return (
      <Card bg={cardBg}>
        <CardHeader>
          <SkeletonText noOfLines={1} />
        </CardHeader>
        <CardBody>
          <SkeletonText noOfLines={5} spacing="4" />
        </CardBody>
      </Card>
    );
  }

  if (!stats?.byCategory.length) {
    return (
      <Card bg={cardBg}>
        <CardHeader>
          <HStack spacing={3}>
            <FiPieChart />
            <Text fontWeight="semibold">Distribución por Categoría</Text>
          </HStack>
        </CardHeader>
        <CardBody>
          <Alert status="info">
            <AlertIcon />
            <Text>No hay datos de categorías disponibles</Text>
          </Alert>
        </CardBody>
      </Card>
    );
  }

  const total = stats.byCategory.reduce((sum, cat) => sum + cat.count, 0);

  return (
    <Card bg={cardBg}>
      <CardHeader>
        <HStack justify="space-between">
          <HStack spacing={3}>
            <FiPieChart />
            <Text fontWeight="semibold">Distribución por Categoría</Text>
          </HStack>
          <Badge colorScheme="blue">{stats.byCategory.length} categorías</Badge>
        </HStack>
      </CardHeader>
      <CardBody>
        <VStack spacing={4} align="stretch">
          {stats.byCategory.map((category, index) => {
            const percentage = total > 0 ? (category.count / total) * 100 : 0;
            const colors = ['blue', 'purple', 'green', 'orange', 'red', 'cyan'];
            const colorScheme = colors[index % colors.length];

            return (
              <Box key={category.category}>
                <HStack justify="space-between" mb={2}>
                  <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
                    {category.category}
                  </Text>
                  <HStack spacing={2}>
                    <Text fontSize="sm" color="gray.600">
                      {category.count}
                    </Text>
                    <Badge colorScheme={colorScheme} size="sm">
                      {percentage.toFixed(1)}%
                    </Badge>
                  </HStack>
                </HStack>
                <Progress
                  value={percentage}
                  colorScheme={colorScheme}
                  size="md"
                  bg="gray.100"
                  borderRadius="full"
                />
              </Box>
            );
          })}
        </VStack>
      </CardBody>
    </Card>
  );
};

// ===== COMPONENTE DE DISTRIBUCIÓN POR TIPO =====
const TypeDistribution: React.FC = () => {
  const { data: stats, isLoading } = useResourceStats();
  const cardBg = useColorModeValue('white', 'gray.800');

  if (isLoading) {
    return (
      <Card bg={cardBg}>
        <CardHeader>
          <SkeletonText noOfLines={1} />
        </CardHeader>
        <CardBody>
          <SkeletonText noOfLines={4} spacing="4" />
        </CardBody>
      </Card>
    );
  }

  if (!stats?.byType.length) {
    return (
      <Card bg={cardBg}>
        <CardHeader>
          <HStack spacing={3}>
            <FiBarChart />
            <Text fontWeight="semibold">Distribución por Tipo</Text>
          </HStack>
        </CardHeader>
        <CardBody>
          <Alert status="info">
            <AlertIcon />
            <Text>No hay datos de tipos disponibles</Text>
          </Alert>
        </CardBody>
      </Card>
    );
  }

  const typeIcons = {
    book: FiBook,
    game: FiActivity,
    map: FiEye,
    bible: FiBook,
  };

  const typeColors = {
    book: 'blue',
    game: 'green',
    map: 'orange',
    bible: 'purple',
  };

  return (
    <Card bg={cardBg}>
      <CardHeader>
        <HStack spacing={3}>
          <FiBarChart />
          <Text fontWeight="semibold">Distribución por Tipo</Text>
        </HStack>
      </CardHeader>
      <CardBody>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          {stats.byType.map((type) => {
            const IconComponent = typeIcons[type.type as keyof typeof typeIcons] || FiPackage;
            const colorScheme = typeColors[type.type as keyof typeof typeColors] || 'gray';

            return (
              <Box key={type.type} p={4} bg="gray.50" borderRadius="md">
                <HStack spacing={3}>
                  <Box color={`${colorScheme}.500`}>
                    <IconComponent size={24} />
                  </Box>
                  <VStack align="start" spacing={1} flex={1}>
                    <Text fontWeight="semibold" textTransform="capitalize">
                      {type.type}
                    </Text>
                    <HStack spacing={2}>
                      <Text fontSize="2xl" fontWeight="bold" color={`${colorScheme}.500`}>
                        {type.count}
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        recursos
                      </Text>
                    </HStack>
                  </VStack>
                </HStack>
              </Box>
            );
          })}
        </SimpleGrid>
      </CardBody>
    </Card>
  );
};

// ===== COMPONENTE PRINCIPAL =====
export const ResourceDashboard: React.FC<ResourceDashboardProps> = ({
  showDetailedStats = true,
  lowStockThreshold = 5,
}) => {
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const { isOpen: isFormOpen, onOpen: onFormOpen, onClose: onFormClose } = useDisclosure();
  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();

  // Hooks para refrescar datos
  const { refetch: refetchStats } = useResourceStats();
  const { refetch: refetchAlerts } = useStockAlerts(lowStockThreshold);

  // ===== HANDLERS =====
  const handleCreateResource = () => {
    setSelectedResource(null);
    onFormOpen();
  };

  const handleEditResource = (resource: Resource) => {
    setSelectedResource(resource);
    onEditOpen();
  };

  const handleFormSuccess = () => {
    onFormClose();
    onEditClose();
    setSelectedResource(null);
    refetchStats();
    refetchAlerts();
  };

  const handleRefreshAll = () => {
    refetchStats();
    refetchAlerts();
  };

  // ===== RENDER =====
  return (
    <Box>
      <VStack spacing={6} align="stretch">
        
        {/* Header del Dashboard */}
        <HStack justify="space-between" align="center">
          <VStack align="start" spacing={1}>
            <Text fontSize="2xl" fontWeight="bold">
              Dashboard de Recursos
            </Text>
            <Text color="gray.600">
              Gestión y estadísticas del inventario de la biblioteca
            </Text>
          </VStack>

          <HStack spacing={3}>
            <Tooltip label="Actualizar datos">
              <IconButton
                aria-label="Actualizar"
                icon={<FiRefreshCw />}
                variant="outline"
                onClick={handleRefreshAll}
              />
            </Tooltip>
            <Button
              leftIcon={<FiPlus />}
              colorScheme="blue"
              onClick={handleCreateResource}
            >
              Nuevo Recurso
            </Button>
          </HStack>
        </HStack>

        {/* Estadísticas Principales */}
        <QuickStats lowStockThreshold={lowStockThreshold} />

        {/* Tabs con contenido detallado */}
        <Tabs variant="enclosed" colorScheme="blue">
          <TabList>
            <Tab>
              <HStack spacing={2}>
                <FiAlertTriangle />
                <Text>Alertas</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack spacing={2}>
                <FiBarChart />
                <Text>Estadísticas</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack spacing={2}>
                <FiPackage />
                <Text>Lista de Recursos</Text>
              </HStack>
            </Tab>
          </TabList>

          <TabPanels>
            {/* Panel de Alertas */}
            <TabPanel px={0}>
              <StockAlerts
                lowStockThreshold={lowStockThreshold}
                showDetailedView={true}
                onResourceEdit={handleEditResource}
                onResourceView={(resource) => setSelectedResource(resource)}
              />
            </TabPanel>

            {/* Panel de Estadísticas */}
            <TabPanel px={0}>
              {showDetailedStats && (
                <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
                  <CategoryDistribution />
                  <TypeDistribution />
                </SimpleGrid>
              )}
            </TabPanel>

            {/* Panel de Lista de Recursos */}
            <TabPanel px={0}>
              <ResourceList
                showStockIndicators={true}
                layout="list"
                pageSize={20}
                onResourceSelect={handleEditResource}
              />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>

      {/* Modal de creación */}
      <ResourceForm
        isOpen={isFormOpen}
        onClose={onFormClose}
        mode="create"
        onSuccess={handleFormSuccess}
      />

      {/* Modal de edición */}
      {selectedResource && (
        <ResourceForm
          isOpen={isEditOpen}
          onClose={onEditClose}
          resource={selectedResource}
          mode="edit"
          onSuccess={handleFormSuccess}
        />
      )}
    </Box>
  );
};