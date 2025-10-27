# Corrección del Cálculo de Balance de Cuentas

## Problema Identificado

El sistema no estaba actualizando correctamente el balance de las cuentas cuando se realizaban operaciones CRUD sobre las transacciones a través del formulario manual (endpoints `/api/transactions`). 

Solo se actualizaba el balance cuando se creaban transacciones por voz (endpoint `/api/voice/process-command`).

## Solución Implementada

### 1. Creación de Transacciones (`POST /api/transactions`)

**Archivo**: `app/api/transactions/route.ts`

**Cambios**:
- Ahora obtiene la cuenta asociada antes de crear la transacción
- Calcula el nuevo balance:
  - **Ingreso**: `balance_actual + monto`
  - **Gasto**: `balance_actual - monto`
- Actualiza el balance de la cuenta automáticamente

```typescript
// Obtener la cuenta para calcular el nuevo balance
const accounts = await dbQueries.getAccounts(true)
const account = accounts.find(a => a.id === newTransactionData.account_id)

// Crear la transacción
newTransaction = await dbQueries.createTransaction(newTransactionData)

// Calcular el nuevo balance
const newBalance = newTransactionData.type === "ingreso"
  ? account.balance + newTransactionData.amount
  : account.balance - newTransactionData.amount

// Actualizar el balance de la cuenta
await dbQueries.updateAccount(newTransactionData.account_id, { balance: newBalance })
```

### 2. Actualización de Transacciones (`PATCH /api/transactions/[id]`)

**Archivo**: `app/api/transactions/[id]/route.ts`

**Cambios**:
- Obtiene la transacción original antes de actualizarla
- Revierte el efecto de la transacción original en la cuenta
- Aplica el efecto de la transacción actualizada
- Maneja el caso cuando se cambia la cuenta de la transacción

**Proceso**:
1. Obtener transacción original
2. Revertir efecto en cuenta original:
   - Si era ingreso: `balance - monto_original`
   - Si era gasto: `balance + monto_original`
3. Actualizar la transacción
4. Aplicar nuevo efecto:
   - Si cambió de cuenta: actualizar ambas cuentas
   - Si es la misma cuenta: aplicar el nuevo efecto

```typescript
// Revertir el efecto de la transacción original
let accountBalance = originalAccount.balance
if (originalTransaction.type === "ingreso") {
  accountBalance -= originalTransaction.amount
} else {
  accountBalance += originalTransaction.amount
}

// Actualizar transacción
updatedTransaction = await dbQueries.updateTransaction(transactionId, body)

// Aplicar el efecto de la transacción actualizada
const finalBalance = newType === "ingreso"
  ? accountBalance + newAmount
  : accountBalance - newAmount

await dbQueries.updateAccount(accountId, { balance: finalBalance })
```

### 3. Eliminación de Transacciones (`DELETE /api/transactions/[id]`)

**Archivo**: `app/api/transactions/[id]/route.ts`

**Cambios**:
- Obtiene la transacción antes de eliminarla
- Revierte su efecto en la cuenta
- Elimina la transacción

```typescript
// Obtener la transacción antes de eliminarla
const transaction = transactions.find(t => t.id === transactionId)

// Revertir el efecto en el balance
const newBalance = transaction.type === "ingreso"
  ? account.balance - transaction.amount
  : account.balance + transaction.amount

// Actualizar el balance
await dbQueries.updateAccount(transaction.account_id, { balance: newBalance })

// Eliminar la transacción
await dbQueries.deleteTransaction(transactionId)
```

## Fórmulas de Cálculo

### Balance de Cuenta

El balance de una cuenta se calcula considerando todas sus transacciones:

```
Balance = Balance_Inicial + ΣIngresos - ΣGastos
```

### Al Crear Transacción

```typescript
if (tipo === "ingreso") {
  nuevo_balance = balance_actual + monto
} else { // gasto
  nuevo_balance = balance_actual - monto
}
```

### Al Actualizar Transacción

```typescript
// 1. Revertir efecto original
if (tipo_original === "ingreso") {
  balance_temp = balance_actual - monto_original
} else {
  balance_temp = balance_actual + monto_original
}

// 2. Aplicar nuevo efecto
if (tipo_nuevo === "ingreso") {
  nuevo_balance = balance_temp + monto_nuevo
} else {
  nuevo_balance = balance_temp - monto_nuevo
}
```

### Al Eliminar Transacción

```typescript
if (tipo === "ingreso") {
  nuevo_balance = balance_actual - monto
} else {
  nuevo_balance = balance_actual + monto
}
```

## Casos Especiales Manejados

### 1. Cambio de Cuenta en Actualización
Cuando se actualiza una transacción y se cambia la cuenta asociada:
- Se revierte el efecto en la cuenta original
- Se aplica el efecto en la cuenta nueva

### 2. Cambio de Tipo (Ingreso ↔ Gasto)
Cuando se actualiza una transacción cambiando el tipo:
- Se revierte el efecto del tipo original
- Se aplica el efecto del tipo nuevo

### 3. Cambio de Monto
Cuando solo se actualiza el monto:
- Se revierte el efecto del monto original
- Se aplica el efecto del monto nuevo

## Validaciones

### Creación
- Verifica que la cuenta exista antes de crear la transacción
- Retorna error 404 si la cuenta no existe

### Actualización
- Verifica que la transacción original exista
- Verifica que la cuenta original exista
- Si se cambia la cuenta, verifica que la nueva cuenta exista
- Retorna error 404 si alguna entidad no existe

### Eliminación
- Verifica que la transacción exista
- Verifica que la cuenta asociada exista
- Retorna error 404 si alguna entidad no existe

## Consistencia con Voz

El cálculo de balance ahora es consistente entre:
- ✅ Transacciones creadas por voz (`/api/voice/process-command`)
- ✅ Transacciones creadas manualmente (`POST /api/transactions`)
- ✅ Transacciones actualizadas (`PATCH /api/transactions/[id]`)
- ✅ Transacciones eliminadas (`DELETE /api/transactions/[id]`)

## Impacto en el Dashboard

El dashboard (`/api/dashboard/metrics`) calcula el balance total sumando el balance de todas las cuentas activas:

```typescript
SELECT COALESCE(SUM(balance), 0) as total_balance
FROM accounts 
WHERE is_archived = false
```

Con estos cambios, el balance total mostrado en el dashboard siempre reflejará correctamente todas las transacciones registradas, sin importar el método usado para crearlas.

## Testing Recomendado

Para verificar que el balance se calcula correctamente:

1. **Crear transacción de ingreso**: Verificar que el balance aumenta
2. **Crear transacción de gasto**: Verificar que el balance disminuye
3. **Actualizar monto**: Verificar que el balance se ajusta correctamente
4. **Cambiar tipo**: Verificar que se revierte y aplica correctamente
5. **Cambiar cuenta**: Verificar que ambas cuentas se actualizan
6. **Eliminar transacción**: Verificar que el balance se revierte
7. **Dashboard**: Verificar que el balance total es correcto

## Archivos Modificados

- ✅ `app/api/transactions/route.ts` - POST endpoint
- ✅ `app/api/transactions/[id]/route.ts` - PATCH y DELETE endpoints

## Consideraciones Futuras

### Transacciones en Lote
Si se implementan transacciones en lote, considerar usar transacciones SQL para asegurar atomicidad:

```sql
BEGIN;
  INSERT INTO transactions ...;
  UPDATE accounts SET balance = ... WHERE id = ...;
COMMIT;
```

### Historial de Balance
Para auditoría, se podría agregar una tabla de historial de balance:

```sql
CREATE TABLE balance_history (
  id SERIAL PRIMARY KEY,
  account_id INTEGER REFERENCES accounts(id),
  transaction_id INTEGER REFERENCES transactions(id),
  balance_before NUMERIC(18,2),
  balance_after NUMERIC(18,2),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Validación de Balance Negativo
Dependiendo de los requisitos de negocio, se podría prevenir que cuentas de tipo "efectivo" o "débito" tengan balance negativo.
