# Arquitectura del Sistema - Finanzas Personales

## Índice

1. [Visión General](#visión-general)
2. [Arquitectura de Alto Nivel](#arquitectura-de-alto-nivel)
3. [Arquitectura Frontend](#arquitectura-frontend)
4. [Arquitectura Backend](#arquitectura-backend)
5. [Capa de Datos](#capa-de-datos)
6. [Flujo de Datos](#flujo-de-datos)
7. [Decisiones de Diseño](#decisiones-de-diseño)
8. [Patrones de Diseño](#patrones-de-diseño)

## Visión General

Finanzas Personales es una aplicación web full-stack construida con Next.js 14 que utiliza el App Router para un rendering híbrido (SSR/CSR). La arquitectura está diseñada para ser:

- **Escalable**: Separación clara de responsabilidades
- **Mantenible**: Código modular y bien organizado
- **Flexible**: Soporte para múltiples fuentes de datos (DB/Mock)
- **Performante**: Optimizaciones de Next.js y React
- **Type-Safe**: TypeScript en todo el stack

## Arquitectura de Alto Nivel

```
┌─────────────────────────────────────────────────────────────┐
│                      CAPA DE PRESENTACIÓN                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Dashboard  │  │   Cuentas    │  │ Transacciones│      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│           ↓                 ↓                 ↓              │
│  ┌────────────────────────────────────────────────────┐     │
│  │         Componentes React Reutilizables           │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                     CAPA DE APLICACIÓN                       │
│  ┌────────────────────────────────────────────────────┐     │
│  │              Next.js App Router                    │     │
│  │      (Server Components + API Routes)              │     │
│  └────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                      CAPA DE NEGOCIO                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   lib/db.ts  │  │ lib/types.ts │  │lib/format.ts │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                       CAPA DE DATOS                          │
│        ┌──────────────────┐    ┌──────────────────┐         │
│        │   PostgreSQL     │ OR │   Mock Data      │         │
│        │   (via Neon)     │    │   (In-Memory)    │         │
│        └──────────────────┘    └──────────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

## Arquitectura Frontend

### Estructura de Páginas (App Router)

```
app/
├── page.tsx                    # Dashboard principal
├── cuentas/page.tsx           # Gestión de cuentas
├── transacciones/page.tsx     # Gestión de transacciones
├── reportes/page.tsx          # Reportes y análisis
└── layout.tsx                 # Layout raíz con providers
```

#### Características Principales

- **Client Components**: Uso de `"use client"` para interactividad
- **Server Components**: Por defecto para mejor performance
- **Streaming**: Suspense boundaries para carga progresiva
- **Route Groups**: Organización lógica de rutas

### Componentes

#### Organización Modular

```
components/
├── accounts/           # Componentes específicos de cuentas
│   ├── account-card.tsx
│   └── account-form-dialog.tsx
├── transactions/       # Componentes de transacciones
│   ├── transaction-list.tsx
│   └── transaction-form-dialog.tsx
├── dashboard/          # Componentes del dashboard
│   └── metrics-card.tsx
├── reports/           # Componentes de reportes
│   └── expense-chart.tsx
├── layout/            # Componentes de navegación
│   ├── main-nav.tsx
│   └── mobile-nav.tsx
└── ui/                # Componentes UI base (Radix)
    ├── button.tsx
    ├── dialog.tsx
    ├── card.tsx
    └── ...
```

#### Patrón de Composición

Los componentes siguen el principio de composición:

```tsx
// Componente contenedor
<AccountFormDialog>
  <DialogTrigger>
    <Button />
  </DialogTrigger>
  <DialogContent>
    <Form />
  </DialogContent>
</AccountFormDialog>
```

### Gestión de Estado

#### Estado Local
- **React Hooks**: `useState`, `useEffect` para estado de componentes
- **React Hook Form**: Gestión de formularios con validación

#### Estado Global
- **Props Drilling**: Para datos que fluyen hacia abajo
- **Callbacks**: Para comunicación hacia arriba
- **Context API**: Disponible pero no utilizado actualmente

### Estilos

#### Tailwind CSS v4
- **Utility-First**: Clases de utilidad directamente en JSX
- **Design System**: Variables CSS personalizadas
- **Responsive**: Mobile-first design
- **Dark Mode**: Soporte nativo vía `next-themes`

```tsx
// Ejemplo de estilos
<div className="flex items-center justify-between p-4 border rounded-lg">
  <h2 className="text-xl font-bold">Título</h2>
</div>
```

## Arquitectura Backend

### API Routes

Estructura RESTful siguiendo convenciones de Next.js:

```
app/api/
├── accounts/
│   ├── route.ts              # GET, POST /api/accounts
│   └── [id]/
│       └── route.ts          # PATCH, DELETE /api/accounts/:id
├── transactions/
│   ├── route.ts              # GET, POST /api/transactions
│   └── [id]/
│       └── route.ts          # PATCH, DELETE /api/transactions/:id
├── categories/
│   └── route.ts              # GET /api/categories
├── dashboard/
│   └── metrics/
│       └── route.ts          # GET /api/dashboard/metrics
└── reports/
    └── expenses-by-category/
        └── route.ts          # GET /api/reports/expenses-by-category
```

### Estructura de un Endpoint

```typescript
// app/api/accounts/route.ts
import { NextRequest, NextResponse } from "next/server"
import { dbQueries } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    // 1. Parsear query parameters
    const { searchParams } = new URL(request.url)
    const includeArchived = searchParams.get("includeArchived") === "true"
    
    // 2. Ejecutar query
    const accounts = await dbQueries.getAccounts(includeArchived)
    
    // 3. Retornar respuesta
    return NextResponse.json(accounts)
  } catch (error) {
    // 4. Manejo de errores
    console.error("Error fetching accounts:", error)
    return NextResponse.json(
      { error: "Failed to fetch accounts" },
      { status: 500 }
    )
  }
}
```

### Patrón de Respuesta

Todas las APIs siguen un patrón consistente:

**Éxito:**
```json
{
  "id": 1,
  "name": "Cuenta Principal",
  "type": "banco",
  "balance": 1000.00
}
```

**Error:**
```json
{
  "error": "Descripción del error",
  "details": "Información adicional (opcional)"
}
```

## Capa de Datos

### Abstracción de Base de Datos

El archivo `lib/db.ts` proporciona una capa de abstracción que:

1. **Detecta la presencia de DATABASE_URL**
2. **Usa PostgreSQL** si está configurado
3. **Fallback a Mock Data** si no hay base de datos

```typescript
// lib/db.ts
const sql = process.env.DATABASE_URL 
  ? neon(process.env.DATABASE_URL) 
  : null

export const dbQueries = {
  async getAccounts(includeArchived: boolean = false): Promise<Account[]> {
    // Si no hay SQL, retornar datos mock
    if (!sql) return mockAccounts.filter(/* ... */)
    
    // Si hay SQL, ejecutar query
    const result = await sql.query(/* ... */)
    return result as Account[]
  }
}
```

### Schema de Base de Datos

#### Entidades Principales

**Categories**
```sql
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  category_type TEXT CHECK (category_type IN ('ingreso', 'gasto')),
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Accounts**
```sql
CREATE TABLE accounts (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  account_type TEXT CHECK (account_type IN ('efectivo', 'banco', 'tarjeta')),
  balance NUMERIC(18,2) NOT NULL DEFAULT 0,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Transactions**
```sql
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  account_id INTEGER NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  transaction_type TEXT CHECK (transaction_type IN ('ingreso', 'gasto')),
  amount NUMERIC(18,2) NOT NULL,
  description TEXT,
  transaction_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Relaciones

```
categories (1) ──────── (*) transactions
accounts (1) ────────── (*) transactions
```

- Una categoría puede tener múltiples transacciones
- Una cuenta puede tener múltiples transacciones
- Las transacciones eliminan en cascada con cuentas
- Las categorías no pueden eliminarse si tienen transacciones

### Sistema de Tipos

TypeScript proporciona type-safety en todo el stack:

```typescript
// lib/types.ts
export type TransactionType = "ingreso" | "gasto"
export type AccountType = "efectivo" | "banco" | "tarjeta"

export interface Account {
  id: number
  name: string
  type: AccountType
  balance: number
  currency: string
  is_archived: boolean | number
  created_at: string
  updated_at: string
}
```

**Mapeo DB ↔ TypeScript:**

| Base de Datos | TypeScript |
|---------------|------------|
| `category_type` | `type` |
| `account_type` | `type` |
| `transaction_type` | `type` |
| `transaction_date` | `date` |

## Flujo de Datos

### Flujo de Lectura (GET)

```
1. Usuario visita /cuentas
   ↓
2. Page Component (Server Component por defecto)
   - Renderiza layout inicial
   ↓
3. Client Component monta y ejecuta useEffect
   ↓
4. Fetch a /api/accounts
   ↓
5. API Route recibe petición
   ↓
6. dbQueries.getAccounts() ejecuta
   ↓
7. PostgreSQL Query O Mock Data
   ↓
8. Datos retornan a API Route
   ↓
9. JSON enviado al cliente
   ↓
10. Estado actualizado con setState
   ↓
11. Re-render del componente con datos
```

### Flujo de Escritura (POST/PATCH)

```
1. Usuario llena formulario
   ↓
2. React Hook Form valida con Zod
   ↓
3. onSubmit ejecutado
   ↓
4. Fetch POST/PATCH a /api/accounts
   ↓
5. API Route valida datos
   ↓
6. dbQueries.createAccount() o updateAccount()
   ↓
7. INSERT/UPDATE en PostgreSQL O Mock Data
   ↓
8. Nuevo/actualizado registro retornado
   ↓
9. Response enviada al cliente
   ↓
10. Callback onSuccess ejecutado
   ↓
11. Lista actualizada (refetch)
```

### Flujo de Eliminación (DELETE)

```
1. Usuario confirma eliminación
   ↓
2. Fetch DELETE a /api/accounts/:id
   ↓
3. API Route recibe ID
   ↓
4. dbQueries.deleteAccount(id)
   ↓
5. DELETE CASCADE en PostgreSQL O Mock Data
   ↓
6. Confirmación retornada
   ↓
7. Lista actualizada (refetch)
```

## Decisiones de Diseño

### 1. Next.js App Router vs Pages Router

**Decisión**: App Router

**Razones**:
- Mejor soporte para Server Components
- File-system routing más intuitivo
- Streaming y Suspense nativo
- Mejor developer experience
- Futuro de Next.js

### 2. PostgreSQL vs NoSQL

**Decisión**: PostgreSQL (via Neon)

**Razones**:
- Datos estructurados y relacionales
- Transacciones ACID
- Queries complejas (reportes, agregaciones)
- Integridad referencial
- SQL es estándar y bien conocido

### 3. Client-Side Rendering vs Server-Side

**Decisión**: Híbrido (mayormente CSR para interactividad)

**Razones**:
- Páginas altamente interactivas (formularios, filtros)
- Estado del cliente necesario (form state, UI state)
- Actualizaciones en tiempo real
- Mejor UX para aplicaciones tipo SPA

### 4. Mock Data Fallback

**Decisión**: Soportar ambos modos (DB y Mock)

**Razones**:
- Desarrollo sin dependencias externas
- Demos y testing
- Onboarding más fácil
- Resiliencia

### 5. TypeScript Estricto

**Decisión**: TypeScript con `ignoreBuildErrors: true` temporalmente

**Razones**:
- Type-safety en desarrollo
- Mejor IntelliSense
- Documentación vía tipos
- Refactoring más seguro
- Temporal: permitir iteración rápida

### 6. Radix UI vs Componentes Personalizados

**Decisión**: Radix UI

**Razones**:
- Accesibilidad (WAI-ARIA)
- Unstyled (control total de estilos)
- Comportamiento complejo manejado
- Bien mantenido
- Headless UI philosophy

### 7. Tailwind CSS vs CSS-in-JS

**Decisión**: Tailwind CSS v4

**Razones**:
- Desarrollo más rápido
- Bundle size menor
- No runtime overhead
- Design system consistente
- Comunidad grande

## Patrones de Diseño

### 1. Repository Pattern

La capa `lib/db.ts` actúa como repositorio:

```typescript
export const dbQueries = {
  // Todos los métodos de acceso a datos centralizados
  getAccounts(),
  createAccount(),
  updateAccount(),
  deleteAccount()
}
```

**Beneficios**:
- Separación de lógica de datos
- Fácil testing (mock dbQueries)
- Cambio de fuente de datos transparente

### 2. Adapter Pattern

Adaptador entre DB schema y TypeScript types:

```typescript
// Adapta nombres de columnas DB a propiedades TS
SELECT 
  account_type as type,
  transaction_date as date
FROM accounts
```

### 3. Factory Pattern

Componentes Dialog que crean instancias según props:

```tsx
<AccountFormDialog
  account={selectedAccount}  // Edit mode
  // OR
  account={null}            // Create mode
/>
```

### 4. Observer Pattern

React hooks para suscripción a cambios:

```tsx
useEffect(() => {
  fetchAccounts()  // Observa cambios en dependencias
}, [])
```

### 5. Composition Pattern

Componentes compuestos para flexibilidad:

```tsx
<Card>
  <CardHeader>
    <CardTitle />
  </CardHeader>
  <CardContent />
  <CardFooter />
</Card>
```

### 6. HOC Pattern (Higher-Order Components)

Aunque no usado extensivamente, está disponible:

```tsx
// Potencial uso
const withAuth = (Component) => {
  return (props) => {
    if (!isAuthenticated()) return <Login />
    return <Component {...props} />
  }
}
```

## Consideraciones de Seguridad

### 1. Variables de Entorno

- `DATABASE_URL` nunca expuesta al cliente
- Solo API Routes tienen acceso
- `.env.local` en `.gitignore`

### 2. SQL Injection

- Uso de prepared statements vía Neon
- Parametrización de queries
- No string concatenation

### 3. XSS Prevention

- React escapa automáticamente
- `dangerouslySetInnerHTML` no usado
- Sanitización en inputs

### 4. CSRF Protection

- Next.js incluye protección CSRF
- Same-origin policy
- No cookies sensibles

## Performance

### 1. Code Splitting

- Automático por Next.js
- Lazy loading de componentes
- Dynamic imports disponible

### 2. Optimización de Imágenes

```typescript
// next.config.mjs
images: {
  unoptimized: true  // Para static export
}
```

### 3. Bundle Size

- Tree shaking automático
- Radix UI importado selectivamente
- Tailwind CSS purged en producción

### 4. Caching

- Next.js automáticamente cachea
- Estrategias de revalidación disponibles
- CDN caching vía Vercel

## Escalabilidad

### Horizontal

- Stateless API routes
- Database connection pooling (Neon)
- Deploy múltiples instancias (Vercel)

### Vertical

- Índices en DB para queries frecuentes
- Paginación lista para implementar
- Lazy loading de componentes

### Futura Expansión

Areas de mejora identificadas:

1. **Autenticación**: NextAuth.js
2. **Estado Global**: Zustand o React Context
3. **Real-time**: WebSockets o Server-Sent Events
4. **Caching**: React Query
5. **Testing**: Jest + React Testing Library
6. **E2E Testing**: Playwright o Cypress

## Conclusión

La arquitectura actual proporciona:

✅ Separación clara de responsabilidades
✅ Type-safety end-to-end
✅ Flexibilidad (DB/Mock)
✅ Buena developer experience
✅ Escalabilidad para crecimiento
✅ Mantenibilidad a largo plazo

La aplicación está lista para:
- Añadir nuevas features
- Escalar a más usuarios
- Integrar servicios externos
- Extender funcionalidad

---

**Última actualización**: Enero 2025
