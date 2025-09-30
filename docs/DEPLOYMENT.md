# Guía de Despliegue - Finanzas Personales

Esta guía explica cómo desplegar la aplicación Finanzas Personales en diferentes plataformas y configuraciones.

## Índice

1. [Despliegue en Vercel](#despliegue-en-vercel)
2. [Despliegue en Otras Plataformas](#despliegue-en-otras-plataformas)
3. [Configuración de Base de Datos](#configuración-de-base-de-datos)
4. [Variables de Entorno](#variables-de-entorno)
5. [Optimizaciones de Producción](#optimizaciones-de-producción)
6. [Monitoreo y Analytics](#monitoreo-y-analytics)
7. [Troubleshooting](#troubleshooting)

## Despliegue en Vercel

Vercel es la plataforma recomendada para desplegar aplicaciones Next.js. Ofrece:

- Despliegue automático desde Git
- Preview deployments para PRs
- Edge network global
- Analytics integrado
- Configuración cero

### Opción 1: Despliegue vía GitHub (Recomendado)

#### Paso 1: Preparar el Repositorio

Asegúrate de que tu código esté en un repositorio de GitHub:

```bash
# Si aún no has pusheado tu código
git add .
git commit -m "Preparar para despliegue"
git push origin main
```

#### Paso 2: Conectar con Vercel

1. **Ir a Vercel**:
   - Visita [vercel.com](https://vercel.com/)
   - Crea una cuenta o inicia sesión
   - Usa tu cuenta de GitHub

2. **Importar Proyecto**:
   - Click en "Add New..." → "Project"
   - Selecciona tu repositorio de GitHub
   - Vercel detectará automáticamente que es un proyecto Next.js

3. **Configurar el Proyecto**:
   
   **General Settings:**
   - Framework Preset: `Next.js` (detectado automáticamente)
   - Root Directory: `./` (dejar por defecto)
   - Build Command: `next build` (por defecto)
   - Output Directory: `.next` (por defecto)
   - Install Command: `npm install` (por defecto)

#### Paso 3: Configurar Variables de Entorno

En la sección "Environment Variables" de Vercel:

```bash
# Requerida solo si usas base de datos
DATABASE_URL=postgresql://user:password@host:5432/database
```

**Importante:**
- Añade las variables para los tres ambientes: Production, Preview, y Development
- O selecciona "All Environments" si son las mismas

#### Paso 4: Desplegar

1. Click en "Deploy"
2. Vercel construirá y desplegará tu aplicación
3. Proceso típico toma 1-3 minutos

#### Paso 5: Verificar Despliegue

1. Una vez completado, Vercel te dará una URL
2. Visita la URL (ej: `https://tu-proyecto.vercel.app`)
3. Verifica que todo funciona correctamente

### Despliegues Automáticos

Con la integración de GitHub:

- **Push a `main`** → Despliegue a Producción
- **Push a otras ramas** → Preview Deployment
- **Pull Requests** → Preview Deployment automático

### Opción 2: Despliegue vía CLI

#### Paso 1: Instalar Vercel CLI

```bash
npm install -g vercel
```

#### Paso 2: Login

```bash
vercel login
```

Sigue las instrucciones para autenticarte.

#### Paso 3: Desplegar

Desde el directorio del proyecto:

```bash
# Primera vez - configuración interactiva
vercel

# Responde las preguntas:
# - Set up and deploy? Yes
# - Which scope? Tu cuenta
# - Link to existing project? No (primera vez)
# - Project name? (acepta el default)
# - Directory? ./
# - Override settings? No
```

#### Paso 4: Configurar Variables de Entorno

```bash
# Añadir variable de entorno
vercel env add DATABASE_URL production

# Vercel te pedirá el valor
# Pega tu connection string de PostgreSQL
```

#### Paso 5: Desplegar a Producción

```bash
vercel --prod
```

### Dominios Personalizados en Vercel

#### Añadir un Dominio

1. **En Vercel Dashboard**:
   - Ve a tu proyecto
   - Settings → Domains
   - Click "Add"

2. **Configurar DNS**:
   
   Si usas un dominio propio (ej: `finanzas.midominio.com`):
   
   ```
   Tipo: CNAME
   Nombre: finanzas (o @ para root)
   Valor: cname.vercel-dns.com
   ```

3. **Verificar**:
   - Vercel verificará automáticamente
   - Puede tomar hasta 48 horas propagar

4. **SSL**:
   - Vercel provee SSL automáticamente
   - No requiere configuración adicional

## Despliegue en Otras Plataformas

### Netlify

#### Preparación

1. **Build settings**:
   ```bash
   Build command: npm run build
   Publish directory: .next
   ```

2. **netlify.toml**:
   ```toml
   [build]
     command = "npm run build"
     publish = ".next"
   
   [[redirects]]
     from = "/*"
     to = "/index.html"
     status = 200
   ```

3. **Variables de Entorno**:
   - Site settings → Environment variables
   - Añadir `DATABASE_URL` si aplica

### Railway

#### Despliegue

1. Visita [railway.app](https://railway.app/)
2. "New Project" → "Deploy from GitHub repo"
3. Selecciona tu repositorio
4. Railway detecta Next.js automáticamente
5. Añade variables de entorno en Settings

### Render

#### Preparación

1. **Crear Web Service**:
   - New → Web Service
   - Conecta tu repositorio

2. **Configuración**:
   ```bash
   Build Command: npm install && npm run build
   Start Command: npm start
   ```

3. **Variables de Entorno**:
   - Environment → Add Environment Variable
   - Añadir `DATABASE_URL`

### Docker

#### Dockerfile

```dockerfile
FROM node:18-alpine AS base

# Dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package*.json ./
RUN npm ci

# Builder
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

#### docker-compose.yml

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
    restart: unless-stopped
```

#### Construcción y Ejecución

```bash
# Construir imagen
docker build -t finanzas-personales .

# Ejecutar contenedor
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  finanzas-personales

# Con docker-compose
docker-compose up -d
```

## Configuración de Base de Datos

### Neon (Recomendado)

Neon es una base de datos PostgreSQL serverless, ideal para esta aplicación.

#### Setup

1. **Crear Cuenta**:
   - Visita [neon.tech](https://neon.tech/)
   - Sign up (gratis para proyectos pequeños)

2. **Crear Proyecto**:
   - Click "New Project"
   - Nombre: `finanzas-personales`
   - Región: Elige la más cercana a tus usuarios
   - PostgreSQL version: 15 (latest)

3. **Obtener Connection String**:
   ```
   postgresql://user:password@ep-name.region.aws.neon.tech/neondb?sslmode=require
   ```

4. **Ejecutar Migrations**:
   ```bash
   # Usando psql
   psql "postgresql://user:password@ep-name.region.aws.neon.tech/neondb?sslmode=require" \
     -f scripts/01-create-tables.sql
   
   psql "postgresql://user:password@ep-name.region.aws.neon.tech/neondb?sslmode=require" \
     -f scripts/02-seed-categories.sql
   ```

5. **Añadir a Vercel**:
   - Vercel Dashboard → Project → Settings → Environment Variables
   - Key: `DATABASE_URL`
   - Value: Tu connection string
   - Environments: Production, Preview, Development

### Supabase

Alternativa con interfaz amigable y features adicionales.

#### Setup

1. **Crear Proyecto en Supabase**:
   - [supabase.com](https://supabase.com/)
   - New Project

2. **Ejecutar SQL**:
   - SQL Editor en Supabase Dashboard
   - Pega contenido de `scripts/01-create-tables.sql`
   - Run
   - Repite con `scripts/02-seed-categories.sql`

3. **Connection String**:
   - Settings → Database
   - Connection string → Transaction Mode
   - Copia el string

### PostgreSQL Self-Hosted

Si prefieres hospedar tu propia base de datos:

#### Con Docker

```bash
docker run --name postgres-finanzas \
  -e POSTGRES_PASSWORD=mypassword \
  -e POSTGRES_DB=finanzas \
  -p 5432:5432 \
  -d postgres:15
```

#### Connection String

```bash
postgresql://postgres:mypassword@localhost:5432/finanzas
```

## Variables de Entorno

### Producción

Variables requeridas para producción:

```bash
# Base de datos (opcional - usa mock data si no está presente)
DATABASE_URL="postgresql://user:password@host:5432/database"

# Next.js (automáticas)
NEXT_PUBLIC_VERCEL_URL  # URL del despliegue
VERCEL_URL              # Interno de Vercel
```

### Variables Sensibles

**Nunca commitear:**
- ❌ `.env.local` con credenciales
- ❌ Connection strings en el código
- ❌ API keys o secrets

**Usar siempre:**
- ✅ Variables de entorno en plataforma de hosting
- ✅ `.env.example` para documentar (sin valores)
- ✅ `.gitignore` incluye `.env*`

### Ejemplo .env.example

Crea este archivo en el repositorio:

```bash
# .env.example
# Copia este archivo a .env.local y llena con tus valores

# Base de datos PostgreSQL (opcional)
# Si no se configura, la app usa datos de demostración
DATABASE_URL="postgresql://user:password@host:5432/database"

# Ejemplo con Neon:
# DATABASE_URL="postgresql://user:pass@ep-name.region.aws.neon.tech/neondb?sslmode=require"
```

## Optimizaciones de Producción

### Build Optimizations

El `next.config.mjs` ya incluye optimizaciones:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,  // Temporal - habilitar después
  },
  typescript: {
    ignoreBuildErrors: true,    // Temporal - habilitar después
  },
  images: {
    unoptimized: true,          // Para static exports
  },
}

export default nextConfig
```

### Performance Checklist

Antes de desplegar a producción:

- [ ] Build sin errores: `npm run build`
- [ ] Verificar bundle size (debe ser < 1MB)
- [ ] Imágenes optimizadas
- [ ] Lazy loading implementado donde sea apropiado
- [ ] Tree shaking habilitado (automático)
- [ ] Minificación habilitada (automático en prod)

### SEO y Metadata

Asegúrate de tener metadata apropiada en `app/layout.tsx`:

```typescript
export const metadata: Metadata = {
  title: "Finanzas Personales - Gestiona tu dinero",
  description: "Aplicación para gestionar finanzas personales de manera simple",
  keywords: ["finanzas", "presupuesto", "dinero", "gastos"],
  authors: [{ name: "Tu Nombre" }],
  openGraph: {
    title: "Finanzas Personales",
    description: "Gestiona tus finanzas de manera simple",
    type: "website",
  },
}
```

## Monitoreo y Analytics

### Vercel Analytics

Ya incluido en el proyecto:

```tsx
// app/layout.tsx
import { Analytics } from "@vercel/analytics/next"

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

Ver métricas en: Vercel Dashboard → Tu Proyecto → Analytics

### Logs y Debugging

#### Vercel Logs

```bash
# Ver logs en tiempo real
vercel logs [deployment-url]

# Logs de función específica
vercel logs [deployment-url] --follow
```

#### En la Aplicación

Logs automáticos en:
- Vercel Dashboard → Deployments → [Tu deployment] → Functions

## Troubleshooting

### Build Falla

**Error: "Module not found"**
```bash
# Solución: Verificar dependencias
npm install
npm run build

# Si persiste, limpiar cache
rm -rf .next node_modules
npm install
npm run build
```

**Error: "TypeScript errors"**
```bash
# Temporal: next.config.mjs ya tiene
typescript: {
  ignoreBuildErrors: true
}

# Permanente: Corregir errores de tipo
npm run lint
```

### Problemas de Base de Datos

**Error: "connection refused"**

Verificar:
1. Connection string es correcta
2. Base de datos está corriendo
3. Firewall permite conexiones
4. SSL es requerido? Añade `?sslmode=require`

**Error: "relation does not exist"**

```bash
# Las tablas no existen - ejecutar migrations
psql $DATABASE_URL -f scripts/01-create-tables.sql
psql $DATABASE_URL -f scripts/02-seed-categories.sql
```

### Variables de Entorno No Funcionan

1. **Verificar nombre**: `DATABASE_URL` (exacto)
2. **Verificar ambiente**: Production, Preview, Development
3. **Redeploy**: Cambios en env vars requieren redeploy

```bash
# Forzar redeploy en Vercel
vercel --force
```

### Problemas de Performance

**Página carga lento**

1. Verificar en Network tab (DevTools)
2. Identificar requests lentos
3. Optimizar queries de base de datos
4. Implementar caching

**Build muy grande**

```bash
# Analizar bundle
npm install -g @next/bundle-analyzer

# En next.config.mjs
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer(nextConfig)

# Analizar
ANALYZE=true npm run build
```

## Checklist Pre-Despliegue

Antes de desplegar a producción:

### Código
- [ ] `npm run build` exitoso
- [ ] `npm run lint` sin errores críticos
- [ ] Todas las features probadas localmente
- [ ] Código commiteado y pusheado

### Configuración
- [ ] Variables de entorno configuradas
- [ ] Base de datos setup (si aplica)
- [ ] Migrations ejecutadas (si aplica)
- [ ] Dominios configurados (si aplica)

### Documentación
- [ ] README actualizado
- [ ] CHANGELOG actualizado (si aplica)
- [ ] Versión tag creado (si aplica)

### Testing
- [ ] Pruebas manuales completas
- [ ] Verificación en múltiples navegadores
- [ ] Verificación mobile
- [ ] Performance aceptable

### Seguridad
- [ ] No hay secrets en el código
- [ ] Variables sensibles en env vars
- [ ] HTTPS habilitado
- [ ] Dependencias actualizadas

## Rollback

Si algo sale mal después del despliegue:

### En Vercel

1. **Vía Dashboard**:
   - Deployments → [Deployment anterior]
   - Click en "..." → "Promote to Production"

2. **Vía CLI**:
   ```bash
   vercel rollback
   ```

### En Otras Plataformas

1. **Git Revert**:
   ```bash
   git revert HEAD
   git push origin main
   ```

2. **Redeploy versión anterior**:
   ```bash
   git checkout [commit-hash-anterior]
   # Trigger redeploy según plataforma
   ```

## Recursos Adicionales

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Neon Documentation](https://neon.tech/docs)
- [PostgreSQL Best Practices](https://wiki.postgresql.org/wiki/Don't_Do_This)

---

**¿Necesitas ayuda con el despliegue?** Abre un issue en GitHub o contacta al equipo.

**Última actualización**: Enero 2025
