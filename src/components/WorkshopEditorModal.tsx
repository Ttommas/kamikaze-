import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Save, Plus, Trash2, Upload, Sparkles, Check, 
  Calendar, Clock, MapPin, User, BookOpen, Layers, 
  CheckCircle2, DollarSign, Image as ImageIcon, Link as LinkIcon,
  HelpCircle, ChevronRight
} from 'lucide-react';
import { Workshop, WorkshopDiscipline, WorkshopModality } from '../types';

const TEACHER_AVATAR_PRESETS = [
  { name: 'Retrato 01', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop' },
  { name: 'Retrato 02', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop' },
  { name: 'Retrato 03', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=600&auto=format&fit=crop' },
  { name: 'Retrato 04', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=600&auto=format&fit=crop' },
  { name: 'Retrato 05', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=600&auto=format&fit=crop' },
  { name: 'Retrato 06', url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=600&auto=format&fit=crop' },
];

interface WorkshopEditorModalProps {
  workshop: Partial<Workshop> | null;
  isOpen: boolean;
  isEditing: boolean;
  onClose: () => void;
  onSave: (workshop: Workshop) => void;
}

export const WorkshopEditorModal: React.FC<WorkshopEditorModalProps> = ({
  workshop,
  isOpen,
  isEditing,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState<Workshop>({
    id: workshop?.id || 'ws-' + Date.now(),
    code: workshop?.code || 'CER-01',
    title: workshop?.title || '',
    subtitle: workshop?.subtitle || '',
    season: workshop?.season || 'Temporada 06',
    discipline: (workshop?.discipline as WorkshopDiscipline) || 'dibujo',
    modality: (workshop?.modality as WorkshopModality) || 'presencial',
    schedule: workshop?.schedule || 'Jueves · 19:00h a 21:30h',
    dates: workshop?.dates || 'Del 06 al 27 de Agosto 2026',
    duration: workshop?.duration || '4 encuentros de 2.5 horas',
    location: workshop?.location || 'Taller Central Kamikaze (Brandsen 2032, Barracas)',
    totalSpots: workshop?.totalSpots || 10,
    availableSpots: workshop?.availableSpots ?? 10,
    regularPrice: workshop?.regularPrice || 24000,
    memberPrice: workshop?.memberPrice || 19000,
    teacherName: workshop?.teacherName || '',
    teacherRole: workshop?.teacherRole || 'Artista visual y docente',
    teacherBio: workshop?.teacherBio || '',
    teacherAvatar: workshop?.teacherAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
    description: workshop?.description || '',
    syllabus: workshop?.syllabus && workshop.syllabus.length > 0 
      ? [...workshop.syllabus] 
      : [
          'Clase 1: El gesto ciego — Exploración matérica inicial',
          'Clase 2: Construcción y deformación guiada',
          'Clase 3: Práctica experimental e intervenciones',
          'Clase 4: Montaje colectivo y balance'
        ],
    materialsIncluded: workshop?.materialsIncluded && workshop.materialsIncluded.length > 0
      ? [...workshop.materialsIncluded]
      : [
          'Arcillas y pastas cerámicas de alta temperatura',
          'Herramientas de desbaste, esponjas y alambres',
          'Horneada de piezas y vitrificación comunitaria'
        ],
    requirements: workshop?.requirements || 'No se requieren conocimientos previos. Traer ropa cómoda de trabajo.',
    active: workshop?.active ?? true,
    featured: workshop?.featured ?? false,
  });

  const [activeTab, setActiveTab] = useState<'general' | 'horarios' | 'docente' | 'academico' | 'aranceles'>('general');
  const [newSyllabusItem, setNewSyllabusItem] = useState('');
  const [newMaterialItem, setNewMaterialItem] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state whenever workshop prop changes
  useEffect(() => {
    if (workshop) {
      setFormData({
        id: workshop.id || 'ws-' + Date.now(),
        code: workshop.code || 'CER-01',
        title: workshop.title || '',
        subtitle: workshop.subtitle || '',
        season: workshop.season || 'Temporada 06',
        discipline: (workshop.discipline as WorkshopDiscipline) || 'dibujo',
        modality: (workshop.modality as WorkshopModality) || 'presencial',
        schedule: workshop.schedule || 'Jueves · 19:00h a 21:30h',
        dates: workshop.dates || 'Del 06 al 27 de Agosto 2026',
        duration: workshop.duration || '4 encuentros de 2.5 horas',
        location: workshop.location || 'Taller Central Kamikaze (Brandsen 2032, Barracas)',
        totalSpots: workshop.totalSpots || 10,
        availableSpots: workshop.availableSpots ?? 10,
        regularPrice: workshop.regularPrice || 24000,
        memberPrice: workshop.memberPrice || 19000,
        teacherName: workshop.teacherName || '',
        teacherRole: workshop.teacherRole || 'Artista visual y docente',
        teacherBio: workshop.teacherBio || '',
        teacherAvatar: workshop.teacherAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
        description: workshop.description || '',
        syllabus: workshop.syllabus && workshop.syllabus.length > 0 
          ? [...workshop.syllabus] 
          : [
              'Clase 1: Exploración matérica inicial',
              'Clase 2: Construcción y deformación',
              'Clase 3: Práctica intensiva',
              'Clase 4: Montaje y balance'
            ],
        materialsIncluded: workshop.materialsIncluded && workshop.materialsIncluded.length > 0
          ? [...workshop.materialsIncluded]
          : ['Materiales de taller incluidos'],
        requirements: workshop.requirements || 'No se requieren conocimientos previos.',
        active: workshop.active ?? true,
        featured: workshop.featured ?? false,
      });
    }
  }, [workshop]);

  // Handle escape key
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

  // Handle file upload for teacher photo
  const handleTeacherPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor seleccioná un archivo de imagen válido (JPG, PNG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setFormData((prev) => ({
          ...prev,
          teacherAvatar: event.target!.result as string,
        }));
      }
    };
    reader.readAsDataURL(file);
  };

  // Syllabus management
  const handleAddSyllabusItem = () => {
    if (!newSyllabusItem.trim()) return;
    setFormData((prev) => ({
      ...prev,
      syllabus: [...prev.syllabus, newSyllabusItem.trim()],
    }));
    setNewSyllabusItem('');
  };

  const handleRemoveSyllabusItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      syllabus: prev.syllabus.filter((_, i) => i !== index),
    }));
  };

  const handleUpdateSyllabusItem = (index: number, text: string) => {
    setFormData((prev) => {
      const next = [...prev.syllabus];
      next[index] = text;
      return { ...prev, syllabus: next };
    });
  };

  // Materials Included management
  const handleAddMaterialItem = () => {
    if (!newMaterialItem.trim()) return;
    setFormData((prev) => ({
      ...prev,
      materialsIncluded: [...prev.materialsIncluded, newMaterialItem.trim()],
    }));
    setNewMaterialItem('');
  };

  const handleRemoveMaterialItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      materialsIncluded: prev.materialsIncluded.filter((_, i) => i !== index),
    }));
  };

  const handleUpdateMaterialItem = (index: number, text: string) => {
    setFormData((prev) => {
      const next = [...prev.materialsIncluded];
      next[index] = text;
      return { ...prev, materialsIncluded: next };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Por favor ingresá el título del taller.');
      return;
    }
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-sm overflow-y-auto cursor-pointer"
      onClick={onClose}
    >
      <div 
        className="bg-[#FFD41D] text-[#E52E33] border-3 border-[#E52E33] w-full max-w-4xl shadow-2xl my-auto overflow-hidden cursor-default flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex justify-between items-center px-5 py-3.5 border-b-2 border-[#E52E33] bg-[#f0c510] shrink-0">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs uppercase font-bold tracking-widest px-2 py-0.5 border border-[#E52E33] bg-[#FFD41D]">
              {isEditing ? 'EDITAR TALLER' : 'CREAR NUEVO TALLER'}
            </span>
            <span className="font-mono text-xs opacity-90 hidden sm:inline">
              {formData.code} · {formData.title || 'Sin título aún'}
            </span>
          </div>
          <button 
            onClick={onClose} 
            className="p-1 border border-[#E52E33] hover:bg-[#E52E33] hover:text-[#FFD41D] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#E52E33] bg-[#f0c510]/60 overflow-x-auto text-xs font-mono shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`px-4 py-2.5 font-bold uppercase tracking-wider border-r border-[#E52E33] whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'general' ? 'bg-[#FFD41D] border-b-2 border-b-[#FFD41D] text-[#E52E33]' : 'opacity-70 hover:opacity-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>1. General</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('horarios')}
            className={`px-4 py-2.5 font-bold uppercase tracking-wider border-r border-[#E52E33] whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'horarios' ? 'bg-[#FFD41D] border-b-2 border-b-[#FFD41D] text-[#E52E33]' : 'opacity-70 hover:opacity-100'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>2. Horarios & Sede</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('docente')}
            className={`px-4 py-2.5 font-bold uppercase tracking-wider border-r border-[#E52E33] whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'docente' ? 'bg-[#FFD41D] border-b-2 border-b-[#FFD41D] text-[#E52E33]' : 'opacity-70 hover:opacity-100'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>3. Docente / Tutoría</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('academico')}
            className={`px-4 py-2.5 font-bold uppercase tracking-wider border-r border-[#E52E33] whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'academico' ? 'bg-[#FFD41D] border-b-2 border-b-[#FFD41D] text-[#E52E33]' : 'opacity-70 hover:opacity-100'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>4. Saber Más (Syllabus)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('aranceles')}
            className={`px-4 py-2.5 font-bold uppercase tracking-wider whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'aranceles' ? 'bg-[#FFD41D] border-b-2 border-b-[#FFD41D] text-[#E52E33]' : 'opacity-70 hover:opacity-100'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>5. Aranceles & Cupos</span>
          </button>
        </div>

        {/* Form Body (Scrollable) */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-7 overflow-y-auto space-y-6 flex-1 font-mono text-xs">
          
          {/* TAB 1: GENERAL */}
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div className="p-3 border border-[#E52E33] bg-[#f0c510] flex justify-between items-center text-xs">
                <span className="font-bold uppercase tracking-wider">Identificación y Portada</span>
                <span className="opacity-75">Configuración principal visible en la grilla</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold uppercase mb-1">Código del Taller *</label>
                  <input
                    type="text"
                    required
                    placeholder="DIB-01"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 bg-[#f0c510] border border-[#E52E33] font-bold"
                  />
                  <span className="text-[10px] opacity-75">Ej: DIB-01, CER-02, TEX-01</span>
                </div>

                <div>
                  <label className="block font-bold uppercase mb-1">Temporada *</label>
                  <input
                    type="text"
                    required
                    placeholder="Temporada 06"
                    value={formData.season}
                    onChange={(e) => setFormData({ ...formData, season: e.target.value })}
                    className="w-full px-3 py-2 bg-[#f0c510] border border-[#E52E33]"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase mb-1">Disciplina *</label>
                  <select
                    value={formData.discipline}
                    onChange={(e) => setFormData({ ...formData, discipline: e.target.value as WorkshopDiscipline })}
                    className="w-full px-3 py-2 bg-[#f0c510] border border-[#E52E33] font-bold"
                  >
                    <option value="dibujo">Dibujo</option>
                    <option value="ceramica">Cerámica</option>
                    <option value="escritura">Escritura</option>
                    <option value="textil">Textil</option>
                    <option value="sonido">Sonido</option>
                    <option value="fotografia">Fotografía</option>
                    <option value="escultura">Escultura</option>
                    <option value="otra">Otra disciplina</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase mb-1">Título del Taller *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Laboratorio de tintas botánicas y soportes orgánicos"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2.5 bg-[#f0c510] border border-[#E52E33] font-bold text-sm"
                />
              </div>

              <div>
                <label className="block font-bold uppercase mb-1">Subtítulo / Concepto *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Extracción de pigmentos silvestres, mordientes y fijación en lienzo crudo"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="w-full px-3 py-2 bg-[#f0c510] border border-[#E52E33]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block font-bold uppercase mb-1">Modalidad de Cursada *</label>
                  <select
                    value={formData.modality}
                    onChange={(e) => setFormData({ ...formData, modality: e.target.value as WorkshopModality })}
                    className="w-full px-3 py-2 bg-[#f0c510] border border-[#E52E33]"
                  >
                    <option value="presencial">Presencial en Taller</option>
                    <option value="hibrido">Híbrido (Presencial + Streaming)</option>
                    <option value="virtual">Virtual / A distancia</option>
                    <option value="intensivo">Intensivo de Fin de Semana</option>
                  </select>
                </div>

                <div className="flex items-center gap-6 pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="w-4 h-4 accent-[#E52E33]"
                    />
                    <span className="font-bold uppercase">Taller Activo (Visible en web)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="w-4 h-4 accent-[#E52E33]"
                    />
                    <span className="font-bold uppercase">Destacado</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: HORARIOS & SEDE */}
          {activeTab === 'horarios' && (
            <div className="space-y-4">
              <div className="p-3 border border-[#E52E33] bg-[#f0c510] flex justify-between items-center text-xs">
                <span className="font-bold uppercase tracking-wider">Cronograma y Ubicación</span>
                <span className="opacity-75">Datos logísticos para lxs participantes</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase mb-1">Días y Horarios *</label>
                  <input
                    type="text"
                    required
                    placeholder="Jueves · 19:00h a 21:30h"
                    value={formData.schedule}
                    onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                    className="w-full px-3 py-2 bg-[#f0c510] border border-[#E52E33]"
                  />
                  <span className="text-[10px] opacity-75">Ej: Sábados · 15:00h a 18:00h</span>
                </div>

                <div>
                  <label className="block font-bold uppercase mb-1">Fechas del Ciclo *</label>
                  <input
                    type="text"
                    required
                    placeholder="Del 06 al 27 de Agosto 2026 (4 encuentros)"
                    value={formData.dates}
                    onChange={(e) => setFormData({ ...formData, dates: e.target.value })}
                    className="w-full px-3 py-2 bg-[#f0c510] border border-[#E52E33]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase mb-1">Duración Total *</label>
                  <input
                    type="text"
                    required
                    placeholder="4 encuentros de 2.5 horas (10h totales)"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full px-3 py-2 bg-[#f0c510] border border-[#E52E33]"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase mb-1">Ubicación / Sede *</label>
                  <input
                    type="text"
                    required
                    placeholder="Taller Central Kamikaze (Brandsen 2032, Barracas)"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 bg-[#f0c510] border border-[#E52E33]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DOCENTE / TUTORÍA */}
          {activeTab === 'docente' && (
            <div className="space-y-4">
              <div className="p-3 border border-[#E52E33] bg-[#f0c510] flex justify-between items-center text-xs">
                <span className="font-bold uppercase tracking-wider">Perfil del Docente / Tutor</span>
                <span className="opacity-75">Sección que se muestra en el modal "Saber más"</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase mb-1">Nombre y Apellido del Docente *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Lucía Varela"
                    value={formData.teacherName}
                    onChange={(e) => setFormData({ ...formData, teacherName: e.target.value })}
                    className="w-full px-3 py-2 bg-[#f0c510] border border-[#E52E33] font-bold text-sm"
                  />
                </div>

                <div>
                  <label className="block font-bold uppercase mb-1">Rol / Especialidad *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Artista visual, investigadora de tintes y docente"
                    value={formData.teacherRole}
                    onChange={(e) => setFormData({ ...formData, teacherRole: e.target.value })}
                    className="w-full px-3 py-2 bg-[#f0c510] border border-[#E52E33]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase mb-1">Biografía y Trayectoria del Docente (Saber más) *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Egresada de Bellas Artes, realiza clínica con artistas contemporáneos y coordina el laboratorio de experimentación gráfica..."
                  value={formData.teacherBio}
                  onChange={(e) => setFormData({ ...formData, teacherBio: e.target.value })}
                  className="w-full px-3 py-2 bg-[#f0c510] border border-[#E52E33] font-mono text-xs leading-relaxed"
                />
              </div>

              {/* Teacher Avatar Section */}
              <div className="p-4 border border-[#E52E33] bg-[#f0c510] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold uppercase tracking-wider">Foto de Perfil del Docente</span>
                  <span className="text-[11px] opacity-80">Subí una foto o elegí un retrato preset</span>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-20 h-20 border-2 border-[#E52E33] bg-[#FFD41D] shrink-0 overflow-hidden relative shadow">
                    <img 
                      src={formData.teacherAvatar} 
                      alt="Docente preview" 
                      className="w-full h-full object-cover brand-image-duotone"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  <div className="space-y-2 flex-1 w-full">
                    <div className="flex gap-2">
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/..."
                        value={formData.teacherAvatar}
                        onChange={(e) => setFormData({ ...formData, teacherAvatar: e.target.value })}
                        className="flex-1 px-3 py-1.5 bg-[#FFD41D] border border-[#E52E33] text-xs font-mono"
                      />

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="btn-brand-inverse px-3 py-1.5 uppercase font-bold text-[11px] flex items-center gap-1.5 shrink-0 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Subir Foto</span>
                      </button>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleTeacherPhotoUpload}
                        className="hidden"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 overflow-x-auto pt-1">
                      <span className="text-[10px] uppercase font-bold opacity-75 shrink-0">Presets:</span>
                      {TEACHER_AVATAR_PRESETS.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setFormData({ ...formData, teacherAvatar: preset.url })}
                          className={`w-7 h-7 border border-[#E52E33] overflow-hidden shrink-0 ${
                            formData.teacherAvatar === preset.url ? 'ring-2 ring-[#E52E33]' : 'opacity-70 hover:opacity-100'
                          }`}
                          title={preset.name}
                        >
                          <img src={preset.url} alt={preset.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SABER MÁS (ACADÉMICO / SYLLABUS / MATERIALES / REQUISITOS) */}
          {activeTab === 'academico' && (
            <div className="space-y-6">
              <div className="p-3 border border-[#E52E33] bg-[#f0c510] flex justify-between items-center text-xs">
                <span className="font-bold uppercase tracking-wider">Variables del Modal "Saber Más"</span>
                <span className="opacity-75">Fundamentación, Programa de Encuentros, Materiales y Requisitos</span>
              </div>

              {/* 01. Fundamentación & Enfoque */}
              <div>
                <label className="block font-bold uppercase mb-1">
                  01. Fundamentación & Enfoque Teórico-Práctico (Descripción Completa) *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describí el enfoque pedagógico, los conceptos rectores del taller, la relación con el error y el soporte..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-[#f0c510] border border-[#E52E33] font-mono text-xs leading-relaxed"
                />
              </div>

              {/* 02. Programa de Encuentros (Syllabus) */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block font-bold uppercase">
                    02. Programa de Encuentros (Syllabus - {formData.syllabus.length} clases) *
                  </label>
                  <span className="text-[10px] opacity-75">Podés editar, agregar o quitar clases</span>
                </div>

                <div className="space-y-2">
                  {formData.syllabus.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="w-7 h-7 bg-[#E52E33] text-[#FFD41D] font-bold flex items-center justify-center text-xs shrink-0">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => handleUpdateSyllabusItem(index, e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-[#f0c510] border border-[#E52E33] font-mono text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveSyllabusItem(index)}
                        disabled={formData.syllabus.length <= 1}
                        className="p-1.5 border border-[#E52E33] hover:bg-[#E52E33] hover:text-[#FFD41D] disabled:opacity-30 cursor-pointer"
                        title="Eliminar clase"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add syllabus item input */}
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Ej: Clase 5: Montaje escenográfico y publicación comunitaria..."
                    value={newSyllabusItem}
                    onChange={(e) => setNewSyllabusItem(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSyllabusItem();
                      }
                    }}
                    className="flex-1 px-3 py-1.5 bg-[#FFD41D] border border-[#E52E33] text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleAddSyllabusItem}
                    className="btn-brand-inverse px-3 py-1.5 uppercase font-bold text-xs flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Agregar Clase</span>
                  </button>
                </div>
              </div>

              {/* 03. Materiales Incluidos */}
              <div className="space-y-2 pt-2 border-t border-[#E52E33]/40">
                <div className="flex justify-between items-center">
                  <label className="block font-bold uppercase">
                    03. Materiales Incluidos provistos por KAMIKAZE ({formData.materialsIncluded.length} items) *
                  </label>
                  <span className="text-[10px] opacity-75">Insumos que aporta el colectivo</span>
                </div>

                <div className="space-y-2">
                  {formData.materialsIncluded.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#E52E33] shrink-0" />
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => handleUpdateMaterialItem(index, e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-[#f0c510] border border-[#E52E33] font-mono text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveMaterialItem(index)}
                        disabled={formData.materialsIncluded.length <= 1}
                        className="p-1.5 border border-[#E52E33] hover:bg-[#E52E33] hover:text-[#FFD41D] disabled:opacity-30 cursor-pointer"
                        title="Eliminar material"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add material item input */}
                <div className="flex gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Ej: Papeles de algodón 300g, carbonillas prensadas y fijador..."
                    value={newMaterialItem}
                    onChange={(e) => setNewMaterialItem(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddMaterialItem();
                      }
                    }}
                    className="flex-1 px-3 py-1.5 bg-[#FFD41D] border border-[#E52E33] text-xs font-mono"
                  />
                  <button
                    type="button"
                    onClick={handleAddMaterialItem}
                    className="btn-brand-inverse px-3 py-1.5 uppercase font-bold text-xs flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Agregar Material</span>
                  </button>
                </div>
              </div>

              {/* 04. Requisitos / Qué traer */}
              <div className="pt-2 border-t border-[#E52E33]/40">
                <label className="block font-bold uppercase mb-1">
                  04. Requisitos del Alumno / Qué traer al taller *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="No se requieren conocimientos previos. Traer cuaderno de apuntes personal y ropa que pueda mancharse..."
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  className="w-full px-3 py-2 bg-[#f0c510] border border-[#E52E33] font-mono text-xs leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* TAB 5: ARANCELES & CUPOS */}
          {activeTab === 'aranceles' && (
            <div className="space-y-4">
              <div className="p-3 border border-[#E52E33] bg-[#f0c510] flex justify-between items-center text-xs">
                <span className="font-bold uppercase tracking-wider">Economía y Vacantes del Taller</span>
                <span className="opacity-75">Valores y disponibilidad de cupos</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold uppercase mb-1">Arancel Regular ($ ARS) *</label>
                  <input
                    type="number"
                    min={0}
                    step={500}
                    required
                    value={formData.regularPrice}
                    onChange={(e) => setFormData({ ...formData, regularPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#f0c510] border border-[#E52E33] font-bold text-sm"
                  />
                  <span className="text-[10px] opacity-75">Precio para público general</span>
                </div>

                <div>
                  <label className="block font-bold uppercase mb-1">Arancel Socix Kamikaze ($ ARS) *</label>
                  <input
                    type="number"
                    min={0}
                    step={500}
                    required
                    value={formData.memberPrice}
                    onChange={(e) => setFormData({ ...formData, memberPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#f0c510] border border-[#E52E33] font-bold text-sm"
                  />
                  <span className="text-[10px] opacity-75">Precio bonificado para socixs mensuales</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block font-bold uppercase mb-1">Cupos Totales del Taller *</label>
                  <input
                    type="number"
                    min={1}
                    max={100}
                    required
                    value={formData.totalSpots}
                    onChange={(e) => {
                      const total = Number(e.target.value);
                      setFormData({ 
                        ...formData, 
                        totalSpots: total,
                        availableSpots: Math.min(formData.availableSpots, total)
                      });
                    }}
                    className="w-full px-3 py-2 bg-[#f0c510] border border-[#E52E33] font-bold text-sm"
                  />
                  <span className="text-[10px] opacity-75">Capacidad máxima del aula</span>
                </div>

                <div>
                  <label className="block font-bold uppercase mb-1">Vacantes Disponibles Ahora *</label>
                  <input
                    type="number"
                    min={0}
                    max={formData.totalSpots}
                    required
                    value={formData.availableSpots}
                    onChange={(e) => setFormData({ ...formData, availableSpots: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-[#f0c510] border border-[#E52E33] font-bold text-sm"
                  />
                  <span className="text-[10px] opacity-75">Si se pone en 0, figurará "Cupos Agotados"</span>
                </div>
              </div>

              {formData.availableSpots <= 0 && (
                <div className="p-3 border border-red-600 bg-red-100 text-red-800 text-xs font-mono">
                  <strong>Aviso:</strong> Con 0 vacantes disponibles, el taller figurará como <strong>AGOTADO</strong> y no permitirá nuevas inscripciones públicas.
                </div>
              )}
            </div>
          )}

          {/* Modal Footer Controls */}
          <div className="pt-4 border-t-2 border-[#E52E33] flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-mono opacity-80">
              <span>Editando: <strong>{formData.title || 'Nuevo Taller'}</strong></span>
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none px-5 py-2.5 border border-[#E52E33] font-mono text-xs uppercase font-bold hover:bg-[#E52E33]/10 cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="submit"
                className="flex-1 sm:flex-none btn-brand-inverse px-6 py-2.5 font-mono text-xs uppercase font-bold flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Save className="w-4 h-4" />
                <span>{isEditing ? 'Guardar Cambios del Taller' : 'Publicar Nuevo Taller'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
