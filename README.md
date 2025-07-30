# Sistema de Gestión de Biblioteca Escolar - Frontend

## 📖 Descripción del Proyecto

El frontend del Sistema de Gestión de Biblioteca Escolar es una aplicación web moderna desarrollada con Next.js que permite a bibliotecarios y administradores gestionar de forma eficiente todos los procesos de una biblioteca escolar: inventario, préstamos, devoluciones, usuarios y reportes.

### 🎯 Problemática que Resuelve

- ✅ **Control manual ineficiente**: Reemplaza registros en papel por una interfaz digital intuitiva
- ✅ **Búsqueda lenta de recursos**: Búsqueda instantánea y filtros avanzados
- ✅ **Seguimiento de préstamos**: Dashboard visual para monitorear préstamos activos y vencidos
- ✅ **Gestión de inventario**: Registro rápido con integración a Google Books API
- ✅ **Reportes manuales**: Generación automática de estadísticas e informes

### 👥 Usuarios del Sistema

- **Administrador**: Gestión de usuarios del sistema y supervisión general
- **Bibliotecario**: Operaciones diarias de la biblioteca
- **Estudiantes y Docentes**: Registrados en el sistema para préstamos (sin acceso directo)

---

## 🛠️ Stack Tecnológico

### Core Framework
- **[Next.js 14+](https://nextjs.org/)**: Framework React con App Router y SSR
- **[React 18+](https://react.dev/)**: Biblioteca de interfaz de usuario
- **[TypeScript](https://www.typescriptlang.org/)**: Tipado estático para mayor seguridad

### Styling y UI
- **[Tailwind CSS](https://tailwindcss.com/)**: Framework CSS utility-first
- **[Chakra UI](https://chakra-ui.com/)**: Biblioteca de componentes accesibles
- **[Lucide React](https://lucide.dev/)**: Iconos modernos

### Estado y Datos
- **[React Query/TanStack Query](https://tanstack.com/query)**: Gestión de estado del servidor
- **[React Context API](https://react.dev/reference/react/createContext)**: Estado global de la aplicación
- **[React Hook Form](https://react-hook-form.com/)**: Formularios performantes
- **[Zod](https://zod.dev/)**: Validación de esquemas TypeScript

### Herramientas de Desarrollo
- **[ESLint](https://eslint.org/) + [Prettier](https://prettier.io/)**: Linting y formateo
- **[Jest](https://jestjs.io/) + [React Testing Library](https://testing-library.com/)**: Testing
- **[Axios](https://axios-http.com/)**: Cliente HTTP para APIs

---

## 🏗️ Estructura del Proyecto

```
biblioteca-frontend/
├── src/
│   ├── app/                    # App Router de Next.js
│   │   ├── (auth)/            # Rutas de autenticación
│   │   │   ├── login/
│   │   │   └── layout.tsx
│   │   ├── (dashboard)/       # Rutas protegidas principales
│   │   │   ├── dashboard/
│   │   │   ├── people/
│   │   │   ├── inventory/
│   │   │   ├── loans/
│   │   │   ├── reports/
│   │   │   └── layout.tsx
│   │   ├── admin/             # Rutas administrativas
│   │   │   ├── users/
│   │   │   └── layout.tsx
│   │   ├── globals.css
│   │   ├── layout.tsx         # Layout raíz
│   │   └── page.tsx          # Página principal
│   ├── components/            # Componentes reutilizables
│   │   ├── ui/               # Componentes base (Button, Input, etc.)
│   │   ├── forms/            # Formularios específicos
│   │   ├── features/         # Componentes por funcionalidad
│   │   └── layout/           # Componentes de layout
│   ├── hooks/                # Custom hooks
│   │   ├── useAuth.ts
│   │   ├── usePermissions.ts
│   │   └── useApi.ts
│   ├── services/             # Servicios de API
│   │   ├── api/
│   │   │   ├── client.ts     # Cliente HTTP configurado
│   │   │   ├── auth.ts       # Servicios de autenticación
│   │   │   ├── people.ts     # Servicios de personas
│   │   │   ├── inventory.ts  # Servicios de inventario
│   │   │   └── loans.ts      # Servicios de préstamos
│   │   └── external/
│   │       └── googleBooks.ts
│   ├── lib/                  # Utilidades y configuraciones
│   │   ├── auth.ts          # Lógica de autenticación
│   │   ├── utils.ts         # Utilidades generales
│   │   └── validations.ts   # Esquemas de validación Zod
│   ├── types/               # Definiciones de tipos TypeScript
│   │   ├── auth.ts
│   │   ├── api.ts
│   │   └── common.ts
│   └── constants/           # Constantes de la aplicación
│       ├── routes.ts
│       ├── roles.ts
│       └── api.ts
├── public/                  # Archivos estáticos
├── tests/                   # Pruebas
├── .env.local.example      # Variables de entorno de ejemplo
├── next.config.js          # Configuración de Next.js
├── tailwind.config.ts      # Configuración de Tailwind
├── tsconfig.json           # Configuración de TypeScript
└── package.json            # Dependencias y scripts
```

---

## 🚀 Instalación y Configuración

### Prerrequisitos

- **Node.js** (v18 o superior)
- **npm** o **yarn**
- **Backend de la biblioteca** ejecutándose

### 1. Clonar el Repositorio

```bash
git clone https://github.com/MasCreaThor/BIBLIOTECA-FRONTEND.git
cd biblioteca-frontend
```

### 2. Instalar Dependencias

```bash
npm install
# o
yarn install
```

### 3. Configurar Variables de Entorno

Copia el archivo de ejemplo y configura las variables:

```bash
cp .env.local.example .env.local
```

Edita `.env.local` con tus valores:

```env
# URL del backend
NEXT_PUBLIC_API_URL=http://localhost:3000/api

# Google Books API (opcional)
NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY=tu_api_key_aqui

# Configuración de autenticación
NEXTAUTH_SECRET=tu_secret_key_super_segura
NEXTAUTH_URL=http://localhost:3001

# Configuración de desarrollo
NEXT_PUBLIC_APP_ENV=development
```

### 4. Ejecutar la Aplicación

#### Modo Desarrollo
```bash
npm run dev
# o
yarn dev
```

La aplicación estará disponible en: **http://localhost:3001**

---

### Ejecutar Pruebas

```bash
# Todas las pruebas
npm test

# Pruebas en modo watch
npm run test:watch
```

---

## 🔧 Solución de Problemas

#### Errores de TypeScript
```bash
# Limpiar cache de TypeScript
rm -rf .next
npm run type-check
```

#### Problemas de Estilos
```bash
# Recompilar Tailwind CSS
npm run dev
```

---

## 📚 Recursos Adicionales

### Documentación

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Chakra UI Documentation](https://chakra-ui.com/docs)
- [React Query Documentation](https://tanstack.com/query/latest/docs/react/overview)

### Herramientas de Desarrollo
- [React Developer Tools](https://react.dev/learn/react-developer-tools)
- [TanStack Query DevTools](https://tanstack.com/query/latest/docs/react/devtools)
- [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)

---

### Convenciones de Código

- **Componentes**: PascalCase (`PersonForm.tsx`)
- **Hooks**: camelCase con prefijo `use` (`useAuth.ts`)
- **Utilidades**: camelCase (`formatDate.ts`)
- **Constantes**: UPPER_CASE (`API_ENDPOINTS.ts`)

---

## 📞 Soporte

### Contacto
- **Email**: [yadmunozr22@itp.edu.co](mailto:yadmunozr22@itp.edu.co)
- **Email**: [andersonceron2020@itp.edu.co](mailto:andersonceron2020@itp.edu.co)