import { Box, Container, HStack, Text } from '@chakra-ui/react';

export function HomeFooter() {
  return (
    <Box 
      position="absolute" 
      bottom={0} 
      left={0} 
      right={0} 
      py={6}
      zIndex={1}
    >
      <Container maxW="6xl">
        <HStack 
          justify="space-between" 
          align="center"
          flexDirection={{ base: 'column', md: 'row' }}
          spacing={{ base: 2, md: 0 }}
        >
          <Text fontSize="sm" color="gray.500">
            © 2025 Biblioteca Escolar - Sistema de Gestión Bibliotecaria
          </Text>
          <Text fontSize="sm" color="gray.400">
            Versión 1.0.0
          </Text>
        </HStack>
      </Container>
    </Box>
  );
}