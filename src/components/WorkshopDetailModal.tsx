import React, { useEffect } from 'react';
import { X, Calendar, Clock, MapPin, CheckCircle, User, Award, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { Workshop, WalletConfig } from '../types';

interface WorkshopDetailModalProps {
  workshop: Workshop | null;
  walletConfig: WalletConfig;
  isOpen: boolean;
  onClose: () => void;
  onStartEnrollment: (workshop: Workshop) => void;
}

export const WorkshopDetailModal: React.FC<WorkshopDetailModalProps> = ({
  workshop,
  isOpen,
  onClose,
  onStartEnrollment,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !workshop) return null;

  const isSoldOut = workshop.availableSpots <= 0;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto cursor-pointer"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-3xl bg-[#FFD41D] text-[#E52E33] border-2 border-[#E52E33] shadow-2xl my-8 overflow-hidden cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E52E33] bg-[#f0c510]">
          <div className="flex items-center gap-3">
            <span className="text-xs uppercase tracking-widest px-2 py-0.5 border border-[#E52E33] font-mono">
              {workshop.code}
            </span>
            <span className="text-xs uppercase tracking-widest font-mono">
              {workshop.season} · {workshop.modality.toUpperCase()}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#E52E33] hover:text-[#FFD41D] transition-colors border border-[#E52E33]"
            title="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Main Title & Subtitle */}
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-widest opacity-80 font-mono mb-2">
              <span>Disciplina: {workshop.discipline}</span>
              <span>·</span>
              <span className={workshop.availableSpots <= 2 ? 'text-red-700 font-bold' : ''}>
                {isSoldOut ? 'Cupos agotados' : `${workshop.availableSpots} de ${workshop.totalSpots} cupos libres`}
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-normal brand-title leading-tight">
              {workshop.title}
            </h2>
            <p className="text-base sm:text-lg mt-2 italic opacity-90 border-l-2 border-[#E52E33] pl-3">
              {workshop.subtitle}
            </p>
          </div>

          {/* Quick info grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 border border-[#E52E33] bg-yellow-400/20 text-sm">
            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 mt-0.5 shrink-0" />
              <div>
                <strong className="block text-xs uppercase tracking-wider font-mono">Horario & Duración</strong>
                <span>{workshop.schedule}</span>
                <span className="block text-xs opacity-80">{workshop.duration}</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Calendar className="w-4 h-4 mt-0.5 shrink-0" />
              <div>
                <strong className="block text-xs uppercase tracking-wider font-mono">Fechas</strong>
                <span>{workshop.dates}</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
              <div>
                <strong className="block text-xs uppercase tracking-wider font-mono">Ubicación / Modalidad</strong>
                <span>{workshop.location}</span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <User className="w-4 h-4 mt-0.5 shrink-0" />
              <div>
                <strong className="block text-xs uppercase tracking-wider font-mono">A cargo de</strong>
                <span className="font-bold">{workshop.teacherName}</span>
                <span className="block text-xs opacity-80">{workshop.teacherRole}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-xs uppercase tracking-widest font-mono font-bold mb-2 pb-1 border-b border-[#E52E33]/30">
              01. Fundamentación & Enfoque
            </h3>
            <p className="text-sm sm:text-base leading-relaxed opacity-95">
              {workshop.description}
            </p>
          </div>

          {/* Syllabus / Programa */}
          <div>
            <h3 className="text-xs uppercase tracking-widest font-mono font-bold mb-3 pb-1 border-b border-[#E52E33]/30">
              02. Programa de encuentros
            </h3>
            <div className="space-y-2.5">
              {workshop.syllabus.map((item, index) => (
                <div key={index} className="flex items-start gap-3 text-sm p-2.5 bg-yellow-400/10 border-l border-[#E52E33]">
                  <span className="font-mono text-xs font-bold px-1.5 py-0.5 bg-[#E52E33] text-[#FFD41D] shrink-0">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Materials & Requirements */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xs uppercase tracking-widest font-mono font-bold mb-2 pb-1 border-b border-[#E52E33]/30">
                03. Materiales incluidos
              </h3>
              <ul className="space-y-1.5 text-sm">
                {workshop.materialsIncluded.map((mat, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 mt-1 text-[#E52E33] shrink-0" />
                    <span>{mat}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-xs uppercase tracking-widest font-mono font-bold mb-2 pb-1 border-b border-[#E52E33]/30">
                04. Requisitos / Qué traer
              </h3>
              <p className="text-sm leading-relaxed opacity-90">
                {workshop.requirements}
              </p>
              <div className="mt-3 p-2 border border-[#E52E33]/40 text-xs bg-[#f0c510]">
                <span className="font-bold">Nota:</span> Se entrega certificado digital de participación avalado por KAMIKAZE.
              </div>
            </div>
          </div>

          {/* Teacher Bio Card */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 border border-[#E52E33] bg-[#f0c510]">
            <img 
              src={workshop.teacherAvatar} 
              alt={workshop.teacherName} 
              className="w-16 h-16 object-cover border border-[#E52E33] brand-image-duotone shrink-0"
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold brand-title">{workshop.teacherName}</span>
                <span className="text-xs uppercase font-mono tracking-wider border border-[#E52E33] px-1">Docente</span>
              </div>
              <p className="text-xs opacity-90 mt-1 leading-relaxed">{workshop.teacherBio}</p>
            </div>
          </div>

          {/* Pricing & CTA Section */}
          <div className="p-5 border-2 border-[#E52E33] bg-[#f0c510] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-xs uppercase tracking-widest font-mono opacity-80">Arancel del Taller</div>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="text-3xl font-black brand-title">
                  ${workshop.regularPrice.toLocaleString('es-AR')}
                </span>
                <span className="text-xs uppercase tracking-wider px-2 py-0.5 bg-[#E52E33] text-[#FFD41D] font-mono">
                  ${workshop.memberPrice.toLocaleString('es-AR')} socixs
                </span>
              </div>
              <span className="text-[11px] opacity-80 block mt-0.5">
                Pago seguro con Billetera Virtual (Mercado Pago, CVU, Transferencia o Efectivo)
              </span>
            </div>

            <button
              onClick={() => {
                onClose();
                onStartEnrollment(workshop);
              }}
              disabled={isSoldOut}
              className={`w-full sm:w-auto px-8 py-3.5 font-mono text-sm uppercase tracking-widest flex items-center justify-center gap-2 ${
                isSoldOut
                  ? 'opacity-50 cursor-not-allowed bg-neutral-300 text-neutral-600 border-neutral-400'
                  : 'btn-brand-inverse font-bold shadow-md cursor-pointer'
              }`}
            >
              <span>{isSoldOut ? 'Cupos Agotados' : 'Inscribirme ahora'}</span>
              {!isSoldOut && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
