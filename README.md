# 🎙️ Transcríbelo - Speech to Text Application

Una aplicación full-stack para convertir audio a texto utilizando servicios de transcripción de IA como AssemblyAI, Google Cloud Speech-to-Text y OpenAI Whisper.

## 🏗️ Arquitectura

### Monorepo Structure

```ini
speech-to-text/
├── frontend/          # React + TypeScript + Vite
├── backend/           # Express + TypeScript API
├── infrastructure/    # Terraform (IaC)
├── package.json       # Scripts del workspace raíz
└── pnpm-workspace.yaml
```

### Stack Tecnológico

**Frontend:**

- React 18 + TypeScript
- Vite como bundler
- CSS Modules para estilos
- Sonner para notificaciones

**Backend:**

- Node.js + Express + TypeScript
- Multer para manejo de archivos
- Servicios de transcripción múltiples:
   - AssemblyAI
   - Google Cloud Speech-to-Text
   - OpenAI Whisper

**Infrastructure:**

- AWS Lambda + API Gateway
- Terraform para Infrastructure as Code
- Serverless Express para compatibilidad

## 🚀 Desarrollo Local

### Prerrequisitos

- Node.js 18+
- pnpm
- Variables de entorno configuradas

### Instalación

1. **Clonar el repositorio:**

```bash
git clone <repo-url>
cd speech-to-text
```

2. **Instalar dependencias:**

```bash
pnpm install
```

3. **Configurar variables de entorno:**

Crear `.env` en la carpeta `backend/`:

```env
ASSEMBLY_AI_KEY=tu_assembly_ai_key
GOOGLE_CLOUD_PROJECT_ID=tu_google_project_id
OPENAI_API_KEY=tu_openai_api_key
```

4. **Ejecutar en modo desarrollo:**

```bash
pnpm dev
```

Esto iniciará:

- Frontend en `http://localhost:4000`
- Backend en `http://localhost:3000`

### Scripts Disponibles

```bash
# Desarrollo
pnpm dev                    # Inicia frontend y backend en paralelo

# Build
pnpm build                  # Construye frontend y backend

# Linting
pnpm lint                   # Ejecuta ESLint

# Lambda
pnpm lambda:build           # Construye el paquete Lambda
pnpm lambda:package         # Empaqueta en ZIP
pnpm lambda:deploy          # Build + Package + Verificación
```

## 📡 API Endpoints

### POST /api/files

Sube un archivo de audio para transcripción.

**Request:**

- Content-Type: `multipart/form-data`
- Campo: `file` (archivo de audio)
- Formatos soportados: `.mp3`, `.wav`, `.ogg`, `.flac`, `.aac`

**Response exitosa (200):**

```json
{
  "message": "Archivo procesado correctamente",
  "transcription": "Texto transcrito del audio...",
  "transcriptId": "uuid-generado"
}
```

**Response error (500):**

```json
{
  "message": "Descripción del error"
}
```

### GET /api/transcription/:id

Obtiene una transcripción específica por ID.

**Response exitosa (200):**

```json
{
  "data": {
    "id": "uuid",
    "transcription": "Texto transcrito...",
    "createdAt": "2025-06-13T10:00:00Z"
  }
}
```

## 🏗️ Despliegue en AWS

### Configuración de Infrastructure as Code (Terraform)

El proyecto incluye configuración de Terraform para desplegar en AWS Lambda + API Gateway.

#### Prerrequisitos para despliegue:

- AWS CLI configurado
- Terraform instalado
- Credenciales AWS con permisos para Lambda, API Gateway, IAM

#### Variables requeridas:

Crear `terraform.tfvars` en la carpeta `infrastructure/`:

```hcl
assembly_ai_key = "tu_assembly_ai_key"
google_project_id = "tu_google_project_id"
```

#### Proceso de despliegue:

1. **Construir el paquete Lambda:**

```bash
pnpm lambda:deploy
```

2. **Desplegar con Terraform:**

```bash
cd infrastructure
terraform init
terraform plan
terraform apply
```

#### Recursos creados:

- **AWS Lambda Function:** `speech-to-text-api`
   - Runtime: Node.js 22.x
   - Memory: 512MB
   - Timeout: 30s

- **API Gateway:** REST API para exponer endpoints
- **IAM Role:** Permisos para ejecución de Lambda
- **CloudWatch Logs:** Para monitoreo y debugging

### Verificación del despliegue:

```bash
# Verificar el tamaño del paquete
pnpm run --filter backend lambda:size

# Verificar contenido del ZIP
pnpm run --filter backend lambda:verify
```

## 🎛️ Configuración

### Variables de Entorno

**Backend (.env):**

```env
# Servicios de transcripción
ASSEMBLY_AI_KEY=your_key_here
GOOGLE_CLOUD_PROJECT_ID=your_project_id
OPENAI_API_KEY=your_openai_key

# Configuración del servidor
PORT=3000
NODE_ENV=development
```

**Frontend:**
Las variables de entorno se configuran en `frontend/src/config.ts`

### Servicios de Transcripción

La aplicación soporta múltiples proveedores:

1. **AssemblyAI** (Recomendado)

   - Registro en: https://www.assemblyai.com/
   - Obtener API key

2. **Google Cloud Speech-to-Text**

   - Configurar proyecto en Google Cloud Console
   - Habilitar Speech-to-Text API
   - Configurar credenciales

3. **OpenAI Whisper**

   - Obtener API key de OpenAI
   - Configurar en variables de entorno

## 🎨 Funcionalidades

### Frontend

- ✅ Drag & drop de archivos de audio
- ✅ Indicador de progreso durante la subida
- ✅ Lista de transcripciones guardadas
- ✅ Botón de copiar texto al portapapeles
- ✅ Modal para ver transcripciones completas
- ✅ Manejo de errores con notificaciones
- ✅ Botón de reintentar en caso de error
- ✅ Responsive design

### Backend

- ✅ API RESTful con Express
- ✅ Soporte para múltiples formatos de audio
- ✅ Arquitectura hexagonal (Clean Architecture)
- ✅ Inyección de dependencias
- ✅ Manejo de errores robusto
- ✅ Compatibilidad con Lambda (Serverless)

## 🧪 Testing

```bash
# Ejecutar tests (cuando estén implementados)
pnpm test

# Ejecutar tests en modo watch
pnpm test:watch
```

## 📝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Añade nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👨‍💻 Autor

**Esteban Mutis**

- LinkedIn: [emutis](https://www.linkedin.com/in/emutis/)

---

## 🔧 Troubleshooting

### Problemas comunes:

**Error: "Module not found"**

```bash
# Limpiar node_modules y reinstalar
rm -rf node_modules
pnpm install
```

**Error en el despliegue Lambda:**

```bash
# Verificar el tamaño del paquete (debe ser < 50MB)
pnpm run --filter backend lambda:size

# Reconstruir el paquete
pnpm run --filter backend lambda:deploy
```

**Error de CORS en producción:**

- Verificar la configuración de API Gateway
- Asegurar que las cabeceras CORS estén configuradas correctamente

### Logs y debugging:

```bash
# Ver logs de Lambda en AWS
aws logs tail /aws/lambda/speech-to-text-api --follow

# Debugging local
# Los logs aparecen en la consola durante el desarrollo
```