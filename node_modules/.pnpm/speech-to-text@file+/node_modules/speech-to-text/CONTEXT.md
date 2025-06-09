# Aplicación Full-Stack Monorepo

## Instrucciones Generales

- Utilizar un **monorepo multipaquete** en lugar de múltiples repositorios.
- Asegurarse de que los comandos `pnpm install` y `pnpm run dev` funcionen correctamente sin necesidad de pasos adicionales.
- Todo el código debe estar escrito en **TypeScript**.

## Frontend

### Configuración

- Servir en el puerto **4000**.
- Todas las rutas deben estar bajo el path `/`.

### Interfaz de Usuario

- Implementar un botón para seleccionar un archivo `.mp3` desde la máquina local.
- Añadir otro botón para cargar el archivo `.mp3` seleccionado al servidor.
- Una vez cargado el archivo, mostrar un botón de **copiar** junto al texto.
- Proporcionar un **manejo de errores** claro con una interfaz de usuario amigable.

## Backend

### Configuración

- Servir en el puerto **3000**.
- Crear una **API RESTful** utilizando Node.js.

### Endpoints

### POST /api/files

- Aceptar la carga de un archivo `.mp3` desde el frontend.
- Almacenar los datos en una base de datos o estructura de datos.
- Utilizar la clave `file` en el cuerpo de la solicitud.
- Devolver estado **200** y un objeto con la clave `message` y el valor `"El archivo se cargó correctamente"` si es exitoso.
- En caso de error, devolver estado **500** y un objeto con la clave `message` y un mensaje de error.

### GET /api/transcription

- Devolver estado **200** y un objeto con la clave `data` que contenga un array de objetos (con propiedades como `seconds` y `speakers`).
- En caso de error, devolver estado **500** y un objeto con la clave `message` y un mensaje de error.