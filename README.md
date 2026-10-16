# Prueba técnica · Desarrollador/a Full Stack Junior

**Stack:** React 18 (Vite) · NestJS 10 · MongoDB 7 (Mongoose)

---

## 📖 Contexto

Acabas de entrar al equipo y heredas **Tienda**, una aplicación interna para consultar productos, armar un carrito y registrar pedidos.

La aplicación *funciona*… más o menos. La persona que la desarrolló ya no está en la empresa y el equipo de soporte ha ido acumulando quejas de los usuarios. Tu misión es **estabilizarla, hacerla más rápida y dejarla mejor de lo que la encontraste**.

> No esperamos que lo resuelvas todo. Esperamos que entiendas **por qué** pasa cada cosa y que nos lo sepas explicar.

---

## 🚀 Cómo levantar el proyecto

### Requisitos
- Node.js 20 o superior
- Docker (para MongoDB) — o un MongoDB 6+ corriendo en `localhost:27017`

### Pasos

```bash
# 1. Base de datos
docker compose up -d

# 2. Backend (http://localhost:3000)
cd backend
npm install
npm run seed        # carga ~5.000 productos, 300 clientes y 800 pedidos
npm run start:dev

# 3. Frontend (http://localhost:5173) — en otra terminal
cd frontend
npm install
npm run dev
```

### Estructura

```
.
├── docker-compose.yml
├── backend/                 # API NestJS
│   └── src/
│       ├── products/        # catálogo
│       ├── customers/       # clientes
│       ├── orders/          # pedidos y estadísticas
│       └── seed.ts          # datos de prueba
└── frontend/                # SPA React
    └── src/
        ├── context/         # estado del carrito
        └── components/      # pantallas
```

### Endpoints actuales

| Método | Ruta                        | Descripción                          |
|--------|-----------------------------|--------------------------------------|
| GET    | `/products`                 | Lista de productos (`search`, `category`) |
| GET    | `/products/count`           | Total de productos                   |
| GET    | `/products/categories`      | Categorías disponibles               |
| GET    | `/products/:id`             | Detalle de un producto               |
| POST   | `/products`                 | Crear producto                       |
| GET    | `/customers`                | Lista de clientes                    |
| GET    | `/customers/by-email`       | Buscar cliente por `email`           |
| GET    | `/customers/:id`            | Detalle de un cliente                |
| GET    | `/orders`                   | Lista de pedidos (`status`)          |
| GET    | `/orders/:id`               | Detalle de un pedido                 |
| GET    | `/orders/top-products`      | Productos más vendidos (`limit`)     |
| POST   | `/orders`                   | Crear pedido                         |
| PATCH  | `/orders/:id/status`        | Cambiar estado de un pedido          |

---

## 🎯 Qué tienes que hacer

### Parte 1 — Tickets de soporte (obligatorio)

Estos son los reportes tal como llegaron de los usuarios. Describen **síntomas**, no causas: parte del trabajo es encontrar la causa raíz.

| # | Reporte |
|---|---------|
| **T1** | *"Cuando agrego un producto al carrito, a veces no aparece de inmediato; aparece como un segundo después. Y el total del carrito no siempre cuadra."* |
| **T2** | *"Todos los pedidos nuevos quedan guardados con total **$0**."* |
| **T3** | *"Ayer la API se cayó por completo cuando un cliente intentó comprar más unidades de las que había en stock. Hubo que reiniciarla a mano."* |
| **T4** | *"La pestaña **Pedidos** tarda una eternidad en cargar. Y si la dejas abierta un rato, todo el sistema se pone cada vez más lento."* |
| **T5** | *"Escribir en el buscador de productos se siente trabado. De hecho, la página entera va lenta aunque no esté haciendo nada."* |
| **T6** | *"Si busco `camisa (talla` la pantalla se queda en blanco."* |
| **T7** | *"La pestaña **Estadísticas** nunca ha funcionado."* |

### Parte 2 — Nueva funcionalidad (obligatorio)

**Paginación y filtros de productos desde el servidor.**

Criterios de aceptación:

- [ ] `GET /products` acepta `page`, `limit`, `search` y `category` y responde con:
  ```json
  { "data": [ ... ], "total": 5003, "page": 1, "limit": 20 }
  ```
- [ ] El filtrado, el ordenamiento y la paginación ocurren **en la base de datos**, no en memoria.
- [ ] `limit` tiene un máximo razonable (que nadie pueda pedir 1.000.000 de registros).
- [ ] El frontend muestra controles de paginación (anterior / siguiente y página actual).
- [ ] El selector de categorías se alimenta desde el servidor.
- [ ] La búsqueda no dispara una petición por cada tecla que se presiona.

### Parte 3 — Milla extra (opcional, suma puntos)

La aplicación tiene **más problemas de los que se reportaron**: de rendimiento, de seguridad, de validación, de manejo de errores y de buenas prácticas, tanto en el backend como en el frontend.

Encuéntralos, arréglalos y/o documéntalos. **Un problema bien identificado y explicado vale aunque no te dé tiempo de arreglarlo.**

Algunas ideas si quieres ir más allá (no son obligatorias, elige las que te interesen):

- Tests unitarios o e2e de lo que arreglaste.
- Configuración por variables de entorno.
- Dockerizar backend y frontend.
- Mejor manejo de errores y estados de carga / vacío en la UI.
- Editar la cantidad de un producto desde el carrito.
- Cambiar el estado de un pedido desde la UI.
- Documentación de la API (Swagger).
- Migrar el frontend a TypeScript.
- Cualquier cosa que tú, como usuario/a o como desarrollador/a, mejorarías.

---

## 📦 Qué tienes que entregar

1. **Un repositorio Git** (GitHub, GitLab o un `.zip` con la carpeta `.git` incluida).
   - Haz **commits pequeños y descriptivos** (idealmente uno por ticket o por cambio lógico). No los aplastes en uno solo: queremos ver tu proceso.
2. **Un archivo `SOLUCION.md`** en la raíz con esta estructura:

   ```markdown
   ## Tickets
   ### T1 — <título>
   - **Causa raíz:** ¿qué estaba pasando realmente y por qué?
   - **Solución:** ¿qué cambiaste?
   - **Cómo lo verifiqué:** pasos, test, captura, medición antes/después…

   (repetir para cada ticket)

   ## Nueva funcionalidad
   Decisiones que tomaste y por qué.

   ## Otros problemas encontrados
   | Problema | Dónde | Impacto | ¿Lo arreglé? |
   |----------|-------|---------|--------------|

   ## Si tuviera más tiempo…
   Qué harías después y en qué orden.
   ```

3. Las instrucciones para levantar el proyecto deben **seguir funcionando**. Si agregas pasos (variables de entorno, etc.), actualiza este README.

---

## ⏱️ Tiempo

- Tienes **3 días calendario** desde que recibes la prueba.
- Estimamos entre **4 y 6 horas** de trabajo efectivo. No necesitas invertir más.
- Si no terminas algo, déjalo documentado en `SOLUCION.md`. Preferimos 5 tickets bien entendidos que 7 parcheados.

## 🤖 Sobre el uso de Google, documentación e IA

Puedes usar todo lo que usarías en tu día a día. Pero ten en cuenta que **después tendremos una sesión técnica** en la que te pediremos explicar cada cambio, por qué lo hiciste así y qué alternativas consideraste. Si no puedes explicarlo, no cuenta.

---

## ✅ Qué valoramos

- Que encuentres la **causa raíz** y no solo tapes el síntoma.
- Que tus soluciones sean **simples y legibles**.
- Que **verifiques** lo que arreglas (y nos cuentes cómo).
- Que sepas **priorizar**: qué es grave, qué puede esperar.
- Que **comuniques** bien: commits, `SOLUCION.md`, comentarios donde aporten.
- Curiosidad: lo que hagas por iniciativa propia, más allá de lo pedido.

¡Mucho éxito! 🚀
