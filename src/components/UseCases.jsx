import React from 'react';

export default function UseCases() {
  const cases = [
    {
      emoji: '🌐',
      title: 'Hosting de Proyectos Personales',
      description: 'Despliegue de aplicaciones web, APIs y servicios para testing y demostración',
      borderColor: 'blue'
    },
    {
      emoji: '📱',
      title: 'Acceso Remoto Universal',
      description: 'Gestión completa del servidor desde cualquier dispositivo y ubicación',
      borderColor: 'cyan'
    },
    {
      emoji: '🧪',
      title: 'Laboratorio de Pruebas',
      description: 'Ambiente aislado para experimentar con nuevas tecnologías antes de producción',
      borderColor: 'purple'
    }
  ];

  return (
    <section className="container mx-auto px-6 py-16 bg-slate-900/50">
      <h2 className="text-4xl font-bold text-center mb-12 text-cyan-300">
        Casos de Uso
      </h2>
      
      <div className="max-w-3xl mx-auto space-y-6">
        {cases.map((useCase, index) => (
          <div 
            key={index}
            className={`bg-gradient-to-r from-${useCase.borderColor}-900/40 to-slate-800/40 rounded-lg p-6 border-l-4 border-${useCase.borderColor}-400 hover:translate-x-2 transition-transform`}
          >
            <h3 className="text-xl font-semibold mb-2">
              {useCase.emoji} {useCase.title}
            </h3>
            <p className="text-gray-300">
              {useCase.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}