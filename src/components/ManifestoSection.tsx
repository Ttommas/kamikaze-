import React, { useState } from 'react';
import { MANIFESTO_PARAGRAPHS } from '../data/initialData';
import { Sparkles, ChevronDown, ChevronUp, Quote } from 'lucide-react';

export const ManifestoSection: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeLine, setActiveLine] = useState<number | null>(null);

  return (
    <section id="manifiesto" className="border-b border-[#E52E33] scroll-mt-16">
      {/* Statement Grid matching HTML & Manual Page 6/9 */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr_1.4fr] gap-8 md:gap-16 px-6 sm:px-12 py-16 sm:py-20">
        <div className="text-xs uppercase tracking-[0.2em] font-mono brand-title flex items-start gap-2">
          <span>Manifiesto / 01</span>
          <span className="opacity-60 text-[10px]">— Colectivo 2026</span>
        </div>

        <div>
          <p className="text-2xl sm:text-3xl lg:text-4xl leading-[1.3] font-normal tracking-tight max-w-[32ch]">
            cuestionar, romper, reafirmar. inventar lo que no existe. inventarnos una y otra vez, nosotrxs. un ecosistema vivo, vivido, fabricado.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-6">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="lk-brand inline-flex items-center gap-2 text-xs uppercase tracking-[0.16em] font-mono border-b border-[#E52E33] pb-1 cursor-pointer font-bold"
            >
              <span>{isExpanded ? 'Ocultar manifiesto extendido ↑' : 'Leer el manifiesto extendido completo →'}</span>
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded poetic manifesto block with justified lines (Brand manual pages 6, 8, 9) */}
      {isExpanded && (
        <div className="border-t border-[#E52E33] bg-[#f0c510]/60 p-6 sm:p-12 transition-all">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between border-b border-[#E52E33]/40 pb-3">
              <span className="brand-title text-sm font-bold tracking-widest">
                MANIFIESTO COMPLETO — KAMIKAZE
              </span>
              <span className="text-xs font-mono opacity-80">
                Textos en prosa poética continua
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm sm:text-base leading-relaxed">
              <div className="space-y-3 font-sans">
                {MANIFESTO_PARAGRAPHS.slice(0, 13).map((line, idx) => (
                  <p 
                    key={idx}
                    onMouseEnter={() => setActiveLine(idx)}
                    onMouseLeave={() => setActiveLine(null)}
                    className={`transition-all duration-200 cursor-default ${
                      activeLine === idx ? 'bg-[#E52E33] text-[#FFD41D] px-2 py-0.5 font-bold' : 'opacity-90'
                    }`}
                  >
                    {line}
                  </p>
                ))}
              </div>

              <div className="space-y-3 font-sans border-t md:border-t-0 md:border-l border-[#E52E33]/40 pt-4 md:pt-0 md:pl-8">
                {MANIFESTO_PARAGRAPHS.slice(13).map((line, idx) => {
                  const actualIdx = idx + 13;
                  return (
                    <p 
                      key={actualIdx}
                      onMouseEnter={() => setActiveLine(actualIdx)}
                      onMouseLeave={() => setActiveLine(null)}
                      className={`transition-all duration-200 cursor-default ${
                        activeLine === actualIdx ? 'bg-[#E52E33] text-[#FFD41D] px-2 py-0.5 font-bold' : 'opacity-90'
                      }`}
                    >
                      {line}
                    </p>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 border-t border-[#E52E33]/40 flex justify-between items-center text-xs font-mono opacity-80">
              <span>humane creatives — 2026</span>
              <span className="font-bold">KAMIKAZE</span>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
