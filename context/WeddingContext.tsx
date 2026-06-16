import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Guest, BudgetItem, Vendor, ChecklistItem, ChecklistCategory } from '../types';

const DEFAULT_CHECKLIST: ChecklistItem[] = [
  { id: 'c1', title: 'Set a wedding budget', category: 'Planning', completed: false, dueDate: '2026-07-01' },
  { id: 'c2', title: 'Finalise guest list', category: 'Planning', completed: false, dueDate: '2026-07-15' },
  { id: 'c3', title: 'Choose a wedding date', category: 'Planning', completed: true },
  { id: 'c4', title: 'Book the venue', category: 'Venue & Catering', completed: false, dueDate: '2026-08-01' },
  { id: 'c5', title: 'Hire a caterer', category: 'Venue & Catering', completed: false, dueDate: '2026-08-15' },
  { id: 'c6', title: 'Book photographer & videographer', category: 'Vendors', completed: false, dueDate: '2026-08-01' },
  { id: 'c7', title: 'Book florist', category: 'Vendors', completed: false, dueDate: '2026-09-01' },
  { id: 'c8', title: 'Book DJ / Band', category: 'Vendors', completed: false, dueDate: '2026-09-01' },
  { id: 'c9', title: 'Order wedding attire (bride)', category: 'Attire', completed: false, dueDate: '2026-09-01' },
  { id: 'c10', title: 'Order wedding attire (groom)', category: 'Attire', completed: false, dueDate: '2026-09-01' },
  { id: 'c11', title: 'Send save-the-dates', category: 'Guests', completed: false, dueDate: '2026-09-15' },
  { id: 'c12', title: 'Send wedding invitations', category: 'Guests', completed: false, dueDate: '2026-10-15' },
  { id: 'c13', title: 'Arrange transportation for guests', category: 'Guests', completed: false, dueDate: '2026-11-01' },
  { id: 'c14', title: 'Book hair & makeup artist', category: 'Vendors', completed: false, dueDate: '2026-09-01' },
  { id: 'c15', title: 'Plan honeymoon', category: 'Planning', completed: false, dueDate: '2026-10-01' },
  { id: 'c16', title: 'Confirm all vendor bookings', category: 'Week Before', completed: false, dueDate: '2026-12-13' },
  { id: 'c17', title: 'Prepare final guest count for caterer', category: 'Week Before', completed: false, dueDate: '2026-12-13' },
  { id: 'c18', title: 'Prepare payments for vendors', category: 'Week Before', completed: false, dueDate: '2026-12-13' },
  { id: 'c19', title: 'Wedding rehearsal', category: 'Day Of', completed: false, dueDate: '2026-12-19' },
  { id: 'c20', title: 'Enjoy the wedding!', category: 'Day Of', completed: false, dueDate: '2026-12-20' },
];

const DEFAULT_BUDGET_ITEMS: BudgetItem[] = [
  { id: 'b1', category: 'Venue', name: 'Palace Grounds Booking', estimatedCost: 150000, actualCost: 145000, paid: true },
  { id: 'b2', category: 'Catering', name: 'Catering & Beverages', estimatedCost: 120000, actualCost: 42500, paid: false },
  { id: 'b3', category: 'Photography', name: 'Photographer + Videographer', estimatedCost: 80000, paid: false },
  { id: 'b4', category: 'Flowers & Decor', name: 'Floral Arrangements', estimatedCost: 60000, paid: false },
  { id: 'b5', category: 'Attire', name: "Bride's Lehenga & Jewellery", estimatedCost: 50000, paid: false },
  { id: 'b6', category: 'Music & Entertainment', name: 'DJ + Sound System', estimatedCost: 25000, paid: false },
  { id: 'b7', category: 'Invitations', name: 'Invitation Cards & Printing', estimatedCost: 15000, paid: true },
];

const DEFAULT_VENDORS: Vendor[] = [
  { id: 'v1', name: 'Palace Grounds', category: 'Venue', contactPerson: 'Rajan Kumar', phone: '9876543210', quotedCost: 145000, status: 'paid_in_full', contractSigned: true },
  { id: 'v2', name: 'Spice Garden Caterers', category: 'Caterer', contactPerson: 'Meena Iyer', phone: '9845012345', quotedCost: 120000, status: 'booked', contractSigned: true },
  { id: 'v3', name: 'Frames by Rohan', category: 'Photographer', phone: '9900112233', quotedCost: 80000, status: 'deposit_paid', contractSigned: true },
];

const DEFAULT_GUESTS: Guest[] = [
  { id: 'g1', name: 'Priya Sharma', phone: '9812345678', rsvpStatus: 'confirmed', plusOne: false, side: 'bride', mealPreference: 'veg' },
  { id: 'g2', name: 'Karthik Reddy', phone: '9823456789', rsvpStatus: 'confirmed', plusOne: true, side: 'groom', mealPreference: 'non-veg' },
  { id: 'g3', name: 'Anjali Nair', rsvpStatus: 'pending', plusOne: false, side: 'bride', mealPreference: 'vegan' },
  { id: 'g4', name: 'Vikram Mehta', phone: '9856789012', rsvpStatus: 'declined', plusOne: false, side: 'groom', mealPreference: 'non-veg' },
];

interface WeddingContextValue {
  guests: Guest[];
  budgetItems: BudgetItem[];
  budgetTotal: number;
  vendors: Vendor[];
  checklist: ChecklistItem[];
  addGuest: (guest: Omit<Guest, 'id'>) => void;
  updateGuest: (id: string, updates: Partial<Guest>) => void;
  deleteGuest: (id: string) => void;
  addBudgetItem: (item: Omit<BudgetItem, 'id'>) => void;
  updateBudgetItem: (id: string, updates: Partial<BudgetItem>) => void;
  deleteBudgetItem: (id: string) => void;
  setBudgetTotal: (total: number) => void;
  addVendor: (vendor: Omit<Vendor, 'id'>) => void;
  updateVendor: (id: string, updates: Partial<Vendor>) => void;
  deleteVendor: (id: string) => void;
  addChecklistItem: (item: Omit<ChecklistItem, 'id'>) => void;
  toggleChecklistItem: (id: string) => void;
  deleteChecklistItem: (id: string) => void;
}

const WeddingContext = createContext<WeddingContextValue | null>(null);

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2);

export function WeddingProvider({ children }: { children: ReactNode }) {
  const [guests, setGuests] = useState<Guest[]>(DEFAULT_GUESTS);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>(DEFAULT_BUDGET_ITEMS);
  const [budgetTotal, setBudgetTotal] = useState(500000);
  const [vendors, setVendors] = useState<Vendor[]>(DEFAULT_VENDORS);
  const [checklist, setChecklist] = useState<ChecklistItem[]>(DEFAULT_CHECKLIST);

  return (
    <WeddingContext.Provider value={{
      guests, budgetItems, budgetTotal, vendors, checklist,
      addGuest: (g) => setGuests(prev => [...prev, { ...g, id: uid() }]),
      updateGuest: (id, u) => setGuests(prev => prev.map(g => g.id === id ? { ...g, ...u } : g)),
      deleteGuest: (id) => setGuests(prev => prev.filter(g => g.id !== id)),
      addBudgetItem: (item) => setBudgetItems(prev => [...prev, { ...item, id: uid() }]),
      updateBudgetItem: (id, u) => setBudgetItems(prev => prev.map(b => b.id === id ? { ...b, ...u } : b)),
      deleteBudgetItem: (id) => setBudgetItems(prev => prev.filter(b => b.id !== id)),
      setBudgetTotal,
      addVendor: (v) => setVendors(prev => [...prev, { ...v, id: uid() }]),
      updateVendor: (id, u) => setVendors(prev => prev.map(v => v.id === id ? { ...v, ...u } : v)),
      deleteVendor: (id) => setVendors(prev => prev.filter(v => v.id !== id)),
      addChecklistItem: (item) => setChecklist(prev => [...prev, { ...item, id: uid() }]),
      toggleChecklistItem: (id) => setChecklist(prev => prev.map(c => c.id === id ? { ...c, completed: !c.completed } : c)),
      deleteChecklistItem: (id) => setChecklist(prev => prev.filter(c => c.id !== id)),
    }}>
      {children}
    </WeddingContext.Provider>
  );
}

export function useWedding() {
  const ctx = useContext(WeddingContext);
  if (!ctx) throw new Error('useWedding must be used within WeddingProvider');
  return ctx;
}
