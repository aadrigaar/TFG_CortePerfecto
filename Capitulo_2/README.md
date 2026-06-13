[Capítulo 1](../Capitulo_1/README.md) · [Inicio](../README.md) · [Capítulo 3](../Capitulo_3/README.md)

# Capítulo 2. Requisitos y modelo del dominio

## Actores

El sistema tiene dos actores humanos:

| Actor | Necesidad |
| --- | --- |
| Cliente | Consultar información y gestionar una reserva mediante conversación |
| Administrador o peluquero | Supervisar y operar la agenda desde un entorno privado |

![Diagrama de contexto](../diagramas/capitulo2/imagenes/04_diagrama_contexto.png)

## Modelo del dominio

![Diagrama de clases del dominio](../diagramas/capitulo2/imagenes/01_diagrama_clases_dominio.png)

Los conceptos principales son:

| Concepto | Responsabilidad |
| --- | --- |
| Cliente | Aporta la información de la reserva |
| Conversación | Mantiene el contexto del intercambio |
| Cita | Representa el servicio reservado y su intervalo temporal |
| Agenda | Contiene las citas y controla la disponibilidad |
| Administrador | Gestiona el ciclo de vida de las citas |
| Servicio | Define nombre, precio y duración |

La cita es la entidad central. Además de los valores visibles `date` y `time`, almacena `startsAt` y `endsAt`. Esta decisión permite comprobar correctamente solapes entre servicios con distinta duración.

## Estados de una cita

![Estados de la cita](../diagramas/capitulo2/imagenes/03_diagrama_estados_cita.png)

```text
pending / confirmed -> bloquean horario
completed / cancelled -> no bloquean horario
```

## Casos de uso

Se han definido 17 casos de uso.

### Cliente

| UC | Caso de uso |
| --- | --- |
| UC-01 | Consultar web pública |
| UC-02 | Consultar servicios y precios |
| UC-03 | Pedir detalle de una opción |
| UC-04 | Abrir chat y enviar mensaje |
| UC-05 | Reservar cita por chatbot |
| UC-06 | Elegir servicio por número |
| UC-07 | Aportar nombre, día y hora |
| UC-08 | Recibir confirmación y tarjeta |
| UC-09 | Modificar reserva activa por chat |

![Casos de uso del cliente](../diagramas/capitulo2/imagenes/05a_diagrama_casos_uso_cliente.png)

### Administrador

| UC | Caso de uso |
| --- | --- |
| UC-10 | Iniciar sesión |
| UC-11 | Ver dashboard |
| UC-12 | Listar, filtrar y ordenar citas |
| UC-13 | Crear una cita manual |
| UC-14 | Editar una cita |
| UC-15 | Marcar una cita como completada |
| UC-16 | Eliminar una cita |
| UC-17 | Cerrar sesión |

![Casos de uso del administrador](../diagramas/capitulo2/imagenes/05b_diagrama_casos_uso_administrador.png)

## Reglas suplementarias

| Área | Regla |
| --- | --- |
| Calendario | Solo se admiten días de lunes a viernes |
| Horario | Apertura de 10:00 a 20:00 |
| Integridad | El servicio debe finalizar antes del cierre |
| Disponibilidad | No se permiten solapes entre citas activas |
| Catálogo | Solo existen siete opciones oficiales |
| Seguridad | Las rutas administrativas requieren JWT |
| Privacidad | La inferencia del modelo se realiza en local |
| Robustez | La caída de LM Studio no debe confirmar datos falsos |

## Trazabilidad

Cada caso de uso está relacionado con su interfaz, endpoint, controlador, servicio, modelo y prueba.

Ejemplo:

```text
Evitar solapes
-> UC-05, UC-09, UC-13 y UC-14
-> POST/PATCH de citas
-> appointmentService
-> Appointment.startsAt / endsAt
-> appointmentService.test.js
```

## Resultado del capítulo

El problema del Capítulo 1 queda convertido en un contrato verificable: dos actores, 17 casos de uso, un modelo de dominio y reglas de integridad que guían el diseño y la implementación.

**Documentación relacionada**

- [Capítulo 2 completo](../docs/capitulos/02-requisitos-modelo-dominio.md)
- [Especificación de UC-01 a UC-17](../RUP/02-requisitos/especificacion-casos-uso.md)
- [Matriz UC-código-prueba](../RUP/99-seguimiento/trazabilidad-casos-uso.md)
- [Galería de diagramas](../docs/diagramas-y-capturas.md)

[Capítulo 1](../Capitulo_1/README.md) · [Inicio](../README.md) · [Capítulo 3](../Capitulo_3/README.md)
