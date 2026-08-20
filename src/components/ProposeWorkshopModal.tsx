import React, { useState, useEffect } from 'react';
import { X, Send, Sparkles, Check } from 'lucide-react';

interface ProposeWorkshopModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProposeWorkshopModal: React.FC<ProposeWorkshopModalProps> = ({
  isOpen,
  onClose,
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

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    proposalType: 'taller',
    title: '',
    description: '',
    portfolio: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
      setFormData({
        name: '',
        email: '',
        phone: '',
        proposalType: 'taller',
        title: '',
        description: '',
        portfolio: '',
      });
    }, 2500);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs cursor-pointer"
      onClick={onClose}
    >
      <div 
        className="bg-[#FFD41D] text-[#E52E33] border-2 border-[#E52E33] w-full max-w-xl p-6 sm:p-8 shadow-2xl space-y-4 max-h-[88vh] overflow-y-auto cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center border-b border-[#E52E33] pb-3">
          <span className="font-mono text-xs uppercase tracking-widest font-bold">
            Convocatoria Abierta — KAMIKAZE
          </span>
          <button onClick={onClose} className="p-1 border border-[#E52E33] hover:bg-[#E52E33] hover:text-[#FFD41D]">
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 bg-[#E52E33] text-[#FFD41D] rounded-full flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <h3 className="brand-title text-2xl font-bold">¡Propuesta Recibida!</h3>
            <p className="text-xs font-mono opacity-90">
              El colectivo revisará tu propuesta en la asamblea de los lunes y nos comunicaremos con vos.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
            <div>
              <h3 className="brand-title text-2xl sm:text-3xl font-normal leading-tight">
                Proponer obra o taller
              </h3>
              <p className="text-xs opacity-90 mt-1 font-sans">
                Buscamos proyectos que dialoguen con la materia, el accidente y la producción colectiva horizontal.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold uppercase mb-1">Nombre & Apellido *</label>
                <input
                  type="text"
                  required
                  placeholder="Tu nombre"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-yellow-400/10 border border-[#E52E33]"
                />
              </div>

              <div>
                <label className="block font-bold uppercase mb-1">Tipo de propuesta *</label>
                <select
                  value={formData.proposalType}
                  onChange={(e) => setFormData({ ...formData, proposalType: e.target.value })}
                  className="w-full px-3 py-2 bg-[#FFD41D] border border-[#E52E33]"
                >
                  <option value="taller">Taller / Curso Formativo</option>
                  <option value="obra">Obra Colectiva / Instalación</option>
                  <option value="publicacion">Fanzine / Publicación</option>
                  <option value="residencia">Residencia de Producción</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold uppercase mb-1">Email de contacto *</label>
                <input
                  type="email"
                  required
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-yellow-400/10 border border-[#E52E33]"
                />
              </div>

              <div>
                <label className="block font-bold uppercase mb-1">Teléfono / WhatsApp</label>
                <input
                  type="tel"
                  placeholder="+54 9 11..."
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-yellow-400/10 border border-[#E52E33]"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold uppercase mb-1">Título del Taller o Proyecto *</label>
              <input
                type="text"
                required
                placeholder="Ej: Laboratorio de tintes naturales y bioplásticos"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 bg-yellow-400/10 border border-[#E52E33]"
              />
            </div>

            <div>
              <label className="block font-bold uppercase mb-1">Descripción de la propuesta & necesidades *</label>
              <textarea
                rows={3}
                required
                placeholder="Contanos sobre la metodología, materiales requeridos y qué te interesa cruzar con KAMIKAZE..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 bg-yellow-400/10 border border-[#E52E33]"
              />
            </div>

            <div>
              <label className="block font-bold uppercase mb-1">Link a portfolio o Instagram (opcional)</label>
              <input
                type="text"
                placeholder="https://..."
                value={formData.portfolio}
                onChange={(e) => setFormData({ ...formData, portfolio: e.target.value })}
                className="w-full px-3 py-2 bg-yellow-400/10 border border-[#E52E33]"
              />
            </div>

            <div className="pt-3 border-t border-[#E52E33] flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-[#E52E33] uppercase"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-brand-inverse px-5 py-2 uppercase font-bold flex items-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Enviar Propuesta</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
