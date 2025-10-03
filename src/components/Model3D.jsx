"use client";

import React, { useState } from "react";
// 👇 Importa la imagen desde assets
import laptopImg from "../assets/images/laptop.png";

export default function Model3D() {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientY - rect.top) / rect.height - 0.5) * 20;
    const y = ((e.clientX - rect.left) / rect.width - 0.5) * -20;
    setRotation({ x, y });
  };

  return (
    <div
      className="max-w-3xl mx-auto my-16 perspective-1000"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setRotation({ x: 0, y: 0 })}
    >
      <div
        className="relative bg-gradient-to-br   rounded-2xl p-8 backdrop-blur-sm border border-blue-600/30 transition-transform duration-300 ease-out preserve-3d"
        style={{
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
        }}
      >
        <div className="text-center">
          {/* 👇 Imagen de laptop importada */}
          <img
            src={laptopImg}
            alt="Laptop 3D efecto"
            className="mx-auto rounded-lg  w-[400px] h-auto"
            loading="lazy"
             style={{ mixBlendMode: "multiply", backgroundColor: "transparent" }}
          />
          <p className="text-gray-300 font-bold text-lg mt-4">Acer Aspire A314-31</p>
          <p className="text-gray-500 text-sm mt-2">
            ----------------------------------<br />
            CPU: Intel Celeron N4000<br />
            RAM: 4GB DDR4<br />
            Almacenamiento: 500GB HDD<br />
            Sistema Operativo: Ubuntu Server 24.04 LTS<br />
            ----------------------------------<br />
          </p>
        </div>
      </div>
    </div>
  );
}
