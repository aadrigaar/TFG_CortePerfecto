# Corte Perfecto

Aplicacion web full-stack para el TFG de Ingenieria Informatica: peluqueria **Corte Perfecto** en Santander, con escaparate publico, chatbot conectado a LM Studio y panel de administracion para gestionar citas en MongoDB.

## Stack

- Frontend: React + Vite.
- Backend: Node.js + Express en arquitectura MVC.
- Base de datos: MongoDB + Mongoose.
- IA local: LM Studio con endpoint OpenAI-compatible.
- Modelo esperado: `meta-llama-3.1-8b-instruct`.

## Puesta en marcha

1. Instala dependencias:

```bash
npm install
npm run install:all
```

2. Prepara variables de entorno:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

3. Arranca MongoDB localmente y comprueba que este escuchando en `mongodb://127.0.0.1:27017`.

4. Abre LM Studio, carga **Meta Llama 3.1 8B Instruct** y activa el servidor local en:

```txt
http://127.0.0.1:1234
```

5. Lanza frontend y backend:

```bash
npm run dev
```

Frontend: `http://localhost:5173`  
Backend: `http://localhost:5000`

## Verificacion

El proyecto incluye comprobaciones automatizadas para las reglas criticas de agenda y el flujo conversacional:

```bash
npm run verify
```

Este comando ejecuta:

- `node --check` sobre el backend.
- Pruebas del backend con `node:test`.
- Build de produccion del frontend con Vite.

## Acceso administrador

Por defecto, si no existe ningun administrador en MongoDB, el backend crea uno automaticamente:

- Usuario: `admin`
- Contrasena: `admin123`

Puedes cambiarlo en `backend/.env`.

## Estructura

```txt
backend/
  src/
    config/
    controllers/
    middleware/
    models/
    routes/
    services/
    utils/
frontend/
  src/
    components/
    context/
    data/
    pages/
    services/
    styles/
RUP/
  99-seguimiento/
    trazabilidad-casos-uso.md
    auditoria-diseno-implementacion.md
    estado-casos-uso.puml
```

La carpeta `RUP/` funciona como evidencia viva de trazabilidad, inspirada en la organizacion del repositorio `pySigHor`.
