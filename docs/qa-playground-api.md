# QA Playground: contrato de la API

Base: `/api`. Local: `npm run dev:api` (`http://localhost:3100`). Todos los importes están en centavos (USD).

## Convenciones

| Tema | Detalle |
|---|---|
| Formato de error | `{ "error": { "code", "message", "details?", "requestId" } }` |
| Validación | `VALIDATION_ERROR` con `details: [{ field, code, message }]`. Auth, cart y products responden 400. Checkout y forms responden 422 |
| Request id | `X-Request-Id` en todas las respuestas. Si el cliente envía uno válido (`[\w.-]{1,64}`), se devuelve el mismo |
| Auth | `Authorization: Bearer <jwt>` (HS256). TTL por defecto 900 s |
| Body | Solo `application/json`, máximo 100 KB. Campos desconocidos se rechazan con `UNKNOWN_FIELD` |
| Cache | `Cache-Control: no-store` |
| CORS | `Access-Control-Allow-Origin: *`, preflight `OPTIONS` con 204 |
| Rate limit | Cabeceras `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `Retry-After` (en 429). La clave es la IP o la cabecera `X-RateLimit-Key` |
| Despliegue | Una sola función serverless (`api/[...path].ts`) despacha todas las rutas, por el límite de 12 funciones del plan Hobby de Vercel. Los handlers viven en `api/_routes/` |
| Estado | Sin base de datos. Contadores, claves de idempotencia e inventario viven en memoria por instancia (en Vercel puede variar entre instancias; en local es determinista) |

## Usuarios semilla

| Email | Password | Rol | Nota |
|---|---|---|---|
| `user@qa.test` | `Passw0rd!` | user | |
| `admin@qa.test` | `Adm1nPass!` | admin | Puede leer órdenes ajenas |
| `locked@qa.test` | `Passw0rd!` | user | Login responde 423 |

Los registros nuevos no se persisten: `register` devuelve un token y el usuario no puede volver a iniciar sesión.

## Endpoints

| Método y ruta | Auth | Éxito | Errores |
|---|---|---|---|
| `GET /api/health` | no | 200 | |
| `POST /api/reset` | no | 204, limpia rate limit e idempotencia y restaura el inventario | |
| `POST /api/auth/register` | no | 201 `{ user, token, expiresIn }`, límite 10/min | 400 `VALIDATION_ERROR` (`WEAK_PASSWORD`, `MISMATCH`, `TERMS_NOT_ACCEPTED`), 409 `EMAIL_TAKEN`, 429 |
| `POST /api/auth/login` | no | 200 `{ user, token, expiresIn }`, límite 5/min. `ttl` opcional (1 a 3600 s) | 400, 401 `INVALID_CREDENTIALS`, 423 `ACCOUNT_LOCKED`, 429 `RATE_LIMITED` |
| `GET /api/auth/me` | sí | 200 `{ user, expiresAt }` | 401 `UNAUTHORIZED`, `TOKEN_INVALID`, `TOKEN_EXPIRED` |
| `POST /api/auth/logout` | sí | 204 | 401 |
| `GET /api/products` | no | 200 `{ data, meta }` | 400 |
| `GET /api/products/:id` | no | 200 `{ data }` | 400 `INVALID_ID`, 404 `PRODUCT_NOT_FOUND` |
| `POST /api/cart/price` | no | 200 totales | 400, 404, 409 `INSUFFICIENT_STOCK`, 422 cupón |
| `POST /api/checkout` | sí | 201 orden. Replay con la misma clave: 200 + `Idempotent-Replayed: true` | 400 `IDEMPOTENCY_KEY_REQUIRED`, 401, 402 `CARD_DECLINED` / `INSUFFICIENT_FUNDS`, 404, 409, 422 `VALIDATION_ERROR` / `IDEMPOTENCY_KEY_REUSED` / cupón |
| `GET /api/orders/:id` | sí | 200 `{ data }` | 401, 403 `FORBIDDEN`, 404 `ORDER_NOT_FOUND` |
| `POST /api/forms/submit` | no | 201 `{ id, receivedAt, data }` | 400, 422 |
| `GET/POST/PUT/PATCH/DELETE /api/chaos` | no | `status`, `delay`, `malformed`, `failRate` | 400, 503 `CHAOS_FAILURE` |

Errores transversales: 405 `METHOD_NOT_ALLOWED` (con `Allow`), 413 `PAYLOAD_TOO_LARGE`, 415 `UNSUPPORTED_MEDIA_TYPE`, 400 `INVALID_JSON`, 500 `INTERNAL_ERROR`.

## Productos

Query de `GET /api/products`: `page` (1 a 1000, default 1), `pageSize` (1 a 50, default 5), `q` (título o artista), `artist` (contiene, sin distinguir mayúsculas), `category` (movimiento: `impressionism|post-impressionism|expressionism|surrealism|cubism|baroque|abstract|historical|kinetic`), `minPrice`, `maxPrice`, `inStock` (`true|false`), `sort` (`price|-price|name|-name|year|-year|rating|-rating`).

Catálogo de 18 reproducciones de obras de arte (Sorolla, Munch, Frida Kahlo, Van Gogh, Picasso, Rembrandt, Kandinsky, Michelena y Carlos Cruz-Diez). Campos: `id`, `sku`, `name` (título), `artist`, `year`, `category`, `price`, `stock`, `rating`.

Cada obra es una copia con unidades limitadas. `stock` baja cuando un checkout se confirma (`POST /api/checkout` con 201) y no cambia con `cart/price`, con errores de pago ni con un replay idempotente. `POST /api/reset` restaura el stock inicial.

Stock inicial: producto 3 (El grito) tiene stock 3, producto 7 (Guernica) tiene stock 0, producto 9 (La ronda de noche) tiene stock 5.

## Precios

`subtotal - descuento + envío + impuesto = total`. El impuesto es 10 % de `subtotal - descuento`. Envío `standard` 500 y `express` 1500. Envío gratis si `subtotal - descuento >= 10000` o con el cupón `FREESHIP`.

| Cupón | Efecto |
|---|---|
| `SAVE10` | 10 % de descuento |
| `FIXED5` | 500 de descuento, requiere subtotal >= 2000 (`COUPON_MIN_NOT_MET`) |
| `FREESHIP` | Envío gratis |
| `WINTER20` | `COUPON_EXPIRED` |
| otro | `COUPON_INVALID` |

Cantidad por ítem: 1 a 10. Ítems por carrito: 1 a 20. No se permiten productos duplicados (`DUPLICATE_ITEM`).

## Checkout

Cabecera obligatoria `Idempotency-Key` (8 a 64 caracteres: letras, dígitos, `_` o `-`). El id de la orden es un token firmado que contiene la orden completa, por lo que no se necesita almacenamiento.

Tarjetas de prueba: `4242424242424242` aprueba, `4000000000000002` rechaza (402 `CARD_DECLINED`), `4000000000009995` fondos insuficientes (402 `INSUFFICIENT_FUNDS`). Cualquier otra debe pasar Luhn. Vencimiento `MM/YY` no pasado, CVV de 3 o 4 dígitos.

## Formulario

Campos de `POST /api/forms/submit`: `fullName`, `email`, `country` (`AR|BR|CL|CO|MX|US|ES`), `gender` (`female|male|nonbinary|undisclosed`), `interests` (1 a 5 únicos de `information|appraisal|commission|framing|shipping`), `birthDate` (`YYYY-MM-DD` real, mayor de 18), `collectingYears` (años coleccionando, 0 a 60), `message` (opcional, máx. 500), `newsletter` (opcional), `acceptTerms` (debe ser `true`), `attachment` (imagen de referencia, opcional, `{ name, size <= 2 MB, type: image/png|image/jpeg|application/pdf }`).

## Chaos

`/api/chaos?status=503&delay=2000&malformed=true&failRate=0.5`

| Parámetro | Rango | Efecto |
|---|---|---|
| `status` | 200 a 599 | Código de respuesta |
| `delay` | 0 a 10000 ms | Latencia artificial |
| `malformed` | `true` | Cuerpo JSON truncado |
| `failRate` | 0 a 1 | Probabilidad de 503 aleatorio |
