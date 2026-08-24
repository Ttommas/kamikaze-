import React, { useState } from 'react';
import { Search, Filter, Sparkles, Clock, MapPin, Users, ArrowRight, ShieldCheck, CheckCircle, Tag } from 'lucide-react';
import { Workshop, WalletConfig, WorkshopModality, WorkshopDiscipline } from '../types';

interface WorkshopsSectionProps {
  workshops: Workshop[];
  walletConfig: WalletConfig;
  onSelectWorkshop: (workshop: Workshop) => void;
  onEnrollWorkshop: (workshop: Workshop) => void;
}

export const WorkshopsSection: React.FC<WorkshopsSectionProps> = ({
  workshops,
  walletConfig,
  onSelectWorkshop,
  onEnrollWorkshop,
}) => {
  const [selectedModality, setSelectedModality] = useState<string>('todos');
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  const filteredWorkshops = workshops.filter((ws) => {
    if (!ws.active) return false;
    
    // Modality filter
    if (selectedModality !== 'todos') {
      if (selectedModality === 'presencial' && ws.modality !== 'presencial') return false;
      if (selectedModality === 'hibrido' && ws.modality !== 'hibrido' && ws.modality !== 'virtual') return false;
      if (selectedModality === 'intensivo' && ws.modality !== 'intensivo') return false;
    }

    // Discipline filter
    if (selectedDiscipline !== 'todos' && ws.discipline !== selectedDiscipline) {
      return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = ws.title.toLowerCase().includes(q);
      const matchSub = ws.subtitle.toLowerCase().includes(q);
      const matchTeacher = ws.teacherName.toLowerCase().includes(q);
      const matchDisc = ws.discipline.toLowerCase().includes(q);
      if (!matchTitle && !matchSub && !matchTeacher && !matchDisc) return false;
    }

    return true;
  });

  return (
    <section id="talleres" className="border-b border-[#E52E33] scroll-mt-16">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row justify-between items-baseline gap-2 px-6 sm:px-12 py-7 border-b border-[#E52E33]">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xs font-normal tracking-[0.2em] uppercase brand-title">
              Talleres y Cursos abiertos
            </h2>
            <span className="text-[10px] font-mono px-1.5 py-0.5 border border-[#E52E33] bg-[#f0c510]">
              Inscripción Online
            </span>
          </div>
          <p className="text-xs opacity-80 mt-1 font-mono">
            Formación experimental & procesos compartidos
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs tracking-[0.16em] uppercase font-mono">
          <span>Temporada 06 · 2026</span>
        </div>
      </div>

      {/* Filter and search toolbar */}
      <div className="px-6 sm:px-12 py-4 bg-[#f0c510]/50 border-b border-[#E52E33] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Modality Chips */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <span className="opacity-70 text-[11px] uppercase mr-1">Modalidad:</span>
          {['todos', 'presencial', 'hibrido', 'intensivo'].map((mod) => (
            <button
              key={mod}
              onClick={() => setSelectedModality(mod)}
              className={`px-2.5 py-1 border text-[11px] uppercase transition-colors cursor-pointer ${
                selectedModality === mod
                  ? 'bg-[#E52E33] text-[#FFD41D] border-[#E52E33] font-bold'
                  : 'bg-[#FFD41D] text-[#E52E33] border-[#E52E33]/50 hover:border-[#E52E33]'
              }`}
            >
              {mod === 'todos' ? 'Todas' : mod === 'hibrido' ? 'Híbrido / Online' : mod}
            </button>
          ))}
        </div>

        {/* Search input & View switcher */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 opacity-60 text-[#E52E33]" />
            <input
              type="text"
              placeholder="Buscar taller o docente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-[#FFD41D] border border-[#E52E33] text-xs font-mono text-[#E52E33] placeholder:text-[#E52E33]/40 focus:outline-hidden"
            />
          </div>

          <div className="flex border border-[#E52E33] text-xs font-mono">
            <button
              onClick={() => setViewMode('table')}
              className={`px-2.5 py-1 transition-colors ${
                viewMode === 'table' ? 'bg-[#E52E33] text-[#FFD41D] font-bold' : 'hover:bg-yellow-400/30'
              }`}
              title="Vista de lista oficial"
            >
              Lista
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`px-2.5 py-1 border-l border-[#E52E33] transition-colors ${
                viewMode === 'cards' ? 'bg-[#E52E33] text-[#FFD41D] font-bold' : 'hover:bg-yellow-400/30'
              }`}
              title="Vista de fichas"
            >
              Fichas
            </button>
          </div>
        </div>
      </div>

      {/* Workshops List Table View (Matches Brand manual & HTML) */}
      {viewMode === 'table' ? (
        <div className="divide-y divide-[#E52E33]">
          {filteredWorkshops.length === 0 ? (
            <div className="p-12 text-center text-xs font-mono opacity-80">
              No se encontraron talleres con los filtros seleccionados.
            </div>
          ) : (
            filteredWorkshops.map((workshop, idx) => {
              const isSoldOut = workshop.availableSpots <= 0;
              const isFewSpots = workshop.availableSpots <= 2 && !isSoldOut;

              return (
                <div
                  key={workshop.id}
                  className="brand-row grid grid-cols-1 md:grid-cols-[40px_1fr_180px_140px_220px] gap-4 md:gap-6 items-center px-6 sm:px-12 py-5 sm:py-6"
                >
                  {/* Number Index */}
                  <span className="font-mono text-xs font-bold opacity-80">
                    {String(idx + 1).padStart(2, '0')}
                  </span>

                  {/* Title and Subtitle */}
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="brand-title text-xl sm:text-2xl font-normal leading-snug">
                        {workshop.title}
                      </h3>
                      {workshop.featured && (
                        <span className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-mono uppercase bg-[#E52E33] text-[#FFD41D]">
                          Destacado
                        </span>
                      )}
                    </div>
                    <p className="text-xs opacity-85 mt-0.5 line-clamp-1">
                      {workshop.subtitle}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] font-mono opacity-70 mt-1">
                      <span>Docente: {workshop.teacherName}</span>
                      <span>·</span>
                      <span className="uppercase">{workshop.modality}</span>
                    </div>
                  </div>

                  {/* Schedule */}
                  <div className="text-xs font-mono">
                    <span className="block font-bold">{workshop.schedule.split('·')[0]}</span>
                    <span className="text-[11px] opacity-80">{workshop.schedule.split('·')[1] || workshop.duration}</span>
                  </div>

                  {/* Price & Spots */}
                  <div className="text-xs font-mono">
                    <div className="font-bold text-sm">
                      ${workshop.regularPrice.toLocaleString('es-AR')}
                    </div>
                    <div className="text-[10px]">
                      {isSoldOut ? (
                        <span className="text-red-700 font-bold uppercase">Agotado</span>
                      ) : isFewSpots ? (
                        <span className="text-red-700 font-bold uppercase">¡Últimos {workshop.availableSpots} cupos!</span>
                      ) : (
                        <span className="opacity-80">{workshop.availableSpots} vacantes libres</span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-start md:justify-end gap-3 pt-2 md:pt-0">
                    <button
                      onClick={() => onSelectWorkshop(workshop)}
                      className="lk-brand text-xs font-mono uppercase tracking-wider underline underline-offset-4 cursor-pointer"
                    >
                      Saber más →
                    </button>

                    <button
                      onClick={() => onEnrollWorkshop(workshop)}
                      disabled={isSoldOut}
                      className={`btn-brand px-4 py-2 font-mono text-xs uppercase tracking-wider border rounded-xs font-bold cursor-pointer ${
                        isSoldOut ? 'opacity-40 cursor-not-allowed' : ''
                      }`}
                    >
                      {isSoldOut ? 'Sin cupos' : 'Inscribirse'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        /* Cards View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6 sm:p-12">
          {filteredWorkshops.map((workshop) => {
            const isSoldOut = workshop.availableSpots <= 0;
            return (
              <div 
                key={workshop.id}
                className="border-2 border-[#E52E33] bg-[#f0c510]/30 p-6 flex flex-col justify-between hover:bg-[#f0c510]/70 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-mono opacity-80 mb-2">
                    <span className="uppercase">{workshop.code} · {workshop.modality}</span>
                    <span>{workshop.season}</span>
                  </div>

                  <h3 className="brand-title text-2xl font-normal leading-tight mb-2">
                    {workshop.title}
                  </h3>
                  
                  <p className="text-xs opacity-90 italic mb-4 line-clamp-2">
                    {workshop.subtitle}
                  </p>

                  <div className="space-y-2 text-xs font-mono border-t border-b border-[#E52E33]/30 py-3 mb-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      <span>{workshop.schedule}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{workshop.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 shrink-0" />
                      <span>{workshop.availableSpots} vacantes disponibles</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="flex items-baseline justify-between mb-4">
                    <div>
                      <span className="text-xl font-bold font-mono">
                        ${workshop.regularPrice.toLocaleString('es-AR')}
                      </span>
                      <span className="text-[10px] block opacity-80 font-mono">
                        ${workshop.memberPrice.toLocaleString('es-AR')} socixs
                      </span>
                    </div>

                    <button
                      onClick={() => onSelectWorkshop(workshop)}
                      className="text-xs uppercase font-mono tracking-wider underline hover:opacity-70"
                    >
                      Ver programa →
                    </button>
                  </div>

                  <button
                    onClick={() => onEnrollWorkshop(workshop)}
                    disabled={isSoldOut}
                    className="w-full btn-brand-inverse py-2.5 font-mono text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>{isSoldOut ? 'Cupos Agotados' : 'Inscribirse al Taller'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
