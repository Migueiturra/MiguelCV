# CV Claro

Sitio estático en español para importar un CV PDF o DOCX, corregir la información en un formulario y descargar una versión imprimible en estilo Harvard.

## Privacidad y límites

- Los archivos se leen en el navegador y no se envían ni guardan en un servidor.
- Los datos editables se guardan en el almacenamiento local del navegador para recuperar el borrador. «Empezar de nuevo» los elimina de ese navegador.
- La extracción usa Mammoth y PDF.js desde CDN; la primera carga requiere conexión a internet.
- Los PDF escaneados y las imágenes no tienen OCR en esta primera versión.
- La descarga abre el diálogo de impresión del navegador; seleccionar «Guardar como PDF».
- El analizador orienta y ordena texto, pero puede clasificar mal CV con diseños poco habituales. La persona debe revisar los datos antes de descargar.

## Publicar en GitHub Pages

El repositorio incluye un flujo de GitHub Actions en `.github/workflows/pages.yml`. En GitHub, abre **Settings → Pages** y selecciona **GitHub Actions** como origen. Al hacer push a `main`, el sitio se publica automáticamente.

## Archivos

- `index.html`, `styles.css`, `app.js`: fuente del sitio.
- `dist/`: versión estática lista para alojar.
- `.github/workflows/pages.yml`: publicación automatizada en GitHub Pages.
