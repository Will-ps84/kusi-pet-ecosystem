// Kusi Pet Types

export type AppRole = 'customer' | 'admin' | 'vendor';
export type PetSpecies = 'perro' | 'gato' | 'otro';
export type PetSex = 'macho' | 'hembra' | 'otro';
export type OrderStatus = 'recibido' | 'confirmado' | 'preparando' | 'en_ruta' | 'entregado' | 'cancelado';
export type PaymentMethod = 'efectivo' | 'yape' | 'plin' | 'transferencia';
export type SpeciesTarget = 'perro' | 'gato' | 'ambos' | 'otros';

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  role: AppRole;
  created_at: string;
}

export interface Vendor {
  id: string;
  user_id: string;
  business_name: string;
  tax_id: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  category_id: string | null;
  vendor_id: string | null;
  name: string;
  short_description: string | null;
  long_description: string | null;
  price_total_igv: number;
  stock: number;
  species_target: SpeciesTarget;
  image_url: string | null;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  category?: Category;
  vendor?: Vendor;
}

export interface Pet {
  id: string;
  user_id: string;
  name: string;
  species: PetSpecies;
  breed: string | null;
  color: string | null;
  sex: PetSex | null;
  age_years: number | null;
  weight_kg: number | null;
  birthday: string | null;
  important_notes: string | null;
  created_at: string;
}

export interface PetPhoto {
  id: string;
  pet_id: string;
  image_url: string;
  notes: string | null;
  created_at: string;
}

export interface VaccinationRecord {
  id: string;
  pet_id: string;
  vaccine_name: string;
  vaccination_date: string;
  next_due_date: string | null;
  notes: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  total_products_amount: number;
  delivery_fee: number;
  total_amount: number;
  payment_method: PaymentMethod;
  status: OrderStatus;
  delivery_address: string;
  district: string | null;
  notes: string | null;
  created_at: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price_total_igv: number;
  subtotal: number;
  product?: Product;
}

export interface PetAvatarState {
  id: string;
  pet_id: string;
  avatar_style: Record<string, any> | null;
  last_recommendations: Record<string, any> | null;
  last_interaction_at: string | null;
  health_notes: string | null;
  preferences: Record<string, any> | null;
}

// Cart types
export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
}

// Status labels in Spanish
export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  recibido: 'Recibido',
  confirmado: 'Confirmado',
  preparando: 'Preparando',
  en_ruta: 'En ruta',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  efectivo: 'Efectivo',
  yape: 'Yape',
  plin: 'Plin',
  transferencia: 'Transferencia bancaria',
};

export const SPECIES_LABELS: Record<PetSpecies, string> = {
  perro: 'Perro',
  gato: 'Gato',
  otro: 'Otro',
};

export const SEX_LABELS: Record<PetSex, string> = {
  macho: 'Macho',
  hembra: 'Hembra',
  otro: 'Otro',
};

export const SPECIES_TARGET_LABELS: Record<SpeciesTarget, string> = {
  perro: 'Perros',
  gato: 'Gatos',
  ambos: 'Perros y gatos',
  otros: 'Otras mascotas',
};
