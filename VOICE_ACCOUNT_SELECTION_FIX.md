# Corrección: Selección de Cuenta y Actualización de Balance

## Problemas Identificados

### Problema 1: Balance No Se Actualiza ⚠️ MEJORADO

**Síntoma:**
Al crear un ingreso de $5.000 por voz, la transacción se guarda pero el balance de la cuenta no se actualiza.

**Análisis:**
El código de actualización existe pero podría estar fallando silenciosamente por:
1. El campo `balance` viene como string desde PostgreSQL
2. No hay manejo de errores explícito
3. No hay suficiente logging para debuggear

**Solución Implementada:**

```typescript
// ANTES (potencial fallo con tipos)
const newBalance = account.balance + parsedData.amount  // ❌ Si balance es string: concatena
await dbQueries.updateAccount(parsedData.accountId, { balance: newBalance })

// DESPUÉS (conversión segura + logging)
const oldBalance = Number(account.balance) || 0  // ✅ Convierte a número
const amount = Number(parsedData.amount) || 0

const newBalance =
  parsedData.transactionType === "ingreso"
    ? oldBalance + amount
    : oldBalance - amount

console.log(`[Voice] Actualizando balance: Cuenta=${parsedData.accountId} (${account.name}), Balance anterior=${oldBalance} (${typeof account.balance}), Monto=${amount}, Nuevo balance=${newBalance}`)

try {
  const updatedAccount = await dbQueries.updateAccount(parsedData.accountId, { balance: newBalance })
  console.log(`[Voice] Balance actualizado exitosamente. Balance en DB: ${updatedAccount.balance}`)
} catch (error) {
  console.error(`[Voice] ERROR actualizando balance:`, error)
  throw error
}
```

**Logs para Debug:**
Ahora al crear una transacción verás en la consola del servidor:
```
[Voice] Transacción creada: ID=123, Tipo=ingreso, Monto=5000, Cuenta=1
[Voice] Actualizando balance: Cuenta=1 (Nu), Balance anterior=100000 (string), Monto=5000, Nuevo balance=105000
[Voice] Balance actualizado exitosamente. Balance en DB: 105000
```

---

### Problema 2: Falta Preguntar la Cuenta con Múltiples Cuentas ✅ RESUELTO

**Síntoma:**
Cuando el usuario tiene múltiples cuentas (Nu, Bancolombia) y dice `"recibí 5000 por ventas"` sin especificar la cuenta, el sistema asigna automáticamente la primera cuenta sin preguntar.

**Comportamiento Esperado:**
El sistema debe preguntar: `"¿En cuál cuenta quieres registrar esta transacción? Nu, Bancolombia"` y esperar que el usuario especifique.

**Solución Implementada:**

#### 1. Detección de Cuenta en el Comando

Agregadas palabras clave para detectar cuentas específicas:

```typescript
// ANTES (muy básico)
const ACCOUNT_MAPPINGS: Record<string, string[]> = {
  Efectivo: ["efectivo", "cash", "plata"],
  Banco: ["banco", "cuenta", "ahorros"],
  Tarjeta: ["tarjeta", "crédito", "débito"],
}

// DESPUÉS (cuentas específicas)
const ACCOUNT_MAPPINGS: Record<string, string[]> = {
  Efectivo: ["efectivo", "cash", "plata", "en efectivo"],
  Banco: ["banco", "cuenta", "ahorros", "bancolombia", "davivienda", "nequi"],
  Tarjeta: ["tarjeta", "crédito", "débito", "visa", "mastercard"],
  Nu: ["nu", "en nu", "cuenta nu"],
  Bancolombia: ["bancolombia", "en bancolombia"],
  Nequi: ["nequi", "en nequi"],
}
```

**Ejemplos de uso:**
- `"recibí 5000 en nu"` → detecta cuenta "Nu"
- `"gasté 10000 en bancolombia"` → detecta cuenta "Bancolombia"
- `"recibí 5000 por ventas"` → no detecta cuenta (pedirá confirmación)

#### 2. Asignación Inteligente de Cuenta

```typescript
// ANTES (siempre asigna la primera cuenta)
if (!enriched.accountId && accounts.length > 0) {
  enriched.accountId = accounts[0].id  // ❌ No pregunta
  enriched.accountName = accounts[0].name
}

// DESPUÉS (solo asigna si hay UNA sola cuenta)
if (!enriched.accountId && accounts.length === 1) {
  enriched.accountId = accounts[0].id  // ✅ Solo si hay una
  enriched.accountName = accounts[0].name
}
// Si hay múltiples cuentas, NO asignar (forzará pregunta)
```

#### 3. Validación y Pregunta por Cuenta

Agregada lógica en el procesador de comandos:

```typescript
// NUEVO: Preguntar cuenta si hay múltiples y no se especificó
if (parsed.transactionType && !parsed.accountId && accounts.length > 1) {
  const accountsList = accounts.map(a => a.name).join(", ")
  
  return {
    success: false,
    message: `Tienes ${accounts.length} cuentas: ${accountsList}. ¿En cuál cuenta quieres registrar esta transacción?`,
    parsedCommand: parsed,
    needsConfirmation: false,
    suggestions: accounts.map(a => `en ${a.name.toLowerCase()}`),
  }
}
```

**Flujo Completo:**

```
Usuario: "recibí 5000 por ventas"
Sistema: "Tienes 2 cuentas: Nu, Bancolombia. ¿En cuál cuenta quieres registrar esta transacción?"
         Sugerencias: ["en nu", "en bancolombia"]

Usuario: "en nu"
Sistema: "Voy a registrar un ingreso de $5.000 pesos en la categoría Ventas en la cuenta Nu. ¿Es correcto?"

Usuario: "confirmar"
Sistema: "¡Listo! Tu ingreso de $5.000 pesos fue guardado en la cuenta Nu."
```

---

## Casos de Uso

### Caso 1: Una Sola Cuenta (Asignación Automática)

```
Cuentas: [Nu]

Usuario: "recibí 5000 por ventas"
Sistema: "Voy a registrar un ingreso de $5.000 en Ventas en la cuenta Nu. ¿Es correcto?"
✅ Asigna automáticamente a Nu (única cuenta)
```

### Caso 2: Múltiples Cuentas SIN Especificar (Pregunta)

```
Cuentas: [Nu, Bancolombia]

Usuario: "recibí 5000 por ventas"
Sistema: "Tienes 2 cuentas: Nu, Bancolombia. ¿En cuál cuenta?"
✅ Pregunta antes de continuar
```

### Caso 3: Múltiples Cuentas CON Especificación (Directo)

```
Cuentas: [Nu, Bancolombia]

Usuario: "recibí 5000 por ventas en nu"
Sistema: "Voy a registrar un ingreso de $5.000 en Ventas en la cuenta Nu. ¿Es correcto?"
✅ Detecta "nu" y asigna directamente
```

### Caso 4: Corrección de Cuenta

```
Usuario: "recibí 5000 por ventas"
Sistema: "¿En cuál cuenta? Nu, Bancolombia"

Usuario: "en bancolombia"
Sistema: "Voy a registrar un ingreso de $5.000 en Ventas en Bancolombia. ¿Es correcto?"
✅ Procesa la respuesta y actualiza la cuenta
```

---

## Mejoras en Detección de Cuentas

### Búsqueda Flexible

```typescript
// 1. Match exacto
"en nu" → cuenta "Nu" ✅

// 2. Match por keywords
"en bancolombia" → cuenta "Bancolombia" ✅ (via ACCOUNT_MAPPINGS)

// 3. Match parcial
"en banco" → cuenta "Bancolombia" ✅ (coincidencia parcial)

// 4. Case insensitive
"en NU" → cuenta "Nu" ✅
"en BancoLombia" → cuenta "Bancolombia" ✅
```

**Código de búsqueda mejorado:**

```typescript
// Primero: Match exacto
let account = accounts.find(a => 
  a.name.toLowerCase() === accountName?.toLowerCase()
)

// Segundo: Match por keywords
if (!account) {
  for (const [accountKey, keywords] of Object.entries(ACCOUNT_MAPPINGS)) {
    if (keywords.some(k => k.toLowerCase() === accountName?.toLowerCase())) {
      account = accounts.find(a => 
        a.name.toLowerCase() === accountKey.toLowerCase()
      )
      break
    }
  }
}

// Tercero: Match parcial
if (!account) {
  account = accounts.find(a => 
    a.name.toLowerCase().includes(accountName?.toLowerCase() || '') ||
    accountName?.toLowerCase().includes(a.name.toLowerCase())
  )
}
```

---

## Archivos Modificados

### 1. `app/api/voice/process-command/route.ts`

**Cambios:**

1. **Validación de cuenta múltiple (NUEVO):**
   ```typescript
   if (parsed.transactionType && !parsed.accountId && accounts.length > 1) {
     // Preguntar por cuenta
   }
   ```

2. **Conversión segura de balance:**
   ```typescript
   const oldBalance = Number(account.balance) || 0
   const amount = Number(parsedData.amount) || 0
   ```

3. **Logging mejorado:**
   ```typescript
   console.log(`[Voice] Actualizando balance: Cuenta=${parsedData.accountId} (${account.name})...`)
   ```

4. **Manejo de errores explícito:**
   ```typescript
   try {
     const updatedAccount = await dbQueries.updateAccount(...)
   } catch (error) {
     console.error(`[Voice] ERROR:`, error)
     throw error
   }
   ```

### 2. `lib/nlp-service.ts`

**Cambios:**

1. **Palabras clave extendidas:**
   - Agregadas cuentas específicas: Nu, Bancolombia, Nequi
   - Variaciones: "en nu", "cuenta nu", "en bancolombia"

2. **Lógica de asignación modificada:**
   ```typescript
   // Solo asignar si hay UNA cuenta
   if (!enriched.accountId && accounts.length === 1) {
     enriched.accountId = accounts[0].id
   }
   // Si hay múltiples, NO asignar (forzar pregunta)
   ```

3. **Búsqueda flexible de cuentas:**
   - Match exacto
   - Match por keywords
   - Match parcial

---

## Testing

### Tests Automatizados

```bash
npx tsx lib/__tests__/nlp-service.test.ts
```
✅ **37/37 tests pasando**

### Tests Manuales

**Test 1: Detección de cuenta específica**
```javascript
parseVoiceCommand("recibí 5000 en nu")
// → accountName: "Nu" ✅
```

**Test 2: Múltiples cuentas sin especificar**
```javascript
// Con cuentas: [Nu, Bancolombia]
parseVoiceCommand("recibí 5000 por ventas")
// → accountId: undefined ✅ (forzará pregunta)
```

**Test 3: Una sola cuenta (automático)**
```javascript
// Con cuentas: [Nu]
parseVoiceCommand("recibí 5000 por ventas")
// → accountId: 1 ✅ (asigna Nu automáticamente)
```

---

## Verificación del Balance

Para verificar que el balance se actualiza correctamente:

1. **Iniciar el servidor:**
   ```bash
   npm run dev
   ```

2. **Crear una transacción por voz**

3. **Verificar logs en la consola del servidor:**
   ```
   [Voice] Transacción creada: ID=X, Tipo=ingreso, Monto=5000, Cuenta=1
   [Voice] Actualizando balance: Cuenta=1 (Nu), Balance anterior=100000 (number), Monto=5000, Nuevo balance=105000
   [Voice] Balance actualizado exitosamente. Balance en DB: 105000
   ```

4. **Verificar en la UI:**
   - El balance de la cuenta debe cambiar inmediatamente
   - El Balance Total debe recalcularse

5. **Si NO se actualiza:**
   - Revisar los logs del servidor
   - Verificar que el tipo de `balance` en logs (debería ser "number")
   - Verificar que el nuevo balance se calculó correctamente
   - Verificar que NO hay errores en el catch

---

## Escenarios de Error y Soluciones

### Error 1: Balance sigue igual

**Posible causa:** Balance viene como string desde DB

**Solución implementada:** Conversión con `Number(account.balance) || 0`

**Verificación:** 
```
[Voice] Balance anterior=100000 (string) ← PROBLEMA
[Voice] Balance anterior=100000 (number) ← CORRECTO
```

### Error 2: No pregunta por cuenta

**Posible causa:** Se asigna automáticamente la primera cuenta

**Solución implementada:** Solo asignar si `accounts.length === 1`

**Verificación:**
```javascript
// Con 2 cuentas:
if (!accountId && accounts.length === 1) {  // false
  // NO ejecuta, cuenta queda undefined ✅
}
```

### Error 3: No detecta nombre de cuenta

**Posible causa:** Cuenta no está en ACCOUNT_MAPPINGS

**Solución:** Agregar la cuenta a `ACCOUNT_MAPPINGS`:
```typescript
const ACCOUNT_MAPPINGS = {
  // ...
  MiCuenta: ["mi cuenta", "en mi cuenta", "micuenta"],
}
```

---

## Mejoras Futuras

1. **Memoria de última cuenta usada:**
   ```typescript
   // Recordar la última cuenta usada por el usuario
   localStorage.setItem('lastAccountUsed', accountId)
   
   // Sugerir en futuras transacciones
   "La última vez usaste Nu. ¿Quieres usar la misma cuenta?"
   ```

2. **Cuenta por categoría:**
   ```typescript
   // Configuración de cuenta preferida por categoría
   "Salario" → siempre a Bancolombia
   "Efectivo" → siempre a cuenta Efectivo
   ```

3. **Confirmación rápida:**
   ```typescript
   // Detectar respuesta corta
   Usuario: "nu"  // en lugar de "en nu"
   Sistema: ✅ Entiende que se refiere a la cuenta Nu
   ```

4. **Validación de cuenta antes de confirmar:**
   ```typescript
   // Verificar que la cuenta sigue existiendo
   if (account.is_archived) {
     return "La cuenta Nu está archivada. ¿Quieres usar otra cuenta?"
   }
   ```

---

## Conclusión

✅ **Balance:** Ahora se convierte correctamente a número antes de calcular  
✅ **Pregunta por cuenta:** Implementado cuando hay múltiples cuentas  
✅ **Detección mejorada:** Soporta nombres específicos (Nu, Bancolombia)  
✅ **Logging:** Agregado para debugging del balance  
✅ **Tests:** 37/37 pasando  

**Próximo paso:** Iniciar el servidor y probar con comandos de voz reales para verificar que el balance se actualiza correctamente con los nuevos logs.
