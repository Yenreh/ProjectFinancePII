/**
 * Utilidades para cálculos seguros de balance
 * Previene NaN y errores en operaciones matemáticas con balances de cuentas
 */

import type { TransactionType } from "./types"

/**
 * Convierte un valor a número de forma segura
 * @param value - Valor a convertir (puede ser string, number, o undefined)
 * @param defaultValue - Valor por defecto si la conversión falla (default: 0)
 * @returns Número válido o el valor por defecto
 */
export function safeNumber(value: any, defaultValue: number = 0): number {
  const num = Number(value)
  return isNaN(num) ? defaultValue : num
}

/**
 * Valida que un valor sea un número válido
 * @param value - Valor a validar
 * @param fieldName - Nombre del campo (para mensajes de error)
 * @throws Error si el valor no es un número válido
 */
export function validateNumber(value: any, fieldName: string = "valor"): number {
  const num = Number(value)
  if (isNaN(num)) {
    throw new Error(`${fieldName} no es un número válido: ${value}`)
  }
  return num
}

/**
 * Calcula el nuevo balance después de aplicar una transacción
 * @param currentBalance - Balance actual de la cuenta
 * @param amount - Monto de la transacción
 * @param type - Tipo de transacción (ingreso o gasto)
 * @returns Nuevo balance calculado
 * @throws Error si algún valor no es válido
 */
export function calculateNewBalance(
  currentBalance: any,
  amount: any,
  type: TransactionType
): number {
  const balance = validateNumber(currentBalance, "Balance actual")
  const txAmount = validateNumber(amount, "Monto de transacción")

  if (txAmount < 0) {
    throw new Error("El monto de la transacción no puede ser negativo")
  }

  let newBalance: number
  if (type === "ingreso") {
    newBalance = balance + txAmount
  } else if (type === "gasto") {
    newBalance = balance - txAmount
  } else {
    throw new Error(`Tipo de transacción inválido: ${type}`)
  }

  if (isNaN(newBalance)) {
    throw new Error(
      `Error al calcular balance: ${balance} ${type === "ingreso" ? "+" : "-"} ${txAmount} = NaN`
    )
  }

  return newBalance
}

/**
 * Revierte el efecto de una transacción en el balance
 * Es lo inverso de aplicar la transacción
 * @param currentBalance - Balance actual de la cuenta
 * @param amount - Monto de la transacción original
 * @param type - Tipo de transacción original (ingreso o gasto)
 * @returns Balance revertido
 * @throws Error si algún valor no es válido
 */
export function revertTransactionEffect(
  currentBalance: any,
  amount: any,
  type: TransactionType
): number {
  const balance = validateNumber(currentBalance, "Balance actual")
  const txAmount = validateNumber(amount, "Monto de transacción")

  if (txAmount < 0) {
    throw new Error("El monto de la transacción no puede ser negativo")
  }

  let revertedBalance: number
  if (type === "ingreso") {
    // Si fue un ingreso, lo restamos para revertir
    revertedBalance = balance - txAmount
  } else if (type === "gasto") {
    // Si fue un gasto, lo sumamos para revertir
    revertedBalance = balance + txAmount
  } else {
    throw new Error(`Tipo de transacción inválido: ${type}`)
  }

  if (isNaN(revertedBalance)) {
    throw new Error(
      `Error al revertir balance: ${balance} ${type === "ingreso" ? "-" : "+"} ${txAmount} = NaN`
    )
  }

  return revertedBalance
}

/**
 * Verifica si un balance es válido
 * @param balance - Balance a verificar
 * @returns true si es un número válido, false en caso contrario
 */
export function isValidBalance(balance: any): boolean {
  const num = Number(balance)
  return !isNaN(num) && isFinite(num)
}

/**
 * Formatea un balance para logging
 * @param balance - Balance a formatear
 * @returns String formateado para logging
 */
export function formatBalanceForLog(balance: any): string {
  if (!isValidBalance(balance)) {
    return `INVALID (${balance})`
  }
  const num = Number(balance)
  return num.toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })
}
