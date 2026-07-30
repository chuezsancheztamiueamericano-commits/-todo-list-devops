# --- Imagen base ---
FROM node:20-slim

# --- Instalar curl para health checks ---
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# --- Directorio de trabajo dentro del contenedor ---
WORKDIR /app

# --- Copiamos primero solo el package.json del backend (para aprovechar caché de Docker) ---
COPY backend/package*.json ./backend/

# --- Instalamos dependencias de producción ---
WORKDIR /app/backend
RUN npm install --omit=dev

# --- Copiamos TODO el contenido de la carpeta del proyecto a la imagen ---
# (backend/, public/, database/, .github/, README.md, .gitignore, etc.)
# .env y .git/ quedan excluidos vía .dockerignore por seguridad
WORKDIR /app
COPY . .

# --- Puerto en el que escucha Express ---
EXPOSE 3000
ENV PORT=3000

# --- Comando de arranque ---
WORKDIR /app/backend
CMD ["node", "server.js"]