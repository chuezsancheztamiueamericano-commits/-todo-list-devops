# Todo List DevOps

SPA To-Do List con CI/CD - TP DevOps UPSE

Aplicación web de lista de tareas con arquitectura full-stack, despliegue automatizado mediante Docker y GitHub Actions.

## 🏗️ Arquitectura

- **Frontend**: Vanilla JavaScript + HTML5 + CSS3 (servido estáticamente)
- **Backend**: Node.js + Express.js
- **Base de datos**: MySQL 8.0
- **Contenedorización**: Docker + Docker Compose
- **CI/CD**: GitHub Actions para despliegue automático en VPS

## 📋 Características

- ✅ Crear, editar, eliminar y marcar tareas como completadas
- 🔍 Filtrado en tiempo real de tareas
- 📊 Progreso visual de tareas completadas
- 🎨 Interfaz moderna con diseño responsivo
- 🔒 Validación de entrada y sanitización XSS
- 🌐 Configuración CORS personalizable
- 💾 Persistencia en base de datos MySQL
- 🐳 Despliegue con Docker Compose
- 🚀 CI/CD automatizado con GitHub Actions

## 🚀 Instalación y Ejecución Local

### Requisitos previos
- Docker y Docker Compose instalados
- Git

### Pasos de instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd -todo-list-devops
```

2. **Configurar variables de entorno**
```bash
cp .env.example .env
```

Editar el archivo `.env` con tus credenciales:
```env
DB_HOST=mysql
DB_USER=todo_app
DB_PASSWORD=tu_contraseña_segura
DB_NAME=todolist_db
MYSQL_ROOT_PASSWORD=tu_contraseña_root
PORT=3000
ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

3. **Ejecutar con Docker Compose**
```bash
docker-compose up --build
```

La aplicación estará disponible en `http://localhost:3000`

## 🐳 Despliegue en Producción

### Opción 1: Despliegue con Dirección IP (Sin Dominio)

Si no tienes un dominio, puedes usar la dirección IP de tu VPS directamente.

**IP del VPS:** `159.223.130.149`

1. **Configurar GitHub Secrets:**
   - `VPS_HOST`: `159.223.130.149`
   - `VPS_USER`: Usuario SSH del VPS
   - `VPS_SSH_KEY`: Clave privada SSH (formato PEM)
   - `VPS_PORT`: Puerto SSH (default: 22)

2. **Configurar .env en VPS:**
   ```bash
   ALLOWED_ORIGINS=http://159.223.130.149,http://localhost:3000
   ```

3. **Acceso:** `http://159.223.130.149`

### Opción 2: Dominio Gratuito

Puedes obtener un dominio gratuito con estos servicios:

#### DuckDNS (Gratis y Fácil)
1. Ve a [duckdns.org](https://www.duckdns.org)
2. Regístrate con tu cuenta de GitHub, Google, etc.
3. Crea un subdominio gratuito (ej: `miapp.duckdns.org`)
4. Configura tu VPS para actualizar la IP automáticamente

#### No-IP (Gratis con renovación mensual)
1. Ve a [noip.com](https://www.noip.com)
2. Regístrate y crea un host gratuito
3. Instala el cliente No-IP en tu VPS para actualizar la IP

#### Configuración con Dominio Gratuito:
1. **Configurar GitHub Secrets:**
   - `VPS_HOST`: Tu dominio gratuito (ej: `miapp.duckdns.org`)
   - `VPS_USER`: Usuario SSH del VPS
   - `VPS_SSH_KEY`: Clave privada SSH
   - `VPS_PORT`: Puerto SSH (default: 22)

2. **Configurar SSL con Let's Encrypt:**
   ```bash
   sudo certbot certonly --standalone -d miapp.duckdns.org
   ```

3. **Configurar .env en VPS:**
   ```bash
   ALLOWED_ORIGINS=https://miapp.duckdns.org,http://localhost:3000
   ```

### Flujo de Despliegue Automático

1. Push a la rama `main` activa el workflow de GitHub Actions
2. El workflow se conecta al VPS vía SSH
3. Ejecuta `docker-compose down`, `build` y `up -d`
4. La aplicación se actualiza automáticamente

## 📁 Estructura del Proyecto

```
.
├── backend/
│   ├── db.js              # Configuración de conexión MySQL
│   ├── server.js          # Servidor Express
│   ├── package.json       # Dependencias del backend
│   └── routes/
│       └── tasks.js       # API REST de tareas
├── public/
│   ├── index.html         # Estructura HTML
│   ├── app.js             # Lógica del frontend
│   └── style.css          # Estilos CSS
├── database/
│   └── schema.sql         # Esquema de base de datos
├── .github/
│   └── workflows/
│       ├── deploy.yml     # Workflow de despliegue
│       └── Test.YML       # Workflow de pruebas
├── Dockerfile             # Imagen Docker de la aplicación
├── docker-compose.yml     # Orquestación de contenedores
├── .env.example           # Plantilla de variables de entorno
└── README.md              # Este archivo
```

## 🔧 API Endpoints

### Tareas

- `GET /api/tasks` - Listar todas las tareas
- `POST /api/tasks` - Crear nueva tarea
  - Body: `{ "title": "Descripción de la tarea" }`
- `PUT /api/tasks/:id` - Actualizar tarea
  - Body: `{ "title": "Nuevo título", "completed": true }`
- `DELETE /api/tasks/:id` - Eliminar tarea

## 🔒 Seguridad

- Validación de entrada en todos los endpoints
- Sanitización XSS básica en títulos de tareas
- CORS configurado con orígenes específicos
- Consultas SQL parametrizadas (prevención SQL injection)
- Variables de entorno para credenciales sensibles

## 🧪 Desarrollo

### Ejecutar sin Docker

1. Instalar dependencias del backend:
```bash
cd backend
npm install
```

2. Configurar base de datos MySQL local

3. Ejecutar servidor:
```bash
node server.js
```

## 📝 Notas

- La base de datos se inicializa automáticamente con el esquema en `database/schema.sql`
- Los datos persisten en volumen Docker `mysql_data`
- El frontend se sirve como archivos estáticos desde Express
- El health check del backend verifica el endpoint `/api/tasks`

## 🤝 Contribuciones

Este es un proyecto académico para el curso de DevOps UPSE.
