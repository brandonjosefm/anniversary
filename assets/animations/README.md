# Lottie (opcional)

Todas las animaciones de la experiencia actual (tubo descendiendo, plano desenrollándose,
partículas, luces, confeti) están resueltas con GSAP + CSS/canvas — no dependen de Lottie,
así que el sitio no carga la librería `lottie-web` de más (mejor rendimiento en móviles).

Si más adelante quieres reemplazar algún elemento por una ilustración animada (por ejemplo,
un ícono Lottie para el corazón final), coloca el `.json` exportado desde After Effects/LottieFiles
aquí y agrega en `index.html`:

```html
<script src="https://cdn.jsdelivr.net/npm/lottie-web@5.12.2/build/player/lottie.min.js"></script>
```

y en `script.js`:

```js
lottie.loadAnimation({
  container: document.querySelector('#mi-contenedor'),
  path: 'assets/animations/mi-animacion.json',
  renderer: 'svg',
  loop: true,
  autoplay: true
});
```
