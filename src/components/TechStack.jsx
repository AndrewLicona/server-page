import React from 'react';
import { Server, Globe, Zap, Terminal, Wifi, Lock } from 'lucide-react';

export default function TechStack() {
  const technologies = [
    {
      name: 'CasaOS',
      icon: Server,
      description: 'Sistema operativo para gestión de servidor doméstico con interfaz web intuitiva',
      color: 'blue',
      borderColor: 'cyan'
    },
    {
      name: 'Cloudflare',
      icon: Globe,
      description: 'Túnel seguro para acceso público y protección contra amenazas',
      color: 'orange',
      borderColor: 'orange'
    },
    {
      name: 'Docker',
      icon: Zap,
      description: 'Contenedores para desplegar y gestionar aplicaciones de forma aislada',
      color: 'blue',
      borderColor: 'blue'
    },
    {
      name: 'SSH Access',
      icon: Terminal,
      description: 'Acceso remoto seguro a la terminal desde cualquier ubicación',
      color: 'green',
      borderColor: 'green'
    },
    {
      name: 'Networking',
      icon: Wifi,
      description: 'Configuración de red para acceso remoto y gestión de puertos',
      color: 'purple',
      borderColor: 'purple'
    },
    {
      name: 'Seguridad',
      icon: Lock,
      description: 'Protección de servicios con firewall y autenticación robusta',
      color: 'red',
      borderColor: 'red'
    }
  ];

  return (
    <section className="container mx-auto px-6 py-16 bg-slate-900/50">
      <h2 className="text-4xl font-bold text-center mb-12 text-cyan-300">
        Stack Tecnológico
      </h2>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {technologies.map((tech, index) => {
          const Icon = tech.icon;
          return (
            <div 
              key={index}
              className={`bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-8 border border-${tech.borderColor}-500/30 hover:border-${tech.borderColor}-500/60 transition-all hover:scale-105 transform`}
            >
              <div className="flex items-center mb-4">
                <div className={`w-16 h-16 bg-${tech.color}-500/20 rounded-lg flex items-center justify-center mr-4`}>
                  <Icon className={`w-8 h-8 text-${tech.color}-400`} />
                </div>
                <h3 className="text-2xl font-bold">{tech.name}</h3>
              </div>
              <p className="text-gray-400">
                {tech.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}