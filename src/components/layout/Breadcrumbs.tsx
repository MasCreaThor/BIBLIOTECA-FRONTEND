// src/components/layout/Breadcrumbs.tsx
'use client';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Text,
} from '@chakra-ui/react';
import { FiChevronRight } from 'react-icons/fi';
import { usePathname } from 'next/navigation';
import { SafeLink } from '@/components/ui/SafeLink';
import { navigationItems } from '@/config/navigation.config';

interface BreadcrumbData {
  name: string;
  href?: string;
}

/**
 * Genera breadcrumbs basado en la ruta actual
 */
function generateBreadcrumbs(pathname: string): BreadcrumbData[] {
  const pathSegments = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbData[] = [{ name: 'Inicio', href: '/dashboard' }];

  let currentPath = '';
  
  pathSegments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    
    // ✅ MANEJO ESPECIAL PARA RUTAS DE ADMINISTRACIÓN
    if (segment === 'admin') {
      breadcrumbs.push({ name: 'Administración', href: '/admin' });
      return;
    }
    
    // Buscar el elemento de navegación exacto
    const navItem = navigationItems.find(item => item.href === currentPath);
    if (navItem && navItem.href) {
      breadcrumbs.push({ name: navItem.name, href: navItem.href });
      return;
    }
    
    // ✅ MANEJO ESPECÍFICO PARA RUTAS DE ADMINISTRACIÓN
    if (pathSegments[0] === 'admin' && index > 0) {
      const adminRoutes: Record<string, string> = {
        'system-config': 'Configuración del Sistema',
        'categories': 'Categorías',
        'locations': 'Ubicaciones',
        'resource-types': 'Tipos de Recursos',
      };
      
      if (adminRoutes[segment]) {
        breadcrumbs.push({ 
          name: adminRoutes[segment], 
          href: currentPath 
        });
        return;
      }
    }
    
    // Para rutas dinámicas como /people/[id], agregar el nombre genérico
    if (segment !== 'dashboard' && !pathSegments.includes('admin')) {
      const parentItem = navigationItems.find(item => currentPath.startsWith(item.href));
      if (parentItem && breadcrumbs[breadcrumbs.length - 1]?.href !== parentItem.href) {
        breadcrumbs.push({ name: parentItem.name, href: parentItem.href });
      }
      
      // Se puede personalizar según la necesidad
      if (segment.match(/^[a-f\d]{24}$/i)) {
        // Es un ObjectId de MongoDB, podría ser personalizado
        breadcrumbs.push({ name: 'Detalle' });
      } else if (segment === 'new') {
        breadcrumbs.push({ name: 'Nuevo' });
      } else if (segment === 'edit') {
        breadcrumbs.push({ name: 'Editar' });
      }
    }
  });

  return breadcrumbs.filter((breadcrumb, index, array) => 
    // Remover duplicados
    index === array.findIndex(b => b.href === breadcrumb.href && b.name === breadcrumb.name)
  );
}

export function Breadcrumbs() {
  const pathname = usePathname();
  const breadcrumbs = generateBreadcrumbs(pathname);

  if (breadcrumbs.length <= 1) {
    return null; // No mostrar breadcrumbs si solo hay "Inicio"
  }

  return (
    <Breadcrumb
      spacing={2}
      separator={<FiChevronRight color="gray.500" size={14} />}
      fontSize="sm"
      overflow="hidden"
      flex={1}
      minW={0}
    >
      {breadcrumbs.map((breadcrumb, index) => {
        const isCurrentPage = index === breadcrumbs.length - 1;

        return (
          <BreadcrumbItem
            key={`${breadcrumb.href || 'current'}-${index}`}
            isCurrentPage={isCurrentPage}
          >
            {isCurrentPage ? (
              <Text 
                color="gray.800" 
                fontWeight="semibold"
                fontSize="sm"
                noOfLines={1}
              >
                {breadcrumb.name}
              </Text>
            ) : breadcrumb.href ? (
              <BreadcrumbLink
                as={SafeLink}
                href={breadcrumb.href}
                color="gray.600"
                fontWeight="medium"
                fontSize="sm"
                noOfLines={1}
              >
                {breadcrumb.name}
              </BreadcrumbLink>
            ) : (
              <Text 
                color="gray.600" 
                fontWeight="medium" 
                fontSize="sm"
                noOfLines={1}
              >
                {breadcrumb.name}
              </Text>
            )}
          </BreadcrumbItem>
        );
      })}
    </Breadcrumb>
  );
}