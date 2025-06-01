import { Box } from '@chakra-ui/react';

export function BackgroundElements() {
  return (
    <>
      {/* Elemento decorativo superior derecho */}
      <Box
        position="absolute"
        top="10%"
        right="10%"
        width="300px"
        height="300px"
        borderRadius="full"
        bg="blue.100"
        opacity={0.3}
        filter="blur(100px)"
        zIndex={0}
      />
      
      {/* Elemento decorativo inferior izquierdo */}
      <Box
        position="absolute"
        bottom="10%"
        left="10%"
        width="250px"
        height="250px"
        borderRadius="full"
        bg="purple.100"
        opacity={0.3}
        filter="blur(80px)"
        zIndex={0}
      />
    </>
  );
}