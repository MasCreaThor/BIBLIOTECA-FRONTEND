'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  useColorModeValue,
  Flex,
  Stack,
} from '@chakra-ui/react';
import { useAuth } from '@/hooks/useAuth';
import {
  BackgroundElements,
  HeroSection,
  LoginCard,
  HomeFooter,
  LoadingState,
} from '@/components/home';

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  
  const bgGradient = useColorModeValue(
    'linear(to-br, blue.50, purple.50, pink.50)',
    'linear(to-br, blue.900, purple.900, pink.900)'
  );

  // Redirigir a dashboard si ya está autenticado
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  // Mostrar loading mientras verifica autenticación
  if (isLoading) {
    return <LoadingState bgGradient={bgGradient} />;
  }

  // Si está autenticado, no mostrar nada (se redirige automáticamente)
  if (isAuthenticated) {
    return null;
  }

  const handleLoginRedirect = () => {
    router.push('/login');
  };

  return (
    <Box minH="100vh" bgGradient={bgGradient} position="relative" overflow="hidden">
      {/* Elementos decorativos de fondo */}
      <BackgroundElements />

      {/* Contenido principal */}
      <Container maxW="6xl" position="relative" zIndex={1}>
        <Flex minH="100vh" align="center" justify="center">
          <Stack
            direction={{ base: 'column', lg: 'row' }}
            spacing={{ base: 12, lg: 20 }}
            align="center"
            w="full"
          >
            {/* Sección de información (lado izquierdo) */}
            <HeroSection />

            {/* Card de acceso (lado derecho) */}
            <LoginCard onLoginClick={handleLoginRedirect} />
          </Stack>
        </Flex>
      </Container>

      {/* Footer */}
      <HomeFooter />
    </Box>
  );
}