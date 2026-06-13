# Documentación técnica

Esta sección complementa la [presentación por capítulos](../README.md) con explicaciones técnicas, la memoria navegable y las evidencias verificables del proyecto.

[Abrir presentación oral](presentacion/README.md) · [Abrir resúmenes por capítulos](presentacion/Capitulo_1/README.md)

## Contenido académico

| Capítulo | Versión navegable | Síntesis |
| ---: | --- | --- |
| 1 | [Introducción, estado del arte y objetivos](capitulos/01-introduccion-estado-arte-objetivos-metodologia.md) | [Proyecto y objetivos](01-proyecto-y-objetivos.md) |
| 2 | [Requisitos y modelo del dominio](capitulos/02-requisitos-modelo-dominio.md) | [UC-01 a UC-17](../RUP/02-requisitos/especificacion-casos-uso.md) |
| 3 | [Análisis y diseño](capitulos/03-analisis-diseno.md) | [Arquitectura y decisiones](02-arquitectura-y-decisiones.md) |
| 4 | [Implementación](capitulos/04-implementacion-mapa-solucion.md) | [API](04-api-y-datos.md) y [chatbot](05-chatbot-y-reglas.md) |
| 5 | [Evaluación y conclusiones](capitulos/05-conclusiones-lineas-futuras.md) | [Calidad](06-calidad-seguridad-y-pruebas.md) y [limitaciones](11-limitaciones-y-lineas-futuras.md) |
| Referencias | [Bibliografía](capitulos/06-referencias.md) | [PDF oficial](../entregas/TFG_AdriánGarcíaArranz.pdf) |

## Referencia técnica

| Tema | Documento |
| --- | --- |
| Instalación y ejecución | [Entorno reproducible](03-instalacion-y-ejecucion.md) |
| Arquitectura | [Capas y decisiones](02-arquitectura-y-decisiones.md) |
| API y persistencia | [Endpoints, modelos y reglas](04-api-y-datos.md) |
| Chatbot | [Pipeline híbrido y contingencias](05-chatbot-y-reglas.md) |
| Calidad | [Pruebas, seguridad e integridad](06-calidad-seguridad-y-pruebas.md) |
| Trazabilidad | [Memoria, código y pruebas](07-memoria-y-trazabilidad.md) |
| Material visual | [Diagramas y capturas](diagramas-y-capturas.md) |

## Evidencias

- [Especificación completa de casos de uso](../RUP/02-requisitos/especificacion-casos-uso.md)
- [Matriz UC -> código -> prueba](../RUP/99-seguimiento/trazabilidad-casos-uso.md)
- [Auditoría entre diseño e implementación](../RUP/99-seguimiento/auditoria-diseno-implementacion.md)
- [Dashboard de casos de uso](../RUP/99-seguimiento/estado-casos-uso.png)
- [Pruebas automatizadas](../backend/tests/)
- [Código del backend](../backend/src/)
- [Código del frontend](../frontend/src/)

[Volver al proyecto](../README.md)
