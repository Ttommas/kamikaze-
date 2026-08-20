export type WorkshopModality = 'presencial' | 'virtual' | 'hibrido' | 'intensivo';
export type WorkshopDiscipline = 'dibujo' | 'ceramica' | 'escritura' | 'textil' | 'sonido' | 'fotografia' | 'escultura';

export interface Workshop {
  id: string;
  code: string;
  title: string;
  subtitle: string;
  season: string;
  discipline: WorkshopDiscipline;
  modality: WorkshopModality;
  schedule: string;
  dates: string;
  duration: string;
  totalSpots: number;
  availableSpots: number;
  regularPrice: number;
  memberPrice: number;
  teacherName: string;
  teacherRole: string;
  teacherBio: string;
  teacherAvatar: string;
  description: string;
  syllabus: string[];
  materialsIncluded: string[];
  requirements: string;
  location: string;
  image?: string;
  featured?: boolean;
  active: boolean;
}

export type PaymentMethod = 'mercadopago' | 'transferencia' | 'efectivo' | 'tarjeta';
export type PaymentStatus = 'confirmado' | 'pendiente_verificacion' | 'reserva_seña' | 'beca' | 'cancelado';

export interface Enrollment {
  id: string;
  enrollmentCode: string;
  workshopId: string;
  workshopTitle: string;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  studentDoc?: string;
  isMember: boolean;
  comments?: string;
  paymentMethod: PaymentMethod;
  paymentOption: 'total' | 'seña_50';
  paymentAmount: number;
  paymentStatus: PaymentStatus;
  paymentProofRef?: string;
  proofFileName?: string;
  createdAt: string;
  notesAdmin?: string;
}

export interface StudentUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  doc?: string;
  isMember: boolean;
  avatarUrl?: string;
  provider: 'google' | 'email';
  createdAt: string;
}

export interface BitacoraVideoConfig {
  title: string;
  monthYear: string;
  description: string;
  youtubeUrl: string;
  embedId: string;
  durationText: string;
  coverImage?: string;
}

export interface WalletConfig {
  mpAlias: string;
  mpCvu: string;
  mpCbu: string;
  mpTitular: string;
  mpAccountName: string;
  mpPaymentLink: string;
  whatsappNumber: string;
  contactEmail: string;
  atelierAddress: string;
}

export interface Artist {
  id: string;
  name: string;
  discipline: string;
  bio: string;
  portraitLabel: string;
  avatarUrl: string;
  statement: string;
}

export interface BitacoraEntry {
  id: string;
  week: string;
  dates: string;
  title: string;
  excerpt: string;
  fullText: string;
  author: string;
  tags: string[];
}

export interface EventItem {
  id: string;
  title: string;
  date: string;
  fullDate: string;
  time: string;
  location: string;
  description: string;
}
