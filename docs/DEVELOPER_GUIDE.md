# Guía para Desarrolladores - Finanzas Personales

## Índice

1. [Introducción](#introducción)
2. [Configuración del Entorno](#configuración-del-entorno)
3. [Estructura del Código](#estructura-del-código)
4. [Flujo de Trabajo](#flujo-de-trabajo)
5. [Desarrollo de Features](#desarrollo-de-features)
6. [Testing](#testing)
7. [Debugging](#debugging)
8. [Buenas Prácticas](#buenas-prácticas)
9. [Troubleshooting](#troubleshooting)

## Introducción

Esta guía está diseñada para ayudar a desarrolladores nuevos y existentes a contribuir efectivamente al proyecto Finanzas Personales.

### Prerequisitos de Conocimiento

Antes de comenzar, es recomendable estar familiarizado con:

- **JavaScript/TypeScript**: Sintaxis ES6+, tipos de TypeScript
- **React 18+**: Hooks, componentes funcionales, Context API
- **Next.js 14**: App Router, API Routes, Server Components
- **Tailwind CSS**: Utility-first CSS
- **Git**: Comandos básicos, branches, pull requests
- **PostgreSQL**: SQL básico (opcional)

### Herramientas Recomendadas

- **Editor**: Visual Studio Code con extensiones:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - TypeScript and JavaScript Language Features
- **Terminal**: iTerm2 (macOS), Windows Terminal, o similar
- **Cliente DB**: pgAdmin, DBeaver, o Neon Console
- **Cliente API**: Postman, Insomnia, o Thunder Client (VS Code)

## Configuración del Entorno

### 1. Clonar el Repositorio

```bash
git clone https://github.com/ManuhCardoso1501/FinanzasPersonales-PyI-II.git
cd FinanzasPersonales-PyI-II
```

### 2. Instalar Dependencias

```bash
# Usando npm
npm install

# O usando pnpm (más rápido)
pnpm install
```

### 3. Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz:

```bash
# Opcional - Base de datos
DATABASE_URL="postgresql://user:password@host:5432/dbname"

# Para desarrollo local puedes usar Neon (gratis)
# Regístrate en https://neon.tech
# DATABASE_URL="postgresql://user:pass@ep-name.region.aws.neon.tech/neondb"
```

### 4. Setup de Base de Datos (Opcional)

Si vas a trabajar con base de datos real:

```bash
# Opción A: Usando psql
psql $DATABASE_URL -f scripts/01-create-tables.sql
psql $DATABASE_URL -f scripts/02-seed-categories.sql

# Opción B: Ejecutar desde tu cliente SQL favorito
# Copia y pega el contenido de los scripts en orden
```

### 5. Iniciar Servidor de Desarrollo

```bash
npm run dev
```

La aplicación estará en `http://localhost:3000`

### 6. Verificar Setup

```bash
# Test de conexión a DB
node scripts/test-connection.js

# Build test
npm run build

# Lint
npm run lint
```

## Estructura del Código

### Directorios Principales

```
FinanzasPersonales-PyI-II/
├── app/                    # Next.js App Router
│   ├── api/               # Backend API endpoints
│   ├── cuentas/           # Página de cuentas
│   ├── transacciones/     # Página de transacciones
│   ├── reportes/          # Página de reportes
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page (Dashboard)
│   └── globals.css        # Estilos globales
│
├── components/            # Componentes React
│   ├── accounts/          # Componentes de cuentas
│   ├── transactions/      # Componentes de transacciones
│   ├── dashboard/         # Componentes de dashboard
│   ├── reports/           # Componentes de reportes
│   ├── layout/            # Navegación y layout
│   └── ui/                # Componentes UI base
│
├── lib/                   # Lógica de negocio
│   ├── db.ts             # Database queries
│   ├── mock-data.ts      # Datos de demostración
│   ├── types.ts          # TypeScript types
│   ├── format.ts         # Formateo (moneda, fecha)
│   └── utils.ts          # Utilidades generales
│
├── scripts/              # Scripts de utilidad
│   ├── 01-create-tables.sql
│   ├── 02-seed-categories.sql
│   └── test-connection.js
│
├── public/               # Assets estáticos
└── docs/                 # Documentación
```

### Convenciones de Naming

**Archivos y Carpetas:**
- Componentes: `kebab-case.tsx` (e.g., `account-card.tsx`)
- Páginas: `page.tsx` (convención Next.js)
- API Routes: `route.ts` (convención Next.js)
- Utilidades: `kebab-case.ts` (e.g., `format-utils.ts`)

**Variables y Funciones:**
- Variables: `camelCase` (e.g., `accountBalance`)
- Constantes: `UPPER_CASE` (e.g., `MAX_ACCOUNTS`)
- Funciones: `camelCase` (e.g., `fetchAccounts`)
- Componentes: `PascalCase` (e.g., `AccountCard`)
- Tipos/Interfaces: `PascalCase` (e.g., `Account`, `Transaction`)

**Bases de Datos:**
- Tablas: `snake_case` (e.g., `accounts`, `transactions`)
- Columnas: `snake_case` (e.g., `account_type`, `created_at`)

## Flujo de Trabajo

### Workflow de Git

```bash
# 1. Crear una rama para tu feature
git checkout -b feature/nueva-funcionalidad

# 2. Hacer cambios y commits frecuentes
git add .
git commit -m "feat: descripción del cambio"

# 3. Mantener tu rama actualizada
git fetch origin
git rebase origin/main

# 4. Push de tu rama
git push origin feature/nueva-funcionalidad

# 5. Crear Pull Request en GitHub
```

### Conventional Commits

Usamos conventional commits para mensajes claros:

```bash
feat: nueva característica
fix: corrección de bug
docs: cambios en documentación
style: formateo, punto y coma faltantes
refactor: refactorización de código
test: agregar tests
chore: tareas de mantenimiento
```

Ejemplos:
```bash
git commit -m "feat: añadir filtro de fecha en transacciones"
git commit -m "fix: corregir cálculo de balance en dashboard"
git commit -m "docs: actualizar README con nuevas instrucciones"
```

## Desarrollo de Features

### Crear una Nueva Página

1. **Crear el archivo de página:**

```tsx
// app/nueva-pagina/page.tsx
"use client"

import { MainNav } from "@/components/layout/main-nav"
import { MobileNav } from "@/components/layout/mobile-nav"

export default function NuevaPaginaPage() {
  return (
    <div className="min-h-screen bg-background">
      <MainNav />
      
      <main className="container mx-auto px-4 py-8 pb-24 md:pb-8">
        <h1 className="text-3xl font-bold">Nueva Página</h1>
        {/* Tu contenido aquí */}
      </main>
      
      <MobileNav />
    </div>
  )
}
```

2. **Añadir navegación:**

Edita `components/layout/main-nav.tsx` y `mobile-nav.tsx` para incluir el nuevo enlace.

### Crear un Nuevo API Endpoint

1. **Crear el archivo de ruta:**

```typescript
// app/api/nueva-ruta/route.ts
import { NextRequest, NextResponse } from "next/server"
import { dbQueries } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const param = searchParams.get("param")
    
    // Tu lógica aquí
    const data = await dbQueries.someMethod(param)
    
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json(
      { error: "Error message" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validar datos
    if (!body.requiredField) {
      return NextResponse.json(
        { error: "requiredField is required" },
        { status: 400 }
      )
    }
    
    // Tu lógica aquí
    const result = await dbQueries.createMethod(body)
    
    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json(
      { error: "Error message" },
      { status: 500 }
    )
  }
}
```

2. **Añadir query al dbQueries:**

```typescript
// lib/db.ts
export const dbQueries = {
  // ... métodos existentes
  
  async someMethod(param: string): Promise<SomeType[]> {
    if (!sql) {
      // Retornar mock data
      return mockData.filter(item => item.field === param)
    }
    
    const result = await sql.query(`
      SELECT * FROM some_table
      WHERE field = $1
    `, [param])
    
    return result as SomeType[]
  }
}
```

### Crear un Nuevo Componente

1. **Crear el archivo de componente:**

```tsx
// components/module/nuevo-componente.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { SomeType } from "@/lib/types"

interface NuevoComponenteProps {
  data: SomeType
  onAction?: () => void
}

export function NuevoComponente({ data, onAction }: NuevoComponenteProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{data.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{data.description}</p>
        {onAction && (
          <button onClick={onAction}>Acción</button>
        )}
      </CardContent>
    </Card>
  )
}
```

2. **Añadir tipos si es necesario:**

```typescript
// lib/types.ts
export interface SomeType {
  id: number
  title: string
  description: string
  created_at: string
}
```

### Trabajar con Formularios

Usamos React Hook Form + Zod:

```tsx
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

// 1. Definir schema
const formSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  amount: z.number().positive("El monto debe ser positivo"),
  type: z.enum(["ingreso", "gasto"])
})

type FormData = z.infer<typeof formSchema>

// 2. En el componente
export function MyForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      amount: 0,
      type: "gasto"
    }
  })
  
  const onSubmit = async (data: FormData) => {
    try {
      const response = await fetch("/api/endpoint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      })
      
      if (!response.ok) throw new Error("Error")
      
      // Success handling
      form.reset()
    } catch (error) {
      console.error(error)
    }
  }
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Campos del formulario */}
    </form>
  )
}
```

### Trabajar con Base de Datos

#### Añadir una Nueva Tabla

1. **Crear migration SQL:**

```sql
-- scripts/03-add-new-table.sql
CREATE TABLE IF NOT EXISTS nueva_tabla (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_nueva_tabla_name ON nueva_tabla(name);
```

2. **Ejecutar migration:**

```bash
psql $DATABASE_URL -f scripts/03-add-new-table.sql
```

3. **Añadir tipo TypeScript:**

```typescript
// lib/types.ts
export interface NuevaTabla {
  id: number
  name: string
  description: string | null
  created_at: string
}
```

4. **Añadir queries:**

```typescript
// lib/db.ts
export const dbQueries = {
  // ... métodos existentes
  
  async getNuevaTabla(): Promise<NuevaTabla[]> {
    if (!sql) return []
    
    const result = await sql.query(`
      SELECT id, name, description, 
             created_at::text as created_at
      FROM nueva_tabla
      ORDER BY created_at DESC
    `)
    
    return result as NuevaTabla[]
  }
}
```

## Testing

### Testing Manual

```bash
# 1. Iniciar en modo development
npm run dev

# 2. Probar en el navegador
# Navega a http://localhost:3000
# Prueba todas las funcionalidades

# 3. Probar API endpoints
curl http://localhost:3000/api/accounts
curl http://localhost:3000/api/categories
```

### Testing con Mock Data

```bash
# Asegúrate de NO tener DATABASE_URL configurado
npm run dev

# La aplicación usará datos de demostración
# Útil para desarrollo sin dependencias externas
```

### Testing con Base de Datos

```bash
# Configura DATABASE_URL en .env.local
npm run dev

# Verifica conexión
node scripts/test-connection.js
```

### Build Testing

```bash
# Verifica que el build funciona
npm run build

# Inicia en modo producción
npm start
```

## Debugging

### Debugging en Browser

1. **Chrome DevTools:**
   - F12 para abrir
   - Sources tab → Encuentra tu archivo
   - Coloca breakpoints
   - Inspecciona variables

2. **React DevTools:**
   - Instala extensión de Chrome
   - Inspecciona componentes
   - Ve props y estado

3. **Console Logging:**

```typescript
console.log("Debug:", variable)
console.table(arrayData)
console.error("Error:", error)
console.warn("Warning:", warning)
```

### Debugging API Routes

```typescript
// En API route
export async function GET(request: NextRequest) {
  console.log("Request URL:", request.url)
  console.log("Headers:", request.headers)
  
  try {
    const data = await dbQueries.getData()
    console.log("Data fetched:", data)
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed" }, { status: 500 })
  }
}
```

### Debugging Database Queries

```typescript
// En lib/db.ts
async getAccounts(): Promise<Account[]> {
  if (!sql) {
    console.log("Using mock data")
    return mockAccounts
  }
  
  const query = `SELECT * FROM accounts`
  console.log("Executing query:", query)
  
  const result = await sql.query(query)
  console.log("Query result:", result)
  
  return result as Account[]
}
```

### VS Code Debugging

Crea `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node",
      "request": "launch",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "console": "integratedTerminal"
    }
  ]
}
```

## Buenas Prácticas

### TypeScript

```typescript
// ✅ BIEN - Tipos explícitos
interface Props {
  accountId: number
  onUpdate: (account: Account) => void
}

// ❌ MAL - any
const handleData = (data: any) => { }

// ✅ BIEN - Tipos específicos
const handleData = (data: Account[]) => { }
```

### React Components

```tsx
// ✅ BIEN - Props interface separada
interface AccountCardProps {
  account: Account
  onEdit: (account: Account) => void
}

export function AccountCard({ account, onEdit }: AccountCardProps) {
  return <div>...</div>
}

// ❌ MAL - Props inline
export function AccountCard({ account, onEdit }: { account: any, onEdit: any }) {
  return <div>...</div>
}
```

### API Routes

```typescript
// ✅ BIEN - Manejo de errores completo
export async function GET(request: NextRequest) {
  try {
    const data = await dbQueries.getData()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    )
  }
}

// ❌ MAL - Sin manejo de errores
export async function GET() {
  const data = await dbQueries.getData()
  return NextResponse.json(data)
}
```

### Database Queries

```typescript
// ✅ BIEN - Prepared statements
const result = await sql.query(
  `SELECT * FROM accounts WHERE id = $1`,
  [accountId]
)

// ❌ MAL - String concatenation (SQL injection)
const result = await sql.query(
  `SELECT * FROM accounts WHERE id = ${accountId}`
)
```

### Estilos

```tsx
// ✅ BIEN - Clases de Tailwind
<div className="flex items-center justify-between p-4">

// ❌ MAL - Inline styles (evitar)
<div style={{ display: "flex", padding: "16px" }}>
```

### Performance

```tsx
// ✅ BIEN - Memoización cuando es necesario
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data)
}, [data])

// ✅ BIEN - useCallback para callbacks
const handleClick = useCallback(() => {
  doSomething()
}, [])
```

## Troubleshooting

### Error: "Module not found"

```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

### Error: "Database connection failed"

```bash
# Verificar DATABASE_URL
echo $DATABASE_URL

# Test de conexión
node scripts/test-connection.js

# Verifica que la DB está corriendo y accesible
```

### Error: "Port 3000 is already in use"

```bash
# Encuentra y mata el proceso
lsof -i :3000
kill -9 <PID>

# O usa otro puerto
PORT=3001 npm run dev
```

### Build Errors

```bash
# Limpia el cache de Next.js
rm -rf .next

# Rebuild
npm run build
```

### TypeScript Errors

```bash
# Verifica configuración
cat tsconfig.json

# Reinicia TypeScript server en VS Code
# Cmd+Shift+P → "TypeScript: Restart TS Server"
```

### Styling Issues

```bash
# Limpia el cache de Tailwind
rm -rf .next
npm run dev
```

## Recursos Adicionales

### Documentación Oficial

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Radix UI Docs](https://www.radix-ui.com/docs/primitives)

### Tutoriales Recomendados

- [Next.js 14 Tutorial](https://nextjs.org/learn)
- [TypeScript for React Developers](https://react-typescript-cheatsheet.netlify.app/)
- [Tailwind CSS Tutorial](https://tailwindcss.com/docs/utility-first)

### Comunidad

- [Next.js Discord](https://discord.gg/nextjs)
- [React Discord](https://discord.gg/react)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/next.js)

## Preguntas Frecuentes

### ¿Necesito configurar base de datos para desarrollar?

No, la aplicación funciona con datos de demostración sin base de datos.

### ¿Puedo usar otro gestor de paquetes?

Sí, puedes usar npm, pnpm o yarn. El proyecto incluye lock files para npm y pnpm.

### ¿Cómo añado una nueva dependencia?

```bash
npm install nombre-paquete
```

### ¿Cómo actualizo las dependencias?

```bash
npm update
# O para versiones mayores
npm install nombre-paquete@latest
```

---

**¿Necesitas ayuda?** Abre un issue en GitHub o contacta al equipo de desarrollo.
