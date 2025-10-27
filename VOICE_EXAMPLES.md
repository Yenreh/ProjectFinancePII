# 🎯 Ejemplos Prácticos - Asistente de Voz

## Escenarios de Uso Real

### Escenario 1: Compra de Alimentos
**Usuario dice**: "gasté 50000 pesos en una hamburguesa"

**Proceso**:
1. 🎤 Sistema transcribe: "gasté 50000 pesos en una hamburguesa"
2. 🧠 NLP detecta:
   - Intención: **gasto**
   - Monto: **50000**
   - Categoría: **Alimentos** (palabra clave: "hamburguesa")
   - Descripción: "hamburguesa"
   - Confianza: **Alta**

3. 🔊 Sistema responde (voz):  
   _"Voy a registrar un gasto de $50.000 pesos en la categoría Alimentos con la descripción: 'hamburguesa'. ¿Es correcto?"_

4. ✅ Usuario confirma → Transacción creada
5. 🔊 Sistema confirma (voz):  
   _"Transacción registrada exitosamente. Gasto de $50.000 en Alimentos."_

---

### Escenario 2: Pago de Salario
**Usuario dice**: "recibí 1000000 de salario"

**Proceso**:
1. 🎤 Transcripción: "recibí 1000000 de salario"
2. 🧠 NLP detecta:
   - Intención: **ingreso**
   - Monto: **1000000**
   - Categoría: **Salario**
   - Confianza: **Alta**

3. 🔊 Confirmación:  
   _"Voy a registrar un ingreso de $1.000.000 pesos en la categoría Salario. ¿Es correcto?"_

4. ✅ Confirmar → Ingreso registrado

---

### Escenario 3: Gasto en Transporte
**Usuario dice**: "pagué 80000 en transporte"

**Proceso**:
1. 🎤 Transcripción: "pagué 80000 en transporte"
2. 🧠 Detección:
   - Intención: **gasto**
   - Monto: **80000**
   - Categoría: **Transporte**

3. ✅ Registro exitoso

---

### Escenario 4: Comando Incompleto
**Usuario dice**: "gasté en comida"

**Proceso**:
1. 🎤 Transcripción: "gasté en comida"
2. 🧠 Detección:
   - Intención: **gasto**
   - Monto: **undefined** ❌
   - Categoría: **Alimentos**
   - Confianza: **Baja**

3. ⚠️ Sistema responde:  
   _"Me falta información: monto. Por favor indica el monto. Ejemplo: 'gasté 50000 pesos'"_

4. 🎤 Usuario dice: "50000"
5. 🧠 Sistema actualiza y confirma

---

### Escenario 5: Monto con Separadores
**Usuario dice**: "gasté 1.500.000 pesos en internet"

**Proceso**:
1. 🎤 Transcripción: "gasté 1.500.000 pesos en internet"
2. 🧠 Detección:
   - Intención: **gasto**
   - Monto: **1500000** (normalizado)
   - Categoría: **Servicios** (palabra clave: "internet")

3. ✅ Registro exitoso: $1.500.000 en Servicios

---

## Variaciones de Comandos Válidos

### Para Gastos

```
✅ "gasté 50000 en comida"
✅ "compré una pizza por 35000"
✅ "pagué 120000 en gasolina"
✅ "di 80000 para el taxi"
✅ "consumí 25000 en el restaurante"
✅ "gasté 150000 pesos en internet"
✅ "pagué 200000 de la tarjeta"
```

### Para Ingresos

```
✅ "recibí 1000000 de salario"
✅ "me pagaron 500000"
✅ "cobré 800000"
✅ "gané 300000"
✅ "me dieron 150000"
✅ "vendí algo por 200000"
```

---

## Casos Especiales

### Caso 1: Sin Categoría Explícita
**Usuario**: "gasté 25000"

**Sistema**: Detecta monto pero no categoría  
**Acción**: Solicita categoría o asigna "Otros"

### Caso 2: Expresiones Coloquiales
**Usuario**: "compré una hamburguesota por 60 mil"

**Sistema**: 
- Monto: 60000 (interpreta "60 mil")
- Categoría: Alimentos ("hamburguesota" → "hamburguesa")

### Caso 3: Múltiples Números
**Usuario**: "gasté 50000 pesos comprando 2 pizzas"

**Sistema**: Toma el primer número válido (50000)

---

## Comandos NO Soportados (actualmente)

### ❌ Comandos Múltiples
```
"gasté 50000 en comida y 30000 en transporte"
```
**Razón**: Solo procesa una transacción por comando

### ❌ Consultas
```
"¿cuánto he gastado este mes?"
```
**Razón**: Intención de consulta detectada pero no implementada

### ❌ Correcciones
```
"no, quise decir 60000"
```
**Razón**: No hay contexto de conversación

### ❌ Ediciones
```
"cambia el monto a 70000"
```
**Razón**: Solo crea transacciones nuevas

---

## Tips para Mejores Resultados

### ✅ DO (Hacer)

1. **Hablar claramente**
   - "gasté 50000 en hamburguesa" ✅

2. **Usar palabras clave**
   - Para gastos: "gasté", "pagué", "compré"
   - Para ingresos: "recibí", "cobré", "gané"

3. **Mencionar categoría**
   - "gasté 50000 en comida" ✅
   - "pagué 80000 en transporte" ✅

4. **Incluir el monto**
   - "gasté 50000" ✅
   - No: "gasté en comida" ❌

### ❌ DON'T (Evitar)

1. **Frases ambiguas**
   - "hice un gasto" ❌
   - "gasté algo" ❌

2. **Sin monto**
   - "compré comida" ❌ (falta monto)

3. **Demasiado rápido**
   - Hablar muy rápido dificulta la transcripción

4. **Mucho ruido de fondo**
   - Puede interferir con el reconocimiento

---

## Flujo de Usuario Completo

```
1. Usuario abre la app
   ↓
2. Clic en botón flotante de micrófono
   ↓
3. Aparece modal del asistente
   ↓
4. Clic en botón de grabar (micrófono verde)
   ↓
5. Hablar comando: "gasté 50000 en comida"
   ↓
6. Clic en botón de detener (rojo)
   ↓
7. Sistema procesa (spinner de carga)
   ↓
8. Muestra transcripción y datos detectados
   ↓
9. Reproduce confirmación por voz
   ↓
10. Usuario ve botones: Confirmar / Cancelar
    ↓
11. Clic en "Confirmar"
    ↓
12. Sistema crea transacción
    ↓
13. Reproduce mensaje de éxito
    ↓
14. Muestra botón "Hacer otra transacción"
    ↓
15. Dashboard se actualiza automáticamente
```

---

## Debugging de Comandos

### Si el sistema no entiende tu comando:

1. **Revisa la transcripción**
   - ¿Está correcta?
   - Si no → Habla más claro

2. **Verifica la detección**
   - ¿Detectó el monto?
   - ¿Detectó la categoría?
   - ¿Detectó la intención?

3. **Ajusta el comando**
   - Agrega palabras clave más explícitas
   - Usa números sin separadores
   - Menciona la categoría directamente

### Ejemplo de corrección:

**❌ No funciona bien**: "di plata para comer"
- Monto no detectado
- Categoría ambigua

**✅ Funciona mejor**: "gasté 30000 en comida"
- Monto: 30000
- Categoría: Alimentos
- Intención: gasto

---

## Resumen de Comandos Más Comunes

| Comando | Intención | Monto | Categoría |
|---------|-----------|-------|-----------|
| "gasté 50000 en comida" | Gasto | 50000 | Alimentos |
| "recibí 1000000 de salario" | Ingreso | 1000000 | Salario |
| "pagué 80000 en transporte" | Gasto | 80000 | Transporte |
| "gasté 150000 en internet" | Gasto | 150000 | Servicios |
| "compré medicina por 60000" | Gasto | 60000 | Salud |
| "cobré 500000" | Ingreso | 500000 | - |

---

## 🎓 Aprendizaje del Sistema

El sistema mejorará con el tiempo al:
1. Agregar más palabras clave basadas en uso real
2. Refinar categorías según feedback
3. Mejorar detección de montos coloquiales
4. Expandir el vocabulario de intenciones

**¡Usa el asistente y ayuda a mejorar el sistema con tus comentarios!** 🚀
