import {
    Box,
    VStack,
    Heading,
    Text,
    Button,
    Icon,
    useColorModeValue,
  } from '@chakra-ui/react';
  import { FiBookOpen, FiArrowRight } from 'react-icons/fi';
  
  interface LoginCardProps {
    onLoginClick: () => void;
  }
  
  export function LoginCard({ onLoginClick }: LoginCardProps) {
    const cardBg = useColorModeValue('white', 'gray.800');
    const shadowColor = useColorModeValue('lg', 'dark-lg');
    
    return (
      <Box flex={1} w="full" maxW="md">
        <Box
            p={10}
            borderRadius="2xl"
            shadow={shadowColor}
            border="1px"
            borderColor="gray.200"
            backdropFilter="blur(10px)"
            bg={useColorModeValue('rgba(255, 255, 255, 0.9)', 'rgba(26, 32, 44, 0.9)')}
        >
          <VStack spacing={8}>
            {/* Encabezado del card */}
            <VStack spacing={2} textAlign="center">
              <Icon 
                as={FiBookOpen} 
                boxSize={16} 
                color="blue.500"
                p={3}
                bg="blue.50"
                borderRadius="xl"
              />
              <Heading size="lg" color="gray.800">
                Acceso al Sistema
              </Heading>
              <Text color="gray.600" fontSize="md">
                Inicia sesión para gestionar tu biblioteca
              </Text>
            </VStack>
  
            {/* Botón de acceso principal */}
            <VStack spacing={4} w="full">
              <Button
                onClick={onLoginClick}
                colorScheme="blue"
                size="lg"
                fontSize="lg"
                fontWeight="semibold"
                w="full"
                h={14}
                rightIcon={<Icon as={FiArrowRight} />}
                _hover={{
                  transform: 'translateY(-2px)',
                  shadow: 'xl',
                }}
                transition="all 0.3s ease"
              >
                Iniciar Sesión
              </Button>
              
              <Text fontSize="sm" color="gray.500" textAlign="center">
                Ingresa con tus credenciales de bibliotecario
              </Text>
            </VStack>
  
            {/* Información adicional */}
            <Box 
              w="full" 
              p={4} 
              bg={useColorModeValue('gray.50', 'gray.700')}
              borderRadius="lg"
            >
              <Text fontSize="sm" color="gray.600" textAlign="center">
                ¿Primera vez usando el sistema?{' '}
                <Text as="span" color="blue.600" fontWeight="medium">
                  Contacta al administrador
                </Text>
              </Text>
            </Box>
          </VStack>
        </Box>
      </Box>
    );
  }