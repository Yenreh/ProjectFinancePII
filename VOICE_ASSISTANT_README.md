# 🎤 Asistente de Voz - Guía Rápida

## 🚀 Cómo Usar

1. **Abrir la aplicación**: `http://localhost:3000`
2. **Buscar el botón flotante** con el icono de micrófono (esquina inferior derecha)
3. **Presionar el botón** para activar el asistente
4. **Hablar claramente** un comando como:
   - "gasté 50000 pesos en una hamburguesa"
   - "recibí 1000000 de salario"
   - "pagué 80000 en transporte"

5. **Esperar la confirmación** (el sistema leerá lo que entendió)
6. **Confirmar o cancelar** la transacción

## 📝 Ejemplos de Comandos

### Gastos
```
"gasté 50000 en comida"
"compré una pizza por 35000"
"pagué 120000 en gasolina"
"gasté 150000 en internet"
```

### Ingresos
```
"recibí 1000000 de salario"
"me pagaron 500000"
"cobré 800000"
"vendí algo por 200000"
```

## ✨ Características

- ✅ Reconocimiento de voz en español
- ✅ Detección automática de intención (ingreso/gasto)
- ✅ Extracción de monto y categoría
- ✅ Confirmación por voz (síntesis de voz)
- ✅ Interfaz visual intuitiva
- ✅ Validación inteligente

## 🎯 Categorías Soportadas

| Categoría | Palabras Clave |
|-----------|----------------|
| **Alimentos** | comida, hamburguesa, pizza, restaurante, mercado |
| **Transporte** | taxi, uber, bus, gasolina, transporte |
| **Servicios** | luz, agua, internet, teléfono, netflix |
| **Salario** | salario, sueldo, pago, nómina |
| **Salud** | medicina, doctor, farmacia |
| **Entretenimiento** | cine, teatro, concierto |

## ⚙️ Requisitos

- **Navegador**: Chrome, Edge o Safari (con Web Speech API)
- **Conexión a internet** (para síntesis de voz)
- **Micrófono** habilitado

## 🔧 Troubleshooting

### "Tu navegador no soporta reconocimiento de voz"
- Usar Chrome, Edge o Safari
- Verificar permisos de micrófono

### No escucha mi voz
- Verificar que el micrófono esté conectado
- Permitir acceso al micrófono cuando lo solicite
- Hablar cerca del micrófono

### No detecta bien el comando
- Hablar claramente y despacio
- Usar frases completas (ej: "gasté X pesos en Y")
- Incluir palabras clave (gasté, recibí, pagué)

## 📚 Más Información

Ver documentación completa: `docs/VOICE_ASSISTANT_IMPLEMENTATION.md`
