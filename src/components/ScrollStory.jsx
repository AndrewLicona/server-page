import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useServerStore } from "../store/serverStore";

/**
 * three.js pesa lo suyo, así que el lienzo se carga en diferido: la página
 * pinta de inmediato y la escena 3D entra cuando el bundle está listo.
 */
const LaptopCanvas = lazy(() => import("./three/LaptopCanvas"));

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
const smoothstep = (t) => t * t * (3 - 2 * t);

/** Opacidad de un bloque de texto dentro de una franja del recorrido. */
function rangeOpacity(progress, from, to) {
  const fade = 0.05;
  const enter = smoothstep(clamp((progress - from) / fade, 0, 1));
  const leave = 1 - smoothstep(clamp((progress - (to - fade)) / fade, 0, 1));
  return Math.min(enter, leave);
}

/** Leyenda compacta de los puntos marcados sobre la base del portátil. */
const LEGEND = [
  { id: "cpu", label: "CPU", color: "#22d3ee" },
  { id: "ram", label: "RAM", color: "#60a5fa" },
  { id: "disk", label: "Disco", color: "#fbbf24" },
  { id: "net", label: "Red", color: "#34d399" },
];

export default function ScrollStory({ quality }) {
  const sectionRef = useRef(null);
  const progressRef = useRef(0);
  const overlayRefs = useRef([]);
  const legendRef = useRef(null);
  const hintRef = useRef(null);
  const [visible, setVisible] = useState(true);
  const [landscape, setLandscape] = useState(false);

  const { metrics, history, connected } = useServerStore();
  const reduced = quality.reducedMotion;

  // --- ¿Horizontal o vertical? ---------------------------------------------
  // La composición depende de la forma de la pantalla, no solo de su ancho:
  // en horizontal el texto va en la columna izquierda y el modelo a la
  // derecha; en vertical el texto arriba y el modelo debajo.
  useEffect(() => {
    const update = () => setLandscape(window.innerWidth / window.innerHeight > 1.25);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const overlays = useMemo(() => {
    if (reduced) {
      return [
        {
          id: "hero",
          from: -1,
          to: 2,
          align: "center",
          eyebrow: null,
          title: "De Portátil a Servidor",
          body: "Transformando hardware antiguo en infraestructura moderna.",
        },
      ];
    }
    return [
      {
        id: "hero",
        from: -1,
        to: 0.14,
        align: "center",
        eyebrow: null,
        title: "De Portátil a Servidor",
        body: "Transformando hardware antiguo en infraestructura moderna. Desliza para encenderlo.",
      },
      {
        id: "boot",
        from: 0.13,
        to: 0.34,
        align: "left",
        eyebrow: "Arranque",
        title: "Encendiendo el sistema",
        body: "Ubuntu Server 24.04 LTS, Docker y un túnel seguro de Cloudflare. Todo arranca con un solo comando.",
      },
      {
        id: "live",
        from: 0.33,
        to: 0.61,
        align: "right",
        eyebrow: "Estado en vivo",
        title: "Servicios funcionando ahora mismo",
        body: "CPU, memoria, disco y los servicios publicados: datos reales del servidor, actualizados cada 3 segundos.",
      },
      {
        id: "anatomy",
        from: 0.6,
        to: 0.89,
        align: "left",
        eyebrow: "Anatomía",
        title: "Cada pieza cumple un papel",
        body: "Un Celeron N4000 con 4 GB de RAM que hoy expone varios servicios públicos sin despeinarse.",
      },
      {
        id: "outro",
        from: 0.88,
        to: 1.2,
        align: "center",
        eyebrow: null,
        title: "Todo desde un portátil",
        body: "Proyecto de aprendizaje, portfolio y reutilización de hardware en desuso.",
      },
    ];
  }, [reduced]);

  // --- Scroll: actualiza el progreso y los textos sin re-renderizar ---------
  useEffect(() => {
    if (reduced) {
      progressRef.current = 0.02;
      return undefined;
    }

    let frame = 0;
    const update = () => {
      frame = 0;
      const element = sectionRef.current;
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const travel = element.offsetHeight - window.innerHeight;
      const progress = travel > 0 ? clamp(-rect.top / travel, 0, 1) : 0;
      progressRef.current = progress;

      overlayRefs.current.forEach((node, index) => {
        if (!node) return;
        const spec = overlays[index];
        const opacity = rangeOpacity(progress, spec.from, spec.to);
        node.style.opacity = String(opacity);
        node.style.transform = `translate3d(0, ${(1 - opacity) * 28}px, 0)`;
      });

      // La leyenda acompaña a los puntos marcados sobre la base.
      if (legendRef.current) {
        legendRef.current.style.opacity = String(
          rangeOpacity(progress, 0.6, 0.9)
        );
      }

      // El aviso de scroll solo tiene sentido al principio del recorrido.
      if (hintRef.current) {
        hintRef.current.style.opacity = String(
          1 - smoothstep(clamp((progress - 0.03) / 0.06, 0, 1))
        );
      }
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [overlays, reduced]);

  // --- Apagar el render cuando la escena no está en pantalla ---------------
  useEffect(() => {
    const element = sectionRef.current;
    if (!element || typeof IntersectionObserver === "undefined") return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const storyHeight = reduced ? "h-[100svh]" : quality.storyLength;

  const legendValues = {
    cpu: `${Math.round(metrics?.cpu ?? 0)}%`,
    ram: `${Math.round(metrics?.memory ?? 0)}%`,
    disk: `${Math.round(metrics?.disk ?? 0)}%`,
    net: connected ? "ok" : "sin conexión",
  };

  return (
    <section
      ref={sectionRef}
      className={`relative w-full ${storyHeight}`}
      aria-label="Presentación 3D del servidor"
    >
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
        {/* Haló de fondo detrás del modelo */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-[70vmin] w-[70vmin] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/10 blur-[90px]"
          aria-hidden="true"
        />

        <div className="absolute inset-0" aria-hidden="true">
          <Suspense
            fallback={
              <div className="absolute inset-0 grid place-items-center">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-cyan-400/25 border-t-cyan-400" />
              </div>
            }
          >
            <LaptopCanvas
              scrollRef={progressRef}
              quality={quality}
              metrics={metrics}
              history={history}
              connected={connected}
              frameloop={visible ? "always" : "never"}
            />
          </Suspense>
        </div>

        {/* Textos superpuestos.
            En vertical se apilan arriba; en horizontal ocupan la columna
            izquierda y el modelo se desplaza a la derecha, de modo que texto y
            modelo nunca se pisan. */}
        <div className="pointer-events-none relative z-10 h-full">
          <div className="relative mx-auto flex h-full max-w-6xl flex-col justify-center px-5 sm:px-6">
            {overlays.map((overlay, index) => {
              const alignment =
                overlay.align === "left"
                  ? "items-start text-left"
                  : overlay.align === "right"
                    ? "items-end text-right"
                    : "items-center text-center";

              return (
                <div
                  key={overlay.id}
                  ref={(node) => {
                    overlayRefs.current[index] = node;
                  }}
                  className={`absolute flex flex-col gap-3 sm:gap-4 ${
                    landscape
                      ? "inset-y-0 left-0 w-[400px] justify-center px-8 pt-0 items-start text-left lg:w-[440px]"
                      : `inset-x-0 top-0 px-5 pt-[11vh] sm:px-6 sm:pt-[12vh] ${alignment}`
                  }`}
                  style={{ opacity: 0 }}
                >
                  {overlay.eyebrow && (
                    <span className="w-fit rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-300 sm:px-4 sm:py-1.5 sm:text-xs sm:tracking-[0.25em]">
                      {overlay.eyebrow}
                    </span>
                  )}
                  <h1 className="max-w-full text-[26px] font-bold leading-tight text-gradient sm:text-4xl md:text-5xl lg:text-6xl">
                    {overlay.title}
                  </h1>
                  <p className="max-w-full text-sm text-slate-300 sm:text-base md:text-[15px] lg:max-w-xl lg:text-base">
                    {overlay.body}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Leyenda de los puntos marcados sobre la base del portátil */}
        {!reduced && (
          <div
            ref={legendRef}
            className="pointer-events-none absolute inset-x-0 bottom-5 z-10 flex justify-center px-4"
            style={{ opacity: 0 }}
          >
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 rounded-full border border-white/10 bg-slate-950/85 px-4 py-2 backdrop-blur-md">
              {LEGEND.map((item) => (
                <span
                  key={item.id}
                  className="flex items-center gap-1.5 whitespace-nowrap"
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-slate-400">
                    {item.label}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-100">
                    {legendValues[item.id]}
                  </span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Indicador de scroll */}
        {!reduced && (
          <div
            ref={hintRef}
            className="pointer-events-none absolute inset-x-0 bottom-8 flex justify-center"
            aria-hidden="true"
          >
            <div className="flex flex-col items-center gap-2 text-slate-500">
              <span className="text-[11px] uppercase tracking-[0.3em]">Scroll</span>
              <span className="h-8 w-px animate-pulse bg-gradient-to-b from-cyan-400 to-transparent" />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
