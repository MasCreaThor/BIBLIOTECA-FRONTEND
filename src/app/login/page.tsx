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
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FiEye, FiEyeOff, FiBookOpen, FiArrowLeft, FiLock, FiMail } from 'react-icons/fi';
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
    'linear(to-br, blue.50, purple.50, pink.50)',
    'linear(to-br, blue.900, purple.900, pink.900)'
  );

  const cardBg = useColorModeValue('white', 'gray.800');

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
      <Box minH="100vh" bgGradient={bgGradient} position="relative">
        {/* Elementos decorativos de fondo */}
        <Box
          position="absolute"
          top="10%"
          right="15%"
          width="200px"
          height="200px"
          borderRadius="full"
          bg="blue.100"
          opacity={0.3}
          filter="blur(60px)"
          zIndex={0}
        />
        <Box
          position="absolute"
          bottom="10%"
          left="15%"
          width="150px"
          height="150px"
          borderRadius="full"
          bg="purple.100"
          opacity={0.3}
          filter="blur(40px)"
          zIndex={0}
        />

        <Container maxW="md" centerContent>
          <Flex minH="100vh" align="center" justify="center" w="full">
            <Box
              w="full"
              maxW="md"
              p={8}
              borderRadius="2xl"
              shadow="2xl"
              border="1px"
              borderColor={useColorModeValue('gray.200', 'gray.600')}
              bg={cardBg}
              position="relative"
              zIndex={1}
            >
              <VStack spacing={8}>
                {/* Header */}
                <VStack spacing={4}>
                  <HStack spacing={3}>
                    <Icon
                      as={FiBookOpen}
                      boxSize={10}
                      color="blue.500"
                    />
                    <Heading
                      size="xl"
                      color="gray.800"
                      fontWeight="bold"
                    >
                      Biblioteca Escolar
                    </Heading>
                  </HStack>
                  
                  <VStack spacing={2} textAlign="center">
                    <Heading size="lg" color="gray.700">
                      Iniciar Sesión
                    </Heading>
                    <Text color="gray.600">
                      Accede al sistema de gestión bibliotecaria
                    </Text>
                  </VStack>
                </VStack>

                {/* Error Alert */}
                {error && (
                  <Alert status="error" borderRadius="md">
                    <AlertIcon />
                    <Text fontSize="sm">{error}</Text>
                  </Alert>
                )}

                {/* Formulario */}
                <Box w="full">
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <VStack spacing={6}>
                      {/* Campo Email */}
                      <FormControl isInvalid={!!errors.email}>
                        <FormLabel color="gray.700" fontWeight="medium">
                          Email
                        </FormLabel>
                        <InputGroup>
                          <Input
                            {...register('email')}
                            type="email"
                            placeholder="tu.email@biblioteca.edu"
                            size="lg"
                            bg={useColorModeValue('gray.50', 'gray.700')}
                            border="1px"
                            borderColor={useColorModeValue('gray.300', 'gray.600')}
                            _hover={{
                              borderColor: useColorModeValue('gray.400', 'gray.500'),
                            }}
                            _focus={{
                              borderColor: 'blue.500',
                              boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)',
                            }}
                          />
                          <InputRightElement pointerEvents="none" height="48px">
                            <Icon as={FiMail} color="gray.400" />
                          </InputRightElement>
                        </InputGroup>
                        {errors.email && (
                          <Text color="red.500" fontSize="sm" mt={1}>
                            {errors.email.message}
                          </Text>
                        )}
                      </FormControl>

                      {/* Campo Contraseña */}
                      <FormControl isInvalid={!!errors.password}>
                        <FormLabel color="gray.700" fontWeight="medium">
                          Contraseña
                        </FormLabel>
                        <InputGroup>
                          <Input
                            {...register('password')}
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Tu contraseña"
                            size="lg"
                            bg={useColorModeValue('gray.50', 'gray.700')}
                            border="1px"
                            borderColor={useColorModeValue('gray.300', 'gray.600')}
                            _hover={{
                              borderColor: useColorModeValue('gray.400', 'gray.500'),
                            }}
                            _focus={{
                              borderColor: 'blue.500',
                              boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)',
                            }}
                          />
                          <InputRightElement
                            height="48px"
                            cursor="pointer"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            <Icon
                              as={showPassword ? FiEyeOff : FiEye}
                              color="gray.400"
                              _hover={{ color: 'gray.600' }}
                            />
                          </InputRightElement>
                        </InputGroup>
                        {errors.password && (
                          <Text color="red.500" fontSize="sm" mt={1}>
                            {errors.password.message}
                          </Text>
                        )}
                      </FormControl>

                      {/* Botón de Login */}
                      <Button
                        type="submit"
                        colorScheme="blue"
                        size="lg"
                        w="full"
                        isLoading={isLoading}
                        loadingText="Iniciando sesión..."
                        leftIcon={<Icon as={FiLock} />}
                        _hover={{
                          transform: 'translateY(-1px)',
                          shadow: 'lg',
                        }}
                        transition="all 0.2s"
                      >
                        Iniciar Sesión
                      </Button>
                    </VStack>
                  </form>
                </Box>

                {/* Footer */}
                <VStack spacing={4} w="full">
                  <Divider />
                  
                  <VStack spacing={2}>
                    <Text fontSize="sm" color="gray.500" textAlign="center">
                      ¿Primera vez usando el sistema?
                    </Text>
                    <Text fontSize="sm" color="blue.600" fontWeight="medium">
                      Contacta al administrador para obtener credenciales
                    </Text>
                  </VStack>

                  {/* Link para volver */}
                  <HStack spacing={2}>
                    <Icon as={FiArrowLeft} color="gray.400" />
                    <Link
                      href="/"
                      color="blue.500"
                      fontSize="sm"
                      fontWeight="medium"
                      _hover={{ textDecoration: 'underline' }}
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