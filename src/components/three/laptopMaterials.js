import { useMemo } from "react";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";
import brushedNormal from "../../assets/textures/brushed-normal.png";
import brushedRoughness from "../../assets/textures/brushed-roughness.png";

/**
 * Paleta y materiales del Acer Aspire 3 A315-42 real.
 *
 * Los colores no están inventados: se muestrearon directamente de las fotos
 * de referencia del equipo (tapa #2f6ea8, deck #3062a9, teclado #141526).
 */
export const PALETTE = {
  lid: "#2f6ea8",
  deck: "#3062a9",
  touchpad: "#3a76b4",
  keyboard: "#141526",
  bezel: "#1b1b21",
  screen: "#05070d",
  ports: "#2a2a30",
  holes: "#0c0c10",
  ethernet: "#55555c",
};

/** Carga y configura los mapas de metal cepillado. */
export function useAcerTextures() {
  const [normal, roughness] = useTexture([brushedNormal, brushedRoughness]);

  normal.wrapS = normal.wrapT = THREE.RepeatWrapping;
  normal.repeat.set(3, 3);
  normal.anisotropy = 8;

  roughness.wrapS = roughness.wrapT = THREE.RepeatWrapping;
  roughness.repeat.set(3, 3);

  // `useTexture` devuelve un array nuevo en cada render, y eso invalidaba el
  // memo de las piezas del modelo (se reconstruia la escena entera en cada
  // fotograma). Lo congelamos aqui.
  return useMemo(
    () => ({ normal, roughness }),
    [normal, roughness]
  );
}

/**
 * Aplica el material correspondiente a cada pieza del GLB.
 *
 * El archivo original trae ocho materiales con nombres genéricos en escala de
 * grises. `case` lo comparten la tapa y el chassis, así que el bucket decide
 * cuál de los dos blueprints aplicamos.
 */
export function styleLaptopMesh(mesh, bucket, textures) {
  const material = mesh.material;
  const name = material.name;

  material.envMapIntensity = 1.25;
  material.color = new THREE.Color(PALETTE.deck);
  material.metalness = 0.3;
  material.roughness = 0.45;

  switch (name) {
    case "case": {
      const isLid = bucket === "lid";
      material.color.set(isLid ? PALETTE.lid : PALETTE.deck);
      material.metalness = isLid ? 0.62 : 0.42;
      material.roughness = isLid ? 0.34 : 0.4;
      material.normalMap = textures.normal;
      material.roughnessMap = textures.roughness;
      material.normalScale.set(isLid ? 0.32 : 0.2, isLid ? 0.32 : 0.2);
      break;
    }
    case "touchpad":
      material.color.set(PALETTE.touchpad);
      material.metalness = 0.3;
      material.roughness = 0.38;
      material.normalMap = textures.normal;
      material.roughnessMap = textures.roughness;
      material.normalScale.set(0.12, 0.12);
      break;
    case "keyboard":
      material.color.set(PALETTE.keyboard);
      material.metalness = 0.15;
      material.roughness = 0.68;
      break;
    case "bezel":
      material.color.set(PALETTE.bezel);
      material.metalness = 0.2;
      material.roughness = 0.52;
      break;
    case "ports":
      material.color.set(PALETTE.ports);
      material.metalness = 0.5;
      material.roughness = 0.45;
      break;
    case "holes":
      material.color.set(PALETTE.holes);
      material.metalness = 0.1;
      material.roughness = 0.8;
      break;
    case "ethernet_port":
      material.color.set(PALETTE.ethernet);
      material.metalness = 0.85;
      material.roughness = 0.3;
      break;
    case "display":
      // La pantalla la gestiona Laptop.jsx con la textura viva.
      material.color.set(PALETTE.screen);
      material.metalness = 0.0;
      material.roughness = 0.22;
      break;
    default:
      break;
  }

  material.needsUpdate = true;
}
