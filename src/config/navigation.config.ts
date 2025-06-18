// src/config/navigation.config.ts
import {
    FiHome,
    FiUsers,
    FiBook,
    FiBookOpen,
    FiBarChart,
    FiSettings,
  } from 'react-icons/fi';
  
  export interface NavigationItem {
    name: string;
    href: string;
    icon: any;
    adminOnly?: boolean;
    description?: string;
    badge?: string;
    badgeColor?: string;
    isActive?: (pathname: string) => boolean;
  }
  
  export const navigationItems: NavigationItem[] = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: FiHome,
      description: 'Vista general del sistema',
      isActive: (pathname) => pathname === '/dashboard',
    },
    {
      name: 'Personas',
      href: '/people',
      icon: FiUsers,
      description: 'Gestionar estudiantes y docentes',
      isActive: (pathname) => pathname.startsWith('/people'),
    },
    {
      name: 'Inventario',
      href: '/inventory',
      icon: FiBook,
      description: 'Gestionar recursos de la biblioteca',
      isActive: (pathname) => pathname.startsWith('/inventory'),
    },
    {
      name: 'Préstamos',
      href: '/loans',
      icon: FiBookOpen,
      description: 'Gestionar préstamos y devoluciones',
      badgeColor: 'orange',
      isActive: (pathname) => pathname.startsWith('/loans'),
    },
    {
      name: 'Reportes',
      href: '/reports',
      icon: FiBarChart,
      description: 'Estadísticas e informes',
      isActive: (pathname) => pathname.startsWith('/reports'),
    },
    {
      name: 'Administración',
      href: '/admin',
      icon: FiSettings,
      adminOnly: true,
      description: 'Gestión de usuarios del sistema',
      badgeColor: 'orange',
      isActive: (pathname) => pathname.startsWith('/admin'),
    },
  ];
  
  /**
   * Filtra elementos de navegación según el rol del usuario
   */
  export function getFilteredNavigation(isAdmin: boolean): NavigationItem[] {
    return navigationItems.filter(item => !item.adminOnly || isAdmin);
  }
  
  /**
   * Encuentra el elemento de navegación activo
   */
  export function getActiveNavigationItem(pathname: string): NavigationItem | undefined {
    return navigationItems.find(item => 
      item.isActive ? item.isActive(pathname) : pathname === item.href
    );
  }