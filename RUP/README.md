# Corte Perfecto: trazabilidad RUP

Este directorio reúne artefactos vivos de requisitos, diseño, implementación y pruebas. Su estructura está inspirada en el enfoque de trazabilidad de `pySigHor` y adaptada al alcance real de Corte Perfecto.

## Artefactos principales

| Artefacto | Propósito |
| --- | --- |
| [Especificación de casos de uso](02-requisitos/especificacion-casos-uso.md) | Define actor, precondiciones, flujo, alternativas y postcondición de UC-01 a UC-17 |
| [Matriz de trazabilidad](99-seguimiento/trazabilidad-casos-uso.md) | Relaciona cada caso con interfaz, API, servicios, modelos y pruebas |
| [Auditoría diseño-implementación](99-seguimiento/auditoria-diseno-implementacion.md) | Contrasta el diseño del Capítulo 3 con el código |
| [Estado visual](99-seguimiento/estado-casos-uso.png) | Resume el estado de los 17 casos de uso |

## Relación con el repositorio

- `diagramas/` conserva fuentes PlantUML e imágenes generadas.
- `backend/` y `frontend/` contienen la implementación.
- `backend/tests/` verifica las reglas críticas.
- `docs/` proporciona la documentación académica y técnica navegable.
- `entregas/TFG_AdriánGarcíaArranz.pdf` es la memoria oficial.

[Volver al proyecto](../README.md) · [Documentación técnica](../docs/README.md)
