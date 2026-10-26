/**
 * Store compartido del estado del servidor.
 *
 * Antes cada componente hacía su propio fetch: Metrics.jsx poleaba /api/metrics
 * cada 3s. Esto centraliza el endpoint en un único timer, de modo que la
 * pantalla del portátil en 3D y los paneles 2D leen exactamente los mismos
 * datos sin duplicar tráfico contra la API.
 */
import { useSyncExternalStore } from "react";

const POLL_METRICS_MS = 3000;
const MAX_POINTS = 40;

const initialState = {
  metrics: null,
  history: [],
  connected: false,
  error: null,
  updatedAt: null,
};

let state = initialState;
const listeners = new Set();

let metricsTimer = null;
let inFlight = false;

function emit(patch) {
  state = { ...state, ...patch };
  listeners.forEach((listener) => listener());
}

function subscribe(listener) {
  listeners.add(listener);
  if (listeners.size === 1) start();
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) stop();
  };
}

/** La referencia de `state` solo cambia cuando hay datos nuevos, así que
 *  `useSyncExternalStore` no entra en bucle de re-render. */
function getSnapshot() {
  return state;
}

async function fetchMetrics() {
  if (inFlight) return;
  inFlight = true;
  try {
    const response = await fetch("/api/metrics", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const metrics = await response.json();
    const history = [
      ...state.history,
      { ...metrics, t: Date.now() },
    ].slice(-MAX_POINTS);
    emit({ metrics, history, connected: true, error: null, updatedAt: Date.now() });
  } catch (error) {
    emit({ connected: false, error: error.message });
  } finally {
    inFlight = false;
  }
}

function start() {
  fetchMetrics();
  metricsTimer = setInterval(fetchMetrics, POLL_METRICS_MS);

  // No tiene sentido interrogar al servidor desde una pestaña oculta.
  if (typeof document !== "undefined") {
    document.addEventListener("visibilitychange", handleVisibility);
  }
}

function stop() {
  clearInterval(metricsTimer);
  metricsTimer = null;
  if (typeof document !== "undefined") {
    document.removeEventListener("visibilitychange", handleVisibility);
  }
}

function handleVisibility() {
  clearInterval(metricsTimer);
  if (document.hidden) return;

  // Al volver a la pestaña recuperamos el estado de inmediato.
  fetchMetrics();
  metricsTimer = setInterval(fetchMetrics, POLL_METRICS_MS);
}

/**
 * Suscripción reactiva a los datos del servidor.
 * Devuelve siempre el mismo objeto mientras no haya cambios.
 */
export function useServerStore() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
