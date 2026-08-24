import React, { useState, useEffect } from 'react';
import { Play, FileText, X, Clock, User, ArrowRight, Video, Youtube, ExternalLink, Share2, Instagram, Copy, Check } from 'lucide-react';
import { BITACORA_DATA, INITIAL_BITACORA_VIDEO } from '../data/initialData';
import { BitacoraEntry, BitacoraVideoConfig } from '../types';
import { extractYouTubeId, getYouTubeEmbedUrl, getYouTubeThumbnailUrl } from '../utils/youtube';
import { BitacoraShareModal } from './BitacoraShareModal';

interface BitacoraSectionProps {
  entries?: BitacoraEntry[];
  videoConfig?: BitacoraVideoConfig;
}

export const BitacoraSection: React.FC<BitacoraSectionProps> = ({
  entries = BITACORA_DATA,
  videoConfig = INITIAL_BITACORA_VIDEO,
}) => {
  const [selectedNote, setSelectedNote] = useState<BitacoraEntry | null>(null);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [sharingEntry, setSharingEntry] = useState<BitacoraEntry | null>(null);
  const [copiedLinkNoteId, setCopiedLinkNoteId] = useState<string | null>(null);

  const youtubeId = extractYouTubeId(videoConfig.youtubeUrl) || videoConfig.embedId || 'ScMzIvxBSi4';
  const embedUrl = getYouTubeEmbedUrl(youtubeId, true);
  const thumbnailUrl = getYouTubeThumbnailUrl(youtubeId, 'hq');

  const handleCopyLink = (entry: BitacoraEntry) => {
    const url = typeof window !== 'undefined' 
      ? `${window.location.origin}${window.location.pathname}#bitacora-${entry.id}`
      : `https://colectivokamikaze.art#bitacora-${entry.id}`;
    navigator.clipboard.writeText(url);
    setCopiedLinkNoteId(entry.id);
    setTimeout(() => setCopiedLinkNoteId(null), 2500);
  };

  // Close modals on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (sharingEntry) setSharingEntry(null);
        else if (isPlayingVideo) setIsPlayingVideo(false);
        else if (selectedNote) setSelectedNote(null);
      }
    };

    if (isPlayingVideo || selectedNote || sharingEntry) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPlayingVideo, selectedNote, sharingEntry]);

  return (
    <section id="bitacora" className="border-b border-[#E52E33] scroll-mt-16">
      {/* Section Top Header */}
      <div className="flex justify-between items-baseline px-6 sm:px-12 py-7 border-b border-[#E52E33]">
        <h2 className="text-xs font-normal tracking-[0.2em] uppercase brand-title">
          Bitácora — Registro vivo
        </h2>
      </div>

      {/* Bitacora Grid: 1. Escritos | 2. Audiovisual */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] divide-y lg:divide-y-0 lg:divide-x divide-[#E52E33]">
        
        {/* 1. Notas Semanales (Escrito) */}
        <div className="p-6 sm:p-12 space-y-8">
          <div className="text-xs font-mono uppercase tracking-[0.16em] opacity-80 pb-2 border-b border-[#E52E33]/30">
            01. Notas semanales
          </div>

          <div className="space-y-8">
            {entries.map((entry) => (
              <div 
                key={entry.id}
                className="group border-b border-[#E52E33]/30 pb-6 last:border-b-0"
              >
                <div className="flex items-center justify-between text-xs font-mono tracking-wider opacity-80 mb-2">
                  <span>{entry.week} · {entry.dates}</span>
                  <span className="text-[10px] uppercase border border-[#E52E33] px-1">
                    {entry.tags.join(' / ')}
                  </span>
                </div>

                <h3 
                  className="brand-title text-2xl font-normal leading-tight my-2 group-hover:underline cursor-pointer"
                  onClick={() => setSelectedNote(entry)}
                >
                  {entry.title}
                </h3>

                <p className="text-sm leading-relaxed opacity-90 my-2">
                  {entry.excerpt}
                </p>

                <div className="flex items-center justify-between pt-2 text-xs font-mono">
                  <span className="opacity-70">Registro: {entry.author}</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSharingEntry(entry)}
                      className="opacity-70 hover:opacity-100 flex items-center gap-1 hover:underline cursor-pointer"
                      title="Compartir nota en redes / Instagram"
                    >
                      <Share2 className="w-3 h-3" />
                      <span className="hidden sm:inline">Compartir</span>
                    </button>
                    <button
                      onClick={() => setSelectedNote(entry)}
                      className="lk-brand uppercase tracking-wider underline cursor-pointer font-bold"
                    >
                      Leer nota completa →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2. Bitácora Audiovisual (YouTube Feed) */}
        <div className="p-6 sm:p-12 flex flex-col justify-between bg-[#E52E33]/5 space-y-6">
          <div>
            <div className="flex items-center justify-between text-xs font-mono uppercase tracking-[0.16em] opacity-80 pb-2 border-b border-[#E52E33]/30">
              <span>02. Bitácora audiovisual</span>
              <span className="text-[10px] px-1.5 py-0.5 bg-[#E52E33] text-[#FFD41D]">
                {videoConfig.monthYear}
              </span>
            </div>

            <h3 className="brand-title text-2xl sm:text-3xl font-normal my-4 leading-tight">
              {videoConfig.title}
            </h3>

            <p className="text-sm leading-relaxed opacity-90 mb-6">
              {videoConfig.description}
            </p>
          </div>

          {/* YouTube Video Container with Play Action */}
          <div className="space-y-3">
            <div 
              className="relative w-full h-64 border border-[#E52E33] bg-black overflow-hidden flex items-center justify-center cursor-pointer group shadow-inner"
              onClick={() => setIsPlayingVideo(true)}
            >
              {/* Thumbnail with duotone overlay */}
              <img
                src={thumbnailUrl}
                alt={videoConfig.title}
                className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500 brand-image-duotone"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-[#FFD41D]/30 mix-blend-multiply group-hover:opacity-40 transition-opacity" />

              {/* Central Play Button */}
              <div className="relative z-10 btn-brand px-6 py-3 font-mono text-xs uppercase tracking-wider flex items-center gap-2 font-bold shadow-2xl group-hover:scale-110 transition-transform">
                <Play className="w-4 h-4 fill-current text-[#E52E33]" />
                <span>Ver en Bitácora ▶</span>
              </div>

              {/* YouTube badge */}
              <div className="absolute bottom-2 right-2 z-10 flex items-center gap-1 text-[10px] font-mono tracking-widest uppercase px-2 py-0.5 bg-black/80 text-[#FFD41D] border border-[#E52E33]/60">
                <Youtube className="w-3 h-3 text-red-500 fill-current" />
                <span>{videoConfig.durationText}</span>
              </div>
            </div>

            <div className="flex justify-between items-center text-[11px] font-mono opacity-80">
              <span>Canal de Registro: Kamikaze Colectivo</span>
              <a
                href={videoConfig.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline flex items-center gap-1 hover:opacity-100"
              >
                <span>Abrir en YouTube</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Note Detail Modal */}
      {selectedNote && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs cursor-pointer"
          onClick={() => setSelectedNote(null)}
        >
          <div 
            className="bg-[#FFD41D] text-[#E52E33] border-2 border-[#E52E33] w-full max-w-2xl p-6 sm:p-8 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-[#E52E33] pb-3">
              <span className="font-mono text-xs uppercase tracking-widest font-bold">
                {selectedNote.week} · {selectedNote.dates}
              </span>
              <button 
                onClick={() => setSelectedNote(null)} 
                className="flex items-center gap-1 px-2 py-1 border border-[#E52E33] hover:bg-[#E52E33] hover:text-[#FFD41D] transition-colors font-mono text-xs uppercase cursor-pointer"
                title="Cerrar (Esc)"
              >
                <span className="text-[10px] font-bold">ESC</span>
                <X className="w-4 h-4" />
              </button>
            </div>

            <h3 className="brand-title text-3xl font-normal leading-tight">
              {selectedNote.title}
            </h3>

            <div className="text-xs font-mono opacity-80">
              Registrado por: <strong>{selectedNote.author}</strong> · Etiquetas: {selectedNote.tags.join(', ')}
            </div>

            <div className="text-sm sm:text-base leading-relaxed space-y-4 pt-2 border-t border-[#E52E33]/30">
              <p>{selectedNote.fullText}</p>
            </div>

            {/* Bottom Action Toolbar (Sharing options: Instagram Story + Link Copy) */}
            <div className="pt-4 border-t-2 border-[#E52E33] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {/* 1. Instagram Story Card Generation */}
                <button
                  onClick={() => setSharingEntry(selectedNote)}
                  className="btn-brand-inverse px-3.5 py-2 font-mono text-xs uppercase font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  title="Generar y descargar placa vertical para Historias de Instagram (9:16)"
                >
                  <Instagram className="w-4 h-4 text-[#FFD41D]" />
                  <span>Historia Instagram (9:16)</span>
                </button>

                {/* 2. Direct Link Copy */}
                <button
                  onClick={() => handleCopyLink(selectedNote)}
                  className="btn-brand px-3.5 py-2 font-mono text-xs uppercase font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Copiar enlace directo a esta nota"
                >
                  {copiedLinkNoteId === selectedNote.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-700" />
                      <span>¡Link Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Link</span>
                    </>
                  )}
                </button>
              </div>

              {/* 3. Full Share Dialog */}
              <button
                onClick={() => setSharingEntry(selectedNote)}
                className="lk-brand uppercase font-mono text-xs font-bold underline flex items-center justify-center gap-1 cursor-pointer py-1"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Más opciones de difusión →</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share / Instagram Story Generator Modal */}
      {sharingEntry && (
        <BitacoraShareModal
          isOpen={Boolean(sharingEntry)}
          onClose={() => setSharingEntry(null)}
          entry={sharingEntry}
        />
      )}

      {/* Real YouTube Video Modal */}
      {isPlayingVideo && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md cursor-pointer animate-fade-in"
          onClick={() => setIsPlayingVideo(false)}
        >
          <div 
            className="relative bg-[#FFD41D] text-[#E52E33] border-2 border-[#E52E33] w-full max-w-4xl p-4 sm:p-6 shadow-2xl space-y-4 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with Title and Prominent Close Button */}
            <div className="flex justify-between items-center border-b border-[#E52E33] pb-3">
              <div className="flex items-center gap-2 pr-2 overflow-hidden">
                <Youtube className="w-5 h-5 text-red-600 fill-current shrink-0" />
                <span className="font-mono text-xs sm:text-sm uppercase font-bold tracking-wider truncate">
                  {videoConfig.title} ({videoConfig.monthYear})
                </span>
              </div>
              <button 
                onClick={() => setIsPlayingVideo(false)} 
                className="flex items-center gap-1.5 px-2.5 py-1 border-2 border-[#E52E33] bg-[#f0c510] hover:bg-[#E52E33] hover:text-[#FFD41D] transition-colors font-mono text-xs uppercase font-bold cursor-pointer shadow-xs shrink-0"
                title="Cerrar video (Presionar ESC o clic afuera)"
              >
                <span className="hidden sm:inline text-[10px]">ESC</span>
                <X className="w-5 h-5 stroke-[2.5]" />
                <span className="sm:hidden text-xs">Cerrar</span>
              </button>
            </div>

            {/* Embedded Responsive YouTube Iframe */}
            <div className="relative w-full aspect-video bg-black border-2 border-[#E52E33] shadow-inner">
              <iframe
                src={embedUrl}
                title={videoConfig.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>

            {/* Footer with Description and Actions */}
            <div className="flex flex-col sm:flex-row justify-between items-center text-xs font-mono gap-3 pt-1">
              <span className="opacity-90 text-center sm:text-left">{videoConfig.description}</span>
              <div className="flex items-center gap-3 shrink-0">
                <a
                  href={videoConfig.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline flex items-center gap-1 hover:opacity-100 font-bold"
                >
                  <span>Abrir en YouTube</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  onClick={() => setIsPlayingVideo(false)}
                  className="btn-brand-inverse px-4 py-1.5 uppercase font-bold cursor-pointer text-xs"
                >
                  Cerrar [ESC]
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

