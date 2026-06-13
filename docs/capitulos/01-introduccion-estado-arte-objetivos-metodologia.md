[Índice de capítulos](README.md) · [Siguiente: Capítulo 2](02-requisitos-modelo-dominio.md) · [Guion de defensa](../09-guion-defensa-20-min.md)

---

**ESCUELA POLITÉCNICA SUPERIOR**

Universidad Europea del Atlántico

Grado en Ingeniería Informática

**TRABAJO FIN DE GRADO**

**Desarrollo de una plataforma web integral de gestión de citas para la peluquería Corte Perfecto con asistencia inteligente basada en modelos de lenguaje (LLM) de ejecución local**

**Capítulo 1**

**Introducción, Estado del Arte, Objetivos y Metodología**

**Autor:**

Adrián García Arranz

**Palabras clave:**

*React · Node.js · MongoDB · IA local · Gestión de citas*

*Santander, 2026*

# CAPÍTULO 1. INTRODUCCIÓN, ESTADO DEL ARTE, OBJETIVOS Y METODOLOGÍA

## 1.1 Introducción, Escenario y Marco Teórico

La narrativa de este capítulo se construye siguiendo una aproximación por etapas que facilita la comprensión progresiva del proyecto: (1) contextualización del escenario real de la peluquería y su problemática operativa; (2) exploración de las soluciones existentes en el mercado y sus limitaciones; (3) justificación de por qué ninguna de esas soluciones se adapta de forma óptima al caso concreto; y (4) presentación de la propuesta específica desarrollada en este trabajo, que sirve como puente natural hacia la hipótesis y los objetivos.

### 1.1.1 Contextualización del escenario

El sector de la peluquería y la estética personal en España constituye un tejido empresarial formado mayoritariamente por pequeños negocios de carácter local o familiar. Según datos del Instituto Nacional de Estadística, existen en el país más de 60.000 establecimientos de peluquería y cuidado personal, de los cuales una parte muy significativa opera con plantillas de entre uno y cinco empleados. Esta realidad implica que la gestión administrativa del negocio —en particular la gestión de citas con clientes— recae directamente sobre el propio profesional, sin que exista habitualmente un equipo dedicado exclusivamente a esa tarea.

En este contexto se sitúa el negocio objeto de este proyecto: "Corte Perfecto", una peluquería de barrio ubicada en la ciudad de Santander (Cantabria). El establecimiento ofrece tres servicios principales: corte de cabello (20 €, incluye lavado), tinte o coloración capilar (40 €) y peinado o recogido (15 €). Funciona en horario de lunes a viernes, de 10:00 a 20:00, con cierre total los fines de semana. Al igual que la mayoría de negocios de su categoría, gestiona su agenda mediante métodos tradicionales: anotaciones en papel, mensajes de WhatsApp y llamadas telefónicas.

El perfil de la clientela es heterogéneo: clientes jóvenes o de mediana edad que prefieren resolver por chat y esperan respuestas rápidas; clientela tradicional que sigue llamando por teléfono; y clientes ocasionales que preguntan precios o disponibilidad antes de decidir. Esta mezcla de hábitos obliga a cubrir varios canales simultáneamente, lo que incrementa la carga cognitiva del peluquero y genera interrupciones constantes durante el trabajo.

La problemática concreta identificada es la siguiente: los clientes no disponen de un canal digital disponible las veinticuatro horas del día para consultar disponibilidad y formalizar una reserva, y el negocio carece de un sistema automatizado que persista esas reservas en una base de datos estructurada. La estimación de partida, documentada en la propuesta inicial del proyecto (D0), sitúa la pérdida de tiempo productivo derivada de la gestión manual de agenda y la atención de consultas repetitivas en torno al 30 % en periodos de alta demanda. Esta situación puede resumirse en una frase recurrente en el diagnóstico del negocio: "se pierden reservas no porque no haya hueco, sino porque no hay manos para contestar".

### 1.1.2 La oportunidad de la Inteligencia Artificial conversacional

La proliferación de los Modelos de Lenguaje de Gran Escala (Large Language Models, LLM) ha abierto una nueva posibilidad tecnológica: dotar a cualquier aplicación web de una interfaz conversacional en lenguaje natural. En lugar de obligar al usuario a rellenar formularios o navegar menús, estos modelos permiten que el cliente simplemente escriba lo que necesita y que el sistema entienda la intención, extraiga los datos relevantes y actúe en consecuencia.

Sin embargo, existe una barrera relevante para su adopción en pequeños negocios: el coste y la privacidad. Los servicios comerciales de IA —como GPT-4 (OpenAI) o Claude (Anthropic)— implican costes por uso que se acumulan con el volumen de conversaciones, y suponen enviar datos de los clientes a servidores externos fuera del control del negocio. Este aspecto es especialmente sensible en el marco del Reglamento General de Protección de Datos (RGPD) de la Unión Europea.

La aparición de modelos de código abierto de alta calidad —en particular la familia Llama 3.1 de Meta AI (2024)— y de herramientas de inferencia local como LM Studio ofrece una alternativa viable: ejecutar un LLM de forma completamente local, en el propio hardware del negocio, sin enviar ningún dato a servicios externos. Esta aproximación elimina el coste por petición y mantiene la privacidad de los datos de los clientes bajo control directo del negocio. El hardware disponible —un equipo con GPU NVIDIA RTX 3060 de 6 GB de VRAM, documentado en D0— hace técnicamente viable la ejecución del modelo Llama 3.1 8B en versión cuantizada a 4 bits (formato GGUF).

### 1.1.3 Actores del sistema

La solución se diseña en torno a dos actores principales cuyas necesidades definen los requisitos funcionales del sistema:

> • Cliente final: persona que desea consultar información sobre el negocio (horarios, precios, servicios) o reservar una cita. Accede a la plataforma desde el navegador web, preferentemente desde el teléfono móvil, e interactúa mediante el widget de chat en lenguaje natural.
>
> • Administrador del negocio (peluquero): profesional que necesita gestionar la agenda. Accede al panel de administración de la plataforma para visualizar, modificar o cancelar las reservas registradas en la base de datos.

### 1.1.4 Marco teórico

Para situar el proyecto en su contexto académico y tecnológico, se describen los conceptos fundamentales sobre los que se apoya el desarrollo:

Modelos de lenguaje de gran escala (LLM). Un LLM es un modelo de aprendizaje profundo entrenado sobre corpus masivos de texto que adquiere la capacidad de generar texto coherente y seguir instrucciones en lenguaje natural. Su arquitectura está basada en el mecanismo de transformers (Vaswani et al., 2017). En este proyecto se utiliza Llama 3.1 8B Instruct, distribuido bajo licencia abierta por Meta AI y optimizado para mantener conversaciones estructuradas.

Inferencia local con LM Studio. LM Studio es una aplicación de escritorio que permite cargar y ejecutar modelos LLM localmente, exponiendo una API compatible con el estándar OpenAI. El modelo se ejecuta en la GPU local mediante cuantización a 4 bits (formato GGUF), lo que reduce su huella de memoria de aproximadamente 16 GB (float16) a 5-6 GB, haciéndolo operable en la RTX 3060.

Arquitectura cliente-servidor. La plataforma sigue el patrón de separación entre capa de presentación (frontend React ejecutado con Vite durante el desarrollo), lógica de negocio (backend Node.js/Express organizado siguiendo MVC) y capa de datos (MongoDB gestionada mediante Mongoose). Esta separación facilita el mantenimiento, la escalabilidad y la reutilización de componentes.

IA guiada por reglas de negocio. Un principio de diseño fundamental es que la IA conversa, pero el backend valida y decide. El backend incorpora un flujo determinista para la reserva de citas y utiliza el LLM como asistente conversacional, no como autoridad final del sistema. Antes de registrar una cita, la aplicación verifica que el nombre sea válido, que la fecha no caiga en fin de semana, que la hora pertenezca al horario laboral y no haya pasado, que el servicio exista en el catálogo numerado y que no se generen reservas duplicadas. Este enfoque evita el error habitual de tratar la IA como una "caja mágica" sin supervisión.

## 1.2 Estado del Arte

### 1.2.1 Gestión manual clásica: papel, agenda y llamadas telefónicas

La gestión tradicional mediante agenda física, llamadas directas y anotaciones en papel ha sido el método predominante en el sector durante décadas. Sus ventajas iniciales son evidentes: no requiere inversión tecnológica ni formación compleja. Sin embargo, cuando aumenta la demanda o se diversifican los canales de comunicación, emergen limitaciones estructurales: ausencia de sincronización automática entre consultas y citas confirmadas; dependencia de quién anota y en qué soporte; imposibilidad de atender solicitudes fuera del horario de trabajo; y falta de trazabilidad para revisar cancelaciones.

### 1.2.2 WhatsApp: solución aparente y trampa operativa

WhatsApp se percibe habitualmente como alternativa gratuita y cómoda porque casi todos los clientes lo usan. Sin embargo, en operación real actúa como una trampa para el pequeño negocio: su coste no es monetario sino temporal. El profesional debe responder mensajes fuera de horario para no perder conversaciones; los hilos de múltiples clientes se mezclan y son difíciles de gestionar; y no existe ningún mecanismo de persistencia estructurada. Cuando el volumen de consultas supera cierto umbral, WhatsApp se convierte en una fuente de interrupciones más que en una herramienta de productividad.

### 1.2.3 Plataformas SaaS especializadas en reservas

Existe un ecosistema consolidado de plataformas Software como Servicio (SaaS) orientadas a la gestión de citas en negocios de peluquería y estética. La siguiente tabla comparativa analiza las más representativas:

| **Solución** | **Tipo** | **Ventajas** | **Limitaciones** |
|:---|:---|:---|:---|
| Fresha | SaaS peluquería | Agenda, clientes y pagos integrados | Costes en plan de pago; sin IA conversacional; datos en terceros |
| Booksy | App reservas | Amplia base de usuarios; valoraciones | Coste mensual; datos en servidores externos |
| SimplyBook.me | SaaS genérico | Alta configurabilidad; múltiples servicios | Complejidad de configuración; sin LLM integrado |
| WhatsApp Business | Mensajería empresarial | Familiar para el cliente; sin instalación | Manual al 100 %; sin persistencia automática |
| Calendly | Reuniones B2B | Fácil integración; tier gratuito | No orientado a peluquerías; sin lenguaje natural |
| Este TFG | Web ad hoc + IA local | Privacidad, sin costes recurrentes, IA conversacional integrada | Requiere desarrollo e infraestructura inicial |

Ninguna de las soluciones comerciales analizadas combina simultáneamente las tres características que este proyecto persigue: (1) interfaz conversacional en lenguaje natural, (2) ejecución local del modelo de IA sin dependencia de terceros, y (3) persistencia automática y estructurada de las citas en una base de datos propia del negocio.

### 1.2.4 Modelos de lenguaje de código abierto y su viabilidad local

La publicación de Llama 2 (Touvron et al., 2023) y posteriormente Llama 3.1 (Meta AI, 2024) supuso un punto de inflexión en la accesibilidad de los LLMs. La cuantización a 4 bits (formato GGUF, implementado a través de llama.cpp y LM Studio) reduce el uso de memoria de un modelo de 8.000 millones de parámetros de aproximadamente 16 GB en float16 a 5-6 GB, haciéndolo operable en hardware de consumo estándar. Este proyecto verifica experimentalmente esa viabilidad en una RTX 3060 con 6 GB de VRAM, obteniendo tiempos de inferencia de entre 2 y 8 segundos por respuesta, aceptables para un chatbot de atención al cliente.

### 1.2.5 Chatbots y procesamiento de lenguaje natural en servicios locales

Følstad y Brandtzæg (2017) identifican la gestión de citas como uno de los principales casos de uso de los chatbots en atención al cliente, señalando que la principal barrera para la adopción es la rigidez de las interfaces basadas en menús de selección, que limitan la expresividad del usuario. Los LLMs modernos superan esta limitación: el usuario puede escribir "quiero un corte para el miércoles por la mañana" y el sistema extrae inteligentemente el servicio, la fecha y la preferencia horaria. Esta capacidad —conocida como slot filling en el ámbito del procesamiento del lenguaje natural— constituye el núcleo funcional del chatbot de este proyecto.

### 1.2.6 Diferenciación de este trabajo respecto al estado del arte

Este proyecto se diferencia de las soluciones existentes en cuatro aspectos clave:

> • Privacidad por diseño: al ejecutar el LLM localmente, ningún dato del cliente —nombre, fecha de cita, historial de conversación— abandona el entorno controlado por el negocio, facilitando el cumplimiento del RGPD.
>
> • Coste cero de operación del componente de IA: a diferencia de las APIs comerciales (OpenAI, Anthropic, Google), el coste de inferencia es nulo tras la inversión inicial en hardware.
>
> • Integración directa con base de datos: el chatbot crea automáticamente el registro de la cita al completar la conversación, eliminando la intervención manual del profesional.
>
> • Control mediante ingeniería de prompts y validación backend: todas las decisiones críticas (validación de nombre, bloqueo de fechas en fin de semana, cálculo de precios combinados, deduplicación) se gestionan en el backend, no en el modelo de IA.

## 1.3 Objetivos

### 1.3.1 Hipótesis de partida

El desarrollo de una plataforma web que integre un chatbot de inteligencia artificial conversacional ejecutado de forma local puede automatizar el proceso de gestión de citas de una peluquería pequeña, ofreciendo al cliente un canal disponible las veinticuatro horas del día, garantizando la privacidad de los datos de los usuarios y sin incurrir en costes recurrentes por el uso del componente de inteligencia artificial.

### 1.3.2 Objetivo general

Diseñar e implementar una plataforma web de gestión de reservas para la peluquería "Corte Perfecto" (Santander) que automatice la atención al cliente mediante el despliegue de un asistente conversacional basado en un modelo de lenguaje de gran escala ejecutado en entorno local, persistiendo las reservas automáticamente en MongoDB y proporcionando al negocio una interfaz de administración para la gestión de la agenda.

### 1.3.3 Objetivos específicos y correspondencia con los capítulos

Los objetivos específicos están directamente alineados con la estructura de capítulos de este documento, siguiendo el mapa propuesto en la guía de la Escuela Politécnica Superior:

| **\#** | **Objetivo específico** | **Capítulo asociado** |
|:---|:---|:---|
| OE1 | Ejecutar la disciplina de requisitos: identificar los requisitos funcionales y no funcionales del sistema, modelar los casos de uso y definir el contrato de la API REST entre frontend y backend. | Capítulo 2 |
| OE2 | Ejecutar la disciplina de análisis y diseño: definir la arquitectura del sistema (React/Vite + Node.js/Express + MongoDB + LM Studio), el modelo de datos documental y el diseño del flujo de reserva y limpieza de respuestas del LLM. | Capítulo 3 |
| OE3 | Desarrollar un producto final funcional que satisfaga los requisitos identificados: frontend React/Vite, backend Node.js/Express con estructura MVC, base de datos MongoDB y chatbot con Llama 3.1 8B Instruct. | Capítulo 4 |
| OE4 | Evaluar la eficiencia del sistema: medir los tiempos de respuesta del LLM, verificar la integridad de las transacciones en la base de datos y validar el cumplimiento de todos los objetivos anteriores. | Capítulo 5 |

El Capítulo 5 recoge la verificación del cumplimiento de cada uno de estos objetivos, junto con las conclusiones del trabajo, las limitaciones encontradas y las futuras líneas de actuación.

De forma transversal a todos los capítulos, se establecen los siguientes objetivos complementarios:

> • OET1 — Privacidad: garantizar que ningún dato personal del cliente sea enviado a servicios de IA externos durante la operación del sistema.
>
> • OET2 — Robustez del chatbot: implementar un flujo conversacional con validaciones backend, catálogo numerado y limpieza de respuestas del LLM para garantizar que el usuario nunca reciba texto de razonamiento interno del modelo.
>
> • OET3 — Usabilidad: lograr que un usuario sin conocimientos técnicos pueda completar una reserva en cinco o menos intercambios de mensajes con el chatbot.
>
> • OET4 — Mantenibilidad: estructurar el código con separación clara de responsabilidades (frontend / backend / IA) para facilitar futuras extensiones.

## 1.4 Metodología

### 1.4.1 Enfoque metodológico general

El desarrollo de este proyecto sigue una metodología de ciclo de vida iterativo e incremental, enmarcada en los principios del desarrollo ágil de software descritos por Pressman y Maxim (2020). Este enfoque fue seleccionado por dos razones fundamentales.

En primer lugar, la naturaleza del componente de inteligencia artificial introduce una incertidumbre inherente: el comportamiento exacto del LLM ante diferentes entradas no es completamente predecible desde el diseño inicial y requiere ciclos cortos de prueba y ajuste. Durante el desarrollo se identificaron situaciones no anticipadas en el análisis original, como la necesidad de gestionar fechas expresadas en lenguaje coloquial ("este miércoles", "pasado mañana"), la combinación de múltiples servicios en una única reserva, o los casos en los que el modelo omite el marcador de respuesta establecido en el system prompt.

En segundo lugar, los requisitos del negocio, aunque claros en términos generales, evolucionaron durante el desarrollo al descubrirse nuevos casos límite. La metodología iterativa permite incorporar estas modificaciones sin alterar la estructura global del proyecto.

### 1.4.2 Ciclo de vida por funcionalidad

Dentro de cada fase, se aplicó el siguiente ciclo de vida para cada funcionalidad implementada, consistente con el modelo iterativo descrito por Pressman y Maxim (2020):

> • Definición: especificación precisa del comportamiento esperado.
>
> • Implementación: codificación de la funcionalidad en backend, frontend o system prompt.
>
> • Prueba manual: verificación del comportamiento con casos reales de uso.
>
> • Ajuste: corrección de desviaciones respecto al comportamiento esperado.
>
> • Integración: incorporación al sistema completo y verificación de ausencia de regresiones.

Este ciclo se aplicó especialmente al componente de chatbot. Cada modificación del system prompt o del pipeline de limpieza de respuestas requirió múltiples sesiones de prueba conversacional antes de ser considerada estable. La revisión humana continua (human-in-the-loop) fue esencial para detectar errores de comprensión que los tests automatizados no habrían identificado.

### 1.4.3 Fases del proyecto

El proyecto se organiza en cuatro fases principales, directamente correspondientes con la estructura de capítulos de este documento:

| **Fase** | **Contenido principal** | **Capítulo** |
|:---|:---|:---|
| Fase 1 — Requisitos | Análisis del negocio. Identificación de requisitos funcionales (RF) y no funcionales (RNF). Casos de uso. Definición del contrato de la API REST. | Capítulo 2 |
| Fase 2 — Análisis y Diseño | Arquitectura de tres capas (React/Vite + Node.js/Express + MongoDB + LM Studio). Modelo documental. Diseño del widget de chat. Diseño del system prompt y del flujo determinista de reserva con limpieza de respuestas del LLM. | Capítulo 3 |
| Fase 3 — Implementación | Desarrollo del frontend React/Vite. Backend Node.js/Express con endpoints de chat, citas, servicios y autenticación. Integración con LM Studio. Flujo de reserva validado por backend, catálogo numerado, filtro anti-metadatos y persistencia MongoDB. Pruebas. | Capítulo 4 |
| Fase 4 — Evaluación y Conclusiones | Evaluación del cumplimiento de los objetivos. Medición de tiempos de respuesta del LLM. Validación de la integridad de la base de datos. Limitaciones y futuras líneas de trabajo. | Capítulo 5 |

### 1.4.4 Tecnologías utilizadas y justificación

| **Tecnología** | **Rol en el proyecto** | **Justificación de la elección** |
|:---|:---|:---|
| React 19 + Vite 7 | Frontend / interfaz de usuario | Componentes reutilizables; experiencia responsive; desarrollo rápido mediante Vite; estado reactivo para el chat y el panel de administración |
| Node.js + Express 5 | Backend / API REST | Ecosistema JavaScript unificado con el frontend; API REST sencilla; middleware para seguridad, CORS, autenticación y validación |
| MongoDB + Mongoose | Base de datos documental y ODM | Persistencia flexible para citas, servicios y administradores; esquemas Mongoose con validación; integración directa con el backend Node.js |
| LM Studio | Servidor de inferencia local | API compatible con OpenAI; interfaz gráfica para gestionar modelos; coste de operación cero |
| Llama 3.1 8B Instruct (Q4_K_M) | Modelo de lenguaje conversacional | Licencia comercial abierta; alta calidad en seguimiento de instrucciones; operable con 6 GB VRAM |
| Axios | Cliente HTTP de frontend y backend | Cliente HTTP utilizado para comunicarse con la API REST y con el servidor local de LM Studio |
| Git / GitHub | Control de versiones | Trazabilidad de cambios; estándar de la industria |

### 1.4.5 Consideraciones sobre privacidad y cumplimiento del RGPD

Dado que el sistema almacena nombres de clientes y fechas de citas, el diseño incorpora desde el inicio los principios del Reglamento General de Protección de Datos (RGPD, Reglamento UE 2016/679):

> • Minimización de datos: el sistema solicita únicamente los datos estrictamente necesarios para la reserva: nombre, servicio, fecha y hora.
>
> • Limitación de finalidad: los datos se usan exclusivamente para la gestión de citas y no se comparten con terceros.
>
> • Privacidad por diseño: al procesar el lenguaje natural localmente con Llama 3.1, los datos de la conversación no abandonan el entorno del negocio en ningún momento.
>
> • Derecho al olvido: la arquitectura permite al administrador eliminar registros de citas directamente desde el panel de administración, en cumplimiento del artículo 17 del RGPD.

### 1.4.6 Trazabilidad metodológica y evidencia de construcción

Además del desarrollo funcional, el proyecto incorpora una estructura de seguimiento inspirada en pySigHor, repositorio de referencia indicado por la dirección académica. Esta estructura permite mantener una trazabilidad explícita entre requisitos, análisis, diseño, implementación y pruebas, evitando que la memoria y el código evolucionen por caminos separados.

| **Elemento** | **Función dentro del TFG** |
|:---|:---|
| RUP/99-seguimiento/trazabilidad-casos-uso.md | Relaciona cada caso de uso con módulos reales, rutas, modelos y pruebas. |
| RUP/99-seguimiento/auditoria-diseno-implementacion.md | Contrasta el diseño del Capítulo 3 con la implementación efectiva. |
| RUP/99-seguimiento/estado-casos-uso.puml | Actúa como dashboard visual del avance de casos de uso. |
| backend/tests/ | Aporta evidencia ejecutable de reglas críticas de negocio. |

Este enfoque refuerza la metodología iterativa del proyecto: cada funcionalidad relevante no solo se implementa, sino que queda vinculada con su origen en requisitos y con una comprobación técnica cuando el riesgo lo justifica.

## 1.5 Alcance y Limitaciones

### 1.5.1 Alcance funcional del sistema

El sistema desarrollado cubre el proceso completo desde el primer mensaje del cliente hasta la persistencia de la reserva en la base de datos:

> • Consulta de horarios, precios y catálogo de servicios mediante lenguaje natural.
>
> • Identificación automática de la intención de reserva.
>
> • Recogida conversacional de los cuatro datos necesarios: nombre, servicio, fecha y hora.
>
> • Cálculo automático de precios para combinaciones de servicios (hasta tres simultáneos).
>
> • Modificación dinámica de una reserva activa (cambio de hora, adición de servicio).
>
> • Bloqueo automático de fechas en fin de semana, con propuesta de alternativa laborable.
>
> • Validación de nombre de cliente (rechazo de entradas inválidas como "ok" o "asdf").
>
> • Deduplicación de reservas idénticas en la base de datos.
>
> • Visualización del estado actual de la reserva mediante tarjeta visual en el chat.
>
> • Panel de administración con autenticación para visualizar, crear, modificar, eliminar, ordenar y marcar como completadas las citas registradas.

### 1.5.2 Limitaciones actuales y líneas de evolución

Las siguientes limitaciones son razonables para el alcance de un TFG y dejan una base sólida para evolución futura:

> • Base de datos MongoDB local: adecuada para desarrollo, demostración y operación en localhost; en producción se recomienda desplegar una instancia gestionada o un servidor MongoDB securizado, con usuarios, copias de seguridad y políticas de acceso configuradas.
>
> • Modelo de IA único: el sistema está configurado para un único modelo local; una futura versión podría seleccionar entre varios modelos según el tipo de consulta.
>
> • Autenticación administrativa básica: el panel dispone de inicio de sesión con credenciales y token JWT; en producción debe endurecerse con rotación de secretos, gestión avanzada de usuarios y políticas de contraseña.
>
> • Latencia de inferencia: los tiempos de respuesta (2-8 segundos) son aceptables para un chatbot, pero superiores a servicios cloud; pueden reducirse con hardware de mayor capacidad.
>
> • Escalabilidad horizontal: la arquitectura está diseñada para un único negocio; la parametrización para múltiples establecimientos es una línea de evolución identificada.

**Resumen del Capítulo**

Este capítulo ha establecido la base completa del proyecto siguiendo las cuatro etapas narrativas propuestas: (1) se ha descrito el escenario de partida —una peluquería local en Santander con necesidades de digitalización de su gestión de citas— y se ha cuantificado la problemática concreta (pérdida estimada del 30 % de tiempo productivo en gestión manual); (2) se ha revisado el estado del arte de las soluciones existentes (plataformas SaaS, WhatsApp, gestión manual), identificando sus limitaciones; (3) se ha justificado por qué ninguna solución comercial combina conversación en lenguaje natural, privacidad de datos y coste cero de IA; y (4) se ha presentado la propuesta concreta de este trabajo.

Se han definido la hipótesis de partida, el objetivo general, cuatro objetivos específicos alineados con los capítulos posteriores (Capítulos 2, 3, 4 y 5) y cuatro objetivos transversales (privacidad, robustez, usabilidad y mantenibilidad). Se ha descrito la metodología iterativa e incremental (Pressman y Maxim, 2020), el stack tecnológico completo y las consideraciones normativas en materia de protección de datos. Los capítulos siguientes desarrollan, respectivamente, los requisitos del sistema, el análisis y diseño de la solución, la presentación del producto implementado y la evaluación final de resultados.

## Referencias bibliográficas

Dubey, A., Jauhri, A., Pandey, A., Kadian, A., Al-Dahle, A., Letman, A., et al. (2024). *The Llama 3 herd of models*. arXiv preprint arXiv:2407.21783. <https://arxiv.org/abs/2407.21783>

Elmasri, R., & Navathe, S. B. (2021). *Fundamentos de sistemas de bases de datos* (7.ª ed.). Pearson Education.

Express.js. (s. f.). *Express - Node.js web application framework*. <https://expressjs.com/>

Følstad, A., & Brandtzæg, P. B. (2017). Chatbots and the new world of HCI. *Interactions, 24*(5), 38-42. DOI: 10.1145/3085558.

LM Studio. (s. f.). *LM Studio Docs*. <https://lmstudio.ai/docs>

Meta AI. (2024). *Llama 3.1: Open foundation and fine-tuned chat models*. <https://ai.meta.com/research/publications/the-llama-3-herd-of-models/>

MongoDB, Inc. (s. f.). *MongoDB Manual*. <https://www.mongodb.com/docs/manual/>

Mongoose. (s. f.). *Mongoose documentation*. <https://mongoosejs.com/docs/>

OpenJS Foundation. (s. f.). *Node.js API documentation*. <https://nodejs.org/docs/latest/api/>

Pressman, R. S., & Maxim, B. R. (2020). *Software engineering: A practitioner's approach* (9th ed.). McGraw-Hill.

React. (s. f.). *React documentation*. <https://react.dev/>

Sommerville, I. (2021). *Software engineering* (10th ed.). Pearson.

Touvron, H., Martin, L., Stone, K., Albert, P., Almahairi, A., Babaei, Y., et al. (2023). *Llama 2: Open foundation and fine-tuned chat models*. arXiv preprint arXiv:2307.09288. <https://arxiv.org/abs/2307.09288>

Vaswani, A., Shazeer, N., Parmar, N., Uszkoreit, J., Jones, L., Gomez, A. N., Kaiser, Ł., & Polosukhin, I. (2017). Attention is all you need. *Advances in Neural Information Processing Systems, 30*, 5998-6008. <https://arxiv.org/abs/1706.03762>

Vite. (s. f.). *Vite guide*. <https://vite.dev/guide/>

Zhao, W. X., Zhou, K., Li, J., Tang, T., Wang, X., Hou, Y., et al. (2023). A survey of large language models. *arXiv preprint arXiv:2303.18223*. <https://arxiv.org/abs/2303.18223>

---

[Índice de capítulos](README.md) · [Siguiente: Capítulo 2](02-requisitos-modelo-dominio.md)
