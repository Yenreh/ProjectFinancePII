# 💰 Finanzas Personales

[![Build Status](https://github.com/ManuhCardoso1501/FinanzasPersonales-PyI-II/actions/workflows/ci.yml/badge.svg)](https://github.com/ManuhCardoso1501/FinanzasPersonales-PyI-II/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14.x-black.svg)](https://nextjs.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

Una aplicación web moderna y elegante para gestionar tus finanzas personales de manera simple y efectiva. Controla tus ingresos, gastos, cuentas bancarias y obtén reportes visuales de tu situación financiera.

## 🌟 Características Principales

- **🎤 Asistente de Voz** _(NUEVO)_: Registra transacciones usando comandos de voz naturales
- **📊 Dashboard Interactivo**: Visualiza tus métricas financieras principales de un vistazo
- **💳 Gestión de Cuentas**: Administra múltiples cuentas bancarias, efectivo y tarjetas de crédito
- **💸 Control de Transacciones**: Registra y categoriza ingresos y gastos
- **📈 Reportes Visuales**: Gráficos y análisis detallados de tus finanzas
- **🏷️ Categorización**: Organiza tus transacciones por categorías personalizadas
- **📱 Diseño Responsive**: Interfaz optimizada para dispositivos móviles y escritorio
- **🌓 Modo Oscuro**: Soporte completo para tema claro y oscuro
- **🔄 Modo Offline**: Funciona con datos de demostración sin necesidad de base de datos

## 🎯 Casos de Uso

- Control de gastos mensuales personales o familiares
- Seguimiento de múltiples fuentes de ingresos
- Análisis de patrones de gasto por categoría
- Gestión de presupuestos y ahorro
- Reportes financieros para toma de decisiones

## 🏗️ Tecnologías

Este proyecto está construido con tecnologías modernas y probadas:

- **Frontend Framework**: [Next.js 14](https://nextjs.org/) con App Router
- **Lenguaje**: [TypeScript 5](https://www.typescriptlang.org/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/)
- **Estilos**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Gráficos**: [Recharts](https://recharts.org/)
- **Base de Datos**: [PostgreSQL](https://www.postgresql.org/) via [Neon](https://neon.tech/)
- **Formularios**: [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **Analytics**: [Vercel Analytics](https://vercel.com/analytics)
- **Voz**: [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API) + [ElevenLabs](https://elevenlabs.io/)

## 📋 Requisitos Previos

Antes de ejecutar este proyecto, asegúrate de tener instalado:

- **Node.js**: versión 18.x o superior
- **npm**: versión 9.x o superior (incluido con Node.js)
- **Base de datos PostgreSQL** (opcional): 
  - Puedes usar [Neon](https://neon.tech/) (recomendado)
  - O cualquier instancia de PostgreSQL 14+
  - La aplicación funciona sin base de datos usando datos de demostración

## 🚀 Configuración del Proyecto

### 1. Clonar el Repositorio

```bash
git clone https://github.com/ManuhCardoso1501/FinanzasPersonales-PyI-II.git
cd FinanzasPersonales-PyI-II
```

### 2. Instalar Dependencias

Ejecuta el siguiente comando en la raíz del proyecto:

```bash
npm install
```

### 3. Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```bash
# Opcional - Solo si quieres usar base de datos real
DATABASE_URL="postgresql://user:password@host:5432/database"

# Opcional - Solo si quieres usar el asistente de voz con síntesis de audio
ELEVEN_LABS_API_KEY="tu_api_key_de_elevenlabs"
```

**Nota**: 
- Si no configuras `DATABASE_URL`, la aplicación funcionará con datos de demostración en memoria.
- Si no configuras `ELEVEN_LABS_API_KEY`, el asistente de voz funcionará solo con transcripción (sin síntesis de voz).

### 4. Configurar Base de Datos (Opcional)

Si decides usar una base de datos real, ejecuta los scripts SQL incluidos:

```bash
# Opción A: Usando psql
psql $DATABASE_URL -f scripts/01-create-tables.sql
psql $DATABASE_URL -f scripts/02-seed-categories.sql

# Opción B: Desde tu cliente SQL favorito
# Ejecuta el contenido de los archivos en orden:
# 1. scripts/01-create-tables.sql
# 2. scripts/02-seed-categories.sql
```

### 5. Ejecutar en Modo Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

### 6. Verificar Conexión a Base de Datos (Opcional)

```bash
node scripts/test-connection.js
```

Este script te indicará si la conexión a la base de datos es exitosa o si estás usando datos de demostración.

## 🔨 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Inicia servidor de desarrollo en puerto 3000

# Producción
npm run build        # Construye la aplicación para producción
npm start            # Inicia el servidor de producción

# Calidad de Código
npm run lint         # Ejecuta ESLint para verificar el código
```

## 📱 Uso de la Aplicación

### 🎤 Asistente de Voz (NUEVO)

Registra transacciones usando tu voz:
1. Busca el botón flotante de micrófono (esquina inferior derecha)
2. Presiona para activar el asistente
3. Di un comando como: "gasté 50000 pesos en comida"
4. Confirma la transacción

**Comandos soportados**:
- Gastos: "gasté 50000 en comida", "pagué 80000 en transporte"
- Ingresos: "recibí 1000000 de salario", "cobré 500000"

📖 **Más información**: Ver [Guía del Asistente de Voz](VOICE_ASSISTANT_README.md)

### Dashboard

El dashboard principal muestra:
- Balance total de todas tus cuentas
- Total de ingresos y gastos del período
- Número de transacciones registradas
- Lista de transacciones recientes

### Cuentas

Gestiona tus cuentas financieras:
1. Crea nuevas cuentas (efectivo, banco, tarjeta)
2. Visualiza el balance de cada cuenta
3. Edita o archiva cuentas existentes
4. Filtra por tipo de cuenta

### Transacciones

Registra tus movimientos financieros:
1. Crea ingresos o gastos
2. Asocia cada transacción a una cuenta y categoría
3. Añade descripciones y fechas
4. Edita o elimina transacciones

### Reportes

Analiza tus finanzas:
- Gráfico de gastos por categoría
- Distribución porcentual de gastos
- Filtros por rango de fechas
- Exportación de datos (próximamente)

## 🌐 Despliegue en Vercel

Este proyecto está optimizado para desplegarse en [Vercel](https://vercel.com/):

### Despliegue Automático vía GitHub

1. **Conecta tu repositorio**:
   - Visita [vercel.com](https://vercel.com/)
   - Click en "New Project"
   - Importa tu repositorio de GitHub

2. **Configura el proyecto**:
   - Framework Preset: Next.js (detectado automáticamente)
   - Root Directory: `./`
   - Build Command: `next build` (por defecto)
   - Output Directory: `.next` (por defecto)

3. **Variables de Entorno** (opcional):
   - Añade `DATABASE_URL` si usas base de datos
   - Añade `ELEVEN_LABS_API_KEY` si quieres síntesis de voz
   - Click en "Deploy"

4. **Despliegue**:
   - Vercel construirá y desplegará tu aplicación automáticamente
   - Cada push a `main` disparará un nuevo despliegue
   - Los Pull Requests generan preview deployments automáticos

### Despliegue Manual vía CLI

```bash
# 1. Instala Vercel CLI (si no la tienes)
npm install -g vercel

# 2. Inicia sesión en Vercel
vercel login

# 3. Despliega el proyecto
vercel

# 4. Despliega a producción
vercel --prod
```

### Configuración de Base de Datos en Vercel

Si usas Neon u otro proveedor de PostgreSQL:

1. Ve a tu proyecto en Vercel Dashboard
2. Settings → Environment Variables
3. Añade `DATABASE_URL` con tu connection string
4. Redeploy el proyecto para aplicar cambios

**Importante**: Asegúrate de que tu base de datos acepte conexiones desde las IPs de Vercel.

## 📁 Estructura del Proyecto

```
FinanzasPersonales-PyI-II/
├── app/                          # Directorio principal de Next.js App Router
│   ├── api/                      # API Routes (Backend)
│   │   ├── accounts/             # Endpoints de cuentas
│   │   ├── categories/           # Endpoints de categorías
│   │   ├── transactions/         # Endpoints de transacciones
│   │   ├── dashboard/            # Endpoints de métricas
│   │   ├── reports/              # Endpoints de reportes
│   │   └── voice/                # Endpoints de asistente de voz
│   ├── cuentas/                  # Página de gestión de cuentas
│   ├── transacciones/            # Página de transacciones
│   ├── reportes/                 # Página de reportes
│   ├── layout.tsx                # Layout principal
│   ├── page.tsx                  # Página de inicio (Dashboard)
│   └── globals.css               # Estilos globales
├── components/                   # Componentes React reutilizables
│   ├── accounts/                 # Componentes de cuentas
│   ├── categories/               # Componentes de categorías
│   ├── transactions/             # Componentes de transacciones
│   ├── dashboard/                # Componentes del dashboard
│   ├── reports/                  # Componentes de reportes
│   ├── layout/                   # Componentes de navegación
│   ├── voice/                    # Componentes del asistente de voz
│   └── ui/                       # Componentes UI base (Radix)
├── lib/                          # Utilidades y lógica de negocio
│   ├── db.ts                     # Queries de base de datos
│   ├── mock-data.ts              # Datos de demostración
│   ├── types.ts                  # Tipos TypeScript
│   ├── format.ts                 # Funciones de formateo
│   ├── nlp-service.ts            # Servicio de procesamiento de lenguaje natural
│   ├── voice-types.ts            # Tipos para asistente de voz
│   ├── hooks/                    # Custom React Hooks
│   │   └── use-voice-recorder.ts # Hook de grabación de voz
│   └── utils.ts                  # Utilidades generales
├── scripts/                      # Scripts de utilidad
│   ├── 01-create-tables.sql      # Schema de base de datos
│   ├── 02-seed-categories.sql    # Datos iniciales
│   └── test-connection.js        # Test de conexión DB
├── public/                       # Archivos estáticos
├── docs/                         # Documentación técnica
├── .github/                      # Configuración de GitHub
│   └── workflows/                # GitHub Actions
└── styles/                       # Estilos adicionales
```

## 🧪 Pruebas

### Pruebas Manuales

Para probar la aplicación manualmente:

1. **Sin Base de Datos** (Mock Data):
   ```bash
   # No configures DATABASE_URL
   npm run dev
   # Navega a http://localhost:3000
   ```

2. **Con Base de Datos**:
   ```bash
   # Configura DATABASE_URL en .env.local
   npm run dev
   # Verifica conexión
   node scripts/test-connection.js
   ```

### Validación de Build

```bash
npm run build
```

Verifica que no hay errores de TypeScript o durante el build.

## 🤝 Contribución

¡Las contribuciones son bienvenidas! Por favor, lee nuestra [Guía de Contribución](docs/CONTRIBUTING.md) antes de enviar Pull Requests.

### Proceso de Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Haz commit de tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Estándares de Código

- Utiliza TypeScript para todo el código
- Sigue las convenciones de naming de React
- Ejecuta `npm run lint` antes de hacer commit
- Asegúrate de que `npm run build` funciona correctamente
- Documenta funciones y componentes complejos

## 📚 Documentación Adicional

- [Guía de Arquitectura](docs/ARCHITECTURE.md)
- [Guía para Desarrolladores](docs/DEVELOPER_GUIDE.md)
- [Guía de Despliegue](docs/DEPLOYMENT.md)
- [Guía de Contribución](docs/CONTRIBUTING.md)
- **[🎤 Asistente de Voz](VOICE_ASSISTANT_README.md)** _(NUEVO)_
- **[Documentación Técnica del Asistente](docs/VOICE_ASSISTANT_IMPLEMENTATION.md)** _(NUEVO)_
- **[Ejemplos de Comandos de Voz](VOICE_EXAMPLES.md)** _(NUEVO)_

## 🐛 Reportar Problemas

Si encuentras un bug o tienes una sugerencia:

1. Verifica que no exista un issue similar
2. Crea un nuevo issue con información detallada:
   - Descripción del problema
   - Pasos para reproducir
   - Comportamiento esperado vs actual
   - Screenshots (si aplica)
   - Versión del navegador y sistema operativo

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## 👥 Autores

- **Emanuel Cardoso** - [ManuhCardoso1501](https://github.com/ManuhCardoso1501)

## 🙏 Agradecimientos

- [Vercel](https://vercel.com/) por el hosting y analytics
- [v0.dev](https://v0.dev/) por la generación inicial de componentes
- [Neon](https://neon.tech/) por la base de datos PostgreSQL serverless
- La comunidad de Next.js y React por las herramientas y documentación

---

**Hecho con ❤️ para ayudarte a tomar control de tus finanzas personales**
