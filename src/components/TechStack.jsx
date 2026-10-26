import { Server, Globe, Zap, Terminal, Wifi, Lock } from "lucide-react";

/**
 * Colores por tecnología como cadenas literales.
 *
 * Antes se interpolaban (`from-${tech.borderColor}-500/30`), y al no existir
 * esas clases en el CSS generado, los degradados y los bordes de color
 * desaparecían por completo.
 */
const TONES = {
  blue: {
    text: "text-blue-400",
    bg: "bg-blue-500/20",
    border: "border-blue-500/30",
    hoverBorder: "hover:border-blue-500/60",
  },
  cyan: {
    text: "text-cyan-400",
    bg: "bg-cyan-500/20",
    border: "border-cyan-500/30",
    hoverBorder: "hover:border-cyan-500/60",
  },
  orange: {
    text: "text-orange-400",
    bg: "bg-orange-500/20",
    border: "border-orange-500/30",
    hoverBorder: "hover:border-orange-500/60",
  },
  green: {
    text: "text-emerald-400",
    bg: "bg-emerald-500/20",
    border: "border-emerald-500/30",
    hoverBorder: "hover:border-emerald-500/60",
  },
  violet: {
    text: "text-violet-400",
    bg: "bg-violet-500/20",
    border: "border-violet-500/30",
    hoverBorder: "hover:border-violet-500/60",
  },
  red: {
    text: "text-red-400",
    bg: "bg-red-500/20",
    border: "border-red-500/30",
    hoverBorder: "hover:border-red-500/60",
  },
};

const technologies = [
  {
    name: "CasaOS",
    icon: Server,
    description:
      "Sistema operativo para gestión de servidor doméstico con interfaz web intuitiva",
    tone: TONES.blue,
  },
  {
    name: "Cloudflare",
    icon: Globe,
    description:
      "Túnel seguro para acceso público y protección contra amenazas",
    tone: TONES.orange,
  },
  {
    name: "Docker",
    icon: Zap,
    description:
      "Contenedores para desplegar y gestionar aplicaciones de forma aislada",
    tone: TONES.cyan,
  },
  {
    name: "SSH Access",
    icon: Terminal,
    description:
      "Acceso remoto seguro a la terminal desde cualquier ubicación",
    tone: TONES.green,
  },
  {
    name: "Networking",
    icon: Wifi,
    description: "Configuración de red para acceso remoto y gestión de puertos",
    tone: TONES.violet,
  },
  {
    name: "Seguridad",
    icon: Lock,
    description:
      "Protección de servicios con firewall y autenticación robusta",
    tone: TONES.red,
  },
];

export default function TechStack() {
  return (
    <section
      id="stack"
      className="container mx-auto scroll-mt-20 bg-slate-900/50 px-5 py-12 sm:px-6 sm:py-16"
    >
      <h2 className="mb-8 text-center text-2xl font-bold text-cyan-300 sm:mb-12 sm:text-4xl">
        Stack Tecnológico
      </h2>

      {/* Dos columnas ya en móvil: con seis tarjetas a una sola columna la
          página se hacía interminable en pantallas pequeñas. */}
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-3 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
        {technologies.map((tech) => {
          const Icon = tech.icon;
          return (
            <div
              key={tech.name}
              className={`rounded-xl border bg-gradient-to-br from-slate-800 to-slate-900 p-4 transition-all hover:scale-[1.02] sm:p-8 ${tech.tone.border} ${tech.tone.hoverBorder}`}
            >
              <div className="mb-3 flex flex-col items-start gap-2 sm:mb-4 sm:flex-row sm:items-center sm:gap-4">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg sm:h-16 sm:w-16 ${tech.tone.bg}`}
                >
                  <Icon className={`h-4 w-4 sm:h-8 sm:w-8 ${tech.tone.text}`} />
                </div>
                <h3 className="text-sm font-bold leading-tight sm:text-2xl">
                  {tech.name}
                </h3>
              </div>
              <p className="text-[11px] leading-relaxed text-gray-400 sm:text-base">
                {tech.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
