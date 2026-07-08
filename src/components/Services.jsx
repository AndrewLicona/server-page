import { useEffect, useState } from "react";
import { Globe, Wifi, WifiOff } from "lucide-react";

const SERVICES = [
  { name: "Portafolio", url: "https://andrefrndz.site" },
  { name: "Server Page", url: "https://andrefrndz.site/server" },
  { name: "YouTube Dashboard", url: "https://andrefrndz.site/youtube" },
  { name: "AdGuard Home", url: "https://andrefrndz.site/adguard" },
];

export default function Services() {
  const [services, setServices] = useState([]);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch("/api/status");
        const data = await response.json();
        setServices(data.services ?? []);
      } catch (error) {
        console.error("Error fetching services:", error);
      }
    };

    fetchServices();
    const interval = setInterval(fetchServices, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="bg-slate-900/60">
      <div className="container mx-auto px-6 py-16">
        <h2 className="text-4xl font-bold text-center mb-4 text-blue-300">
          Servicios expuestos
        </h2>
        <p className="text-center text-gray-400 mb-12">
          Páginas y herramientas disponibles en este servidor
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {services.map((service) => (
            <div
              key={service.name}
              className="bg-slate-800/70 backdrop-blur-sm rounded-xl p-6 border border-blue-500/20 hover:border-blue-500/50 transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                {service.online ? (
                  <Wifi className="w-5 h-5 text-emerald-400" />
                ) : (
                  <WifiOff className="w-5 h-5 text-red-400" />
                )}
                <h3 className="text-lg font-semibold text-white">
                  {service.name}
                </h3>
              </div>

              <p className="text-sm text-gray-400 mb-4">
                Estado:{" "}
                <span
                  className={
                    service.online ? "text-emerald-400" : "text-red-400"
                  }
                >
                  {service.online ? "En línea" : "Fuera de línea"}
                </span>
              </p>

              <a
                href={service.url}
                className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                <Globe className="w-4 h-4" />
                {service.url}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
