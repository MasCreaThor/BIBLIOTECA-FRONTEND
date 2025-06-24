'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  FormControl,
  FormLabel,
  Input,
  Button,
  Alert,
  AlertIcon,
  Icon,
  useColorModeValue,
  Flex,
  Link,
  HStack,
  Badge,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FiMail, FiArrowLeft, FiBookOpen, FiShield, FiCheckCircle, FiSend } from 'react-icons/fi';
import { AuthService } from '@/services/auth.service';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';

// Schema de validación con Zod
const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('El email debe tener un formato válido')
    .transform((val) => val.toLowerCase().trim()),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const bgGradient = useColorModeValue(
    'linear(135deg, blue.50 0%, indigo.50 25%, purple.50 50%, blue.50 75%, indigo.50 100%)',
    'linear(135deg, blue.900 0%, indigo.900 25%, purple.900 50%, blue.900 75%, indigo.900 100%)'
  );

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const inputBg = useColorModeValue('gray.50', 'gray.700');
  const inputBorder = useColorModeValue('gray.300', 'gray.600');

  useEffect(() => {
    if (user) {
      router.replace('/dashboard');
    }
  }, [user, router]);

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      await AuthService.forgotPassword(data.email);
      
      setIsSuccess(true);
      toast.success('Email de recuperación enviado');
    } catch (error: any) {
      console.error('Error en forgot password:', error);
      
      let errorMessage = 'Error al enviar el email de recuperación. Intenta nuevamente.';
      
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

  if (isSuccess) {
    return (
      <Box minH="100vh" bgGradient={bgGradient} position="relative" overflow="hidden">
        {/* Elementos decorativos animados */}
        <Box
          position="absolute"
          top="5%"
          right="10%"
          width="300px"
          height="300px"
          borderRadius="full"
          bg="green.200"
          opacity={0.1}
          filter="blur(80px)"
          zIndex={0}
        />
        <Box
          position="absolute"
          bottom="5%"
          left="10%"
          width="250px"
          height="250px"
          borderRadius="full"
          bg="blue.200"
          opacity={0.1}
          filter="blur(60px)"
          zIndex={0}
        />

        <Container maxW="lg" centerContent>
          <Flex minH="100vh" align="center" justify="center">
            <Box
              w="full"
              maxW="md"
              p={10}
              borderRadius="3xl"
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
                borderRadius: '3xl',
                padding: '2px',
                background: 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)',
                WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                WebkitMaskComposite: 'xor',
                maskComposite: 'exclude',
                zIndex: -1,
              }}
            >
              <VStack spacing={8}>
                {/* Header de éxito */}
                <VStack spacing={6}>
                  <Box position="relative">
                    <Icon
                      as={FiCheckCircle}
                      boxSize={20}
                      color="green.500"
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
                      ✓ Enviado
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
                    <Heading size="lg" color="green.600" fontWeight="semibold">
                      ¡Email Enviado!
                    </Heading>
                    <Text color="gray.500" fontSize="sm">
                      Revisa tu bandeja de entrada
                    </Text>
                  </VStack>
                </VStack>

                {/* Success Alert mejorado */}
                <Alert 
                  status="success" 
                  borderRadius="xl"
                  bg="green.50"
                  border="1px"
                  borderColor="green.200"
                  color="green.700"
                >
                  <AlertIcon />
                  <VStack align="start" spacing={3}>
                    <Text fontWeight="semibold" fontSize="md">
                      ¡Email de recuperación enviado exitosamente!
                    </Text>
                    <Text fontSize="sm">
                      Si el email existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña en los próximos minutos.
                    </Text>
                    <Box bg="green.100" p={3} borderRadius="md" w="full">
                      <Text fontSize="sm" fontWeight="medium" color="green.800">
                        💡 Consejo: Revisa también tu carpeta de spam si no encuentras el email en tu bandeja principal.
                      </Text>
                    </Box>
                  </VStack>
                </Alert>

                {/* Botones mejorados */}
                <VStack spacing={4} w="full">
                  <Button
                    colorScheme="green"
                    size="lg"
                    w="full"
                    onClick={() => router.push('/login')}
                    borderRadius="xl"
                    fontWeight="bold"
                    fontSize="md"
                    py={7}
                    bgGradient="linear(to-r, green.500, teal.500)"
                    _hover={{
                      bgGradient: 'linear(to-r, green.600, teal.600)',
                      transform: 'translateY(-2px)',
                      shadow: 'xl',
                    }}
                    _active={{
                      transform: 'translateY(0)',
                    }}
                    transition="all 0.3s"
                  >
                    Volver al Login
                  </Button>

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
    );
  }

  return (
    <Box minH="100vh" bgGradient={bgGradient} position="relative" overflow="hidden">
      {/* Elementos decorativos animados */}
      <Box
        position="absolute"
        top="5%"
        right="10%"
        width="300px"
        height="300px"
        borderRadius="full"
        bg="green.200"
        opacity={0.1}
        filter="blur(80px)"
        zIndex={0}
      />
      <Box
        position="absolute"
        bottom="5%"
        left="10%"
        width="250px"
        height="250px"
        borderRadius="full"
        bg="blue.200"
        opacity={0.1}
        filter="blur(60px)"
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
        bg="pink.200"
        opacity={0.05}
        filter="blur(100px)"
        animation={`${'pulse'} 4s ease-in-out infinite`}
        zIndex={0}
      />

      <Container maxW="lg" centerContent>
        <Flex minH="100vh" align="center" justify="center">
          <Box
            w="full"
            maxW="md"
            p={10}
            borderRadius="3xl"
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
              borderRadius: '3xl',
              padding: '2px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              WebkitMaskComposite: 'xor',
              maskComposite: 'exclude',
              zIndex: -1,
            }}
          >
            <VStack spacing={8}>
              {/* Header mejorado */}
              <VStack spacing={6}>
                <Box position="relative">
                  <Icon
                    as={FiShield}
                    boxSize={16}
                    color="blue.500"
                  />
                  <Badge
                    position="absolute"
                    top="-2"
                    right="-2"
                    colorScheme="blue"
                    borderRadius="full"
                    px={2}
                    py={1}
                    fontSize="xs"
                  >
                    🔐
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
                    Recuperar Contraseña
                  </Heading>
                  <Text color="gray.500" fontSize="sm">
                    Ingresa tu email para recibir un enlace de recuperación
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
                <VStack spacing={6}>
                  {/* Campo Email */}
                  <FormControl isInvalid={!!errors.email}>
                    <FormLabel color="gray.700" fontWeight="semibold" fontSize="sm">
                      <HStack spacing={2}>
                        <Icon as={FiMail} color="blue.500" />
                        <Text>Correo Electrónico</Text>
                      </HStack>
                    </FormLabel>
                    <Input
                      {...register('email')}
                      type="email"
                      placeholder="tu.email@biblioteca.edu"
                      size="lg"
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
                        boxShadow: '0 0 0 3px rgba(66, 153, 225, 0.15)',
                        bg: 'white',
                      }}
                      _placeholder={{
                        color: 'gray.400',
                      }}
                    />
                    {errors.email && (
                      <Text color="red.500" fontSize="sm" mt={2} fontWeight="medium">
                        {errors.email.message}
                      </Text>
                    )}
                  </FormControl>

                  {/* Botón de Envío mejorado */}
                  <Button
                    type="submit"
                    colorScheme="blue"
                    size="lg"
                    w="full"
                    isLoading={isLoading}
                    loadingText="Enviando email..."
                    leftIcon={<Icon as={FiSend} />}
                    borderRadius="xl"
                    fontWeight="bold"
                    fontSize="md"
                    py={7}
                    bgGradient="linear(to-r, blue.500, purple.500)"
                    _hover={{
                      bgGradient: 'linear(to-r, blue.600, purple.600)',
                      transform: 'translateY(-2px)',
                      shadow: 'xl',
                    }}
                    _active={{
                      transform: 'translateY(0)',
                    }}
                    transition="all 0.3s"
                  >
                    Enviar Email de Recuperación
                  </Button>
                </VStack>
              </form>

              {/* Footer mejorado */}
              <VStack spacing={4} w="full">
                <VStack spacing={2}>
                  <Text fontSize="sm" color="gray.500" textAlign="center">
                    ¿Recordaste tu contraseña?
                  </Text>
                  <Link
                    href="/login"
                    color="blue.600"
                    fontSize="sm"
                    fontWeight="semibold"
                    _hover={{ 
                      textDecoration: 'none',
                      color: 'blue.700',
                      transform: 'translateX(2px)',
                    }}
                    transition="all 0.2s"
                  >
                    Volver al login 🔙
                  </Link>
                </VStack>

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
  );
} 
