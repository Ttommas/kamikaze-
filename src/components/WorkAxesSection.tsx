import React from 'react';
import { Layers, Zap, Shuffle, HeartHandshake } from 'lucide-react';

export const WorkAxesSection: React.FC = () => {
  const axes = [
    {
      num: '01',
      tag: 'MATERIA',
      title: 'Experimentación física',
      desc: 'Indagación directa sobre la arcilla, el pigmento mineral y el soporte como punto de partida indispensable de la obra.',
      detail: 'Rechazamos la separación entre diseño y factura. La materia propone su propia resistencia y tempo.',
      icon: Layers,
    },
    {
      num: '02',
      tag: 'GESTO',
      title: 'Error y accidente',
      desc: 'Revalorización de la falla técnica como motor creativo y apertura hacia caminos no planeados de producción.',
      detail: 'La grieta, la mancha fortuita y la ruptura son aceptadas como lenguaje plástico soberano.',
      icon: Zap,
    },
    {
      num: '03',
      tag: 'CRUCE',
      title: 'Polifonía de talleres',
      desc: 'Cruces sistemáticos entre disciplinas (escritura, cerámica, dibujo, sonido) operando sobre una misma pieza colectiva.',
      detail: 'Ninguna obra pertenece a una sola técnica ni a una sola firma.',
      icon: Shuffle,
    },
  ];

  return (
    <section id="ejes" className="border-b border-[#E52E33] scroll-mt-16">
      <div className="flex justify-between items-baseline px-6 sm:px-12 py-7 border-b border-[#E52E33]">
        <h2 className="text-xs font-normal tracking-[0.2em] uppercase brand-title">
          Ejes de trabajo
        </h2>
        <span className="text-xs tracking-[0.16em] uppercase font-mono">
          Metodología Kamikaze
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#E52E33]">
        {axes.map((axis) => {
          const Icon = axis.icon;
          return (
            <div 
              key={axis.num} 
              className="p-6 sm:p-8 lg:p-12 hover:bg-[#f0c510]/50 transition-colors flex flex-col justify-between group min-w-0 overflow-hidden"
            >
              <div className="min-w-0">
                <div className="flex items-center justify-between text-xs font-mono tracking-[0.14em] opacity-80 mb-4">
                  <span>{axis.num} / {axis.tag}</span>
                  <Icon className="w-4 h-4 text-[#E52E33] opacity-60 group-hover:opacity-100 transition-opacity shrink-0" />
                </div>

                <h3 className="brand-title text-xl sm:text-2xl lg:text-2xl xl:text-3xl font-normal leading-tight mb-4 group-hover:underline break-words">
                  {axis.title}
                </h3>

                <p className="text-sm leading-relaxed opacity-90 mb-4 break-words">
                  {axis.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-[#E52E33]/30 text-xs font-mono opacity-75 break-words">
                {axis.detail}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
