# Demostración para la defensa

## 1. Objetivo

La demostración debe probar una historia completa, no enseñar pantallas sin conexión. El recorrido recomendado es:

```text
Cliente consulta -> reserva -> backend valida -> MongoDB guarda
-> administrador inicia sesión -> cita aparece -> administrador la gestiona
```

Duración objetivo: **4 minutos**.

## 2. Preparación anterior

Haz esta comprobación antes de entrar:

```bash
npm run verify
npm run dev
```

Comprueba:

1. MongoDB activo.
2. LM Studio activo y modelo cargado.
3. `http://localhost:5000/api/health` responde.
4. `http://localhost:5000/api/health/lmstudio` responde.
5. Login administrativo válido.
6. No existe una cita de prueba en el horario elegido.
7. Navegador en la web pública.

Ten abiertas estas pestañas:

- Web pública.
- Login del administrador.
- README del repositorio.

No abras editores, terminales ni ventanas que contengan contraseñas durante la presentación.

## 3. Datos de demostración

Elige una fecha laborable futura y una hora claramente disponible. Ejemplo:

```text
Nombre: Adrián Demo
Servicio: Corte y Peinado
Fecha: próximo martes
Hora: 17:00
```

No reutilices literalmente una fecha de este documento: comprueba el calendario el día de la defensa.

## 4. Guion de la demo

### Paso 1. Web pública, 30 segundos

Muestra la portada y los servicios.

Di:

> “Esta es la entrada para el cliente. El catálogo no está duplicado en cada pantalla: procede de una fuente central que también usa el backend para calcular precio y duración.”

### Paso 2. Pregunta informativa, 30 segundos

Abre el chat y pregunta:

```text
¿Qué servicios tenéis y cuánto cuestan?
```

Di:

> “Las preguntas críticas y frecuentes se resuelven con reglas deterministas. No necesito gastar inferencia ni depender de que el modelo recuerde correctamente el precio.”

### Paso 3. Reserva conversacional, 90 segundos

Usa mensajes naturales:

```text
Quiero reservar la opción 4.
Me llamo Adrián Demo.
El próximo martes a las cinco de la tarde.
```

Muestra la tarjeta final.

Di:

> “El asistente conserva el contexto y entiende número de opción, fecha relativa y hora natural. La confirmación solo aparece después de validar el intervalo y guardar la cita.”

### Paso 4. Regla de negocio, 30 segundos

Puedes enseñar una validación antes de la reserva válida:

```text
El sábado a las cinco.
```

Di:

> “El rechazo no depende del modelo. El backend sabe que el negocio cierra en fin de semana y no crea ningún dato.”

Usa esta prueba solo si no rompe el ritmo. La reserva válida es prioritaria.

### Paso 5. Panel administrativo, 60 segundos

Inicia sesión, abre la agenda y localiza la cita.

Di:

> “La reserva del chat y el panel comparten MongoDB. El profesional recibe la cita sin transcribir el mensaje y puede editarla, completarla o eliminarla.”

Muestra el dashboard o el filtro, pero no realices varias operaciones innecesarias.

## 5. Qué debe observar el tribunal

- Interfaz diferenciada para cliente y administrador.
- Conversación natural.
- Validación real.
- Persistencia entre vistas.
- Seguridad del panel.
- Trazabilidad con el repositorio.

## 6. Plan de contingencia

### Si LM Studio falla

Haz una pregunta determinista y una reserva. Explica:

> “La arquitectura degrada de forma controlada. Las reglas de negocio y las reservas no dependen de que el modelo esté disponible.”

### Si MongoDB falla

No intentes reservar repetidamente. Enseña capturas y explica:

> “El sistema no muestra confirmación porque la persistencia es obligatoria. Esta captura documenta el recorrido completo y el endpoint de salud permite aislar la causa.”

### Si no hay red

No afecta a la ejecución local una vez instaladas las dependencias. El repositorio debe estar abierto previamente.

### Si el proyector dificulta leer

Usa zoom del navegador y enseña una función por pantalla. Evita desplazamientos rápidos.

## 7. Capturas de respaldo

- [Web pública](../diagramas/capitulo4/capturas/01_home.png)
- [Servicios](../diagramas/capitulo4/capturas/02_servicios.png)
- [Chat abierto](../diagramas/capitulo4/capturas/03_chat_abierto.png)
- [Login](../diagramas/capitulo4/capturas/04_admin_login.png)
- [Dashboard](../diagramas/capitulo4/capturas/05_admin_dashboard.png)
- [Agenda](../diagramas/capitulo4/capturas/06_admin_citas.png)
- [Crear cita](../diagramas/capitulo4/capturas/07_admin_crear_cita.png)

## 8. Cierre de la demo

Termina con:

> “Con este recorrido se ve el objetivo completo: atención automática para el cliente, integridad en el backend y control humano desde el panel.”

[Siguiente: guion de 20 minutos](09-guion-defensa-20-min.md) · [Volver al índice](README.md)
