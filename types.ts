
export enum UserRole {
  RESIDENT = 'resident',
  PROFESSIONAL = 'professional',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin'
}

export enum AppointmentStatus {
  AGENDADO = 'AGENDADO',
  CONCLUIDO = 'CONCLUIDO',
  CANCELADO = 'CANCELADO'
}

export enum ProfessionalSector {
  ELETRICISTA = 'eletricista',
  ENCANADOR = 'encanador',
  PINTOR = 'pintor',
  JARDINAGEM = 'jardinagem',
  LAVA_CARRO = 'lava-carro',
  GOURMET = 'gourmet',
  ESTETICA = 'estetica',
  TECNOLOGIA = 'tecnologia',
  LIMPEZA = 'limpeza'
}

export interface Dependent {
  id: string;
  name: string;
  kinship: 'Cônjuge' | 'Filho(a)' | 'Parente' | 'Outro';
  birthDate: string;
}

export interface Profile {
  id: string;
  name: string;
  role: UserRole;
  email?: string;
  cpf?: string;
  rg?: string;
  phone?: string;
  condo_id?: string;
  tower?: string;
  unit?: string;
  spouse_name?: string;
  dependents?: Dependent[];
  is_free?: boolean;
  avatar?: string;
}

export interface ProfessionalProfile extends Profile {
  sector: ProfessionalSector;
  rating: number;
  description: string;
  verified: boolean;
  price_info?: string;
}

export interface Condo {
  id: string;
  name: string;
  units: number;
  manager: string;
  status: 'active' | 'suspended' | 'trial';
  plan: string;
}

export interface Appointment {
  id: string;
  professional_id: string;
  resident_id: string;
  date: string;
  time: string;
  status: AppointmentStatus;
  service_name: string;
  price: number;
}

export interface Ad {
  id: string;
  resident_id: string;
  resident_name: string;
  tower: string;
  unit: string;
  title: string;
  description: string;
  price: string;
  image_url: string;
  status: 'USADO' | 'NOVO' | 'DOAÇÃO';
  created_at: string;
}

export interface ShopItem {
  id: string;
  vendor_name: string;
  title: string;
  description: string;
  price: string;
  image_url: string;
  category: string;
  is_open: boolean;
  delivery_time?: string;
}

export interface FinancialTransaction {
  id: string;
  amount: number;
  type: 'in' | 'out';
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  features: string[];
}
