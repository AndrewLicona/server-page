import { Component, lazy, Suspense } from "react";
import ScrollStory from "./components/ScrollStory";
import Metrics from "./components/Metrics";
import Specifications from "./components/Specs";
import TechStack from "./components/TechStack";
import ProjectPurpose from "./components/ProjectPurpose";
import UseCases from "./components/UseCases";
import Footer from "./components/Footer";
import Nav from "./components/Nav";
import { useDeviceProfile } from "./hooks/useDeviceProfile";

const LazyHero = lazy(() => import("./components/Hero"));

/**
 * Cortafuegos de errores: si un componente falla, el resto de la página sigue
 * funcionando. Sin esto, un fallo en la escena 3D dejaría la web en blanco.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Error en la interfaz:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container mx-auto px-6 py-20 text-center">
          <h2 className="mb-3 text-2xl font-bold text-blue-300">
            Algo no ha salido bien
          </h2>
          <p className="text-gray-400">
            El resto de la página sigue disponible.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-6 rounded-lg border border-blue-500/40 bg-blue-500/10 px-5 py-2 text-sm font-medium text-blue-200 transition-colors hover:bg-blue-500/20"
          >
            Recargar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  const quality = useDeviceProfile();

  return (
    <ErrorBoundary>
      <div className="min-h-screen text-white">
        <Nav />
        <ScrollStory quality={quality} />
        <Suspense fallback={<div className="h-40" />}>
          <LazyHero />
        </Suspense>
        <Metrics />
        <Specifications />
        <TechStack />
        <ProjectPurpose />
        <UseCases />
        <Footer />
      </div>
    </ErrorBoundary>
  );
}

export default App;
