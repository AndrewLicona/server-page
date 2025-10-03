import React from 'react';
import Hero from './components/Hero';
import Model3D from './components/Model3D';
import Specifications from './components/Specs';
import TechStack from './components/TechStack';
import ProjectPurpose from './components/ProjectPurpose';
import UseCases from './components/UseCases';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen text-white">
      <Hero />
      <Model3D />
      
      <Specifications />
      <TechStack />
      <ProjectPurpose />
      <UseCases />
      <Footer />
    </div>
  );
}

export default App;