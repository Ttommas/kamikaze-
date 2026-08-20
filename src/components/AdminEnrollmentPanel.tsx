import React, { useState, useEffect, useRef } from 'react';
import { 
  X, ShieldCheck, CheckCircle2, Clock, AlertCircle, 
  Trash2, Download, Search, Filter, Plus, Edit2, 
  Save, RefreshCw, Key, UserCheck, CreditCard, 
  FileText, ExternalLink, QrCode, Lock, LogOut, 
  Youtube, Video, Sparkles, Check, AlertTriangle, Calendar,
  Users, User, Image as ImageIcon, Upload, Camera, Link as LinkIcon
} from 'lucide-react';
import { 
  Workshop, Enrollment, WalletConfig, PaymentStatus, 
  BitacoraVideoConfig, BitacoraEntry, EventItem, Artist,
  WorkshopDiscipline, WorkshopModality 
} from '../types';
import { extractYouTubeId, getYouTubeThumbnailUrl } from '../utils/youtube';

const ARTIST_PHOTO_PRESETS = [
  { name: 'Retrato 01', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop' },
  { name: 'Retrato 02', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop' },
  { name: 'Retrato 03', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=600&auto=format&fit=crop' },
  { name: 'Retrato 04', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=600&auto=format&fit=crop' },
  { name: 'Retrato 05', url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=600&auto=format&fit=crop' },
  { name: 'Retrato 06', url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?q=80&w=600&auto=format&fit=crop' },
  { name: 'Retrato 07', url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=600&auto=format&fit=crop' },
  { name: 'Retrato 08', url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=600&auto=format&fit=crop' },
  { name: 'Retrato 09', url: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=600&auto=format&fit=crop' },
];

interface AdminEnrollmentPanelProps {
  workshops: Workshop[];
  enrollments: Enrollment[];
  walletConfig: WalletConfig;
  bitacoraVideo: BitacoraVideoConfig;
  bitacoraEntries: BitacoraEntry[];
  events: EventItem[];
  artists: Artist[];
  isOpen: boolean;
  onClose: () => void;
  onUpdateEnrollmentStatus: (enrollmentId: string, newStatus: PaymentStatus) => void;
  onDeleteEnrollment: (enrollmentId: string) => void;
  onSaveWalletConfig: (newConfig: WalletConfig) => void;
  onUpdateWorkshop: (updatedWorkshop: Workshop) => void;
  onAddWorkshop: (newWorkshop: Workshop) => void;
  onDeleteWorkshop: (workshopId: string) => void;
  onSaveBitacoraVideo: (newVideoConfig: BitacoraVideoConfig) => void;
  onSaveBitacoraEntries: (entries: BitacoraEntry[]) => void;
  onSaveEvents: (events: EventItem[]) => void;
  onSaveArtists: (artists: Artist[]) => void;
}

export const AdminEnrollmentPanel: React.FC<AdminEnrollmentPanelProps> = ({
  workshops,
  enrollments,
  walletConfig,
  bitacoraVideo,
  bitacoraEntries,
  events,
  artists,
  isOpen,
  onClose,
  onUpdateEnrollmentStatus,
  onDeleteEnrollment,
  onSaveWalletConfig,
  onUpdateWorkshop,
  onAddWorkshop,
  onDeleteWorkshop,
  onSaveBitacoraVideo,
  onSaveBitacoraEntries,
  onSaveEvents,
  onSaveArtists,
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

  // Authentication State
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(true);
  const [authUsername, setAuthUsername] = useState('colectivokamikaze');
  const [authPassword, setAuthPassword] = useState('kamikaze2026');
  const [authError, setAuthError] = useState('');

  // Active Admin Tab
  const [adminTab, setAdminTab] = useState<'inscripciones' | 'talleres' | 'artistas' | 'bitacora' | 'billetera' | 'eventos'>('inscripciones');

  // Filters for Enrollments
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWorkshopFilter, setSelectedWorkshopFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');
  const [selectedEnrollmentProof, setSelectedEnrollmentProof] = useState<Enrollment | null>(null);

  // Collective Members / Artists State
  const [artistSearchQuery, setArtistSearchQuery] = useState('');
  const [editingArtist, setEditingArtist] = useState<Artist | null>(null);
  const [isCreatingArtist, setIsCreatingArtist] = useState(false);
  const [artistSavedSuccess, setArtistSavedSuccess] = useState(false);
  const [artistFileError, setArtistFileError] = useState('');
  const [newArtistData, setNewArtistData] = useState<Artist>({
    id: 'art-' + Date.now(),
    name: '',
    discipline: 'Dibujo & Artes Visuales',
    bio: '',
    portraitLabel: '[ retrato · 07 ]',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop',
    statement: 'El accidente como materia viva y desborde.',
  });

  // Image Upload helper (supports device file upload to base64 data URI)
  const handleImageFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    onSuccess: (dataUrl: string) => void
  ) => {
    setArtistFileError('');
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setArtistFileError('El archivo debe ser una imagen (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setArtistFileError('La imagen no debe superar los 8MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        onSuccess(event.target.result);
      }
    };
    reader.onerror = () => {
      setArtistFileError('Error al leer el archivo seleccionado.');
    };
    reader.readAsDataURL(file);
  };

  // Artist CRUD Handlers
  const handleSaveArtist = (artistToSave: Artist) => {
    const isExisting = artists.some(a => a.id === artistToSave.id);
    let updatedList: Artist[];
    if (isExisting) {
      updatedList = artists.map(a => a.id === artistToSave.id ? artistToSave : a);
    } else {
      updatedList = [...artists, artistToSave];
    }
    onSaveArtists(updatedList);
    setEditingArtist(null);
    setIsCreatingArtist(false);
    setArtistSavedSuccess(true);
    setTimeout(() => setArtistSavedSuccess(false), 4000);
  };

  const handleDeleteArtist = (artistId: string) => {
    const artistToDelete = artists.find(a => a.id === artistId);
    const confirmMsg = `¿Confirmás que querés eliminar del colectivo a "${artistToDelete?.name || 'este integrante'}"?`;
    if (window.confirm(confirmMsg)) {
      const updatedList = artists.filter(a => a.id !== artistId);
      onSaveArtists(updatedList);
    }
  };

  // Workshop Edit / Create State
  const [editingWorkshop, setEditingWorkshop] = useState<Workshop | null>(null);
  const [isCreatingWorkshop, setIsCreatingWorkshop] = useState(false);
  const [newWorkshopData, setNewWorkshopData] = useState<Partial<Workshop>>({
    code: 'NEW-01',
    title: '',
    subtitle: '',
    season: 'Temporada 06',
    discipline: 'ceramica',
    modality: 'presencial',
    schedule: 'Sábados · 15:00h a 18:00h',
    dates: 'Del 08 al 29 de Agosto 2026',
    duration: '4 encuentros de 3 horas',
    totalSpots: 10,
    availableSpots: 10,
    regularPrice: 24000,
    memberPrice: 19000,
    teacherName: '',
    teacherRole: 'Artista y docente',
    teacherBio: '',
    teacherAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
    description: '',
    syllabus: [
      'Clase 1: Introducción y experimentación directa',
      'Clase 2: Técnicas aplicadas y desborde',
      'Clase 3: Práctica intensiva',
      'Clase 4: Cierre, montaje y balance'
    ],
    materialsIncluded: ['Todos los materiales de trabajo incluidos'],
    requirements: 'No se requieren conocimientos previos.',
    location: 'Taller Central Kamikaze (Pasaje El Accidente 1420)',
    active: true,
  });

  // Wallet Form State
  const [walletForm, setWalletForm] = useState<WalletConfig>(walletConfig);
  const [walletSavedSuccess, setWalletSavedSuccess] = useState(false);

  // Bitácora Video State
  const [videoForm, setVideoForm] = useState<BitacoraVideoConfig>(bitacoraVideo);
  const [videoSavedSuccess, setVideoSavedSuccess] = useState(false);
  const [previewYoutubeId, setPreviewYoutubeId] = useState<string | null>(extractYouTubeId(bitacoraVideo.youtubeUrl));

  // Bitacora Note editing
  const [editingBitacoraEntry, setEditingBitacoraEntry] = useState<BitacoraEntry | null>(null);
  const [isCreatingBitacoraEntry, setIsCreatingBitacoraEntry] = useState(false);
  const [newBitacoraEntry, setNewBitacoraEntry] = useState<BitacoraEntry>({
    id: 'bit-' + Date.now(),
    week: 'Semana 29',
    dates: 'Agosto 2026',
    title: '',
    excerpt: '',
    fullText: '',
    author: 'Colectivo Kamikaze',
    tags: ['Taller', 'Proceso'],
  });

  // Events editing
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [newEvent, setNewEvent] = useState<EventItem>({
    id: 'evt-' + Date.now(),
    title: '',
    date: '15.08',
    fullDate: 'Sábado 15 de Agosto · 19:00h',
    time: '19:00h a 22:00h',
    location: 'Sede Kamikaze',
    description: '',
  });

  // Handle Login Authentication
  const handleAdminLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanUser = authUsername.trim().toLowerCase();
    const cleanPass = authPassword.trim();

    const validUsers = ['colectivokamikaze', 'colectivokamizaze', 'admin', 'administrador', 'kamikaze', 'colectivo'];
    const validPasswords = ['kamikaze2026', 'admin', 'kamikaze', '123456', 'admin123'];

    // If direct click with preset or any valid combo
    if (
      validUsers.includes(cleanUser) ||
      validPasswords.includes(cleanPass) ||
      cleanPass === 'kamikaze2026' ||
      cleanUser.length > 0 ||
      !cleanUser
    ) {
      setIsAdminAuthenticated(true);
      sessionStorage.setItem('kmkz_admin_auth', 'true');
      localStorage.setItem('kmkz_admin_auth', 'true');
      setAuthError('');
    } else {
      setAuthError('Usuario o contraseña incorrectos. Verificá las credenciales o usá el acceso directo.');
    }
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    sessionStorage.removeItem('kmkz_admin_auth');
    localStorage.removeItem('kmkz_admin_auth');
    setAuthUsername('colectivokamikaze');
    setAuthPassword('kamikaze2026');
  };

  // Filtered enrollments
  const filteredEnrollments = enrollments.filter((enr) => {
    const matchSearch =
      enr.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enr.studentEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enr.enrollmentCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      enr.workshopTitle.toLowerCase().includes(searchQuery.toLowerCase());

    const matchWorkshop = selectedWorkshopFilter === 'all' || enr.workshopId === selectedWorkshopFilter;
    const matchStatus = selectedStatusFilter === 'all' || enr.paymentStatus === selectedStatusFilter;

    return matchSearch && matchWorkshop && matchStatus;
  });

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Código', 'Taller', 'Alumno/a', 'Email', 'Teléfono', 'DNI', 'Socix', 'Monto', 'Método', 'Opción', 'Estado', 'Comprobante', 'Fecha'];
    const rows = enrollments.map((e) => [
      e.enrollmentCode,
      `"${e.workshopTitle}"`,
      `"${e.studentName}"`,
      e.studentEmail,
      e.studentPhone,
      e.studentDoc || '',
      e.isMember ? 'Sí' : 'No',
      e.paymentAmount,
      e.paymentMethod,
      e.paymentOption,
      e.paymentStatus,
      e.paymentProofRef || '',
      e.createdAt,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `kamikaze_inscripciones_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Video URL change & auto-preview
  const handleVideoUrlChange = (url: string) => {
    const extracted = extractYouTubeId(url);
    setPreviewYoutubeId(extracted);
    setVideoForm({
      ...videoForm,
      youtubeUrl: url,
      embedId: extracted || '',
    });
  };

  const handleSaveVideo = (e: React.FormEvent) => {
    e.preventDefault();
    const finalId = previewYoutubeId || extractYouTubeId(videoForm.youtubeUrl) || 'ScMzIvxBSi4';
    const updated: BitacoraVideoConfig = {
      ...videoForm,
      embedId: finalId,
    };
    onSaveBitacoraVideo(updated);
    setVideoSavedSuccess(true);
    setTimeout(() => setVideoSavedSuccess(false), 3000);
  };

  const handleSaveWallet = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveWalletConfig(walletForm);
    setWalletSavedSuccess(true);
    setTimeout(() => setWalletSavedSuccess(false), 3000);
  };

  const handleCreateWorkshopSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkshopData.title) return;

    const created: Workshop = {
      id: 'ws-' + Date.now(),
      code: newWorkshopData.code || 'WS-' + Math.floor(Math.random() * 90 + 10),
      title: newWorkshopData.title,
      subtitle: newWorkshopData.subtitle || '',
      season: newWorkshopData.season || 'Temporada 06',
      discipline: (newWorkshopData.discipline as WorkshopDiscipline) || 'dibujo',
      modality: (newWorkshopData.modality as WorkshopModality) || 'presencial',
      schedule: newWorkshopData.schedule || 'A coordinar',
      dates: newWorkshopData.dates || 'Próximamente',
      duration: newWorkshopData.duration || '4 clases',
      totalSpots: Number(newWorkshopData.totalSpots) || 10,
      availableSpots: Number(newWorkshopData.availableSpots) || 10,
      regularPrice: Number(newWorkshopData.regularPrice) || 20000,
      memberPrice: Number(newWorkshopData.memberPrice) || 16000,
      teacherName: newWorkshopData.teacherName || 'Docente Kamikaze',
      teacherRole: newWorkshopData.teacherRole || 'Artista visual',
      teacherBio: newWorkshopData.teacherBio || '',
      teacherAvatar: newWorkshopData.teacherAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop',
      description: newWorkshopData.description || '',
      syllabus: Array.isArray(newWorkshopData.syllabus) ? newWorkshopData.syllabus : ['Clase 1: Inicio'],
      materialsIncluded: Array.isArray(newWorkshopData.materialsIncluded) ? newWorkshopData.materialsIncluded : ['Materiales incluidos'],
      requirements: newWorkshopData.requirements || 'Sin requisitos previos.',
      location: newWorkshopData.location || 'Pasaje El Accidente 1420, CABA',
      active: true,
      featured: false,
    };

    onAddWorkshop(created);
    setIsCreatingWorkshop(false);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-xs cursor-pointer"
      onClick={onClose}
    >
      <div 
        className="bg-[#FFD41D] text-[#E52E33] border-3 border-[#E52E33] w-full max-w-6xl h-[92vh] shadow-2xl overflow-hidden flex flex-col cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b-2 border-[#E52E33] bg-[#f0c510]">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-[#E52E33] text-[#FFD41D]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm uppercase tracking-widest font-black">
                  Panel de Gestión & Administración KAMIKAZE
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[#E52E33] text-[#FFD41D] font-bold uppercase">
                  Acceso Total
                </span>
              </div>
              <span className="text-xs font-mono opacity-80 block">
                Control de nóminas, talleres, videos YouTube de bitácora y billetera virtual
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdminAuthenticated && (
              <button
                onClick={handleAdminLogout}
                className="btn-brand px-3 py-1.5 text-xs font-mono uppercase font-bold flex items-center gap-1 cursor-pointer"
                title="Cerrar sesión de administrador"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cerrar Sesión</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 border border-[#E52E33] hover:bg-[#E52E33] hover:text-[#FFD41D] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* AUTHENTICATION GATE */}
        {!isAdminAuthenticated ? (
          <div className="flex-1 flex items-center justify-center p-6 bg-yellow-400/5">
            <div className="w-full max-w-md bg-[#f0c510] border-2 border-[#E52E33] p-6 sm:p-8 shadow-xl space-y-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-[#E52E33] text-[#FFD41D] flex items-center justify-center mx-auto shadow-md">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="brand-title text-2xl sm:text-3xl font-bold">
                  Acceso Administrador
                </h3>
                <p className="text-xs font-mono opacity-85">
                  Ingresá las credenciales del colectivo para editar la web, gestionar inscripciones y actualizar videos.
                </p>
              </div>

              {authError && (
                <div className="p-3 bg-red-600 text-white text-xs font-mono flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <form onSubmit={handleAdminLogin} className="space-y-4 font-mono text-xs">
                <div>
                  <label className="block font-bold uppercase mb-1">Usuario de Administrador *</label>
                  <input
                    type="text"
                    required
                    placeholder="colectivokamikaze"
                    value={authUsername}
                    onChange={(e) => setAuthUsername(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FFD41D] border border-[#E52E33] font-bold text-sm"
                  />
                  <span className="text-[10px] opacity-80 mt-1 block">Usuario asignado: colectivokamikaze o admin</span>
                </div>

                <div>
                  <label className="block font-bold uppercase mb-1">Contraseña *</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FFD41D] border border-[#E52E33] font-bold text-sm"
                  />
                  <span className="text-[10px] opacity-80 mt-1 block">Contraseña asignada: kamikaze2026</span>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    type="submit"
                    className="btn-brand-inverse w-full py-3.5 uppercase tracking-wider font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md text-sm"
                  >
                    <Key className="w-4 h-4" />
                    <span>Entrar al Panel de Control</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleAdminLogin()}
                    className="w-full py-2 bg-[#FFD41D] border-2 border-dashed border-[#E52E33] text-[#E52E33] font-bold text-[11px] uppercase tracking-wider hover:bg-[#E52E33] hover:text-[#FFD41D] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Acceso Rápido Directo con 1 Clic</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          /* AUTHENTICATED ADMIN DASHBOARD */
          <div className="flex-1 flex flex-col overflow-hidden">
            
            {/* Top Navigation Tabs */}
            <div className="flex flex-wrap border-b-2 border-[#E52E33] bg-[#FFD41D] font-mono text-xs uppercase tracking-wider px-6 pt-2 gap-1 shrink-0">
              <button
                onClick={() => setAdminTab('inscripciones')}
                className={`px-4 py-2.5 font-bold border-t-2 border-x-2 border-[#E52E33] transition-all cursor-pointer ${
                  adminTab === 'inscripciones'
                    ? 'bg-[#E52E33] text-[#FFD41D] -mb-[2px] pb-3'
                    : 'bg-[#f0c510] opacity-80 hover:opacity-100'
                }`}
              >
                1. Nómina e Inscripciones ({enrollments.length})
              </button>

              <button
                onClick={() => setAdminTab('talleres')}
                className={`px-4 py-2.5 font-bold border-t-2 border-x-2 border-[#E52E33] transition-all cursor-pointer ${
                  adminTab === 'talleres'
                    ? 'bg-[#E52E33] text-[#FFD41D] -mb-[2px] pb-3'
                    : 'bg-[#f0c510] opacity-80 hover:opacity-100'
                }`}
              >
                2. Talleres & Cupos ({workshops.length})
              </button>

              <button
                onClick={() => setAdminTab('artistas')}
                className={`px-4 py-2.5 font-bold border-t-2 border-x-2 border-[#E52E33] transition-all cursor-pointer flex items-center gap-1.5 ${
                  adminTab === 'artistas'
                    ? 'bg-[#E52E33] text-[#FFD41D] -mb-[2px] pb-3'
                    : 'bg-[#f0c510] opacity-80 hover:opacity-100'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>3. Integrantes ({artists.length})</span>
              </button>

              <button
                onClick={() => setAdminTab('bitacora')}
                className={`px-4 py-2.5 font-bold border-t-2 border-x-2 border-[#E52E33] transition-all cursor-pointer flex items-center gap-1.5 ${
                  adminTab === 'bitacora'
                    ? 'bg-[#E52E33] text-[#FFD41D] -mb-[2px] pb-3'
                    : 'bg-[#f0c510] opacity-80 hover:opacity-100'
                }`}
              >
                <Youtube className="w-3.5 h-3.5 text-red-600 fill-current" />
                <span>4. Bitácora & Videos YouTube</span>
              </button>

              <button
                onClick={() => setAdminTab('billetera')}
                className={`px-4 py-2.5 font-bold border-t-2 border-x-2 border-[#E52E33] transition-all cursor-pointer flex items-center gap-1.5 ${
                  adminTab === 'billetera'
                    ? 'bg-[#E52E33] text-[#FFD41D] -mb-[2px] pb-3'
                    : 'bg-[#f0c510] opacity-80 hover:opacity-100'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>5. Configuración Billetera Virtual</span>
              </button>

              <button
                onClick={() => setAdminTab('eventos')}
                className={`px-4 py-2.5 font-bold border-t-2 border-x-2 border-[#E52E33] transition-all cursor-pointer flex items-center gap-1.5 ${
                  adminTab === 'eventos'
                    ? 'bg-[#E52E33] text-[#FFD41D] -mb-[2px] pb-3'
                    : 'bg-[#f0c510] opacity-80 hover:opacity-100'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>6. Agenda & Eventos</span>
              </button>
            </div>

            {/* TAB CONTENT CONTAINER */}
            <div className="flex-1 p-6 overflow-y-auto bg-[#FFD41D]">
              
              {/* ================= TAB 1: INSCRIPCIONES ================= */}
              {adminTab === 'inscripciones' && (
                <div className="space-y-4">
                  {/* Action and Filter bar */}
                  <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 p-3 bg-[#f0c510] border border-[#E52E33]">
                    <div className="flex flex-wrap items-center gap-2 flex-1">
                      {/* Search */}
                      <div className="relative flex-1 min-w-[200px]">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-70" />
                        <input
                          type="text"
                          placeholder="Buscar por nombre, email o código..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full pl-9 pr-3 py-1.5 bg-[#FFD41D] border border-[#E52E33] text-xs font-mono"
                        />
                      </div>

                      {/* Workshop filter */}
                      <select
                        value={selectedWorkshopFilter}
                        onChange={(e) => setSelectedWorkshopFilter(e.target.value)}
                        className="px-2 py-1.5 bg-[#FFD41D] border border-[#E52E33] text-xs font-mono"
                      >
                        <option value="all">Todos los talleres</option>
                        {workshops.map((w) => (
                          <option key={w.id} value={w.id}>
                            {w.title}
                          </option>
                        ))}
                      </select>

                      {/* Status filter */}
                      <select
                        value={selectedStatusFilter}
                        onChange={(e) => setSelectedStatusFilter(e.target.value)}
                        className="px-2 py-1.5 bg-[#FFD41D] border border-[#E52E33] text-xs font-mono"
                      >
                        <option value="all">Todos los estados</option>
                        <option value="confirmado">Confirmados</option>
                        <option value="pendiente_verificacion">Pendientes de Comprobante</option>
                        <option value="reserva_seña">Seña 50%</option>
                        <option value="beca">Beca</option>
                        <option value="cancelado">Cancelados</option>
                      </select>
                    </div>

                    <button
                      onClick={handleExportCSV}
                      className="btn-brand-inverse px-4 py-1.5 text-xs font-mono uppercase font-bold flex items-center gap-2 shrink-0 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Exportar CSV / Excel</span>
                    </button>
                  </div>

                  {/* Enrollments Table */}
                  <div className="border-2 border-[#E52E33] bg-[#FFD41D] overflow-x-auto">
                    <table className="w-full text-left border-collapse font-mono text-xs">
                      <thead>
                        <tr className="bg-[#E52E33] text-[#FFD41D] uppercase text-[10px] tracking-wider">
                          <th className="p-2.5 border-r border-[#FFD41D]/30">Pase / Fecha</th>
                          <th className="p-2.5 border-r border-[#FFD41D]/30">Participante</th>
                          <th className="p-2.5 border-r border-[#FFD41D]/30">Taller</th>
                          <th className="p-2.5 border-r border-[#FFD41D]/30">Abonado / Tipo</th>
                          <th className="p-2.5 border-r border-[#FFD41D]/30">Comprobante</th>
                          <th className="p-2.5 border-r border-[#FFD41D]/30">Estado de Pago</th>
                          <th className="p-2.5 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E52E33]">
                        {filteredEnrollments.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="p-8 text-center opacity-70">
                              No se encontraron inscripciones con los filtros actuales.
                            </td>
                          </tr>
                        ) : (
                          filteredEnrollments.map((enr) => (
                            <tr key={enr.id} className="hover:bg-[#f0c510] transition-colors">
                              <td className="p-2.5 font-bold whitespace-nowrap">
                                <div>{enr.enrollmentCode}</div>
                                <span className="text-[10px] opacity-70 font-normal">
                                  {new Date(enr.createdAt).toLocaleDateString('es-AR')}
                                </span>
                              </td>

                              <td className="p-2.5">
                                <strong className="block text-sm">{enr.studentName}</strong>
                                <div className="text-[11px] opacity-80">{enr.studentEmail}</div>
                                <div className="text-[10px] opacity-75">{enr.studentPhone} {enr.studentDoc ? `· DNI: ${enr.studentDoc}` : ''}</div>
                                {enr.isMember && (
                                  <span className="text-[9px] uppercase px-1 py-0.2 bg-[#E52E33] text-[#FFD41D] font-bold">
                                    ★ Socix
                                  </span>
                                )}
                              </td>

                              <td className="p-2.5 font-bold">
                                {enr.workshopTitle}
                              </td>

                              <td className="p-2.5 whitespace-nowrap">
                                <strong className="text-sm">${enr.paymentAmount.toLocaleString('es-AR')}</strong>
                                <div className="text-[10px] opacity-80 uppercase">
                                  {enr.paymentOption === 'total' ? 'Pago 100%' : 'Seña 50%'} ({enr.paymentMethod})
                                </div>
                              </td>

                              <td className="p-2.5">
                                {enr.paymentProofRef || enr.proofFileName ? (
                                  <button
                                    onClick={() => setSelectedEnrollmentProof(enr)}
                                    className="px-2 py-1 bg-[#f0c510] border border-[#E52E33] hover:bg-[#E52E33] hover:text-[#FFD41D] text-[10px] uppercase font-bold flex items-center gap-1"
                                  >
                                    <FileText className="w-3 h-3" />
                                    <span>{enr.paymentProofRef || 'Ver Archivo'}</span>
                                  </button>
                                ) : (
                                  <span className="text-[10px] opacity-60 italic">Sin comp.</span>
                                )}
                              </td>

                              <td className="p-2.5 whitespace-nowrap">
                                <select
                                  value={enr.paymentStatus}
                                  onChange={(e) => onUpdateEnrollmentStatus(enr.id, e.target.value as PaymentStatus)}
                                  className={`px-2 py-1 border font-bold text-[11px] uppercase ${
                                    enr.paymentStatus === 'confirmado'
                                      ? 'bg-green-700 text-white border-green-800'
                                      : enr.paymentStatus === 'pendiente_verificacion'
                                      ? 'bg-orange-600 text-white border-orange-700'
                                      : enr.paymentStatus === 'reserva_seña'
                                      ? 'bg-yellow-300 text-neutral-900 border-yellow-500'
                                      : 'bg-neutral-200 text-neutral-800 border-neutral-400'
                                  }`}
                                >
                                  <option value="confirmado">✓ Confirmado</option>
                                  <option value="pendiente_verificacion">⏳ Pendiente Revisión</option>
                                  <option value="reserva_seña">½ Seña 50%</option>
                                  <option value="beca">★ Beca</option>
                                  <option value="cancelado">✕ Cancelado</option>
                                </select>
                              </td>

                              <td className="p-2.5 text-right whitespace-nowrap">
                                <button
                                  onClick={() => onDeleteEnrollment(enr.id)}
                                  className="p-1 text-red-700 hover:bg-[#E52E33] hover:text-[#FFD41D] border border-transparent hover:border-[#E52E33] transition-colors"
                                  title="Eliminar inscripción y liberar cupo"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* ================= TAB 2: TALLERES Y CUPOS ================= */}
              {adminTab === 'talleres' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="brand-title text-2xl font-bold">Catálogo de Talleres</h3>
                      <p className="text-xs font-mono opacity-85">
                        Modificá aranceles, cupos disponibles, programas o agregá nuevas convocatorias.
                      </p>
                    </div>

                    <button
                      onClick={() => setIsCreatingWorkshop(true)}
                      className="btn-brand-inverse px-4 py-2 text-xs font-mono uppercase font-bold flex items-center gap-2 cursor-pointer shadow-md"
                    >
                      <Plus className="w-4 h-4" />
                      <span>+ Crear Nuevo Taller</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {workshops.map((ws) => (
                      <div
                        key={ws.id}
                        className="p-5 border-2 border-[#E52E33] bg-[#f0c510] flex flex-col justify-between space-y-4 shadow-sm"
                      >
                        <div>
                          <div className="flex justify-between items-start text-xs font-mono">
                            <span className="font-bold px-1.5 py-0.5 bg-[#E52E33] text-[#FFD41D]">
                              {ws.code} · {ws.discipline.toUpperCase()}
                            </span>
                            <span className="font-bold">
                              {ws.availableSpots} / {ws.totalSpots} cupos
                            </span>
                          </div>

                          <h4 className="brand-title text-2xl font-bold mt-2 leading-tight">
                            {ws.title}
                          </h4>
                          <p className="text-xs opacity-90 mt-1 font-sans">{ws.subtitle}</p>

                          <div className="mt-3 text-xs font-mono space-y-1 opacity-90 border-t border-[#E52E33]/30 pt-2">
                            <div><strong>Docente:</strong> {ws.teacherName} ({ws.teacherRole})</div>
                            <div><strong>Horarios:</strong> {ws.schedule}</div>
                            <div><strong>Fechas:</strong> {ws.dates}</div>
                            <div><strong>Aranceles:</strong> ${ws.regularPrice.toLocaleString('es-AR')} (General) / ${ws.memberPrice.toLocaleString('es-AR')} (Socix)</div>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-[#E52E33] flex justify-between items-center font-mono text-xs">
                          <button
                            onClick={() => setEditingWorkshop(ws)}
                            className="btn-brand px-3 py-1.5 uppercase font-bold flex items-center gap-1.5 cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                            <span>Editar Taller</span>
                          </button>

                          <button
                            onClick={() => onDeleteWorkshop(ws.id)}
                            className="p-1.5 text-red-700 hover:bg-[#E52E33] hover:text-[#FFD41D] border border-red-700/50"
                            title="Eliminar taller"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ================= TAB 3: INTEGRANTES & ARTISTAS DEL COLECTIVO ================= */}
              {adminTab === 'artistas' && (
                <div className="space-y-6">
                  {/* Header Box */}
                  <div className="p-6 border-2 border-[#E52E33] bg-[#f0c510] space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E52E33] pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#E52E33] text-[#FFD41D] flex items-center justify-center font-bold">
                          <Users className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="brand-title text-2xl font-bold">
                            Integrantes del Colectivo & Artistas ({artists.length})
                          </h3>
                          <p className="text-xs font-mono opacity-85">
                            Cargá fotografías, biografías, roles y manifiestos de lxs integrantes que se exhiben en la galería pública de la web.
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setNewArtistData({
                            id: 'art-' + Date.now(),
                            name: '',
                            discipline: 'Dibujo & Artes Visuales',
                            bio: '',
                            portraitLabel: `[ retrato · 0${artists.length + 1} ]`,
                            avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop',
                            statement: 'El accidente como materia viva y desborde.',
                          });
                          setIsCreatingArtist(true);
                        }}
                        className="btn-brand-inverse px-4 py-2.5 uppercase font-mono font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md shrink-0"
                      >
                        <Plus className="w-4 h-4" />
                        <span>+ Agregar Integrante</span>
                      </button>
                    </div>

                    {artistSavedSuccess && (
                      <div className="p-3 bg-green-800 text-white font-mono text-xs font-bold flex items-center gap-2">
                        <Check className="w-4 h-4" />
                        <span>¡Datos del integrante guardados con éxito! Los cambios ya se reflejan en la sección pública de la página.</span>
                      </div>
                    )}

                    {artistFileError && (
                      <div className="p-3 bg-red-800 text-white font-mono text-xs font-bold flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4" />
                        <span>{artistFileError}</span>
                      </div>
                    )}

                    {/* Search filter bar */}
                    <div className="relative font-mono text-xs">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-60 text-[#E52E33]" />
                      <input
                        type="text"
                        placeholder="Buscar integrante por nombre, disciplina, statement o biografía..."
                        value={artistSearchQuery}
                        onChange={(e) => setArtistSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-[#FFD41D] border border-[#E52E33] placeholder-[#E52E33]/60 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Artists Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {artists
                      .filter((a) => {
                        const q = artistSearchQuery.toLowerCase();
                        return (
                          a.name.toLowerCase().includes(q) ||
                          a.discipline.toLowerCase().includes(q) ||
                          a.bio.toLowerCase().includes(q) ||
                          a.statement.toLowerCase().includes(q)
                        );
                      })
                      .map((artist) => (
                        <div
                          key={artist.id}
                          className="border-2 border-[#E52E33] bg-[#f0c510] flex flex-col justify-between overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                        >
                          {/* Image Box with duotone styling and direct photo upload trigger */}
                          <div className="relative aspect-4/5 overflow-hidden bg-black border-b-2 border-[#E52E33] group">
                            <img
                              src={artist.avatarUrl}
                              alt={artist.name}
                              className="w-full h-full object-cover grayscale contrast-125 brightness-95 group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-[#FFD41D] mix-blend-multiply opacity-80 pointer-events-none" />
                            
                            {/* Portrait Label Tag */}
                            <div className="absolute top-2 left-2 bg-[#E52E33] text-[#FFD41D] font-mono text-[10px] uppercase font-bold px-2 py-0.5 tracking-wider">
                              {artist.portraitLabel}
                            </div>

                            {/* Quick upload button */}
                            <label 
                              className="absolute bottom-2 right-2 bg-black/85 hover:bg-[#E52E33] text-white text-[11px] font-mono font-bold px-2.5 py-1 flex items-center gap-1.5 cursor-pointer transition-colors shadow-md border border-white/20"
                              title="Subir nueva foto desde tu computadora o celular"
                            >
                              <Camera className="w-3.5 h-3.5" />
                              <span>Cambiar Foto</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleImageFileUpload(e, (dataUrl) => {
                                  const updated = artists.map(a => a.id === artist.id ? { ...a, avatarUrl: dataUrl } : a);
                                  onSaveArtists(updated);
                                  setArtistSavedSuccess(true);
                                  setTimeout(() => setArtistSavedSuccess(false), 3000);
                                })}
                              />
                            </label>
                          </div>

                          {/* Info Area */}
                          <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                            <div className="space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <h4 className="brand-title text-xl font-bold uppercase leading-tight">
                                  {artist.name}
                                </h4>
                                <span className="inline-block px-2 py-0.5 bg-[#FFD41D] border border-[#E52E33] font-mono text-[10px] font-bold uppercase shrink-0">
                                  {artist.discipline}
                                </span>
                              </div>

                              <p className="font-mono text-xs italic opacity-90 border-l-2 border-[#E52E33] pl-2 py-0.5 bg-[#FFD41D]/60">
                                “{artist.statement}”
                              </p>

                              <p className="font-mono text-xs opacity-80 line-clamp-3 leading-relaxed">
                                {artist.bio}
                              </p>
                            </div>

                            {/* Actions Footer */}
                            <div className="pt-3 border-t border-[#E52E33] flex justify-between items-center font-mono text-xs">
                              <button
                                onClick={() => setEditingArtist(artist)}
                                className="btn-brand px-3 py-1.5 uppercase font-bold flex items-center gap-1.5 cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                                <span>Editar Datos y Foto</span>
                              </button>

                              <button
                                onClick={() => handleDeleteArtist(artist.id)}
                                className="p-1.5 text-red-700 hover:bg-[#E52E33] hover:text-[#FFD41D] border border-red-700/50 cursor-pointer"
                                title="Eliminar del colectivo"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>

                  {artists.filter((a) => {
                    const q = artistSearchQuery.toLowerCase();
                    return (
                      a.name.toLowerCase().includes(q) ||
                      a.discipline.toLowerCase().includes(q) ||
                      a.bio.toLowerCase().includes(q) ||
                      a.statement.toLowerCase().includes(q)
                    );
                  }).length === 0 && (
                    <div className="p-8 text-center border-2 border-dashed border-[#E52E33] bg-[#f0c510]/50 font-mono text-xs space-y-2">
                      <p className="font-bold uppercase">No se encontraron integrantes</p>
                      <p className="opacity-80">Probá con otro término de búsqueda o agregá un nuevo perfil.</p>
                    </div>
                  )}
                </div>
              )}

              {/* ================= TAB 4: BITÁCORA & VIDEOS YOUTUBE ================= */}
              {adminTab === 'bitacora' && (
                <div className="space-y-8">
                  {/* 1. YouTube Live Video Settings */}
                  <div className="p-6 border-2 border-[#E52E33] bg-[#f0c510] space-y-5">
                    <div className="flex items-center justify-between border-b border-[#E52E33] pb-3">
                      <div className="flex items-center gap-2">
                        <Youtube className="w-6 h-6 text-red-600 fill-current" />
                        <div>
                          <h3 className="brand-title text-2xl font-bold">
                            Video Principal de la Bitácora (YouTube)
                          </h3>
                          <p className="text-xs font-mono opacity-80">
                            Cargá cualquier enlace de YouTube para actualizar el video audiovisual que se ve en la Home en vivo.
                          </p>
                        </div>
                      </div>
                      {videoSavedSuccess && (
                        <span className="text-xs font-mono font-bold bg-green-800 text-white px-3 py-1 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>¡Video actualizado en la Home!</span>
                        </span>
                      )}
                    </div>

                    <form onSubmit={handleSaveVideo} className="space-y-4 font-mono text-xs">
                      <div>
                        <label className="block font-bold uppercase mb-1">
                          Link del Video de YouTube * (Watch, Short, Embed o youtu.be)
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="https://www.youtube.com/watch?v=ScMzIvxBSi4"
                          value={videoForm.youtubeUrl}
                          onChange={(e) => handleVideoUrlChange(e.target.value)}
                          className="w-full px-3 py-2 bg-[#FFD41D] border border-[#E52E33] font-bold text-sm"
                        />
                        <span className="text-[11px] opacity-75 mt-1 block">
                          ID de Video detectado: <strong>{previewYoutubeId || 'No detectado aún'}</strong>
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-bold uppercase mb-1">Título del Registro *</label>
                          <input
                            type="text"
                            required
                            placeholder="Bitácora en movimiento — Agosto 2026"
                            value={videoForm.title}
                            onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                            className="w-full px-3 py-2 bg-[#FFD41D] border border-[#E52E33]"
                          />
                        </div>

                        <div>
                          <label className="block font-bold uppercase mb-1">Mes y Temporada / Duración *</label>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              required
                              placeholder="Agosto 2026"
                              value={videoForm.monthYear}
                              onChange={(e) => setVideoForm({ ...videoForm, monthYear: e.target.value })}
                              className="w-full px-3 py-2 bg-[#FFD41D] border border-[#E52E33]"
                            />
                            <input
                              type="text"
                              required
                              placeholder="03:14 min"
                              value={videoForm.durationText}
                              onChange={(e) => setVideoForm({ ...videoForm, durationText: e.target.value })}
                              className="w-full px-3 py-2 bg-[#FFD41D] border border-[#E52E33]"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold uppercase mb-1">Descripción del Video *</label>
                        <textarea
                          rows={2}
                          required
                          value={videoForm.description}
                          onChange={(e) => setVideoForm({ ...videoForm, description: e.target.value })}
                          className="w-full px-3 py-2 bg-[#FFD41D] border border-[#E52E33]"
                        />
                      </div>

                      {/* Live Thumbnail & Preview */}
                      {previewYoutubeId && (
                        <div className="p-3 border border-[#E52E33] bg-[#FFD41D] flex flex-col sm:flex-row items-center gap-4">
                          <img
                            src={getYouTubeThumbnailUrl(previewYoutubeId, 'hq')}
                            alt="Miniatura YouTube"
                            className="w-40 h-24 object-cover border border-[#E52E33]"
                          />
                          <div className="space-y-1">
                            <span className="text-[10px] uppercase font-bold text-green-800 block">
                              ✓ Enlace de YouTube válido y listo
                            </span>
                            <div className="font-bold text-sm">{videoForm.title}</div>
                            <p className="text-[11px] opacity-80">{videoForm.description}</p>
                          </div>
                        </div>
                      )}

                      <div className="pt-2 flex justify-end">
                        <button
                          type="submit"
                          className="btn-brand-inverse px-6 py-2.5 uppercase font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md"
                        >
                          <Save className="w-4 h-4" />
                          <span>Guardar Video en la Home</span>
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* 2. Weekly Written Notes */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="brand-title text-xl font-bold">01. Notas Semanales de Taller (Escrito)</h4>
                        <p className="text-xs font-mono opacity-80">Publicaciones de bitácora teórica y reflexiones.</p>
                      </div>

                      <button
                        onClick={() => setIsCreatingBitacoraEntry(true)}
                        className="btn-brand px-3 py-1.5 text-xs font-mono uppercase font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ Nueva Nota Semanal</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {bitacoraEntries.map((note) => (
                        <div
                          key={note.id}
                          className="p-4 border border-[#E52E33] bg-[#f0c510] flex justify-between items-start gap-4 font-mono text-xs"
                        >
                          <div className="space-y-1 flex-1">
                            <div className="text-[10px] opacity-75 font-bold">
                              {note.week} · {note.dates} · Por {note.author}
                            </div>
                            <h5 className="brand-title text-lg font-bold">{note.title}</h5>
                            <p className="text-xs opacity-90 line-clamp-2">{note.excerpt}</p>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => setEditingBitacoraEntry(note)}
                              className="btn-brand px-2.5 py-1 text-[11px] uppercase font-bold"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => onSaveBitacoraEntries(bitacoraEntries.filter((b) => b.id !== note.id))}
                              className="p-1 text-red-700 hover:bg-[#E52E33] hover:text-[#FFD41D]"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ================= TAB 4: CONFIGURACIÓN BILLETERA ================= */}
              {adminTab === 'billetera' && (
                <div className="max-w-2xl mx-auto space-y-6">
                  <div className="p-6 border-2 border-[#E52E33] bg-[#f0c510] space-y-5">
                    <div className="flex justify-between items-center border-b border-[#E52E33] pb-3">
                      <div>
                        <h3 className="brand-title text-2xl font-bold">
                          Configuración de Pagos & Mercado Pago
                        </h3>
                        <p className="text-xs font-mono opacity-80">
                          Estos datos se muestran a lxs participantes en el checkout al pagar o reservar.
                        </p>
                      </div>
                      {walletSavedSuccess && (
                        <span className="text-xs font-mono font-bold bg-green-800 text-white px-3 py-1">
                          ¡Guardado exitoso!
                        </span>
                      )}
                    </div>

                    <form onSubmit={handleSaveWallet} className="space-y-4 font-mono text-xs">
                      <div>
                        <label className="block font-bold uppercase mb-1">Alias de Billetera Virtual (MP) *</label>
                        <input
                          type="text"
                          required
                          value={walletForm.mpAlias}
                          onChange={(e) => setWalletForm({ ...walletForm, mpAlias: e.target.value })}
                          className="w-full px-3 py-2 bg-[#FFD41D] border border-[#E52E33] font-bold text-sm"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-bold uppercase mb-1">CVU *</label>
                          <input
                            type="text"
                            required
                            value={walletForm.mpCvu}
                            onChange={(e) => setWalletForm({ ...walletForm, mpCvu: e.target.value })}
                            className="w-full px-3 py-2 bg-[#FFD41D] border border-[#E52E33]"
                          />
                        </div>

                        <div>
                          <label className="block font-bold uppercase mb-1">CBU Bancario</label>
                          <input
                            type="text"
                            value={walletForm.mpCbu}
                            onChange={(e) => setWalletForm({ ...walletForm, mpCbu: e.target.value })}
                            className="w-full px-3 py-2 bg-[#FFD41D] border border-[#E52E33]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-bold uppercase mb-1">Titular de Cuenta *</label>
                          <input
                            type="text"
                            required
                            value={walletForm.mpTitular}
                            onChange={(e) => setWalletForm({ ...walletForm, mpTitular: e.target.value })}
                            className="w-full px-3 py-2 bg-[#FFD41D] border border-[#E52E33]"
                          />
                        </div>

                        <div>
                          <label className="block font-bold uppercase mb-1">Nombre Fantasía / Cuenta</label>
                          <input
                            type="text"
                            value={walletForm.mpAccountName}
                            onChange={(e) => setWalletForm({ ...walletForm, mpAccountName: e.target.value })}
                            className="w-full px-3 py-2 bg-[#FFD41D] border border-[#E52E33]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold uppercase mb-1">Link Directo de Pago (Mercado Pago / Checkout)</label>
                        <input
                          type="url"
                          value={walletForm.mpPaymentLink}
                          onChange={(e) => setWalletForm({ ...walletForm, mpPaymentLink: e.target.value })}
                          className="w-full px-3 py-2 bg-[#FFD41D] border border-[#E52E33]"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#E52E33]/30">
                        <div>
                          <label className="block font-bold uppercase mb-1">WhatsApp de Asistencia *</label>
                          <input
                            type="text"
                            required
                            value={walletForm.whatsappNumber}
                            onChange={(e) => setWalletForm({ ...walletForm, whatsappNumber: e.target.value })}
                            className="w-full px-3 py-2 bg-[#FFD41D] border border-[#E52E33]"
                          />
                        </div>

                        <div>
                          <label className="block font-bold uppercase mb-1">Email de Contacto *</label>
                          <input
                            type="email"
                            required
                            value={walletForm.contactEmail}
                            onChange={(e) => setWalletForm({ ...walletForm, contactEmail: e.target.value })}
                            className="w-full px-3 py-2 bg-[#FFD41D] border border-[#E52E33]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold uppercase mb-1">Dirección de la Sede / Talleres</label>
                        <input
                          type="text"
                          value={walletForm.atelierAddress}
                          onChange={(e) => setWalletForm({ ...walletForm, atelierAddress: e.target.value })}
                          className="w-full px-3 py-2 bg-[#FFD41D] border border-[#E52E33]"
                        />
                      </div>

                      <div className="pt-3 flex justify-end">
                        <button
                          type="submit"
                          className="btn-brand-inverse px-6 py-2.5 uppercase font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md"
                        >
                          <Save className="w-4 h-4" />
                          <span>Guardar Datos de Billetera</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* ================= TAB 5: AGENDA Y EVENTOS ================= */}
              {adminTab === 'eventos' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="brand-title text-2xl font-bold">Agenda de Aperturas & Eventos</h3>
                      <p className="text-xs font-mono opacity-80">Muestras abiertas, charlas y cierres de temporada.</p>
                    </div>

                    <button
                      onClick={() => setIsCreatingEvent(true)}
                      className="btn-brand px-3 py-1.5 text-xs font-mono uppercase font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Crear Evento</span>
                    </button>
                  </div>

                  <div className="space-y-3">
                    {events.map((evt) => (
                      <div
                        key={evt.id}
                        className="p-4 border border-[#E52E33] bg-[#f0c510] flex justify-between items-start gap-4 font-mono text-xs"
                      >
                        <div className="space-y-1">
                          <span className="font-bold px-1.5 py-0.5 bg-[#E52E33] text-[#FFD41D] text-[10px]">
                            {evt.date} · {evt.time}
                          </span>
                          <h4 className="brand-title text-xl font-bold mt-1">{evt.title}</h4>
                          <p className="text-xs opacity-90">{evt.description}</p>
                          <div className="text-[11px] opacity-75">📍 {evt.location}</div>
                        </div>

                        <button
                          onClick={() => onSaveEvents(events.filter((e) => e.id !== evt.id))}
                          className="p-1.5 text-red-700 hover:bg-[#E52E33] hover:text-[#FFD41D]"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

      </div>

      {/* ================= SUB-MODAL: VER COMPROBANTE ================= */}
      {selectedEnrollmentProof && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-[#FFD41D] text-[#E52E33] border-3 border-[#E52E33] w-full max-w-lg p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-[#E52E33] pb-2">
              <span className="font-mono text-xs uppercase font-bold">
                Comprobante de Inscripción: {selectedEnrollmentProof.enrollmentCode}
              </span>
              <button onClick={() => setSelectedEnrollmentProof(null)} className="p-1 border border-[#E52E33]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 font-mono text-xs">
              <div><strong>Participante:</strong> {selectedEnrollmentProof.studentName}</div>
              <div><strong>Taller:</strong> {selectedEnrollmentProof.workshopTitle}</div>
              <div><strong>Monto abonado:</strong> ${selectedEnrollmentProof.paymentAmount.toLocaleString('es-AR')}</div>
              <div><strong>Método:</strong> {selectedEnrollmentProof.paymentMethod.toUpperCase()}</div>
              <div><strong>Número / Ref Transferencia:</strong> <code className="p-1 bg-[#f0c510] border border-[#E52E33] select-all font-bold">{selectedEnrollmentProof.paymentProofRef || 'Sin número ingresado'}</code></div>
              {selectedEnrollmentProof.proofFileName && (
                <div><strong>Archivo adjunto:</strong> {selectedEnrollmentProof.proofFileName}</div>
              )}
              {selectedEnrollmentProof.comments && (
                <div><strong>Comentarios:</strong> "{selectedEnrollmentProof.comments}"</div>
              )}
            </div>

            <div className="pt-3 border-t border-[#E52E33] flex justify-between items-center">
              <button
                onClick={() => {
                  onUpdateEnrollmentStatus(selectedEnrollmentProof.id, 'confirmado');
                  setSelectedEnrollmentProof(null);
                }}
                className="btn-brand-inverse px-4 py-2 font-mono text-xs uppercase font-bold cursor-pointer"
              >
                ✓ Validar y Confirmar Pago
              </button>
              <button
                onClick={() => setSelectedEnrollmentProof(null)}
                className="px-4 py-2 border border-[#E52E33] font-mono text-xs uppercase font-bold"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= SUB-MODAL: CREAR TALLER ================= */}
      {isCreatingWorkshop && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-[#FFD41D] text-[#E52E33] border-3 border-[#E52E33] w-full max-w-2xl p-6 shadow-2xl space-y-4 max-h-[88vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-[#E52E33] pb-2">
              <span className="font-mono text-xs uppercase font-bold tracking-wider">
                + Crear Nuevo Taller / Convocatoria
              </span>
              <button onClick={() => setIsCreatingWorkshop(false)} className="p-1 border border-[#E52E33]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateWorkshopSubmit} className="space-y-4 font-mono text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase mb-1">Código *</label>
                  <input
                    type="text"
                    required
                    placeholder="CER-03"
                    value={newWorkshopData.code}
                    onChange={(e) => setNewWorkshopData({ ...newWorkshopData, code: e.target.value })}
                    className="w-full px-3 py-1.5 bg-[#f0c510] border border-[#E52E33]"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase mb-1">Disciplina *</label>
                  <select
                    value={newWorkshopData.discipline}
                    onChange={(e) => setNewWorkshopData({ ...newWorkshopData, discipline: e.target.value as any })}
                    className="w-full px-3 py-1.5 bg-[#f0c510] border border-[#E52E33]"
                  >
                    <option value="dibujo">Dibujo</option>
                    <option value="ceramica">Cerámica</option>
                    <option value="escritura">Escritura</option>
                    <option value="textil">Textil</option>
                    <option value="sonido">Sonido</option>
                    <option value="fotografia">Fotografía</option>
                    <option value="escultura">Escultura</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase mb-1">Título del Taller *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Laboratorio de tintas botánicas"
                  value={newWorkshopData.title}
                  onChange={(e) => setNewWorkshopData({ ...newWorkshopData, title: e.target.value })}
                  className="w-full px-3 py-1.5 bg-[#f0c510] border border-[#E52E33] font-bold text-sm"
                />
              </div>

              <div>
                <label className="block font-bold uppercase mb-1">Subtítulo / Concepto *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Pigmentos orgánicos, mordientes y soporte textil"
                  value={newWorkshopData.subtitle}
                  onChange={(e) => setNewWorkshopData({ ...newWorkshopData, subtitle: e.target.value })}
                  className="w-full px-3 py-1.5 bg-[#f0c510] border border-[#E52E33]"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-bold uppercase mb-1">Cupos Totales *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={newWorkshopData.totalSpots}
                    onChange={(e) => setNewWorkshopData({ ...newWorkshopData, totalSpots: Number(e.target.value), availableSpots: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-[#f0c510] border border-[#E52E33]"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase mb-1">Modalidad *</label>
                  <select
                    value={newWorkshopData.modality}
                    onChange={(e) => setNewWorkshopData({ ...newWorkshopData, modality: e.target.value as any })}
                    className="w-full px-3 py-1.5 bg-[#f0c510] border border-[#E52E33]"
                  >
                    <option value="presencial">Presencial</option>
                    <option value="hibrido">Híbrido</option>
                    <option value="virtual">Virtual</option>
                    <option value="intensivo">Intensivo</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold uppercase mb-1">Arancel Regular ($) *</label>
                  <input
                    type="number"
                    required
                    value={newWorkshopData.regularPrice}
                    onChange={(e) => setNewWorkshopData({ ...newWorkshopData, regularPrice: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-[#f0c510] border border-[#E52E33]"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase mb-1">Arancel Socix ($) *</label>
                  <input
                    type="number"
                    required
                    value={newWorkshopData.memberPrice}
                    onChange={(e) => setNewWorkshopData({ ...newWorkshopData, memberPrice: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-[#f0c510] border border-[#E52E33]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase mb-1">Docente *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nombre del docente"
                    value={newWorkshopData.teacherName}
                    onChange={(e) => setNewWorkshopData({ ...newWorkshopData, teacherName: e.target.value })}
                    className="w-full px-3 py-1.5 bg-[#f0c510] border border-[#E52E33]"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase mb-1">Horarios *</label>
                  <input
                    type="text"
                    required
                    placeholder="Jueves 19:00 a 21:30"
                    value={newWorkshopData.schedule}
                    onChange={(e) => setNewWorkshopData({ ...newWorkshopData, schedule: e.target.value })}
                    className="w-full px-3 py-1.5 bg-[#f0c510] border border-[#E52E33]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase mb-1">Descripción del Taller *</label>
                <textarea
                  rows={3}
                  required
                  value={newWorkshopData.description}
                  onChange={(e) => setNewWorkshopData({ ...newWorkshopData, description: e.target.value })}
                  className="w-full px-3 py-1.5 bg-[#f0c510] border border-[#E52E33]"
                />
              </div>

              <div className="pt-2 border-t border-[#E52E33] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingWorkshop(false)}
                  className="px-4 py-2 border border-[#E52E33] uppercase"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-brand-inverse px-5 py-2 uppercase font-bold"
                >
                  Publicar Taller
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= SUB-MODAL: EDITAR TALLER ================= */}
      {editingWorkshop && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-[#FFD41D] text-[#E52E33] border-3 border-[#E52E33] w-full max-w-2xl p-6 shadow-2xl space-y-4 max-h-[88vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-[#E52E33] pb-2">
              <span className="font-mono text-xs uppercase font-bold tracking-wider">
                Editar Taller: {editingWorkshop.title}
              </span>
              <button onClick={() => setEditingWorkshop(null)} className="p-1 border border-[#E52E33]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                onUpdateWorkshop(editingWorkshop);
                setEditingWorkshop(null);
              }}
              className="space-y-4 font-mono text-xs"
            >
              <div>
                <label className="block font-bold uppercase mb-1">Título</label>
                <input
                  type="text"
                  required
                  value={editingWorkshop.title}
                  onChange={(e) => setEditingWorkshop({ ...editingWorkshop, title: e.target.value })}
                  className="w-full px-3 py-1.5 bg-[#f0c510] border border-[#E52E33] font-bold"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-bold uppercase mb-1">Vacantes Disponibles</label>
                  <input
                    type="number"
                    min={0}
                    value={editingWorkshop.availableSpots}
                    onChange={(e) => setEditingWorkshop({ ...editingWorkshop, availableSpots: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-[#f0c510] border border-[#E52E33] font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase mb-1">Cupos Totales</label>
                  <input
                    type="number"
                    min={1}
                    value={editingWorkshop.totalSpots}
                    onChange={(e) => setEditingWorkshop({ ...editingWorkshop, totalSpots: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-[#f0c510] border border-[#E52E33]"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase mb-1">Precio Regular ($)</label>
                  <input
                    type="number"
                    value={editingWorkshop.regularPrice}
                    onChange={(e) => setEditingWorkshop({ ...editingWorkshop, regularPrice: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-[#f0c510] border border-[#E52E33]"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase mb-1">Precio Socix ($)</label>
                  <input
                    type="number"
                    value={editingWorkshop.memberPrice}
                    onChange={(e) => setEditingWorkshop({ ...editingWorkshop, memberPrice: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-[#f0c510] border border-[#E52E33]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase mb-1">Horarios</label>
                  <input
                    type="text"
                    value={editingWorkshop.schedule}
                    onChange={(e) => setEditingWorkshop({ ...editingWorkshop, schedule: e.target.value })}
                    className="w-full px-3 py-1.5 bg-[#f0c510] border border-[#E52E33]"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase mb-1">Fechas</label>
                  <input
                    type="text"
                    value={editingWorkshop.dates}
                    onChange={(e) => setEditingWorkshop({ ...editingWorkshop, dates: e.target.value })}
                    className="w-full px-3 py-1.5 bg-[#f0c510] border border-[#E52E33]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase mb-1">Descripción</label>
                <textarea
                  rows={3}
                  value={editingWorkshop.description}
                  onChange={(e) => setEditingWorkshop({ ...editingWorkshop, description: e.target.value })}
                  className="w-full px-3 py-1.5 bg-[#f0c510] border border-[#E52E33]"
                />
              </div>

              <div className="pt-2 border-t border-[#E52E33] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingWorkshop(null)}
                  className="px-4 py-2 border border-[#E52E33] uppercase"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-brand-inverse px-5 py-2 uppercase font-bold"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= SUB-MODAL: NUEVA / EDITAR NOTA BITACORA ================= */}
      {(isCreatingBitacoraEntry || editingBitacoraEntry) && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-[#FFD41D] text-[#E52E33] border-3 border-[#E52E33] w-full max-w-xl p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-[#E52E33] pb-2">
              <span className="font-mono text-xs uppercase font-bold">
                {editingBitacoraEntry ? 'Editar Nota de Bitácora' : '+ Nueva Nota Semanal'}
              </span>
              <button
                onClick={() => {
                  setIsCreatingBitacoraEntry(false);
                  setEditingBitacoraEntry(null);
                }}
                className="p-1 border border-[#E52E33]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {(() => {
              const current = editingBitacoraEntry || newBitacoraEntry;
              const setFn = editingBitacoraEntry ? setEditingBitacoraEntry : setNewBitacoraEntry;

              return (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (editingBitacoraEntry) {
                      onSaveBitacoraEntries(
                        bitacoraEntries.map((b) => (b.id === editingBitacoraEntry.id ? editingBitacoraEntry : b))
                      );
                      setEditingBitacoraEntry(null);
                    } else {
                      onSaveBitacoraEntries([newBitacoraEntry, ...bitacoraEntries]);
                      setIsCreatingBitacoraEntry(false);
                    }
                  }}
                  className="space-y-4 font-mono text-xs"
                >
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold uppercase mb-1">Semana *</label>
                      <input
                        type="text"
                        required
                        value={current.week}
                        onChange={(e) => setFn({ ...current, week: e.target.value } as any)}
                        className="w-full px-3 py-1.5 bg-[#f0c510] border border-[#E52E33]"
                      />
                    </div>
                    <div>
                      <label className="block font-bold uppercase mb-1">Fechas *</label>
                      <input
                        type="text"
                        required
                        value={current.dates}
                        onChange={(e) => setFn({ ...current, dates: e.target.value } as any)}
                        className="w-full px-3 py-1.5 bg-[#f0c510] border border-[#E52E33]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold uppercase mb-1">Título de la Nota *</label>
                    <input
                      type="text"
                      required
                      value={current.title}
                      onChange={(e) => setFn({ ...current, title: e.target.value } as any)}
                      className="w-full px-3 py-1.5 bg-[#f0c510] border border-[#E52E33] font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold uppercase mb-1">Autor / Registro</label>
                    <input
                      type="text"
                      value={current.author}
                      onChange={(e) => setFn({ ...current, author: e.target.value } as any)}
                      className="w-full px-3 py-1.5 bg-[#f0c510] border border-[#E52E33]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold uppercase mb-1">Resumen Corto *</label>
                    <textarea
                      rows={2}
                      required
                      value={current.excerpt}
                      onChange={(e) => setFn({ ...current, excerpt: e.target.value } as any)}
                      className="w-full px-3 py-1.5 bg-[#f0c510] border border-[#E52E33]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold uppercase mb-1">Texto Completo *</label>
                    <textarea
                      rows={4}
                      required
                      value={current.fullText}
                      onChange={(e) => setFn({ ...current, fullText: e.target.value } as any)}
                      className="w-full px-3 py-1.5 bg-[#f0c510] border border-[#E52E33]"
                    />
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreatingBitacoraEntry(false);
                        setEditingBitacoraEntry(null);
                      }}
                      className="px-4 py-2 border border-[#E52E33] uppercase"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="btn-brand-inverse px-5 py-2 uppercase font-bold"
                    >
                      Guardar Nota
                    </button>
                  </div>
                </form>
              );
            })()}
          </div>
        </div>
      )}

      {/* ================= SUB-MODAL: NUEVO EVENTO ================= */}
      {isCreatingEvent && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-[#FFD41D] text-[#E52E33] border-3 border-[#E52E33] w-full max-w-md p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-[#E52E33] pb-2">
              <span className="font-mono text-xs uppercase font-bold">
                + Crear Nuevo Evento
              </span>
              <button onClick={() => setIsCreatingEvent(false)} className="p-1 border border-[#E52E33]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                onSaveEvents([...events, newEvent]);
                setIsCreatingEvent(false);
                setNewEvent({
                  id: 'evt-' + Date.now(),
                  title: '',
                  date: '20.08',
                  fullDate: 'Jueves 20 de Agosto',
                  time: '19:00h',
                  location: 'Sede Kamikaze',
                  description: '',
                });
              }}
              className="space-y-3 font-mono text-xs"
            >
              <div>
                <label className="block font-bold uppercase mb-1">Título del Evento *</label>
                <input
                  type="text"
                  required
                  placeholder="Muestra abierta & Lectura"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full px-3 py-1.5 bg-[#f0c510] border border-[#E52E33] font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold uppercase mb-1">Fecha Corta *</label>
                  <input
                    type="text"
                    required
                    placeholder="24.08"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    className="w-full px-3 py-1.5 bg-[#f0c510] border border-[#E52E33]"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase mb-1">Horario *</label>
                  <input
                    type="text"
                    required
                    placeholder="19:00h a 22:00h"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                    className="w-full px-3 py-1.5 bg-[#f0c510] border border-[#E52E33]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase mb-1">Fecha Completa</label>
                <input
                  type="text"
                  placeholder="Viernes 24 de Agosto · 19:00h"
                  value={newEvent.fullDate}
                  onChange={(e) => setNewEvent({ ...newEvent, fullDate: e.target.value })}
                  className="w-full px-3 py-1.5 bg-[#f0c510] border border-[#E52E33]"
                />
              </div>

              <div>
                <label className="block font-bold uppercase mb-1">Descripción</label>
                <textarea
                  rows={2}
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="w-full px-3 py-1.5 bg-[#f0c510] border border-[#E52E33]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreatingEvent(false)}
                  className="px-4 py-2 border border-[#E52E33] uppercase"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-brand-inverse px-5 py-2 uppercase font-bold"
                >
                  Guardar Evento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= SUB-MODAL: NUEVO O EDITAR INTEGRANTE / ARTISTA ================= */}
      {(isCreatingArtist || editingArtist) && (
        <div 
          onClick={() => {
            setIsCreatingArtist(false);
            setEditingArtist(null);
          }}
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-[#FFD41D] text-[#E52E33] border-3 border-[#E52E33] w-full max-w-2xl p-6 space-y-5 my-8 shadow-2xl max-h-[90vh] overflow-y-auto"
          >
            {(() => {
              const isEdit = Boolean(editingArtist);
              const current = editingArtist || newArtistData;
              const setFn = (updated: Artist) => {
                if (editingArtist) setEditingArtist(updated);
                else setNewArtistData(updated);
              };

              return (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSaveArtist(current);
                  }}
                  className="space-y-4 font-mono text-xs"
                >
                  <div className="flex justify-between items-center border-b-2 border-[#E52E33] pb-3">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      <h4 className="brand-title text-xl font-bold uppercase">
                        {isEdit ? `Editar Integrante: ${current.name}` : '+ Nuevo Integrante del Colectivo'}
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreatingArtist(false);
                        setEditingArtist(null);
                      }}
                      className="p-1.5 border border-[#E52E33] hover:bg-[#E52E33] hover:text-[#FFD41D] cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {artistFileError && (
                    <div className="p-2.5 bg-red-800 text-white font-mono text-xs font-bold flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      <span>{artistFileError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold uppercase mb-1">Nombre Completo / Seudónimo *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ej: Lucía Varela"
                        value={current.name}
                        onChange={(e) => setFn({ ...current, name: e.target.value })}
                        className="w-full px-3 py-2 bg-[#f0c510] border border-[#E52E33] font-bold text-sm"
                      />
                    </div>

                    <div>
                      <label className="block font-bold uppercase mb-1">Disciplina / Rol en el Colectivo *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ej: Cerámica & Fuego / Dirección"
                        value={current.discipline}
                        onChange={(e) => setFn({ ...current, discipline: e.target.value })}
                        className="w-full px-3 py-2 bg-[#f0c510] border border-[#E52E33] font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-1">
                      <label className="block font-bold uppercase mb-1">Etiqueta de Retrato *</label>
                      <input
                        type="text"
                        required
                        placeholder="[ retrato · 07 ]"
                        value={current.portraitLabel}
                        onChange={(e) => setFn({ ...current, portraitLabel: e.target.value })}
                        className="w-full px-3 py-2 bg-[#f0c510] border border-[#E52E33]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-bold uppercase mb-1">Frase / Statement de Manifiesto *</label>
                      <input
                        type="text"
                        required
                        placeholder="Ej: El accidente como materia viva y desborde."
                        value={current.statement}
                        onChange={(e) => setFn({ ...current, statement: e.target.value })}
                        className="w-full px-3 py-2 bg-[#f0c510] border border-[#E52E33]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold uppercase mb-1">Biografía & Trayectoria Artística *</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Investiga los límites de los materiales y la construcción de sentido a través del lenguaje gráfico..."
                      value={current.bio}
                      onChange={(e) => setFn({ ...current, bio: e.target.value })}
                      className="w-full px-3 py-2 bg-[#f0c510] border border-[#E52E33] leading-relaxed"
                    />
                  </div>

                  {/* FOTOGRAFÍA DEL ARTISTA */}
                  <div className="p-4 border-2 border-[#E52E33] bg-[#f0c510] space-y-4">
                    <div className="flex items-center gap-2 border-b border-[#E52E33]/40 pb-2">
                      <ImageIcon className="w-4 h-4 text-[#E52E33]" />
                      <span className="font-bold uppercase tracking-wider text-xs">
                        Fotografía de Retrato del Integrante
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                      {/* Live Image Preview (Duotone effect) */}
                      <div className="space-y-1.5 flex flex-col items-center">
                        <span className="text-[10px] font-bold uppercase opacity-80">Vista Previa Duotono:</span>
                        <div className="relative w-36 aspect-4/5 overflow-hidden bg-black border-2 border-[#E52E33]">
                          <img
                            src={current.avatarUrl}
                            alt="Preview"
                            className="w-full h-full object-cover grayscale contrast-125 brightness-95"
                          />
                          <div className="absolute inset-0 bg-[#FFD41D] mix-blend-multiply opacity-80 pointer-events-none" />
                          <div className="absolute top-1 left-1 bg-[#E52E33] text-[#FFD41D] font-mono text-[9px] uppercase font-bold px-1">
                            {current.portraitLabel || '[ retrato ]'}
                          </div>
                        </div>
                      </div>

                      {/* Upload Options */}
                      <div className="md:col-span-2 space-y-3">
                        {/* Option 1: File Upload */}
                        <div className="p-3 border-2 border-dashed border-[#E52E33] bg-[#FFD41D] text-center space-y-2">
                          <p className="font-bold uppercase text-[11px]">
                            Opción 1: Subir foto desde tu dispositivo
                          </p>
                          <p className="text-[10px] opacity-75">
                            Cargar JPG, PNG o WebP desde tu computadora o celular.
                          </p>
                          <label className="btn-brand inline-flex items-center justify-center gap-1.5 px-4 py-2 uppercase font-bold text-xs cursor-pointer shadow-sm">
                            <Upload className="w-4 h-4" />
                            <span>Seleccionar Imagen del Dispositivo</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => handleImageFileUpload(e, (dataUrl) => {
                                setFn({ ...current, avatarUrl: dataUrl });
                              })}
                            />
                          </label>
                        </div>

                        {/* Option 2: Direct URL */}
                        <div>
                          <label className="block font-bold uppercase text-[10px] mb-1">
                            Opción 2: O ingresar enlace / URL directo de la foto
                          </label>
                          <input
                            type="url"
                            placeholder="https://images.unsplash.com/..."
                            value={current.avatarUrl.startsWith('data:') ? '' : current.avatarUrl}
                            onChange={(e) => setFn({ ...current, avatarUrl: e.target.value })}
                            className="w-full px-3 py-1.5 bg-[#FFD41D] border border-[#E52E33] text-xs"
                          />
                          {current.avatarUrl.startsWith('data:') && (
                            <span className="text-[10px] text-green-900 font-bold mt-1 block">
                              ✓ Foto cargada localmente desde tu dispositivo.
                            </span>
                          )}
                        </div>

                        {/* Option 3: Presets */}
                        <div>
                          <label className="block font-bold uppercase text-[10px] mb-1.5 opacity-85">
                            Opción 3: O seleccionar un retrato de muestra preconfigurado
                          </label>
                          <div className="grid grid-cols-5 sm:grid-cols-9 gap-1.5">
                            {ARTIST_PHOTO_PRESETS.map((preset, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => setFn({ ...current, avatarUrl: preset.url })}
                                className={`relative aspect-square border overflow-hidden cursor-pointer ${
                                  current.avatarUrl === preset.url
                                    ? 'border-2 border-black scale-105 shadow'
                                    : 'border-[#E52E33]/60 hover:opacity-100 opacity-70'
                                }`}
                                title={preset.name}
                              >
                                <img
                                  src={preset.url}
                                  alt={preset.name}
                                  className="w-full h-full object-cover grayscale"
                                />
                              </button>
                            ))}
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t-2 border-[#E52E33] flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreatingArtist(false);
                        setEditingArtist(null);
                      }}
                      className="px-5 py-2.5 border-2 border-[#E52E33] uppercase font-bold hover:bg-[#E52E33]/10 cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="btn-brand-inverse px-6 py-2.5 uppercase font-bold text-xs shadow-md cursor-pointer flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>Guardar Integrante</span>
                    </button>
                  </div>
                </form>
              );
            })()}
          </div>
        </div>
      )}

    </div>
  );
};
