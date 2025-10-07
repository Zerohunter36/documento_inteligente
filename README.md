# Portal Mx Mart NEXTRACT

Aplicación full-stack que replica el portal de usuarios de Mx Mart NEXTRACT para procesar documentos con Google Document AI, administrar hojas disponibles y generar reportes en Excel.

## Arquitectura

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **Autenticación**: Firebase Authentication (tokens verificados con Firebase Admin en el backend)
- **Base de datos**: Firestore
- **Almacenamiento**: Firebase Storage / Google Cloud Storage
- **OCR y extracción**: Google Document AI
- **Generación de Excel**: ExcelJS
- **Contenedores**: Docker (preparado para desplegar en Cloud Run / Vercel)

## Requisitos previos

1. Cuenta de Firebase/GCP con un proyecto habilitado para Firestore, Storage y Document AI.
2. Crear un **Service Account** con permisos de `roles/firestore.user`, `roles/storage.objectAdmin` y `roles/documentai.apiUser`. Generar la llave JSON.
3. Configurar Firebase Authentication con método Email/Password habilitado.
4. Instalar Node.js 18+ y npm.

## Configuración

### Backend

1. Copia el archivo `.env.example` a `.env` dentro de `backend/` y completa los valores:

   ```bash
   cd backend
   cp .env.example .env
   ```

   - Para `FIREBASE_SERVICE_ACCOUNT` pega el JSON de la llave de servicio en una sola línea.
   - `DOCUMENT_AI_PROCESSOR_ID` corresponde al ID del processor de Document AI (por ejemplo `1234567890abcdef`).
   - `DOCUMENT_AI_LOCATION` suele ser `us` o `eu`.

2. Instala dependencias y ejecuta el servidor:

   ```bash
   npm install
   npm run dev
   ```

   El API quedará en `http://localhost:8080`.

### Frontend

1. Copia el `.env.example` a `.env` dentro de `frontend/` y completa con los valores de tu proyecto Firebase:

   ```bash
   cd frontend
   cp .env.example .env
   ```

2. Instala dependencias y arranca el cliente:

   ```bash
   npm install
   npm run dev
   ```

   El portal se mostrará en `http://localhost:5173`.

> **Nota:** La configuración por defecto del backend permite CORS únicamente hacia el `CLIENT_URL` definido en el `.env`.

## Flujo de uso

1. Los usuarios se registran o inician sesión mediante Firebase Auth.
2. El cliente obtiene el `idToken` del usuario y llama a `/api/auth/bootstrap` para asegurar que exista la ficha de créditos en Firestore.
3. En el dashboard se muestran:
   - Hojas contratadas, usadas y disponibles.
   - Excedentes y costo adicional estimado.
   - Historial de documentos procesados.
4. Al subir un PDF o imagen:
   - El archivo se envía al backend.
   - El backend lo almacena en Cloud Storage.
   - Se ejecuta Document AI para extraer entidades.
   - Se genera un Excel basado en la plantilla preconfigurada (`generateExcel`).
   - Se actualizan los créditos y se registra el historial en Firestore.
- Se entrega una URL para descargar el Excel resultante.
   - Si no cuentas con Storage configurado, el backend almacena el Excel en Firestore codificado en Base64 para poder descargarlo desde la interfaz.

Si no se configura Document AI, el backend retornará datos simulados para facilitar las pruebas de interfaz.

## Documentos y créditos

- Cada documento descuenta el número de páginas retornado por Document AI (`pagesUsed`).
- Si `pagesUsed` supera la cuota (`pageQuota`) se calculan `overagePages` y un costo adicional (`overageCost = overagePages * OVERAGE_COST_PER_PAGE`).
- Puedes ajustar la cuota llamando a `POST /users/quota` con el nuevo número de hojas.

## Endpoints principales

| Método | Endpoint | Descripción |
| ------ | -------- | ----------- |
| `POST` | `/auth/bootstrap` | Garantiza que exista el perfil del usuario en Firestore. |
| `GET` | `/documents` | Obtiene estadísticas y documentos procesados. |
| `POST` | `/documents/upload` | Recibe un archivo, invoca Document AI y genera el Excel. |
| `GET` | `/documents/:id/excel` | Descarga el Excel generado. |
| `GET` | `/users/me` | Devuelve la información básica del usuario. |
| `POST` | `/users/quota` | Actualiza la cuota de hojas disponibles. |

Todos los endpoints (excepto `/auth/bootstrap`) requieren un header `Authorization: Bearer <idToken>` válido.

## Docker

### Backend

```dockerfile
# backend/Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 8080
CMD ["node", "src/index.js"]
```

### Frontend

```dockerfile
# frontend/Dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /usr/share/app
COPY --from=build /app/dist ./dist
RUN npm install -g serve
EXPOSE 4173
CMD ["serve", "-s", "dist", "-l", "4173"]
```

### docker-compose

```yaml
version: '3.9'
services:
  backend:
    build: ./backend
    env_file:
      - backend/.env
    ports:
      - "8080:8080"
    volumes:
      - ./backend:/app
  frontend:
    build: ./frontend
    env_file:
      - frontend/.env
    ports:
      - "5173:4173"
    depends_on:
      - backend
```

## Ejemplo de plantilla Excel

El servicio `generateExcel` permite cargar una plantilla personalizada (`.xlsx`) donde la primera hoja puede contener encabezados en las primeras filas. Los campos extraídos se insertan desde la fila 2 en adelante en las columnas A-C. Si no se especifica una plantilla, se genera un Excel estándar con columnas `Campo`, `Valor` y `Confianza`.

Incluye en `public/plantillas/` tus archivos base y envía el `templatePath` en el formulario para utilizarlos.

## Despliegue en Google Cloud Run

1. Construye las imágenes Docker y publícalas en Artifact Registry.
2. Despliega el backend configurando las variables de entorno del `.env` y montando el archivo de credenciales o variables Secret Manager.
3. Despliega el frontend en Vercel/Cloud Run o Firebase Hosting utilizando la build de Vite.
4. Configura HTTPS y dominios personalizados según sea necesario.

## Scripts útiles

```bash
# Backend
docker build -t nextract-backend ./backend

# Frontend
docker build -t nextract-frontend ./frontend
```

## Licencia

MIT © 2024 Mx Mart Demo
