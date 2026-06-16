export type RSVPStatus = 'pending' | 'confirmed' | 'declined';
export type MealPreference = 'veg' | 'non-veg' | 'vegan' | 'none';

export interface Guest {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  rsvpStatus: RSVPStatus;
  plusOne: boolean;
  side: 'bride' | 'groom' | 'both';
  mealPreference: MealPreference;
  notes?: string;
}

export type BudgetCategory =
  | 'Venue'
  | 'Catering'
  | 'Photography'
  | 'Flowers & Decor'
  | 'Music & Entertainment'
  | 'Attire'
  | 'Invitations'
  | 'Transportation'
  | 'Honeymoon'
  | 'Miscellaneous';

export interface BudgetItem {
  id: string;
  category: BudgetCategory;
  name: string;
  estimatedCost: number;
  actualCost?: number;
  paid: boolean;
  notes?: string;
}

export type VendorCategory =
  | 'Photographer'
  | 'Caterer'
  | 'Florist'
  | 'DJ / Band'
  | 'Venue'
  | 'Hair & Makeup'
  | 'Officiant'
  | 'Transport'
  | 'Other';

export type VendorStatus = 'inquired' | 'booked' | 'deposit_paid' | 'paid_in_full' | 'cancelled';

export interface Vendor {
  id: string;
  name: string;
  category: VendorCategory;
  contactPerson?: string;
  phone?: string;
  email?: string;
  quotedCost: number;
  status: VendorStatus;
  contractSigned: boolean;
  notes?: string;
}

export type ChecklistCategory =
  | 'Planning'
  | 'Venue & Catering'
  | 'Attire'
  | 'Vendors'
  | 'Guests'
  | 'Week Before'
  | 'Day Of';

export interface ChecklistItem {
  id: string;
  title: string;
  category: ChecklistCategory;
  completed: boolean;
  dueDate?: string;
  notes?: string;
}
