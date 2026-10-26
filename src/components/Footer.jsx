import { Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-slate-700/60 bg-slate-950/60">
      <div className="container mx-auto px-5 py-10 text-center sm:px-6 sm:py-12">
        <p className="mb-2 text-base text-gray-300 sm:text-lg">
          Proyecto de Servidor Personal
        </p>
        <p className="mb-5 text-xs text-gray-500 sm:mb-6 sm:text-sm">
          Acer Aspire 3 A315-42 · Ubuntu Server 24.04 LTS · Docker · Cloudflare
        </p>
        <p className="inline-flex items-center gap-2 text-xs text-gray-500 sm:text-sm">
          Construido con pasion por aprender y experimentar
          <Heart className="h-4 w-4 text-cyan-400" />
        </p>
      </div>
    </footer>
  );
}
