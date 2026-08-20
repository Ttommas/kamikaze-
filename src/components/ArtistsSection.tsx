import React, { useState } from 'react';
import { ARTISTS_DATA } from '../data/initialData';
import { Artist } from '../types';
import { X, Sparkles } from 'lucide-react';

export const ArtistsSection: React.FC = () => {
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);

  return (
    <section id="artistas" className="border-b border-[#E52E33] scroll-mt-16">
      {/* Section Header */}
      <div className="flex justify-between items-baseline px-6 sm:px-12 py-7 border-b border-[#E52E33]">
        <h2 className="text-xs font-normal tracking-[0.2em] uppercase brand-title">
          Quiénes somos — artistas participantes
        </h2>
        <span className="text-xs tracking-[0.16em] uppercase font-mono">
          06 integrantes
        </span>
      </div>

      {/* Horizontal Scroll Gallery matching HTML & Brand Manual Page 5 */}
      <div className="hide-scrollbar flex items-start gap-8 sm:gap-10 overflow-x-auto px-6 sm:px-12 py-12 border-b border-[#E52E33]/30">
        {ARTISTS_DATA.map((artist, idx) => {
          // Differing margin top offsets to create rhythmic layout from original template
          const mtClass = idx === 0 ? 'sm:mt-16' : idx === 1 ? 'sm:mt-0' : idx === 2 ? 'sm:mt-24' : idx === 3 ? 'sm:mt-8' : idx === 4 ? 'sm:mt-20' : 'sm:mt-6';
          const sizeClass = idx === 1 ? 'w-64 h-64 sm:w-72 sm:h-72' : idx === 5 ? 'w-60 h-60 sm:w-68 sm:h-68' : 'w-52 h-52 sm:w-56 sm:h-56';

          return (
            <figure 
              key={artist.id} 
              className={`shrink-0 w-56 sm:w-64 ${mtClass} group cursor-pointer`}
              onClick={() => setSelectedArtist(artist)}
            >
              {/* Photo Box with Texture and Duotone filter */}
              <div className={`relative ${sizeClass} border border-[#E52E33] bg-[#f0c510] overflow-hidden`}>
                <img
                  src={artist.avatarUrl}
                  alt={artist.name}
                  className="w-full h-full object-cover brand-image-duotone group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                
                {/* Brand label */}
                <span className="absolute bottom-2 left-2 text-[10px] font-mono tracking-widest uppercase px-1.5 py-0.5 bg-[#FFD41D] text-[#E52E33] border border-[#E52E33] opacity-90">
                  {artist.portraitLabel}
                </span>
              </div>

              {/* Caption */}
              <figcaption className="flex justify-between items-baseline mt-3 border-t border-[#E52E33]/40 pt-1.5">
                <span className="font-bold text-sm sm:text-base brand-title">{artist.name}</span>
                <span className="text-[11px] font-mono uppercase tracking-wider opacity-85">{artist.discipline}</span>
              </figcaption>
              
              <p className="text-xs opacity-80 mt-1 line-clamp-2 italic">
                "{artist.statement}"
              </p>
            </figure>
          );
        })}
      </div>

      {/* Artist Bio Modal */}
      {selectedArtist && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs">
          <div className="bg-[#FFD41D] text-[#E52E33] border-2 border-[#E52E33] w-full max-w-lg p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="flex justify-between items-start border-b border-[#E52E33] pb-3">
              <div>
                <span className="text-xs font-mono uppercase tracking-widest opacity-80 block">
                  {selectedArtist.discipline} · KAMIKAZE 2026
                </span>
                <h3 className="brand-title text-3xl font-bold mt-1">
                  {selectedArtist.name}
                </h3>
              </div>
              <button onClick={() => setSelectedArtist(null)} className="p-1 border border-[#E52E33]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex gap-4 items-center">
              <img
                src={selectedArtist.avatarUrl}
                alt={selectedArtist.name}
                className="w-24 h-24 object-cover border border-[#E52E33] brand-image-duotone"
                referrerPolicy="no-referrer"
              />
              <div className="italic text-sm sm:text-base border-l-2 border-[#E52E33] pl-3">
                "{selectedArtist.statement}"
              </div>
            </div>

            <div className="text-sm leading-relaxed opacity-95 pt-2">
              <p>{selectedArtist.bio}</p>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                onClick={() => setSelectedArtist(null)}
                className="btn-brand-inverse px-5 py-2 font-mono text-xs uppercase font-bold cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
