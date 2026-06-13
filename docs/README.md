# Documentación del proyecto

Este índice permite recorrer Corte Perfecto con tres niveles de profundidad: visión para el tribunal, explicación técnica y evidencia verificable.

## Ruta de exposición por capítulos

| Orden | Bloque | Documento principal | Evidencia |
| ---: | --- | --- | --- |
| 0 | Preparación | [Defensa paso a paso](00-defensa-paso-a-paso.md) | [Demo](08-demo-defensa.md) y [preguntas](10-preguntas-del-tribunal.md) |
| 1 | Introducción y objetivos | [Capítulo 1](capitulos/01-introduccion-estado-arte-objetivos-metodologia.md) | [Resumen ejecutivo](01-proyecto-y-objetivos.md) |
| 2 | Requisitos y dominio | [Capítulo 2](capitulos/02-requisitos-modelo-dominio.md) | [Casos UC-01 a UC-17](../RUP/02-requisitos/especificacion-casos-uso.md) |
| 3 | Análisis y diseño | [Capítulo 3](capitulos/03-analisis-diseno.md) | [Arquitectura](02-arquitectura-y-decisiones.md) y [auditoría](../RUP/99-seguimiento/auditoria-diseno-implementacion.md) |
| 4 | Implementación | [Capítulo 4](capitulos/04-implementacion-mapa-solucion.md) | [API](04-api-y-datos.md), [chatbot](05-chatbot-y-reglas.md) y [demo](08-demo-defensa.md) |
| 5 | Evaluación y conclusiones | [Capítulo 5](capitulos/05-conclusiones-lineas-futuras.md) | [Calidad](06-calidad-seguridad-y-pruebas.md) y [limitaciones](11-limitaciones-y-lineas-futuras.md) |
| 6 | Referencias | [Bibliografía](capitulos/06-referencias.md) | [PDF oficial](../entregas/TFG_AdriánGarcíaArranz.pdf) |

## Referencia técnica

| Necesidad | Documento |
| --- | --- |
| Instalar y ejecutar | [Instalación reproducible](03-instalacion-y-ejecucion.md) |
| Consultar endpoints y modelos | [API y datos](04-api-y-datos.md) |
| Comprender el pipeline conversacional | [Chatbot y reglas](05-chatbot-y-reglas.md) |
| Revisar pruebas y seguridad | [Calidad](06-calidad-seguridad-y-pruebas.md) |
| Demostrar correspondencia | [Memoria y trazabilidad](07-memoria-y-trazabilidad.md) |
| Consultar diagramas y capturas | [Galería técnica](diagramas-y-capturas.md) |
| Comprobar el estado entregado | [Auditoría final](12-auditoria-entrega-final.md) |

## Evidencias del repositorio

- [Especificación completa de UC-01 a UC-17](../RUP/02-requisitos/especificacion-casos-uso.md)
- [Matriz de trazabilidad UC -> código -> prueba](../RUP/99-seguimiento/trazabilidad-casos-uso.md)
- [Auditoría entre diseño e implementación](../RUP/99-seguimiento/auditoria-diseno-implementacion.md)
- [Dashboard visual de casos de uso](../RUP/99-seguimiento/estado-casos-uso.png)
- [Código del backend](../backend/src/)
- [Código del frontend](../frontend/src/)
- [Pruebas automatizadas](../backend/tests/)

## Rutas según el lector

### Tribunal

1. [README principal](../README.md)
2. [PDF final entregado](../entregas/TFG_AdriánGarcíaArranz.pdf)
3. [Memoria completa navegable](capitulos/README.md)
4. [Proyecto y objetivos](01-proyecto-y-objetivos.md)
5. [Arquitectura](02-arquitectura-y-decisiones.md)
6. [Calidad y pruebas](06-calidad-seguridad-y-pruebas.md)
7. [Auditoría final](12-auditoria-entrega-final.md)

### Evaluación técnica

1. [Instalación](03-instalacion-y-ejecucion.md)
2. [API y datos](04-api-y-datos.md)
3. [Chatbot](05-chatbot-y-reglas.md)
4. [Trazabilidad](07-memoria-y-trazabilidad.md)
5. [Pruebas](../backend/tests/)

### Preparación de la defensa

1. [Defensa paso a paso](00-defensa-paso-a-paso.md)
2. [Guion oral](09-guion-defensa-20-min.md)
3. [Demostración](08-demo-defensa.md)
4. [Preguntas del tribunal](10-preguntas-del-tribunal.md)
5. [Galería visual](diagramas-y-capturas.md)

[Volver al README principal](../README.md)
