// src/components/layout/NavigationItem.tsx
'use client';

import {
  Box,
  HStack,
  VStack,
  Text,
  Badge,
  useColorModeValue,
} from '@chakra-ui/react';
import { usePathname } from 'next/navigation';
import { SafeLink } from '@/components/ui/SafeLink';
import type { NavigationItem as NavigationItemType } from '@/config/navigation.config';

interface NavigationItemProps {
  item: NavigationItemType;
  onItemClick?: () => void;
}

export function NavigationItem({ item, onItemClick }: NavigationItemProps) {
  const pathname = usePathname();
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  // Determinar si el item está activo
  const isActive = item.isActive ? item.isActive(pathname) : pathname === item.href;

  const handleClick = () => {
    onItemClick?.();
  };

  if (!item.href || typeof item.href !== 'string' || item.href.trim() === '') {
    console.warn(`Navigation item "${item.name}" has invalid href:`, item.href);
    return null;
  }

  return (
    <Box w="full">
      <SafeLink href={item.href}>
        <Box
          display="block"
          w="full"
          p={3}
          borderRadius="lg"
          cursor="pointer"
          bg={isActive ? 'blue.50' : 'transparent'}
          borderLeft="3px solid"
          borderLeftColor={isActive ? 'blue.500' : 'transparent'}
          _hover={{
            bg: isActive ? 'blue.50' : 'gray.50',
          }}
          transition="all 0.2s"
          textDecoration="none"
          onClick={handleClick}
        >
          <HStack spacing={3} justify="space-between">
            <HStack spacing={3} flex={1}>
              <Box
                p={2}
                borderRadius="md"
                bg={isActive ? 'blue.500' : 'gray.100'}
              >
                <item.icon
                  size={16}
                  color={isActive ? 'white' : '#4A5568'}
                />
              </Box>
              <VStack spacing={0} align="start" flex={1}>
                <Text
                  fontWeight={isActive ? 'semibold' : 'medium'}
                  color={isActive ? 'blue.700' : 'gray.700'}
                  fontSize="sm"
                >
                  {item.name}
                </Text>
                {item.description && (
                  <Text fontSize="xs" color="gray.500" noOfLines={1}>
                    {item.description}
                  </Text>
                )}
              </VStack>
            </HStack>
            {item.badge && (
              <Badge 
                size="sm" 
                colorScheme={item.badgeColor || 'gray'}
                fontSize="2xs"
              >
                {item.badge}
              </Badge>
            )}
          </HStack>
        </Box>
      </SafeLink>
    </Box>
  );
}