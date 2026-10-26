import { Cpu, Boxes, Recycle, FlaskConical } from "lucide-react";

const purposes = [
  {
    icon: Cpu,
    title: "Aprendizaje Continuo",
    description:
      "Experimentación práctica con tecnologías de servidor, contenedores, networking y DevOps en un entorno real.",
  },
  {
    icon: Boxes,
    title: "Portfolio Técnico",
    description:
      "Demostración de habilidades en deployment, administración de sistemas y solución de problemas reales.",
  },
  {
    icon: Recycle,
    title: "Reutilización",
    description:
      "Dar nueva vida a hardware antiguo, convirtiendo un portátil en desuso en infraestructura útil y funcional.",
  },
  {
    icon: FlaskConical,
    title: "Experimentación",
    description:
      "Ambiente seguro para probar nuevas tecnologías, frameworks y configuraciones sin riesgo.",
  },
];

export default function ProjectPurpose() {
  return (
    <section
      id="proyecto"
      className="container mx-auto scroll-mt-20 px-5 py-12 sm:px-6 sm:py-16"
    >
      <h2 className="mb-8 text-center text-2xl font-bold text-blue-300 sm:mb-12 sm:text-4xl">
        ¿Por Qué Este Proyecto?
      </h2>

      <div className="mx-auto grid max-w-4xl grid-cols-2 gap-3 sm:gap-6 md:grid-cols-2 sm:gap-8">
        {purposes.map((purpose) => {
          const Icon = purpose.icon;
          return (
            <div
              key={purpose.title}
              className="rounded-xl border border-blue-400/20 bg-slate-800/30 p-4 backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-blue-400/40 sm:p-8"
            >
              <Icon className="mb-2 h-6 w-6 text-cyan-300 sm:mb-4 sm:h-9 sm:w-9" />
              <h3 className="mb-1 text-sm font-semibold leading-snug sm:mb-2 sm:text-2xl">
                {purpose.title}
              </h3>
              <p className="text-[11px] leading-relaxed text-gray-300 sm:text-base">
                {purpose.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
