[Anterior: Capítulo 4](04-implementacion-mapa-solucion.md) · [Índice de capítulos](README.md) · [Siguiente: Referencias](06-referencias.md)

---

# Capítulo 5. Conclusiones y líneas futuras

El último capítulo valora el resultado obtenido. A diferencia del Capítulo 1, centrado en presentar el problema, este capítulo contrasta la hipótesis y los objetivos con la evidencia generada durante el desarrollo. También recoge las decisiones que han funcionado, las limitaciones razonables de una primera versión y las líneas de continuidad que permitirían evolucionar la plataforma.

## 5.1 Cumplimiento del objetivo general

El objetivo general era diseñar e implementar una plataforma web de gestión de reservas para Corte Perfecto que automatizara la atención al cliente mediante un asistente conversacional local, persistiera las reservas en MongoDB y proporcionara una interfaz de administración. El resultado cumple ese objetivo: existe una web pública funcional, un chatbot conectado a LM Studio, una API Express con reglas de negocio, una base de datos MongoDB y un panel privado para el peluquero.

<table style="width:96%;">
<colgroup>
<col style="width: 96%" />
</colgroup>
<thead>
<tr>
<th style="text-align: left;"><p><strong>Conclusión principal</strong></p>
<p>La hipótesis de partida se considera validada dentro del alcance del TFG: una peluquería pequeña puede automatizar parte de su reserva de citas con IA local, sin enviar datos personales a proveedores externos de inferencia y sin pagar por cada conversación.</p></th>
</tr>
</thead>
<tbody>
</tbody>
</table>

## 5.2 Cumplimiento de objetivos específicos

| **Objetivo** | **Evidencia de cumplimiento** | **Valoración** |
|----|----|----|
| OE1 Requisitos | Capítulo 2 define actores, casos de uso, modelo de dominio, estados, contexto y trazabilidad RS-UC. | Cumplido |
| OE2 Análisis y diseño | Capítulo 3 concreta arquitectura, MVC, paquetes, modelo documental, secuencias, prompt y contingencia IA. | Cumplido |
| OE3 Producto funcional | Capítulo 4 muestra pantallas reales, API, MongoDB, chatbot LM Studio y panel administrador. | Cumplido |
| OE4 Evaluación | Pruebas automáticas, \`npm run verify\`, auditoría diseño-código y revisión de reglas críticas. | Cumplido |

## 5.3 Cumplimiento de objetivos transversales

| **Objetivo transversal** | **Resultado obtenido** |
|----|----|
| OET1 Privacidad | La inferencia se ejecuta en LM Studio local. Los datos de reserva no se envían a una API externa de IA; se almacenan en MongoDB local. |
| OET2 Robustez del chatbot | El flujo combina prompt estructurado, catálogo numerado, reglas previas, parser de respuesta y validaciones de backend. |
| OET3 Usabilidad | El cliente puede reservar conversando y el administrador dispone de acciones directas para gestionar la agenda. |
| OET4 Mantenibilidad | La separación frontend/backend/servicios/modelos permite modificar reglas de agenda sin reescribir la interfaz. |

## 5.4 Evaluación de eficiencia e integridad

La eficiencia del sistema se evalúa desde dos perspectivas. La primera es técnica: el backend debe validar y persistir citas sin inconsistencias. La segunda es operativa: el usuario debe poder completar una reserva sin navegar por formularios largos. El tiempo exacto de generación del LLM depende del equipo local y del modelo cargado en LM Studio, por lo que la aplicación no fija una cifra universal; en su lugar incorpora timeout configurable, endpoint de salud y respuesta de error controlada.

| **Aspecto evaluado** | **Mecanismo** | **Resultado** |
|----|----|----|
| Integridad de citas | Validación de nombre, servicio, horario, fecha futura y solape. | No se persiste una reserva inválida. |
| Coherencia de catálogo | Sincronización de \`servicios\` desde SERVICE_CATALOG. | Los servicios 1..7 son consistentes en prompt, API y MongoDB. |
| Disponibilidad de IA | Timeout \`LMSTUDIO_TIMEOUT_MS\` y endpoint \`/api/health/lmstudio\`. | Fallo controlado si LM Studio no responde. |
| Rendimiento frontend | Build Vite de producción. | Aplicación preparada para servir assets optimizados. |
| Regresión funcional | \`node:test\` sobre servicios críticos. | 44 pruebas automáticas superadas. |
| Operación administrativa | Filtros, orden y estados en panel. | El peluquero puede consultar y cerrar el ciclo de vida de la cita. |

## 5.5 Discusión de resultados

La decisión más relevante del proyecto ha sido separar conversación y decisión. LM Studio aporta naturalidad, tono y flexibilidad lingüística; sin embargo, el sistema no le concede autoridad final sobre la reserva. Esta arquitectura reduce el riesgo de alucinaciones operativas: aunque el modelo produzca texto incorrecto, la cita solo se registra si supera las reglas del backend.

Otra decisión importante ha sido utilizar MongoDB. En una agenda de citas, cada reserva se consulta como unidad documental completa y no requiere un modelo relacional complejo. El esquema usado conserva los datos necesarios para el panel, las estadísticas y la detección de solapes. Además, Mongoose aporta validación de esquema, índices y una capa de acceso coherente con Node.js.

Desde el punto de vista metodológico, la inspiración en pySigHor ha sido especialmente útil para no dejar el TFG como una simple implementación. La carpeta RUP actúa como memoria viva del proyecto: casos de uso, código, pruebas y auditoría pueden recorrerse juntos. Esta trazabilidad permite verificar las decisiones porque cada pantalla se conecta con un caso de uso y cada regla crítica con una prueba.

| **Decisión** | **Ventaja** | **Compromiso asumido** |
|----|----|----|
| IA local con LM Studio | Privacidad y ausencia de coste por llamada. | Dependencia de que el equipo local tenga el modelo cargado. |
| Reglas deterministas en backend | Mayor seguridad funcional frente a respuestas impredecibles. | Más lógica propia que mantener. |
| React/Vite | Interfaz rápida de desarrollar, modular y moderna. | Necesidad de build separado para producción. |
| Node.js/Express | API ligera, comprensible y suficiente para MVC. | Menos estructura impuesta que frameworks más opinados. |
| MongoDB/Mongoose | Modelo documental simple y flexible. | Requiere cuidar índices y validaciones para mantener consistencia. |

## 5.6 Limitaciones detectadas

Las limitaciones no invalidan la solución; delimitan el alcance realista de una primera versión de TFG. La más evidente es que el chatbot depende del servidor local de LM Studio. Si el modelo no está cargado o el puerto no responde, el sistema informa del problema y evita confirmar reservas inventadas, pero la experiencia conversacional queda temporalmente indisponible.

- La disponibilidad del asistente depende de que LM Studio esté abierto, el modelo cargado y el endpoint local activo.

- La agenda no incorpora aún notificaciones automáticas por correo, SMS o WhatsApp.

- El sistema está parametrizado para una única peluquería y no para una red de establecimientos.

- La autenticación cubre al administrador, pero no existe todavía un área privada para clientes finales.

- La evaluación se centra en pruebas funcionales y de reglas de negocio; no se ha realizado un estudio formal con usuarios reales.

## 5.7 Recomendaciones

Para una puesta en uso real conviene mantener el mismo criterio que ha guiado el desarrollo: avanzar por iteraciones pequeñas, con trazabilidad y pruebas. No sería recomendable añadir funcionalidades de forma masiva sin consolidar primero la operación diaria del peluquero.

1.  Mantener el backend como autoridad de negocio: ningún cambio del prompt debe sustituir validaciones de agenda.

2.  Configurar variables de entorno propias antes de un despliegue real, especialmente \`JWT_SECRET\`, usuario administrador y URI de MongoDB.

3.  Añadir copias de seguridad periódicas de MongoDB si la aplicación se usa con clientes reales.

4.  Registrar conversaciones solo si existe consentimiento y una política clara de conservación de datos.

5.  Ampliar las pruebas automáticas cada vez que se añada una regla de negocio o un nuevo estado de cita.

## 5.8 Futuras líneas de actuación

La solución queda preparada para evolucionar. La estructura MVC, el catálogo centralizado y la separación entre IA, negocio y persistencia permiten añadir funcionalidades sin reescribir el núcleo.

| **Línea futura** | **Descripción** | **Prioridad** |
|----|----|----|
| Disponibilidad avanzada | Mostrar huecos libres calculados automáticamente y sugerir alternativas concretas. | Alta |
| Recordatorios | Enviar avisos por email, SMS o WhatsApp antes de la cita. | Alta |
| Cancelación por cliente | Permitir cancelar o cambiar una reserva mediante enlace seguro o conversación. | Media |
| Calendario visual | Añadir vista semanal/mensual para el peluquero. | Media |
| Multiusuario | Soportar varios peluqueros, turnos y servicios por empleado. | Media |
| Analítica | Informes de servicios más solicitados, horas punta e ingresos por periodo. | Media |
| Mejora del chatbot | Añadir pruebas conversacionales de regresión y evaluación de calidad de respuesta. | Alta |
| Despliegue controlado | Preparar ejecución en red local o servidor privado manteniendo IA local. | Baja-media |

## 5.9 Valoración personal del proceso

El proyecto ha permitido recorrer un ciclo completo de ingeniería de software: entender una necesidad real, modelarla, diseñar una arquitectura, implementar una solución y verificar sus reglas críticas. La parte más valiosa no ha sido únicamente integrar un LLM, sino aprender a integrarlo con responsabilidad: la IA mejora la experiencia de usuario, pero no reemplaza el diseño de dominio ni la validación de negocio.

También se confirma la utilidad de documentar el proceso. Los capítulos, los diagramas, la carpeta RUP y las pruebas no son elementos aislados; forman una cadena de evidencia. Esa cadena es la que permite defender que la aplicación no se ha construido de forma improvisada, sino siguiendo un razonamiento técnico progresivo.

## 5.10 Conclusión final

Corte Perfecto demuestra que una pequeña empresa puede beneficiarse de tecnologías actuales sin asumir una arquitectura desproporcionada ni renunciar a la privacidad. La combinación de React, Node.js, MongoDB y LM Studio permite construir una solución funcional, local, mantenible y alineada con el RGPD. El resultado final satisface los objetivos planteados y deja una base técnica suficiente para seguir evolucionando el sistema en iteraciones posteriores.

# Anexo A. Evidencia de verificación final

Este anexo resume las evidencias operativas utilizadas para cerrar la entrega. Se incluye para facilitar la revisión posterior, aunque los artefactos completos permanecen en el repositorio.

| **Artefacto** | **Ubicación** | **Uso** |
|----|----|----|
| Pruebas de calendario | backend/tests/calendarService.test.js | Validar días laborables, fines de semana y formato de fecha. |
| Pruebas de flujo conversacional | backend/tests/bookingFlowService.test.js | Validar nombre, selección numérica de servicios y bloqueo de fin de semana. |
| Pruebas de agenda | backend/tests/appointmentService.test.js | Validar citas, solapes, estados y catálogo sincronizado. |
| Pruebas de robustez del chat | backend/tests/chatHardening.test.js | Validar saneamiento, límites, contingencia y protección de instrucciones. |
| Matriz de trazabilidad | RUP/99-seguimiento/trazabilidad-casos-uso.md | Relacionar casos de uso con implementación y pruebas. |
| Auditoría diseño-código | RUP/99-seguimiento/auditoria-diseno-implementacion.md | Comprobar coherencia entre Capítulo 3 y código real. |
| Dashboard RUP | RUP/99-seguimiento/estado-casos-uso.puml | Visualizar el estado de los casos de uso. |

---

[Anterior: Capítulo 4](04-implementacion-mapa-solucion.md) · [Índice de capítulos](README.md) · [Siguiente: Referencias](06-referencias.md)
