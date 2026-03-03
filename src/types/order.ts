import type { Database, OrderStatus } from './database';

export type Order = Database['public']['Tables']['orders']['Row'];
export type OrderInsert = Database['public']['Tables']['orders']['Insert'];
export type Founder = Database['public']['Tables']['founders']['Row'];
export type FounderInsert = Database['public']['Tables']['founders']['Insert'];
export type OrderStatusHistory = Database['public']['Tables']['order_status_history']['Row'];
export type Addon = Database['public']['Tables']['addons']['Row'];

export type OrderWithRelations = Order & {
  country: Database['public']['Tables']['countries']['Row'];
  entity_type: Database['public']['Tables']['entity_types']['Row'];
  founders: Founder[];
  client?: Database['public']['Tables']['profiles']['Row'];
  partner?: Database['public']['Tables']['profiles']['Row'] | null;
  status_history?: OrderStatusHistory[];
  conversation?: Database['public']['Tables']['conversations']['Row'] | null;
};

export const ORDER_STATUS_FLOW: Record<OrderStatus, OrderStatus[]> = {
  draft: ['submitted'],
  submitted: ['under_review', 'cancelled'],
  under_review: ['documents_requested', 'in_progress', 'cancelled'],
  documents_requested: ['documents_received', 'cancelled'],
  documents_received: ['in_progress', 'cancelled'],
  in_progress: ['government_filing', 'cancelled'],
  government_filing: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  draft: 'bg-gray-100 text-gray-800',
  submitted: 'bg-blue-100 text-blue-800',
  under_review: 'bg-yellow-100 text-yellow-800',
  documents_requested: 'bg-orange-100 text-orange-800',
  documents_received: 'bg-indigo-100 text-indigo-800',
  in_progress: 'bg-purple-100 text-purple-800',
  government_filing: 'bg-cyan-100 text-cyan-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export interface WizardState {
  step: number;
  countryId: string | null;
  entityTypeId: string | null;
  companyName: string;
  companyActivity: string;
  companyAddress: string;
  founders: FounderFormData[];
  countryFields: Record<string, unknown>;
  addons: {
    nomineeDirector: boolean;
    nomineeShareholder: boolean;
    accounting: boolean;
    bookkeeping: boolean;
  };
}

export interface FounderFormData {
  fullName: string;
  email: string;
  phone: string;
  nationality: string;
  dateOfBirth: string;
  documentType: string;
  documentNumber: string;
  taxId: string;
  ownershipPercentage: number;
  isDirector: boolean;
  extraData: Record<string, unknown>;
}
