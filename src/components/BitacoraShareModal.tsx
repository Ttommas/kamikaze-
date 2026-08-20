import React, { useState, useRef, useEffect } from 'react';
import { Share2, Copy, Check, Instagram, Download, Sparkles, X, Smartphone, Globe, ExternalLink } from 'lucide-react';
import { BitacoraEntry } from '../types';

interface BitacoraShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: BitacoraEntry;
}

export const BitacoraShareModal: React.FC<BitacoraShareModalProps> = ({
  isOpen,
  onClose,
  entry,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedQuote, setCopiedQuote] = useState(false);
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const [generatedStoryUrl, setGeneratedStoryUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'link' | 'instagram'>('instagram');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}${window.location.pathname}#bitacora-${entry.id}`
    : `https://colectivokamikaze.art#bitacora-${entry.id}`;

  const storyQuoteText = `«${entry.excerpt}» — ${entry.title} | Bitácora Kamikaze (${entry.week})`;

  // Generate Instagram Story Image (1080 x 1920 px - 9:16 vertical ratio)
  const generateStoryImage = () => {
    setIsGeneratingStory(true);
    const canvas = document.createElement('canvas');
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      setIsGeneratingStory(false);
      return;
    }

    // 1. Background Fill (#FFD41D)
    ctx.fillStyle = '#FFD41D';
    ctx.fillRect(0, 0, 1080, 1920);

    // 2. Texture Hatching in background (Kamikaze diagonal stripes)
    ctx.strokeStyle = '#e3b80e';
    ctx.lineWidth = 3;
    for (let x = -1920; x < 1080 + 1920; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + 1920, 1920);
      ctx.stroke();
    }

    // 3. Thick Outer Border (#E52E33)
    ctx.strokeStyle = '#E52E33';
    ctx.lineWidth = 24;
    ctx.strokeRect(36, 36, 1080 - 72, 1920 - 72);

    // Inner subtle border
    ctx.lineWidth = 4;
    ctx.strokeRect(60, 60, 1080 - 120, 1920 - 120);

    // 4. Header Bar
    ctx.fillStyle = '#E52E33';
    ctx.fillRect(60, 60, 1080 - 120, 160);

    // Header Text
    ctx.fillStyle = '#FFD41D';
    ctx.font = 'bold 38px "Space Mono", monospace, sans-serif';
    ctx.fillText('K · A · M · I · K · A · Z · E', 100, 140);
    
    ctx.font = '24px monospace';
    ctx.fillText('COLECTIVO ARTÍSTICO · 2026', 100, 185);

    // Tag right
    ctx.textAlign = 'right';
    ctx.font = 'bold 28px monospace';
    ctx.fillText('BITÁCORA', 1080 - 100, 140);
    ctx.font = '22px monospace';
    ctx.fillText(entry.week.toUpperCase(), 1080 - 100, 180);
    ctx.textAlign = 'left';

    // 5. Category / Date badge
    ctx.fillStyle = '#E52E33';
    ctx.font = 'bold 30px monospace';
    ctx.fillText(`[ ${entry.dates.toUpperCase()} · ${entry.tags.join(' / ').toUpperCase()} ]`, 100, 310);

    // 6. Article Title (Multi-line wrap)
    ctx.fillStyle = '#E52E33';
    ctx.font = '900 68px "Space Mono", monospace, sans-serif';
    
    // Word wrap helper
    const wrapText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
      const words = text.split(' ');
      let line = '';
      let currentY = y;

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
          ctx.fillText(line.toUpperCase(), x, currentY);
          line = words[n] + ' ';
          currentY += lineHeight;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line.toUpperCase(), x, currentY);
      return currentY + lineHeight;
    };

    const titleEndY = wrapText(entry.title, 100, 420, 880, 84);

    // 7. Divider Line
    ctx.strokeStyle = '#E52E33';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(100, titleEndY + 20);
    ctx.lineTo(980, titleEndY + 20);
    ctx.stroke();

    // 8. Callout Box for Excerpt
    const boxY = titleEndY + 60;
    const boxHeight = 560;
    ctx.fillStyle = '#f0c510';
    ctx.fillRect(100, boxY, 880, boxHeight);
    ctx.strokeStyle = '#E52E33';
    ctx.lineWidth = 8;
    ctx.strokeRect(100, boxY, 880, boxHeight);

    // Quote icon mark
    ctx.fillStyle = '#E52E33';
    ctx.font = 'bold 120px serif';
    ctx.fillText('“', 130, boxY + 120);

    // Excerpt text
    ctx.fillStyle = '#E52E33';
    ctx.font = 'italic 500 40px "Arial Narrow", Helvetica, sans-serif';
    
    const excerptWrap = (text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
      const words = text.split(' ');
      let line = '';
      let currentY = y;
      let linesCount = 0;

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && n > 0) {
          ctx.fillText(line, x, currentY);
          line = words[n] + ' ';
          currentY += lineHeight;
          linesCount++;
          if (linesCount >= 6) {
            line = line + '...';
            break;
          }
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, x, currentY);
    };

    excerptWrap(entry.excerpt, 150, boxY + 180, 780, 56);

    // Author inside box
    ctx.font = 'bold 30px monospace';
    ctx.fillText(`— REGISTRO: ${entry.author.toUpperCase()}`, 150, boxY + boxHeight - 50);

    // 9. Manifesto Statement Pill
    const pillY = boxY + boxHeight + 60;
    ctx.fillStyle = '#E52E33';
    ctx.fillRect(100, pillY, 880, 110);
    ctx.fillStyle = '#FFD41D';
    ctx.font = 'bold 32px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('« EL ACCIDENTE COMO MATERIA VIVA Y DESBORDE »', 540, pillY + 68);
    ctx.textAlign = 'left';

    // 10. Footer Section
    ctx.fillStyle = '#E52E33';
    ctx.font = 'bold 36px monospace';
    ctx.fillText('LEÉ LA NOTA COMPLETA EN:', 100, 1720);
    
    ctx.font = '900 44px "Space Mono", monospace, sans-serif';
    ctx.fillText('COLECTIVOKAMIKAZE.ART', 100, 1780);

    // Instagram handle right
    ctx.textAlign = 'right';
    ctx.font = 'bold 34px monospace';
    ctx.fillText('@COLECTIVOKAMIKAZE', 980, 1750);
    ctx.font = '26px monospace';
    ctx.fillText('TALLERES · CERÁMICA · GRÁFICA', 980, 1795);
    ctx.textAlign = 'left';

    // Convert to Data URL
    try {
      const dataUrl = canvas.toDataURL('image/png', 0.95);
      setGeneratedStoryUrl(dataUrl);
    } catch (err) {
      console.error('Error generating canvas:', err);
    } finally {
      setIsGeneratingStory(false);
    }
  };

  useEffect(() => {
    if (isOpen && entry) {
      generateStoryImage();
    }
  }, [isOpen, entry]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyQuote = () => {
    navigator.clipboard.writeText(storyQuoteText);
    setCopiedQuote(true);
    setTimeout(() => setCopiedQuote(false), 2500);
  };

  const handleDownloadStoryImage = () => {
    if (!generatedStoryUrl) return;
    const link = document.createElement('a');
    link.download = `historia-kamikaze-${entry.id}.png`;
    link.href = generatedStoryUrl;
    link.click();
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        if (generatedStoryUrl) {
          // Try sharing file if supported
          const res = await fetch(generatedStoryUrl);
          const blob = await res.blob();
          const file = new File([blob], `kamikaze-${entry.id}.png`, { type: 'image/png' });

          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: entry.title,
              text: storyQuoteText,
              url: shareUrl,
              files: [file],
            });
            return;
          }
        }

        // Fallback to text/url share
        await navigator.share({
          title: `Kamikaze Bitácora: ${entry.title}`,
          text: storyQuoteText,
          url: shareUrl,
        });
      } catch (err) {
        console.log('Share dismissed or error:', err);
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[110] flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-sm cursor-pointer"
      onClick={onClose}
    >
      <div 
        className="bg-[#FFD41D] text-[#E52E33] border-3 border-[#E52E33] w-full max-w-2xl shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto cursor-default p-5 sm:p-7"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center border-b-2 border-[#E52E33] pb-3">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            <h3 className="brand-title text-xl font-bold uppercase">
              Compartir Entrada de Bitácora
            </h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 border border-[#E52E33] hover:bg-[#E52E33] hover:text-[#FFD41D] transition-colors cursor-pointer"
            title="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Note Summary */}
        <div className="p-3 bg-[#f0c510] border border-[#E52E33] font-mono text-xs space-y-1">
          <div className="flex justify-between items-center opacity-80 text-[10px] font-bold uppercase">
            <span>{entry.week} · {entry.dates}</span>
            <span>{entry.author}</span>
          </div>
          <p className="font-bold text-sm leading-tight uppercase font-sans">
            {entry.title}
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b-2 border-[#E52E33] font-mono text-xs font-bold">
          <button
            onClick={() => setActiveTab('instagram')}
            className={`flex-1 py-2.5 flex items-center justify-center gap-2 cursor-pointer transition-colors ${
              activeTab === 'instagram'
                ? 'bg-[#E52E33] text-[#FFD41D]'
                : 'bg-[#FFD41D] text-[#E52E33] hover:bg-[#f0c510]'
            }`}
          >
            <Instagram className="w-4 h-4" />
            <span>Historias de Instagram (9:16)</span>
          </button>
          <button
            onClick={() => setActiveTab('link')}
            className={`flex-1 py-2.5 flex items-center justify-center gap-2 cursor-pointer transition-colors ${
              activeTab === 'link'
                ? 'bg-[#E52E33] text-[#FFD41D]'
                : 'bg-[#FFD41D] text-[#E52E33] hover:bg-[#f0c510]'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Enlace Web & Redes</span>
          </button>
        </div>

        {/* TAB 1: INSTAGRAM STORY GENERATOR */}
        {activeTab === 'instagram' && (
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              {/* Story Visual Preview */}
              <div className="flex flex-col items-center space-y-2">
                <span className="font-mono text-[10px] uppercase font-bold tracking-wider opacity-85">
                  Previsualización Placa Instagram (1080x1920)
                </span>
                
                <div className="relative w-44 aspect-9/16 border-2 border-[#E52E33] bg-black shadow-xl overflow-hidden rounded-sm group">
                  {generatedStoryUrl ? (
                    <img 
                      src={generatedStoryUrl} 
                      alt="Historia Kamikaze" 
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-mono text-white p-4 text-center">
                      Generando placa...
                    </div>
                  )}
                </div>
              </div>

              {/* Story Actions */}
              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 bg-[#f0c510] border border-[#E52E33] space-y-2">
                  <div className="flex items-center gap-1.5 font-bold uppercase text-[11px]">
                    <Sparkles className="w-4 h-4 text-[#E52E33]" />
                    <span>Placa Gráfica Lista para Subir</span>
                  </div>
                  <p className="text-[11px] opacity-85 leading-relaxed">
                    Diseñada en proporción vertical exacta 9:16 con la identidad gráfica del colectivo.
                  </p>
                </div>

                <button
                  onClick={handleDownloadStoryImage}
                  disabled={!generatedStoryUrl}
                  className="btn-brand-inverse w-full py-3 uppercase font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar Imagen para Historias</span>
                </button>

                {typeof navigator !== 'undefined' && 'share' in navigator && (
                  <button
                    onClick={handleNativeShare}
                    className="btn-brand w-full py-2.5 uppercase font-bold text-xs flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Abrir Menú de Compartir / Apps</span>
                  </button>
                )}

                <button
                  onClick={handleCopyQuote}
                  className="w-full py-2 border border-[#E52E33] bg-[#FFD41D] hover:bg-[#E52E33] hover:text-[#FFD41D] transition-colors uppercase font-bold text-[11px] flex items-center justify-center gap-2 cursor-pointer"
                >
                  {copiedQuote ? <Check className="w-3.5 h-3.5 text-green-700" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedQuote ? '¡Texto Copiado!' : 'Copiar Texto para Pie de Historia'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DIRECT LINK & WEB SHARE */}
        {activeTab === 'link' && (
          <div className="space-y-4 pt-2 font-mono text-xs">
            <div>
              <label className="block font-bold uppercase mb-1">Enlace Directo a esta Nota</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="w-full px-3 py-2 bg-[#f0c510] border border-[#E52E33] font-bold text-xs select-all"
                />
                <button
                  onClick={handleCopyLink}
                  className="btn-brand-inverse px-4 py-2 uppercase font-bold flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-green-300" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedLink ? '¡Copiado!' : 'Copiar'}</span>
                </button>
              </div>
            </div>

            <div className="p-3 bg-[#f0c510] border border-[#E52E33] space-y-2">
              <span className="font-bold uppercase text-[11px] block">Compartir en Redes Sociales</span>
              <div className="flex flex-wrap gap-2 pt-1">
                {/* WhatsApp */}
                <a
                  href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Bitácora Kamikaze: ${entry.title}\n\n«${entry.excerpt}»\n\nLeé la nota completa acá: ${shareUrl}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-brand px-3 py-1.5 uppercase font-bold text-[11px] flex items-center gap-1.5"
                >
                  <span>WhatsApp</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                {/* Twitter / X */}
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`«${entry.title}» — Bitácora Colectivo Kamikaze`)}&url=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-brand px-3 py-1.5 uppercase font-bold text-[11px] flex items-center gap-1.5"
                >
                  <span>Twitter / X</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                {/* Telegram */}
                <a
                  href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(`Bitácora Kamikaze: ${entry.title}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-brand px-3 py-1.5 uppercase font-bold text-[11px] flex items-center gap-1.5"
                >
                  <span>Telegram</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="pt-3 border-t-2 border-[#E52E33] flex justify-between items-center font-mono text-xs">
          <span className="opacity-75">kamikaze.colectivo · Temporada 2026</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 border border-[#E52E33] uppercase font-bold hover:bg-[#E52E33] hover:text-[#FFD41D] transition-colors cursor-pointer"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
};
