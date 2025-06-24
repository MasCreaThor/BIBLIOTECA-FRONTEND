'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Button,
  Alert,
  AlertIcon,
  Icon,
  useColorModeValue,
  Flex,
  Link,
  HStack,
  Divider,
  Badge,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FiEye, FiEyeOff, FiBookOpen, FiArrowLeft, FiLock, FiMail, FiShield, FiUsers } from 'react-icons/fi';
import { useAuth } from '@/hooks/useAuth';
import { PublicOnlyRoute } from '@/components/auth/ProtectedRoute';
import { LoginRequest } from '@/types/api.types';
import toast from 'react-hot-toast';

// Schema de validación con Zod
const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('El email debe tener un formato válido')
    .transform((val) => val.toLowerCase().trim()),
  password: z
    .string()
    .min(1, 'La contraseña es requerida')
    .min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // URL de redirección después del login
  const redirectTo = searchParams.get('redirect') || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const bgGradient = useColorModeValue(
    'linear(135deg, blue.50 0%, indigo.50 25%, purple.50 50%, blue.50 75%, indigo.50 100%)',
    'linear(135deg, blue.900 0%, indigo.900 25%, purple.900 50%, blue.900 75%, indigo.900 100%)'
  );

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const inputBg = useColorModeValue('gray.50', 'gray.700');
  const inputBorder = useColorModeValue('gray.300', 'gray.600');

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      const credentials: LoginRequest = {
        email: data.email,
        password: data.password,
      };

      await login(credentials);
      
      // Redirigir a la página solicitada o dashboard
      router.push(redirectTo);
    } catch (error: any) {
      console.error('Error en login:', error);
      
      // Manejar diferentes tipos de errores
      let errorMessage = 'Error al iniciar sesión. Intenta nuevamente.';
      
      if (error?.response?.data?.message) {
        errorMessage = Array.isArray(error.response.data.message) 
          ? error.response.data.message.join(', ')
          : error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PublicOnlyRoute redirectTo="/dashboard">
      <Box minH="100vh" bgGradient={bgGradient} position="relative" overflow="hidden">
        {/* Elementos decorativos animados */}
        <Box
          position="absolute"
          top="5%"
          right="10%"
          width="300px"
          height="300px"
          borderRadius="full"
          bg="blue.200"
          opacity={0.1}
          filter="blur(80px)"
          animation="float 6s ease-in-out infinite"
          zIndex={0}
        />
        <Box
          position="absolute"
          bottom="5%"
          left="10%"
          width="250px"
          height="250px"
          borderRadius="full"
          bg="indigo.200"
          opacity={0.1}
          filter="blur(60px)"
          animation="float 8s ease-in-out infinite reverse"
          zIndex={0}
        />
        <Box
          position="absolute"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          width="400px"
          height="400px"
          borderRadius="full"
          bg="blue.100"
          opacity={0.05}
          filter="blur(100px)"
          animation="pulse 4s ease-in-out infinite"
          zIndex={0}
        />

        <Container maxW="md" centerContent>
          <Flex minH="100vh" align="center" justify="center">
            <Box
              w="full"
              maxW="sm"
              p={8}
              borderRadius="2xl"
              shadow="2xl"
              border="1px"
              borderColor={borderColor}
              bg={cardBg}
              position="relative"
              zIndex={1}
              backdropFilter="blur(10px)"
              _before={{
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: '2xl',
                padding: '2px',
                background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
                WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                WebkitMaskComposite: 'xor',
                maskComposite: 'exclude',
                zIndex: -1,
              }}
            >
              <VStack spacing={8}>
                {/* Header mejorado */}
                <VStack spacing={4}>
                  <Box position="relative">
                    <Icon
                      as={FiBookOpen}
                      boxSize={12}
                      color="blue.500"
                      animation="float 3s ease-in-out infinite"
                    />
                    <Badge
                      position="absolute"
                      top="-2"
                      right="-2"
                      colorScheme="green"
                      borderRadius="full"
                      px={2}
                      py={1}
                      fontSize="xs"
                    >
                      
                    </Badge>
                  </Box>
                  
                  <VStack spacing={3} textAlign="center">
                    <Heading size="xl" color="gray.800" fontWeight="bold">
                      Biblioteca Escolar
                    </Heading>
                    <Text color="gray.600" fontSize="lg" fontWeight="medium">
                      Sistema de Gestión Bibliotecaria
                    </Text>
                  </VStack>

                  <VStack spacing={2}>
                    <Heading size="lg" color="gray.700" fontWeight="semibold">
                      Iniciar Sesión
                    </Heading>
                    <Text color="gray.500" fontSize="sm">
                      Accede a tu cuenta para gestionar la biblioteca
                    </Text>
                  </VStack>
                </VStack>

                {/* Error Alert mejorado */}
                {error && (
                  <Alert 
                    status="error" 
                    borderRadius="xl"
                    bg="red.50"
                    border="1px"
                    borderColor="red.200"
                    color="red.700"
                  >
                    <AlertIcon />
                    <Text fontSize="sm" fontWeight="medium">{error}</Text>
                  </Alert>
                )}

                {/* Formulario mejorado */}
                <form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}>
                  <VStack spacing={5}>
                    {/* Campo Email */}
                    <FormControl isInvalid={!!errors.email}>
                      <FormLabel color="gray.700" fontWeight="semibold" fontSize="sm">
                        <HStack spacing={2}>
                          <Icon as={FiMail} color="blue.500" />
                          <Text>Correo Electrónico</Text>
                        </HStack>
                      </FormLabel>
                      <InputGroup>
                        <Input
                          {...register('email')}
                          type="email"
                          placeholder="tu.email@biblioteca.edu"
                          size="md"
                          bg={inputBg}
                          border="2px"
                          borderColor={inputBorder}
                          borderRadius="xl"
                          _hover={{
                            borderColor: 'blue.300',
                            bg: useColorModeValue('gray.100', 'gray.600'),
                          }}
                          _focus={{
                            borderColor: 'blue.500',
                            boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.15)',
                            bg: 'white',
                          }}
                          _placeholder={{
                            color: 'gray.400',
                          }}
                        />
                      </InputGroup>
                      {errors.email && (
                        <Text color="red.500" fontSize="sm" mt={2} fontWeight="medium">
                          {errors.email.message}
                        </Text>
                      )}
                    </FormControl>

                    {/* Campo Contraseña */}
                    <FormControl isInvalid={!!errors.password}>
                      <FormLabel color="gray.700" fontWeight="semibold" fontSize="sm">
                        <HStack spacing={2}>
                          <Icon as={FiLock} color="blue.500" />
                          <Text>Contraseña</Text>
                        </HStack>
                      </FormLabel>
                      <InputGroup>
                        <Input
                          {...register('password')}
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          size="md"
                          bg={inputBg}
                          border="2px"
                          borderColor={inputBorder}
                          borderRadius="xl"
                          _hover={{
                            borderColor: 'blue.300',
                            bg: useColorModeValue('gray.100', 'gray.600'),
                          }}
                          _focus={{
                            borderColor: 'blue.500',
                            boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.15)',
                            bg: 'white',
                          }}
                          _placeholder={{
                            color: 'gray.400',
                          }}
                        />
                        <InputRightElement
                          height="40px"
                          cursor="pointer"
                          onClick={() => setShowPassword(!showPassword)}
                          mr={2}
                        >
                          <Icon
                            as={showPassword ? FiEyeOff : FiEye}
                            color="gray.400"
                            _hover={{ color: 'blue.500' }}
                            transition="color 0.2s"
                          />
                        </InputRightElement>
                      </InputGroup>
                      {errors.password && (
                        <Text color="red.500" fontSize="sm" mt={2} fontWeight="medium">
                          {errors.password.message}
                        </Text>
                      )}
                    </FormControl>

                    {/* Enlace de recuperación de contraseña mejorado */}
                    <VStack spacing={2} w="full" align="end">
                      <Link
                        href="/forgot-password"
                        color="blue.500"
                        fontSize="sm"
                        fontWeight="semibold"
                        _hover={{ 
                          textDecoration: 'none',
                          color: 'blue.600',
                          transform: 'translateX(2px)',
                        }}
                        transition="all 0.2s"
                      >
                        ¿Olvidaste tu contraseña? 🔑
                      </Link>
                    </VStack>

                    {/* Botón de Login mejorado */}
                    <Button
                      type="submit"
                      colorScheme="blue"
                      size="lg"
                      w="full"
                      isLoading={isLoading}
                      loadingText="Iniciando sesión..."
                      leftIcon={<Icon as={FiShield} />}
                      borderRadius="xl"
                      fontWeight="bold"
                      fontSize="md"
                      py={6}
                      bgGradient="linear(to-r, blue.500, indigo.500)"
                      _hover={{
                        bgGradient: 'linear(to-r, blue.600, indigo.600)',
                        transform: 'translateY(-2px)',
                        shadow: 'xl',
                      }}
                      _active={{
                        transform: 'translateY(0)',
                      }}
                      transition="all 0.3s"
                    >
                      Iniciar Sesión
                    </Button>
                  </VStack>
                </form>

                {/* Footer mejorado */}
                <VStack spacing={4} w="full">
                  <Divider borderColor="gray.200" />
                  
                  <HStack spacing={3} color="gray.500" fontSize="sm">
                    <Icon as={FiUsers} />
                    <Text>Acceso exclusivo para personal autorizado</Text>
                  </HStack>
                  
                  {/* Link para volver */}
                  <HStack spacing={2}>
                    <Icon as={FiArrowLeft} color="gray.400" />
                    <Link
                      href="/"
                      color="blue.500"
                      fontSize="sm"
                      fontWeight="semibold"
                      _hover={{ 
                        textDecoration: 'none',
                        color: 'blue.600',
                        transform: 'translateX(-2px)',
                      }}
                      transition="all 0.2s"
                    >
                      Volver al inicio
                    </Link>
                  </HStack>
                </VStack>
              </VStack>
            </Box>
          </Flex>
        </Container>
      </Box>
    </PublicOnlyRoute>
  );
}
