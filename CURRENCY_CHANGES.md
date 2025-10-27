# Cambios de Moneda: USD → COP

Este documento resume todos los cambios realizados para convertir el sistema de dólares (USD) a pesos colombianos (COP).

## Archivos Modificados

### 1. `lib/format.ts`
- **Cambio**: Default de `formatCurrency()` cambiado de "USD" a "COP"
- **Cambio**: Locale cambiado de "es-ES" a "es-CO"
- **Cambio**: Decimales cambiados de 2 a 0 (pesos no usan decimales normalmente)

### 2. `scripts/01-create-tables.sql`
- **Cambio**: Campo `currency` en tabla `accounts` ahora usa DEFAULT 'COP' en lugar de 'USD'

### 3. `lib/mock-data.ts`
- **Cambio**: Todas las cuentas mock ahora usan `currency: "COP"`
- **Cambio**: Montos actualizados a escala de pesos colombianos:
  - Efectivo: 500 USD → 500,000 COP
  - Banco Principal: 5,000 USD → 5,000,000 COP
  - Tarjeta de Crédito: -1,200 USD → -1,200,000 COP
  - Transacciones también escaladas proporcionalmente

### 4. `app/api/accounts/route.ts`
- **Cambio**: Default de `currency` en POST cambiado de "USD" a "COP"

### 5. `components/accounts/account-form-dialog.tsx`
- **Cambio**: Estado inicial de `formData.currency` cambiado de "USD" a "COP"
- **Cambio**: Reset del formulario ahora usa "COP" como default
- **Cambio**: Agregado "COP - Peso Colombiano" como primera opción en el selector de moneda

### 6. `lib/nlp-service.ts`
- **Corrección**: `CATEGORY_MAPPINGS` actualizado con nombres correctos de la BD:
  - "Alimentos" → "Alimentación"
  - "Otros" → "Otros Gastos" / "Otros Ingresos"
  - Agregadas categorías faltantes: "Vivienda", "Compras", "Freelance", "Inversiones"
- Los mensajes con `toLocaleString("es-CO")` ya estaban correctos

### 7. `lib/__tests__/nlp-service.test.ts`
- **Cambio**: Test 33 actualizado para usar "Alimentación" en lugar de "Alimentos"

## Formato de Moneda

### Antes (USD)
```typescript
formatCurrency(1200.50) // → "$1,200.50"
```

### Ahora (COP)
```typescript
formatCurrency(1200000) // → "$1.200.000"
```

## Verificación de Categorías

Las categorías en `CATEGORY_MAPPINGS` ahora coinciden exactamente con las de la base de datos:

### Gastos
- ✅ Alimentación (antes "Alimentos")
- ✅ Transporte
- ✅ Vivienda (agregada)
- ✅ Servicios
- ✅ Entretenimiento
- ✅ Salud
- ✅ Educación
- ✅ Compras (agregada)
- ✅ Otros Gastos (antes "Otros")

### Ingresos
- ✅ Salario
- ✅ Freelance (agregada)
- ✅ Inversiones (agregada)
- ✅ Ventas
- ✅ Otros Ingresos (agregada)

## Notas Importantes

1. **Migración de Datos**: Si hay datos existentes en la base de datos, necesitan ser migrados manualmente. Las cuentas existentes con `currency = 'USD'` deben actualizarse.

2. **Escala de Montos**: La conversión aproximada usada fue 1 USD = 1,000 COP para los datos de ejemplo.

3. **Formato de Visualización**: El sistema usa `Intl.NumberFormat("es-CO")` que formatea los números con puntos como separadores de miles (ej: $1.200.000).

4. **Compatibilidad**: El sistema sigue aceptando cuentas con diferentes monedas a través del campo `account.currency`, pero el default es ahora COP.

## Bug Corregido

**Problema**: El screenshot mostraba "Falta el ID de la categoría" al decir "gasté 50000 en una hamburguesa"

**Causa**: El mapeo de categorías usaba "Alimentos" pero la base de datos tiene "Alimentación"

**Solución**: Actualizado `CATEGORY_MAPPINGS` para usar los nombres exactos de la base de datos y agregadas todas las categorías faltantes.
