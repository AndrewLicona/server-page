import { useEffect, useRef, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

const MAX_POINTS = 20;

const formatUptime = (seconds) => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (days > 0) {
    return `${days} día${days === 1 ? "" : "s"}, ${hours} h`;
  }
  if (hours > 0) {
    return `${hours} hora${hours === 1 ? "" : "s"}, ${minutes} min`;
  }
  return `${minutes} min`;
};

export default function Metrics() {
  const [metrics, setMetrics] = useState({});
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const tickRef = useRef(0);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch("/api/metrics");
        if (!response.ok) return;
        const data = await response.json();
        setMetrics(data);

        setHistory((prev) => {
          const next = [...prev, { ...data, tick: tickRef.current += 1 }];
          if (next.length > MAX_POINTS) {
            return next.slice(-MAX_POINTS);
          }
          return next;
        });
      } catch (error) {
        console.error("Error fetching metrics:", error);
      } finally {
        if (loading) setLoading(false);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 3000);

    return () => clearInterval(interval);
  }, [loading]);

  if (loading) {
    return (
      <section className="container mx-auto px-6 py-16">
        <h2 className="text-4xl font-bold text-center mb-12 text-blue-300">
          Estado del Sistema
        </h2>
        <div className="text-center text-gray-400">Cargando métricas...</div>
      </section>
    );
  }

  const cards = [
    { label: "CPU", value: `${metrics.cpu ?? 0}%`, desc: metrics.cpu > 80 ? "Alta carga" : "Uso normal" },
    { label: "RAM", value: `${metrics.memory ?? 0}%`, desc: metrics.memory > 90 ? "Memoria casi llena" : "Uso normal" },
    { label: "Disco", value: `${metrics.disk ?? 0}%`, desc: metrics.disk > 90 ? "Espacio reducido" : "Espacio disponible" },
    { label: "Tiempo encendido", value: metrics.uptime ? formatUptime(metrics.uptime) : "—", desc: "Desde el último arranque" },
  ];

  return (
    <section id="metrics" className="bg-slate-800/30 border-y border-blue-500/10">
      <div className="container mx-auto px-6 py-16">
        <h2 className="text-4xl font-bold text-center mb-4 text-blue-300">
          Estado del Sistema
        </h2>
        <p className="text-center text-gray-400 mb-10">
          Métricas públicas del servidor, actualizadas cada pocos segundos.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-12">
          {cards.map((card) => (
            <div
              key={card.label}
              className="bg-slate-800/70 backdrop-blur-sm rounded-xl p-6 border border-blue-500/20 text-center"
            >
              <p className="text-sm text-gray-400 uppercase tracking-wide">{card.label}</p>
              <p className="text-4xl font-bold text-white mt-2">{card.value}</p>
              <p className="text-xs text-gray-500 mt-2">{card.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-slate-900/60 rounded-xl border border-blue-500/10 p-4">
          <h3 className="text-lg font-semibold text-blue-200 mb-4 text-center">
            CPU y RAM en vivo
          </h3>
          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history}>
                <XAxis dataKey="tick" hide />
                <YAxis domain={[0, 100]} stroke="#64748b" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155" }}
                  labelFormatter={() => "Tiempo real"}
                  formatter={(value, name) => [`${value}%`, name === "cpu" ? "CPU" : "RAM"]}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="cpu"
                  stroke="#60a5fa"
                  strokeWidth={2}
                  dot={false}
                  name="CPU"
                />
                <Line
                  type="monotone"
                  dataKey="memory"
                  stroke="#f472b6"
                  strokeWidth={2}
                  dot={false}
                  name="RAM"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}
