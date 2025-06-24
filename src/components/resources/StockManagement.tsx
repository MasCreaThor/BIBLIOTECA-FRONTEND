// src/components/resources/StockManagement.tsx - GESTIÓN VISUAL DE STOCK
// ================================================================
// COMPONENTE PARA GESTIÓN Y VISUALIZACIÓN DE STOCK DE RECURSOS
// ================================================================

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardHeader,
  CardBody,
  Text,
  Badge,
  Progress,
  HStack,
  VStack,
  Button,
  IconButton,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Textarea,
  Alert,
  AlertIcon,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  useDisclosure,
  useToast,
  Tooltip,
  Divider,
  SimpleGrid,
} from '@chakra-ui/react';

import { 
  FiPackage, 
  FiEdit3, 
  FiTrendingUp, 
  FiTrendingDown,
  FiAlertTriangle,
  FiCheckCircle,
  FiX,
  FiSave,
  FiRefreshCw,
  FiEye,
  FiBarChart
} from 'react-icons/fi';

import { useForm } from 'react-hook-form';

// Hooks y tipos
import { 
  useResourceStockManagement,
  useUpdateResourceQuantity 
} from '@/hooks/useResources';
import type { Resource } from '@/types/api.types';

// ===== INTERFACES =====
interface StockManagementProps {
  resource: Resource;
  showDetailedView?: boolean;
  onStockUpdate?: (resource: Resource) => void;
}

interface QuantityUpdateForm {
  newQuantity: number;
  reason: string;
}

// ===== COMPONENTE PRINCIPAL =====
export const StockManagement: React.FC<StockManagementProps> = ({
  resource,
  showDetailedView = false,
  onStockUpdate,
}) => {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isUpdating, setIsUpdating] = useState(false);

  // Hook para gestión completa de stock
  const stockManagement = useResourceStockManagement(resource._id);
  const updateQuantityMutation = useUpdateResourceQuantity();

  // Form para actualización de cantidad
  const { register, handleSubmit, reset, formState: { errors } } = useForm<QuantityUpdateForm>({
    defaultValues: {
      newQuantity: resource.totalQuantity,
      reason: '',
    },
  });

  // ===== CÁLCULOS DE STOCK =====
  const currentStock = stockManagement.availability?.availableQuantity || 0;
  const totalQuantity = resource.totalQuantity;
  const loanedCount = stockManagement.availability?.currentLoans || 0;
  
  const stockPercentage = totalQuantity > 0 ? (currentStock / totalQuantity) * 100 : 0;
  const loanPercentage = totalQuantity > 0 ? (loanedCount / totalQuantity) * 100 : 0;

  // ===== DETERMINACIÓN DE ESTADO =====
  const getStockStatus = () => {
    if (currentStock === 0) {
      return { status: 'no-stock', label: 'Sin Stock', color: 'red' };
    } else if (currentStock <= 5) {
      return { status: 'low-stock', label: 'Stock Bajo', color: 'orange' };
    } else if (stockPercentage >= 80) {
      return { status: 'good-stock', label: 'Stock Bueno', color: 'green' };
    } else {
      return { status: 'medium-stock', label: 'Stock Medio', color: 'yellow' };
    }
  };

  const stockStatus = getStockStatus();

  // ===== HANDLERS =====
  const handleQuantityUpdate = async (data: QuantityUpdateForm) => {
    try {
      setIsUpdating(true);

      await updateQuantityMutation.mutateAsync({
        resourceId: resource._id,
        newTotalQuantity: data.newQuantity,
        reason: data.reason || 'Actualización manual desde gestión de stock',
      });

      toast({
        title: 'Cantidad actualizada',
        description: `Nueva cantidad: ${data.newQuantity} unidades`,
        status: 'success',
        duration: 3000,
      });

      onStockUpdate?.(resource);
      onClose();
      reset();
    } catch (error: any) {
      toast({
        title: 'Error al actualizar',
        description: error?.response?.data?.message || 'Error desconocido',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRefresh = () => {
    stockManagement.refetch();
  };

  // ===== VISTA COMPACTA =====
  if (!showDetailedView) {
    return (
      <Card size="sm" bg={stockStatus.color === 'red' ? 'red.50' : 'white'}>
        <CardBody p={4}>
          <HStack justify="space-between" align="center">
            <VStack align="start" spacing={1} flex={1}>
              <HStack spacing={2}>
                <FiPackage />
                <Text fontSize="sm" fontWeight="semibold">
                  Stock
                </Text>
                <Badge colorScheme={stockStatus.color} size="sm">
                  {stockStatus.label}
                </Badge>
              </HStack>
              
              <HStack spacing={4} fontSize="xs" color="gray.600">
                <Text>Disponible: {currentStock}</Text>
                <Text>Prestado: {loanedCount}</Text>
                <Text>Total: {totalQuantity}</Text>
              </HStack>
              
              <Progress
                value={stockPercentage}
                colorScheme={stockStatus.color}
                size="sm"
                w="full"
                bg="gray.100"
              />
            </VStack>

            <HStack spacing={1}>
              <Tooltip label="Actualizar cantidad">
                <IconButton
                  aria-label="Editar cantidad"
                  icon={<FiEdit3 />}
                  size="sm"
                  variant="ghost"
                  onClick={onOpen}
                />
              </Tooltip>
              <Tooltip label="Refrescar datos">
                <IconButton
                  aria-label="Refrescar"
                  icon={<FiRefreshCw />}
                  size="sm"
                  variant="ghost"
                  onClick={handleRefresh}
                  isLoading={stockManagement.isLoading}
                />
              </Tooltip>
            </HStack>
          </HStack>
        </CardBody>
      </Card>
    );
  }

  // ===== VISTA DETALLADA =====
  return (
    <>
      <Card>
        <CardHeader pb={2}>
          <HStack justify="space-between">
            <HStack spacing={3}>
              <FiBarChart size={20} />
              <Text fontSize="lg" fontWeight="bold">
                Gestión de Stock
              </Text>
              <Badge colorScheme={stockStatus.color}>
                {stockStatus.label}
              </Badge>
            </HStack>
            
            <HStack spacing={2}>
              <Button
                leftIcon={<FiEdit3 />}
                size="sm"
                colorScheme="blue"
                variant="outline"
                onClick={onOpen}
              >
                Actualizar Cantidad
              </Button>
              <IconButton
                aria-label="Refrescar"
                icon={<FiRefreshCw />}
                size="sm"
                variant="outline"
                onClick={handleRefresh}
                isLoading={stockManagement.isLoading}
              />
            </HStack>
          </HStack>
        </CardHeader>

        <CardBody pt={2}>
          <VStack spacing={6} align="stretch">
            {/* Estadísticas principales */}
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
              <Stat>
                <StatLabel>Disponible</StatLabel>
                <StatNumber color={currentStock > 0 ? 'green.500' : 'red.500'}>
                  {currentStock}
                </StatNumber>
                <StatHelpText>
                  {stockPercentage.toFixed(1)}% del total
                </StatHelpText>
              </Stat>

              <Stat>
                <StatLabel>En Préstamo</StatLabel>
                <StatNumber color="orange.500">
                  {loanedCount}
                </StatNumber>
                <StatHelpText>
                  {loanPercentage.toFixed(1)}% del total
                </StatHelpText>
              </Stat>

              <Stat>
                <StatLabel>Total</StatLabel>
                <StatNumber color="blue.500">
                  {totalQuantity}
                </StatNumber>
                <StatHelpText>
                  Unidades totales
                </StatHelpText>
              </Stat>
            </SimpleGrid>

            {/* Barras de progreso */}
            <VStack spacing={3} align="stretch">
              <Box>
                <HStack justify="space-between" mb={1}>
                  <Text fontSize="sm" fontWeight="medium">
                    Stock Disponible
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    {currentStock} / {totalQuantity}
                  </Text>
                </HStack>
                <Progress
                  value={stockPercentage}
                  colorScheme={stockStatus.color}
                  size="md"
                  bg="gray.100"
                  borderRadius="md"
                />
              </Box>

              <Box>
                <HStack justify="space-between" mb={1}>
                  <Text fontSize="sm" fontWeight="medium">
                    En Préstamo
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    {loanedCount} / {totalQuantity}
                  </Text>
                </HStack>
                <Progress
                  value={loanPercentage}
                  colorScheme="orange"
                  size="md"
                  bg="gray.100"
                  borderRadius="md"
                />
              </Box>
            </VStack>

            {/* Alertas de stock */}
            {stockStatus.status === 'no-stock' && (
              <Alert status="error">
                <AlertIcon />
                <VStack align="start" spacing={1}>
                  <Text fontWeight="semibold">Sin stock disponible</Text>
                  <Text fontSize="sm">
                    Este recurso no tiene unidades disponibles para préstamo.
                  </Text>
                </VStack>
              </Alert>
            )}

            {stockStatus.status === 'low-stock' && (
              <Alert status="warning">
                <AlertIcon />
                <VStack align="start" spacing={1}>
                  <Text fontWeight="semibold">Stock bajo</Text>
                  <Text fontSize="sm">
                    Quedan pocas unidades disponibles. Considere aumentar el inventario.
                  </Text>
                </VStack>
              </Alert>
            )}

            {/* Información adicional */}
            <Box bg="gray.50" p={4} borderRadius="md">
              <Text fontSize="sm" fontWeight="semibold" mb={2}>
                Información del Recurso
              </Text>
              <VStack spacing={2} align="stretch" fontSize="sm">
                <HStack justify="space-between">
                  <Text color="gray.600">Título:</Text>
                  <Text fontWeight="medium">{resource.title}</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text color="gray.600">Estado:</Text>
                  <Badge colorScheme="blue">
                    {resource.state?.description || 'N/A'}
                  </Badge>
                </HStack>
                <HStack justify="space-between">
                  <Text color="gray.600">Disponible para préstamo:</Text>
                  <Badge colorScheme={resource.available ? 'green' : 'red'}>
                    {resource.available ? 'Sí' : 'No'}
                  </Badge>
                </HStack>
              </VStack>
            </Box>
          </VStack>
        </CardBody>
      </Card>

      {/* Modal para actualizar cantidad */}
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack spacing={3}>
              <FiEdit3 />
              <Text>Actualizar Cantidad Total</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton isDisabled={isUpdating} />

          <ModalBody>
            <form id="quantity-form" onSubmit={handleSubmit(handleQuantityUpdate)}>
              <VStack spacing={4} align="stretch">
                {/* Información actual */}
                <Alert status="info">
                  <AlertIcon />
                  <VStack align="start" spacing={1} flex={1}>
                    <Text fontWeight="semibold">Estado Actual</Text>
                    <HStack spacing={4} fontSize="sm">
                      <Text>Total: {totalQuantity}</Text>
                      <Text>Prestados: {loanedCount}</Text>
                      <Text>Disponibles: {currentStock}</Text>
                    </HStack>
                  </VStack>
                </Alert>

                {/* Nueva cantidad */}
                <FormControl isRequired>
                  <FormLabel>Nueva Cantidad Total</FormLabel>
                  <NumberInput
                    min={loanedCount || 1}
                    max={10000}
                    defaultValue={totalQuantity}
                  >
                    <NumberInputField
                      {...register('newQuantity', {
                        required: 'La cantidad es obligatoria',
                        min: {
                          value: loanedCount || 1,
                          message: `Mínimo: ${loanedCount} (préstamos actuales)`,
                        },
                        max: {
                          value: 10000,
                          message: 'Máximo: 10,000 unidades',
                        },
                      })}
                    />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                  {errors.newQuantity && (
                    <Text color="red.500" fontSize="sm" mt={1}>
                      {errors.newQuantity.message}
                    </Text>
                  )}
                  {loanedCount > 0 && (
                    <Text fontSize="sm" color="gray.600" mt={1}>
                      Mínimo permitido: {loanedCount} (hay {loanedCount} unidades prestadas)
                    </Text>
                  )}
                </FormControl>

                {/* Razón */}
                <FormControl>
                  <FormLabel>Razón del cambio (opcional)</FormLabel>
                  <Textarea
                    {...register('reason')}
                    placeholder="Explique el motivo del cambio de cantidad..."
                    rows={3}
                    resize="vertical"
                  />
                </FormControl>
              </VStack>
            </form>
          </ModalBody>

          <ModalFooter>
            <HStack spacing={3}>
              <Button
                variant="ghost"
                onClick={onClose}
                isDisabled={isUpdating}
                leftIcon={<FiX />}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                form="quantity-form"
                colorScheme="blue"
                isLoading={isUpdating}
                loadingText="Actualizando..."
                leftIcon={<FiSave />}
              >
                Actualizar Cantidad
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};