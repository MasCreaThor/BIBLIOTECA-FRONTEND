import { Center, VStack, Spinner, Text, useColorModeValue } from '@chakra-ui/react';

interface LoadingStateProps {
  bgGradient: string;
}

export function LoadingState({ bgGradient }: LoadingStateProps) {
  return (
    <Center h="100vh" bgGradient={bgGradient}>
      <VStack spacing={4}>
        <Spinner size="xl" color="blue.500" thickness="4px" />
        <Text color="gray.600" fontSize="lg">
          Verificando acceso...
        </Text>
      </VStack>
    </Center>
  );
}