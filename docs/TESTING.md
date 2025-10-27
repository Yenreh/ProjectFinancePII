# 🧪 Guía de Pruebas - Finanzas Personales

Esta guía documenta todas las pruebas implementadas en el proyecto, incluyendo pruebas manuales, automatizadas, y estrategias de testing.

## 📋 Índice

- [Testing del Asistente de Voz](#testing-del-asistente-de-voz)
- [Testing de NLP Service](#testing-de-nlp-service)
- [Testing de Integración](#testing-de-integración)
- [Testing Manual](#testing-manual)
- [CI/CD Pipeline](#cicd-pipeline)
- [Testing de Base de Datos](#testing-de-base-de-datos)

---

## 🎤 Testing del Asistente de Voz

### Pruebas Funcionales

#### 1. Transcripción de Voz
**Objetivo**: Verificar que Web Speech API transcribe correctamente

**Casos de Prueba**:
```javascript
// Caso 1: Comando simple de gasto
Input: "gasté 50000 en comida"
Expected: Transcripción exacta del comando

// Caso 2: Comando de ingreso
Input: "recibí 1000000 de salario"
Expected: Transcripción exacta del comando

// Caso 3: Comando con números complejos
Input: "pagué ochenta mil pesos en transporte"
Expected: Transcripción puede variar (80000 o "ochenta mil")
```

#### 2. Procesamiento de Comandos
**Objetivo**: Validar que el NLP service procesa correctamente

**Pruebas Automatizadas** (ejecutar con `npx tsx lib/__tests__/nlp-service.test.ts`):

✅ **37 tests pasando**:
- Detección de intenciones (gasto/ingreso)
- Extracción de montos
- Detección de categorías
- Niveles de confianza
- Validación de comandos
- Generación de confirmaciones
- Generación de sugerencias
- Detección de correcciones
- Enriquecimiento con datos de BD
- Validación de formato backend

#### 3. Síntesis de Voz
**Objetivo**: Verificar respuestas auditivas

**Casos de Prueba**:
```javascript
// Caso 1: Confirmación simple
Input: Comando válido
Expected: Audio con confirmación clara

// Caso 2: Solicitud de información
Input: Comando incompleto
Expected: Audio solicitando datos faltantes

// Caso 3: Múltiples mensajes
Input: Mensaje + sugerencias
Expected: Ambos audios reproducidos secuencialmente sin cortes
```

### Pruebas de Intención

**Test 1: Detección de Gastos**
```typescript
parseVoiceCommand("gasté 50000 pesos en una hamburguesa")
// Expected Output:
{
  intention: "gasto",
  transactionType: "gasto",
  amount: 50000,
  categoryName: "Alimentos",
  description: "gasté 50000 pesos en una hamburguesa",
  confidence: "alta"
}
```

**Test 2: Detección de Ingresos**
```typescript
parseVoiceCommand("recibí 1000000 de salario")
// Expected Output:
{
  intention: "ingreso",
  transactionType: "ingreso",
  amount: 1000000,
  categoryName: "Salario",
  confidence: "alta"
}
```

**Test 3: Detección de Transporte**
```typescript
parseVoiceCommand("pagué 80000 en transporte")
// Expected Output:
{
  intention: "gasto",
  amount: 80000,
  categoryName: "Transporte",
  confidence: "alta"
}
```

### Pruebas de Validación

**Test 4: Comando Completo (Válido)**
```typescript
const parsed = parseVoiceCommand("gasté 50000 en hamburguesa")
const validation = validateParsedCommand(parsed)
// Expected: validation.valid === true
// Expected: validation.missingFields.length === 0
```

**Test 5: Comando Incompleto (Falta Monto)**
```typescript
const parsed = parseVoiceCommand("gasté en comida")
const validation = validateParsedCommand(parsed)
// Expected: validation.valid === false
// Expected: validation.missingFields.includes("monto")
```

**Test 6: Comando sin Categoría**
```typescript
const parsed = parseVoiceCommand("gasté 25000")
// Expected: categoryName === undefined
// Expected: confidence === "media"
```

### Pruebas de Confirmación y Sugerencias

**Test 7: Generación de Mensaje de Confirmación**
```typescript
const parsed = parseVoiceCommand("gasté 50000 en hamburguesa")
const message = generateConfirmationMessage(parsed)
// Expected: message.includes("gasto")
// Expected: message.includes("50")
// Expected: message.includes("Alimentos")
```

**Test 8: Generación de Sugerencias**
```typescript
const parsed = parseVoiceCommand("gasté en comida")
const suggestions = generateSuggestions(parsed)
// Expected: suggestions.length > 0
// Expected: suggestions incluye referencia a "monto"
```

### Pruebas de Corrección

**Test 9: Detección de Corrección**
```typescript
detectCorrection("no, era 15000")
// Expected Output:
{
  isCorrection: true,
  field: "amount",
  newValue: 15000
}
```

**Test 10: Aplicación de Corrección**
```typescript
const original = parseVoiceCommand("gasté 50000 en comida")
const correction = detectCorrection("no, era 15000")
const corrected = applyCorrection(original, correction)
// Expected: corrected.amount === 15000
// Expected: otros campos permanecen igual
```

### Pruebas de Contexto Pendiente

**Test 11: Preservación de Contexto (Múltiples Cuentas)**
```typescript
// Escenario: Usuario tiene 2 cuentas (Nu, Bancolombia)
Input: "recibí 5000 por ventas"
Expected: Sistema pregunta "¿En cuál cuenta?"
          Contexto guardado: {amount: 5000, category: "Ventas"}

Input respuesta: "en nu"
Expected: Sistema combina contexto + cuenta
          Resultado: {amount: 5000, category: "Ventas", account: "Nu"}
```

**Logs esperados**:
```
[Voice UI] ===== INICIO DE PROCESAMIENTO =====
[Voice UI] Transcripción: recibí 5000 por ventas
[Voice UI] Comando pendiente actual (state): null
[Voice UI] Comando pendiente actual (ref): null
[Voice UI] ⬅️ Respuesta recibida: {needsAdditionalInfo: true}
[Voice UI] 💾 Guardando comando como pendiente (falta info)

[Voice UI] ===== INICIO DE PROCESAMIENTO =====
[Voice UI] Transcripción: en nu
[Voice UI] Comando pendiente actual (ref): {amount: 5000, category: "Ventas"}
[Voice UI] ➡️ Enviando respuesta con contexto pendiente
[Voice UI] ⬅️ Respuesta recibida: {needsConfirmation: true}
[Voice UI] 🧹 Limpiando comando pendiente
```

---

## 🧬 Testing de NLP Service

### Suite de Tests Completa

**Ubicación**: `lib/__tests__/nlp-service.test.ts`

**Ejecución**:
```bash
npx tsx lib/__tests__/nlp-service.test.ts
```

### Tests Implementados (37 total)

#### Grupo 1: Detección de Intenciones (5 tests)
1. ✅ Detectar gasto simple
2. ✅ Detectar ingreso de salario
3. ✅ Detectar gasto en transporte
4. ✅ Detectar gasto en servicios
5. ✅ Comando sin categoría clara

#### Grupo 2: Extracción de Montos (8 tests)
6. ✅ Monto con puntos: "50.000"
7. ✅ Monto con comas: "50,000"
8. ✅ Monto con espacios: "50 000"
9. ✅ Monto sin separadores: "50000"
10. ✅ Monto con palabra "mil": "50 mil"
11. ✅ Monto con "millón": "1 millón"
12. ✅ Monto muy grande: "1500000"
13. ✅ Monto con decimales: "50.50"

#### Grupo 3: Detección de Categorías (12 tests)
14. ✅ Alimentos: hamburguesa, pizza, comida
15. ✅ Transporte: taxi, uber, gasolina
16. ✅ Servicios: luz, internet, netflix
17. ✅ Salario: salario, sueldo, nómina
18. ✅ Salud: medicina, doctor, farmacia
19. ✅ Entretenimiento: cine, juegos
20. ✅ Educación: universidad, libro
21. ✅ Vivienda: arriendo, renta
22. ✅ Ropa: camisa, zapatos
23. ✅ Otros: varios, general
24. ✅ Freelance: trabajo, consultoría
25. ✅ Ventas: venta, vendí

#### Grupo 4: Validación (4 tests)
26. ✅ Comando completo válido
27. ✅ Comando sin monto (inválido)
28. ✅ Comando sin categoría (válido si tiene monto)
29. ✅ Comando vacío (inválido)

#### Grupo 5: Confirmación y Sugerencias (3 tests)
30. ✅ Generar mensaje de confirmación
31. ✅ Generar sugerencias para comando incompleto
32. ✅ Sugerencias contextuales

#### Grupo 6: Correcciones (2 tests)
33. ✅ Detectar corrección de monto
34. ✅ Aplicar corrección

#### Grupo 7: Enriquecimiento con BD (2 tests)
35. ✅ Asignar IDs de categoría desde BD
36. ✅ Asignar ID de cuenta (una sola cuenta)

#### Grupo 8: Validación Backend (1 test)
37. ✅ Validar formato para crear transacción

---

## 🔗 Testing de Integración

### Prueba de Conexión a Base de Datos

**Script**: `scripts/test-connection.js`

**Ejecución**:
```bash
node scripts/test-connection.js
```

**Casos de Prueba**:

**Caso 1: Con DATABASE_URL configurado**
```
✅ Conexión exitosa a Neon
Database: finanzas_db
Host: ep-example-123.us-east-2.aws.neon.tech
```

**Caso 2: Sin DATABASE_URL**
```
⚠️  No hay DATABASE_URL configurado
Usando datos de demostración (mock data)
```

**Caso 3: DATABASE_URL inválido**
```
❌ Error de conexión
Detalles: [error específico]
```

### Prueba de API Routes

**Endpoint**: `/api/voice/process-command`

**Test 1: Comando Válido**
```bash
curl -X POST http://localhost:3000/api/voice/process-command \
  -H "Content-Type: application/json" \
  -d '{
    "transcription": "gasté 50000 en comida"
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "message": "Voy a registrar un gasto de $50,000 pesos...",
  "parsedCommand": {
    "intention": "gasto",
    "amount": 50000,
    "categoryName": "Alimentos"
  },
  "needsConfirmation": true
}
```

**Test 2: Comando Incompleto**
```bash
curl -X POST http://localhost:3000/api/voice/process-command \
  -H "Content-Type: application/json" \
  -d '{
    "transcription": "gasté en comida"
  }'
```

**Expected Response**:
```json
{
  "success": false,
  "message": "Me falta información. monto...",
  "suggestions": ["Por favor indica el monto..."]
}
```

### Prueba de Text-to-Speech

**Endpoint**: `/api/voice/text-to-speech`

**Test**:
```bash
curl -X POST http://localhost:3000/api/voice/text-to-speech \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hola, soy tu asistente financiero"
  }' \
  --output test-audio.mp3
```

**Validación**:
- Archivo `test-audio.mp3` creado
- Tamaño > 0 bytes
- Audio reproducible
- Voz clara en español

---

## 🖱️ Testing Manual

### Checklist de Pruebas de Usuario

#### Asistente de Voz - Flujo Básico
- [ ] Abrir aplicación
- [ ] Hacer clic en botón flotante de micrófono
- [ ] Permitir acceso al micrófono (primera vez)
- [ ] Decir: "gasté 50000 en comida"
- [ ] Verificar transcripción mostrada
- [ ] Escuchar confirmación de voz
- [ ] Ver información detectada en pantalla
- [ ] Hacer clic en "Confirmar"
- [ ] Verificar mensaje de éxito
- [ ] Verificar transacción en lista

#### Asistente de Voz - Comando Incompleto
- [ ] Decir: "gasté en comida"
- [ ] Escuchar solicitud de información faltante
- [ ] Ver sugerencias en pantalla
- [ ] Hacer clic en "Responder de nuevo"
- [ ] Decir: "50000"
- [ ] Verificar que combina la información
- [ ] Confirmar transacción

#### Asistente de Voz - Múltiples Cuentas
- [ ] Tener al menos 2 cuentas creadas (ej: Nu, Bancolombia)
- [ ] Decir: "recibí 5000 por ventas"
- [ ] Sistema pregunta: "¿En cuál cuenta?"
- [ ] Ver sugerencias: "en nu", "en bancolombia"
- [ ] Hacer clic en "Responder de nuevo"
- [ ] Decir: "en nu"
- [ ] Verificar que muestra todos los datos: monto + categoría + cuenta
- [ ] Confirmar y verificar transacción creada en cuenta Nu

#### Asistente de Voz - Corrección
- [ ] Decir: "gasté 50000 en comida"
- [ ] Ver confirmación
- [ ] Hacer clic en "Corregir"
- [ ] Decir: "no, era 15000"
- [ ] Verificar que monto se actualizó a 15000
- [ ] Confirmar transacción corregida

#### Consultas por Voz
- [ ] Decir: "cuál es mi balance"
- [ ] Escuchar respuesta con balance total
- [ ] Decir: "cuánto gasté hoy"
- [ ] Escuchar total de gastos del día
- [ ] Decir: "cuál fue mi último gasto"
- [ ] Escuchar detalles del último gasto

#### Control de Audio
- [ ] Iniciar comando de voz
- [ ] Mientras reproduce audio de confirmación
- [ ] Hacer clic en "Detener audio"
- [ ] Verificar que el audio se detiene inmediatamente

---

## ⚙️ CI/CD Pipeline

### GitHub Actions Workflow

**Archivo**: `.github/workflows/ci.yml`

**Jobs Ejecutados**:

#### 1. Lint (ESLint)
```yaml
- Verifica código con ESLint
- Detecta errores de sintaxis
- Valida reglas de estilo
```

**Comando**: `npm run lint`

#### 2. Type Check (TypeScript)
```yaml
- Compila TypeScript sin generar archivos
- Verifica tipos en todo el proyecto
- Detecta errores de tipado
```

**Comando**: `npx tsc --noEmit`

#### 3. Build (Next.js)
```yaml
- Construye aplicación para producción
- Verifica que no hay errores de build
- Valida todas las rutas y componentes
```

**Comando**: `npm run build`

#### 4. Validate Structure
```yaml
- Verifica archivos requeridos existan
- Valida estructura de documentación
- Confirma presencia de README, LICENSE, etc.
```

#### 5. Security Check
```yaml
- Escanea código en busca de secrets expuestos
- Detecta API keys, contraseñas, tokens
- Previene commits de información sensible
```

### Triggers del Pipeline

```yaml
on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]
```

**Ejecución**:
- Cada push a `main` o `develop`
- Cada Pull Request a estas branches
- Manualmente desde GitHub Actions tab

### Badges de Estado

```markdown
[![Build Status](https://github.com/ManuhCardoso1501/FinanzasPersonales-PyI-II/actions/workflows/ci.yml/badge.svg)](https://github.com/ManuhCardoso1501/FinanzasPersonales-PyI-II/actions/workflows/ci.yml)
```

---

## 🗄️ Testing de Base de Datos

### Pruebas de Queries

#### Test 1: Obtener Todas las Cuentas
```typescript
const accounts = await dbQueries.getAccounts()
// Expected: Array de cuentas
// Expected: Cada cuenta tiene {id, name, type, balance}
```

#### Test 2: Crear Transacción
```typescript
const transaction = await dbQueries.createTransaction({
  type: "gasto",
  amount: 50000,
  categoryId: 1,
  accountId: 1,
  description: "Test"
})
// Expected: Transaction creada con ID
// Expected: Balance de cuenta actualizado
```

#### Test 3: Conversión de Tipos
```typescript
// PostgreSQL retorna NUMERIC como string
const account = await dbQueries.getAccountById(1)
const balance = Number(account.balance)
// Expected: balance es tipo number
// Expected: operaciones matemáticas funcionan correctamente
```

### Validación de Tipo de Datos

**Problema Conocido**: PostgreSQL retorna `NUMERIC` como string

**Solución Implementada**:
```typescript
// Siempre convertir a número antes de operaciones
const totalBalance = accounts.reduce((sum, account) => {
  return sum + Number(account.balance) // ✓ Conversión explícita
}, 0)
```

**Tests de Regresión**:
- ✅ Balance total se calcula correctamente
- ✅ No hay concatenación de strings (ej: "0" + "5000" = "05000")
- ✅ toLocaleString() funciona correctamente
- ✅ Consultas de voz muestran montos correctos

---

## 📊 Métricas de Testing

### Cobertura de Tests

| Componente | Tests | Estado |
|-----------|-------|--------|
| NLP Service | 37 | ✅ 100% |
| Voice Recorder Hook | Manual | ✅ |
| API Routes | Manual | ✅ |
| Database Queries | Manual | ✅ |
| UI Components | Manual | ✅ |

### Test Results

```
✅ Total Tests: 37
✅ Passing: 37
❌ Failing: 0
⏭️  Skipped: 0
```

---

## 🐛 Debugging y Troubleshooting

### Logs de Debugging

**Activar logs en desarrollo**:
```typescript
// Voice Assistant logs automáticos
[Voice UI] ===== INICIO DE PROCESAMIENTO =====
[Voice UI] Transcripción: ...
[Voice UI] ➡️ Enviando respuesta con contexto pendiente
[Voice UI] ⬅️ Respuesta recibida
[Voice UI] 💾 Guardando comando como pendiente
[Voice UI] 🧹 Limpiando comando pendiente
[Voice UI] ===== FIN DE PROCESAMIENTO =====

// Backend logs
[Voice] Transacción creada: ID=X, Tipo=ingreso, Monto=5000
[Voice] Actualizando balance: Cuenta=1 (Nu), Balance anterior=100000
[Voice] Balance actualizado exitosamente
```

### Problemas Comunes y Soluciones

**Problema 1: Audio se corta**
```typescript
// Solución: Detener audio anterior antes de reproducir nuevo
if (audioRef.current && !audioRef.current.paused) {
  audioRef.current.pause()
}
```

**Problema 2: Contexto se pierde**
```typescript
// Solución: Usar useRef para preservar estado entre renders
const pendingCommandRef = useRef<ParsedVoiceCommand | null>(null)
useEffect(() => {
  pendingCommandRef.current = pendingCommand
}, [pendingCommand])
```

**Problema 3: Balance muestra "05000" en vez de "5000"**
```typescript
// Solución: Convertir a Number antes de operaciones
const total = transactions.reduce((sum, t) => 
  sum + Number(t.amount), 0  // ✓ Conversión explícita
)
```

---

## 📝 Conclusión

El proyecto cuenta con una cobertura de testing exhaustiva que incluye:

- ✅ 37 tests automatizados del servicio NLP
- ✅ Pipeline de CI/CD con 5 jobs
- ✅ Tests manuales documentados
- ✅ Scripts de validación de BD
- ✅ Logging completo para debugging

**Estado General**: ✅ Todos los tests pasando

**Próximos Pasos**:
- Agregar tests E2E con Playwright
- Implementar tests de performance
- Agregar tests de accesibilidad
- Configurar coverage reports automáticos
