# ghosts.spot2.mx — Prototipo de validación

Visualización interactiva de los **643 leads SS** que el chatbot de Spot2 dejó perder entre **feb–abr 2026** (~$1.3M MXN en comisión potencial). Demo end-to-end con feed, detalle de conversación, timeline del break del 2-feb, y un modal de "rescate" que copia un mensaje pre-llenado al portapapeles para enviarlo manualmente por WhatsApp.

> Prototipo dark mode, mobile-first, **sin backend, sin auth, sin DB**. Todos los datos viven en JSON estático + localStorage.

## Stack

- **Next.js 14** (App Router, TypeScript, Tailwind CSS)
- **Framer Motion** — counter animado, modal, micro-interacciones
- **Recharts** — bar chart del timeline ISO
- **Lucide React** — iconografía
- **react-markdown** + **rehype-sanitize** — burbujas de chat con links seguros

## Pantallas

| Ruta | Función |
|---|---|
| `/` | Landing con counter animado del MXN perdido |
| `/feed` | Lista de los 10 ghosts mock con filtros (sector / ciudad / score / search) |
| `/feed/[conv_id]` | Detalle de conversación, spots recomendados, CTA de rescate |
| `/timeline` | Bar chart pre/post break del 2-feb 2026 |
| `/profile` | Stats personales + reset de la demo |

## Desarrollo local

```bash
nvm use 20            # o cualquier Node ≥ 18
npm install
npm run dev           # http://localhost:3000
```

Build de producción:

```bash
npm run build && npm start
```

## Datos mock

Tres archivos en `src/data/`:

- **`metrics.json`** — totales globales (643 ghosts, $1.287.400 MXN perdidos, fórmula completa)
- **`timeline.json`** — desglose ISO semana 2 a 17 (ene–abr 2026), flag pre/post 2-feb
- **`ghosts.json`** — 10 fantasmas pregenerados con conversación completa, spots recomendados e intent_score

Para ajustar las cifras o sumar fantasmas, edita esos JSON. No hay validación en runtime — los tipos están en `src/types/ghost.ts`.

## Persistencia

Los rescates se guardan en `localStorage` con la key `ghosts_resolutions_v1`. Implementación en [`src/lib/resolutions.ts`](src/lib/resolutions.ts) — incluye fallback a memoria para Safari iOS private mode.

## Deploy en Vercel

1. **Push a GitHub** (este proyecto ya está conectado a [Ghost-Spot-2](https://github.com/leandrobalbian-coder/Ghost-Spot-2.git)).
2. En Vercel: **New Project → Import** desde el repo.
3. Framework preset: **Next.js** (autodetectado). Sin variables de entorno necesarias.
4. **Deploy** — el build tarda ~40 s.
5. Conectar dominio `ghosts.spot2.mx` desde Vercel → Settings → Domains.

## Filosofía

Es un prototipo de validación de 3 días para CEO/Jorge y luego Sales internos. Funciona como producto real pero **no manda WhatsApp real**: el modal muestra el mensaje contextualizado y lo copia al portapapeles para que Sales lo envíe a mano si quiere probar.

Si la demo convence:
1. Reemplazar JSON por queries reales a Djinn (PG + MySQL — queries en sección 13 del handoff).
2. Sumar Google OAuth con dominio `@spot2.mx`.
3. Crear tabla `ghost_resolutions` en PG.
4. Cambiar el modal por integración real con WhatsApp (`wa.me` deep link).
