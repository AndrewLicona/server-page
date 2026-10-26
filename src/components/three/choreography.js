/**
 * Coreografía del recorrido: las poses de la cámara y el movimiento de la tapa.
 *
 * `look` es el punto que mira la cámara, en coordenadas locales del portátil
 * (origen en el centro de su caja envolvente). `dir` es la dirección desde ese
 * punto hacia la cámara. `zoom` acerca o aleja la cámara respecto al encuadre
 * justo: por debajo de 1 se ve más cerca (y el portátil se sale del encuadre a
 * propósito, por ejemplo para la pantalla en primer plano). `zoomM` es el
 * equivalente para pantallas verticales, donde el portátil aprovecha mejor el
 * ancho y conviene un punto más de cercanía.
 *
 * `lid` es el ángulo de la tapa en radianes alrededor de la bisagra. 0 es la
 * postura tal y como viene en el GLB (abierta unos 104 grados) y los valores
 * negativos la cierran hacia el teclado. La tapa no llega a cerrarse del
 * todo: siempre tiene que verse la pantalla, que es la protagonista.
 *
 * Ojo con la cámara: en el GLB la pantalla mira hacia -Z (el teclado queda en
 * z negativa y la bisagra en z positiva), así que la cámara vive en el lado
 * negativo de Z para mirar la pantalla de frente.
 */
export const KEYFRAMES = [
  { p: 0.0, look: [0, 0.05, 0.0], dir: [0.14, 0.44, -1], zoom: 1.0, zoomM: 1.0, rot: [0.05, 0.62, 0.0], lid: -0.52 },
  { p: 0.17, look: [0, 0.07, 0.04], dir: [0.05, 0.26, -1], zoom: 1.0, zoomM: 1.0, rot: [0.03, 0.34, 0.0], lid: -0.06 },
  { p: 0.35, look: [0, 0.13, 0.18], dir: [0.0, 0.16, -1], zoom: 1.0, zoomM: 1.0, rot: [0.01, 0.1, 0.0], lid: 0.0 },
  { p: 0.5, look: [0, 0.1, 0.18], dir: [0.0, 0.09, -1], zoom: 1.02, zoomM: 1.06, rot: [0.0, 0.0, 0.0], lid: 0.0 },
  { p: 0.66, look: [0, -0.06, -0.02], dir: [0.25, 0.62, -1], zoom: 0.95, zoomM: 0.98, rot: [0.12, -0.2, 0.0], lid: -0.22 },
  { p: 0.84, look: [0, -0.06, -0.02], dir: [-0.25, 0.55, -1], zoom: 0.95, zoomM: 0.98, rot: [0.14, 0.16, 0.0], lid: -0.22 },
  { p: 1.0, look: [0, 0.05, 0.0], dir: [0.2, 0.4, -1], zoom: 0.94, zoomM: 0.94, rot: [0.07, 0.46, 0.02], lid: 0.0 },
];

export const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const smoothstep = (t) => t * t * (3 - 2 * t);

/**
 * Interpola la coreografía para un punto del recorrido.
 */
export function sampleKeyframes(progress) {
  const p = clamp(progress, 0, 1);
  let index = 0;
  while (index < KEYFRAMES.length - 2 && p > KEYFRAMES[index + 1].p) index += 1;

  const a = KEYFRAMES[index];
  const b = KEYFRAMES[index + 1];
  const span = b.p - a.p || 1;
  const t = smoothstep(clamp((p - a.p) / span, 0, 1));

  return {
    look: a.look.map((value, i) => lerp(value, b.look[i], t)),
    dir: a.dir.map((value, i) => lerp(value, b.dir[i], t)),
    zoom: lerp(a.zoom, b.zoom, t),
    zoomM: lerp(a.zoomM, b.zoomM, t),
    rot: a.rot.map((value, i) => lerp(value, b.rot[i], t)),
    lid: lerp(a.lid, b.lid, t),
  };
}
