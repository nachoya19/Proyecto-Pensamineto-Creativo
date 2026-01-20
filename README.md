# Pensamiento Creativo - Plataforma de Gestión

Plataforma web para la gestión y seguimiento de alumnos, diseñada para conectar a Médicos, Profesores y Padres. Permite llevar un registro detallado de la conducta, asistencia, recomendaciones y notas de los estudiantes.

## 🚀 Características

La aplicación cuenta con roles diferenciados, cada uno con funcionalidades específicas:

- **Médico (Admin/Doctor):**
  - Invitar usuarios (Profesores y Padres).
  - Crear perfiles de alumnos.
  - Asignar alumnos a profesores y padres.
  - Crear registros y seguimientos globales.
  - Visualizar todos los alumnos y sus historiales.

- **Profesor:**
  - Visualizar alumnos asignados.
  - Crear registros (conducta, asistencia, notas, recomendaciones).
  - Consultar historial de sus alumnos.

- **Padre/Madre:**
  - Visualizar los registros y evolución de sus hijos asignados.

## 🛠 Tecnologías Empleadas

El proyecto está construido utilizando tecnologías web estándar y servicios en la nube:

- **Frontend:**
  - HTML5
  - CSS3 (Diseño responsivo con Flexbox y Grid)
  - JavaScript (ES6 Modules)
- **Backend / Servicios (Firebase):**
  - **Firebase Authentication:** Gestión de usuarios y sesiones segura.
  - **Firebase Firestore:** Base de datos NoSQL en tiempo real para almacenar usuarios, alumnos y registros.
  - **Firebase Hosting:** Alojamiento de la aplicación.

## 📂 Estructura del Proyecto

```
/
├── assets/         # Recursos estáticos (imágenes, etc.)
├── css/            # Estilos globales (index.css)
├── html/           # Páginas HTML de la aplicación
│   ├── login.html           # Inicio de sesión
│   ├── registro.html        # Registro de nuevos usuarios
│   ├── dashboard.html       # Cargador y enrutador principal
│   ├── dashboard-doctor.html # Panel para médicos
│   ├── dashboard-teacher.html# Panel para profesores
│   ├── dashboard-parent.html # Panel para padres
│   └── ...
├── js/             # Lógica de la aplicación
│   ├── main.js              # Inicialización de Firebase
│   ├── login.js             # Lógica de autenticación
│   ├── dashboard-router.js  # Enrutamiento basado en roles
│   └── ...
├── firebase.json   # Configuración de Firebase Hosting
└── index.html      # Punto de entrada (redirección)
```

## 📦 Instalación y Uso

1. **Clonar el repositorio:**
   ```bash
   git clone <url-del-repositorio>
   cd <nombre-carpeta>
   ```

2. **Configuración de Firebase:**
   - El proyecto ya incluye la configuración de Firebase en `js/main.js`.
   - Asegúrate de tener permiso de acceso al proyecto `pensamientocreativo-5be0d`.

3. **Ejecutar localmente:**
   Como es un proyecto estático (HTML/JS), puedes usar cualquier servidor local.

   Si tienes Python instalado:
   ```bash
   python -m http.server
   ```
   O si usas Node.js y tienes `serve` o `firebase-tools`:
   ```bash
   npx serve .
   # O con Firebase CLI
   firebase serve
   ```

4. **Acceso:**
   Abre tu navegador en `http://localhost:8000` (o el puerto que indique tu servidor).

## 📄 Notas Adicionales

- El sistema redirige automáticamente al dashboard correspondiente según el rol del usuario al iniciar sesión.
- Si un usuario tiene múltiples roles, se le permitirá elegir con cuál desea acceder.

---
Desarrollado para mejorar la comunicación y el seguimiento educativo/clínico.
