# 📡 Documentación API - Endpoints para Integración con Chat Service

## 🎯 Propósito

Este documento describe los **nuevos endpoints** agregados al backend principal (`meeting5-backend`) para soportar la integración con el microservicio de chat (`meeting5-chat`). Estos endpoints permiten al chat service verificar autenticación de usuarios y autorización de acceso a reuniones.

---

## 🌐 Información del Servicio

- **URL Desarrollo**: `http://localhost:3000`
- **URL Producción**: `https://meeting5-backend.onrender.com`
- **Protocolo**: HTTP REST
- **Autenticación**: JWT Bearer Token
- **Formato de Respuesta**: JSON

---

## 🔑 Autenticación

Todos los endpoints requieren un **JWT token** válido en el header `Authorization`:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### ¿Cómo obtener el token?

El token JWT se obtiene al hacer login:

```http
POST /api/users/login
Content-Type: application/json

{
  "email": "usuario@example.com",
  "password": "tu_password"
}
```

**Respuesta exitosa**:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "juzmBVMYhtudeiJK4pwp",
      "email": "rodas.ramirez.juan@correounivalle.edu.co",
      "firstName": "Juan",
      "lastName": "Rodas"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## 📋 Endpoints para Chat Integration

### 1. Verificar Validez de Token

**Endpoint**: `GET /api/users/verify-token`

**Propósito**: Validar que un JWT token es válido y obtener el ID del usuario asociado.

**Headers Requeridos**:
```http
Authorization: Bearer {JWT_TOKEN}
```

**Cuándo usar**: 
- Al conectar un WebSocket al chat service
- Para verificar sesiones activas
- Antes de realizar operaciones sensibles

---

#### ✅ Respuesta Exitosa

**Status Code**: `200 OK`

**Body**:
```json
{
  "success": true,
  "valid": true,
  "userId": "juzmBVMYhtudeiJK4pwp"
}
```

**Campos**:
- `success` (boolean): Indica que la petición fue procesada
- `valid` (boolean): `true` si el token es válido
- `userId` (string): ID único del usuario autenticado

---

#### ❌ Respuestas de Error

**Token no proporcionado**

**Status Code**: `401 Unauthorized`

```json
{
  "success": false,
  "message": "Access denied. No token provided"
}
```

---

**Token inválido o expirado**

**Status Code**: `401 Unauthorized`

```json
{
  "success": false,
  "valid": false,
  "message": "Invalid token"
}
```

---

**Error del servidor**

**Status Code**: `500 Internal Server Error`

```json
{
  "success": false,
  "message": "Failed to verify token",
  "error": "Descripción del error"
}
```

---

### 2. Obtener Participantes de una Reunión

**Endpoint**: `GET /api/meetings/:id/participants`

**Propósito**: Verificar que un usuario tiene acceso a una reunión específica y obtener información de todos los participantes.

**Headers Requeridos**:
```http
Authorization: Bearer {JWT_TOKEN}
```

**Parámetros de URL**:
- `id` (string): ID único de la reunión (UUID)

**Cuándo usar**:
- Antes de permitir que un usuario se una al chat de una reunión
- Para mostrar la lista de participantes en el frontend
- Para verificar permisos de acceso a recursos de la reunión

---

#### ✅ Respuesta Exitosa

**Status Code**: `200 OK`

**Body**:
```json
{
  "success": true,
  "data": {
    "meetingId": "Yqry6zKtEfYcrIkg8ptw",
    "title": "Test Meeting Chat",
    "description": "Esto es una prueba de chat",
    "hostId": "juzmBVMYhtudeiJK4pwp",
    "host": {
      "id": "juzmBVMYhtudeiJK4pwp",
      "firstName": "Juan",
      "lastName": "Rodas",
      "email": "rodas.ramirez.juan@correounivalle.edu.co"
    },
    "participants": [
      "juzmBVMYhtudeiJK4pwp"
    ],
    "participantDetails": [
      {
        "id": "juzmBVMYhtudeiJK4pwp",
        "firstName": "Juan",
        "lastName": "Rodas",
        "email": "rodas.ramirez.juan@correounivalle.edu.co"
      }
    ],
    "status": "scheduled",
    "scheduledAt": "2024-12-30T10:00:00.000Z",
    "meetingUrl": "https://meet.example.com/Yqry6zKtEfYcrIkg8ptw"
  }
}
```

**Campos**:
- `meetingId` (string): ID único de la reunión
- `title` (string): Título de la reunión
- `description` (string): Descripción de la reunión
- `hostId` (string): ID del usuario que creó la reunión
- `host` (object): Detalles completos del host
  - `id` (string): ID del host
  - `firstName` (string): Nombre del host
  - `lastName` (string): Apellido del host
  - `email` (string): Email del host
- `participants` (array[string]): Lista de IDs de participantes
- `participantDetails` (array[object]): Detalles completos de cada participante
  - `id` (string): ID del participante
  - `firstName` (string): Nombre del participante
  - `lastName` (string): Apellido del participante
  - `email` (string): Email del participante
- `status` (string): Estado de la reunión (`"scheduled"`, `"ongoing"`, `"completed"`, `"cancelled"`)
- `scheduledAt` (string): Fecha y hora programada (formato ISO 8601)
- `meetingUrl` (string): URL de la reunión

---

#### ❌ Respuestas de Error

**Token no proporcionado**

**Status Code**: `401 Unauthorized`

```json
{
  "success": false,
  "message": "Access denied. No token provided"
}
```

---

**Reunión no encontrada**

**Status Code**: `404 Not Found`

```json
{
  "success": false,
  "message": "Meeting not found"
}
```

---

**Usuario no tiene acceso a la reunión**

**Status Code**: `403 Forbidden`

```json
{
  "success": false,
  "message": "Access denied to this meeting"
}
```

**Explicación**: El usuario autenticado no es el host ni está en la lista de participantes de la reunión.

---

**Error del servidor**

**Status Code**: `500 Internal Server Error`

```json
{
  "success": false,
  "message": "Failed to get meeting participants",
  "error": "Descripción del error"
}
```

---

## 🔐 Lógica de Autorización

### Endpoint: `/api/users/verify-token`

1. Extrae el token del header `Authorization`
2. Verifica que el token existe
3. Valida el token usando la clave secreta JWT
4. Retorna el `userId` si es válido

**Código de verificación**:
- Token válido → `200 OK` con `userId`
- Token inválido/expirado → `401 Unauthorized`
- Sin token → `401 Unauthorized`

---

### Endpoint: `/api/meetings/:id/participants`

1. Extrae el token del header `Authorization`
2. Valida el token y obtiene el `userId`
3. Busca la reunión por `id` en Firestore
4. Verifica que el usuario tiene acceso:
   ```javascript
   hasAccess = meeting.hostId === userId || meeting.participants.includes(userId)
   ```
5. Obtiene los detalles de cada participante desde la colección de usuarios
6. Retorna toda la información de la reunión y participantes

**Flujo de autorización**:
- Usuario es host → ✅ Acceso permitido
- Usuario está en `participants` → ✅ Acceso permitido
- Usuario no relacionado → ❌ `403 Forbidden`
- Reunión no existe → ❌ `404 Not Found`

---

## 🔄 Flujo de Integración con Chat Service

### Conexión al Chat (Secuencia Completa)

```mermaid
sequenceDiagram
    participant C as Cliente (Frontend)
    participant CS as Chat Service
    participant B as Backend Principal

    C->>B: POST /api/users/login
    B->>C: {token, user}
    
    C->>CS: WebSocket connect {auth: {token}}
    CS->>B: GET /api/users/verify-token
    B->>CS: {valid: true, userId}
    CS->>C: connect event
    
    C->>CS: emit join-room {meetingId, token}
    CS->>B: GET /api/meetings/:id/participants
    B->>CS: {meetingId, title, participants...}
    CS->>C: room-joined event
    
    C->>CS: emit send-message {content}
    CS->>C: new-message event (a todos en la sala)
```

---

### Paso a Paso

1. **Usuario hace login** en el backend principal
   ```
   POST /api/users/login → obtiene JWT token
   ```

2. **Frontend conecta al Chat Service** con el token
   ```javascript
   socket.connect({ auth: { token } })
   ```

3. **Chat Service verifica el token** llamando al backend:
   ```
   GET /api/users/verify-token (con header Authorization)
   → Backend retorna {valid: true, userId}
   ```

4. **Si el token es válido**, el WebSocket se conecta exitosamente

5. **Usuario se une a una sala** emitiendo `join-room`
   ```javascript
   socket.emit('join-room', { meetingId, token })
   ```

6. **Chat Service verifica permisos** llamando al backend:
   ```
   GET /api/meetings/{meetingId}/participants (con header Authorization)
   → Backend verifica que userId tiene acceso
   → Backend retorna detalles de participantes
   ```

7. **Si tiene acceso**, recibe evento `room-joined` y puede chatear

---

## 🛡️ Seguridad

### Validaciones Implementadas

✅ **Autenticación JWT obligatoria** en todos los endpoints  
✅ **Verificación de propiedad**: Solo host o participantes pueden acceder  
✅ **Tokens de corta duración**: JWT expira en 7 días  
✅ **CORS configurado**: Solo acepta requests de frontend y chat service  
✅ **Validación de datos**: Firestore valida estructura de datos  
✅ **Logs de seguridad**: Winston registra intentos de acceso no autorizado  

### Variables de Entorno

**Backend Principal** (`.env`):
```env
# CORS - Permitir requests desde chat service
CHAT_SERVICE_URL=http://localhost:3001

# JWT Configuration
JWT_SECRET=tu_clave_secreta_aqui
JWT_EXPIRE=7d
```

---

## 🧪 Testing de los Endpoints

### Test 1: Verificar Token

**PowerShell**:
```powershell
$token = "TU_JWT_TOKEN_AQUI"
$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-WebRequest -Uri "http://localhost:3000/api/users/verify-token" `
    -Method GET `
    -Headers $headers | Select -ExpandProperty Content
```

**cURL**:
```bash
curl -X GET "http://localhost:3000/api/users/verify-token" \
  -H "Authorization: Bearer TU_JWT_TOKEN_AQUI"
```

**Respuesta esperada**:
```json
{
  "success": true,
  "valid": true,
  "userId": "juzmBVMYhtudeiJK4pwp"
}
```

---

### Test 2: Obtener Participantes

**PowerShell**:
```powershell
$token = "TU_JWT_TOKEN_AQUI"
$meetingId = "Yqry6zKtEfYcrIkg8ptw"
$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-WebRequest -Uri "http://localhost:3000/api/meetings/$meetingId/participants" `
    -Method GET `
    -Headers $headers | Select -ExpandProperty Content
```

**cURL**:
```bash
curl -X GET "http://localhost:3000/api/meetings/Yqry6zKtEfYcrIkg8ptw/participants" \
  -H "Authorization: Bearer TU_JWT_TOKEN_AQUI"
```

**Respuesta esperada**:
```json
{
  "success": true,
  "data": {
    "meetingId": "Yqry6zKtEfYcrIkg8ptw",
    "title": "Test Meeting Chat",
    "hostId": "juzmBVMYhtudeiJK4pwp",
    "host": {...},
    "participants": ["..."],
    "participantDetails": [...]
  }
}
```

---

## 🚨 Manejo de Errores

### Códigos de Estado HTTP

| Código | Significado | Cuándo Ocurre |
|--------|-------------|---------------|
| `200` | OK | Petición exitosa |
| `401` | Unauthorized | Token inválido o no proporcionado |
| `403` | Forbidden | Sin permisos para acceder al recurso |
| `404` | Not Found | Reunión no existe |
| `500` | Internal Server Error | Error en el servidor |

### Errores Comunes y Soluciones

**Error**: `"Access denied. No token provided"`  
**Causa**: No se envió el header `Authorization`  
**Solución**: Incluir `Authorization: Bearer {token}` en los headers

---

**Error**: `"Invalid token"`  
**Causa**: Token expirado o malformado  
**Solución**: Hacer login nuevamente para obtener un token válido

---

**Error**: `"Meeting not found"`  
**Causa**: El `meetingId` no existe en la base de datos  
**Solución**: Verificar que el ID sea correcto

---

**Error**: `"Access denied to this meeting"`  
**Causa**: El usuario no es host ni participante  
**Solución**: Verificar que el usuario fue invitado a la reunión

---

## 📊 Configuración CORS

El backend acepta requests de:

1. **Frontend** (`http://localhost:5173` en desarrollo)
2. **Chat Service** (`http://localhost:3001` en desarrollo)

**Configuración en `api/index.ts`**:
```typescript
const frontUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
const chatServiceUrl = process.env.CHAT_SERVICE_URL || 'http://localhost:3001';

app.use(cors({
  origin: [frontUrl, chatServiceUrl],
  credentials: true
}));
```

---

## 🔗 Endpoints Relacionados

Estos endpoints complementan la funcionalidad de chat:

### Listar Reuniones del Usuario
```
GET /api/meetings
Authorization: Bearer {token}
```

Obtiene todas las reuniones donde el usuario es host o participante.

---

### Obtener Detalles de una Reunión
```
GET /api/meetings/:id
Authorization: Bearer {token}
```

Obtiene información completa de una reunión (similar a `/participants` pero con más datos).

---

### Crear una Reunión
```
POST /api/meetings
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Nueva Reunión",
  "description": "Descripción opcional",
  "scheduledAt": "2024-12-30T10:00:00.000Z",
  "participants": ["userId1", "userId2"]
}
```

---

## 💡 Recomendaciones para Desarrolladores

1. **Almacenar el token de forma segura** en el frontend (localStorage, sessionStorage, o cookies httpOnly)

2. **Implementar refresh de tokens** si el JWT expira durante una sesión activa

3. **Cachear la lista de participantes** para no llamar al endpoint en cada mensaje

4. **Manejar reconexiones** del WebSocket verificando el token nuevamente

5. **Validar permisos en el frontend** antes de mostrar opciones de chat

6. **Usar interceptores HTTP** (Axios) para agregar el header `Authorization` automáticamente

7. **Implementar retry logic** para errores de red transitorios

---

## 📚 Documentación Relacionada

- **API Principal del Backend**: Ver `API_DOCUMENTATION.md`
- **Integración con Chat Service**: Ver `CHAT_INTEGRATION_API.md` (este documento)
- **Instrucciones para Chat Service**: Ver `CHAT_MICROSERVICE_INSTRUCTIONS.md`
- **Chat Service Client Integration**: Ver repositorio `meeting5-CHAT`

---

## 🆕 Changelog

### Sprint 2 (Noviembre 2025)
- ✅ Agregado endpoint `GET /api/users/verify-token`
- ✅ Agregado endpoint `GET /api/meetings/:id/participants`
- ✅ Configuración CORS actualizada para chat service
- ✅ Documentación completa de integración

---

## 📞 Soporte

**¿Problemas con la integración?**

1. Verificar que el backend está corriendo en `http://localhost:3000`
2. Verificar que `CHAT_SERVICE_URL` está configurado en `.env`
3. Confirmar que el token JWT es válido (usar `/verify-token`)
4. Revisar logs del servidor (Winston) para errores detallados

**Repositorios**:
- Backend Principal: `https://github.com/JuanSebastianRodasRamirez/meeting5-BACKEND`
- Chat Service: `https://github.com/JuanSebastianRodasRamirez/meeting5-CHAT`

---

**¡Integración exitosa! 🚀**
