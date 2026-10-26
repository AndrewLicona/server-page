import { useEffect, useState } from "react";

/**
 * Perfil de dispositivo -> nivel de calidad de la escena 3D.
 *
 * El sitio se va a ver en un portátil, en una tablet y en un móvil. El motor 3D
 * tiene que sacrificar lo primero (resolución de sombras, densidad de píxeles,
 * muestreo) porque el coste se paga en la GPU del visitante, no en el servidor.
 */
const TIERS = {
  low: {
    tier: "low",
    dpr: [1, 1.5],
    shadows: false,
    shadowMapSize: 512,
    contactShadowResolution: 128,
    envResolution: 128,
    antialias: false,
    storyLength: "h-[280vh]",
    hotspotLabels: false,
  },
  mid: {
    tier: "mid",
    dpr: [1, 1.75],
    shadows: true,
    shadowMapSize: 1024,
    contactShadowResolution: 256,
    envResolution: 192,
    antialias: true,
    storyLength: "h-[320vh]",
    hotspotLabels: true,
  },
  high: {
    tier: "high",
    dpr: [1, 2],
    shadows: true,
    shadowMapSize: 2048,
    contactShadowResolution: 512,
    envResolution: 256,
    antialias: true,
    storyLength: "h-[360vh]",
    hotspotLabels: true,
  },
};

function detect() {
  if (typeof window === "undefined") return TIERS.mid;

  const width = window.innerWidth;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const cores = navigator.hardwareConcurrency ?? 4;

  let tier = "high";
  if (width < 640) tier = "low";
  else if (width < 1024) tier = "mid";
  else if (coarse && width < 1280) tier = "mid";

  // Móvil de gama baja con muchos núcleos declarados pero poca GPU:
  // en la práctica el cuello de botella es el relleno de píxeles.
  if (tier === "mid" && cores <= 4 && coarse) tier = "low";

  return { ...TIERS[tier], reducedMotion, coarse, width };
}

export function useDeviceProfile() {
  const [profile, setProfile] = useState(detect);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setProfile(detect());
    };
    const onResize = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    window.addEventListener("resize", onResize);
    window.addEventListener("orientationchange", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("orientationchange", onResize);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return profile;
}
