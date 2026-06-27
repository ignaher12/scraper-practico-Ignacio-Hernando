# Scraper OEFA 

Scraper en TypeScript, hecho desde cero con HTTP requests (axios + cheerio),
que recorre el registro público de resoluciones de la OEFA (Peru), extrae los datos de cada
documento y descarga sus PDFs.

**Aclaración sobre el sitio scrapeado**
El enunciado pide scrapear la pagina de jurisprudencia.pj.gob.pe, en este caso se utilizo la URL alternativa ofrecida por el enunciado al no contar con una VPN de Peru, sin embargo la arquitectura está pensada para portarse (URLs, IDs de formulario y selectores centralizados en config.ts), pero no es automatico: al ser otra instancia JSF habría que rehacer la ingeniería inversa de sus IDs de formulario (FORM_ID/DT_ID/campos j_idt…), las columnas de cada fila (modelo Documento) y confirmar el mecanismo de descarga del PDF.

---

## Qué hace

- Navega todo el listado paginado (683 páginas / ~6827 registros - en la ultima fecha probado).
- Por cada documento extrae: número de expediente, administrado, descripción de la unidad,
  sector, número de resolución, y el identificador del PDF.
- Descarga el PDF de cada documento, con nombre descriptivo (el que entrega el servidor).
- Maneja errores 429 (Too Many Requests) con reintentos y backoff exponencial, registra los
  documentos que fallan y continúa con el siguiente.
- Persiste los resultados en `output/.`

---

## Requisitos

- Node.js 18+ 
- npm.

## Instalación

```bash
npm install
```

## Uso

```bash
npm run dev
```

Esto ejecuta el scraper (`src/index.ts` vía `tsx`). Al terminar genera:

```
output/
  data.json        # todos los registros extraídos (JSON)
  failed.json      # documentos cuya descarga falló (para reintentar/auditar)
  pdf/             # los PDFs descargados, con nombre descriptivo
```

Por defecto `MAX_REG` está limitado (ver Configuración) para una corrida de prueba.
Para bajar todo el registro, subir ese valor.

---

## Cómo funciona

El sitio es una aplicación JSF (JavaServer Faces) + PrimeFaces, por lo tanto, la navegación no es por URL
, sino por POST con estado de servidor (`ViewState` + cookie de sesión
`JSESSIONID`). El flujo es:

1. `bootstrap.ts` — `GET` inicial: obtiene la cookie `JSESSIONID` y el primer `ViewState`.
2. `search.ts` — `POST` de búsqueda: renderiza la primera página de resultados.
3. `listPage.ts` — `POST` de paginación: cambia el offset (`dt_first`) para avanzar de página. 
   La respuesta es un `partial-response` XML con las filas y un `ViewState` nuevo que se encadena al siguiente request.
4. `parse.ts` — separa el HTML (dentro del CDATA) del nuevo `ViewState`, y parsea cada fila
   con `cheerio`.
5. `downloadPdf.ts` — `POST` que devuelve el PDF en binario.
6. `index.ts` — define el loop: por cada página extrae los datos, descarga sus PDFs y
   recien entonces avanza a la siguiente.

### Detalles técnicos que hicieron falta

- `{dt}_encodeFeature=true` en el POST de paginación: sin este parámetro el servidor ignora
  el offset y siempre devuelve la página 1.
- Encadenado del `ViewState`: cambia en cada respuesta, por lo tanto, hay que leerlo siempre de la última y
  usarlo en el próximo request para que el servidor no rechace la sesión.
- Descarga intercalada: la descarga del PDF requiere que la fila esté presente en el estado
  actual del servidor (el id del botón apunta al índice de fila renderizado). Por eso se descargan
  los PDFs de cada página antes de pasar a la sig. pagina.

---

## Manejo de errores (429 y robustez)

- `retry.ts` expone `withRetry(fn)`, un wrapper genérico que envuelve cada request.
  Ante un HTTP 429 reintenta con backoff exponencial (`BASE_BACKOFF_MS * 2^intento`) hasta
  `MAX_RETRIES`. Otros errores se propagan de inmediato.
- Si una descarga falla (429 agotado, error de red, o respuesta que no es un PDF válido —se
  valida por los magic bytes `%PDF-`), el documento se registra en `failed.json` y el scraper
  continúa con el siguiente.
- Pausa configurable entre requests (`DELAY_BETWEEN_REQUESTS_MS`) para no saturar al servidor.

---

## Configuración

Todo se centraliza en `src/config.ts`:

| Constante | Descripción |
|---|---|
| `QUESTION_URL` | URL del formulario de consulta. |
| `PAGE_SIZE` | Filas por página (10). |
| `MAX_REG` | Tope de registros a recorrer. |
| `MAX_RETRIES` | Reintentos ante 429. |
| `BASE_BACKOFF_MS` | Base del backoff exponencial. |
| `DELAY_BETWEEN_REQUESTS_MS` | Delay entre requests. |
| `OUTPUT_DIR` / `OUTPUT_PDF_DIR` / `DATA_FILE` / `FAILED_FILE` | Rutas de salida. |

---

## Estructura del proyecto

```
src/
  config.ts        constantes (URL, IDs del form, delays, page size)
  http.ts          cliente axios con cookie jar + headers JSF
  bootstrap.ts     GET inicial: JSESSIONID + primer ViewState
  search.ts        POST de búsqueda (primera página)
  listPage.ts      POST de paginación -> filas + nuevo ViewState
  parse.ts         partial-response (XML) + filas (HTML) -> objetos (cheerio)
  downloadPdf.ts   POST de descarga (binario)
  retry.ts         reintentos con backoff exponencial (withRetry) + sleep
  storage.ts       guardar JSON de datos, PDFs y fallidos
  index.ts         loop de paginación + descargas intercaladas
output/            output generado
```

## Stack

- Runtime/parsing: `axios`, `cheerio`, `tough-cookie` + `axios-cookiejar-support` 
- Dev: `typescript`, `@types/node`, `tsx`

---

## Limitaciones y notas

- Los IDs autogenerados por JSF (`j_idt…`) pueden cambiar si el servidor recompila la vista; el
  scraper lee del HTML lo que puede (ej. el id del botón de descarga se extrae del `onclick`).
- El sitio de OEFA puede estar caído ocasionalmente; durante el desarrollo se usaron *fixtures*
  de respuestas reales (no versionados) para probar el parsing sin conexión.
