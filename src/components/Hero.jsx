import React from 'react';

export default function Hero() {
  return (
    <header className="container mx-auto px-6 pt-20 pb-12">
      <div className="text-center mb-8 animate-fade-in">
        <h1 className="text-5xl md:text-7xl font-bold mb-4 text-gradient">
          De Portátil a Servidor
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-2">
          Transformando hardware antiguo en infraestructura moderna
        </p>
        <p className="text-lg text-blue-300">
          Un proyecto de aprendizaje y experimentación
        </p>
      </div>
    </header>
  );
}