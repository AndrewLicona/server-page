import { Cpu, HardDrive, Server, MemoryStick, Laptop, Terminal, Database, Shield } from 'lucide-react';

export default function Specifications() {
  const specs = [
    {
      icon: Cpu,  
      title: 'Procesador',
      description: 'CPU básico pero funcional para servicios ligeros',
      color: 'blue'
    },
    {
      icon: HardDrive,
      title: 'Almacenamiento',
      description: 'HDD para almacenamiento de proyectos',
      color: 'cyan'
    }, 
    {
      icon: MemoryStick,
      title: 'RAM',
      description: '4GB DDR4 - Suficiente para tareas básicas',
      color: 'blue'
    },
    {
      icon: Laptop,
      title: 'Modelo',
      description: 'Acer Aspire A314-31 - Portátil azul',
      color: 'blue'
    },
    {
      icon: Terminal,
      title: 'Sistema Operativo',
      description: 'Ubuntu Server 24.04 LTS - Estable y seguro',
      color: 'cyan'
    },
    {
      icon: Shield,
      title: 'Seguridad',
      description: 'Firewall y actualizaciones de seguridad activas',
      color: 'blue'
    },
  ];

  return (
    <section className="container mx-auto px-6 py-16">
      <h2 className="text-4xl font-bold text-center mb-12 text-blue-300 animate-slide-down">
        Especificaciones del Hardware
      </h2>
      
      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {specs.map((spec, index) => {
          const Icon = spec.icon;
          return (
            <div 
              key={index}
              className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-blue-500/20 hover:border-blue-500/50 transition-all animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <Icon className={`w-12 h-12 text-${spec.color}-400 mb-4`} />
              <h3 className="text-xl font-semibold mb-2">{spec.title}</h3>
              <p className="text-gray-400">{spec.description}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
