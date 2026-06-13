# Limitaciones y líneas futuras

## 1. Limitaciones actuales

### Ejecución local

MongoDB y LM Studio se ejecutan por defecto en el mismo equipo. Esto favorece privacidad y demostración, pero limita disponibilidad remota y exige recursos locales.

### Un recurso de agenda

El sistema modela una única agenda. No asigna empleados, sillones o especialidades. Dos servicios en el mismo intervalo se consideran incompatibles.

### Concurrencia de una instancia

La cola de escritura evita carreras dentro de un proceso. No coordina varias réplicas del backend.

### Persistencia conversacional en navegador

La cita activa se conserva en el estado del widget durante la sesión. No existe identificación personal del cliente ni recuperación en otro dispositivo.

### Sin notificaciones

No se envían confirmaciones o recordatorios externos. El usuario recibe la tarjeta en pantalla y el profesional ve la agenda.

### Sin pagos

El precio es informativo y sirve para estadísticas, pero no existe cobro ni devolución.

### Dependencia del modelo local

La calidad de las preguntas abiertas depende del modelo cargado, de sus recursos y de LM Studio. Las funciones deterministas reducen, pero no eliminan, esta variabilidad.

### Seguridad de alcance académico

JWT, bcrypt, CORS, Helmet y rate limiting proporcionan una base. Un servicio público requeriría endurecimiento operativo, HTTPS, gestión de secretos y auditoría.

## 2. Evolución priorizada

### Prioridad 1. Recordatorios

- Correo o SMS.
- Confirmación y cancelación mediante enlace.
- Tareas programadas.
- Registro de entrega.

Valor: reducir ausencias y llamadas.

### Prioridad 2. Agenda multiempleado

- Entidad `Employee`.
- Servicios por profesional.
- Intervalos y disponibilidad por recurso.
- Asignación automática o manual.

Valor: adaptar el sistema a un negocio real con varios trabajadores.

### Prioridad 3. Recuperación de reserva

- Código de consulta o enlace firmado.
- Identificación mínima.
- Modificación desde otro dispositivo.
- Política de caducidad.

### Prioridad 4. Despliegue

- Frontend estático.
- API detrás de HTTPS.
- MongoDB gestionado.
- Secretos externos.
- Logs estructurados y métricas.
- Copias de seguridad.

### Prioridad 5. Concurrencia distribuida

- Transacciones.
- Índices o slots únicos.
- Reintentos idempotentes.
- Pruebas de carga.

### Prioridad 6. Calidad conversacional

- Dataset de conversaciones anonimizadas.
- Evaluación repetible.
- Clasificador de intención.
- Recuperación de información del negocio.
- Comparación entre modelos locales.

## 3. Evolución de pruebas

- Playwright para recorridos end-to-end.
- MongoDB efímero para integración.
- Pruebas de contrato de API.
- Pruebas de accesibilidad.
- Pruebas de carga del chat.
- Evaluación de respuestas con casos dorados.

## 4. Evolución de privacidad

- Consentimiento e información visible.
- Minimización de datos.
- Política de conservación.
- Exportación y borrado.
- Registro de accesos.
- Cifrado y copias protegidas.

## 5. Criterio de priorización

Las mejoras deben evaluarse por:

1. Valor para cliente y profesional.
2. Riesgo que reducen.
3. Complejidad.
4. Dependencias.
5. Evidencia que puede verificarlas.

No todas las funciones merecen convertirse en microservicios ni usar IA. La evolución debe conservar el principio central: usar cada tecnología donde aporta valor y mantener verificables las reglas críticas.

## 6. Conclusión crítica

La versión actual cumple el objetivo académico y funcional definido. No pretende ser una plataforma SaaS terminada, sino un producto completo dentro de un alcance concreto y una base técnica razonable para continuar.

[Volver al índice](README.md) · [Presentación del proyecto](../PRESENTACION.md)
