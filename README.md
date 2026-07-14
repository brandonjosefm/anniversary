# Anniversary — Experiencia interactiva

Landing page premium, cinematográfica, con dos desenlaces secretos activados por QR físico.
Pensada para GitHub Pages, sin build step: HTML + CSS + JS vanilla, GSAP para animación y
Howler.js para audio.

## Estructura

```
index.html          → entrada neutra (fallback si alguien visita la raíz sin QR)
outfit/index.html    → mismo experience, revela el premio "Outfit Shopping"
mycar/index.html      → mismo experience, revela el premio "Pimp My Car"
style.css            → sistema de diseño (paleta, tipografía, componentes)
script.js             → toda la lógica: audio, partículas, secuencia de pantallas
assets/sounds/        → música y efectos (ver README ahí — necesitas añadir los .mp3)
assets/animations/    → integración opcional de Lottie
assets/fonts/         → integración opcional de fuentes auto-hospedadas
assets/images/        → reservado, no usado por defecto
```

`outfit/index.html` y `mycar/index.html` son **exactamente el mismo HTML/CSS/JS** que la
raíz; lo único que cambia es una línea inline (`window.PRIZE_TYPE`) que le dice al script
qué premio revelar al final. El usuario nunca puede saber cuál le tocó mirando la URL,
porque visualmente ambas rutas son indistinguibles hasta la última pantalla.

## Publicar en GitHub Pages

1. Sube todo el contenido de esta carpeta a la raíz del repo `anniversary` (arrastra la
   carpeta completa en GitHub → **Add file → Upload files**, o vía `git push`).
2. En el repo: **Settings → Pages → Build and deployment → Source: Deploy from a branch**,
   rama `main`, carpeta `/ (root)`. Guarda.
3. Espera 1-2 minutos. Las URLs quedarán:
   - `https://brandonjosefm.github.io/anniversary/outfit`
   - `https://brandonjosefm.github.io/anniversary/mycar`
4. Genera los QR físicos apuntando a esas dos URLs exactas.

## Antes de imprimir los QR

- **Añade el audio real** en `assets/sounds/` (ver el README de esa carpeta — el sitio
  funciona igual de bien sin él, pero suena mucho mejor con música).
- Pruébalo en tu propio celular escaneando un QR de prueba (o abriendo la URL manualmente)
  para confirmar que las animaciones, el audio y las vibraciones se sienten bien.
- Ambas rutas deben verse y sonar 100% idénticas hasta la pantalla del premio — revísalo tú
  mismo abriendo `/outfit` y `/mycar` una junto a la otra.

## Notas técnicas

- Sin dependencias de build ni de CDN externo: GSAP y Howler están auto-alojados en
  `assets/vendor/` (cero `npm install`, funciona incluso con wifi mala o sin internet salvo
  la primera carga de fuentes de Google).
- El número de partículas y algunas animaciones decorativas se reducen automáticamente en
  dispositivos de gama baja o si el usuario tiene activado "reducir movimiento" en su sistema.
- El audio de fondo empieza en el primer toque del usuario ("Comenzar experiencia"), porque
  los navegadores móviles bloquean el autoplay con sonido sin gesto del usuario — es la forma
  más cercana a "automático" que permite iOS/Android.
- Todo el texto y las imágenes usadas son emoji/CSS, por lo que la carga es prácticamente
  instantánea incluso en redes móviles lentas.
