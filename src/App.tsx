import React, { useState, useEffect } from 'react';
import { KamikazeLogo } from './components/KamikazeLogo';
import { WorkshopsSection } from './components/WorkshopsSection';
import { WorkshopDetailModal } from './components/WorkshopDetailModal';
import { EnrollmentModal } from './components/EnrollmentModal';
import { AdminEnrollmentPanel } from './components/AdminEnrollmentPanel';
import { StudentPortalModal } from './components/StudentPortalModal';
import { ManifestoSection } from './components/ManifestoSection';
import { WorkAxesSection } from './components/WorkAxesSection';
import { BitacoraSection } from './components/BitacoraSection';
import { ArtistsSection } from './components/ArtistsSection';
import { SupportSection } from './components/SupportSection';
import { EventsSection } from './components/EventsSection';
import { ProposeWorkshopModal } from './components/ProposeWorkshopModal';
import { 
  INITIAL_WORKSHOPS, 
  INITIAL_ENROLLMENTS, 
  INITIAL_WALLET_CONFIG,
  INITIAL_BITACORA_VIDEO,
  BITACORA_DATA,
  EVENTS_DATA,
  ARTISTS_DATA
} from './data/initialData';
import { 
  Workshop, Enrollment, WalletConfig, PaymentStatus, 
  StudentUser, BitacoraVideoConfig, BitacoraEntry, EventItem, Artist 
} from './types';
import { 
  Settings, Users, Sparkles, ArrowDown, Wallet, 
  CheckCircle, ShieldCheck, Mail, MapPin, Phone, 
  User, Lock, QrCode, LogIn, ExternalLink, Youtube, Cloud
} from 'lucide-react';
import { auth, mapFirebaseUserToStudent, logoutGoogleAuth } from './services/googleWorkspace';
import { onAuthStateChanged } from 'firebase/auth';
import {
  subscribeWorkshops,
  subscribeEnrollments,
  subscribeWalletConfig,
  subscribeBitacoraVideo,
  subscribeBitacoraEntries,
  subscribeEvents,
  subscribeArtists,
  saveWorkshopToFirestore,
  deleteWorkshopFromFirestore,
  saveEnrollmentToFirestore,
  updateEnrollmentStatusInFirestore,
  deleteEnrollmentFromFirestore,
  saveWalletConfigToFirestore,
  saveBitacoraVideoToFirestore,
  saveBitacoraEntriesToFirestore,
  saveEventsToFirestore,
  saveArtistsToFirestore,
  saveWorkshopsListToFirestore,
  saveAllDataToFirestore,
} from './services/firestoreService';

export default function App() {
  // Persistent State for Workshops
  const [workshops, setWorkshops] = useState<Workshop[]>(() => {
    const saved = localStorage.getItem('kmkz_workshops_v1');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_WORKSHOPS;
  });

  // Persistent State for Enrollments
  const [enrollments, setEnrollments] = useState<Enrollment[]>(() => {
    const saved = localStorage.getItem('kmkz_enrollments_v1');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_ENROLLMENTS;
  });

  // Persistent State for Wallet Config
  const [walletConfig, setWalletConfig] = useState<WalletConfig>(() => {
    const saved = localStorage.getItem('kmkz_wallet_v1');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_WALLET_CONFIG;
  });

  // Persistent State for Bitácora Video (YouTube)
  const [bitacoraVideo, setBitacoraVideo] = useState<BitacoraVideoConfig>(() => {
    const saved = localStorage.getItem('kmkz_bitacora_video_v1');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_BITACORA_VIDEO;
  });

  // Persistent State for Bitácora Written Entries
  const [bitacoraEntries, setBitacoraEntries] = useState<BitacoraEntry[]>(() => {
    const saved = localStorage.getItem('kmkz_bitacora_entries_v1');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return BITACORA_DATA;
  });

  // Persistent State for Events
  const [events, setEvents] = useState<EventItem[]>(() => {
    const saved = localStorage.getItem('kmkz_events_v1');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return EVENTS_DATA;
  });

  // Persistent State for Collective Artists & Members
  const [artists, setArtists] = useState<Artist[]>(() => {
    const saved = localStorage.getItem('kmkz_artists_v1');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return ARTISTS_DATA;
  });

  // Logged in Student / Participant
  const [currentUser, setCurrentUser] = useState<StudentUser | null>(() => {
    const saved = localStorage.getItem('kmkz_student_user_v1');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return null;
  });

  // Modals state
  const [selectedWorkshopForDetail, setSelectedWorkshopForDetail] = useState<Workshop | null>(null);
  const [selectedWorkshopForEnrollment, setSelectedWorkshopForEnrollment] = useState<Workshop | null>(null);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isStudentPortalOpen, setIsStudentPortalOpen] = useState(false);
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);

  // Sync state changes with localStorage as offline cache
  useEffect(() => {
    localStorage.setItem('kmkz_workshops_v1', JSON.stringify(workshops));
  }, [workshops]);

  useEffect(() => {
    localStorage.setItem('kmkz_enrollments_v1', JSON.stringify(enrollments));
  }, [enrollments]);

  useEffect(() => {
    localStorage.setItem('kmkz_wallet_v1', JSON.stringify(walletConfig));
  }, [walletConfig]);

  useEffect(() => {
    localStorage.setItem('kmkz_bitacora_video_v1', JSON.stringify(bitacoraVideo));
  }, [bitacoraVideo]);

  useEffect(() => {
    localStorage.setItem('kmkz_bitacora_entries_v1', JSON.stringify(bitacoraEntries));
  }, [bitacoraEntries]);

  useEffect(() => {
    localStorage.setItem('kmkz_events_v1', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('kmkz_artists_v1', JSON.stringify(artists));
  }, [artists]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('kmkz_student_user_v1', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('kmkz_student_user_v1');
    }
  }, [currentUser]);

  // Real-time Cloud Subscriptions from Firestore
  useEffect(() => {
    const unsubWorkshops = subscribeWorkshops((data) => {
      if (data && data.length > 0) setWorkshops(data);
    });
    const unsubEnrollments = subscribeEnrollments((data) => {
      if (data) setEnrollments(data);
    });
    const unsubWallet = subscribeWalletConfig((data) => {
      if (data) setWalletConfig(data);
    });
    const unsubBitacoraVideo = subscribeBitacoraVideo((data) => {
      if (data) setBitacoraVideo(data);
    });
    const unsubBitacoraEntries = subscribeBitacoraEntries((data) => {
      if (data && data.length > 0) setBitacoraEntries(data);
    });
    const unsubEvents = subscribeEvents((data) => {
      if (data && data.length > 0) setEvents(data);
    });
    const unsubArtists = subscribeArtists((data) => {
      if (data && data.length > 0) setArtists(data);
    });

    return () => {
      unsubWorkshops();
      unsubEnrollments();
      unsubWallet();
      unsubBitacoraVideo();
      unsubBitacoraEntries();
      unsubEvents();
      unsubArtists();
    };
  }, []);

  // Automatically listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      if (fbUser && fbUser.email) {
        const student = mapFirebaseUserToStudent(fbUser);
        setCurrentUser((prev) => {
          // If we had custom local profile info (phone, doc, membership), preserve them
          if (prev && prev.email.toLowerCase() === student.email.toLowerCase()) {
            return {
              ...student,
              phone: prev.phone || student.phone,
              doc: prev.doc || student.doc,
              isMember: prev.isMember ?? student.isMember,
            };
          }
          return student;
        });
      }
    });
    return () => unsubscribe();
  }, []);

  // Handle new enrollment and automatically decrease available spots
  const handleEnrollmentComplete = (newEnrollment: Enrollment) => {
    setEnrollments((prev) => [newEnrollment, ...prev]);
    saveEnrollmentToFirestore(newEnrollment).catch((e) => console.error('Error saving enrollment online:', e));

    // If user is not logged in, auto-create their student profile with their entered info so they can access their portal
    if (!currentUser) {
      const autoUser: StudentUser = {
        id: 'usr-' + Date.now(),
        name: newEnrollment.studentName,
        email: newEnrollment.studentEmail,
        phone: newEnrollment.studentPhone,
        doc: newEnrollment.studentDoc,
        isMember: newEnrollment.isMember,
        provider: 'email',
        createdAt: new Date().toISOString(),
      };
      setCurrentUser(autoUser);
    }

    // Decrease workshop available spots automatically
    const targetWorkshop = workshops.find((w) => w.id === newEnrollment.workshopId);
    if (targetWorkshop) {
      const updatedWorkshop = {
        ...targetWorkshop,
        availableSpots: Math.max(0, targetWorkshop.availableSpots - 1),
      };
      setWorkshops((prev) =>
        prev.map((ws) => (ws.id === updatedWorkshop.id ? updatedWorkshop : ws))
      );
      saveWorkshopToFirestore(updatedWorkshop).catch((e) => console.error('Error syncing workshop spots online:', e));
    }
  };

  // Admin Actions with Online Cloud Firestore Persistence
  const handleUpdateEnrollmentStatus = (enrollmentId: string, newStatus: PaymentStatus) => {
    setEnrollments((prev) =>
      prev.map((enr) => (enr.id === enrollmentId ? { ...enr, paymentStatus: newStatus } : enr))
    );
    updateEnrollmentStatusInFirestore(enrollmentId, newStatus).catch((e) => console.error('Error updating enrollment online:', e));
  };

  const handleDeleteEnrollment = (enrollmentId: string) => {
    const toDelete = enrollments.find((e) => e.id === enrollmentId);
    setEnrollments((prev) => prev.filter((e) => e.id !== enrollmentId));
    deleteEnrollmentFromFirestore(enrollmentId).catch((e) => console.error('Error deleting enrollment online:', e));

    // Release spot back
    if (toDelete) {
      const ws = workshops.find((w) => w.id === toDelete.workshopId);
      if (ws) {
        const updatedWs = { ...ws, availableSpots: Math.min(ws.totalSpots, ws.availableSpots + 1) };
        setWorkshops((prev) =>
          prev.map((item) => (item.id === updatedWs.id ? updatedWs : item))
        );
        saveWorkshopToFirestore(updatedWs).catch((e) => console.error('Error restoring spot online:', e));
      }
    }
  };

  const handleSaveWalletConfig = (newConfig: WalletConfig) => {
    setWalletConfig(newConfig);
    saveWalletConfigToFirestore(newConfig).catch((e) => console.error('Error saving wallet online:', e));
  };

  const handleUpdateWorkshop = (updatedWorkshop: Workshop) => {
    setWorkshops((prev) => prev.map((ws) => (ws.id === updatedWorkshop.id ? updatedWorkshop : ws)));
    saveWorkshopToFirestore(updatedWorkshop).catch((e) => console.error('Error updating workshop online:', e));
  };

  const handleAddWorkshop = (newWorkshop: Workshop) => {
    setWorkshops((prev) => [newWorkshop, ...prev]);
    saveWorkshopToFirestore(newWorkshop).catch((e) => console.error('Error creating workshop online:', e));
  };

  const handleDeleteWorkshop = (workshopId: string) => {
    setWorkshops((prev) => prev.filter((w) => w.id !== workshopId));
    deleteWorkshopFromFirestore(workshopId).catch((e) => console.error('Error deleting workshop online:', e));
  };

  const handleSaveBitacoraVideo = (newVideo: BitacoraVideoConfig) => {
    setBitacoraVideo(newVideo);
    saveBitacoraVideoToFirestore(newVideo).catch((e) => console.error('Error saving video online:', e));
  };

  const handleSaveBitacoraEntries = (entries: BitacoraEntry[]) => {
    setBitacoraEntries(entries);
    saveBitacoraEntriesToFirestore(entries).catch((e) => console.error('Error saving bitacora entries online:', e));
  };

  const handleSaveEvents = (newEvents: EventItem[]) => {
    setEvents(newEvents);
    saveEventsToFirestore(newEvents).catch((e) => console.error('Error saving events online:', e));
  };

  const handleSaveArtists = (newArtists: Artist[]) => {
    setArtists(newArtists);
    saveArtistsToFirestore(newArtists).catch((e) => console.error('Error saving artists online:', e));
  };

  const handleSaveWorkshopsList = (newList: Workshop[]) => {
    setWorkshops(newList);
    saveWorkshopsListToFirestore(newList).catch((e) => console.error('Error saving workshops list online:', e));
  };

  const handleSaveAllChanges = async () => {
    try {
      await saveAllDataToFirestore({
        workshops,
        enrollments,
        walletConfig,
        bitacoraVideo,
        bitacoraEntries,
        events,
        artists,
      });
      return true;
    } catch (err) {
      console.error('Error in handleSaveAllChanges:', err);
      throw err;
    }
  };

  // User Enrollments count
  const myEnrollmentsCount = currentUser
    ? enrollments.filter((e) => e.studentEmail.toLowerCase() === currentUser.email.toLowerCase()).length
    : 0;

  return (
    <div className="min-h-screen bg-[#FFD41D] text-[#E52E33] font-sans antialiased selection:bg-[#E52E33] selection:text-[#FFD41D]">
      <div className="w-full max-w-[1440px] mx-auto border-x border-[#E52E33]/40 min-h-screen flex flex-col justify-between">
        
        {/* ================= TOPBAR ================= */}
        <header className="sticky top-0 z-40 bg-[#FFD41D]/95 backdrop-blur-xs border-b border-[#E52E33] flex justify-between items-center px-6 sm:px-12 py-4 sm:py-5">
          <div className="flex items-center gap-3">
            <KamikazeLogo size="sm" />
          </div>

          <nav className="hidden xl:flex items-center gap-7 text-[11px] tracking-[0.18em] uppercase font-mono font-medium">
            <a href="#manifiesto" className="lk-brand">Manifiesto</a>
            <a href="#ejes" className="lk-brand">Ejes</a>
            <a href="#bitacora" className="lk-brand">Bitácora</a>
            <a href="#talleres" className="lk-brand text-[#E52E33] font-bold border-b border-[#E52E33] pb-0.5">Talleres</a>
            <a href="#artistas" className="lk-brand">Artistas</a>
            <a href="#eventos" className="lk-brand">Eventos</a>
            <a href="#sumate" className="lk-brand">Sumate</a>
          </nav>

          {/* DUAL ACCESS: 1. ALUMNOS/PARTICIPANTES | 2. ADMINISTRADOR */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* 1. PORTAL ALUMNOS / PARTICIPANTES */}
            <button
              onClick={() => setIsStudentPortalOpen(true)}
              className="btn-brand px-3 py-1.5 text-[11px] font-mono uppercase tracking-wider flex items-center gap-2 font-bold cursor-pointer shadow-xs"
              title="Portal de Alumnos y Participantes (Inscripciones, Pases QR y Datos)"
            >
              {currentUser ? (
                <>
                  <div className="w-4 h-4 rounded-full bg-[#E52E33] text-[#FFD41D] flex items-center justify-center text-[9px]">
                    {currentUser.name.slice(0, 1).toUpperCase()}
                  </div>
                  <span className="max-w-[90px] sm:max-w-[120px] truncate">{currentUser.name}</span>
                  {myEnrollmentsCount > 0 && (
                    <span className="px-1 py-0.2 bg-[#E52E33] text-[#FFD41D] text-[9px]">
                      {myEnrollmentsCount}
                    </span>
                  )}
                </>
              ) : (
                <>
                  <User className="w-3.5 h-3.5" />
                  <span>Portal Alumnxs</span>
                </>
              )}
            </button>

            {/* 2. ACCESO ADMINISTRADOR */}
            <button
              onClick={() => setIsAdminPanelOpen(true)}
              className="btn-brand-inverse px-3 py-1.5 text-[11px] font-mono uppercase tracking-wider flex items-center gap-1.5 font-bold cursor-pointer shadow-xs"
              title="Panel de Administración y Gestión del Colectivo"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Admin</span>
              {enrollments.filter(e => e.paymentStatus === 'pendiente_verificacion').length > 0 && (
                <span className="w-2 h-2 rounded-full bg-[#FFD41D] animate-ping" />
              )}
            </button>
          </div>
        </header>

        {/* ================= HERO SECTION ================= */}
        <section 
          className="ph min-h-[75vh] sm:min-h-[80vh] border-b border-[#E52E33] flex flex-col justify-between p-6 sm:p-12 relative overflow-hidden"
        >
          {/* Top meta tags */}
          <div className="relative z-10 flex justify-between items-start">
            <div className="text-xs sm:text-sm font-mono tracking-[0.2em] uppercase font-bold opacity-90">
              Colectivo artístico — proceso & materia
            </div>
            <div className="hidden md:flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest bg-[#FFD41D] border border-[#E52E33] px-3 py-1">
              <span>Temporada 06</span>
              <span>·</span>
              <span>Inscripciones Abiertas</span>
            </div>
          </div>

          {/* Massive Display Title */}
          <div className="relative z-10 my-auto py-8">
            <h1 className="brand-title text-7xl sm:text-9xl md:text-[140px] lg:text-[160px] font-normal leading-[0.82] tracking-[-0.03em] select-none">
              hacer<br />juntos
            </h1>
            <p className="text-sm sm:text-base md:text-lg max-w-xl mt-6 opacity-95 font-sans">
              Espacio autogestivo de talleres, investigación en cerámica, dibujo, sonido y gráfica editorial.
            </p>
          </div>

          {/* Bottom Action Bar */}
          <div className="relative z-10 flex flex-wrap items-center gap-4 pt-4 border-t border-[#E52E33]/30">
            <a
              href="#talleres"
              className="btn-brand-inverse px-6 py-3 font-mono text-xs uppercase tracking-widest font-bold flex items-center gap-2"
            >
              <span>Explorar Talleres & Cursos</span>
              <ArrowDown className="w-3.5 h-3.5" />
            </a>

            <a
              href="#bitacora"
              className="btn-brand px-6 py-3 font-mono text-xs uppercase tracking-widest font-bold flex items-center gap-2"
            >
              <Youtube className="w-3.5 h-3.5 text-red-600 fill-current" />
              <span>Ver Bitácora YouTube</span>
            </a>

            <div className="text-xs font-mono opacity-80 ml-auto hidden lg:block">
              Billetera virtual vinculada: <strong>{walletConfig.mpAlias}</strong>
            </div>
          </div>
        </section>

        {/* ================= MANIFESTO SECTION ================= */}
        <ManifestoSection />

        {/* ================= WORK AXES SECTION ================= */}
        <WorkAxesSection />

        {/* ================= BITACORA SECTION (YOUTUBE DYNAMIC INTEGRATION) ================= */}
        <BitacoraSection
          videoConfig={bitacoraVideo}
          entries={bitacoraEntries}
        />

        {/* ================= WORKSHOPS & COURSES (MAIN FUNCTIONALITY) ================= */}
        <WorkshopsSection
          workshops={workshops}
          walletConfig={walletConfig}
          onSelectWorkshop={(ws) => setSelectedWorkshopForDetail(ws)}
          onEnrollWorkshop={(ws) => setSelectedWorkshopForEnrollment(ws)}
        />

        {/* ================= ARTISTS SECTION ================= */}
        <ArtistsSection artists={artists} />

        {/* ================= SUPPORT / WALLET SOSTÉN ================= */}
        <SupportSection
          walletConfig={walletConfig}
          onOpenProposalModal={() => setIsProposalModalOpen(true)}
        />

        {/* ================= EVENTS SECTION ================= */}
        <EventsSection events={events} />

        {/* ================= FOOTER ================= */}
        <footer className="px-6 sm:px-12 py-10 bg-[#f0c510] border-t border-[#E52E33] space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-[#E52E33]/40 pb-6">
            <div className="space-y-1">
              <KamikazeLogo size="sm" />
              <p className="text-xs font-mono opacity-85 mt-2">
                Colectivo artístico, investigación & talleres formativos · 2026
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-6 text-xs font-mono">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                <span>{walletConfig.atelierAddress}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                <a href={`mailto:${walletConfig.contactEmail}`} className="underline">
                  {walletConfig.contactEmail}
                </a>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" />
                <a 
                  href={`https://wa.me/${walletConfig.whatsappNumber.replace(/[^0-9]/g, '')}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="underline hover:opacity-100 flex items-center gap-1"
                  title="Escribir por WhatsApp a Kamikaze"
                >
                  <span>{walletConfig.whatsappNumber}</span>
                  <span className="text-[10px] bg-[#E52E33] text-[#FFD41D] px-1 py-0.2 font-bold uppercase">WhatsApp</span>
                </a>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-mono uppercase tracking-widest opacity-80">
            <span>www.kamikaze.xyz</span>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsStudentPortalOpen(true)}
                className="underline hover:opacity-100 cursor-pointer"
              >
                [ Portal Alumnxs ]
              </button>
              <span>·</span>
              <button
                onClick={() => setIsAdminPanelOpen(true)}
                className="underline hover:opacity-100 cursor-pointer"
              >
                [ Acceso Administrador ]
              </button>
            </div>
          </div>
        </footer>

      </div>

      {/* ================= MODALS & DRAWERS ================= */}
      
      {/* 1. Workshop Detail Modal */}
      <WorkshopDetailModal
        workshop={selectedWorkshopForDetail}
        walletConfig={walletConfig}
        isOpen={Boolean(selectedWorkshopForDetail)}
        onClose={() => setSelectedWorkshopForDetail(null)}
        onStartEnrollment={(ws) => {
          setSelectedWorkshopForDetail(null);
          setSelectedWorkshopForEnrollment(ws);
        }}
      />

      {/* 2. Automated Enrollment & Virtual Wallet Modal */}
      <EnrollmentModal
        workshop={selectedWorkshopForEnrollment}
        walletConfig={walletConfig}
        isOpen={Boolean(selectedWorkshopForEnrollment)}
        onClose={() => setSelectedWorkshopForEnrollment(null)}
        onEnrollmentComplete={handleEnrollmentComplete}
        currentUser={currentUser}
        onOpenStudentLogin={() => setIsStudentPortalOpen(true)}
        onStudentLogin={(user) => setCurrentUser(user)}
      />

      {/* 3. Student / Participant Portal */}
      <StudentPortalModal
        isOpen={isStudentPortalOpen}
        onClose={() => setIsStudentPortalOpen(false)}
        currentUser={currentUser}
        onLogin={(user) => setCurrentUser(user)}
        onLogout={() => setCurrentUser(null)}
        onUpdateProfile={(updated) => setCurrentUser(updated)}
        enrollments={enrollments}
        workshops={workshops}
        walletConfig={walletConfig}
        onStartEnrollmentForWorkshop={(ws) => setSelectedWorkshopForEnrollment(ws)}
      />

      {/* 4. Admin & Collective Management Panel (Protected via Firebase Google Auth: tllaneza1@gmail.com / colectivokmkz@gmail.com) */}
      <AdminEnrollmentPanel
        workshops={workshops}
        enrollments={enrollments}
        walletConfig={walletConfig}
        bitacoraVideo={bitacoraVideo}
        bitacoraEntries={bitacoraEntries}
        events={events}
        artists={artists}
        isOpen={isAdminPanelOpen}
        onClose={() => setIsAdminPanelOpen(false)}
        onUpdateEnrollmentStatus={handleUpdateEnrollmentStatus}
        onDeleteEnrollment={handleDeleteEnrollment}
        onSaveWalletConfig={handleSaveWalletConfig}
        onUpdateWorkshop={handleUpdateWorkshop}
        onAddWorkshop={handleAddWorkshop}
        onDeleteWorkshop={handleDeleteWorkshop}
        onSaveBitacoraVideo={handleSaveBitacoraVideo}
        onSaveBitacoraEntries={handleSaveBitacoraEntries}
        onSaveEvents={handleSaveEvents}
        onSaveArtists={handleSaveArtists}
        onSaveWorkshopsList={handleSaveWorkshopsList}
        onSaveAllChanges={handleSaveAllChanges}
      />

      {/* 5. Propose Workshop / Artwork Modal */}
      <ProposeWorkshopModal
        isOpen={isProposalModalOpen}
        onClose={() => setIsProposalModalOpen(false)}
        walletConfig={walletConfig}
      />


    </div>
  );
}
