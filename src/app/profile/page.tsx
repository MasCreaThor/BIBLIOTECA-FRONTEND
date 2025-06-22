'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  Input,
  Button,
  Divider,
  Alert,
  AlertIcon,
  useToast,
  Badge,
  Icon,
  Skeleton,
  SkeletonText,
  useDisclosure,
  Grid,
  GridItem,
  Avatar,
  Flex,
  IconButton,
  Tooltip,
  Container,
  SimpleGrid,
} from '@chakra-ui/react';
import { 
  FiUser, 
  FiMail, 
  FiShield, 
  FiCalendar, 
  FiEdit3, 
  FiSave, 
  FiX, 
  FiLock, 
  FiCheck,
  FiClock,
  FiAward
} from 'react-icons/fi';
import { AuthService } from '@/services/auth.service';
import { User } from '@/types/api.types';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DateUtils } from '@/utils';
import { ChangePasswordModal } from '@/components/auth/ChangePasswordModal';

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Formulario de perfil
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });

  // Modal de cambio de contraseña
  const { isOpen: isPasswordModalOpen, onOpen: onPasswordModalOpen, onClose: onPasswordModalClose } = useDisclosure();

  const toast = useToast();

  // Cargar datos del usuario
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const userData = await AuthService.getCurrentUser();
      setUser(userData);
      setFormData({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userData.email || '',
      });
    } catch (error: any) {
      setError(error.message || 'Error al cargar datos del usuario');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
    });
    setError(null);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);

      const updatedUser = await AuthService.updateProfile(formData);
      setUser(updatedUser);
      setIsEditing(false);

      toast({
        title: 'Perfil actualizado',
        description: 'Tu perfil ha sido actualizado exitosamente',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error: any) {
      setError(error.message || 'Error al actualizar perfil');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const getRoleLabel = (role: string) => {
    return role === 'admin' ? 'Administrador' : 'Bibliotecario';
  };

  const getRoleColor = (role: string) => {
    return role === 'admin' ? 'purple' : 'blue';
  };

  const getRoleIcon = (role: string) => {
    return role === 'admin' ? FiAward : FiShield;
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <Container maxW="6xl" py={8}>
          <VStack spacing={8} align="stretch">
            <Skeleton height="60px" width="300px" />
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
              <Skeleton height="400px" />
              <Skeleton height="300px" />
            </SimpleGrid>
          </VStack>
        </Container>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout>
        <Container maxW="6xl" py={8}>
          <Alert status="error" borderRadius="xl" bg="red.50" border="1px" borderColor="red.200">
            <AlertIcon />
            <Box>
              <Text fontSize="md" fontWeight="semibold" color="red.800">
                Error al cargar perfil
              </Text>
              <Text fontSize="sm" color="red.600">
                {error || 'No se pudieron cargar los datos del usuario'}
              </Text>
            </Box>
          </Alert>
        </Container>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <Container maxW="6xl" py={8}>
        <VStack spacing={8} align="stretch">
          {/* Header mejorado */}
          <Box textAlign="center" py={6}>
            <VStack spacing={4}>
              <Avatar 
                size="2xl" 
                name={`${user.firstName} ${user.lastName}`}
                bg="primary.500"
                color="white"
                fontSize="2xl"
                fontWeight="bold"
              />
              <VStack spacing={2}>
                <Heading size="lg" color="gray.800" fontWeight="bold">
                  {user.firstName && user.lastName 
                    ? `${user.firstName} ${user.lastName}` 
                    : 'Mi Perfil'
                  }
                </Heading>
                <Text color="gray.600" fontSize="lg">
                  Gestiona tu información personal y configuración de cuenta
                </Text>
                <Badge 
                  colorScheme={getRoleColor(user.role)} 
                  variant="solid" 
                  px={4} 
                  py={2} 
                  borderRadius="full"
                  fontSize="sm"
                >
                  <HStack spacing={2}>
                    <Icon as={getRoleIcon(user.role)} />
                    <Text>{getRoleLabel(user.role)}</Text>
                  </HStack>
                </Badge>
              </VStack>
            </VStack>
          </Box>

          {/* Grid principal */}
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
            {/* Información del Perfil */}
            <Card 
              bg="white" 
              shadow="xl" 
              borderRadius="2xl" 
              border="1px" 
              borderColor="gray.100"
              overflow="hidden"
            >
              <Box bg="primary.500" px={6} py={4}>
                <HStack justify="space-between" align="center">
                  <HStack spacing={3}>
                    <Icon as={FiUser} color="white" boxSize={6} />
                    <VStack align="start" spacing={0}>
                      <Heading size="md" color="white" fontWeight="bold">
                        Información Personal
                      </Heading>
                      <Text fontSize="sm" color="white" opacity={0.9}>
                        Actualiza tus datos personales
                      </Text>
                    </VStack>
                  </HStack>
                </HStack>
              </Box>

              <CardBody p={6}>
                {error && (
                  <Alert status="error" borderRadius="lg" mb={6} bg="red.50" border="1px" borderColor="red.200">
                    <AlertIcon />
                    <Text fontSize="sm" color="red.700">{error}</Text>
                  </Alert>
                )}

                <VStack spacing={6} align="stretch">
                  {/* Nombre */}
                  <FormControl>
                    <FormLabel fontWeight="semibold" color="gray.700" fontSize="sm">
                      Nombre
                    </FormLabel>
                    {isEditing ? (
                      <Input
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        placeholder="Tu nombre"
                        bg="gray.50"
                        border="2px"
                        borderColor="gray.200"
                        _focus={{ borderColor: 'blue.400', bg: 'white', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
                        _hover={{ borderColor: 'gray.300' }}
                        size="lg"
                      />
                    ) : (
                      <HStack spacing={3} p={4} bg="gray.50" borderRadius="lg" border="1px" borderColor="gray.200">
                        <Icon as={FiUser} color="blue.500" boxSize={5} />
                        <Text color="gray.700" fontSize="md" fontWeight="medium">
                          {user.firstName || 'No especificado'}
                        </Text>
                      </HStack>
                    )}
                  </FormControl>

                  {/* Apellido */}
                  <FormControl>
                    <FormLabel fontWeight="semibold" color="gray.700" fontSize="sm">
                      Apellido
                    </FormLabel>
                    {isEditing ? (
                      <Input
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        placeholder="Tu apellido"
                        bg="gray.50"
                        border="2px"
                        borderColor="gray.200"
                        _focus={{ borderColor: 'blue.400', bg: 'white', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
                        _hover={{ borderColor: 'gray.300' }}
                        size="lg"
                      />
                    ) : (
                      <HStack spacing={3} p={4} bg="gray.50" borderRadius="lg" border="1px" borderColor="gray.200">
                        <Icon as={FiUser} color="blue.500" boxSize={5} />
                        <Text color="gray.700" fontSize="md" fontWeight="medium">
                          {user.lastName || 'No especificado'}
                        </Text>
                      </HStack>
                    )}
                  </FormControl>

                  {/* Email */}
                  <FormControl>
                    <FormLabel fontWeight="semibold" color="gray.700" fontSize="sm">
                      Correo Electrónico
                    </FormLabel>
                    {isEditing ? (
                      <Input
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="tu@email.com"
                        bg="gray.50"
                        border="2px"
                        borderColor="gray.200"
                        _focus={{ borderColor: 'blue.400', bg: 'white', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
                        _hover={{ borderColor: 'gray.300' }}
                        size="lg"
                      />
                    ) : (
                      <HStack spacing={3} p={4} bg="gray.50" borderRadius="lg" border="1px" borderColor="gray.200">
                        <Icon as={FiMail} color="green.500" boxSize={5} />
                        <Text color="gray.700" fontSize="md" fontWeight="medium">
                          {user.email}
                        </Text>
                      </HStack>
                    )}
                  </FormControl>

                  {/* Botones de acción */}
                  {!isEditing ? (
                    <Button
                      leftIcon={<FiEdit3 />}
                      colorScheme="primary"
                      variant="outline"
                      size="lg"
                      onClick={handleEdit}
                      borderRadius="lg"
                      _hover={{ bg: 'primary.50' }}
                      mt={4}
                    >
                      Editar Información
                    </Button>
                  ) : (
                    <HStack spacing={4} mt={4}>
                      <Button
                        leftIcon={<FiX />}
                        variant="outline"
                        size="lg"
                        onClick={handleCancel}
                        isDisabled={isSaving}
                        borderRadius="lg"
                        flex={1}
                        _hover={{ bg: 'gray.50' }}
                      >
                        Cancelar
                      </Button>
                      <Button
                        leftIcon={<FiSave />}
                        colorScheme="primary"
                        size="lg"
                        onClick={handleSave}
                        isLoading={isSaving}
                        isDisabled={!formData.firstName || !formData.lastName || !formData.email}
                        borderRadius="lg"
                        flex={1}
                      >
                        Guardar Cambios
                      </Button>
                    </HStack>
                  )}
                </VStack>
              </CardBody>
            </Card>

            {/* Información del Sistema */}
            <VStack spacing={6} align="stretch">
              {/* Cambio de Contraseña */}
              <Card 
                bg="white" 
                shadow="xl" 
                borderRadius="2xl" 
                border="1px" 
                borderColor="gray.100"
                overflow="hidden"
              >
                <Box bg="secondary.500" px={6} py={4}>
                  <HStack spacing={3}>
                    <Icon as={FiLock} color="white" boxSize={6} />
                    <VStack align="start" spacing={0}>
                      <Heading size="md" color="white" fontWeight="bold">
                        Seguridad
                      </Heading>
                      <Text fontSize="sm" color="white" opacity={0.9}>
                        Gestiona tu contraseña de acceso
                      </Text>
                    </VStack>
                  </HStack>
                </Box>

                <CardBody p={6}>
                  <VStack spacing={4} align="stretch">
                    <Text fontSize="sm" color="gray.600" textAlign="center">
                      Mantén tu cuenta segura actualizando tu contraseña regularmente
                    </Text>
                    <Button
                      leftIcon={<FiLock />}
                      colorScheme="orange"
                      variant="outline"
                      size="lg"
                      onClick={onPasswordModalOpen}
                      borderRadius="lg"
                      _hover={{ bg: 'orange.50' }}
                    >
                      Cambiar Contraseña
                    </Button>
                  </VStack>
                </CardBody>
              </Card>

              {/* Información del Sistema */}
              <Card 
                bg="white" 
                shadow="xl" 
                borderRadius="2xl" 
                border="1px" 
                borderColor="gray.100"
                overflow="hidden"
              >
                <Box bg="blue.500" px={6} py={4}>
                  <HStack spacing={3}>
                    <Icon as={FiClock} color="white" boxSize={6} />
                    <VStack align="start" spacing={0}>
                      <Heading size="md" color="white" fontWeight="bold">
                        Información del Sistema
                      </Heading>
                      <Text fontSize="sm" color="white" opacity={0.9}>
                        Detalles de tu cuenta
                      </Text>
                    </VStack>
                  </HStack>
                </Box>

                <CardBody p={6}>
                  <VStack spacing={4} align="stretch">
                    {/* Último acceso */}
                    {user?.lastLogin && (
                      <HStack justify="space-between" p={3} bg="blue.50" borderRadius="lg" border="1px" borderColor="blue.200">
                        <HStack spacing={3}>
                          <Icon as={FiClock} color="blue.500" boxSize={4} />
                          <Text fontSize="sm" fontWeight="medium" color="gray.700">
                            Último Acceso
                          </Text>
                        </HStack>
                        <Text fontSize="sm" color="gray.600" fontWeight="medium">
                          {DateUtils.formatRelative(user.lastLogin)}
                        </Text>
                      </HStack>
                    )}

                    {/* Fecha de creación */}
                    <HStack justify="space-between" p={3} bg="green.50" borderRadius="lg" border="1px" borderColor="green.200">
                      <HStack spacing={3}>
                        <Icon as={FiCalendar} color="green.500" boxSize={4} />
                        <Text fontSize="sm" fontWeight="medium" color="gray.700">
                          Miembro desde
                        </Text>
                      </HStack>
                      <Text fontSize="sm" color="gray.600" fontWeight="medium">
                        {DateUtils.formatRelative(user?.createdAt || new Date())}
                      </Text>
                    </HStack>

                    {/* Estado de la cuenta */}
                    <HStack justify="space-between" p={3} bg="purple.50" borderRadius="lg" border="1px" borderColor="purple.200">
                      <HStack spacing={3}>
                        <Icon as={FiCheck} color="purple.500" boxSize={4} />
                        <Text fontSize="sm" fontWeight="medium" color="gray.700">
                          Estado de la Cuenta
                        </Text>
                      </HStack>
                      <Badge colorScheme={user?.active ? 'green' : 'red'} variant="solid" borderRadius="full">
                        {user?.active ? 'Activa' : 'Inactiva'}
                      </Badge>
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>
            </VStack>
          </SimpleGrid>

          {/* Información de ayuda */}
          <Alert 
            status="info" 
            borderRadius="2xl" 
            bg="blue.50" 
            border="1px" 
            borderColor="blue.200"
            p={6}
          >
            <AlertIcon boxSize={6} color="blue.500" />
            <Box>
              <Text fontSize="md" fontWeight="semibold" color="blue.800" mb={2}>
                💡 Información del Perfil
              </Text>
              <Text fontSize="sm" color="blue.700">
                Puedes actualizar tu nombre, apellido y correo electrónico en cualquier momento. 
                También puedes cambiar tu contraseña de acceso de forma segura para mantener tu cuenta protegida.
              </Text>
            </Box>
          </Alert>

          {/* Modal de cambio de contraseña */}
          <ChangePasswordModal 
            isOpen={isPasswordModalOpen} 
            onClose={onPasswordModalClose} 
          />
        </VStack>
      </Container>
    </DashboardLayout>
  );
} 