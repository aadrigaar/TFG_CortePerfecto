# Instalación y ejecución

## 1. Requisitos previos

| Requisito | Uso |
| --- | --- |
| Node.js 20 o superior | Frontend, backend y pruebas |
| npm | Gestión de dependencias y scripts |
| MongoDB | Persistencia de citas, servicios y administrador |
| LM Studio | Respuestas generativas locales |
| Git | Descarga y versionado |

El chatbot conserva funciones deterministas sin LM Studio, pero la demostración completa requiere cargar un modelo compatible.

## 2. Clonar e instalar

```bash
git clone https://github.com/aadrigaar/TFG_CortePerfecto.git
cd TFG_CortePerfecto
npm install
npm run install:all
```

El primer `npm install` instala herramientas de coordinación en la raíz. `install:all` instala las dependencias independientes de `backend/` y `frontend/`.

## 3. Variables de entorno

### Backend

Copia `backend/.env.example` a `backend/.env`.

```dotenv
NODE_ENV=development
PORT=5000
CLIENT_ORIGIN=http://localhost:5173

MONGODB_URI=mongodb://127.0.0.1:27017/corte_perfecto

JWT_SECRET=cambia-este-secreto-en-produccion
JWT_EXPIRES_IN=8h

ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
AUTO_SEED_ADMIN=true

LMSTUDIO_BASE_URL=http://127.0.0.1:1234/v1
LMSTUDIO_MODEL=meta-llama-3.1-8b-instruct
LMSTUDIO_TIMEOUT_MS=60000
```

### Frontend

Copia `frontend/.env.example` a `frontend/.env`.

```dotenv
VITE_API_URL=http://localhost:5000/api
```

Los `.env` reales están excluidos de Git. No deben publicarse secretos ni credenciales de producción.

## 4. Preparar MongoDB

Inicia MongoDB y verifica que acepta conexiones en la URI configurada. Con la configuración por defecto:

```text
mongodb://127.0.0.1:27017/corte_perfecto
```

El backend sincroniza el catálogo de servicios al arrancar. Si `AUTO_SEED_ADMIN=true` y no existe un administrador, crea el usuario configurado.

## 5. Preparar LM Studio

1. Abre LM Studio.
2. Descarga o selecciona un modelo instruct compatible.
3. Carga el modelo.
4. Inicia el servidor local.
5. Confirma que la base es `http://127.0.0.1:1234/v1`.
6. Ajusta `LMSTUDIO_MODEL` al identificador que exponga el servidor.

Comprobación:

```text
GET http://localhost:5000/api/health/lmstudio
```

Una respuesta `503` en este endpoint significa que el servidor local no está disponible; no implica que toda la aplicación haya fallado.

## 6. Ejecutar

### Todo el proyecto

```bash
npm run dev
```

### Por separado

```bash
npm run dev:backend
npm run dev:frontend
```

### Producción local

```bash
npm run build
npm run start
```

El build del frontend queda en `frontend/dist/`. El backend no sirve esa carpeta automáticamente; para un despliegue real debe configurarse un servidor estático o alojamiento independiente.

## 7. URLs

| Componente | Dirección |
| --- | --- |
| Web pública | `http://localhost:5173` |
| Login de administración | `http://localhost:5173/admin/login` |
| Dashboard | `http://localhost:5173/admin` |
| API | `http://localhost:5000/api` |
| Salud general | `http://localhost:5000/api/health` |
| Salud LM Studio | `http://localhost:5000/api/health/lmstudio` |

## 8. Credenciales de desarrollo

Con los valores del ejemplo:

```text
Usuario: admin
Contraseña: admin123
```

Son credenciales exclusivamente locales. Antes de cualquier despliegue hay que cambiarlas, establecer un `JWT_SECRET` robusto y desactivar el sembrado automático si no se necesita.

## 9. Verificar la instalación

```bash
npm run verify
```

Resultado esperado:

- Backend sin errores sintácticos.
- 44 pruebas superadas.
- Build de Vite completado.

Comprueba además:

```text
GET /api/health
GET /api/services
```

## 10. Problemas frecuentes

### MongoDB aparece desconectado

- Comprueba el servicio de MongoDB.
- Revisa `MONGODB_URI`.
- Verifica que el puerto no esté ocupado.

### LM Studio no responde

- Carga un modelo.
- Inicia el servidor local.
- Revisa base URL y nombre del modelo.
- Usa `/api/health/lmstudio` para separar un problema de IA de un problema de API.

### El frontend no conecta con el backend

- Revisa `VITE_API_URL`.
- Confirma que el backend escucha en el puerto 5000.
- Incluye el origen del frontend en `CLIENT_ORIGIN`.

### El administrador no puede iniciar sesión

- Revisa `AUTO_SEED_ADMIN`.
- Reinicia el backend tras cambiar credenciales.
- Si ya existe un usuario, el sembrado no sobrescribe su contraseña.

### Una cita es rechazada

Comprueba que sea futura, laborable, no se solape y que el servicio termine antes de las 20:00.

[Siguiente: API y datos](04-api-y-datos.md) · [Volver al índice](README.md)
