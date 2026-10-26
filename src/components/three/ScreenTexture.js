import * as THREE from "three";

/**
 * Textura dinámica para la pantalla del portátil.
 *
 * La malla `display` del GLB llega con un material negro sin mapa, así que la
 * pantalla "apagada" es un rectángulo negro. Le inyectamos una CanvasTexture
 * que redibujamos con los datos reales que publica el backend.
 *
 * Se dibuja sobre un canvas 2D y se sube como textura del material, en lugar
 * de usar un shader: así podemos pintar texto, barras y sparklines con total
 * libertad sin escribir GLSL, y el coste por frame es despreciable porque solo
 * se redibuja cuando llegan datos nuevos (cada 3 s).
 *
 * El lienzo usa la proporción real del LCD del modelo (16:9, 1280x704) para que
 * el contenido no se deforme al proyectarlo sobre la pantalla.
 */

const WIDTH = 1280;
const HEIGHT = 728;

const COLORS = {
  bg: "#04070f",
  panel: "#0b1220",
  panelAlt: "#0f1a2e",
  border: "#1e293b",
  text: "#e2e8f0",
  muted: "#64748b",
  blue: "#60a5fa",
  cyan: "#22d3ee",
  green: "#34d399",
  amber: "#fbbf24",
  pink: "#f472b6",
  red: "#f87171",
};

const MONO = "ui-monospace, 'Cascadia Code', Consolas, monospace";

export function createScreenTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext("2d");

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  texture.generateMipmaps = false;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;

  return { canvas, ctx, texture };
}

/** Rectángulo redondeado (con reserva para navegadores sin roundRect). */
function roundRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(x, y, width, height, r);
    return;
  }
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + width, y, x + width, y + height, r);
  ctx.arcTo(x + width, y + height, x, y + height, r);
  ctx.arcTo(x, y + height, x, y, r);
  ctx.arcTo(x, y, x + width, y, r);
  ctx.closePath();
}

function loadLevel(value) {
  if (value == null) return COLORS.cyan;
  if (value > 80) return COLORS.red;
  if (value > 60) return COLORS.amber;
  return COLORS.cyan;
}

function drawBar(ctx, x, y, width, height, percent, color) {
  roundRect(ctx, x, y, width, height, height / 2);
  ctx.fillStyle = COLORS.panelAlt;
  ctx.fill();

  const filled = Math.max(0, Math.min(100, percent)) / 100;
  if (filled > 0) {
    roundRect(ctx, x, y, Math.max(height, width * filled), height, height / 2);
    ctx.fillStyle = color;
    ctx.fill();
  }
}

function drawSparkline(ctx, x, y, width, height, values, color) {
  roundRect(ctx, x, y, width, height, 12);
  ctx.fillStyle = COLORS.panel;
  ctx.fill();
  ctx.strokeStyle = COLORS.border;
  ctx.lineWidth = 2;
  ctx.stroke();

  if (!values.length) return;

  const step = width / Math.max(1, values.length - 1);
  ctx.beginPath();
  values.forEach((value, index) => {
    const px = x + index * step;
    const py = y + height - (Math.max(0, Math.min(100, value)) / 100) * height;
    if (index === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  });
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.lineTo(x + (values.length - 1) * step, y + height);
  ctx.lineTo(x, y + height);
  ctx.closePath();
  ctx.globalAlpha = 0.16;
  ctx.fillStyle = color;
  ctx.fill();
  ctx.globalAlpha = 1;
}

function formatUptime(seconds) {
  if (!seconds) return "--";
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

/**
 * Redibuja el contenido de la pantalla.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {{metrics: object|null, history: Array, phase: string}} data
 */
export function drawScreen(ctx, data) {
  const { metrics, history, phase } = data;

  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  // Fondo con degradado
  const gradient = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
  gradient.addColorStop(0, "#081226");
  gradient.addColorStop(1, COLORS.bg);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Rejilla sutil de terminal
  ctx.strokeStyle = "rgba(34, 211, 238, 0.045)";
  ctx.lineWidth = 1;
  for (let x = 0; x < WIDTH; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, HEIGHT);
    ctx.stroke();
  }

  ctx.textBaseline = "top";

  // ---- Cabecera -----------------------------------------------------------
  ctx.fillStyle = "rgba(11, 18, 32, 0.92)";
  ctx.fillRect(0, 0, WIDTH, 84);
  ctx.strokeStyle = COLORS.border;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 84);
  ctx.lineTo(WIDTH, 84);
  ctx.stroke();

  ctx.fillStyle = COLORS.cyan;
  ctx.font = `bold 34px ${MONO}`;
  ctx.fillText("server-page", 32, 24);

  ctx.font = `22px ${MONO}`;
  ctx.fillStyle = COLORS.muted;
  ctx.fillText("ubuntu server 24.04 lts", 300, 30);

  // Estado de conexión
  const online = metrics != null;
  const dotX = WIDTH - 176;
  ctx.beginPath();
  ctx.arc(dotX, 42, 11, 0, Math.PI * 2);
  ctx.fillStyle = online ? COLORS.green : COLORS.red;
  ctx.fill();
  ctx.fillStyle = online ? COLORS.green : COLORS.red;
  ctx.font = `22px ${MONO}`;
  ctx.fillText(online ? "online" : "offline", dotX + 24, 31);

  // ---- Métricas en tarjetas ----------------------------------------------
  const cpu = metrics?.cpu ?? 0;
  const memory = metrics?.memory ?? 0;
  const disk = metrics?.disk ?? 0;

  const tiles = [
    { label: "CPU", value: cpu, color: loadLevel(cpu) },
    { label: "RAM", value: memory, color: loadLevel(memory) },
    { label: "DISCO", value: disk, color: loadLevel(disk) },
  ];

  const tileWidth = 389;
  const tileGap = 24;
  tiles.forEach((tile, index) => {
    const x = 32 + index * (tileWidth + tileGap);
    const y = 112;
    const height = 194;

    roundRect(ctx, x, y, tileWidth, height, 16);
    ctx.fillStyle = COLORS.panel;
    ctx.fill();
    ctx.strokeStyle = COLORS.border;
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = COLORS.muted;
    ctx.font = `20px ${MONO}`;
    ctx.fillText(tile.label, x + 24, y + 22);

    ctx.fillStyle = tile.color;
    ctx.font = `bold 54px ${MONO}`;
    ctx.textAlign = "right";
    ctx.fillText(`${Math.round(tile.value)}%`, x + tileWidth - 24, y + 52);
    ctx.textAlign = "left";

    drawBar(ctx, x + 24, y + height - 48, tileWidth - 48, 20, tile.value, tile.color);
  });

  // ---- Historial de CPU ----------------------------------------------------
  const chartX = 32;
  const chartY = 330;
  const chartW = 776;
  const chartH = 230;

  roundRect(ctx, chartX, chartY, chartW, chartH, 16);
  ctx.fillStyle = COLORS.panel;
  ctx.fill();
  ctx.strokeStyle = COLORS.border;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = COLORS.muted;
  ctx.font = `20px ${MONO}`;
  ctx.fillText("historial de cpu", chartX + 24, chartY + 20);

  const cpuSeries = history.map((point) => point.cpu ?? 0);
  drawSparkline(ctx, chartX + 24, chartY + 56, chartW - 48, chartH - 88, cpuSeries, COLORS.blue);

  // ---- Uptime y stack ------------------------------------------------------
  const sideX = 832;
  const sideW = 416;

  roundRect(ctx, sideX, chartY, sideW, chartH, 16);
  ctx.fillStyle = COLORS.panel;
  ctx.fill();
  ctx.strokeStyle = COLORS.border;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = COLORS.muted;
  ctx.font = `20px ${MONO}`;
  ctx.fillText("uptime", sideX + 24, chartY + 20);
  ctx.fillStyle = COLORS.text;
  ctx.font = `bold 34px ${MONO}`;
  ctx.fillText(formatUptime(metrics?.uptime), sideX + 24, chartY + 48);

  ctx.fillStyle = COLORS.muted;
  ctx.font = `20px ${MONO}`;
  ctx.fillText("stack", sideX + 24, chartY + 100);

  const stack = ["docker", "casaos", "cloudflare", "ssh"];
  stack.forEach((item, index) => {
    const x = sideX + 24 + (index % 2) * 196;
    const y = chartY + 134 + Math.floor(index / 2) * 38;
    ctx.fillStyle = COLORS.cyan;
    ctx.font = `20px ${MONO}`;
    ctx.fillText(`· ${item}`, x, y);
  });

  // ---- Registro del sistema ------------------------------------------------
  ctx.fillStyle = COLORS.muted;
  ctx.font = `18px ${MONO}`;
  const logs = [
    "[ok] cloudflared tunnel established",
    "[ok] casaos services healthy (4/4)",
  ];
  logs.forEach((line, index) => {
    ctx.fillText(line, 32, 584 + index * 30);
  });

  ctx.fillStyle = "rgba(34, 211, 238, 0.08)";
  ctx.fillRect(32, 660, WIDTH - 64, 2);

  ctx.fillStyle = COLORS.cyan;
  ctx.font = `18px ${MONO}`;
  ctx.fillText("$ docker compose ps --format '{{.Service}}  {{.Status}}'", 32, 676);
  ctx.fillStyle = COLORS.muted;
  ctx.fillText("4 services running", 660, 676);

  // ---- Nota de fase (arranque) --------------------------------------------
  if (phase === "boot") {
    ctx.fillStyle = "rgba(4, 7, 15, 0.88)";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = COLORS.cyan;
    ctx.font = `bold 40px ${MONO}`;
    ctx.fillText("> arrancando servicios...", 64, 250);
    ctx.fillStyle = COLORS.muted;
    ctx.font = `26px ${MONO}`;
    ctx.fillText("$ docker compose up -d", 64, 316);
    ctx.fillStyle = COLORS.green;
    ctx.fillRect(64, 366, 20, 30);
    ctx.fillStyle = COLORS.muted;
    ctx.font = `22px ${MONO}`;
    ctx.fillText("descargando capas...", 100, 370);
  }
}
