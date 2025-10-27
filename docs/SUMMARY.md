# 📊 Resumen del Proyecto - Finanzas Personales

**Versión**: 2.0.0  
**Última Actualización**: Enero 2025  
**Estado**: ✅ Producción

---

## 🎯 Descripción General

**Finanzas Personales** es una aplicación web moderna para gestionar finanzas personales con un innovador **asistente de voz** que permite registrar transacciones mediante comandos hablados naturales.

### Objetivo del Proyecto
Proporcionar una herramienta intuitiva y accesible para el control de gastos e ingresos personales, con énfasis en la experiencia de usuario mediante interfaces visuales y de voz.

---

## ✨ Funcionalidades Principales

### 1. 🎤 Asistente de Voz (NUEVO - Sprint 2)

**Descripción**: Interfaz de voz conversacional para registro de transacciones sin necesidad de formularios manuales.

**Características**:
- ✅ **Reconocimiento de voz** (Web Speech API)
- ✅ **Síntesis de voz** (ElevenLabs)
- ✅ **Procesamiento de lenguaje natural** (NLP)
- ✅ **Detección automática de intención** (gasto/ingreso)
- ✅ **Extracción de montos** (números y palabras)
- ✅ **Categorización automática**
- ✅ **Confirmación por voz y visual**
- ✅ **Corrección de comandos**
- ✅ **Consultas por voz** (balance, gastos del día)
- ✅ **Selección de cuenta** (múltiples cuentas)
- ✅ **Preservación de contexto** en conversaciones multi-turno
- ✅ **Control de audio** (detener reproducción)

**Comandos Soportados**:

**Gastos**:
```
"gasté 50000 en comida"
"pagué 80000 en transporte"
"compré 120000 en ropa"
```

**Ingresos**:
```
"recibí 1000000 de salario"
"cobré 500000 por freelance"
"me entró 200000 por ventas"
```

**Consultas**:
```
"cuál es mi balance"
"cuánto gasté hoy"
"cuál fue mi último gasto"
"último ingreso"
```

**Correcciones**:
```
Usuario: "gasté 50000 en comida"
Sistema: "Voy a registrar un gasto de $50,000..."
Usuario: "no, era 15000"
Sistema: "Corrección aplicada. $15,000..."
```

**Múltiples Cuentas**:
```
Usuario: "recibí 5000 por ventas"
Sistema: "Tienes 2 cuentas: Nu, Bancolombia. ¿En cuál cuenta?"
Usuario: "en nu"
Sistema: "Voy a registrar un ingreso de $5,000 en Ventas en Nu"
```

**Historias de Usuario Implementadas**:
- **HU-001**: Registro por comando de voz
- **HU-002**: Identificación automática de intención
- **HU-010**: Modo manos libres (continuo)
- **HU-011**: Navegación por voz
- **HU-012**: Comandos sugeridos en pantalla
- **HU-013**: Botón de repetición

**Tecnologías**:
- Web Speech API (STT - gratuito)
- ElevenLabs API (TTS - opcional)
- NLP custom en TypeScript
- React Hooks personalizados

---

### 2. 📊 Dashboard Interactivo

**Descripción**: Vista principal con métricas financieras en tiempo real.

**Componentes**:
- **Balance Total**: Suma de todas las cuentas
- **Ingresos del Período**: Total de entradas
- **Gastos del Período**: Total de salidas
- **Número de Transacciones**: Contador de movimientos
- **Transacciones Recientes**: Lista de últimos 10 movimientos
- **Botones de Acción Rápida**: Nuevo gasto/ingreso

**Características**:
- ✅ Actualización en tiempo real
- ✅ Gráficos visuales
- ✅ Tarjetas con iconos
- ✅ Colores diferenciados (verde=ingresos, rojo=gastos)
- ✅ Formato de moneda colombiana
- ✅ Responsive design

**Métricas Mostradas**:
```
Balance de Movimientos: +$XXX,XXX
Ingresos: $XXX,XXX
Gastos: $XXX,XXX
Transacciones: XX
```

---

### 3. 💳 Gestión de Cuentas

**Descripción**: Administración de múltiples cuentas bancarias, efectivo y tarjetas.

**Funcionalidades**:
- ✅ **Crear cuentas** (nombre, tipo, balance inicial)
- ✅ **Editar cuentas** (actualizar información)
- ✅ **Archivar cuentas** (sin eliminar datos históricos)
- ✅ **Ver balance por cuenta**
- ✅ **Filtrar por tipo** (Banco, Efectivo, Tarjeta)

**Tipos de Cuenta**:
- 🏦 Banco (cuenta bancaria, ahorros)
- 💵 Efectivo (dinero en mano)
- 💳 Tarjeta (crédito/débito)

**Características**:
- ✅ Íconos diferenciados por tipo
- ✅ Colores personalizados
- ✅ Balance actualizado automáticamente
- ✅ Validación de datos
- ✅ Confirmación antes de archivar

**Ejemplo de Cuentas**:
```
Nu - Banco - $100,000
Bancolombia - Banco - $10,000
Efectivo - Efectivo - $50,000
```

---

### 4. 💸 Control de Transacciones

**Descripción**: Registro y seguimiento detallado de ingresos y gastos.

**Funcionalidades**:
- ✅ **Crear transacciones** (ingreso/gasto)
- ✅ **Editar transacciones**
- ✅ **Eliminar transacciones**
- ✅ **Filtrar por tipo** (ingreso/gasto)
- ✅ **Filtrar por categoría**
- ✅ **Filtrar por cuenta**
- ✅ **Filtrar por rango de fechas**
- ✅ **Buscar por descripción**

**Datos de Transacción**:
```typescript
{
  type: "gasto" | "ingreso",
  amount: number,
  category: string,
  account: string,
  description: string,
  date: Date
}
```

**Características**:
- ✅ Validación de formularios (React Hook Form + Zod)
- ✅ Actualización automática de balance de cuenta
- ✅ Formato de moneda
- ✅ Selector de fechas
- ✅ Categorías predefinidas
- ✅ Vista de lista con paginación

---

### 5. 📈 Reportes Visuales

**Descripción**: Análisis gráfico de patrones financieros.

**Gráficos Disponibles**:
- ✅ **Gastos por Categoría** (gráfico de barras)
- ✅ **Distribución Porcentual** (gráfico de pastel)
- ✅ **Tendencias Temporales** (próximamente)

**Filtros**:
- ✅ Rango de fechas personalizado
- ✅ Tipo de transacción
- ✅ Categoría específica

**Características**:
- ✅ Gráficos interactivos (Recharts)
- ✅ Tooltips con información detallada
- ✅ Colores diferenciados por categoría
- ✅ Responsive design
- ✅ Exportación de datos (próximamente)

**Ejemplo de Insights**:
```
Alimentos: $200,000 (40%)
Transporte: $150,000 (30%)
Servicios: $100,000 (20%)
Otros: $50,000 (10%)
```

---

### 6. 🏷️ Sistema de Categorización

**Descripción**: Organización de transacciones por categorías predefinidas.

**Categorías de Gastos**:
- 🍔 Alimentos
- 🚗 Transporte
- 🏠 Vivienda
- 💡 Servicios
- 🏥 Salud
- 🎮 Entretenimiento
- 👔 Ropa
- 📚 Educación
- 🛒 Otros

**Categorías de Ingresos**:
- 💼 Salario
- 💰 Freelance
- 📈 Inversiones
- 🎁 Regalos
- 💸 Ventas
- 📊 Otros

**Características**:
- ✅ Íconos visuales
- ✅ Colores distintivos
- ✅ Detección automática por palabras clave (voz)
- ✅ Agrupación en reportes
- ✅ Estadísticas por categoría

---

## 🛠️ Stack Tecnológico

### Frontend
```
Framework:        Next.js 14 (App Router)
Lenguaje:         TypeScript 5
UI Components:    Radix UI
Estilos:          Tailwind CSS v4
Gráficos:         Recharts
Formularios:      React Hook Form + Zod
Notificaciones:   Sonner
```

### Backend
```
API Routes:       Next.js API Routes
Base de Datos:    PostgreSQL (Neon)
ORM:              SQL directo
Validación:       Zod schemas
```

### Voz (Asistente)
```
STT:              Web Speech API (navegador)
TTS:              ElevenLabs API (opcional)
NLP:              Custom TypeScript service
Audio:            HTML5 Audio API
```

### DevOps
```
Hosting:          Vercel
CI/CD:            GitHub Actions
Versionado:       Git + GitHub
Monitoreo:        Vercel Analytics
```

---

## 📁 Arquitectura del Proyecto

### Estructura de Carpetas

```
FinanzasPersonales-PyI-II/
│
├── app/                          # Next.js App Router
│   ├── api/                      # Backend API Routes
│   │   ├── accounts/             # CRUD de cuentas
│   │   ├── categories/           # Listado de categorías
│   │   ├── transactions/         # CRUD de transacciones
│   │   ├── dashboard/            # Métricas del dashboard
│   │   ├── reports/              # Datos de reportes
│   │   └── voice/                # Asistente de voz
│   │       ├── process-command/  # Procesador NLP
│   │       ├── text-to-speech/   # Síntesis de voz
│   │       ├── last-transaction/ # Consulta última transacción
│   │       └── today-total/      # Total del día
│   │
│   ├── cuentas/                  # Página de gestión de cuentas
│   ├── transacciones/            # Página de transacciones
│   ├── reportes/                 # Página de reportes
│   ├── layout.tsx                # Layout principal
│   ├── page.tsx                  # Dashboard (home)
│   └── globals.css               # Estilos globales
│
├── components/                   # Componentes React
│   ├── accounts/                 # Componentes de cuentas
│   ├── categories/               # Componentes de categorías
│   ├── transactions/             # Componentes de transacciones
│   ├── dashboard/                # Componentes del dashboard
│   ├── reports/                  # Componentes de reportes
│   ├── layout/                   # Navegación
│   ├── voice/                    # Asistente de voz
│   │   ├── voice-assistant.tsx
│   │   └── voice-assistant-button.tsx
│   └── ui/                       # Componentes base (Radix)
│
├── lib/                          # Lógica de negocio
│   ├── db.ts                     # Queries de BD
│   ├── mock-data.ts              # Datos de demostración
│   ├── types.ts                  # Tipos TypeScript
│   ├── format.ts                 # Formateo de datos
│   ├── nlp-service.ts            # Motor NLP
│   ├── voice-types.ts            # Tipos de voz
│   ├── utils.ts                  # Utilidades
│   ├── hooks/
│   │   └── use-voice-recorder.ts # Hook de grabación
│   └── __tests__/
│       └── nlp-service.test.ts   # Tests del NLP
│
├── scripts/                      # Scripts de utilidad
│   ├── 01-create-tables.sql      # Schema de BD
│   ├── 02-seed-categories.sql    # Datos iniciales
│   └── test-connection.js        # Test de conexión
│
├── docs/                         # Documentación
│   ├── ARCHITECTURE.md
│   ├── DEVELOPER_GUIDE.md
│   ├── DEPLOYMENT.md
│   └── CONTRIBUTING.md
│
├── .github/workflows/            # CI/CD
│   └── ci.yml                    # Pipeline de GitHub Actions
│
├── public/                       # Archivos estáticos
├── styles/                       # Estilos adicionales
│
├── README.md                     # Documentación principal
├── TESTING.md                    # Guía de pruebas
├── SUMMARY.md                    # Este archivo
└── LICENSE                       # Licencia MIT
```

### Flujo de Datos

#### 1. Flujo de Transacción por Voz
```
Usuario habla 
  ↓ [Web Speech API]
Transcripción de voz
  ↓ [NLP Service]
Análisis de intención + extracción de datos
  ↓ [API /voice/process-command]
Validación + enriquecimiento con BD
  ↓ [TTS ElevenLabs]
Confirmación por voz + visual
  ↓ [Usuario confirma]
Creación de transacción
  ↓ [Database]
Actualización de balance
  ↓ [UI Refresh]
Dashboard actualizado
```

#### 2. Flujo de Transacción Manual
```
Usuario abre formulario
  ↓ [React Hook Form]
Ingresa datos + validación (Zod)
  ↓ [API /transactions POST]
Creación en base de datos
  ↓ [Database Trigger]
Actualización de balance de cuenta
  ↓ [API Response]
Notificación de éxito
  ↓ [Router Refresh]
Lista de transacciones actualizada
```

#### 3. Flujo de Consulta
```
Usuario pide reporte
  ↓ [API /reports/expenses-by-category]
Query a base de datos
  ↓ [PostgreSQL GROUP BY]
Agregación de datos
  ↓ [API Response]
Datos formateados
  ↓ [Recharts]
Renderizado de gráficos
```

---

## 🔐 Seguridad y Privacidad

### Medidas Implementadas

**Base de Datos**:
- ✅ Conexión segura SSL (Neon)
- ✅ Variables de entorno para credenciales
- ✅ Validación de inputs (Zod)
- ✅ Sanitización de queries SQL

**API**:
- ✅ Validación de requests
- ✅ Manejo de errores seguro
- ✅ Rate limiting (Vercel)
- ✅ CORS configurado

**Frontend**:
- ✅ No expone secrets en cliente
- ✅ Validación de formularios
- ✅ Escape de HTML
- ✅ CSP headers (Vercel)

**Voz**:
- ✅ Procesamiento en navegador (STT)
- ✅ No se graban audios permanentemente
- ✅ API key de ElevenLabs en servidor
- ✅ Permisos de micrófono solicitados

---

## 📊 Métricas del Proyecto

### Estadísticas de Código

```
Total de Archivos:      ~150
Líneas de Código:       ~15,000
Componentes React:      ~40
API Routes:             ~12
Tests Automatizados:    37
Documentación (MD):     ~5,000 líneas
```

### Funcionalidades por Sprint

**Sprint 1** (Base):
- ✅ Setup del proyecto
- ✅ Sistema de cuentas
- ✅ Sistema de transacciones
- ✅ Dashboard básico
- ✅ Reportes simples
- ✅ Integración con BD

**Sprint 2** (Voz):
- ✅ Asistente de voz completo
- ✅ Motor NLP custom
- ✅ Síntesis de voz
- ✅ Corrección de comandos
- ✅ Consultas por voz
- ✅ Modo manos libres
- ✅ Navegación por voz
- ✅ 37 tests automatizados
- ✅ CI/CD pipeline
- ✅ Documentación completa

---

## 🚀 Despliegue

### Plataformas Soportadas

**Producción**:
- ✅ **Vercel** (recomendado)
- ✅ Netlify
- ✅ Railway
- ✅ Render
- ✅ Docker (self-hosted)

### Base de Datos

**Opciones**:
- ✅ **Neon** (PostgreSQL serverless - recomendado)
- ✅ Supabase
- ✅ PostgreSQL self-hosted
- ✅ Mock data (sin BD)

### Variables de Entorno

```bash
# Base de datos (opcional)
DATABASE_URL="postgresql://..."

# Síntesis de voz (opcional)
ELEVEN_LABS_API_KEY="sk_..."

# URL de la aplicación
NEXT_PUBLIC_APP_URL="https://..."
```

### Estado Actual

```
Producción:  ✅ Desplegado en Vercel
CI/CD:       ✅ GitHub Actions activo
Tests:       ✅ 37/37 pasando
Build:       ✅ Sin errores
TypeScript:  ✅ Sin errores de tipo
Lint:        ✅ Sin warnings
```

---

## 📚 Documentación

### Documentos Disponibles

1. **README.md** - Guía de inicio rápido
2. **TESTING.md** - Guía de pruebas
3. **SUMMARY.md** - Este documento
4. **docs/ARCHITECTURE.md** - Arquitectura técnica
5. **docs/DEVELOPER_GUIDE.md** - Guía para desarrolladores
6. **docs/DEPLOYMENT.md** - Guía de despliegue
7. **docs/CONTRIBUTING.md** - Guía de contribución

### Recursos Externos

- [Documentación de Next.js](https://nextjs.org/docs)
- [Documentación de TypeScript](https://www.typescriptlang.org/docs/)
- [Radix UI Components](https://www.radix-ui.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
- [ElevenLabs API](https://elevenlabs.io/docs)

---

## 🎓 Casos de Uso

### Caso 1: Estudiante Universitario
```
Necesidad: Control de gastos mensuales con presupuesto limitado
Uso: Registra gastos diarios por voz mientras viaja en bus
Beneficio: Visualiza en qué categorías gasta más
```

### Caso 2: Freelancer
```
Necesidad: Seguimiento de ingresos por proyectos
Uso: Registra cobros por voz, consulta balance antes de gastos
Beneficio: Mejor planificación financiera
```

### Caso 3: Familia
```
Necesidad: Control de gastos del hogar
Uso: Múltiples cuentas (efectivo, banco), categorías detalladas
Beneficio: Reportes mensuales para ajustar presupuesto
```

### Caso 4: Emprendedor
```
Necesidad: Separar finanzas personales de negocio
Uso: Cuentas diferenciadas, categorías personalizadas
Beneficio: Claridad en flujo de caja
```

---

## 🔄 Roadmap Futuro

### Próximas Funcionalidades

**Corto Plazo** (Q1 2025):
- [ ] Presupuestos por categoría
- [ ] Alertas de gastos
- [ ] Exportación de datos (CSV, Excel)
- [ ] Gráficos de tendencias temporales
- [ ] Multi-idioma (inglés)

**Mediano Plazo** (Q2-Q3 2025):
- [ ] App móvil (React Native)
- [ ] Sincronización en la nube
- [ ] Modo multi-usuario
- [ ] Recordatorios de pagos
- [ ] Integración con bancos (Open Banking)

**Largo Plazo** (Q4 2025):
- [ ] Inteligencia artificial para predicciones
- [ ] Asistente de inversiones
- [ ] Gamificación (metas de ahorro)
- [ ] Compartir reportes
- [ ] Modo offline completo

---

## 🤝 Contribución

### Cómo Contribuir

1. Fork del repositorio
2. Crear rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit de cambios (`git commit -m 'Add AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

### Áreas de Contribución

- 🐛 **Bug fixes**
- ✨ **Nuevas funcionalidades**
- 📝 **Documentación**
- 🧪 **Tests**
- 🌍 **Traducciones**
- 🎨 **Mejoras de UI/UX**
- ♿ **Accesibilidad**

---

## 📊 Estadísticas de Desarrollo

### Timeline

```
Noviembre 2024:  Inicio del proyecto (Sprint 1)
Diciembre 2024:  Funcionalidades base completadas
Enero 2025:      Sprint 2 - Asistente de voz
Febrero 2025:    Documentación y optimizaciones
```

### Commits

```
Total de Commits:     ~200
Contributors:         1 (Emanuel Cardoso)
Branches:            main, develop, features/*
Pull Requests:       ~30
Issues Cerrados:     ~50
```

### Tecnologías Dominadas

- ✅ Next.js 14 App Router
- ✅ TypeScript avanzado
- ✅ React Hooks personalizados
- ✅ Web Speech API
- ✅ Procesamiento de lenguaje natural
- ✅ PostgreSQL
- ✅ CI/CD con GitHub Actions
- ✅ Despliegue en Vercel

---

## 🏆 Logros Destacados

### Técnicos

- ✅ **Motor NLP custom** sin librerías externas
- ✅ **37 tests automatizados** con 100% de éxito
- ✅ **Pipeline CI/CD** completamente funcional
- ✅ **Preservación de contexto** en conversaciones de voz
- ✅ **Manejo de tipos** PostgreSQL (NUMERIC como string)
- ✅ **Arquitectura escalable** y bien documentada

### Funcionales

- ✅ **Asistente de voz completo** con múltiples features
- ✅ **Detección de intención** con alta precisión
- ✅ **Corrección de comandos** en tiempo real
- ✅ **Consultas por voz** funcionales
- ✅ **Múltiples cuentas** con selección inteligente

### Documentación

- ✅ **README completo** con instrucciones detalladas
- ✅ **Guías técnicas** para desarrolladores
- ✅ **Documentación de testing** exhaustiva
- ✅ **Guías de despliegue** para múltiples plataformas

---

## 📞 Soporte y Contacto

### Reportar Problemas

- **GitHub Issues**: [Crear issue](https://github.com/ManuhCardoso1501/FinanzasPersonales-PyI-II/issues)
- **Email**: [contacto disponible en perfil GitHub]

### Comunidad

- **Discusiones**: GitHub Discussions
- **Documentación**: docs/ directory
- **Ejemplos**: README.md y guías

---

## 📄 Licencia

Este proyecto está bajo la **Licencia MIT**.

```
MIT License

Copyright (c) 2025 Emanuel Cardoso

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files...
```

Ver [LICENSE](LICENSE) para más detalles.

---

## 🙏 Agradecimientos

- **Vercel** - Hosting y analytics
- **Neon** - Base de datos PostgreSQL serverless
- **ElevenLabs** - API de síntesis de voz
- **Radix UI** - Componentes accesibles
- **Comunidad Next.js** - Recursos y soporte
- **v0.dev** - Generación de componentes UI

---

## 📈 Conclusión

**Finanzas Personales** es una aplicación completa y moderna que combina lo mejor de las tecnologías web actuales con características innovadoras como el asistente de voz.

### Highlights

- ✅ **100% TypeScript** para seguridad de tipos
- ✅ **Arquitectura escalable** con Next.js 14
- ✅ **Asistente de voz innovador** con NLP custom
- ✅ **37 tests automatizados** pasando
- ✅ **CI/CD pipeline** funcional
- ✅ **Documentación completa** y profesional
- ✅ **Producción ready** con despliegue en Vercel

### Ideal Para

- 👨‍🎓 Estudiantes aprendiendo finanzas
- 💼 Freelancers gestionando ingresos
- 👨‍👩‍👧 Familias controlando presupuestos
- 🚀 Emprendedores separando finanzas

---

**Desarrollado con ❤️ por Emanuel Cardoso**

**Versión**: 2.0.0  
**Fecha**: Enero 2025  
**Estado**: ✅ Producción
