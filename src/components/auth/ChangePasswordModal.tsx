'use client';

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  HStack,
  Text,
  Box,
  Icon,
  InputGroup,
  InputRightElement,
} from '@chakra-ui/react';
import { FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useState } from 'react';
import { useChangePasswordModal } from '@/hooks/useChangePasswordModal';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const {
    register,
    handleSubmit,
    errors,
    isChangingPassword,
    handleChangePassword,
  } = useChangePasswordModal();

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const onSubmit = (data: any) => {
    handleChangePassword(data);
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalOverlay bg="blackAlpha.600" backdropFilter="blur(10px)" />
      <ModalContent borderRadius="2xl" shadow="2xl" border="1px" borderColor="gray.200">
        <Box bg="secondary.500" borderTopRadius="2xl" px={6} py={4}>
          <ModalHeader color="white" fontWeight="bold" fontSize="lg" pb={0}>
            <HStack spacing={3}>
              <Icon as={FiLock} color="white" boxSize={5} />
              <Text>Cambiar Contraseña</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton color="white" _hover={{ bg: 'whiteAlpha.200' }} />
        </Box>
        <ModalBody p={6}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <VStack spacing={6}>
              <Text fontSize="sm" color="gray.600" textAlign="center">
                Ingresa tu contraseña actual y la nueva contraseña que deseas usar
              </Text>

              <FormControl isInvalid={!!errors.currentPassword}>
                <FormLabel fontWeight="semibold" color="gray.700" fontSize="sm">
                  Contraseña Actual
                </FormLabel>
                <InputGroup>
                  <Input
                    {...register('currentPassword')}
                    type={showPasswords.current ? 'text' : 'password'}
                    placeholder="Tu contraseña actual"
                    bg="gray.50"
                    border="2px"
                    borderColor="gray.200"
                    _focus={{ borderColor: 'blue.400', bg: 'white', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
                    _hover={{ borderColor: 'gray.300' }}
                    size="lg"
                  />
                  <InputRightElement>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => togglePasswordVisibility('current')}
                      _hover={{ bg: 'transparent' }}
                    >
                      <Icon as={showPasswords.current ? FiEyeOff : FiEye} />
                    </Button>
                  </InputRightElement>
                </InputGroup>
                {errors.currentPassword && (
                  <Text color="red.500" fontSize="sm" mt={2}>
                    {errors.currentPassword.message}
                  </Text>
                )}
              </FormControl>

              <FormControl isInvalid={!!errors.newPassword}>
                <FormLabel fontWeight="semibold" color="gray.700" fontSize="sm">
                  Nueva Contraseña
                </FormLabel>
                <InputGroup>
                  <Input
                    {...register('newPassword')}
                    type={showPasswords.new ? 'text' : 'password'}
                    placeholder="Tu nueva contraseña"
                    bg="gray.50"
                    border="2px"
                    borderColor="gray.200"
                    _focus={{ borderColor: 'blue.400', bg: 'white', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
                    _hover={{ borderColor: 'gray.300' }}
                    size="lg"
                  />
                  <InputRightElement>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => togglePasswordVisibility('new')}
                      _hover={{ bg: 'transparent' }}
                    >
                      <Icon as={showPasswords.new ? FiEyeOff : FiEye} />
                    </Button>
                  </InputRightElement>
                </InputGroup>
                {errors.newPassword && (
                  <Text color="red.500" fontSize="sm" mt={2}>
                    {errors.newPassword.message}
                  </Text>
                )}
                <Text fontSize="xs" color="gray.600" mt={2}>
                  Mínimo 8 caracteres, debe incluir mayúscula, minúscula y número
                </Text>
              </FormControl>

              <FormControl isInvalid={!!errors.confirmPassword}>
                <FormLabel fontWeight="semibold" color="gray.700" fontSize="sm">
                  Confirmar Nueva Contraseña
                </FormLabel>
                <InputGroup>
                  <Input
                    {...register('confirmPassword')}
                    type={showPasswords.confirm ? 'text' : 'password'}
                    placeholder="Confirma tu nueva contraseña"
                    bg="gray.50"
                    border="2px"
                    borderColor="gray.200"
                    _focus={{ borderColor: 'blue.400', bg: 'white', boxShadow: '0 0 0 1px var(--chakra-colors-blue-400)' }}
                    _hover={{ borderColor: 'gray.300' }}
                    size="lg"
                  />
                  <InputRightElement>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => togglePasswordVisibility('confirm')}
                      _hover={{ bg: 'transparent' }}
                    >
                      <Icon as={showPasswords.confirm ? FiEyeOff : FiEye} />
                    </Button>
                  </InputRightElement>
                </InputGroup>
                {errors.confirmPassword && (
                  <Text color="red.500" fontSize="sm" mt={2}>
                    {errors.confirmPassword.message}
                  </Text>
                )}
              </FormControl>

              <HStack spacing={4} w="full" pt={4}>
                <Button 
                  variant="outline" 
                  onClick={onClose} 
                  flex={1}
                  size="lg"
                  borderRadius="lg"
                  _hover={{ bg: 'gray.50' }}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  colorScheme="secondary"
                  isLoading={isChangingPassword}
                  loadingText="Cambiando..."
                  flex={1}
                  size="lg"
                  borderRadius="lg"
                >
                  Cambiar Contraseña
                </Button>
              </HStack>
            </VStack>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
} 