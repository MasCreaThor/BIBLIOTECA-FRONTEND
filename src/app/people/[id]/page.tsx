// src/app/people/[id]/page.tsx
'use client';

import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  Card,
  CardBody,
  CardHeader,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Badge,
  Avatar,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Skeleton,
  SkeletonText,
  Icon,
  Divider,
  useColorModeValue,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
} from '@chakra-ui/react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FiUsers,
  FiChevronRight,
  FiArrowLeft,
  FiEdit,
  FiCalendar,
  FiHash,
  FiBook,
  FiUser,
  FiUserCheck,
  FiUserX,
  FiBookOpen,
  FiClock,
  FiAlertTriangle,
} from 'react-icons/fi';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PersonForm } from '@/components/people/PersonForm';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { 
  usePerson, 
  useUpdatePerson, 
  useActivatePerson, 
  useDeactivatePerson,
  usePersonTypes
} from '@/hooks/usePeople';
import { useConfirmDialog } from '@/components/ui/ConfirmDialog';
import { PersonTypeManager } from '@/lib/personType';
import type { UpdatePersonRequest } from '@/types/api.types';
import { DateUtils, TextUtils } from '@/utils';

export default function PersonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const personId = params.id as string;

  const { isOpen: isEditOpen, onOpen: onEditOpen, onClose: onEditClose } = useDisclosure();

  // Queries y mutations
  const {
    data: person,
    isLoading,
    isError,
    error,
    refetch,
  } = usePerson(personId);

  // Obtener tipos de persona para fallback
  const { data: personTypes } = usePersonTypes();

  const cardBg = useColorModeValue('white', 'gray.800');
  const bgColor = useColorModeValue('gray.50', 'gray.900');

  // ✅ REFACTORIZACIÓN: Usar PersonTypeManager en lugar de función duplicada
  const fullName = person ? PersonTypeManager.getFullName(person) : '';
  const typeConfig = person ? PersonTypeManager.getConfig(person, personTypes) : null;
  const gradeInfo = person ? PersonTypeManager.getGradeDisplayInfo(person, personTypes) : null;

  // Mutations
  const updateMutation = useUpdatePerson();
  const activateMutation = useActivatePerson();
  const deactivateMutation = useDeactivatePerson();

  // Confirmación para cambio de estado
  const { confirm: confirmStatusChange, dialog: statusChangeDialog } = useConfirmDialog({
    title: person?.active ? 'Desactivar Persona' : 'Activar Persona',
    message: person?.active 
      ? `¿Estás seguro de que quieres desactivar a ${fullName}? No podrá realizar préstamos.`
      : `¿Estás seguro de que quieres activar a ${fullName}? Podrá realizar préstamos nuevamente.`,
    confirmText: person?.active ? 'Desactivar' : 'Activar',
    variant: person?.active ? 'warning' : 'info',
  });

  // Handlers
  const handleUpdatePerson = async (data: UpdatePersonRequest) => {
    if (!person) return;
    
    try {
      await updateMutation.mutateAsync({
        id: person._id,
        data,
      });
      onEditClose();
    } catch (error) {
      // El error se maneja en el hook
    }
  };

  const handleToggleStatus = async () => {
    if (!person) return;

    const confirmed = await confirmStatusChange();
    if (!confirmed) return;

    try {
      if (person.active) {
        await deactivateMutation.mutateAsync(person._id);
      } else {
        await activateMutation.mutateAsync(person._id);
      }
    } catch (error) {
      // El error se maneja en el hook
    }
  };

  const handleGoBack = () => {
    router.push('/people');
  };

  // ✅ REFACTORIZACIÓN: Función simplificada usando PersonTypeManager
  const renderGradeArea = () => {
    if (!gradeInfo) return 'Cargando...';
    
    if (gradeInfo.text === 'N/A') {
      return 'N/A';
    }
    
    if (gradeInfo.isValid) {
      return gradeInfo.text;
    }
    
    return 'No especificado';
  };

  // Loading state
  if (isLoading) {
    return (
      <DashboardLayout>
        <Box maxW="6xl" mx="auto">
          <LoadingSpinner message="Cargando información de la persona..." />
        </Box>
      </DashboardLayout>
    );
  }

  // Error state
  if (isError || !person) {
    return (
      <DashboardLayout>
        <VStack spacing={6} align="stretch" maxW="4xl" mx="auto">
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            <Box>
              <AlertTitle>Error al cargar la persona</AlertTitle>
              <AlertDescription>
                {error?.message || 'No se pudo encontrar la información de esta persona.'}
              </AlertDescription>
            </Box>
          </Alert>
          
          <HStack spacing={3}>
            <Button leftIcon={<FiArrowLeft />} onClick={handleGoBack}>
              Volver a la lista
            </Button>
            <Button variant="outline" onClick={() => refetch()}>
              Intentar nuevamente
            </Button>
          </HStack>
        </VStack>
      </DashboardLayout>
    );
  }

  // Si no tenemos typeConfig, no renderizar (safety check)
  if (!typeConfig) {
    return (
      <DashboardLayout>
        <LoadingSpinner message="Procesando información del tipo de persona..." />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <VStack spacing={6} align="stretch" maxW="6xl" mx="auto">
        {/* Breadcrumbs */}
        <Breadcrumb
          spacing={2}
          separator={<FiChevronRight color="gray.500" size={14} />}
          fontSize="sm"
        >
          <BreadcrumbItem>
            <BreadcrumbLink as={Link} href="/people" color="blue.600">
              Personas
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <Text color="gray.600" fontWeight="medium" noOfLines={1}>
              {fullName}
            </Text>
          </BreadcrumbItem>
        </Breadcrumb>

        {/* Header */}
        <Card bg={cardBg} shadow="sm">
          <CardBody>
            <HStack justify="space-between" align="start">
              <HStack spacing={4}>
                <Avatar
                  size="xl"
                  name={fullName}
                  bg={`${typeConfig.color}.500`}
                  color="white"
                />
                
                <VStack align="start" spacing={2}>
                  <HStack spacing={3}>
                    <Heading size="lg" color="gray.800">
                      {fullName}
                    </Heading>
                    <Badge
                      colorScheme={person.active ? 'green' : 'red'}
                      variant="subtle"
                      fontSize="sm"
                      px={3}
                      py={1}
                    >
                      {person.active ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </HStack>
                  
                  <HStack spacing={2}>
                    <Badge
                      colorScheme={typeConfig.color}
                      variant="solid"
                      fontSize="sm"
                    >
                      <HStack spacing={1}>
                        <typeConfig.icon size={12} />
                        <Text>{typeConfig.label}</Text>
                      </HStack>
                    </Badge>
                    
                    {person.grade && (
                      <Badge colorScheme="purple" variant="outline" fontSize="sm">
                        {person.grade}
                      </Badge>
                    )}
                  </HStack>
                  
                  <Text color="gray.600" fontSize="sm">
                    {typeConfig.description}
                  </Text>
                </VStack>
              </HStack>

              <VStack spacing={2}>
                <Button
                  leftIcon={<FiEdit />}
                  colorScheme="blue"
                  variant="outline"
                  onClick={onEditOpen}
                >
                  Editar
                </Button>
                
                <Button
                  leftIcon={person.active ? <FiUserX /> : <FiUserCheck />}
                  colorScheme={person.active ? 'orange' : 'green'}
                  variant="outline"
                  size="sm"
                  onClick={handleToggleStatus}
                  isLoading={activateMutation.isPending || deactivateMutation.isPending}
                >
                  {person.active ? 'Desactivar' : 'Activar'}
                </Button>
              </VStack>
            </HStack>
          </CardBody>
        </Card>

        {/* Información detallada */}
        <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
          {/* Información personal */}
          <Card bg={cardBg} shadow="sm">
            <CardHeader>
              <Heading size="md" color="gray.700">
                Información Personal
              </Heading>
            </CardHeader>
            <CardBody pt={0}>
              <VStack spacing={4} align="stretch">
                <HStack justify="space-between">
                  <HStack spacing={2}>
                    <Icon as={FiUser} color="gray.500" />
                    <Text fontWeight="medium" color="gray.700">Nombre completo:</Text>
                  </HStack>
                  <Text color="gray.600">{fullName}</Text>
                </HStack>

                <Divider />

                <HStack justify="space-between">
                  <HStack spacing={2}>
                    <Icon as={typeConfig.icon} color={`${typeConfig.color}.500`} />
                    <Text fontWeight="medium" color="gray.700">Tipo de persona:</Text>
                  </HStack>
                  <Badge colorScheme={typeConfig.color} variant="subtle">
                    {typeConfig.label}
                  </Badge>
                </HStack>

                <Divider />

                <HStack justify="space-between">
                  <HStack spacing={2}>
                    <Icon as={FiHash} color="gray.500" />
                    <Text fontWeight="medium" color="gray.700">Documento:</Text>
                  </HStack>
                  <Text color="gray.600">
                    {person.documentNumber ? TextUtils.formatDocument(person.documentNumber) : 'No especificado'}
                  </Text>
                </HStack>

                <Divider />

                <HStack justify="space-between">
                  <HStack spacing={2}>
                    <Icon as={FiBook} color="gray.500" />
                    <Text fontWeight="medium" color="gray.700">
                      {gradeInfo?.label || 'Grado/Área'}:
                    </Text>
                  </HStack>
                  <Text color="gray.600">
                    {renderGradeArea()}
                  </Text>
                </HStack>

                <Divider />

                <HStack justify="space-between">
                  <HStack spacing={2}>
                    <Icon as={FiCalendar} color="gray.500" />
                    <Text fontWeight="medium" color="gray.700">Registrado:</Text>
                  </HStack>
                  <VStack spacing={0} align="end">
                    <Text color="gray.600" fontSize="sm">
                      {DateUtils.formatDate(person.createdAt)}
                    </Text>
                    <Text color="gray.500" fontSize="xs">
                      {DateUtils.formatRelative(person.createdAt)}
                    </Text>
                  </VStack>
                </HStack>

                {person.updatedAt !== person.createdAt && (
                  <>
                    <Divider />
                    <HStack justify="space-between">
                      <HStack spacing={2}>
                        <Icon as={FiEdit} color="gray.500" />
                        <Text fontWeight="medium" color="gray.700">Última actualización:</Text>
                      </HStack>
                      <VStack spacing={0} align="end">
                        <Text color="gray.600" fontSize="sm">
                          {DateUtils.formatDate(person.updatedAt)}
                        </Text>
                        <Text color="gray.500" fontSize="xs">
                          {DateUtils.formatRelative(person.updatedAt)}
                        </Text>
                      </VStack>
                    </HStack>
                  </>
                )}
              </VStack>
            </CardBody>
          </Card>

          {/* Estadísticas de préstamos (placeholder) */}
          <Card bg={cardBg} shadow="sm">
            <CardHeader>
              <Heading size="md" color="gray.700">
                Historial de Préstamos
              </Heading>
            </CardHeader>
            <CardBody pt={0}>
              <VStack spacing={4}>
                <SimpleGrid columns={2} spacing={4} w="full">
                  <Stat textAlign="center">
                    <StatLabel>Préstamos Totales</StatLabel>
                    <StatNumber color="blue.600">-</StatNumber>
                    <StatHelpText>Próximamente</StatHelpText>
                  </Stat>
                  
                  <Stat textAlign="center">
                    <StatLabel>Préstamos Activos</StatLabel>
                    <StatNumber color="green.600">-</StatNumber>
                    <StatHelpText>Próximamente</StatHelpText>
                  </Stat>
                </SimpleGrid>

                <Alert status="info" size="sm" borderRadius="md">
                  <AlertIcon />
                  <Text fontSize="sm">
                    Las estadísticas de préstamos estarán disponibles cuando se implemente el sistema de préstamos.
                  </Text>
                </Alert>
              </VStack>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Acciones adicionales */}
        <Card bg={cardBg} shadow="sm">
          <CardBody>
            <VStack spacing={4}>
              <Text fontWeight="medium" color="gray.700">
                Acciones Rápidas
              </Text>
              
              <HStack spacing={3} wrap="wrap" justify="center">
                <Button
                  leftIcon={<FiBookOpen />}
                  variant="outline"
                  colorScheme="blue"
                  isDisabled
                >
                  Nuevo Préstamo
                </Button>
                
                <Button
                  leftIcon={<FiClock />}
                  variant="outline"
                  colorScheme="orange"
                  isDisabled
                >
                  Ver Historial
                </Button>
                
                <Button
                  leftIcon={<FiArrowLeft />}
                  variant="outline"
                  onClick={handleGoBack}
                >
                  Volver a la Lista
                </Button>
              </HStack>
              
              <Text fontSize="xs" color="gray.500" textAlign="center">
                Las funciones de préstamos estarán disponibles próximamente
              </Text>
            </VStack>
          </CardBody>
        </Card>
      </VStack>

      {/* Modal de edición */}
      <Modal isOpen={isEditOpen} onClose={onEditClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Editar {fullName}</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <PersonForm
              person={person}
              onSubmit={handleUpdatePerson}
              onCancel={onEditClose}
              isLoading={updateMutation.isPending}
              isEdit={true}
            />
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Dialog de confirmación para cambio de estado */}
      {statusChangeDialog}
    </DashboardLayout>
  );
}