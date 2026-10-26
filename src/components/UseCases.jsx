import { Globe, Smartphone, FlaskConical } from "lucide-react";

const TONES = {
  blue: {
    from: "from-blue-900/40",
    border: "border-l-blue-400",
  },
  cyan: {
    from: "from-cyan-900/40",
    border: "border-l-cyan-400",
  },
  violet: {
    from: "from-violet-900/40",
    border: "border-l-violet-400",
  },
};

const cases = [
  {
    icon: Globe,
    title: "Hosting de Proyectos Personales",
    description:
      "Despliegue de aplicaciones web, APIs y servicios para testing y demostración",
    tone: TONES.blue,
  },
  {
    icon: Smartphone,
    title: "Acceso Remoto Universal",
    description:
      "Gestión completa del servidor desde cualquier dispositivo y ubicación",
    tone: TONES.cyan,
  },
  {
    icon: FlaskConical,
    title: "Laboratorio de Pruebas",
    description:
      "Ambiente aislado para experimentar con nuevas tecnologías antes de producción",
    tone: TONES.violet,
  },
];

export default function UseCases() {
  return (
    <section
      id="casos"
      className="container mx-auto scroll-mt-20 bg-slate-900/50 px-5 py-12 sm:px-6 sm:py-16"
    >
      <h2 className="mb-8 text-center text-3xl font-bold text-cyan-300 sm:mb-12 sm:text-4xl">
        Casos de Uso
      </h2>

      <div className="mx-auto max-w-3xl space-y-4 sm:space-y-6">
        {cases.map((useCase) => {
          const Icon = useCase.icon;
          return (
            <div
              key={useCase.title}
              className={`rounded-lg border-l-4 bg-gradient-to-r p-4 transition-transform hover:translate-x-1 sm:p-6 sm:hover:translate-x-2 ${useCase.tone.from} ${useCase.tone.border}`}
            >
              <div className="mb-2 flex items-center gap-3">
                <Icon className="h-4 w-4 shrink-0 text-slate-300 sm:h-5 sm:w-5" />
                <h3 className="text-base font-semibold sm:text-xl">
                  {useCase.title}
                </h3>
              </div>
              <p className="text-sm text-gray-300 sm:text-base">
                {useCase.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
