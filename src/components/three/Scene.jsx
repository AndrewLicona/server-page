import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, ContactShadows, AdaptiveDpr } from "@react-three/drei";
import * as THREE from "three";
import Laptop from "./Laptop";
import { useLaptopParts } from "./useLaptopParts";
import { clamp, sampleKeyframes, smoothstep } from "./choreography";

/** Holgura alrededor del portátil al calcular el encuadre. */
const FRAME_MARGIN = 1.07;

/** Puntos marcados sobre la base: nunca sobre la pantalla, para no taparla. */
const HOTSPOT_COLORS = {
  cpu: "#22d3ee",
  ram: "#60a5fa",
  disk: "#fbbf24",
  net: "#34d399",
};

const UP = new THREE.Vector3(0, 1, 0);

export default function Scene({
  scrollRef,
  quality,
  metrics,
  history,
  connected,
}) {
  const parts = useLaptopParts();
  const rigRef = useRef();
  const dotRefs = useRef([]);
  const haloRefs = useRef([]);
  const firstFrame = useRef(true);
  const { camera, size } = useThree();

  // Vectores reutilizados: en un bucle de render no conviene crear objetos.
  const scratch = useMemo(
    () => ({
      look: new THREE.Vector3(),
      dir: new THREE.Vector3(),
      forward: new THREE.Vector3(),
      right: new THREE.Vector3(),
      up: new THREE.Vector3(),
      v: new THREE.Vector3(),
      target: new THREE.Vector3(),
      position: new THREE.Vector3(),
    }),
    []
  );

  // --- Puntos de interes sobre la base -------------------------------------
  const hotspots = useMemo(() => {
    const bounds = parts?.baseBounds;
    const center = parts?.center;
    if (!bounds || !center) return [];

    const width = bounds.max.x - bounds.min.x;
    const depth = bounds.max.z - bounds.min.z;
    const y = bounds.max.y - center.y + 0.012;

    // Las coordenadas del rig coinciden con las del portatil centradas: el
    // grupo del portatil ya aplica el desplazamiento al centro.
    const x = (fraction) => bounds.min.x - center.x + width * fraction;
    const z = (fraction) => bounds.min.z - center.z + depth * fraction;

    return [
      { id: "cpu", color: HOTSPOT_COLORS.cpu, at: [x(0.46), y, z(0.7)] },
      { id: "ram", color: HOTSPOT_COLORS.ram, at: [x(0.5), y, z(0.28)] },
      { id: "disk", color: HOTSPOT_COLORS.disk, at: [x(0.19), y, z(0.47)] },
      { id: "net", color: HOTSPOT_COLORS.net, at: [x(0.81), y, z(0.87)] },
    ];
  }, [parts]);

  useFrame((state, delta) => {
    const progress = scrollRef?.current ?? 0;
    const { look, dir, zoom, zoomM, rot } = sampleKeyframes(progress);
    const time = state.clock.elapsedTime;
    const idle = quality.reducedMotion ? 0 : 1;

    // --- Rig ---------------------------------------------------------------
    if (rigRef.current) {
      rigRef.current.position.set(0, 0, 0);
      rigRef.current.rotation.set(
        rot[0] + Math.sin(time * 0.35) * 0.02 * idle,
        rot[1] + Math.sin(time * 0.22) * 0.03 * idle,
        rot[2]
      );
      rigRef.current.scale.setScalar(1 + Math.sin(time * 0.9) * 0.004 * idle);
      rigRef.current.updateMatrixWorld(true);
    }

    // --- Cámara ------------------------------------------------------------
    // El encuadre se calcula sobre la silueta real del portátil (sus ocho
    // esquinas) girada por el rig, y no sobre un ancho fijo: así el modelo se
    // ve entero y del mismo tamaño en un móvil que en un monitor de 4K.
    const aspect = size.height > 0 ? size.width / size.height : 1;
    const wide = aspect > 1.25;

    const tanV = Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
    const tanH = tanV * aspect;

    scratch.look.set(look[0], look[1], look[2]);
    if (rigRef.current) rigRef.current.localToWorld(scratch.look);

    scratch.dir.set(dir[0], dir[1], dir[2]).normalize();
    scratch.forward.copy(scratch.dir).negate();
    scratch.right.crossVectors(scratch.forward, UP).normalize();
    scratch.up.crossVectors(scratch.right, scratch.forward).normalize();

    // Composición: en pantallas anchas el modelo se va a la derecha y el texto
    // ocupa la columna izquierda; en verticales el texto se queda arriba y el
    // modelo sube para quedar pegado a él, dejando libre la parte baja para la
    // leyenda de los puntos marcados.
    const panX = wide ? 0.16 : 0;
    const panY = wide ? 0 : -0.06;

    // Distancia mínima para que el portátil quepa con la composición elegida.
    //
    // Para cada esquina del modelo se impone |desvío| <= (profundidad + d) *
    // tan(medio ángulo), lo que se resuelve para d. Se toman las dos ramas
    // (esquina a un lado o al otro del eje) porque el encuadre descentra el
    // modelo: en horizontal queda a la derecha y en vertical sube un poco.
    let need = 0;
    if (parts?.corners) {
      for (const corner of parts.corners) {
        scratch.v.copy(corner);
        if (rigRef.current) rigRef.current.localToWorld(scratch.v);
        scratch.v.sub(scratch.look);

        const depth = scratch.v.dot(scratch.forward);
        const lateral = scratch.v.dot(scratch.right);
        const vertical = scratch.v.dot(scratch.up);

        need = Math.max(
          need,
          (lateral - depth * tanH) / (tanH * (1 - 2 * panX)),
          (-lateral - depth * tanH) / (tanH * (1 + 2 * panX)),
          (vertical - depth * tanV) / (tanV * (1 + 2 * panY)),
          (-vertical - depth * tanV) / (tanV * (1 - 2 * panY))
        );
      }
    }

    const distance = (Math.max(need, 0.25) * FRAME_MARGIN) / (wide ? zoom : zoomM);
    const visibleWidth = 2 * distance * tanH;
    const visibleHeight = 2 * distance * tanV;

    scratch.target.copy(scratch.look);
    scratch.position.copy(scratch.look).addScaledVector(scratch.dir, distance);
    scratch.target.addScaledVector(scratch.right, -panX * visibleWidth);
    scratch.position.addScaledVector(scratch.right, -panX * visibleWidth);
    scratch.target.addScaledVector(scratch.up, panY * visibleHeight);
    scratch.position.addScaledVector(scratch.up, panY * visibleHeight);

    // El primer fotograma se coloca de golpe: si no, la cámara vuela desde
    // su posición inicial y se ve un salto al cargar la página.
    if (firstFrame.current) {
      camera.position.copy(scratch.position);
      firstFrame.current = false;
    } else {
      camera.position.lerp(scratch.position, Math.min(1, delta * 2.4));
    }
    camera.lookAt(scratch.target);

    // --- Puntos de interes -------------------------------------------------
    // Solo aparecen en la fase de anatomía y nunca tapan la pantalla: están
    // anclados a la base y se leen con la leyenda compacta del DOM.
    const hotspotOpacity =
      smoothstep(clamp((progress - 0.58) / 0.1, 0, 1)) *
      (1 - smoothstep(clamp((progress - 0.9) / 0.07, 0, 1)));

    dotRefs.current.forEach((dot, index) => {
      if (!dot) return;
      const pulse = 1 + Math.sin(time * 3 + index * 1.7) * 0.18 * idle;
      dot.scale.setScalar(pulse);
      dot.material.opacity = hotspotOpacity;
    });
    haloRefs.current.forEach((halo, index) => {
      if (!halo) return;
      const pulse = 1 + Math.sin(time * 3 + index * 1.7) * 0.3 * idle;
      halo.scale.setScalar(pulse);
      halo.material.opacity = hotspotOpacity * 0.22;
    });
  });

  return (
    <>
      <ambientLight intensity={0.42} color="#93c5fd" />

      {/* La cámara mira desde -Z, así que la luz clave va en ese mismo lado:
          si la ponemos al otro lado, el portátil queda en contraluz. */}
      <directionalLight
        position={[-2.4, 3.4, -3.2]}
        intensity={1.9}
        color="#ffffff"
        castShadow={quality.shadows}
        shadow-mapSize-width={quality.shadowMapSize}
        shadow-mapSize-height={quality.shadowMapSize}
        shadow-camera-near={0.1}
        shadow-camera-far={12}
        shadow-camera-left={-2}
        shadow-camera-right={2}
        shadow-camera-top={2}
        shadow-camera-bottom={-2}
        shadow-bias={-0.0008}
      />

      <directionalLight position={[3, 1.4, 2.2]} intensity={0.55} color="#3b82f6" />
      <directionalLight position={[0, -1.2, -1]} intensity={0.22} color="#22d3ee" />

      {/* Entorno generado en local con Lightformers: sin descargar ningún HDR
          externo, así que la escena funciona igual sin conexión. */}
      <Environment resolution={quality.envResolution} frames={1}>
        <color attach="background" args={["#05070f"]} />
        <Lightformer
          form="rect"
          intensity={2.6}
          color="#bfdbfe"
          position={[0, 3.5, 3]}
          rotation={[0, Math.PI, 0]}
          scale={[7, 3, 1]}
        />
        <Lightformer
          form="rect"
          intensity={1.5}
          color="#3b82f6"
          position={[4, 1, -2]}
          rotation={[0, -Math.PI / 2, 0]}
          scale={[4, 3, 1]}
        />
        <Lightformer
          form="ring"
          intensity={2.4}
          color="#22d3ee"
          position={[-4, 1.5, -1]}
          scale={3}
        />
        <Lightformer
          form="rect"
          intensity={1}
          color="#f472b6"
          position={[0, -2, -2]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[5, 3, 1]}
        />
      </Environment>

      <group ref={rigRef}>
        <Laptop
          parts={parts}
          scrollRef={scrollRef}
          metrics={metrics}
          history={history}
          connected={connected}
          reducedMotion={quality.reducedMotion}
        />

        {/* Puntos sobre la base: marcan CPU, RAM, disco y red sin tapar nada */}
        {hotspots.map((spot, index) => (
          <group key={spot.id} position={spot.at}>
            <mesh
              ref={(node) => {
                dotRefs.current[index] = node;
              }}
            >
              <sphereGeometry args={[0.013, 12, 12]} />
              <meshBasicMaterial
                color={spot.color}
                transparent
                opacity={0}
                toneMapped={false}
                depthWrite={false}
              />
            </mesh>
            <mesh
              ref={(node) => {
                haloRefs.current[index] = node;
              }}
            >
              <sphereGeometry args={[0.032, 12, 12]} />
              <meshBasicMaterial
                color={spot.color}
                transparent
                opacity={0}
                toneMapped={false}
                depthWrite={false}
              />
            </mesh>
          </group>
        ))}
      </group>

      {quality.tier !== "low" && (
        <ContactShadows
          position={[0, -0.031, 0]}
          opacity={0.45}
          scale={3}
          blur={2.6}
          far={0.9}
          resolution={quality.contactShadowResolution}
          color="#020617"
        />
      )}

      <AdaptiveDpr pixelated />
    </>
  );
}
