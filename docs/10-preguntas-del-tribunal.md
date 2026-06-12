# Preguntas previsibles del tribunal

## Producto y alcance

### ¿Cuál es la aportación principal?

La integración de un chatbot local con una agenda real sin confiar al modelo las decisiones críticas. La conversación es flexible, pero la integridad se mantiene mediante servicios deterministas y pruebas.

### ¿Por qué una peluquería?

Es un dominio concreto, comprensible y con reglas verificables: horario, duración, solapes, estados y dos perfiles de usuario. Permite evaluar una solución completa sin depender de un dominio artificial.

### ¿Qué mejora frente a WhatsApp?

WhatsApp mantiene la interpretación y transcripción manual. Aquí la conversación puede terminar en una cita validada y persistida que aparece directamente en el panel.

### ¿Qué no hace el sistema?

No gestiona pagos, recordatorios externos, varios empleados, varias sucursales ni alta disponibilidad. Son evoluciones explícitas, no funcionalidades simuladas.

## Arquitectura

### ¿Por qué Node.js y React?

Permiten utilizar JavaScript en ambos lados, acelerar el desarrollo y separar con claridad interfaz, API y dominio. React facilita el estado del chat y el panel; Express mantiene una API modular.

### ¿Por qué MongoDB?

La cita es un documento autocontenido y el volumen esperado es moderado. Mongoose aporta esquema, validación e índices. Una base SQL también sería válida; MongoDB fue una decisión de adecuación y sencillez local.

### ¿Por qué no microservicios?

El alcance no justifica la complejidad operativa. El monolito modular mantiene fronteras claras y puede evolucionar posteriormente sin introducir de inicio despliegue distribuido, red y consistencia entre servicios.

### ¿Es realmente MVC?

Sí, en el backend existen modelos, controladores y rutas/vistas cliente, con servicios de dominio intermedios para evitar controladores demasiado cargados. En el frontend, las páginas y componentes representan la capa de presentación.

## Chatbot e IA

### ¿Por qué LM Studio?

Permite ejecutar modelos compatibles con la API de OpenAI en local, sin coste por petición y con mayor control de privacidad. Además desacopla el backend de un proveedor externo.

### ¿Qué modelo utiliza?

La configuración de ejemplo usa `meta-llama-3.1-8b-instruct`, pero el nombre es configurable. El diseño depende del contrato de chat compatible, no de un binario concreto.

### ¿Qué ocurre si el modelo alucina?

No puede modificar por sí solo la agenda. Las reservas pasan por catálogo, calendario, horario, duración, solape y persistencia. La respuesta se filtra y las preguntas críticas tienen reglas propias.

### ¿Qué ocurre si LM Studio está apagado?

El sistema entra en modo degradado. Horarios, servicios y flujos deterministas siguen disponibles; las preguntas abiertas reciben una contingencia controlada.

### ¿Cómo evita desviarse?

Con preprocesamiento, detección de preguntas de dominio, rechazo de instrucciones sobre el prompt, historial limitado, prompt específico, temperatura baja y filtrado de salida.

### ¿Puede garantizar que nunca falla?

No. Ningún sistema conversacional puede garantizarlo para cualquier entrada. Sí se puede afirmar que los fallos previsibles están acotados, las operaciones críticas no dependen del modelo y existen 44 pruebas de regresión.

### ¿Por qué Axios?

Es el cliente HTTP empleado tanto por el frontend como por la integración con LM Studio. Facilita configuración de base URL, timeout, cabeceras e interceptores, como el cierre de sesión ante un 401.

## Reglas y datos

### ¿Cómo se detecta un solape?

Dos intervalos se solapan cuando el inicio existente es anterior al nuevo final y el final existente es posterior al nuevo inicio. Se consultan solo estados activos.

### ¿Por qué guardar `startsAt` y `endsAt`?

Porque distintos servicios tienen distinta duración. Guardar el intervalo permite comparar citas correctamente y ordenar por tiempo real.

### ¿Cómo evita que el cliente altere el precio?

El backend ignora cualquier precio aportado y lo recalcula desde el catálogo oficial a partir del servicio.

### ¿Cómo protege una modificación por chat?

La cita conserva un `conversationId`; para modificarla o cancelarla se exige que coincida con la conversación activa.

### ¿Qué pasa con dos reservas simultáneas?

En una instancia, una cola local serializa la comprobación y escritura. En un despliegue distribuido se necesitarían transacciones o un mecanismo de exclusión en base de datos.

### ¿Por qué las fechas usan cadenas y fechas?

`date` y `time` conservan el valor de interfaz; `startsAt` y `endsAt` permiten consultas temporales, ordenación y solapes.

## Seguridad y privacidad

### ¿Cómo se almacenan las contraseñas?

Como hashes bcrypt. La contraseña original no se persiste.

### ¿Cómo funciona la sesión?

El login emite un JWT con caducidad. El frontend lo envía como Bearer token y el middleware protege las rutas de citas.

### ¿Es suficiente para producción?

Es adecuado para el alcance académico y local, pero producción exigiría HTTPS, secreto gestionado, credenciales individuales, rotación, auditoría, copias, políticas RGPD y posiblemente cookies HttpOnly.

### ¿Usar IA local garantiza RGPD?

No por sí solo. Reduce transferencias externas, pero el cumplimiento también requiere información, base jurídica, conservación, derechos, seguridad y procedimientos organizativos.

## Pruebas y evaluación

### ¿Qué significan las 44 pruebas?

Son casos automatizados de dominio y conversación: fechas, horas, servicios, solapes, concurrencia, propiedad de conversación, entradas adversas y contingencias. No son 44 clics manuales.

### ¿Por qué no hay pruebas end-to-end automatizadas?

El riesgo principal se concentra en el dominio y está cubierto en backend. Se realizaron comprobaciones HTTP y visuales manuales. Una evolución razonable sería añadir Playwright y una base de datos efímera.

### ¿Cómo sabes que diseño y código coinciden?

Existe una matriz UC -> endpoint -> módulo -> modelo -> prueba y una auditoría específica en `RUP/99-seguimiento/`.

## Evolución

### ¿Qué implementarías primero?

Notificaciones y recordatorios, porque aportan valor directo y reducen ausencias. Después, agenda multiempleado y despliegue robusto.

### ¿Cómo escalarías?

Separaría configuración y secretos, desplegaría frontend y API, usaría MongoDB gestionado, sustituiría la cola local por control transaccional y añadiría observabilidad. Solo separaría servicios si la carga o los equipos lo justifican.

### ¿Qué has aprendido?

Que integrar IA útil exige diseñar también sus límites. El trabajo principal no es solo el prompt: es decidir qué debe resolver el modelo y qué debe permanecer como lógica verificable.

## Fórmula para responder bien

1. Responde primero en una frase.
2. Explica la decisión.
3. Señala la evidencia en el proyecto.
4. Reconoce el límite si existe.
5. No inventes una funcionalidad durante la respuesta.

[Siguiente: limitaciones y futuro](11-limitaciones-y-lineas-futuras.md) · [Volver al índice](README.md)
