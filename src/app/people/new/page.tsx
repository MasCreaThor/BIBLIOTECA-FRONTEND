// src/app/people/new/page.tsx
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
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Icon,
  useColorModeValue,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  FiUsers,
  FiChevronRight,
  FiArrowLeft,
  FiCheck,
  FiInfo,
} from 'react-icons/fi';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PersonForm } from '@/components/people/PersonForm';
import { useCreatePerson } from '@/hooks/usePeople';
import type { CreatePersonRequest } from '@/types/api.types';

export default function NewPersonPage() {
  const router = useRouter();
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdPersonName, setCreatedPersonName] = useState('');

  const createMutation = useCreatePerson();

  const handleCreatePerson = async (data: CreatePersonRequest) => {
    try {
      const newPerson = await createMutation.mutateAsync(data);
      // Construir nombre completo con fallback
      const fullName = newPerson.fullName || `${newPerson.firstName} ${newPerson.lastName}`;
      setCreatedPersonName(fullName);
      setShowSuccess(true);
      
      // Redirigir después de 3 segundos o al hacer clic en "Ver lista"
      setTimeout(() => {
        router.push('/people');
      }, 3000);
    } catch (error) {
      // El error se maneja en el hook
    }
  };

  const handleCancel = () => {
    router.push('/people');
  };

  const handleGoToList = () => {
    router.push('/people');
  };

  const cardBg = useColorModeValue('white', 'gray.800');

  // Estado de éxito
  if (showSuccess) {
    return (
      <DashboardLayout>
        <Box maxW="2xl" mx="auto" py={8}>
          <Card bg={cardBg} shadow="lg">
            <CardBody p={8}>
              <VStack spacing={6} textAlign="center">
                <Box
                  p={4}
                  bg="green.50"
                  borderRadius="full"
                >
                  <Icon as={FiCheck} boxSize={12} color="green.500" />
                </Box>
                
                <VStack spacing={2}>
                  <Heading size="lg" color="green.700">
                    ¡Persona registrada exitosamente!
                  </Heading>
                  <Text color="gray.600" fontSize="lg">
                    <strong>{createdPersonName}</strong> ha sido registrado en el sistema.
                  </Text>
                </VStack>

                <Text fontSize="sm" color="gray.500">
                  Serás redirigido automáticamente a la lista de personas en unos segundos...
                </Text>

                <HStack spacing={3}>
                  <Button
                    leftIcon={<FiUsers />}
                    colorScheme="green"
                    onClick={handleGoToList}
                    size="lg"
                  >
                    Ver Lista de Personas
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowSuccess(false);
                      setCreatedPersonName('');
                    }}
                  >
                    Registrar Otra Persona
                  </Button>
                </HStack>
              </VStack>
            </CardBody>
          </Card>
        </Box>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <VStack spacing={6} align="stretch" maxW="4xl" mx="auto">
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
            <Text color="gray.600" fontWeight="medium">
              Nueva Persona
            </Text>
          </BreadcrumbItem>
        </Breadcrumb>

        {/* Header */}
        <Box>
          <HStack spacing={4} mb={2}>
            <Button
              leftIcon={<FiArrowLeft />}
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              color="gray.600"
            >
              Volver a la lista
            </Button>
          </HStack>
          
          <HStack spacing={3} mb={4}>
            <Box
              p={3}
              bg="blue.50"
              borderRadius="xl"
            >
              <FiUsers size={32} color="#3182CE" />
            </Box>
            <VStack align="start" spacing={1}>
              <Heading size="xl" color="gray.800">
                Registrar Nueva Persona
              </Heading>
              <Text color="gray.600" fontSize="lg">
                Agrega un nuevo estudiante o docente al sistema
              </Text>
            </VStack>
          </HStack>
        </Box>

        {/* Información importante */}
        <Alert status="info" borderRadius="md">
          <AlertIcon />
          <Box>
            <AlertTitle>Información importante</AlertTitle>
            <AlertDescription fontSize="sm">
              <VStack align="start" spacing={1} mt={2}>
                <Text>• El número de documento es opcional para estudiantes pero recomendado para docentes</Text>
                <Text>• El grado es obligatorio para estudiantes y opcional para docentes</Text>
                <Text>• Una vez registrado, el tipo de persona no se puede cambiar</Text>
                <Text>• Los nombres y apellidos se guardarán con formato de título (Primera Letra Mayúscula)</Text>
              </VStack>
            </AlertDescription>
          </Box>
        </Alert>

        {/* Formulario */}
        <PersonForm
          onSubmit={handleCreatePerson}
          onCancel={handleCancel}
          isLoading={createMutation.isPending}
        />

        {/* Ayuda adicional */}
        <Card bg={useColorModeValue('gray.50', 'gray.700')} borderRadius="md">
          <CardBody>
            <VStack spacing={3} align="start">
              <HStack spacing={2}>
                <Icon as={FiInfo} color="blue.500" />
                <Text fontWeight="medium" color="gray.700">
                  ¿Necesitas ayuda?
                </Text>
              </HStack>
              
              <VStack align="start" spacing={1} fontSize="sm" color="gray.600">
                <Text>
                  <strong>Para estudiantes:</strong> Asegúrate de incluir el grado académico correcto (ej: 1A, 5B, Jardín)
                </Text>
                <Text>
                  <strong>Para docentes:</strong> Puedes especificar el área de enseñanza o cargo en el campo "Área"
                </Text>
                <Text>
                  <strong>Documentos duplicados:</strong> El sistema verificará automáticamente si ya existe una persona con el mismo número de documento
                </Text>
              </VStack>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </DashboardLayout>
  );
}