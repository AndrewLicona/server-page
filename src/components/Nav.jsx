import { useEffect, useState } from "react";
import {
  Activity,
  Cpu,
  Github,
  Layers,
  Lightbulb,
  Menu,
  Target,
  X,
} from "lucide-react";
import { useServerStore } from "../store/serverStore";

const LINKS = [
  { href: "#metricas", label: "Métricas", icon: Activity },
  { href: "#especificaciones", label: "Hardware", icon: Cpu },
  { href: "#stack", label: "Stack", icon: Layers },
  { href: "#proyecto", label: "Proyecto", icon: Lightbulb },
  { href: "#casos", label: "Casos", icon: Target },
];

const REPO_URL = "https://github.com/AndrewLicona/server-page";

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("");
  const { connected } = useServerStore();

  // --- Fondo más sólido en cuanto se desplaza la página --------------------
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // --- Sección visible: el enlace activo se resalta ------------------------
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(`#${visible.target.id}`);
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: [0, 0.2, 0.5] }
    );

    LINKS.forEach((link) => {
      const element = document.querySelector(link.href);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  // --- Cerrar el menú con Escape -------------------------------------------
  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const linkClass = (href, base) =>
    `transition-colors duration-200 ${
      active === href
        ? "text-cyan-300"
        : "text-slate-400 hover:text-slate-100"
    } ${base}`;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled || open
          ? "border-b border-white/10 bg-slate-950/85 shadow-[0_10px_30px_-12px_rgba(0,0,0,0.8)] backdrop-blur-xl"
          : "border-b border-transparent bg-slate-950/40 backdrop-blur-md"
      }`}
    >
      <nav className="container mx-auto flex items-center justify-between gap-4 px-5 py-3 sm:px-6">
        <a
          href="#top"
          className="group flex shrink-0 items-center gap-2.5 font-semibold"
          aria-label="server-page, ir al inicio"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-60" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-[0_0_12px_2px] shadow-cyan-500/60" />
          </span>
          <span className="text-sm tracking-wide text-slate-100 transition-colors group-hover:text-cyan-200">
            server-page
          </span>
          <span className="hidden text-[10px] uppercase tracking-[0.2em] text-slate-500 sm:inline">
            home server
          </span>
        </a>

        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={linkClass(
                link.href,
                "rounded-full px-3.5 py-2 text-sm hover:bg-white/5"
              )}
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`hidden items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-[11px] font-medium sm:inline-flex ${
              connected
                ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-300"
                : "border-amber-400/25 bg-amber-400/10 text-amber-300"
            }`}
            title={connected ? "El backend responde" : "Sin conexión con el backend"}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                connected ? "bg-emerald-400" : "bg-amber-400"
              }`}
            />
            {connected ? "En línea" : "Sin conexión"}
          </span>

          <a
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="Código fuente en GitHub"
            className="hidden rounded-full border border-white/10 p-2 text-slate-400 transition-colors hover:border-cyan-400/40 hover:text-cyan-300 sm:block"
          >
            <Github className="h-4 w-4" />
          </a>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="rounded-lg border border-white/10 p-2 text-slate-300 transition-colors hover:border-cyan-400/40 hover:text-cyan-300 md:hidden"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {open && (
        <div className="border-t border-white/10 bg-slate-950/95 backdrop-blur-xl md:hidden">
          <div className="container mx-auto flex flex-col px-5 py-3 sm:px-6">
            {LINKS.map((link) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 border-b border-white/5 py-3 text-sm last:border-b-0 ${linkClass(
                    link.href,
                    ""
                  )}`}
                >
                  <Icon className="h-4 w-4 shrink-0 text-cyan-400/70" />
                  {link.label}
                </a>
              );
            })}

            <div className="flex items-center justify-between gap-3 py-3">
              <span
                className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-[11px] font-medium ${
                  connected
                    ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-300"
                    : "border-amber-400/25 bg-amber-400/10 text-amber-300"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    connected ? "bg-emerald-400" : "bg-amber-400"
                  }`}
                />
                {connected ? "En línea" : "Sin conexión"}
              </span>

              <a
                href={REPO_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1.5 text-[11px] text-slate-400 transition-colors hover:border-cyan-400/40 hover:text-cyan-300"
              >
                <Github className="h-3.5 w-3.5" />
                Código fuente
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
