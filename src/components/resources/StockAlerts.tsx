// src/components/resources/StockAlerts.tsx - ALERTAS DE STOCK
// ================================================================
// COMPONENTE PARA MOSTRAR ALERTAS DE STOCK BAJO Y SIN STOCK
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
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Collapse,
  useDisclosure,
  Tooltip,
  SimpleGrid,
  Progress,
  Divider,
  Link,
  useColorModeValue,
  Skeleton,
  SkeletonText,
} from '@chakra-ui/react';

import {
  FiAlertTriangle,
  FiXCircle,
  FiChevronDown,
  FiChevronUp,
  FiPackage,
  FiTrendingDown,
  FiRefreshCw,
  FiEdit,
  FiEye,
  FiArrowRight,
} from 'react-icons/fi';

// Hooks y tipos
import { useStockAlerts, useLowStockResources, useNoStockResources } from '@/hooks/useResources';
import type { Resource } from '@/types/api.types';

// ===== INTERFACES =====
interface StockAlertsProps {
  lowStockThreshold?: number;
  showDetailedView?: boolean;
  onResourceEdit?: (resource: Resource) => void;
  onResourceView?: (resource: Resource) => void;
  maxItemsToShow?: number;
}

interface StockAlertItemProps {
  resource: Resource;
  alertType: 'low_stock' | 'no_stock';
  threshold?: number;
  onEdit?: (resource: Resource) => void;
  onView?: (resource: Resource) => void;
}

// ===== COMPONENTE DE ITEM DE ALERTA =====
const StockAlertItem: React.FC<StockAlertItemProps> = ({
  resource,
  alertType,
  threshold,
  onEdit,
  onView,
}) => {
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  const availableQuantity = resource.availableQuantity || 0;
  const totalQuantity = resource.totalQuantity;
  const loanedCount = resource.currentLoansCount || 0;
  const stockPercentage = totalQuantity > 0 ? (availableQuantity / totalQuantity) * 100 : 0;

  const alertConfig = {
    low_stock: {
      icon: FiAlertTriangle,
      color: 'orange',
      title: 'Stock Bajo',
      description: `Quedan ${availableQuantity} unidades disponibles`,
    },
    no_stock: {
      icon: FiXCircle,
      color: 'red',
      title: 'Sin Stock',
      description: 'No hay unidades disponibles para préstamo',
    },
  };

  const config = alertConfig[alertType];
  const IconComponent = config.icon;

  return (
    <Card bg={cardBg} borderColor={borderColor} borderWidth="1px" size="sm">
      <CardBody p={4}>
        <HStack spacing={4} align="start">
          {/* Icono de alerta */}
          <Box color={`${config.color}.500`} mt={1}>
            <IconComponent size={20} />
          </Box>

          {/* Información del recurso */}
          <VStack align="start" spacing={2} flex={1}>
            <VStack align="start" spacing={1}>
              <Text fontWeight="semibold" fontSize="md" noOfLines={1}>
                {resource.title}
              </Text>
              <Text fontSize="sm" color="gray.600" noOfLines={1}>
                {resource.authors?.map(a => a.name).join(', ') || 'Sin autor'}
              </Text>
            </VStack>

            {/* Badge de estado */}
            <HStack spacing={2}>
              <Badge colorScheme={config.color} size="sm">
                {config.title}
              </Badge>
              <Badge colorScheme="gray" size="sm">
                {resource.category?.name || 'Sin categoría'}
              </Badge>
            </HStack>

            {/* Información de stock */}
            <Box w="full">
              <HStack justify="space-between" mb={1}>
                <Text fontSize="xs" color="gray.600">
                  Stock
                </Text>
                <Text fontSize="xs" fontWeight="medium">
                  {availableQuantity} / {totalQuantity}
                </Text>
              </HStack>
              
              <Progress
                value={stockPercentage}
                colorScheme={config.color}
                size="sm"
                bg="gray.100"
                borderRadius="full"
              />
              
              {loanedCount > 0 && (
                <Text fontSize="xs" color="gray.500" mt={1}>
                  {loanedCount} unidades en préstamo
                </Text>
              )}
            </Box>
          </VStack>

          {/* Acciones */}
          <VStack spacing={1}>
            {onView && (
              <Tooltip label="Ver detalles">
                <IconButton
                  aria-label="Ver detalles"
                  icon={<FiEye />}
                  size="sm"
                  variant="ghost"
                  onClick={() => onView(resource)}
                />
              </Tooltip>
            )}
            {onEdit && (
              <Tooltip label="Editar recurso">
                <IconButton
                  aria-label="Editar recurso"
                  icon={<FiEdit />}
                  size="sm"
                  variant="ghost"
                  onClick={() => onEdit(resource)}
                />
              </Tooltip>
            )}
          </VStack>
        </HStack>
      </CardBody>
    </Card>
  );
};

// ===== COMPONENTE PRINCIPAL =====
export const StockAlerts: React.FC<StockAlertsProps> = ({
  lowStockThreshold = 5,
  showDetailedView = true,
  onResourceEdit,
  onResourceView,
  maxItemsToShow = 10,
}) => {
  const [showAllLowStock, setShowAllLowStock] = useState(false);
  const [showAllNoStock, setShowAllNoStock] = useState(false);

  // Hooks para obtener alertas
  const {
    alerts,
    lowStockCount,
    noStockCount,
    totalAlertsCount,
    isLoading,
    isError,
    refetch,
  } = useStockAlerts(lowStockThreshold);

  const { data: lowStockResources } = useLowStockResources(lowStockThreshold);
  const { data: noStockResources } = useNoStockResources();

  // ===== LOADING STATE =====
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <HStack spacing={3}>
            <Skeleton height="20px" width="20px" />
            <SkeletonText noOfLines={1} width="200px" />
          </HStack>
        </CardHeader>
        <CardBody>
          <VStack spacing={3}>
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} height="80px" width="100%" />
            ))}
          </VStack>
        </CardBody>
      </Card>
    );
  }

  // ===== ERROR STATE =====
  if (isError) {
    return (
      <Alert status="error">
        <AlertIcon />
        <VStack align="start" flex={1}>
          <AlertTitle>Error al cargar alertas</AlertTitle>
          <AlertDescription>
            No se pudieron cargar las alertas de stock.
          </AlertDescription>
          <Button size="sm" onClick={() => refetch()}>
            Reintentar
          </Button>
        </VStack>
      </Alert>
    );
  }

  // ===== NO ALERTS STATE =====
  if (totalAlertsCount === 0) {
    return (
      <Card>
        <CardHeader>
          <HStack spacing={3}>
            <FiPackage color="green" />
            <Text fontWeight="semibold">Alertas de Stock</Text>
            <Badge colorScheme="green">Todo en orden</Badge>
          </HStack>
        </CardHeader>
        <CardBody>
          <Alert status="success">
            <AlertIcon />
            <VStack align="start" spacing={1}>
              <AlertTitle fontSize="md">¡Excelente!</AlertTitle>
              <AlertDescription>
                Todos los recursos tienen stock adecuado. No hay alertas pendientes.
              </AlertDescription>
            </VStack>
          </Alert>
        </CardBody>
      </Card>
    );
  }

  // Dividir alertas por tipo
  const lowStockAlerts = alerts.filter(alert => alert.type === 'low_stock');
  const noStockAlerts = alerts.filter(alert => alert.type === 'no_stock');

  const displayedLowStock = showAllLowStock 
    ? lowStockAlerts 
    : lowStockAlerts.slice(0, maxItemsToShow);

  const displayedNoStock = showAllNoStock 
    ? noStockAlerts 
    : noStockAlerts.slice(0, maxItemsToShow);

  // ===== RENDER PRINCIPAL =====
  return (
    <Card>
      <CardHeader>
        <HStack justify="space-between">
          <HStack spacing={3}>
            <FiAlertTriangle color="orange" />
            <Text fontWeight="semibold">Alertas de Stock</Text>
            <Badge colorScheme="red" variant="solid">
              {totalAlertsCount}
            </Badge>
          </HStack>
          
          <Tooltip label="Actualizar alertas">
            <IconButton
              aria-label="Actualizar"
              icon={<FiRefreshCw />}
              size="sm"
              variant="ghost"
              onClick={() => refetch()}
              isLoading={isLoading}
            />
          </Tooltip>
        </HStack>
      </CardHeader>

      <CardBody>
        <VStack spacing={6} align="stretch">
          
          {/* Resumen de alertas */}
          {showDetailedView && (
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
              <Alert status="warning" borderRadius="md">
                <AlertIcon />
                <VStack align="start" spacing={1} flex={1}>
                  <Text fontWeight="semibold">Stock Bajo</Text>
                  <Text fontSize="sm">
                    {lowStockCount} recursos con menos de {lowStockThreshold} unidades
                  </Text>
                </VStack>
              </Alert>

              <Alert status="error" borderRadius="md">
                <AlertIcon />
                <VStack align="start" spacing={1} flex={1}>
                  <Text fontWeight="semibold">Sin Stock</Text>
                  <Text fontSize="sm">
                    {noStockCount} recursos sin unidades disponibles
                  </Text>
                </VStack>
              </Alert>
            </SimpleGrid>
          )}

          {/* Recursos sin stock */}
          {noStockAlerts.length > 0 && (
            <Box>
              <HStack justify="space-between" mb={3}>
                <HStack spacing={2}>
                  <FiXCircle color="red" />
                  <Text fontWeight="semibold" color="red.500">
                    Sin Stock ({noStockCount})
                  </Text>
                </HStack>
                
                {noStockAlerts.length > maxItemsToShow && (
                  <Button
                    size="sm"
                    variant="ghost"
                    colorScheme="red"
                    rightIcon={showAllNoStock ? <FiChevronUp /> : <FiChevronDown />}
                    onClick={() => setShowAllNoStock(!showAllNoStock)}
                  >
                    {showAllNoStock ? 'Ver menos' : `Ver todos (${noStockCount})`}
                  </Button>
                )}
              </HStack>

              <VStack spacing={2} align="stretch">
                {displayedNoStock.map((alert) => {
                  const resource = noStockResources?.find(r => r._id === alert.resourceId);
                  if (!resource) return null;
                  
                  return (
                    <StockAlertItem
                      key={alert.resourceId}
                      resource={resource}
                      alertType="no_stock"
                      onEdit={onResourceEdit}
                      onView={onResourceView}
                    />
                  );
                })}
              </VStack>

              <Collapse in={showAllNoStock}>
                <VStack spacing={2} align="stretch" mt={2}>
                  {noStockAlerts.slice(maxItemsToShow).map((alert) => {
                    const resource = noStockResources?.find(r => r._id === alert.resourceId);
                    if (!resource) return null;
                    
                    return (
                      <StockAlertItem
                        key={alert.resourceId}
                        resource={resource}
                        alertType="no_stock"
                        onEdit={onResourceEdit}
                        onView={onResourceView}
                      />
                    );
                  })}
                </VStack>
              </Collapse>
            </Box>
          )}

          {/* Separador */}
          {noStockAlerts.length > 0 && lowStockAlerts.length > 0 && <Divider />}

          {/* Recursos con stock bajo */}
          {lowStockAlerts.length > 0 && (
            <Box>
              <HStack justify="space-between" mb={3}>
                <HStack spacing={2}>
                  <FiTrendingDown color="orange" />
                  <Text fontWeight="semibold" color="orange.500">
                    Stock Bajo ({lowStockCount})
                  </Text>
                </HStack>
                
                {lowStockAlerts.length > maxItemsToShow && (
                  <Button
                    size="sm"
                    variant="ghost"
                    colorScheme="orange"
                    rightIcon={showAllLowStock ? <FiChevronUp /> : <FiChevronDown />}
                    onClick={() => setShowAllLowStock(!showAllLowStock)}
                  >
                    {showAllLowStock ? 'Ver menos' : `Ver todos (${lowStockCount})`}
                  </Button>
                )}
              </HStack>

              <VStack spacing={2} align="stretch">
                {displayedLowStock.map((alert) => {
                  const resource = lowStockResources?.find(r => r._id === alert.resourceId);
                  if (!resource) return null;
                  
                  return (
                    <StockAlertItem
                      key={alert.resourceId}
                      resource={resource}
                      alertType="low_stock"
                      threshold={lowStockThreshold}
                      onEdit={onResourceEdit}
                      onView={onResourceView}
                    />
                  );
                })}
              </VStack>

              <Collapse in={showAllLowStock}>
                <VStack spacing={2} align="stretch" mt={2}>
                  {lowStockAlerts.slice(maxItemsToShow).map((alert) => {
                    const resource = lowStockResources?.find(r => r._id === alert.resourceId);
                    if (!resource) return null;
                    
                    return (
                      <StockAlertItem
                        key={alert.resourceId}
                        resource={resource}
                        alertType="low_stock"
                        threshold={lowStockThreshold}
                        onEdit={onResourceEdit}
                        onView={onResourceView}
                      />
                    );
                  })}
                </VStack>
              </Collapse>
            </Box>
          )}

          {/* Acciones rápidas */}
          {showDetailedView && totalAlertsCount > 0 && (
            <Box>
              <Divider mb={4} />
              <HStack spacing={3} justify="center">
                <Text fontSize="sm" color="gray.600">
                  Acciones recomendadas:
                </Text>
                <Link href="/resources" color="blue.500" fontSize="sm">
                  Ver todos los recursos
                  <FiArrowRight style={{ display: 'inline', marginLeft: '4px' }} />
                </Link>
              </HStack>
            </Box>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
};