import { Server, Cpu, Boxes } from "lucide-react";

export default function Hero() {
  const highlights = [
    { icon: Server, label: "Servidor doméstico" },
    { icon: Cpu, label: "4 GB DDR4" },
    { icon: Boxes, label: "Docker" },
  ];

  return (
    <header
      id="top"
      className="container mx-auto scroll-mt-20 px-5 pb-12 pt-24 sm:px-6 sm:pb-16 sm:pt-28"
    >
      <div className="animate-fade-in mb-8 text-center sm:mb-10">
        <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-300 sm:mb-6 sm:px-4 sm:py-1.5 sm:text-xs sm:tracking-[0.25em]">
          Portfolio de infraestructura
        </span>
        <h1 className="mb-4 text-4xl font-bold text-gradient sm:text-5xl md:text-7xl">
          De Portátil a Servidor
        </h1>
        <p className="mb-2 text-lg text-gray-300 sm:text-xl md:text-2xl">
          Transformando hardware antiguo en infraestructura moderna
        </p>
        <p className="text-base text-blue-300 sm:text-lg">
          Un proyecto de aprendizaje y experimentación
        </p>
      </div>

      <div className="mx-auto flex max-w-2xl flex-wrap items-center justify-center gap-2 sm:gap-3">
        {highlights.map((item) => {
          const Icon = item.icon;
          return (
            <span
              key={item.label}
              className="inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-slate-800/60 px-3 py-1.5 text-xs text-slate-300 backdrop-blur-sm sm:px-4 sm:py-2 sm:text-sm"
            >
              <Icon className="h-3.5 w-3.5 text-cyan-400 sm:h-4 sm:w-4" />
              {item.label}
            </span>
          );
        })}
      </div>
    </header>
  );
}
