# 📚 Documentación de la API - Meeting5 Backend

## 🌐 URL Base
```
http://localhost:3000/api
```

---

## 🔐 Autenticación

Todos los endpoints protegidos requieren un token JWT en el header de autorización:
```
Authorization: Bearer <tu-token-jwt>
```

---

## 👤 Endpoints de Usuarios

### 1. Registrar Usuario
Crea una nueva cuenta de usuario.

**Endpoint:** `POST /users/register`

**Cuerpo de la Petición:**
```json
{
  "firstName": "Juan",
  "lastName": "Rodriguez",
  "age": 25,
  "email": "juan@example.com",
  "password": "password123"
}
```

**Respuesta (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "abc123",
      "firstName": "Juan",
      "lastName": "Rodriguez",
      "age": 25,
      "email": "juan@example.com",
      "createdAt": "2025-11-14T10:30:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Reglas de Validación:**
- `firstName`: Requerido, string no vacío
- `lastName`: Requerido, string no vacío
- `age`: Requerido, número entero entre 1-120
- `email`: Requerido, formato de email válido
- `password`: Requerido, mínimo 6 caracteres

---

### 2. Iniciar Sesión
Autentica un usuario y devuelve un token JWT.

**Endpoint:** `POST /users/login`

**Cuerpo de la Petición:**
```json
{
  "email": "juan@example.com",
  "password": "password123"
}
```

**Respuesta (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "abc123",
      "firstName": "Juan",
      "lastName": "Rodriguez",
      "age": 25,
      "email": "juan@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Respuesta de Error (401 Unauthorized):**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

---

### 3. Cerrar Sesión
Cierra la sesión del usuario autenticado.

**Endpoint:** `POST /users/logout`

**Headers:**
```
Authorization: Bearer <tu-token-jwt>
```

**Respuesta (200 OK):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

**Nota:** Con autenticación JWT, el cierre de sesión se maneja principalmente en el cliente eliminando el token. Este endpoint sirve como confirmación y registro.

---

### 4. Obtener Perfil de Usuario
Obtiene el perfil del usuario autenticado.

**Endpoint:** `GET /users/profile`

**Headers:**
```
Authorization: Bearer <tu-token-jwt>
```

**Respuesta (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "abc123",
    "firstName": "Juan",
    "lastName": "Rodriguez",
    "age": 25,
    "email": "juan@example.com",
    "createdAt": "2025-11-14T10:30:00.000Z"
  }
}
```

---

### 5. Actualizar Perfil de Usuario
Actualiza la información del usuario autenticado.

**Endpoint:** `PUT /users/profile`

**Headers:**
```
Authorization: Bearer <tu-token-jwt>
```

**Cuerpo de la Petición (todos los campos opcionales):**
```json
{
  "firstName": "Juan Sebastian",
  "lastName": "Rodriguez Ramirez",
  "age": 26,
  "email": "nuevoemail@example.com"
}
```

**Respuesta (200 OK):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "abc123",
    "firstName": "Juan Sebastian",
    "lastName": "Rodriguez Ramirez",
    "age": 26,
    "email": "nuevoemail@example.com"
  }
}
```

---

### 6. Eliminar Cuenta de Usuario
Elimina permanentemente la cuenta del usuario autenticado.

**Endpoint:** `DELETE /users/account`

**Headers:**
```
Authorization: Bearer <tu-token-jwt>
```

**Respuesta (200 OK):**
```json
{
  "success": true,
  "message": "Account deleted successfully"
}
```

**Nota:** Esta acción es irreversible y también elimina todas las reuniones asociadas.

---

### 7. Solicitar Recuperación de Contraseña
Envía un email de recuperación de contraseña con un token de reseteo.

**Endpoint:** `POST /users/password-reset/request`

**Cuerpo de la Petición:**
```json
{
  "email": "juan@example.com"
}
```

**Respuesta (200 OK):**
```json
{
  "success": true,
  "message": "If the email exists, you will receive instructions to reset your password"
}
```

**Nota:** Por seguridad, la respuesta es la misma exista o no el email. El usuario recibirá un email con un enlace de reseteo si la cuenta existe.

**Contenido del Email:**
El usuario recibe un email con un enlace de reseteo como:
```
http://localhost:5173/reset-password?token=abc-123-def-456
```
El token expira en 1 hora.

---

### 8. Confirmar Recuperación de Contraseña
Resetea la contraseña usando el token del email.

**Endpoint:** `POST /users/password-reset/confirm`

**Cuerpo de la Petición:**
```json
{
  "token": "abc-123-def-456",
  "newPassword": "nuevaPassword123"
}
```

**Respuesta (200 OK):**
```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

**Respuesta de Error (400 Bad Request):**
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

**Reglas de Validación:**
- `token`: Requerido, debe ser válido y no estar expirado
- `newPassword`: Requerido, mínimo 6 caracteres
- El token es de un solo uso (no puede reutilizarse)

---

## 📅 Endpoints de Reuniones

### 1. Crear Reunión
Crea una nueva reunión.

**Endpoint:** `POST /meetings`

**Headers:**
```
Authorization: Bearer <tu-token-jwt>
```

**Cuerpo de la Petición:**
```json
{
  "title": "Reunión de Equipo",
  "description": "Reunión diaria de standup",
  "scheduledAt": "2025-11-15T10:00:00.000Z",
  "duration": 30,
  "participants": ["user1@example.com", "user2@example.com"]
}
```

**Respuesta (201 Created):**
```json
{
  "success": true,
  "message": "Meeting created successfully",
  "data": {
    "id": "meeting123",
    "title": "Reunión de Equipo",
    "description": "Reunión diaria de standup",
    "scheduledAt": "2025-11-15T10:00:00.000Z",
    "duration": 30,
    "organizerId": "abc123",
    "participants": ["user1@example.com", "user2@example.com"],
    "createdAt": "2025-11-14T15:00:00.000Z"
  }
}
```

**Reglas de Validación:**
- `title`: Requerido, string no vacío
- `description`: Opcional, string
- `scheduledAt`: Requerido, fecha válida en formato ISO 8601
- `duration`: Requerido, número entero (minutos)
- `participants`: Opcional, array de emails válidos

---

### 2. Obtener Reuniones del Usuario
Obtiene todas las reuniones del usuario autenticado (como organizador o participante).

**Endpoint:** `GET /meetings`

**Headers:**
```
Authorization: Bearer <tu-token-jwt>
```

**Respuesta (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "meeting123",
      "title": "Reunión de Equipo",
      "description": "Reunión diaria de standup",
      "scheduledAt": "2025-11-15T10:00:00.000Z",
      "duration": 30,
      "organizerId": "abc123",
      "participants": ["user1@example.com", "user2@example.com"]
    }
  ]
}
```

---

### 3. Obtener Reunión por ID
Obtiene los detalles de una reunión específica.

**Endpoint:** `GET /meetings/:id`

**Headers:**
```
Authorization: Bearer <tu-token-jwt>
```

**Respuesta (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "meeting123",
    "title": "Reunión de Equipo",
    "description": "Reunión diaria de standup",
    "scheduledAt": "2025-11-15T10:00:00.000Z",
    "duration": 30,
    "organizerId": "abc123",
    "participants": ["user1@example.com", "user2@example.com"]
  }
}
```

**Respuesta de Error (404 Not Found):**
```json
{
  "success": false,
  "message": "Meeting not found"
}
```

---

### 4. Actualizar Reunión
Actualiza una reunión existente (solo el organizador puede actualizar).

**Endpoint:** `PUT /meetings/:id`

**Headers:**
```
Authorization: Bearer <tu-token-jwt>
```

**Cuerpo de la Petición (todos los campos opcionales):**
```json
{
  "title": "Reunión de Equipo Actualizada",
  "description": "Descripción actualizada",
  "scheduledAt": "2025-11-15T11:00:00.000Z",
  "duration": 45,
  "participants": ["user1@example.com", "user3@example.com"]
}
```

**Respuesta (200 OK):**
```json
{
  "success": true,
  "message": "Meeting updated successfully",
  "data": {
    "id": "meeting123",
    "title": "Reunión de Equipo Actualizada",
    "description": "Descripción actualizada",
    "scheduledAt": "2025-11-15T11:00:00.000Z",
    "duration": 45,
    "participants": ["user1@example.com", "user3@example.com"]
  }
}
```

**Respuesta de Error (403 Forbidden):**
```json
{
  "success": false,
  "message": "You can only update meetings you organize"
}
```

---

### 5. Eliminar Reunión
Elimina una reunión (solo el organizador puede eliminar).

**Endpoint:** `DELETE /meetings/:id`

**Headers:**
```
Authorization: Bearer <tu-token-jwt>
```

**Respuesta (200 OK):**
```json
{
  "success": true,
  "message": "Meeting deleted successfully"
}
```

**Respuesta de Error (403 Forbidden):**
```json
{
  "success": false,
  "message": "You can only delete meetings you organize"
}
```

---

## 🔓 Autenticación Social (Google & Facebook)

### 1. Login Social
Autentica o crea un usuario usando Google/Facebook.

**Endpoint:** `POST /auth/social/login`

**Cuerpo de la Petición:**
```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjAyZjg3...",
  "provider": "google"
}
```

**Proveedores:** `"google"` o `"facebook"`

**Respuesta (200 OK):**
```json
{
  "success": true,
  "message": "Social login successful",
  "data": {
    "user": {
      "id": "abc123",
      "firstName": "Juan",
      "lastName": "Rodriguez",
      "email": "juan@gmail.com",
      "age": 18,
      "provider": "google",
      "firebaseUid": "firebase-uid-123",
      "profilePicture": "https://lh3.googleusercontent.com/..."
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Cómo obtener el idToken (Frontend):**

1. Instalar Firebase SDK: `npm install firebase`
2. Inicializar Firebase con tu configuración
3. Usar Firebase Authentication:

```javascript
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

const auth = getAuth();
const provider = new GoogleAuthProvider();

const result = await signInWithPopup(auth, provider);
const idToken = await result.user.getIdToken();

// Enviar idToken al backend
fetch('http://localhost:3000/api/auth/social/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ idToken, provider: 'google' })
});
```

---

### 2. Vincular Cuenta Social
Vincula un proveedor social a una cuenta autenticada existente.

**Endpoint:** `POST /auth/social/link`

**Headers:**
```
Authorization: Bearer <tu-token-jwt>
```

**Cuerpo de la Petición:**
```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjAyZjg3...",
  "provider": "facebook"
}
```

**Respuesta (200 OK):**
```json
{
  "success": true,
  "message": "facebook account linked successfully"
}
```

---

## 🔧 Health Check

### Estado del Servidor
Verifica si el servidor está funcionando.

**Endpoint:** `GET /health`

**Respuesta (200 OK):**
```json
{
  "success": true,
  "message": "Server running correctly",
  "timestamp": "2025-11-14T15:30:00.000Z"
}
```

---

## ⚠️ Respuestas de Error

Todos los endpoints pueden devolver las siguientes respuestas de error:

### 400 Bad Request
Entrada inválida o error de validación.
```json
{
  "success": false,
  "message": "Validation error",
  "errors": [
    {
      "field": "email",
      "msg": "Invalid email"
    }
  ]
}
```

### 401 Unauthorized
Token de autenticación faltante o inválido.
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

### 404 Not Found
Recurso no encontrado.
```json
{
  "success": false,
  "message": "Route not found"
}
```

### 500 Internal Server Error
Error del servidor.
```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Detalles del error..."
}
```

---

## 🔑 Token JWT

### Estructura del Token
El token JWT contiene:
```json
{
  "userId": "abc123",
  "email": "juan@example.com",
  "iat": 1699963200,
  "exp": 1700568000
}
```

### Expiración del Token
- **Duración:** 7 días
- **Algoritmo:** HS256

### Uso del Token
Incluir en todos los endpoints protegidos:
```javascript
fetch('http://localhost:3000/api/users/profile', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### Gestión del Token en el Cliente
```javascript
// Guardar token después del login
localStorage.setItem('token', response.data.token);

// Recuperar token
const token = localStorage.getItem('token');

// Eliminar token al cerrar sesión
localStorage.removeItem('token');
```

---

## 📧 Notificaciones por Email

### Email de Recuperación de Contraseña
Cuando un usuario solicita recuperar su contraseña, recibe un email con:
- Asunto: "Password Recovery"
- Enlace de reseteo: `http://localhost:5173/reset-password?token=abc-123`
- Aviso de expiración: 1 hora
- Plantilla HTML profesional

### Email de Invitación a Reunión
Cuando se agregan participantes a una reunión, reciben:
- Asunto: "Meeting Invitation: [Título de la Reunión]"
- Detalles de la reunión (título, descripción, fecha, hora, duración)
- Enlace para unirse
- Plantilla HTML profesional

---

## 🌍 Configuración de CORS

El backend acepta peticiones desde:
- Por defecto: `http://localhost:5173`
- Configurable mediante la variable de entorno `FRONTEND_URL`

Las credenciales están habilitadas para autenticación basada en cookies si es necesario.

---

## 📝 Notas

### Formato de Fechas
Todas las fechas usan formato ISO 8601:
```
2025-11-15T10:00:00.000Z
```

### Emails de Participantes
Al crear/actualizar reuniones, los emails de participantes deben:
- Tener formato de email válido
- Pueden incluir usuarios no registrados (recibirán emails de invitación)

### Seguridad de Contraseñas
- Las contraseñas se hashean usando bcrypt (10 salt rounds)
- Nunca se devuelven en las respuestas de la API
- Se requiere mínimo 6 caracteres

### Permisos de Reuniones
- Solo el organizador puede actualizar/eliminar reuniones
- Los participantes pueden ver los detalles de la reunión
- Los usuarios pueden ver todas las reuniones que organizan o en las que participan

---

## 🚀 Ejemplo de Inicio Rápido

```javascript
// 1. Registrarse
const registerResponse = await fetch('http://localhost:3000/api/users/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    firstName: 'Juan',
    lastName: 'Rodriguez',
    age: 25,
    email: 'juan@example.com',
    password: 'password123'
  })
});
const { data: { token } } = await registerResponse.json();

// 2. Crear una reunión
const meetingResponse = await fetch('http://localhost:3000/api/meetings', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    title: 'Reunión de Equipo',
    description: 'Sincronización semanal',
    scheduledAt: '2025-11-15T10:00:00.000Z',
    duration: 60,
    participants: ['miembro1@example.com', 'miembro2@example.com']
  })
});

// 3. Obtener reuniones del usuario
const meetingsResponse = await fetch('http://localhost:3000/api/meetings', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const { data: meetings } = await meetingsResponse.json();

// 4. Cerrar sesión
await fetch('http://localhost:3000/api/users/logout', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
localStorage.removeItem('token');
```

---

## 📞 Soporte

Para problemas o preguntas, revisa los logs o contacta al equipo de backend.

Los logs del servidor incluyen información detallada sobre todas las operaciones y errores.
