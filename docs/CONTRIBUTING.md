# Guía de Contribución - Finanzas Personales

¡Gracias por tu interés en contribuir a Finanzas Personales! Este documento proporciona directrices para contribuir al proyecto.

## 📋 Tabla de Contenidos

1. [Código de Conducta](#código-de-conducta)
2. [¿Cómo Puedo Contribuir?](#cómo-puedo-contribuir)
3. [Configuración del Entorno](#configuración-del-entorno)
4. [Proceso de Contribución](#proceso-de-contribución)
5. [Estándares de Código](#estándares-de-código)
6. [Guía de Estilo](#guía-de-estilo)
7. [Proceso de Revisión](#proceso-de-revisión)
8. [Comunidad](#comunidad)

## Código de Conducta

### Nuestro Compromiso

Nos comprometemos a hacer de la participación en nuestro proyecto una experiencia libre de acoso para todos, independientemente de:

- Edad
- Tamaño corporal
- Discapacidad
- Etnia
- Identidad y expresión de género
- Nivel de experiencia
- Nacionalidad
- Apariencia personal
- Raza
- Religión
- Identidad y orientación sexual

### Comportamiento Esperado

- Uso de lenguaje acogedor e inclusivo
- Respeto a diferentes puntos de vista y experiencias
- Aceptación de críticas constructivas
- Enfoque en lo que es mejor para la comunidad
- Empatía hacia otros miembros de la comunidad

### Comportamiento Inaceptable

- Lenguaje o imágenes sexualizadas
- Trolling, comentarios insultantes o despectivos
- Acoso público o privado
- Publicar información privada de otros sin permiso
- Cualquier conducta que razonablemente se considere inapropiada

### Aplicación

Los casos de comportamiento abusivo, acosador o inaceptable pueden reportarse contactando al equipo del proyecto. Todas las quejas serán revisadas e investigadas.

## ¿Cómo Puedo Contribuir?

### 🐛 Reportar Bugs

Si encuentras un bug:

1. **Verifica que el bug no ha sido reportado** buscando en [Issues](https://github.com/ManuhCardoso1501/FinanzasPersonales-PyI-II/issues)

2. **Crea un nuevo issue** con:
   - **Título descriptivo**: "Error al crear cuenta con balance negativo"
   - **Descripción detallada** del problema
   - **Pasos para reproducir**:
     ```
     1. Ir a la página de Cuentas
     2. Click en "Nueva Cuenta"
     3. Ingresar balance negativo
     4. Ver error
     ```
   - **Comportamiento esperado**: "Debería mostrar mensaje de validación"
   - **Comportamiento actual**: "La aplicación se congela"
   - **Screenshots** (si aplica)
   - **Entorno**:
     - Sistema Operativo: macOS 14
     - Navegador: Chrome 120
     - Versión de Node: 18.17.0

### 💡 Sugerir Mejoras

Para sugerir nuevas características:

1. **Verifica que no existe** en [Issues](https://github.com/ManuhCardoso1501/FinanzasPersonales-PyI-II/issues)

2. **Crea un issue** con:
   - **Título claro**: "Feature: Exportar reportes a PDF"
   - **Problema a resolver**: "Los usuarios necesitan compartir reportes"
   - **Solución propuesta**: Descripción de la funcionalidad
   - **Alternativas consideradas**: Otras opciones que pensaste
   - **Contexto adicional**: Mockups, ejemplos, referencias

### 📝 Mejorar Documentación

La documentación es crucial. Puedes contribuir:

- Corrigiendo typos o errores
- Mejorando explicaciones existentes
- Añadiendo ejemplos
- Traduciendo documentación
- Creando tutoriales o guías

### 🔧 Contribuir Código

¿Quieres escribir código? ¡Genial!

1. **Issues para principiantes**: Busca etiquetas `good first issue` o `help wanted`
2. **Pregunta antes de empezar**: Comenta en el issue que quieres trabajar en él
3. **Sigue el proceso**: Ver [Proceso de Contribución](#proceso-de-contribución)

## Configuración del Entorno

### Prerequisitos

- Node.js 18.x o superior
- npm 9.x o superior
- Git
- Editor de código (recomendamos VS Code)

### Setup Local

```bash
# 1. Fork el repositorio en GitHub
# Click en "Fork" en https://github.com/ManuhCardoso1501/FinanzasPersonales-PyI-II

# 2. Clona tu fork
git clone https://github.com/TU-USUARIO/FinanzasPersonales-PyI-II.git
cd FinanzasPersonales-PyI-II

# 3. Añade el repositorio original como upstream
git remote add upstream https://github.com/ManuhCardoso1501/FinanzasPersonales-PyI-II.git

# 4. Instala dependencias
npm install

# 5. Crea archivo de configuración (opcional)
cp .env.example .env.local
# Edita .env.local con tus configuraciones

# 6. Inicia el servidor de desarrollo
npm run dev
```

### Verificar Setup

```bash
# Verifica que el build funciona
npm run build

# Verifica linting
npm run lint
```

## Proceso de Contribución

### 1. Encuentra o Crea un Issue

- Revisa los [issues existentes](https://github.com/ManuhCardoso1501/FinanzasPersonales-PyI-II/issues)
- Si vas a trabajar en algo nuevo, crea un issue primero
- Espera feedback antes de empezar a codear

### 2. Crea una Rama

```bash
# Asegúrate de estar actualizado
git checkout main
git pull upstream main

# Crea una rama descriptiva
git checkout -b feature/nombre-descriptivo
# o
git checkout -b fix/descripcion-del-bug
```

Convenciones de nombres de ramas:
- `feature/` - Nueva funcionalidad
- `fix/` - Corrección de bugs
- `docs/` - Cambios en documentación
- `refactor/` - Refactorización de código
- `test/` - Añadir o mejorar tests
- `chore/` - Tareas de mantenimiento

### 3. Haz tus Cambios

```bash
# Trabaja en tu código
# Haz commits frecuentes y descriptivos

git add .
git commit -m "tipo: descripción breve del cambio"
```

Tipos de commits (Conventional Commits):
- `feat:` - Nueva característica
- `fix:` - Corrección de bug
- `docs:` - Cambios en documentación
- `style:` - Formateo, espacios, punto y coma
- `refactor:` - Refactorización de código
- `test:` - Añadir o corregir tests
- `chore:` - Tareas de mantenimiento

Ejemplos:
```bash
git commit -m "feat: añadir filtro de fecha en transacciones"
git commit -m "fix: corregir cálculo de balance en dashboard"
git commit -m "docs: actualizar guía de instalación"
git commit -m "refactor: extraer lógica de formato a utilidad"
```

### 4. Mantén tu Rama Actualizada

```bash
# Regularmente sincroniza con upstream
git fetch upstream
git rebase upstream/main

# Si hay conflictos, resuélvelos
# Luego continúa el rebase
git add .
git rebase --continue
```

### 5. Prueba tus Cambios

```bash
# Verifica que el build funciona
npm run build

# Verifica linting
npm run lint

# Prueba manualmente en el navegador
npm run dev
# Navega a http://localhost:3000 y prueba tu feature
```

### 6. Push de tu Rama

```bash
git push origin feature/nombre-descriptivo
```

### 7. Crea un Pull Request

1. Ve a tu fork en GitHub
2. Click en "Compare & pull request"
3. **Título**: Descripción concisa del cambio
4. **Descripción**: Usa la plantilla:

```markdown
## Descripción
Breve descripción de los cambios realizados.

## Tipo de Cambio
- [ ] Bug fix
- [ ] Nueva característica
- [ ] Breaking change
- [ ] Documentación

## ¿Cómo se ha probado?
Describe las pruebas realizadas.

## Checklist
- [ ] Mi código sigue el estilo del proyecto
- [ ] He realizado una auto-revisión
- [ ] He comentado código complejo
- [ ] He actualizado la documentación
- [ ] Mis cambios no generan nuevos warnings
- [ ] He probado que mi fix funciona
- [ ] Los cambios anteriores siguen funcionando
```

5. Vincula el issue relacionado: "Closes #123"
6. Click en "Create pull request"

### 8. Responde a Feedback

- Los revisores pueden pedir cambios
- Haz los cambios solicitados
- Push nuevos commits a tu rama
- El PR se actualizará automáticamente

### 9. Merge

Una vez aprobado:
- Un maintainer hará merge de tu PR
- Tu rama será eliminada automáticamente
- ¡Felicitaciones! 🎉

## Estándares de Código

### TypeScript

```typescript
// ✅ BIEN
interface AccountProps {
  account: Account
  onUpdate: (account: Account) => void
}

export function AccountCard({ account, onUpdate }: AccountProps) {
  return <div>{account.name}</div>
}

// ❌ MAL
export function AccountCard({ account, onUpdate }: any) {
  return <div>{account.name}</div>
}
```

### Nombres Descriptivos

```typescript
// ✅ BIEN
const isAccountArchived = account.is_archived === true
const fetchUserAccounts = async () => { }

// ❌ MAL
const flag = account.is_archived === true
const getData = async () => { }
```

### Funciones Pequeñas

```typescript
// ✅ BIEN - Funciones con responsabilidad única
function calculateBalance(accounts: Account[]): number {
  return accounts.reduce((sum, acc) => sum + acc.balance, 0)
}

function formatBalance(balance: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'USD'
  }).format(balance)
}

// ❌ MAL - Función que hace demasiado
function processAccounts(accounts: Account[]): string {
  const balance = accounts.reduce((sum, acc) => sum + acc.balance, 0)
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'USD'
  }).format(balance)
}
```

### Comentarios Útiles

```typescript
// ✅ BIEN - Comenta el "por qué", no el "qué"
// Usamos setTimeout para evitar race condition con el estado del formulario
setTimeout(() => fetchAccounts(), 0)

// ❌ MAL - Comenta lo obvio
// Suma 1 al contador
counter = counter + 1
```

### Manejo de Errores

```typescript
// ✅ BIEN
try {
  const response = await fetch('/api/accounts')
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  const data = await response.json()
  return data
} catch (error) {
  console.error('Failed to fetch accounts:', error)
  throw error // o manejar apropiadamente
}

// ❌ MAL
const data = await fetch('/api/accounts').then(r => r.json())
```

## Guía de Estilo

### React Components

```tsx
// Orden de elementos en un componente:
export function MyComponent({ prop1, prop2 }: Props) {
  // 1. Hooks
  const [state, setState] = useState()
  const { data } = useCustomHook()
  
  // 2. Efectos
  useEffect(() => {
    // ...
  }, [])
  
  // 3. Handlers
  const handleClick = () => {
    // ...
  }
  
  // 4. Render helpers
  const renderItem = (item) => {
    return <div>{item}</div>
  }
  
  // 5. Return
  return (
    <div>
      {/* JSX */}
    </div>
  )
}
```

### CSS/Tailwind

```tsx
// ✅ BIEN - Orden lógico de clases
<div className="flex items-center justify-between gap-4 p-4 border rounded-lg bg-white">

// Orden sugerido:
// 1. Layout (flex, grid)
// 2. Posicionamiento (items, justify)
// 3. Spacing (gap, p, m)
// 4. Tamaño (w, h)
// 5. Borders (border, rounded)
// 6. Colores (bg, text)
// 7. Tipografía (text, font)
```

### Imports

```typescript
// Orden de imports:
// 1. React y Next
import { useState } from "react"
import { useRouter } from "next/navigation"

// 2. Librerías externas
import { format } from "date-fns"

// 3. Componentes
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

// 4. Utilidades y tipos
import { formatCurrency } from "@/lib/format"
import type { Account } from "@/lib/types"

// 5. Estilos (si aplica)
import styles from "./component.module.css"
```

### Archivos

- Un componente por archivo
- Nombre del archivo = nombre del componente
- Exportación nombrada preferida sobre default

```tsx
// ✅ BIEN - account-card.tsx
export function AccountCard() { }

// ❌ MAL - evitar default exports
export default function AccountCard() { }
```

## Proceso de Revisión

### Para Autores de PR

- Responde a comentarios en 24-48 horas
- Haz cambios solicitados
- No te lo tomes personal - todos estamos aprendiendo
- Si no entiendes un comentario, pregunta

### Para Revisores

- Sé amable y constructivo
- Explica el "por qué" de tus sugerencias
- Aprueba rápido si los cambios son buenos
- Si pides cambios grandes, considera ayudar

### Criterios de Aprobación

Un PR puede ser mergeado cuando:

- ✅ Pasa todas las validaciones (lint, build)
- ✅ Tiene al menos una aprobación
- ✅ Los cambios son relevantes al issue
- ✅ El código sigue los estándares
- ✅ La documentación está actualizada (si aplica)
- ✅ No rompe funcionalidad existente

## Comunidad

### ¿Necesitas Ayuda?

- 💬 [GitHub Discussions](https://github.com/ManuhCardoso1501/FinanzasPersonales-PyI-II/discussions)
- 🐛 [GitHub Issues](https://github.com/ManuhCardoso1501/FinanzasPersonales-PyI-II/issues)
- 📧 Email: [Contactar al equipo]

### Recursos Útiles

- [Documentación del Proyecto](../README.md)
- [Guía para Desarrolladores](DEVELOPER_GUIDE.md)
- [Arquitectura del Sistema](ARCHITECTURE.md)

## Reconocimientos

Todos los contribuidores serán reconocidos en:

- README del proyecto
- Página de releases
- Git history (¡obviamente!)

## Licencia

Al contribuir a este proyecto, aceptas que tus contribuciones serán licenciadas bajo la misma licencia MIT del proyecto.

---

## 🎉 ¡Gracias por Contribuir!

Cada contribución, sin importar cuán pequeña sea, hace de este proyecto algo mejor. ¡Apreciamos tu tiempo y esfuerzo!

**¿Primera vez contribuyendo a un proyecto open source?**
Aquí hay algunos recursos útiles:
- [How to Contribute to Open Source](https://opensource.guide/how-to-contribute/)
- [First Contributions](https://github.com/firstcontributions/first-contributions)
- [GitHub Flow Guide](https://guides.github.com/introduction/flow/)

---

**Última actualización**: Enero 2025
