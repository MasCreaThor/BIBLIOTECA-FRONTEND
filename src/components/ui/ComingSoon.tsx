'use client';

import {
  Box,
  VStack,
  Heading,
  Text,
  Icon,
  Button,
  useColorModeValue,
} from '@chakra-ui/react';
import Link from 'next/link';
import { IconType } from 'react-icons';
import { FiArrowLeft, FiClock } from 'react-icons/fi';

interface ComingSoonProps {
  title: string;
  description?: string;
  icon?: IconType;
}

export function ComingSoon({ 
  title, 
  description = 'Esta funcionalidad estará disponible próximamente.',
  icon = FiClock 
}: ComingSoonProps) {
  const bg = useColorModeValue('white', 'gray.800');

  return (
    <Box
      minH="60vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Box
        bg={bg}
        p={12}
        borderRadius="2xl"
        shadow="lg"
        border="1px"
        borderColor={useColorModeValue('gray.200', 'gray.700')}
        textAlign="center"
        maxW="md"
      >
        <VStack spacing={6}>
          <Icon
            as={icon}
            boxSize={16}
            color="blue.500"
            p={4}
            bg="blue.50"
            borderRadius="full"
          />
          
          <VStack spacing={2}>
            <Heading size="lg" color="gray.800">
              {title}
            </Heading>
            <Text color="gray.600" lineHeight="tall">
              {description}
            </Text>
          </VStack>

          <Link href="/dashboard">
            <Button
              leftIcon={<FiArrowLeft />}
              colorScheme="blue"
              variant="outline"
              size="lg"
            >
              Volver al Dashboard
            </Button>
          </Link>
        </VStack>
      </Box>
    </Box>
  );
}