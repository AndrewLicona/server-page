import {
  Cpu,
  HardDrive,
  Laptop,
  MemoryStick,
  Terminal,
  Shield,
} from "lucide-react";

/**
 * Tonos de color como cadenas literales.
 *
 * Antes se interpolaban (`text-${spec.color}-400`). El escáner de Tailwind
 * analiza el texto fuente, no el resultado de la interpolación, así que esas
 * clases nunca se generaban y los iconos salían sin color. Con el mapa
 * explícito, Tailwind ve las cadenas literales y sí las emite.
 */
const TONES = {
  blue: "text-blue-400",
  cyan: "text-cyan-400",
};

const specs = [
  {
    icon: Cpu,
    title: "Procesador",
    description: "CPU básico pero funcional para servicios ligeros",
    tone: TONES.blue,
  },
  {
    icon: HardDrive,
    title: "Almacenamiento",
    description: "SSD de 512 GB para datos y proyectos",
    tone: TONES.cyan,
  },
  {
    icon: MemoryStick,
    title: "RAM",
    description: "4 GB DDR4 - Suficiente para tareas básicas",
    tone: TONES.blue,
  },
  {
    icon: Laptop,
    title: "Modelo",
    description: "Acer Aspire 3 A315-42 - Portátil azul",
    tone: TONES.blue,
  },
  {
    icon: Terminal,
    title: "Sistema Operativo",
    description: "Ubuntu Server 24.04 LTS - Estable y seguro",
    tone: TONES.cyan,
  },
  {
    icon: Shield,
    title: "Seguridad",
    description: "Firewall y actualizaciones de seguridad activas",
    tone: TONES.blue,
  },
];

export default function Specifications() {
  return (
    <section
      id="especificaciones"
      className="container mx-auto scroll-mt-20 px-5 py-12 sm:px-6 sm:py-16"
    >
      <h2 className="mb-8 animate-slide-down text-center text-2xl font-bold text-blue-300 sm:mb-12 sm:text-4xl">
        Especificaciones del Hardware
      </h2>

      {/* Dos columnas ya en móvil: seis tarjetas a una sola columna dejaban
          una-scroll interminable en pantallas pequeñas. */}
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 md:gap-6">
        {specs.map((spec, index) => {
          const Icon = spec.icon;
          return (
            <div
              key={spec.title}
              className="animate-slide-up rounded-xl border border-blue-500/20 bg-slate-800/50 p-4 backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-blue-500/50 sm:p-6"
              style={{ animationDelay: `${index * 0.06}s` }}
            >
              <Icon className={`mb-2 h-6 w-6 sm:mb-4 sm:h-10 sm:w-10 ${spec.tone}`} />
              <h3 className="mb-1 text-sm font-semibold leading-snug sm:mb-2 sm:text-xl">
                {spec.title}
              </h3>
              <p className="text-[11px] leading-relaxed text-gray-400 sm:text-base">
                {spec.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
