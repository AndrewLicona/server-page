import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area,
  AreaChart,
} from "recharts";
import { Activity, Cpu, HardDrive, MemoryStick, Timer } from "lucide-react";
import { useServerStore } from "../store/serverStore";

const formatUptime = (seconds) => {
  if (!seconds) return "—";
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `${days} día${days === 1 ? "" : "s"} ${hours} h`;
  if (hours > 0) return `${hours} h ${minutes} min`;
  return `${minutes} min`;
};

const formatClock = (timestamp) =>
  new Date(timestamp).toLocaleTimeString("es", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

export default function Metrics() {
  const { metrics, history, connected, error } = useServerStore();

  const cards = [
    {
      label: "CPU",
      value: metrics ? `${Math.round(metrics.cpu)}%` : "—",
      desc: metrics?.cpu > 80 ? "Alta carga" : "Uso normal",
      icon: Cpu,
      tone: "text-blue-400",
    },
    {
      label: "RAM",
      value: metrics ? `${Math.round(metrics.memory)}%` : "—",
      desc: metrics?.memory > 90 ? "Memoria casi llena" : "Uso normal",
      icon: MemoryStick,
      tone: "text-cyan-400",
    },
    {
      label: "Disco",
      value: metrics ? `${Math.round(metrics.disk)}%` : "—",
      desc: metrics?.disk > 90 ? "Espacio reducido" : "Espacio disponible",
      icon: HardDrive,
      tone: "text-violet-400",
    },
    {
      label: "Tiempo encendido",
      value: formatUptime(metrics?.uptime),
      desc: "Desde el último arranque",
      icon: Timer,
      tone: "text-emerald-400",
    },
  ];

  return (
    <section
      id="metricas"
      className="scroll-mt-20 border-y border-blue-500/10 bg-slate-800/30"
    >      <div className="container mx-auto scroll-mt-20 px-5 py-12 sm:px-6 sm:py-16">
        <div className="mb-4 flex flex-wrap items-center justify-center gap-3">
          <h2 className="text-center text-3xl font-bold text-blue-300 sm:text-4xl">
            Estado del Sistema
          </h2>
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              connected ? "bg-emerald-400" : "bg-red-400"
            }`}
            title={connected ? "Conectado" : `Sin conexión: ${error ?? "?"}`}
          />
        </div>
        <p className="mb-10 text-center text-sm text-gray-400 sm:text-base">
          Métricas públicas del servidor, actualizadas cada 3 segundos.
        </p>

        <div className="mx-auto mb-12 grid max-w-6xl grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-4">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.label}
                className="rounded-xl border border-blue-500/20 bg-slate-800/70 p-4 text-center backdrop-blur-sm transition-colors hover:border-blue-500/50 sm:p-6"
              >
                <Icon className={`mx-auto mb-2 h-5 w-5 sm:mb-3 sm:h-6 sm:w-6 ${card.tone}`} />
                <p className="text-[11px] uppercase tracking-wide text-gray-400 sm:text-sm">
                  {card.label}
                </p>
                <p className="mt-1 text-xl font-bold text-white sm:mt-2 sm:text-3xl">
                  {card.value}
                </p>
                <p className="mt-1 text-[11px] text-gray-500 sm:mt-2 sm:text-xs">
                  {card.desc}
                </p>
              </div>
            );
          })}
        </div>

        <div className="rounded-xl border border-blue-500/10 bg-slate-900/60 p-3 sm:p-4">
          <h3 className="mb-4 text-center text-base font-semibold text-blue-200 sm:text-lg">
            CPU y RAM en vivo
          </h3>
          <div className="h-60 w-full sm:h-72">
            {history.length < 2 ? (
              <div className="flex h-full items-center justify-center text-sm text-gray-500">
                Recopilando datos...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history}>
                  <defs>
                    <linearGradient id="cpuFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#60a5fa" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#60a5fa" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="ramFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f472b6" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#f472b6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="t"
                    tickFormatter={formatClock}
                    stroke="#475569"
                    fontSize={11}
                    minTickGap={48}
                  />
                  <YAxis domain={[0, 100]} stroke="#64748b" fontSize={11} unit="%" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      borderRadius: "0.5rem",
                    }}
                    labelFormatter={(value) => `Hora: ${formatClock(value)}`}
                    formatter={(value, name) => [
                      `${Math.round(value)}%`,
                      name === "cpu" ? "CPU" : "RAM",
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="cpu"
                    stroke="#60a5fa"
                    strokeWidth={2}
                    fill="url(#cpuFill)"
                    name="cpu"
                    isAnimationActive={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="memory"
                    stroke="#f472b6"
                    strokeWidth={2}
                    fill="url(#ramFill)"
                    name="memory"
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <p className="mt-4 flex items-center justify-center gap-2 text-center text-xs text-gray-500">
          <Activity className="h-3.5 w-3.5 shrink-0" />
          <span>
            Historial en vivo · <span className="tabular-nums">{history.length}</span>{" "}
            muestras
          </span>
        </p>
      </div>
    </section>
  );
}
