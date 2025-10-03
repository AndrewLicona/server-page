import React from 'react';

export default function ProjectPurpose() {
  const purposes = [
    {
      emoji: '🎓',
      title: 'Aprendizaje Continuo',
      description: 'Experimentación práctica con tecnologías de servidor, contenedores, networking y DevOps en un entorno real.'
    },
    {
      emoji: '🚀',
      title: 'Portfolio Técnico',
      description: 'Demostración de habilidades en deployment, administración de sistemas y solución de problemas reales.'
    },
    {
      emoji: '♻️',
      title: 'Reutilización',
      description: 'Dar nueva vida a hardware antiguo, convirtiendo un portátil en desuso en infraestructura útil y funcional.'
    },
    {
      emoji: '🔧',
      title: 'Experimentación',
      description: 'Ambiente seguro para probar nuevas tecnologías, frameworks y configuraciones sin riesgo.'
    }
  ];

  return (
    <section className="container mx-auto px-6 py-16">
      <h2 className="text-4xl font-bold text-center mb-12 text-blue-300">
        ¿Por Qué Este Proyecto?
      </h2>
      
      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
        {purposes.map((purpose, index) => (
          <div 
            key={index}
            className="bg-slate-800/30 backdrop-blur-sm rounded-xl p-8 border border-blue-400/20 hover:border-blue-400/40 transition-all"
          >
            <h3 className="text-2xl font-semibold mb-4 text-cyan-300">
              {purpose.emoji} {purpose.title}
            </h3>
            <p className="text-gray-300 leading-relaxed">
              {purpose.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}