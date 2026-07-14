# Tipografía

Por rendimiento y confiabilidad (no depender de subir archivos `.woff2` correctos), el
proyecto carga las fuentes desde Google Fonts vía CDN en `style.css`:

- **Cormorant Garamond** (serif, títulos y textos emocionales)
- **Inter** (sans-serif, textos de interfaz)

Esta carpeta queda lista por si prefieres auto-hospedar las fuentes (mejor para funcionar
100% offline o evitar la petición externa). Si lo haces:

1. Descarga los `.woff2` de Cormorant Garamond e Inter.
2. Colócalos aquí.
3. Reemplaza el `@import` en `style.css` por reglas `@font-face` apuntando a `assets/fonts/...`.
