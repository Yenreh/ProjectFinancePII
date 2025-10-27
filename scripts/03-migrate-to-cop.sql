-- Script de migración de USD a COP
-- IMPORTANTE: Este script debe ejecutarse UNA SOLA VEZ
-- Convierte todas las cuentas de USD a COP

-- Paso 1: Actualizar moneda de las cuentas
UPDATE accounts 
SET currency = 'COP'
WHERE currency = 'USD';

-- Paso 2: Actualizar balances (multiplicar por tasa aproximada 1 USD = 4000 COP)
-- NOTA: Ajusta la tasa según necesites
UPDATE accounts 
SET balance = balance * 4000
WHERE currency = 'COP' AND balance < 10000;

-- Paso 3: Verificar que todas las cuentas ahora usen COP
SELECT 
  id, 
  name, 
  balance, 
  currency,
  updated_at
FROM accounts
ORDER BY id;

-- Paso 4: Actualizar los montos de transacciones si es necesario
-- NOTA: Solo ejecuta esto si tus transacciones también estaban en USD
-- UPDATE transactions 
-- SET amount = amount * 4000
-- WHERE amount < 10000;
