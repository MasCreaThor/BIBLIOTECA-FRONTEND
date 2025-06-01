import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rutas que requieren autenticación
const protectedRoutes = [
  '/dashboard',
  '/people',
  '/inventory',
  '/loans',
  '/requests',
  '/reports',
  '/admin',
];

// Rutas que solo admins pueden acceder
const adminOnlyRoutes = [
  '/admin',
];

// Rutas públicas (solo para no autenticados)
const publicOnlyRoutes = [
  '/login',
];

// Función para verificar si una ruta coincide con algún patrón
function matchesRoute(pathname: string, routes: string[]): boolean {
  return routes.some(route => {
    if (route.endsWith('*')) {
      return pathname.startsWith(route.slice(0, -1));
    }
    return pathname === route || pathname.startsWith(route + '/');
  });
}

// Función para decodificar JWT (sin verificación de firma - solo para extraer datos)
function decodeJWT(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
}

// Función para verificar si el token ha expirado
function isTokenExpired(token: string): boolean {
  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) return true;
  
  const currentTime = Date.now() / 1000;
  return decoded.exp < currentTime;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Obtener token de las cookies
  const tokenKey = process.env.NEXT_PUBLIC_JWT_STORAGE_KEY || 'biblioteca_token';
  const token = request.cookies.get(tokenKey)?.value;
  
  // Verificar si el token existe y no ha expirado
  const isAuthenticated = token && !isTokenExpired(token);
  const userRole = isAuthenticated ? decodeJWT(token)?.role : null;
  
  // Debugging en desarrollo
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Middleware] ${pathname} - Auth: ${isAuthenticated} - Role: ${userRole}`);
  }

  // Redireccionar rutas públicas si ya está autenticado
  if (isAuthenticated && matchesRoute(pathname, publicOnlyRoutes)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Verificar rutas protegidas
  if (matchesRoute(pathname, protectedRoutes)) {
    if (!isAuthenticated) {
      // Redirigir a login con la URL actual como parámetro
      const redirectUrl = new URL('/login', request.url);
      redirectUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(redirectUrl);
    }

    // Verificar rutas solo para admin
    if (matchesRoute(pathname, adminOnlyRoutes) && userRole !== 'admin') {
      // Redirigir a dashboard si no es admin
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Permitir continuar
  return NextResponse.next();
}

// Configurar en qué rutas ejecutar el middleware
export const config = {
  matcher: [
    /*
     * Ejecutar en todas las rutas excepto:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - archivos estáticos (png, jpg, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$).*)',
  ],
};