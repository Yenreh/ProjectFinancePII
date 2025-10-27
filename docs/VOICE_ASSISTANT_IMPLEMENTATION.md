# 🎤 Asistente Financiero con Reconocimiento de Voz - Documentación de Implementación

## 📋 Resumen de Implementación

Se han implementado exitosamente las dos historias de usuario del Sprint 2:

- **HU-001**: Registro por comando de voz
- **HU-002**: Identificación automática de intención

## 🏗️ Arquitectura de la Solución

### Componentes Implementados

1. **Backend (API Routes)**
   - `/api/voice/text-to-speech` - Síntesis de voz usando ElevenLabs
   - `/api/voice/process-command` - Procesamiento de comandos de voz

2. **Servicios**
   - `lib/nlp-service.ts` - Análisis de lenguaje natural (NLP)
   - `lib/voice-types.ts` - Definiciones TypeScript

3. **Frontend (React Components)**
   - `components/voice/voice-assistant.tsx` - Interfaz principal
   - `components/voice/voice-assistant-button.tsx` - Botón flotante
   - `lib/hooks/use-voice-recorder.ts` - Hook para grabación de audio

## 🎯 HU-001: Registro por Comando de Voz

### Criterios de Aceptación ✅

- ✅ El sistema transcribe correctamente el comando
- ✅ Se crea un registro con monto, categoría y descripción
- ✅ Se muestra confirmación visual

### Implementación Técnica

**1. Reconocimiento de Voz (Speech-to-Text)**
- Utiliza **Web Speech API** del navegador (nativa)
- Configuración: español (es-ES)
- Transcripción en tiempo real

**2. Análisis NLP**
El servicio `nlp-service.ts` extrae:
- **Intención**: ingreso o gasto
- **Monto**: expresiones numéricas (ej: "50000", "50.000", "50 mil")
- **Categoría**: mapeo automático de palabras clave
- **Descripción**: texto contextual

**3. Síntesis de Voz (Text-to-Speech)**
- Integración con **ElevenLabs API**
- Modelo: `eleven_multilingual_v2`
- Retroalimentación auditiva para confirmaciones

**4. Flujo de Diálogo**
```
Usuario dice comando → Web Speech API transcribe → 
NLP analiza intención → Sistema confirma (voz + visual) → 
Usuario confirma → Se crea transacción → 
Retroalimentación auditiva
```

### Ejemplos de Comandos Soportados

```javascript
"gasté 50000 pesos en una hamburguesa"
"recibí 1000000 de salario"
"pagué 80000 en transporte"
"compré comida por 35000"
"gasté 150000 en internet"
```

## 🧠 HU-002: Identificación Automática de Intención

### Criterios de Aceptación ✅

- ✅ Se clasifica correctamente según la intención del usuario
- ✅ Prueba con expresiones como "recibí…" o "gasté…"

### Implementación del Motor NLP

**Palabras Clave para Detección de Intención:**

**Ingresos:**
- recibí, recibo, gané, me dieron, me pagaron
- ingresó, ingreso, cobré, cobro, entrada
- deposito, transferencia a favor

**Gastos:**
- gasté, gasto, compré, compro, pagué, pago
- salida, egreso, di, entregué, consumí, invertí

**Mapeo de Categorías:**

| Categoría | Palabras Clave |
|-----------|----------------|
| Alimentos | comida, almuerzo, desayuno, hamburguesa, pizza, restaurante, mercado |
| Transporte | taxi, uber, bus, gasolina, combustible, parqueadero |
| Servicios | luz, agua, internet, teléfono, netflix, spotify |
| Salario | salario, sueldo, pago, nómina, quincena |
| Salud | medicina, doctor, hospital, farmacia |
| Entretenimiento | cine, teatro, concierto, juegos |

### Niveles de Confianza

El sistema calcula un nivel de confianza basado en:

- **Alta** (4-5 puntos): Intención + Monto + Categoría detectados
- **Media** (2-3 puntos): Intención + Monto detectados
- **Baja** (0-1 puntos): Información incompleta

**Puntuación:**
- Intención detectada: +2 puntos
- Monto detectado: +2 puntos
- Categoría detectada: +1 punto

### Validación y Sugerencias

Si falta información, el sistema:
1. Identifica campos faltantes
2. Genera sugerencias contextuales
3. Solicita aclaración mediante voz y texto

**Ejemplo de interacción con información incompleta:**

```
Usuario: "gasté en comida"
Sistema: "Me falta información. monto. 
          Por favor indica el monto. Ejemplo: 'gasté 50000 pesos'"
```

## 🔧 Tecnologías Utilizadas

### Frontend
- **React** (Next.js 14)
- **TypeScript**
- **Web Speech API** (reconocimiento de voz nativo del navegador)
- **Hooks personalizados** (`useVoiceRecorder`)

### Backend
- **Next.js API Routes**
- **ElevenLabs SDK** (`@elevenlabs/elevenlabs-js`)
- **PostgreSQL** (Neon Database)

### Procesamiento NLP
- **Expresiones regulares** para extracción de montos
- **Mapeo de palabras clave** para detección de intenciones
- **Algoritmo de confianza** para validación

## 📦 Instalación y Configuración

### Dependencias Instaladas

```bash
npm install @elevenlabs/elevenlabs-js
```

### Variables de Entorno

```env
ELEVEN_LABS_API_KEY=sk_a58fa91c9c9a1595a037e4798ddae31987c753248ca23569
DATABASE_URL=postgresql://...
```

### Ejecución

```bash
npm run dev
```

Abrir: `http://localhost:3000`

El botón flotante del asistente de voz aparece en la esquina inferior derecha.

## 🧪 Testing

### Tests Manuales

Archivo: `lib/__tests__/nlp-service.test.ts`

Casos de prueba implementados:
1. ✅ Detectar gasto simple
2. ✅ Detectar ingreso de salario
3. ✅ Detectar gasto en transporte
4. ✅ Detectar gasto en servicios
5. ✅ Comando sin categoría clara
6. ✅ Validación de comando completo
7. ✅ Validación con monto faltante
8. ✅ Generar mensaje de confirmación
9. ✅ Generar sugerencias
10. ✅ Extraer montos con puntos separadores

### Casos de Prueba Recomendados

1. **Gastos variados:**
   - "compré una pizza por 35000"
   - "pagué 120000 en gasolina"
   - "gasté 25000 en el supermercado"

2. **Ingresos:**
   - "me pagaron 500000"
   - "cobré 800000 de salario"
   - "recibí dinero por una venta"

3. **Comandos ambiguos:**
   - "gasté en el supermercado" (sin monto)
   - "50 mil pesos" (sin intención ni categoría)

## 🎨 Interfaz de Usuario

### Componente Principal: `VoiceAssistant`

**Estados visuales:**
1. **Idle** (reposo): Botón de micrófono disponible
2. **Recording** (grabando): Botón rojo pulsante
3. **Processing** (procesando): Indicador de carga
4. **Confirmation** (confirmación): Botones Confirmar/Cancelar
5. **Success** (éxito): Mensaje de transacción creada
6. **Speaking** (hablando): Icono de volumen animado

### Botón Flotante

- Posición: esquina inferior derecha
- Icono: micrófono
- Efecto hover: escala 110%
- Shadow: elevado

## 🔄 Flujo de Datos

```
┌─────────────┐
│   Usuario   │
└──────┬──────┘
       │ (habla)
       ▼
┌─────────────────────┐
│ Web Speech API      │
│ (reconocimiento)    │
└──────┬──────────────┘
       │ (transcripción)
       ▼
┌─────────────────────┐
│ NLP Service         │
│ parseVoiceCommand() │
└──────┬──────────────┘
       │ (ParsedCommand)
       ▼
┌─────────────────────┐
│ /api/voice/         │
│ process-command     │
└──────┬──────────────┘
       │ (validación)
       ▼
┌─────────────────────┐
│ Confirmación        │
│ (voz + visual)      │
└──────┬──────────────┘
       │ (usuario confirma)
       ▼
┌─────────────────────┐
│ Base de Datos       │
│ (crear transacción) │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ ElevenLabs TTS      │
│ (retroalimentación) │
└─────────────────────┘
```

## 🐛 Manejo de Errores

### Errores Capturados

1. **Browser no soporta Web Speech API**
   - Mensaje: "Tu navegador no soporta reconocimiento de voz"
   - Sugerencia: Usar Chrome, Edge o Safari

2. **Categoría no encontrada**
   - Mensaje: "No se encontró la categoría '{nombre}'"
   - Acción: Solicitar otra categoría o usar "Otros"

3. **Sin cuentas disponibles**
   - Mensaje: "No hay cuentas disponibles. Por favor crea una cuenta primero."
   - Redirección: Página de cuentas

4. **Error de ElevenLabs**
   - Fallback: Continuar sin síntesis de voz
   - Log: Error en consola

## 📊 Métricas y Validación

### Validación de Comandos

- **Campos requeridos:** tipo, monto, categoría
- **Campos opcionales:** descripción, cuenta

### Confianza del Sistema

- **Alta (≥80%)**: Procesar automáticamente
- **Media (40-79%)**: Solicitar confirmación
- **Baja (<40%)**: Solicitar más información

## 🚀 Próximos Pasos

### Mejoras Potenciales

1. **Contexto de conversación**: Recordar transacciones anteriores
2. **Corrección de errores**: "No, quise decir 60000"
3. **Comandos compuestos**: "gasté 50000 en comida y 30000 en transporte"
4. **Consultas**: "¿cuánto he gastado este mes?"
5. **Configuración de voz**: Seleccionar diferentes voces de ElevenLabs
6. **Idiomas adicionales**: Soporte multilingüe

### Optimizaciones

1. Caché de respuestas de TTS frecuentes
2. Compresión de audio
3. Fallback a Web Speech API para TTS (sin ElevenLabs)
4. Entrenamiento del modelo NLP con más datos

## 📝 Notas Técnicas

### Limitaciones Conocidas

1. **Web Speech API**:
   - Requiere Chrome, Edge o Safari
   - Necesita conexión a internet
   - Precisión variable según acento

2. **ElevenLabs**:
   - Límites de cuota en plan gratuito
   - Latencia de red para TTS

3. **NLP Simple**:
   - Basado en reglas (no machine learning)
   - Puede fallar con expresiones muy coloquiales

### Consideraciones de Seguridad

- Las transcripciones no se almacenan
- Audio temporal se elimina después de procesar
- API key de ElevenLabs en variable de entorno

## ✅ Checklist de Implementación

- ✅ Instalación de dependencias (ElevenLabs SDK)
- ✅ Tipos TypeScript para voz
- ✅ Servicio NLP con detección de intenciones
- ✅ Endpoint para Text-to-Speech
- ✅ Endpoint para procesamiento de comandos
- ✅ Hook de grabación de voz
- ✅ Componente de asistente de voz
- ✅ Botón flotante integrado en dashboard
- ✅ Tests manuales para NLP
- ✅ Documentación completa

## 🎉 Conclusión

Las historias de usuario **HU-001** y **HU-002** han sido implementadas exitosamente. El sistema ahora permite:

1. ✅ Registrar transacciones mediante comandos de voz naturales
2. ✅ Detectar automáticamente la intención (ingreso/gasto)
3. ✅ Extraer monto, categoría y descripción del comando
4. ✅ Confirmar transacciones mediante diálogo por voz
5. ✅ Proporcionar retroalimentación auditiva y visual

El asistente está listo para ser probado y refinado con usuarios reales.
