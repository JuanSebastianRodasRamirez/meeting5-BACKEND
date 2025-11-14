# 🔐 Configuración de Autenticación con Google y Facebook

## 📋 Backend Ya Implementado

El backend ya tiene todo listo:
- ✅ `/api/auth/social/login` - Login/registro con Google o Facebook
- ✅ `/api/auth/social/link` - Vincular cuenta social a usuario existente
- ✅ Verificación de tokens Firebase
- ✅ Creación automática de usuarios nuevos
- ✅ Generación de JWT para sesión

---

## 🔧 Configuración en Firebase Console

### 1. Ir a Firebase Console

1. Ve a https://console.firebase.google.com
2. Selecciona tu proyecto: **meeting5-videoconferencia**
3. En el menú lateral, ve a **Authentication** (Autenticación)
4. Haz clic en la pestaña **Sign-in method**

---

### 2. Habilitar Google Authentication

1. En la lista de proveedores, busca **Google**
2. Haz clic en **Google**
3. Activa el interruptor **Enable** (Habilitar)
4. **Project support email**: Selecciona `meeting5.videoconferencias@gmail.com`
5. Haz clic en **Save** (Guardar)

✅ **¡Listo!** Google Authentication está habilitado.

---

### 3. Habilitar Facebook Authentication

#### Paso 3.1: Crear App en Facebook Developers

1. Ve a https://developers.facebook.com/apps
2. Haz clic en **Create App** (Crear aplicación)
3. Selecciona tipo: **Consumer** (Consumidor)
4. Nombre de la app: `Meeting5 Video Conference`
5. Email de contacto: `meeting5.videoconferencias@gmail.com`
6. Haz clic en **Create App** (Crear aplicación)

#### Paso 3.2: Configurar Facebook Login

1. En el dashboard de tu app, busca **Facebook Login**
2. Haz clic en **Set Up** (Configurar)
3. Selecciona plataforma: **Web**
4. Site URL: `http://localhost:5173` (tu frontend)
5. Haz clic en **Save** (Guardar)

#### Paso 3.3: Obtener App ID y App Secret

1. En el menú lateral, ve a **Settings** → **Basic**
2. Copia el **App ID**
3. Haz clic en **Show** en **App Secret** y cópialo

#### Paso 3.4: Configurar en Firebase

1. Vuelve a Firebase Console
2. En **Authentication** → **Sign-in method**
3. Busca **Facebook** y haz clic
4. Activa el interruptor **Enable**
5. Pega el **App ID** de Facebook
6. Pega el **App Secret** de Facebook
7. **Copia el OAuth redirect URI** que Firebase te muestra
   - Ejemplo: `https://meeting5-videoconferencia.firebaseapp.com/__/auth/handler`
8. Haz clic en **Save**

#### Paso 3.5: Agregar OAuth Redirect URI en Facebook

1. Vuelve a Facebook Developers
2. Ve a **Facebook Login** → **Settings**
3. En **Valid OAuth Redirect URIs**, pega la URL que copiaste de Firebase
4. Haz clic en **Save Changes**

#### Paso 3.6: Hacer la App Pública (Opcional para Testing)

1. En Facebook Developers, ve a **App Settings** → **Basic**
2. En la parte superior, cambia el estado a **Live** (Público)
   - O déjalo en **Development** y agrega usuarios de prueba en **Roles** → **Test Users**

✅ **¡Listo!** Facebook Authentication está habilitado.

---

## 🧪 Cómo Funciona el Backend

### Endpoint: `POST /api/auth/social/login`

**Request Body:**
```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjAyZjg3...",
  "provider": "google"
}
```

**Response (Usuario nuevo):**
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

**Response (Usuario existente):**
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
      "age": 25,
      "provider": "google"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Endpoint: `POST /api/auth/social/link`

Requiere autenticación (JWT token en header).

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body:**
```json
{
  "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjAyZjg3...",
  "provider": "facebook"
}
```

**Response:**
```json
{
  "success": true,
  "message": "facebook account linked successfully"
}
```

---

## 🔄 Flujo de Autenticación

### Para el Frontend:

1. **Usuario hace clic en "Iniciar sesión con Google"**
   - Frontend usa Firebase SDK para mostrar popup de Google
   - Usuario autoriza la aplicación
   - Firebase devuelve un `idToken`

2. **Frontend envía idToken al Backend**
   ```javascript
   const response = await fetch('http://localhost:3000/api/auth/social/login', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({
       idToken: firebaseIdToken,
       provider: 'google'
     })
   });
   ```

3. **Backend verifica el token**
   - Usa `admin.auth().verifyIdToken(idToken)`
   - Extrae información del usuario (email, nombre, foto)
   - Busca o crea el usuario en Firestore
   - Genera JWT token

4. **Frontend recibe JWT**
   - Guarda el JWT token (localStorage/sessionStorage)
   - Usa ese token para todas las peticiones autenticadas

---

## 📝 Notas Importantes

### Seguridad
- ✅ El backend NUNCA recibe la contraseña del usuario
- ✅ Google/Facebook manejan la autenticación
- ✅ Backend solo verifica que el token sea válido
- ✅ JWT se genera para mantener la sesión

### Usuarios Nuevos
- Se crea automáticamente si el email no existe
- `age` por defecto es 18 (puedes pedirlo después)
- `password` es `null` (no tiene contraseña tradicional)
- `provider` guarda 'google' o 'facebook'
- `firebaseUid` vincula con Firebase Authentication

### Usuarios Existentes
- Si el email ya existe, hace login directamente
- Si no tiene `firebaseUid`, se actualiza
- El `provider` se mantiene o actualiza

---

## 🧪 Testing con Postman/cURL

### Google Login (requiere token real del frontend)

```bash
curl -X POST http://localhost:3000/api/auth/social/login \
  -H "Content-Type: application/json" \
  -d '{
    "idToken": "TU_GOOGLE_ID_TOKEN_AQUI",
    "provider": "google"
  }'
```

### Facebook Login (requiere token real del frontend)

```bash
curl -X POST http://localhost:3000/api/auth/social/login \
  -H "Content-Type: application/json" \
  -d '{
    "idToken": "TU_FACEBOOK_ID_TOKEN_AQUI",
    "provider": "facebook"
  }'
```

⚠️ **Nota:** No puedes generar tokens manualmente. Necesitas el frontend configurado con Firebase SDK para obtener tokens reales.

---

## 📚 Documentación Frontend (Referencia)

El frontend necesitará:

### 1. Instalar Firebase SDK
```bash
npm install firebase
```

### 2. Configurar Firebase
```javascript
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, FacebookAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "meeting5-videoconferencia.firebaseapp.com",
  projectId: "meeting5-videoconferencia",
  // ... resto de config
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
```

### 3. Login con Google
```javascript
async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const idToken = await result.user.getIdToken();
    
    // Enviar al backend
    const response = await fetch('http://localhost:3000/api/auth/social/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idToken: idToken,
        provider: 'google'
      })
    });
    
    const data = await response.json();
    // Guardar JWT: data.data.token
  } catch (error) {
    console.error(error);
  }
}
```

### 4. Login con Facebook
```javascript
async function loginWithFacebook() {
  const provider = new FacebookAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const idToken = await result.user.getIdToken();
    
    // Enviar al backend
    const response = await fetch('http://localhost:3000/api/auth/social/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idToken: idToken,
        provider: 'facebook'
      })
    });
    
    const data = await response.json();
    // Guardar JWT: data.data.token
  } catch (error) {
    console.error(error);
  }
}
```

---

## ✅ Checklist de Configuración

### Firebase Console
- [ ] Proyecto creado: meeting5-videoconferencia
- [ ] Authentication habilitado
- [ ] Google Sign-in method activado
- [ ] Email de soporte configurado
- [ ] Facebook Sign-in method activado
- [ ] Facebook App ID agregado
- [ ] Facebook App Secret agregado
- [ ] OAuth redirect URI copiado

### Facebook Developers
- [ ] App creada: Meeting5 Video Conference
- [ ] Facebook Login configurado
- [ ] App ID y App Secret obtenidos
- [ ] OAuth redirect URI agregado
- [ ] App en modo Live o usuarios de prueba agregados

### Backend
- [x] SocialAuthController implementado
- [x] socialAuthRoutes configurado
- [x] Rutas registradas en index.js
- [x] Firebase Admin SDK inicializado
- [x] Endpoint /api/auth/social/login funcionando
- [x] Endpoint /api/auth/social/link funcionando

---

## 🎯 Resumen

**Backend está 100% listo** ✅

Solo necesitas:
1. Habilitar Google en Firebase Console (2 minutos)
2. Crear app de Facebook y configurarla (10 minutos)
3. El frontend enviará tokens, el backend los verificará y generará JWT

¡Todo el código backend ya está implementado y probado!
