# Pieza Viva — Sitio web

Sitio institucional de **Pieza Viva**, consultora arqueológica (Chile). Hecho en HTML, CSS y JavaScript puro (sin frameworks), con formularios conectados a PHP + MySQL para HostGator.

---

## Estructura del proyecto

El proyecto se divide en dos carpetas: **`client`** (todo lo que ve el navegador) y **`server`** (los formularios en PHP + los archivos que suben los postulantes).

```
client/
├── index.html              → Página principal (una sola página con secciones ancladas)
├── historia.html            → "Nuestra Historia" (misión, filosofía, principios, propósito, manifiesto)
├── postulaciones.html        → Formulario de postulación laboral (con CV en PDF)
├── proyecto-01.html
├── proyecto-02.html
├── proyecto-03.html          → Fichas de detalle de cada proyecto destacado
│
├── css/
│   ├── styles.css            → Hoja de estilos principal (variables, componentes, responsive, tema oscuro)
│   ├── historia.css          → Estilos propios de historia.html (importa styles.css)
│   ├── proyecto-01.css       → Estilos propios de las fichas de proyecto (importa styles.css)
│   └── postulaciones.css     → Estilos propios de postulaciones.html (importa styles.css)
│
├── js/
│   ├── theme.js              → Aplica el tema claro/oscuro guardado, ANTES de pintar la página (evita parpadeos)
│   └── script.js              → Todo lo demás: menú móvil, validación de formularios, modales, animaciones de scroll
│
└── images/            → Carpetas de imágenes 

server/
├── form/
│   ├── contacto.php          → Procesa el formulario de Contacto (guarda en MySQL + envía email)
│   └── postulacion.php       → Procesa el formulario de Postulaciones (+ sube el CV en PDF)
└── uploads/cv/                → Acá se guardan los PDF de los CV que llegan por el formulario
```

> **Importante:** los formularios (`index.html` y `postulaciones.html`) apuntan a `action="server/form/..."`. Esa ruta asume que `client` y `server` quedan **al mismo nivel** una vez subidos al hosting (es decir, `server/` es una subcarpeta más, hermana de `css/`, `js/`, etc., no algo separado en otro lugar). 

---

## Qué incluye cada página

### `index.html`
- **Hero** a pantalla completa, con una foto distinta para escritorio y otra para celular (`<picture>`), recortada priorizando la parte de arriba.
- **Quiénes somos**: manifiesto de Pieza Viva + botón hacia `historia.html`.
- **Capacidades**: 4 tarjetas (Comprender, Gestionar, Documentar, Compartir). Muestran una foto y el título; al pasar el mouse, la tarjeta se agranda y la foto se funde suavemente (*crossfade*) con el texto descriptivo.
- **Tecnologías**: 4 tarjetas con foto de ejemplo arriba (Fotogrametría, Drones, RDP, Modelos 3D).
- **Proyectos destacados**: 3 tarjetas que llevan a su ficha propia (`proyecto-01.html`, etc.).
- **Merch**: vitrina informativa con hipervínculo (sin botón de compra, solo exhibición).
- **Contacto**: formulario completo con validación por campo y modal de confirmación.

### `historia.html`
Misión, Filosofía, Principios (6 tarjetas) y Propósito.

### `postulaciones.html`
Formulario de postulación laboral: datos personales + adjuntar CV. Mismo estilo visual que el formulario de Contacto (sección oscura + tarjeta clara).

### `proyecto-01/02/03.html`
Ficha de cada proyecto: foto de portada, ubicación/año/servicio, descripción, y botón de vuelta a Contacto.

---

## Funcionalidades ya implementadas

- **Diseño responsive** completo (celular, tablet, escritorio), probado en varios anchos de pantalla.
- **Modo claro / oscuro** con botón en el header, memoria de la preferencia del usuario (`localStorage`) y sin parpadeos al cargar.
- **Animaciones de aparición al hacer scroll** en tarjetas (Capacidades, Tecnologías, Proyectos, Principios, etc.), con efecto escalonado entre ellas.
- **Menú móvil** (hamburguesa) en las páginas con navegación completa.
- **Formularios con validación independiente por campo**, en vivo:
  - Contacto: nombre, email (formato válido), teléfono (solo números, mínimo 8 dígitos si se completa), asunto y mensaje.
  - Postulaciones: igual que Contacto, más el CV — **rechaza cualquier archivo que no sea PDF o que pese más de 4MB**, con aviso inmediato.
- **Modal de confirmación** al enviar cualquiera de los dos formularios ("Su solicitud/postulación ha sido enviada correctamente").
- **Backend en PHP**: ambos formularios guardan los datos en MySQL y envían un email de aviso. El de Postulaciones además guarda el PDF del CV en el servidor.
- Íconos de redes sociales (Facebook, Instagram, LinkedIn) y botón de WhatsApp flotante, en SVG (no son imágenes descargadas, así que cambian de color solos con el tema).
