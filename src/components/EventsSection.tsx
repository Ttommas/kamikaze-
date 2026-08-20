import React, { useState } from 'react';
import { EVENTS_DATA } from '../data/initialData';
import { EventItem } from '../types';
import { Calendar, Clock, MapPin, Check, X } from 'lucide-react';

interface EventsSectionProps {
  events?: EventItem[];
}

export const EventsSection: React.FC<EventsSectionProps> = ({ events = EVENTS_DATA }) => {
  const [rsvpEvent, setRsvpEvent] = useState<EventItem | null>(null);
  const [rsvpName, setRsvpName] = useState('');
  const [rsvpEmail, setRsvpEmail] = useState('');
  const [rsvpSuccess, setRsvpSuccess] = useState(false);

  const handleRsvpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRsvpSuccess(true);
    setTimeout(() => {
      setRsvpSuccess(false);
      setRsvpEvent(null);
      setRsvpName('');
      setRsvpEmail('');
    }, 2500);
  };

  return (
    <section id="eventos" className="border-b border-[#E52E33] scroll-mt-16">
      <div className="flex justify-between items-baseline px-6 sm:px-12 py-7 border-b border-[#E52E33]">
        <h2 className="text-xs font-normal tracking-[0.2em] uppercase brand-title">
          Próximos eventos & Aperturas
        </h2>
        <span className="text-xs tracking-[0.16em] uppercase font-mono">
          Entrada libre & a la gorra
        </span>
      </div>

      <div className="divide-y divide-[#E52E33]">
        {EVENTS_DATA.map((evt) => (
          <div
            key={evt.id}
            onClick={() => setRsvpEvent(evt)}
            className="brand-row flex flex-col sm:flex-row justify-between sm:items-baseline px-6 sm:px-12 py-5 sm:py-6 cursor-pointer group gap-2"
          >
            <div>
              <span className="text-xl sm:text-2xl font-bold group-hover:underline brand-title block">
                {evt.title}
              </span>
              <span className="text-xs opacity-80 mt-1 block">
                {evt.description}
              </span>
            </div>

            <div className="flex items-center gap-4 shrink-0 font-mono text-xs">
              <span className="tracking-widest font-bold">{evt.date}</span>
              <span className="opacity-70">Anotarme →</span>
            </div>
          </div>
        ))}
      </div>

      {/* RSVP Modal */}
      {rsvpEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs">
          <div className="bg-[#FFD41D] text-[#E52E33] border-2 border-[#E52E33] w-full max-w-md p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-[#E52E33] pb-3">
              <span className="font-mono text-xs uppercase tracking-widest font-bold">
                Anotarse a Evento
              </span>
              <button onClick={() => setRsvpEvent(null)} className="p-1 border border-[#E52E33]">
                <X className="w-4 h-4" />
              </button>
            </div>

            {rsvpSuccess ? (
              <div className="p-6 text-center space-y-2">
                <Check className="w-10 h-10 mx-auto text-[#E52E33]" />
                <h3 className="brand-title text-xl font-bold">¡Te esperamos en el evento!</h3>
                <p className="text-xs opacity-85 font-mono">Te enviamos el recordatorio a tu correo.</p>
              </div>
            ) : (
              <form onSubmit={handleRsvpSubmit} className="space-y-4 text-xs font-mono">
                <div>
                  <h3 className="brand-title text-2xl font-bold leading-tight">{rsvpEvent.title}</h3>
                  <div className="flex items-center gap-2 mt-2 opacity-85">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{rsvpEvent.fullDate}</span>
                  </div>
                  <div className="flex items-center gap-2 opacity-85 mt-0.5">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{rsvpEvent.location}</span>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block font-bold uppercase mb-1">Tu Nombre *</label>
                    <input
                      type="text"
                      required
                      placeholder="Nombre y Apellido"
                      value={rsvpName}
                      onChange={(e) => setRsvpName(e.target.value)}
                      className="w-full px-3 py-2 bg-yellow-400/10 border border-[#E52E33]"
                    />
                  </div>
                  <div>
                    <label className="block font-bold uppercase mb-1">Email *</label>
                    <input
                      type="email"
                      required
                      placeholder="correo@ejemplo.com"
                      value={rsvpEmail}
                      onChange={(e) => setRsvpEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-yellow-400/10 border border-[#E52E33]"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="submit"
                    className="btn-brand-inverse px-5 py-2 uppercase font-bold cursor-pointer"
                  >
                    Confirmar Asistencia
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
