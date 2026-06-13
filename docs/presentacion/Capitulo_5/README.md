[Capítulo 4](../Capitulo_4/README.md) · [Inicio](../../../README.md) · [Presentación completa](../README.md)

# Capítulo 5. Evaluación, conclusiones y líneas futuras

## Cumplimiento de objetivos

| Objetivo | Evidencia | Estado |
| --- | --- | --- |
| Requisitos | Modelo de dominio, 17 casos de uso y reglas suplementarias | Cumplido |
| Análisis y diseño | Arquitectura, módulos, datos e integración local | Cumplido |
| Producto funcional | Web, chatbot, API, MongoDB y panel | Cumplido |
| Evaluación | Pruebas, build y trazabilidad | Cumplido |

## Verificación

```bash
npm run verify
```

Este comando encadena:

1. Comprobación sintáctica del backend.
2. Ejecución de **44 pruebas automatizadas**.
3. Build de producción del frontend.

## Cobertura de pruebas

| Archivo | Riesgos cubiertos |
| --- | --- |
| `appointmentService.test.js` | Horario, nombres, solapes, estados, propiedad y concurrencia |
| `bookingFlowService.test.js` | Contexto, servicios, fechas, horas, negaciones y correcciones |
| `calendarService.test.js` | Días laborables, formato temporal y lenguaje natural |
| `chatHardening.test.js` | Límites, instrucciones adversas, contingencia y filtrado |

Resultado:

```text
44 pruebas
44 superadas
0 fallos
```

## Resultados

- El cliente puede completar una reserva mediante conversación.
- El backend evita citas inválidas y solapadas.
- El profesional recibe la reserva en la misma agenda.
- La aplicación mantiene funciones críticas sin LM Studio.
- El catálogo es común para web, chat y administración.
- Los 17 casos de uso están trazados hasta el código.

## Seguridad y privacidad

- Bcrypt para contraseñas.
- JWT para autorización.
- Helmet, CORS y rate limiting.
- Validación de entrada.
- Secretos excluidos de Git.
- Inferencia local mediante LM Studio.

La ejecución local reduce transferencias a terceros, pero no constituye por sí sola una certificación de cumplimiento del RGPD.

## Limitaciones

| Limitación | Consecuencia |
| --- | --- |
| Ejecución local | El servicio depende del equipo del negocio |
| Una única agenda | No existen empleados o recursos independientes |
| Una instancia de backend | La cola local no coordina réplicas |
| Sin notificaciones | No hay recordatorios externos |
| Sin pagos | El precio es informativo |
| Modelo local | Las consultas abiertas dependen del modelo cargado |

## Líneas futuras

1. Recordatorios por correo o SMS.
2. Agenda multiempleado.
3. Recuperación de reservas desde otro dispositivo.
4. Despliegue con HTTPS y secretos gestionados.
5. Concurrencia distribuida.
6. Pruebas end-to-end y evaluación conversacional.

## Conclusión

Corte Perfecto demuestra que la inteligencia artificial puede incorporarse a un proceso real sin delegarle aquello que requiere exactitud.

La solución combina:

- Flexibilidad conversacional.
- Reglas verificables.
- Persistencia común.
- Control administrativo.
- Privacidad de inferencia local.

La aportación principal es la separación entre conversación y decisión:

> El modelo ayuda a comprender al cliente; el sistema conserva el control de la agenda.

## Resultado final

El alcance académico está implementado, trazado y verificado. El proyecto constituye una solución funcional para una peluquería local y una base técnica coherente para futuras ampliaciones.

**Documentación relacionada**

- [Capítulo 5 completo](../../capitulos/05-conclusiones-lineas-futuras.md)
- [Calidad, seguridad y pruebas](../../06-calidad-seguridad-y-pruebas.md)
- [Limitaciones y evolución](../../11-limitaciones-y-lineas-futuras.md)
- [Memoria oficial](../../../entregas/TFG_AdriánGarcíaArranz.pdf)

[Capítulo 4](../Capitulo_4/README.md) · [Inicio](../../../README.md) · [Presentación completa](../README.md)
