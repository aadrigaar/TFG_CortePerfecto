# Calidad, seguridad y pruebas

## 1. Estrategia de calidad

La calidad se aborda en tres capas:

1. **Prevención:** validaciones, arquitectura modular y fuente única de verdad.
2. **Detección:** pruebas automatizadas y build de producción.
3. **Contención:** errores controlados y degradación sin confirmaciones falsas.

## 2. Comando de verificación

```bash
npm run verify
```

Equivale a:

```bash
npm run check --prefix backend
npm run test --prefix backend
npm run build --prefix frontend
```

Estado verificado:

| Comprobación | Resultado |
| --- | --- |
| Sintaxis backend | Correcta |
| Pruebas automatizadas | 44/44 superadas |
| Build frontend | Correcto |

## 3. Distribución de pruebas

### `appointmentService.test.js`

- Crea citas válidas.
- Rechaza fin de semana.
- Rechaza horario no permitido.
- Rechaza nombres inválidos.
- Evita solapes.
- Permite completar y eliminar.
- Sincroniza el catálogo.
- Protege modificaciones por conversación.
- Serializa intentos simultáneos sobre el mismo hueco.

### `bookingFlowService.test.js`

- Solicita nombre real.
- Acepta servicios por número.
- Bloquea fines de semana antes de pedir hora.
- Rechaza fechas pasadas.
- Distingue servicio, fecha y hora.
- Gestiona cambios de opción.
- Respeta negaciones.
- Valida números fuera de catálogo.
- Interpreta respuestas cortas.
- Comprende minutos hablados.
- Mantiene correctamente mes y día.
- Reinicia una reserva nueva.
- No reutiliza datos antiguos tras una corrección incompleta.
- Separa nombre y servicio en una frase.
- No cancela por una pregunta o negación.
- No reutiliza una fecha u hora inválida.

### `calendarService.test.js`

- Identifica fines de semana.
- Formatea fechas estables.
- Interpreta horas naturales en español.

### `chatHardening.test.js`

- Sanea y limita peticiones.
- Rechaza mensajes vacíos o largos.
- Resuelve preguntas frecuentes sin IA.
- Bloquea solicitudes de prompt.
- Construye contingencias.
- Respeta cambios de preferencia.
- Elimina ruido técnico de respuestas.

## 4. Reglas protegidas

| Riesgo | Control |
| --- | --- |
| Reserva pasada | Comparación con hora actual de Madrid |
| Fin de semana | Rechazo explícito |
| Servicio fuera de catálogo | Resolución centralizada |
| Hora fuera de apertura | Validación por minutos |
| Servicio que termina después del cierre | Cálculo de `endsAt` |
| Dos citas superpuestas | Consulta de intervalos |
| Carrera entre dos escrituras locales | Cola de escritura |
| Cambio de cita ajena | `conversationId` esperado |
| Confirmación falsa | Persistencia antes de responder |
| Doble envío de UI | Bloqueo síncrono en el widget |

## 5. Seguridad

### Autenticación y autorización

- Contraseñas almacenadas como hash bcrypt.
- JWT con caducidad configurable.
- Middleware para todas las rutas de citas.
- Cierre local de sesión ante HTTP 401.
- Protección de rutas también en el frontend.

### Seguridad HTTP

- `helmet()` añade cabeceras defensivas.
- CORS restringe orígenes configurados.
- El chat tiene límite de 25 peticiones por minuto.
- El cuerpo JSON está limitado a 1 MB.
- Los errores internos no exponen stack en producción.

### Validación de entrada

- Mongoose valida estructura y enumeraciones.
- Los servicios recalculan precio y duración.
- Los identificadores se validan.
- Mensaje e historial se sanean.
- Las notas tienen longitud máxima.

### Configuración

El backend impide arrancar en `NODE_ENV=production` con el secreto JWT de ejemplo. Los archivos `.env` están ignorados por Git.

## 6. Privacidad

LM Studio permite que la inferencia se realice en el equipo local. MongoDB también está configurado localmente por defecto. Esto reduce la transferencia a terceros, aunque un despliegue real debe completar:

- Información y base jurídica del tratamiento.
- Política de conservación.
- Gestión de derechos.
- Copias de seguridad.
- Control de acceso operativo.

La ejecución local es una decisión técnica favorable a la privacidad, pero no sustituye por sí sola el cumplimiento organizativo del RGPD.

## 7. Concurrencia

La aplicación serializa las escrituras de citas dentro del proceso de Node.js. Esta medida evita que dos peticiones simultáneas pasen a la vez la comprobación de disponibilidad en una única instancia.

Límite reconocido: con varias instancias de backend haría falta reforzar la exclusión mediante transacciones, bloqueo distribuido o un diseño de slots únicos en base de datos.

## 8. Observabilidad

- Morgan registra peticiones en desarrollo.
- `/api/health` separa estado de API y MongoDB.
- `/api/health/lmstudio` comprueba la IA de manera independiente.
- Los errores usan códigos de dominio.

Para producción podrían añadirse métricas, logs estructurados, trazas y alertas.

## 9. Evidencias manuales realizadas

Además de las pruebas:

- Reserva completa por API.
- Cancelación autorizada y denegada entre conversaciones.
- Respuesta determinista.
- Respuesta degradada sin LM Studio.
- Rechazo de mensaje superior a 1.200 caracteres.
- Chat comprobado en escritorio y móvil.
- Ausencia de desbordamiento horizontal en viewport móvil.

## 10. Criterio de aceptación

Una versión está lista para demostrar cuando:

1. `npm run verify` termina con éxito.
2. MongoDB figura como conectado.
3. El catálogo devuelve siete opciones.
4. El administrador puede iniciar sesión.
5. Una reserva válida aparece en el panel.
6. Una reserva inválida es rechazada sin crear datos.
7. La caída de LM Studio no bloquea los flujos deterministas.

[Siguiente: memoria y trazabilidad](07-memoria-y-trazabilidad.md) · [Volver al índice](README.md)
