import { Box, Spinner, Text, VStack, BoxProps } from '@chakra-ui/react';

interface LoadingSpinnerProps extends BoxProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  message?: string;
  fullScreen?: boolean;
}

export function LoadingSpinner({
  size = 'md',
  message = 'Cargando...',
  fullScreen = false,
  ...props
}: LoadingSpinnerProps) {
  const spinnerSizes = {
    sm: 'md',
    md: 'lg',
    lg: 'xl',
    xl: '2xl',
  } as const;

  const textSizes = {
    sm: 'sm',
    md: 'md',
    lg: 'lg',
    xl: 'xl',
  } as const;

  const content = (
    <VStack spacing={4}>
      <Spinner
        size={spinnerSizes[size]}
        color="primary.500"
        thickness="3px"
        speed="0.8s"
      />
      {message && (
        <Text
          fontSize={textSizes[size]}
          color="gray.600"
          textAlign="center"
          fontWeight="medium"
        >
          {message}
        </Text>
      )}
    </VStack>
  );

  if (fullScreen) {
    return (
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        bg="rgba(255, 255, 255, 0.8)"
        backdropFilter="blur(2px)"
        zIndex={9999}
        display="flex"
        alignItems="center"
        justifyContent="center"
        {...props}
      >
        {content}
      </Box>
    );
  }

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      p={8}
      {...props}
    >
      {content}
    </Box>
  );
}

// Componente más simple para uso inline
export function LoadingInline({ size = 'sm' }: { size?: 'sm' | 'md' | 'lg' }) {
  return (
    <Spinner
      size={size}
      color="primary.500"
      thickness="2px"
      speed="0.8s"
    />
  );
}