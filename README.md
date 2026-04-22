# Startist API

Backend REST para la plataforma Startist, una app para que artistas gestionen su progreso en técnicas artísticas mediante un árbol de habilidades.

---

## Tecnologías

| Capa | Tecnología |
|---|---|
| Runtime | Node.js |
| Framework | Express + TypeScript |
| Base de datos | PostgreSQL |
| ORM / Queries | `pg` (node-postgres) |
| Autenticación | JWT (`jsonwebtoken`) + `bcrypt` |
| Subida de archivos | Multer |
| Galería externa | Unsplash API |
| Documentación | Swagger UI (`swagger-ui-express`) |

---

## Arquitectura

```
startist-backend/
├── src/
│   ├── controllers/       # Lógica de cada endpoint
│   │   ├── authController.ts
│   │   ├── artistasController.ts
│   │   ├── arbolController.ts
│   │   ├── tecnicasController.ts
│   │   ├── tarjetasController.ts
│   │   ├── proyectosController.ts
│   │   └── galeriaController.ts
│   ├── routes/            # Definición de rutas Express
│   │   ├── auth.ts
│   │   ├── artistas.ts
│   │   ├── arbol.ts
│   │   ├── tecnicas.ts
│   │   ├── tarjetas.ts
│   │   └── proyectos.ts
│   ├── middlewares/
│   │   ├── auth.ts        # Verificación JWT
│   │   └── upload.ts      # Multer 
│   ├── db/
│   │   └── pool.ts        # Pool de conexiones PostgreSQL
│   ├── dtos/              # Interfaces de entrada/salida
│   ├── interfaces/        # Tipos de entidades de la DB
│   ├── app.ts             # Configuración Express
│   └── index.ts           # Punto de entrada
├── uploads/               # Archivos subidos por los artistas
├── swagger.json           # Especificación OpenAPI
└── .env
```

### Flujo de una petición autenticada

```
Cliente → Authorization: Bearer <JWT>
  → middleware verificarToken (valida y decodifica)
  → controller (consulta PostgreSQL via pool)
  → respuesta JSON
```

---

## Endpoints principales

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/api/v1/auth/registro` | No | Registro de artista |
| POST | `/api/v1/auth/login` | No | Login, devuelve JWT |
| GET | `/api/v1/artistas` | No | Lista todos los artistas |
| GET | `/api/v1/artistas/:id` | No | Obtiene un artista |
| PATCH | `/api/v1/artistas/:id` | Sí | Edita nombre/descripción |
| GET | `/api/v1/artistas/:id/proyectos` | No | Proyectos de un artista |
| GET | `/api/v1/arbol` | Sí | Árbol de habilidades del usuario autenticado |
| GET | `/api/v1/tecnicas/:id` | No | Detalle de una técnica |
| GET | `/api/v1/tecnicas/:id/tarjetas` | No | Tarjetas de una técnica |
| GET | `/api/v1/tecnicas/:id/galeria` | No | Galería Unsplash de la técnica |
| GET | `/api/v1/tarjetas/:id` | No | Detalle de una tarjeta |
| POST | `/api/v1/proyectos` | Sí | Sube un proyecto (multipart/form-data) |
| DELETE | `/api/v1/proyectos/:id` | Sí | Elimina un proyecto propio |

Documentación interactiva disponible en `/api/docs` cuando el servidor está corriendo.

---

## Variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# Servidor
PORT=3001

# Base de datos PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=tu_password
DB_NAME=startist

# JWT
JWT_SECRET=tu_secreto
JWT_EXPIRES_IN=10h

# Unsplash (galería de inspiración)
UNSPLASH_ACCESS_KEY=tu_access_key_de_unsplash
```

---

## Instalación y ejecución

### Requisitos previos
- Node.js 18+
- PostgreSQL 14+

### Pasos

```bash
# 1. Clonar el repositorio
git clone <url-del-repo>
cd startist-backend

# 2. Instalar dependencias
npm install

# 3. Crear el archivo de variables de entorno
cp .env.example .env
# Editar .env con tus valores

# 4. Crear la base de datos en PostgreSQL
# (ejecutar el script SQL de inicialización si existe)
psql -U postgres -c "CREATE DATABASE startist;"

# 5. Correr en desarrollo (con hot reload)
npm run dev

# 6. Compilar y correr en producción
npm run build
npm start
```

El servidor queda disponible en `http://localhost:3001`.  
La documentación Swagger en `http://localhost:3001/api/docs`.

---

## Archivos subidos

Los proyectos de los artistas se guardan en la carpeta `uploads/` en la raíz del proyecto. Esta carpeta se crea automáticamente si no existe.

Las imágenes se sirven como archivos estáticos en la ruta `/uploads/nombre-del-archivo.ext`, por ejemplo:

```
http://localhost:3001/uploads/1700000000000-123456789.jpg
```

---

## Notas de desarrollo

- Si la DB no está disponible al iniciar, el servidor reintenta la conexión cada 3 segundos automáticamente.
- El endpoint `/api/v1/arbol` calcula en tiempo real qué técnicas están desbloqueadas y completadas para el artista autenticado, basándose en los proyectos que ha subido.
- Una tarjeta se considera **completada** cuando el artista tiene un proyecto asociado a ella.
- Una técnica se considera **desbloqueada** cuando su técnica padre está completada (o no tiene padre).