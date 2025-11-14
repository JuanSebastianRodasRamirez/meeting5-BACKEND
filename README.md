# Meeting5 - Backend de Plataforma de Videoconferencias

Backend para plataforma de videoconferencias del Sprint 1.

## Características

- ✅ Registro de usuarios (nombre, apellido, edad, correo, contraseña)
- ✅ Login con múltiples proveedores (manual, Google, Facebook)
- ✅ Edición de perfil de usuario
- ✅ Eliminación de cuenta
- ✅ Recuperación de contraseña por correo electrónico
- ✅ Creación y gestión de reuniones de videoconferencia
- ✅ Base de datos Firebase/Firestore
- ✅ Autenticación con JWT
- ✅ Validación de datos con express-validator
- ✅ Documentación con JSDoc

## Tecnologías

- Node.js + Express
- Firebase Admin SDK (Firestore)
- JWT para autenticación
- Bcrypt para hashing de contraseñas
- Nodemailer para envío de correos
- Express-validator para validación

## Estructura del Proyecto

```
api/
├── config/         # Configuraciones (Firebase)
├── controllers/    # Controladores de rutas
├── dao/           # Data Access Objects
├── middleware/    # Middlewares (auth, validation)
├── models/        # Modelos de datos
├── routes/        # Definición de rutas
├── utils/         # Utilidades (JWT, email, logger)
└── index.js       # Punto de entrada
```

## Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno:
```bash
cp .env.example .env
```

3. Editar `.env` con tus credenciales de Firebase y configuración de email.

## Uso

### Desarrollo
```bash
npm run dev
```

### Producción
```bash
npm start
```

El servidor correrá en `http://localhost:3000`

## Endpoints API

### Usuarios

#### POST /api/users/register
Registra un nuevo usuario
```json
{
  "firstName": "Juan",
  "lastName": "Pérez",
  "age": 25,
  "email": "juan@example.com",
  "password": "password123",
  "provider": "manual"
}
```

#### POST /api/users/login
Inicia sesión
```json
{
  "email": "juan@example.com",
  "password": "password123",
  "provider": "manual"
}
```

#### GET /api/users/profile
Obtiene el perfil del usuario autenticado (requiere token)

#### PUT /api/users/profile
Actualiza el perfil del usuario (requiere token)
```json
{
  "firstName": "Juan",
  "lastName": "Pérez",
  "age": 26,
  "email": "nuevo@example.com"
}
```

#### DELETE /api/users/account
Elimina la cuenta del usuario (requiere token)

#### POST /api/users/password-reset/request
Solicita recuperación de contraseña
```json
{
  "email": "juan@example.com"
}
```

#### POST /api/users/password-reset/confirm
Resetea la contraseña con token
```json
{
  "token": "token-recibido-por-email",
  "newPassword": "nuevaPassword123"
}
```

### Reuniones

#### POST /api/meetings
Crea una nueva reunión (requiere token)
```json
{
  "title": "Reunión de equipo",
  "description": "Discutir proyecto",
  "scheduledAt": "2025-11-15T10:00:00Z",
  "participants": ["userId1", "userId2"]
}
```

#### GET /api/meetings
Obtiene todas las reuniones del usuario (requiere token)

#### GET /api/meetings/:id
Obtiene una reunión específica (requiere token)

#### PUT /api/meetings/:id
Actualiza una reunión (requiere token, solo anfitrión)
```json
{
  "title": "Reunión actualizada",
  "description": "Nueva descripción",
  "status": "ongoing"
}
```

#### DELETE /api/meetings/:id
Elimina una reunión (requiere token, solo anfitrión)

## Autenticación

Todas las rutas protegidas requieren un header de autorización:
```
Authorization: Bearer <token-jwt>
```

## Base de Datos (Firestore)

### Colecciones

- **users**: Información de usuarios
- **meetings**: Reuniones de videoconferencia
- **passwordResetTokens**: Tokens de recuperación de contraseña

## Licencia

ISC
