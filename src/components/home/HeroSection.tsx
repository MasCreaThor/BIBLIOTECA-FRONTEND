import { VStack, HStack, Heading, Text, Icon } from '@chakra-ui/react';
import { FiBookOpen, FiUser, FiShield } from 'react-icons/fi';

export function HeroSection() {
  return (
    <VStack
      spacing={8}
      align={{ base: 'center', lg: 'flex-start' }}
      flex={1}
      textAlign={{ base: 'center', lg: 'left' }}
    >
      {/* Logo y título principal */}
      <VStack spacing={4} align={{ base: 'center', lg: 'flex-start' }}>
        <HStack spacing={3}>
          <Icon 
            as={FiBookOpen} 
            boxSize={12} 
            color="blue.600" 
            filter="drop-shadow(0 4px 8px rgba(59, 130, 246, 0.3))"
          />
          <Heading 
            size="xl" 
            color="gray.800"
            fontWeight="bold"
            letterSpacing="tight"
          >
            Biblioteca Escolar
          </Heading>
        </HStack>
        
        <Heading
          size={{ base: 'xl', md: '2xl' }}
          color="gray.700"
          fontWeight="semibold"
          lineHeight="shorter"
          maxW="lg"
        >
          Sistema de Gestión{' '}
          <Text as="span" color="blue.600">
            Bibliotecaria
          </Text>
        </Heading>
      </VStack>

      {/* Descripción */}
      <Text
        fontSize={{ base: 'lg', md: 'xl' }}
        color="gray.600"
        lineHeight="relaxed"
        maxW="md"
      >
        Plataforma digital diseñada especialmente para bibliotecarios escolares. 
        Gestiona tu biblioteca de manera eficiente y moderna.
      </Text>

      {/* Indicadores de características */}
      <VStack spacing={3} align={{ base: 'center', lg: 'flex-start' }}>
        <HStack spacing={3} color="gray.600">
          <Icon as={FiUser} color="green.500" />
          <Text fontSize="md">Acceso exclusivo para bibliotecarios</Text>
        </HStack>
        <HStack spacing={3} color="gray.600">
          <Icon as={FiShield} color="blue.500" />
          <Text fontSize="md">Sistema seguro y confiable</Text>
        </HStack>
      </VStack>
    </VStack>
  );
}