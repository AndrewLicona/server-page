# server-page

Sitio web de un **Acer Aspire 3 A315-42** reconvertido en **servidor doméstico**
con Ubuntu Server 24.04 LTS, Docker y un túnel de Cloudflare.

La portada no es una página de texto: es una **escena 3D real** (three.js +
React Three Fiber) en la que el portátil se abre, enciende la pantalla y va
girando mientras el visitante hace scroll. En la pantalla del modelo se ven las
**métricas en vivo** que publica el backend.

## Stack

| Capa | Tecnología |
| --- | --- |
| Frontend | React 19 + Vite 7 + Tailwind CSS 4 |
| 3D | three.js + @react-three/fiber + @react-three/drei |
| Gráficas | Recharts |
| Backend | FastAPI (métricas del sistema y estado de los servicios) |
| Despliegue | Docker + nginx, con Dockploy (push a `main` = despliegue) |

## Puesta en marcha

```bash
npm install

# Frontend (http://127.0.0.1:5173)
npm run dev

# Backend (http://127.0.0.1:8000)
cd backend
python -m uvicorn app.main:app --reload
```

El frontend llama a `/api/metrics`; en desarrollo el proxy de Vite lo redirige
al backend. En producción lo sirve nginx (`location /api/` → `backend:8000`).

```bash
npm run build     # genera dist/
npm run lint      # ESLint
npm run preview   # sirve dist/ en local
```

## Endpoints del backend

| Ruta | Respuesta |
| --- | --- |
| `GET /api/metrics` | `{cpu, memory, disk, uptime}` — se refresca cada 3 s |
| `GET /api/status` | `{services: [{name, slug, url, online}]}` |
| `GET /health` | `{status: "ok"}` |

## Cómo está montado el 3D

- `src/components/three/choreography.js` — una sola curva gobierna todo el
  recorrido: la pose de la cámara, el giro del rig y **el ángulo de la tapa**.
  La tapa se cierra un poco al principio y se abre sola al hacer scroll.
- `src/components/three/Scene.jsx` — monta las luces y aplica la coreografía.
  El encuadre se calcula sobre la silueta real del modelo, así que se ve igual
  en un móvil que en un monitor grande.
- `src/components/three/useLaptopParts.js` — separa base y tapa del GLB,
  calcula la bisagra y localiza el rectángulo del LCD para montar encima el
  panel de pantalla.
- `src/components/three/ScreenTexture.js` — dibuja el dashboard en un canvas y
  lo sube como textura de la pantalla.
- `src/components/three/laptopMaterials.js` — materiales y colores reales del
  equipo (azul cepillado, teclado negro).
- `src/hooks/useDeviceProfile.js` — niveles de calidad según el dispositivo
  (dpr, sombras, resolución del entorno, longitud del recorrido).

Los textos y el indicador de scroll se actualizan **sin re-renderizar React**:
el progreso del scroll viaja por una `ref` y se lee dentro de `useFrame`.

## Modelo 3D

`public/models/laptop.glb` es un portátil low-poly con las piezas separadas por
materiales (`case`, `display`, `bezel`, `keyboard`, `touchpad`, `ports`,
`ethernet_port`, `holes`). Los UV de la malla de pantalla son degenerados, así
que el dashboard se aplica a un panel propio. Para que caiga **literalmente
dentro de la pantalla** del modelo, el panel no se inventa: se localiza el
rectángulo del LCD en la malla `display` (el triángulo más grande de la malla
es su superficie útil) y se construyen sus cuatro esquinas con los mismos
vértices, con la inclinación y el marco reales del portátil.
