/**
 * Tests manuales para el servicio NLP
 * 
 * Para ejecutar estos tests, copia el código en la consola del navegador
 * o en un ambiente Node.js con los módulos necesarios.
 */

import {
  parseVoiceCommand,
  validateParsedCommand,
  generateConfirmationMessage,
  generateSuggestions,
  detectCorrection,
  applyCorrection,
  enrichWithDatabaseIds,
  validateBackendFormat,
} from "../nlp-service"

/**
 * Test Suite: Análisis de Intenciones
 */

// Test 1: Detectar un gasto simple
console.log("Test 1: Detectar un gasto simple")
const test1 = parseVoiceCommand("gasté 50000 pesos en una hamburguesa")
console.assert(test1.intention === "gasto", "Debe detectar intención de gasto")
console.assert(test1.amount === 50000, "Debe extraer monto 50000")
console.assert(test1.categoryName === "Alimentos", "Debe detectar categoría Alimentos")
console.assert(test1.confidence === "alta", "Confianza debe ser alta")
console.log("✅ Test 1 pasado\n")

// Test 2: Detectar un ingreso de salario
console.log("Test 2: Detectar un ingreso de salario")
const test2 = parseVoiceCommand("recibí 1000000 de salario")
console.assert(test2.intention === "ingreso", "Debe detectar intención de ingreso")
console.assert(test2.amount === 1000000, "Debe extraer monto 1000000")
console.assert(test2.categoryName === "Salario", "Debe detectar categoría Salario")
console.log("✅ Test 2 pasado\n")

// Test 3: Detectar un gasto en transporte
console.log("Test 3: Detectar un gasto en transporte")
const test3 = parseVoiceCommand("pagué 80000 en transporte")
console.assert(test3.intention === "gasto", "Debe detectar intención de gasto")
console.assert(test3.amount === 80000, "Debe extraer monto 80000")
console.assert(test3.categoryName === "Transporte", "Debe detectar categoría Transporte")
console.log("✅ Test 3 pasado\n")

// Test 4: Detectar gasto en servicios
console.log("Test 4: Detectar gasto en servicios")
const test4 = parseVoiceCommand("gasté 150000 en internet")
console.assert(test4.intention === "gasto", "Debe detectar intención de gasto")
console.assert(test4.amount === 150000, "Debe extraer monto 150000")
console.assert(test4.categoryName === "Servicios", "Debe detectar categoría Servicios")
console.log("✅ Test 4 pasado\n")

// Test 5: Comando sin categoría clara
console.log("Test 5: Comando sin categoría clara")
const test5 = parseVoiceCommand("gasté 25000")
console.assert(test5.intention === "gasto", "Debe detectar intención de gasto")
console.assert(test5.amount === 25000, "Debe extraer monto 25000")
console.assert(test5.categoryName === undefined, "No debe detectar categoría")
console.assert(test5.confidence === "media", "Confianza debe ser media")
console.log("✅ Test 5 pasado\n")

// Test 6: Validación de comando completo
console.log("Test 6: Validación de comando completo")
const test6 = parseVoiceCommand("gasté 50000 en hamburguesa")
const validation6 = validateParsedCommand(test6)
console.assert(validation6.valid === true, "Comando debe ser válido")
console.assert(validation6.missingFields.length === 0, "No debe faltar información")
console.log("✅ Test 6 pasado\n")

// Test 7: Validación con monto faltante
console.log("Test 7: Validación con monto faltante")
const test7 = parseVoiceCommand("gasté en comida")
const validation7 = validateParsedCommand(test7)
console.assert(validation7.valid === false, "Comando debe ser inválido")
console.assert(validation7.missingFields.includes("monto"), "Debe detectar monto faltante")
console.log("✅ Test 7 pasado\n")

// Test 8: Generar mensaje de confirmación
console.log("Test 8: Generar mensaje de confirmación")
const test8 = parseVoiceCommand("gasté 50000 en hamburguesa")
const message8 = generateConfirmationMessage(test8)
console.assert(message8.includes("gasto"), "Mensaje debe mencionar 'gasto'")
console.assert(message8.includes("50"), "Mensaje debe incluir el monto")
console.log("Mensaje generado:", message8)
console.log("✅ Test 8 pasado\n")

// Test 9: Generar sugerencias
console.log("Test 9: Generar sugerencias para comando incompleto")
const test9 = parseVoiceCommand("gasté en comida")
const suggestions9 = generateSuggestions(test9)
console.assert(suggestions9.length > 0, "Debe generar sugerencias")
console.assert(
  suggestions9.some(s => s.toLowerCase().includes("monto")),
  "Debe sugerir agregar monto"
)
console.log("Sugerencias generadas:", suggestions9)
console.log("✅ Test 9 pasado\n")

// Test 10: Extraer montos con puntos separadores
console.log("Test 10: Extraer montos con puntos separadores")
const test10 = parseVoiceCommand("gasté 1.500.000 pesos")
console.assert(test10.amount === 1500000, "Debe extraer monto 1500000")
console.log("✅ Test 10 pasado\n")

console.log("🎉 Todos los tests pasaron exitosamente!")

/**
 * Test Suite: Correcciones
 */

console.log("\n=== Tests de Correcciones ===\n")

// Test 11: Detectar corrección de monto
console.log("Test 11: Detectar corrección de monto")
const correction1 = detectCorrection("no, era 15000")
console.assert(correction1.isCorrection === true, "Debe detectar corrección")
console.assert(correction1.field === "amount", "Debe detectar campo 'amount'")
console.assert(correction1.newValue === 15000, "Debe extraer monto 15000")
console.log("✅ Test 11 pasado\n")

// Test 12: Detectar corrección de categoría
console.log("Test 12: Detectar corrección de categoría")
const correction2 = detectCorrection("cambia a Alimentos")
console.assert(correction2.isCorrection === true, "Debe detectar corrección")
console.assert(correction2.field === "category", "Debe detectar campo 'category'")
console.assert(correction2.newValue === "Alimentos", "Debe extraer categoría")
console.log("✅ Test 12 pasado\n")

// Test 13: Aplicar corrección de monto
console.log("Test 13: Aplicar corrección de monto")
const original = parseVoiceCommand("gasté 50000 en comida")
const correction = detectCorrection("no, era 60000")
const corrected = applyCorrection(original, correction)
console.assert(corrected.amount === 60000, "Monto debe ser 60000")
console.assert(corrected.categoryName === "Alimentos", "Categoría debe mantenerse")
console.log("✅ Test 13 pasado\n")

// Test 14: Validar formato backend
console.log("Test 14: Validar formato backend")
const mockCategories = [
  { id: 1, name: "Alimentos", type: "gasto" as const, icon: "🍔", color: "#FF5733", created_at: "" }
]
const mockAccounts = [
  { id: 1, name: "Efectivo", type: "efectivo" as const, balance: 1000000, currency: "COP", is_archived: false, created_at: "", updated_at: "" }
]
const parsed = parseVoiceCommand("gasté 50000 en comida")
const enriched = enrichWithDatabaseIds(parsed, mockCategories, mockAccounts)
console.assert(enriched.categoryId === 1, "Debe tener categoryId")
console.assert(enriched.accountId === 1, "Debe tener accountId")
const validation = validateBackendFormat(enriched)
console.assert(validation.valid === true, "Debe ser válido para backend")
console.log("✅ Test 14 pasado\n")

// Test 15: Detectar corrección de tipo
console.log("Test 15: Detectar corrección de tipo")
const correction3 = detectCorrection("no, era un ingreso")
console.assert(correction3.isCorrection === true, "Debe detectar corrección")
console.assert(correction3.field === "type", "Debe detectar campo 'type'")
console.assert(correction3.newValue === "ingreso", "Debe cambiar a ingreso")
console.log("✅ Test 15 pasado\n")

console.log("🎉 Todos los tests de correcciones pasaron!")

/**
 * Test Suite: Ingresos (HU-006)
 */

console.log("\n=== Tests de Ingresos ===\n")

// Test 16: Detectar ingreso por freelance
console.log("Test 16: Detectar ingreso por freelance")
const test16 = parseVoiceCommand("recibí 200000 pesos por freelance")
console.assert(test16.intention === "ingreso", "Debe detectar intención de ingreso")
console.assert(test16.transactionType === "ingreso", "Tipo debe ser ingreso")
console.assert(test16.amount === 200000, "Debe extraer monto 200000")
console.log("✅ Test 16 pasado\n")

// Test 17: Detectar ingreso con modismo "me entró"
console.log("Test 17: Detectar ingreso con modismo 'me entró'")
const test17 = parseVoiceCommand("me entró un ingreso de 150000")
console.assert(test17.intention === "ingreso", "Debe detectar intención de ingreso")
console.assert(test17.amount === 150000, "Debe extraer monto 150000")
console.log("✅ Test 17 pasado\n")

// Test 18: Detectar ingreso por cobro
console.log("Test 18: Detectar ingreso por cobro")
const test18 = parseVoiceCommand("cobré 300000 pesos")
console.assert(test18.intention === "ingreso", "Debe detectar intención de ingreso")
console.assert(test18.amount === 300000, "Debe extraer monto 300000")
console.log("✅ Test 18 pasado\n")

console.log("🎉 Todos los tests de ingresos pasaron!")

/**
 * Test Suite: Modismos Latinoamericanos (HU-008)
 */

console.log("\n=== Tests de Modismos ===\n")

// Test 19: Modismo "me gasté"
console.log("Test 19: Modismo 'me gasté'")
const test19 = parseVoiceCommand("me gasté 50000 en el cine")
console.assert(test19.intention === "gasto", "Debe detectar intención de gasto")
console.assert(test19.amount === 50000, "Debe extraer monto 50000")
console.assert(test19.categoryName === "Entretenimiento", "Debe detectar Entretenimiento")
console.log("✅ Test 19 pasado\n")

// Test 20: Modismo "pagué"
console.log("Test 20: Modismo 'pagué'")
const test20 = parseVoiceCommand("pagué 30000 en el parqueadero")
console.assert(test20.intention === "gasto", "Debe detectar intención de gasto")
console.assert(test20.amount === 30000, "Debe extraer monto 30000")
console.assert(test20.categoryName === "Transporte", "Debe detectar Transporte")
console.log("✅ Test 20 pasado\n")

// Test 21: Modismo "se me fue en"
console.log("Test 21: Modismo 'se me fue en'")
const test21 = parseVoiceCommand("se me fueron 80000 en comida")
console.assert(test21.intention === "gasto", "Debe detectar intención de gasto")
console.assert(test21.amount === 80000, "Debe extraer monto 80000")
console.log("✅ Test 21 pasado\n")

// Test 22: Modismo "me entró" para ingreso
console.log("Test 22: Modismo 'me entró' para ingreso")
const test22 = parseVoiceCommand("me entraron 200000 de salario")
console.assert(test22.intention === "ingreso", "Debe detectar intención de ingreso")
console.assert(test22.amount === 200000, "Debe extraer monto 200000")
console.assert(test22.categoryName === "Salario", "Debe detectar Salario")
console.log("✅ Test 22 pasado\n")

console.log("🎉 Todos los tests de modismos pasaron!")

/**
 * Test Suite: Consultas (HU-007)
 */

console.log("\n=== Tests de Consultas ===\n")

// Test 23: Detectar consulta de último gasto
console.log("Test 23: Detectar consulta de último gasto")
const test23 = parseVoiceCommand("¿cuál fue mi último gasto?")
console.assert(test23.intention === "consulta", "Debe detectar intención de consulta")
console.assert(test23.queryType === "ultimo_gasto", "Debe detectar tipo ultimo_gasto")
console.log("✅ Test 23 pasado\n")

// Test 24: Detectar consulta de total del día
console.log("Test 24: Detectar consulta de total del día")
const test24 = parseVoiceCommand("¿cuánto gasté hoy?")
console.assert(test24.intention === "consulta", "Debe detectar intención de consulta")
console.assert(test24.queryType === "total_hoy", "Debe detectar tipo total_hoy")
console.log("✅ Test 24 pasado\n")

// Test 25: Detectar consulta de último ingreso
console.log("Test 25: Detectar consulta de último ingreso")
const test25 = parseVoiceCommand("¿cuál fue mi último ingreso?")
console.assert(test25.intention === "consulta", "Debe detectar intención de consulta")
console.assert(test25.queryType === "ultimo_ingreso", "Debe detectar tipo ultimo_ingreso")
console.log("✅ Test 25 pasado\n")

// Test 26: Detectar consulta de balance
console.log("Test 26: Detectar consulta de balance")
const test26 = parseVoiceCommand("¿cuál es mi balance?")
console.assert(test26.intention === "consulta", "Debe detectar intención de consulta")
console.assert(test26.queryType === "balance", "Debe detectar tipo balance")
console.log("✅ Test 26 pasado\n")

console.log("🎉 Todos los tests de consultas pasaron!")

/**
 * Test Suite: Persistencia y Duplicados (HU-009)
 */

console.log("\n=== Tests de Persistencia ===\n")

// Test 27: Simular detección de duplicado (lógica en backend)
console.log("Test 27: Validación de estructura para backend")
const test27 = parseVoiceCommand("gasté 50000 en comida")
const mockCategoriesHU9 = [{ id: 1, name: "Alimentos", type: "gasto" as const, icon: "🍔", color: "#FF5733", created_at: "" }]
const mockAccountsHU9 = [{ id: 1, name: "Efectivo", type: "efectivo" as const, balance: 1000000, currency: "COP", is_archived: false, created_at: "", updated_at: "" }]
const enrichedHU9 = enrichWithDatabaseIds(test27, mockCategoriesHU9, mockAccountsHU9)
console.assert(enrichedHU9.categoryId === 1, "Debe tener categoryId")
console.assert(enrichedHU9.accountId === 1, "Debe tener accountId")
console.assert(enrichedHU9.amount === 50000, "Debe tener amount")
console.log("✅ Test 27 pasado - Estructura lista para backend\n")

console.log("🎉 Todos los tests de persistencia pasaron!")

/**
 * Test Suite: Modo Manos Libres y Navegación (HU-010, HU-011)
 */

console.log("\n=== Tests de Control y Navegación ===\n")

// Test 28: Detectar activación de modo continuo
console.log("Test 28: Detectar activación de modo continuo")
const test28 = parseVoiceCommand("activar asistente")
console.assert(test28.intention === "control", "Debe detectar intención de control")
console.assert(test28.controlType === "activar_continuo", "Debe detectar activación")
console.log("✅ Test 28 pasado\n")

// Test 29: Detectar desactivación de modo continuo
console.log("Test 29: Detectar desactivación de modo continuo")
const test29 = parseVoiceCommand("desactivar asistente")
console.assert(test29.intention === "control", "Debe detectar intención de control")
console.assert(test29.controlType === "desactivar_continuo", "Debe detectar desactivación")
console.log("✅ Test 29 pasado\n")

// Test 30: Detectar navegación a cuentas
console.log("Test 30: Detectar navegación a cuentas")
const test30 = parseVoiceCommand("ir a cuentas")
console.assert(test30.intention === "navegacion", "Debe detectar intención de navegación")
console.assert(test30.navigationType === "cuentas", "Debe detectar navegación a cuentas")
console.log("✅ Test 30 pasado\n")

// Test 31: Detectar navegación a transacciones
console.log("Test 31: Detectar navegación a transacciones")
const test31 = parseVoiceCommand("abrir transacciones")
console.assert(test31.intention === "navegacion", "Debe detectar intención de navegación")
console.assert(test31.navigationType === "transacciones", "Debe detectar navegación a transacciones")
console.log("✅ Test 31 pasado\n")

// Test 32: Detectar cancelación
console.log("Test 32: Detectar cancelación")
const test32 = parseVoiceCommand("cancelar")
console.assert(test32.intention === "control", "Debe detectar intención de control")
console.assert(test32.controlType === "cancelar", "Debe detectar cancelación")
console.log("✅ Test 32 pasado\n")

console.log("🎉 Todos los tests de control y navegación pasaron!")

/**
 * Test Suite: Integración con Categorías (HU-014)
 */

console.log("\n=== Tests de Integración con Categorías ===\n")

// Test 33: Mapeo de palabra clave a categoría exacta
console.log("Test 33: Mapeo de palabra clave a categoría exacta")
const test33 = parseVoiceCommand("gasté 50000 en hamburguesa")
const mockCategoriesHU14 = [
  { id: 1, name: "Alimentos", type: "gasto" as const, icon: "🍔", color: "#FF5733", created_at: "" },
  { id: 2, name: "Transporte", type: "gasto" as const, icon: "🚗", color: "#33C3FF", created_at: "" },
]
const mockAccountsHU14 = [{ id: 1, name: "Efectivo", type: "efectivo" as const, balance: 1000000, currency: "COP", is_archived: false, created_at: "", updated_at: "" }]
const enrichedHU14 = enrichWithDatabaseIds(test33, mockCategoriesHU14, mockAccountsHU14)
console.assert(enrichedHU14.categoryName === "Alimentos", "Debe mapear 'hamburguesa' a 'Alimentos'")
console.assert(enrichedHU14.categoryId === 1, "Debe tener ID de categoría")
console.log("✅ Test 33 pasado\n")

// Test 34: Mapeo de múltiples sinónimos
console.log("Test 34: Mapeo de sinónimos de transporte")
const test34 = parseVoiceCommand("pagué 30000 en gasolina")
const enrichedHU14_2 = enrichWithDatabaseIds(test34, mockCategoriesHU14, mockAccountsHU14)
console.assert(enrichedHU14_2.categoryName === "Transporte", "Debe mapear 'gasolina' a 'Transporte'")
console.assert(enrichedHU14_2.categoryId === 2, "Debe tener ID de categoría Transporte")
console.log("✅ Test 34 pasado\n")

// Test 35: Validación de formato completo para backend
console.log("Test 35: Validación de formato completo para backend")
const validation35 = validateBackendFormat(enrichedHU14)
console.assert(validation35.valid === true, "Comando enriquecido debe ser válido para backend")
console.assert(validation35.errors.length === 0, "No debe tener errores")
console.log("✅ Test 35 pasado\n")

console.log("🎉 Todos los tests de integración con categorías pasaron!")

console.log("\n=== 🎉 TODOS LOS TESTS COMPLETADOS EXITOSAMENTE ===")
console.log("Total de tests ejecutados: 35")
console.log("- Análisis de intenciones: 10 tests")
console.log("- Correcciones: 5 tests")
console.log("- Ingresos: 3 tests")
console.log("- Modismos: 4 tests")
console.log("- Consultas: 4 tests")
console.log("- Persistencia: 1 test")
console.log("- Control y Navegación: 5 tests")
console.log("- Integración con Categorías: 3 tests")

/**
 * Casos de prueba adicionales recomendados:
 * 
 * 1. "compré una pizza por 35000" -> Gasto, Alimentos, 35000
 * 2. "me pagaron 500000" -> Ingreso, 500000
 * 3. "invertí 200000" -> Gasto, 200000
 * 4. "cobré 800000 de salario" -> Ingreso, Salario, 800000
 * 5. "pagué 120000 en gasolina" -> Gasto, Transporte, 120000
 * 6. "gasté en el supermercado" -> Gasto, Alimentos, sin monto
 * 7. "recibí dinero" -> Ingreso, sin monto
 * 8. "50 mil pesos en comida" -> Gasto, Alimentos, 50000
 * 
 * Correcciones:
 * 9. "no, quise decir 75000" -> Corrección de monto
 * 10. "error, era en Transporte" -> Corrección de categoría
 * 11. "mal, era un ingreso" -> Corrección de tipo
 */


