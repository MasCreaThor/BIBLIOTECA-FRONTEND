// components/ui/Pagination/Pagination.tsx
'use client';

import {
  HStack,
  Button,
  Text,
  IconButton,
  Select,
  Box,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
  onPageSizeChange?: (pageSize: number) => void;
  showPageSizeSelector?: boolean;
  isLoading?: boolean;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  pageSize = 20,
  onPageSizeChange,
  showPageSizeSelector = false,
  isLoading = false,
}: PaginationProps) {
  const textColor = useColorModeValue('gray.600', 'gray.400');

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const handlePageChange = (page: number | string) => {
    if (typeof page === 'number' && page !== currentPage && !isLoading) {
      onPageChange(page);
    }
  };

  if (totalPages <= 1) {
    return null;
  }

  const visiblePages = getVisiblePages();

  return (
    <HStack spacing={2} align="center">
      {/* Botón anterior */}
      <IconButton
        aria-label="Página anterior"
        icon={<FiChevronLeft />}
        onClick={() => handlePageChange(currentPage - 1)}
        isDisabled={currentPage === 1 || isLoading}
        variant="outline"
        size="sm"
      />

      {/* Páginas */}
      <HStack spacing={1}>
        {visiblePages.map((page, index) => (
          <Box key={index}>
            {page === '...' ? (
              <Text px={2} color={textColor}>
                ...
              </Text>
            ) : (
              <Button
                size="sm"
                variant={page === currentPage ? 'solid' : 'outline'}
                colorScheme={page === currentPage ? 'blue' : 'gray'}
                onClick={() => handlePageChange(page)}
                isDisabled={isLoading}
                minW="40px"
              >
                {page}
              </Button>
            )}
          </Box>
        ))}
      </HStack>

      {/* Botón siguiente */}
      <IconButton
        aria-label="Página siguiente"
        icon={<FiChevronRight />}
        onClick={() => handlePageChange(currentPage + 1)}
        isDisabled={currentPage === totalPages || isLoading}
        variant="outline"
        size="sm"
      />

      {/* Selector de tamaño de página */}
      {showPageSizeSelector && onPageSizeChange && (
        <HStack spacing={2} ml={4}>
          <Text fontSize="sm" color={textColor}>
            Mostrar:
          </Text>
          <Select
            size="sm"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            width="80px"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </Select>
        </HStack>
      )}
    </HStack>
  );
}