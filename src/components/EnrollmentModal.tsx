import React, { useState, useEffect } from 'react';
import { 
  X, Check, Copy, ExternalLink, QrCode, CreditCard, 
  Wallet, Building2, Download, Calendar as CalendarIcon, 
  Share2, ArrowLeft, ArrowRight, Sparkles, ShieldCheck, 
  AlertCircle, Upload, CheckCircle2, UserCheck 
} from 'lucide-react';
import { Workshop, WalletConfig, Enrollment, PaymentMethod, PaymentStatus, StudentUser } from '../types';

interface EnrollmentModalProps {
  workshop: Workshop | null;
  walletConfig: WalletConfig;
  isOpen: boolean;
  onClose: () => void;
  onEnrollmentComplete: (newEnrollment: Enrollment) => void;
  currentUser?: StudentUser | null;
  onOpenStudentLogin?: () => void;
}

export const EnrollmentModal: React.FC<EnrollmentModalProps> = ({
  workshop,
  walletConfig,
  isOpen,
  onClose,
  onEnrollmentComplete,
  currentUser,
  onOpenStudentLogin,
}) => {
  if (!isOpen || !workshop) return null;

  const [step, setStep] = useState<1 | 2 | 3>(1);
  
  // Step 1 Form Data
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    doc: currentUser?.doc || '',
    isMember: currentUser?.isMember || false,
    comments: '',
  });

  // Sync if currentUser logs in
  useEffect(() => {
    if (currentUser) {
      setFormData((prev) => ({
        ...prev,
        name: currentUser.name || prev.name,
        email: currentUser.email || prev.email,
        phone: currentUser.phone || prev.phone,
        doc: currentUser.doc || prev.doc,
        isMember: currentUser.isMember ?? prev.isMember,
      }));
    }
  }, [currentUser]);

  // Step 2 Payment Data
  const [paymentOption, setPaymentOption] = useState<'total' | 'seña_50'>('total');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mercadopago');
  const [paymentProofRef, setPaymentProofRef] = useState('');
  const [proofFileName, setProofFileName] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Step 3 Result Data
  const [completedEnrollment, setCompletedEnrollment] = useState<Enrollment | null>(null);

  // Price calculations
  const currentBasePrice = formData.isMember ? workshop.memberPrice : workshop.regularPrice;
  const finalAmountToPay = paymentOption === 'total' ? currentBasePrice : Math.round(currentBasePrice / 2);

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleFileUploadSim = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProofFileName(file.name);
      if (!paymentProofRef) {
        setPaymentProofRef(`COMP-${file.name.slice(0, 10).toUpperCase()}`);
      }
    }
  };

  const handleSubmitStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      return;
    }
    setStep(2);
  };

  const handleConfirmPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      const randomId = Math.floor(1000 + Math.random() * 9000);
      const enrollmentCode = `KMKZ-2026-${randomId}`;

      let paymentStatus: PaymentStatus = 'confirmado';
      if (paymentMethod === 'efectivo') {
        paymentStatus = 'reserva_seña';
      } else if (!paymentProofRef) {
        paymentStatus = 'pendiente_verificacion';
      }

      const newEnrollment: Enrollment = {
        id: `enr-${Date.now()}`,
        enrollmentCode,
        workshopId: workshop.id,
        workshopTitle: workshop.title,
        studentName: formData.name.trim(),
        studentEmail: formData.email.trim(),
        studentPhone: formData.phone.trim(),
        studentDoc: formData.doc.trim() || undefined,
        isMember: formData.isMember,
        comments: formData.comments.trim() || undefined,
        paymentMethod,
        paymentOption,
        paymentAmount: finalAmountToPay,
        paymentStatus,
        paymentProofRef: paymentProofRef.trim() || `MP-${Math.floor(10000000 + Math.random() * 90000000)}`,
        proofFileName: proofFileName || undefined,
        createdAt: new Date().toISOString(),
      };

      setCompletedEnrollment(newEnrollment);
      onEnrollmentComplete(newEnrollment);
      setIsProcessing(false);
      setStep(3);
    }, 800);
  };

  // Generate .ICS Calendar File download for the student
  const handleDownloadCalendar = () => {
    if (!completedEnrollment) return;
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//KAMIKAZE Colectivo//Talleres 2026//ES
CALSCALE:GREGORIAN
BEGIN:VEVENT
SUMMARY:Taller: ${workshop.title} — KAMIKAZE
DESCRIPTION:Inscripción confirmada (${completedEnrollment.enrollmentCode}).\\nDocente: ${workshop.teacherName}\\nHorario: ${workshop.schedule}\\nLugar: ${workshop.location}
LOCATION:${workshop.location}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Kamikaze-${workshop.code}-Pase.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // WhatsApp share
  const handleWhatsAppShare = () => {
    if (!completedEnrollment) return;
    const msg = `¡Hola! Me acabo de inscribir al taller *${workshop.title}* en KAMIKAZE con el Pase *${completedEnrollment.enrollmentCode}*. Mi nombre es ${completedEnrollment.studentName}. Comprobante: ${completedEnrollment.paymentProofRef}`;
    const url = `https://wa.me/${walletConfig.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/65 backdrop-blur-xs overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl bg-[#FFD41D] text-[#E52E33] border-2 border-[#E52E33] shadow-2xl my-8 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top bar with step indicators */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-[#E52E33] bg-[#f0c510]">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-mono tracking-widest font-bold">
              Inscripción a Taller
            </span>
            <span className="text-xs font-mono opacity-70">
              [Paso {step} de 3]
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 text-[11px] font-mono">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center border border-[#E52E33] ${step >= 1 ? 'bg-[#E52E33] text-[#FFD41D] font-bold' : ''}`}>1</span>
              <span className="opacity-40">─</span>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center border border-[#E52E33] ${step >= 2 ? 'bg-[#E52E33] text-[#FFD41D] font-bold' : ''}`}>2</span>
              <span className="opacity-40">─</span>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center border border-[#E52E33] ${step === 3 ? 'bg-[#E52E33] text-[#FFD41D] font-bold' : ''}`}>3</span>
            </div>

            <button
              onClick={onClose}
              className="p-1 hover:bg-[#E52E33] hover:text-[#FFD41D] transition-colors border border-[#E52E33]"
              title="Cerrar formulario"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Selected Workshop Header Info */}
        <div className="px-6 py-3 border-b border-[#E52E33] bg-yellow-400/30 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div>
            <span className="font-mono font-bold">{workshop.code}</span> · <span className="font-bold">{workshop.title}</span>
          </div>
          <div className="font-mono">
            {workshop.schedule} · {workshop.location}
          </div>
        </div>

        {/* STEP 1: Personal info form */}
        {step === 1 && (
          <form onSubmit={handleSubmitStep1} className="p-6 sm:p-8 space-y-5">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h3 className="text-xl sm:text-2xl font-normal brand-title leading-tight">
                  01. Datos del participante
                </h3>
                {currentUser ? (
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold bg-green-800 text-white px-2 py-0.5">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Datos precargados ({currentUser.name})</span>
                  </div>
                ) : (
                  onOpenStudentLogin && (
                    <button
                      type="button"
                      onClick={onOpenStudentLogin}
                      className="text-xs font-mono underline uppercase font-bold text-left hover:opacity-100 opacity-90 cursor-pointer"
                    >
                      ¿Tenés cuenta o Gmail? Ingresá acá →
                    </button>
                  )
                )}
              </div>
              <p className="text-xs sm:text-sm opacity-90 mt-1">
                Completá tus datos para reservar tu vacante y generar el pase oficial de acceso al taller.
              </p>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <label className="block text-xs uppercase font-mono tracking-wider mb-1 font-bold">
                  Nombre y Apellido *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Lucía Martínez"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-yellow-400/10 border border-[#E52E33] focus:bg-[#FFD41D] focus:outline-hidden focus:ring-1 focus:ring-[#E52E33] text-sm text-[#E52E33] placeholder:text-[#E52E33]/40"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase font-mono tracking-wider mb-1 font-bold">
                    Correo electrónico *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="lucia@ejemplo.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-yellow-400/10 border border-[#E52E33] focus:bg-[#FFD41D] focus:outline-hidden focus:ring-1 focus:ring-[#E52E33] text-sm text-[#E52E33] placeholder:text-[#E52E33]/40"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase font-mono tracking-wider mb-1 font-bold">
                    Teléfono / WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+54 9 11 1234-5678"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-yellow-400/10 border border-[#E52E33] focus:bg-[#FFD41D] focus:outline-hidden focus:ring-1 focus:ring-[#E52E33] text-sm text-[#E52E33] placeholder:text-[#E52E33]/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase font-mono tracking-wider mb-1">
                  DNI / Pasaporte (opcional para certificado oficial)
                </label>
                <input
                  type="text"
                  placeholder="Ej: 38.921.401"
                  value={formData.doc}
                  onChange={(e) => setFormData({ ...formData, doc: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-yellow-400/10 border border-[#E52E33] focus:bg-[#FFD41D] focus:outline-hidden focus:ring-1 focus:ring-[#E52E33] text-sm text-[#E52E33] placeholder:text-[#E52E33]/40"
                />
              </div>

              {/* Membership checkbox */}
              <div className="p-3.5 border border-[#E52E33] bg-[#f0c510] flex items-start gap-3 cursor-pointer"
                   onClick={() => setFormData({ ...formData, isMember: !formData.isMember })}>
                <input
                  type="checkbox"
                  id="isMemberCheck"
                  checked={formData.isMember}
                  onChange={(e) => setFormData({ ...formData, isMember: e.target.checked })}
                  className="mt-1 accent-[#E52E33] w-4 h-4"
                />
                <label htmlFor="isMemberCheck" className="cursor-pointer text-xs sm:text-sm">
                  <span className="font-bold block">¿Sos socix activo de KAMIKAZE o querés sumar la cuota socix?</span>
                  <span className="text-xs opacity-90 block mt-0.5">
                    Accedés al arancel bonificado de <strong>${workshop.memberPrice.toLocaleString('es-AR')}</strong> (Ahorrás ${(workshop.regularPrice - workshop.memberPrice).toLocaleString('es-AR')}).
                  </span>
                </label>
              </div>

              <div>
                <label className="block text-xs uppercase font-mono tracking-wider mb-1">
                  Comentarios, dudas o experiencia previa (opcional)
                </label>
                <textarea
                  rows={2}
                  placeholder="¿Tenés alguna duda particular o requerimiento especial de accesibilidad?"
                  value={formData.comments}
                  onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
                  className="w-full px-3.5 py-2 bg-yellow-400/10 border border-[#E52E33] focus:bg-[#FFD41D] focus:outline-hidden focus:ring-1 focus:ring-[#E52E33] text-xs sm:text-sm text-[#E52E33] placeholder:text-[#E52E33]/40"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-[#E52E33] flex items-center justify-between gap-4">
              <div className="text-xs font-mono">
                Arancel a abonar: <strong className="text-base">${currentBasePrice.toLocaleString('es-AR')}</strong>
              </div>

              <button
                type="submit"
                className="btn-brand-inverse px-6 py-2.5 font-mono text-xs uppercase tracking-widest flex items-center gap-2 font-bold cursor-pointer"
              >
                <span>Continuar al Pago</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: Payment & Virtual Wallet Integration */}
        {step === 2 && (
          <form onSubmit={handleConfirmPayment} className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
            <div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs uppercase font-mono tracking-wider flex items-center gap-1.5 opacity-80 hover:opacity-100 mb-2"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Modificar datos personales
              </button>
              <h3 className="text-xl sm:text-2xl font-normal brand-title leading-tight">
                02. Vinculación & Pago con Billetera Virtual
              </h3>
              <p className="text-xs opacity-90 mt-1">
                Elegí tu opción de pago y realizá la transferencia directa mediante Mercado Pago, CVU o billeteras virtuales.
              </p>
            </div>

            {/* Payment Option: Total vs 50% Seña */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div 
                onClick={() => setPaymentOption('total')}
                className={`p-3.5 border cursor-pointer transition-all ${
                  paymentOption === 'total'
                    ? 'border-[#E52E33] bg-[#E52E33] text-[#FFD41D]'
                    : 'border-[#E52E33]/60 bg-yellow-400/20 hover:bg-yellow-400/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-mono font-bold tracking-wider">Pago Total (100%)</span>
                  {paymentOption === 'total' && <Check className="w-4 h-4" />}
                </div>
                <div className="text-xl font-bold font-mono mt-1">
                  ${currentBasePrice.toLocaleString('es-AR')}
                </div>
                <div className="text-[11px] opacity-80 mt-0.5">
                  Taller completamente abonado y plaza asegurada.
                </div>
              </div>

              <div 
                onClick={() => setPaymentOption('seña_50')}
                className={`p-3.5 border cursor-pointer transition-all ${
                  paymentOption === 'seña_50'
                    ? 'border-[#E52E33] bg-[#E52E33] text-[#FFD41D]'
                    : 'border-[#E52E33]/60 bg-yellow-400/20 hover:bg-yellow-400/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-mono font-bold tracking-wider">Reserva de Vacante (50%)</span>
                  {paymentOption === 'seña_50' && <Check className="w-4 h-4" />}
                </div>
                <div className="text-xl font-bold font-mono mt-1">
                  ${Math.round(currentBasePrice / 2).toLocaleString('es-AR')}
                </div>
                <div className="text-[11px] opacity-80 mt-0.5">
                  El 50% restante se abona en la primera clase.
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs uppercase font-mono tracking-wider mb-2 font-bold">
                Seleccioná el canal de pago:
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('mercadopago')}
                  className={`p-2.5 border flex flex-col items-center gap-1.5 text-center transition-all ${
                    paymentMethod === 'mercadopago'
                      ? 'border-[#E52E33] bg-[#f0c510] font-bold shadow-xs'
                      : 'border-[#E52E33]/40 bg-yellow-400/10 opacity-70 hover:opacity-100'
                  }`}
                >
                  <Wallet className="w-4 h-4" />
                  <span>Mercado Pago</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('transferencia')}
                  className={`p-2.5 border flex flex-col items-center gap-1.5 text-center transition-all ${
                    paymentMethod === 'transferencia'
                      ? 'border-[#E52E33] bg-[#f0c510] font-bold shadow-xs'
                      : 'border-[#E52E33]/40 bg-yellow-400/10 opacity-70 hover:opacity-100'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>CVU / Banco</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('efectivo')}
                  className={`p-2.5 border flex flex-col items-center gap-1.5 text-center transition-all ${
                    paymentMethod === 'efectivo'
                      ? 'border-[#E52E33] bg-[#f0c510] font-bold shadow-xs'
                      : 'border-[#E52E33]/40 bg-yellow-400/10 opacity-70 hover:opacity-100'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>En Taller</span>
                </button>
              </div>
            </div>

            {/* Dynamic Payment Box according to method */}
            {paymentMethod === 'mercadopago' && (
              <div className="p-4 border-2 border-[#E52E33] bg-[#f0c510] space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#E52E33]/30">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-4 h-4" />
                    <span className="font-bold text-xs uppercase font-mono tracking-wider">
                      Datos de Mercado Pago — KAMIKAZE
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold">Monto: ${finalAmountToPay.toLocaleString('es-AR')}</span>
                </div>

                {/* Alias & CVU copy boxes */}
                <div className="space-y-2.5 text-xs font-mono">
                  <div className="flex items-center justify-between p-2 bg-[#FFD41D] border border-[#E52E33]">
                    <div>
                      <span className="opacity-70 text-[10px] block">ALIAS DE MERCADO PAGO</span>
                      <strong className="text-sm select-all">{walletConfig.mpAlias}</strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(walletConfig.mpAlias, 'alias')}
                      className="px-2 py-1 border border-[#E52E33] hover:bg-[#E52E33] hover:text-[#FFD41D] transition-colors flex items-center gap-1 text-[11px]"
                    >
                      {copiedField === 'alias' ? <Check className="w-3 h-3 text-green-700" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedField === 'alias' ? 'Copiado' : 'Copiar'}</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-2 bg-[#FFD41D] border border-[#E52E33]">
                    <div>
                      <span className="opacity-70 text-[10px] block">CVU OFICIAL</span>
                      <strong className="text-xs select-all">{walletConfig.mpCvu}</strong>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(walletConfig.mpCvu, 'cvu')}
                      className="px-2 py-1 border border-[#E52E33] hover:bg-[#E52E33] hover:text-[#FFD41D] transition-colors flex items-center gap-1 text-[11px]"
                    >
                      {copiedField === 'cvu' ? <Check className="w-3 h-3 text-green-700" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedField === 'cvu' ? 'Copiado' : 'Copiar'}</span>
                    </button>
                  </div>

                  <div className="text-[11px] opacity-90">
                    <strong>Titular:</strong> {walletConfig.mpTitular} ({walletConfig.mpAccountName})
                  </div>
                </div>

                {/* Direct Action Link to Mercado Pago */}
                <div className="pt-2 flex flex-col sm:flex-row gap-2">
                  <a
                    href={walletConfig.mpPaymentLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2.5 px-4 bg-[#009EE3] text-white hover:bg-[#0082ba] transition-colors text-xs font-mono font-bold uppercase tracking-wider flex items-center justify-center gap-2 border border-black/20 shadow-xs"
                  >
                    <span>Abrir Mercado Pago</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <div className="p-2 border border-[#E52E33] bg-[#FFD41D] flex items-center gap-2 text-[10px] font-mono">
                    <QrCode className="w-6 h-6 shrink-0" />
                    <span>O enviá dinero directamente a <strong>{walletConfig.mpAlias}</strong></span>
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'transferencia' && (
              <div className="p-4 border-2 border-[#E52E33] bg-[#f0c510] space-y-3 text-xs font-mono">
                <div className="flex items-center justify-between pb-2 border-b border-[#E52E33]/30">
                  <span className="font-bold uppercase tracking-wider">Transferencia Bancaria / CVU / Billeteras</span>
                  <span className="font-bold">Monto: ${finalAmountToPay.toLocaleString('es-AR')}</span>
                </div>
                
                <div className="p-2 bg-[#FFD41D] border border-[#E52E33] flex items-center justify-between">
                  <div>
                    <span className="opacity-70 text-[10px] block">CBU / CVU</span>
                    <strong className="text-xs">{walletConfig.mpCbu}</strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(walletConfig.mpCbu, 'cbu')}
                    className="px-2 py-1 border border-[#E52E33] hover:bg-[#E52E33] hover:text-[#FFD41D] transition-colors flex items-center gap-1 text-[11px]"
                  >
                    {copiedField === 'cbu' ? <Check className="w-3 h-3 text-green-700" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedField === 'cbu' ? 'Copiado' : 'Copiar'}</span>
                  </button>
                </div>

                <div className="p-2 bg-[#FFD41D] border border-[#E52E33] flex items-center justify-between">
                  <div>
                    <span className="opacity-70 text-[10px] block">ALIAS</span>
                    <strong className="text-xs">{walletConfig.mpAlias}</strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(walletConfig.mpAlias, 'alias_transf')}
                    className="px-2 py-1 border border-[#E52E33] hover:bg-[#E52E33] hover:text-[#FFD41D] transition-colors flex items-center gap-1 text-[11px]"
                  >
                    {copiedField === 'alias_transf' ? <Check className="w-3 h-3 text-green-700" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedField === 'alias_transf' ? 'Copiado' : 'Copiar'}</span>
                  </button>
                </div>

                <div className="text-[11px] opacity-90 leading-tight">
                  Acepta transferencias de cualquier banco o billetera: Ualá, Santander, BBVA, Galicia, Bapro, Personal Pay, MODO, Cuenta DNI.
                </div>
              </div>
            )}

            {paymentMethod === 'efectivo' && (
              <div className="p-4 border-2 border-[#E52E33] bg-[#f0c510] space-y-2 text-xs">
                <div className="font-bold font-mono uppercase">Pago en efectivo / Sede Taller</div>
                <p className="opacity-90">
                  Tu cupo quedará pre-reservado. Podés acercarte a abonar de Lunes a Viernes de 16h a 20h en nuestra sede central ({walletConfig.atelierAddress}).
                </p>
                <div className="text-[11px] opacity-80 font-mono">
                  * Las reservas en efectivo se sostienen hasta 48hs antes del inicio del taller.
                </div>
              </div>
            )}

            {/* Proof of Payment / Reference Input */}
            <div className="space-y-3">
              <label className="block text-xs uppercase font-mono tracking-wider font-bold">
                {paymentMethod === 'efectivo' ? 'Código de reserva o nota' : 'Nº de comprobante o ID de operación de la billetera *'}
              </label>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={paymentMethod === 'efectivo' ? 'Ej: Abono en efectivo en recepción' : 'Ej: MP-89218491 o Nº de transferencia'}
                  value={paymentProofRef}
                  onChange={(e) => setPaymentProofRef(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 bg-yellow-400/10 border border-[#E52E33] focus:bg-[#FFD41D] focus:outline-hidden text-xs sm:text-sm font-mono text-[#E52E33] placeholder:text-[#E52E33]/40"
                />
              </div>

              {/* Optional voucher upload */}
              <div className="border border-dashed border-[#E52E33] p-3 text-center bg-yellow-400/10">
                <label className="cursor-pointer flex items-center justify-center gap-2 text-xs font-mono">
                  <Upload className="w-4 h-4" />
                  <span>{proofFileName ? `Archivo adjunto: ${proofFileName}` : 'Adjuntar captura de comprobante (opcional)'}</span>
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    onChange={handleFileUploadSim}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Submit & Confirm Button */}
            <div className="pt-3 border-t border-[#E52E33] flex items-center justify-between gap-4">
              <div className="text-xs font-mono">
                Total: <strong className="text-base font-black">${finalAmountToPay.toLocaleString('es-AR')}</strong>
              </div>

              <button
                type="submit"
                disabled={isProcessing}
                className="btn-brand-inverse px-6 py-3 font-mono text-xs uppercase tracking-widest flex items-center gap-2 font-bold cursor-pointer shadow-md disabled:opacity-50"
              >
                {isProcessing ? (
                  <span>Generando Pase Digital...</span>
                ) : (
                  <>
                    <span>Confirmar Inscripción</span>
                    <Sparkles className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Instant Automated Confirmation & Digital Pass */}
        {step === 3 && completedEnrollment && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-[#E52E33] text-[#FFD41D] rounded-full mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-normal brand-title leading-tight">
                ¡Inscripción Confirmada!
              </h3>
              <p className="text-xs sm:text-sm opacity-90 max-w-md mx-auto">
                Tu vacante para <strong>{workshop.title}</strong> ha sido reservada automáticamente.
              </p>
            </div>

            {/* Official Digital Pass Card (KAMIKAZE PASS) */}
            <div className="border-2 border-[#E52E33] bg-[#f0c510] p-5 sm:p-6 space-y-4 shadow-lg relative overflow-hidden">
              {/* Texture Hatching corner */}
              <div className="absolute top-0 right-0 w-24 h-24 ph opacity-30 pointer-events-none" />

              {/* Pass Header */}
              <div className="flex items-center justify-between border-b border-[#E52E33] pb-3">
                <div>
                  <span className="text-[10px] font-mono tracking-widest uppercase opacity-70 block">
                    PASE OFICIAL DE TALLER
                  </span>
                  <span className="text-base font-black font-mono tracking-wider">
                    {completedEnrollment.enrollmentCode}
                  </span>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 bg-[#E52E33] text-[#FFD41D] text-[10px] font-mono font-bold uppercase tracking-wider">
                    {completedEnrollment.paymentStatus === 'confirmado' ? 'PASE VÁLIDO' : 'PRE-RESERVA ACTIVA'}
                  </span>
                </div>
              </div>

              {/* Pass Body Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <span className="text-[10px] opacity-70 block">PARTICIPANTE</span>
                  <strong className="text-sm font-sans">{completedEnrollment.studentName}</strong>
                  <span className="block opacity-80">{completedEnrollment.studentEmail}</span>
                  <span className="block opacity-80">{completedEnrollment.studentPhone}</span>
                </div>

                <div>
                  <span className="text-[10px] opacity-70 block">TALLER & DOCENTE</span>
                  <strong className="text-sm font-sans">{workshop.title}</strong>
                  <span className="block opacity-80">Docente: {workshop.teacherName}</span>
                  <span className="block opacity-80">{workshop.dates}</span>
                </div>

                <div>
                  <span className="text-[10px] opacity-70 block">HORARIO & SEDE</span>
                  <span>{workshop.schedule}</span>
                  <span className="block font-bold">{workshop.location}</span>
                </div>

                <div>
                  <span className="text-[10px] opacity-70 block">ESTADO DE PAGO</span>
                  <span className="text-sm font-bold">${completedEnrollment.paymentAmount.toLocaleString('es-AR')}</span>
                  <span className="block opacity-80">Ref: {completedEnrollment.paymentProofRef}</span>
                </div>
              </div>

              {/* Barcode / QR aesthetic simulation */}
              <div className="pt-3 border-t border-[#E52E33]/30 flex items-center justify-between text-[11px] font-mono">
                <div className="flex items-center gap-2">
                  <QrCode className="w-8 h-8 shrink-0 text-[#E52E33]" />
                  <span className="opacity-70 text-[9px] leading-tight">
                    KAMIKAZE · PROCESO & MATERIA<br/>TEMPORADA 06 / 2026
                  </span>
                </div>
                <span className="opacity-80">Presentar este pase al ingresar</span>
              </div>
            </div>

            {/* Quick Actions for the Student */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
              <button
                type="button"
                onClick={handleDownloadCalendar}
                className="p-2.5 border border-[#E52E33] bg-[#FFD41D] hover:bg-[#E52E33] hover:text-[#FFD41D] transition-colors text-xs font-mono flex items-center justify-center gap-1.5 font-bold cursor-pointer"
              >
                <CalendarIcon className="w-3.5 h-3.5" />
                <span>Agendar Calendario</span>
              </button>

              <button
                type="button"
                onClick={handleWhatsAppShare}
                className="p-2.5 border border-[#E52E33] bg-[#25D366] text-black hover:bg-[#1fb855] transition-colors text-xs font-mono flex items-center justify-center gap-1.5 font-bold cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Avisar por WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="btn-brand-inverse p-2.5 text-xs font-mono uppercase tracking-widest flex items-center justify-center gap-1.5 font-bold cursor-pointer"
              >
                <span>Finalizar y Salir</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
