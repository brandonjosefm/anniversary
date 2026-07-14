# Audio necesario

El código (`script.js`) ya está conectado a Howler.js y busca estos archivos aquí mismo.
Si un archivo no existe, el sitio sigue funcionando perfectamente en silencio (no se rompe nada),
así que puedes subir el proyecto ya mismo y añadir el audio real después.

No pude generar archivos de audio binarios (música/efectos) desde el chat — necesitas
conseguirlos o encargarlos tú. Sugerencia: bancos de audio libres de regalías (Pixabay Audio,
Free Music Archive, YouTube Audio Library) filtrando por instrumental / piano / strings / ambient,
con licencia que permita uso personal.

| Archivo         | Uso                                   | Sugerencia                                              |
|-----------------|----------------------------------------|----------------------------------------------------------|
| `music.mp3`     | Música de fondo, loop, todo el recorrido | Piano + strings + ambient, muy suave, ~1-2 min con loop perfecto |
| `click.mp3`     | Tap en botones                         | Click suave, corto (<300ms)                              |
| `unlock.mp3`    | Al tocar el porta-planos                | Clic metálico elegante                                   |
| `scroll.mp3`    | Al desenrollarse el plano               | Textura de papel/pergamino                                |
| `sparkle.mp3`   | Destellos / partículas                  | Brillo agudo y corto, tipo "chime"                        |
| `confetti.mp3`  | Ráfaga de confeti                       | Whoosh suave                                              |

Todos los volúmenes ya están calibrados en el código para sonar discretos (música ~22%,
efectos ~35-50%). Ajusta `SFX_PATHS` / `MUSIC_PATH` en `script.js` si cambias los nombres.
