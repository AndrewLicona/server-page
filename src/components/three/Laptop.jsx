import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { createScreenTexture, drawScreen } from "./ScreenTexture";
import { sampleKeyframes } from "./choreography";

export default function Laptop({
  parts,
  scrollRef,
  metrics,
  history,
  connected,
  reducedMotion = false,
}) {
  const { base, lid, screenPanel, hinge, center, baseBounds } = parts;
  const lidRef = useRef();
  const screen = useMemo(() => createScreenTexture(), []);
  const screenOn = useRef(0);
  const lastPhase = useRef(null);
  const lidAngle = useRef(0);

  // --- La textura viva va en el panel que hemos creado a medida ------------
  useEffect(() => {
    if (!screenPanel) return;
    const material = screenPanel.material;
    material.map = screen.texture;
    material.opacity = 0;
    material.needsUpdate = true;

    return () => {
      material.map = null;
      material.needsUpdate = true;
    };
  }, [screenPanel, screen]);

  // --- Redibujamos la pantalla cuando llegan datos nuevos -------------------
  useEffect(() => {
    drawScreen(screen.ctx, { metrics, history, phase: "live" });
    screen.texture.needsUpdate = true;
    lastPhase.current = "live";
  }, [screen, metrics, history]);

  // --- LED de estado ------------------------------------------------------
  // El grupo del portátil ya está desplazado al centro del modelo, así que
  // el ancla se calcula también en ese marco y no en coordenadas de mundo.
  const ledAnchor = useMemo(() => {
    if (!baseBounds) return new THREE.Vector3(-0.36, 0.04, -0.2);
    const depth = baseBounds.max.z - baseBounds.min.z;
    return new THREE.Vector3(
      baseBounds.min.x - center.x + 0.07,
      baseBounds.max.y - center.y + 0.004,
      baseBounds.min.z - center.z + depth * 0.14
    );
  }, [baseBounds, center]);

  const ledRef = useRef();
  const ledLightRef = useRef();
  const load = metrics?.cpu ?? 0;

  useFrame((state, delta) => {
    const progress = scrollRef?.current ?? 0;

    // --- Tapa: se cierra un poco a lo largo del recorrido ------------------
    // El ángulo sale de la coreografía (misma curva que la cámara) y se suaviza
    // para que el movimiento sea continuo, sin tirones al cambiar de fotograma.
    const target = sampleKeyframes(progress).lid;
    lidAngle.current = THREE.MathUtils.damp(lidAngle.current, target, 5, delta);

    // Un soplo mínimo, proporcional a la carga de CPU: la máquina "respira".
    const breathe = reducedMotion
      ? 0
      : Math.sin(state.clock.elapsedTime * 0.9) * 0.012 * (load / 100);

    if (lidRef.current) {
      lidRef.current.rotation.x = lidAngle.current + breathe;
    }

    // --- La pantalla se enciende al empezar el recorrido -------------------
    const targetOn = progress > 0.1 ? 1 : 0;
    screenOn.current += (targetOn - screenOn.current) * Math.min(1, delta * 6);

    if (screenPanel) {
      screenPanel.material.opacity = screenOn.current;
    }

    // La fase de arranque se decide aquí, no en el render: el progreso del
    // scroll cambia sin provocar re-renderizados, así que si lo leyéramos en
    // el render la pantalla se quedaría congelada en "boot".
    const currentPhase = progress < 0.3 ? "boot" : "live";
    if (currentPhase !== lastPhase.current) {
      lastPhase.current = currentPhase;
      drawScreen(screen.ctx, { metrics, history, phase: currentPhase });
      screen.texture.needsUpdate = true;
    }

    // --- LED: verde si el servidor responde, ámbar si está aislado --------
    const pulse = 0.55 + Math.sin(state.clock.elapsedTime * 3) * 0.45;
    const ledColor = connected
      ? new THREE.Color(0x34d399)
      : new THREE.Color(0xfbbf24);
    if (ledRef.current) {
      ledRef.current.material.color.copy(ledColor);
      ledRef.current.material.emissive.copy(ledColor);
      ledRef.current.material.emissiveIntensity = 1.4 + pulse * 1.6;
    }
    if (ledLightRef.current) {
      ledLightRef.current.color.copy(ledColor);
      ledLightRef.current.intensity = connected ? 0.35 + pulse * 0.25 : 0.2;
    }
  });

  const offset = useMemo(
    () => new THREE.Vector3(-center.x, -center.y, -center.z),
    [center]
  );

  return (
    <group position={offset}>
      {/* Base: chassis, teclado, puertos */}
      {base.map((mesh) => (
        <primitive key={mesh.name} object={mesh} />
      ))}

      {/* Tapa: se rota alrededor de la bisagra */}
      <group position={hinge}>
        <group ref={lidRef}>
          {lid.map((mesh) => (
            <primitive
              key={mesh.name}
              object={mesh}
              position={[-hinge.x, -hinge.y, -hinge.z]}
            />
          ))}
        </group>
      </group>

      {/* LED de estado + su halo */}
      <mesh ref={ledRef} position={ledAnchor}>
        <sphereGeometry args={[0.014, 16, 16]} />
        <meshStandardMaterial
          color="#34d399"
          emissive="#34d399"
          emissiveIntensity={2}
          toneMapped={false}
        />
      </mesh>
      <pointLight
        ref={ledLightRef}
        position={[ledAnchor.x - 0.04, ledAnchor.y + 0.05, ledAnchor.z]}
        distance={0.6}
        decay={2}
        intensity={0.4}
      />

      {/* Luz que irradia la pantalla, teñida por la carga de CPU */}
      <pointLight
        position={[0, 0.13, 0.16]}
        distance={1.1}
        decay={2}
        intensity={0.4}
        color={load > 80 ? "#fbbf24" : "#60a5fa"}
      />
    </group>
  );
}
