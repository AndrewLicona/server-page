import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import Scene from "./Scene";

function Loader() {
  return (
    <Html center>
      <div className="flex w-48 flex-col items-center gap-3">
        <div className="h-1 w-full overflow-hidden rounded-full bg-slate-700/50">
          <div className="h-full w-1/3 animate-[loading_1.1s_ease-in-out_infinite] rounded-full bg-cyan-400" />
        </div>
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
          Cargando modelo 3D
        </p>
      </div>
      <style>{`@keyframes loading{0%{transform:translateX(-110%)}100%{transform:translateX(360%)}}`}</style>
    </Html>
  );
}

export default function LaptopCanvas({
  scrollRef,
  quality,
  metrics,
  history,
  connected,
  frameloop = "always",
}) {
  return (
    <Canvas
      dpr={quality.dpr}
      shadows={quality.shadows}
      frameloop={frameloop}
      camera={{ position: [0, 0.72, -3.3], fov: 38, near: 0.1, far: 60 }}
      gl={{
        antialias: quality.antialias,
        alpha: true,
        powerPreference: "high-performance",
      }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping;
        gl.toneMappingExposure = 1.15;
      }}
      style={{ touchAction: "pan-y" }}
    >
      <Suspense fallback={<Loader />}>
        <Scene
          scrollRef={scrollRef}
          quality={quality}
          metrics={metrics}
          history={history}
          connected={connected}
        />
      </Suspense>
    </Canvas>
  );
}
