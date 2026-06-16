import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  SafeAreaView, Modal, ScrollView, TextInput, Alert, Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/theme';
import { useWedding } from '../context/WeddingContext';
import { Vendor, VendorCategory, VendorStatus } from '../types';

const CATEGORIES: VendorCategory[] = [
  'Photographer', 'Caterer', 'Florist', 'DJ / Band',
  'Venue', 'Hair & Makeup', 'Officiant', 'Transport', 'Other',
];

const STATUSES: VendorStatus[] = ['inquired', 'booked', 'deposit_paid', 'paid_in_full', 'cancelled'];

const STATUS_LABELS: Record<VendorStatus, string> = {
  inquired: 'Inquired', booked: 'Booked', deposit_paid: 'Deposit Paid',
  paid_in_full: 'Paid in Full', cancelled: 'Cancelled',
};

const STATUS_COLORS: Record<VendorStatus, string> = {
  inquired: '#FF9800', booked: '#2196F3', deposit_paid: '#9C27B0',
  paid_in_full: '#4CAF50', cancelled: '#F44336',
};

const CATEGORY_ICONS: Record<VendorCategory, string> = {
  'Photographer': '📸', 'Caterer': '🍽️', 'Florist': '💐', 'DJ / Band': '🎵',
  'Venue': '🏛️', 'Hair & Makeup': '💄', 'Officiant': '📜', 'Transport': '🚗', 'Other': '📦',
};

type FilterStatus = 'all' | VendorStatus;

const EMPTY_FORM: Omit<Vendor, 'id'> = {
  name: '', category: 'Other', contactPerson: '', phone: '', email: '',
  quotedCost: 0, status: 'inquired', contractSigned: false, notes: '',
};

function formatINR(n: number) {
  return '₹' + n.toLocaleString('en-IN');
}

export default function VendorsScreen() {
  const { vendors, addVendor, updateVendor, deleteVendor } = useWedding();
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<Vendor | null>(null);
  const [form, setForm] = useState<Omit<Vendor, 'id'>>(EMPTY_FORM);

  const filtered = useMemo(() =>
    filter === 'all' ? vendors : vendors.filter(v => v.status === filter),
    [vendors, filter]);

  const totalCommitted = useMemo(() =>
    vendors.filter(v => v.status !== 'cancelled').reduce((s, v) => s + v.quotedCost, 0),
    [vendors]);

  function openAdd() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalVisible(true);
  }

  function openEdit(vendor: Vendor) {
    setEditing(vendor);
    setForm({ name: vendor.name, category: vendor.category, contactPerson: vendor.contactPerson ?? '',
      phone: vendor.phone ?? '', email: vendor.email ?? '', quotedCost: vendor.quotedCost,
      status: vendor.status, contractSigned: vendor.contractSigned, notes: vendor.notes ?? '' });
    setModalVisible(true);
  }

  function save() {
    if (!form.name.trim()) return Alert.alert('Vendor name is required');
    if (editing) updateVendor(editing.id, form);
    else addVendor(form);
    setModalVisible(false);
  }

  function confirmDelete(id: string) {
    Alert.alert('Remove Vendor', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => deleteVendor(id) },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Vendors</Text>
        <Text style={styles.subtitle}>Total committed: {formatINR(totalCommitted)}</Text>
      </View>

      {/* Status filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContent}>
        {(['all', ...STATUSES] as FilterStatus[]).map(s => (
          <TouchableOpacity
            key={s}
            style={[styles.filterChip, filter === s && { backgroundColor: s === 'all' ? colors.primary : STATUS_COLORS[s as VendorStatus], borderColor: s === 'all' ? colors.primary : STATUS_COLORS[s as VendorStatus] }]}
            onPress={() => setFilter(s)}>
            <Text style={[styles.filterChipText, filter === s && styles.filterChipTextActive]}>
              {s === 'all' ? 'All' : STATUS_LABELS[s as VendorStatus]}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No vendors found. Tap + to add one.</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.vendorCard} onPress={() => openEdit(item)} activeOpacity={0.8}>
            <View style={styles.vendorTop}>
              <View style={styles.vendorIconBox}>
                <Text style={styles.vendorIcon}>{CATEGORY_ICONS[item.category]}</Text>
              </View>
              <View style={styles.vendorInfo}>
                <Text style={styles.vendorName}>{item.name}</Text>
                <Text style={styles.vendorCategory}>{item.category}</Text>
                {item.contactPerson ? <Text style={styles.vendorMeta}>👤 {item.contactPerson}</Text> : null}
                {item.phone ? <Text style={styles.vendorMeta}>📞 {item.phone}</Text> : null}
              </View>
              <View style={styles.vendorRight}>
                <Text style={styles.vendorCost}>{formatINR(item.quotedCost)}</Text>
                <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] + '20' }]}>
                  <Text style={[styles.statusText, { color: STATUS_COLORS[item.status] }]}>
                    {STATUS_LABELS[item.status]}
                  </Text>
                </View>
                {item.contractSigned && (
                  <View style={styles.contractBadge}>
                    <Ionicons name="document-text-outline" size={10} color="#4CAF50" />
                    <Text style={styles.contractText}>Contract</Text>
                  </View>
                )}
              </View>
            </View>
            <View style={styles.vendorActions}>
              <TouchableOpacity onPress={() => confirmDelete(item.id)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Text style={styles.deleteText}>Remove</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity style={styles.fab} onPress={openAdd}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalSafe}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{editing ? 'Edit Vendor' : 'Add Vendor'}</Text>
            <TouchableOpacity onPress={save}>
              <Text style={styles.modalSave}>Save</Text>
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.modalBody}>
            <Field label="Vendor Name *">
              <TextInput style={styles.input} value={form.name} onChangeText={v => setForm(p => ({ ...p, name: v }))} placeholder="e.g. Palace Grounds" placeholderTextColor={colors.textLight} />
            </Field>
            <Field label="Category">
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {CATEGORIES.map(cat => (
                    <TouchableOpacity key={cat} style={[styles.catChip, form.category === cat && styles.catChipActive]} onPress={() => setForm(p => ({ ...p, category: cat }))}>
                      <Text style={[styles.catChipText, form.category === cat && styles.catChipTextActive]}>{CATEGORY_ICONS[cat]} {cat}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </Field>
            <Field label="Contact Person">
              <TextInput style={styles.input} value={form.contactPerson} onChangeText={v => setForm(p => ({ ...p, contactPerson: v }))} placeholder="Name" placeholderTextColor={colors.textLight} />
            </Field>
            <Field label="Phone">
              <TextInput style={styles.input} value={form.phone} onChangeText={v => setForm(p => ({ ...p, phone: v }))} keyboardType="phone-pad" placeholder="9876543210" placeholderTextColor={colors.textLight} />
            </Field>
            <Field label="Email">
              <TextInput style={styles.input} value={form.email} onChangeText={v => setForm(p => ({ ...p, email: v }))} keyboardType="email-address" autoCapitalize="none" placeholder="vendor@email.com" placeholderTextColor={colors.textLight} />
            </Field>
            <Field label="Quoted Cost (₹)">
              <TextInput style={styles.input} value={form.quotedCost ? form.quotedCost.toString() : ''} onChangeText={v => setForm(p => ({ ...p, quotedCost: parseFloat(v) || 0 }))} keyboardType="numeric" placeholder="0" placeholderTextColor={colors.textLight} />
            </Field>
            <Field label="Status">
              <View style={{ gap: 8 }}>
                {STATUSES.map(s => (
                  <TouchableOpacity key={s} style={[styles.statusOption, form.status === s && { borderColor: STATUS_COLORS[s], backgroundColor: STATUS_COLORS[s] + '15' }]} onPress={() => setForm(p => ({ ...p, status: s }))}>
                    <View style={[styles.statusDot, { backgroundColor: STATUS_COLORS[s] }]} />
                    <Text style={[styles.statusOptionText, form.status === s && { color: STATUS_COLORS[s], fontWeight: '700' }]}>{STATUS_LABELS[s]}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Field>
            <Field label="Contract Signed">
              <Switch value={form.contractSigned} onValueChange={v => setForm(p => ({ ...p, contractSigned: v }))} trackColor={{ true: '#4CAF50' }} />
            </Field>
            <Field label="Notes">
              <TextInput style={[styles.input, styles.textArea]} value={form.notes} onChangeText={v => setForm(p => ({ ...p, notes: v }))} placeholder="Notes..." placeholderTextColor={colors.textLight} multiline numberOfLines={3} />
            </Field>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={{ fontSize: 12, fontWeight: '700', color: colors.textMid, letterSpacing: 0.5, marginBottom: 8, textTransform: 'uppercase' }}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 8 },
  title: { fontSize: 26, fontWeight: '800', color: colors.textDark },
  subtitle: { fontSize: 13, color: colors.textMid, marginTop: 4 },
  filterScroll: { maxHeight: 48 },
  filterContent: { paddingHorizontal: 20, paddingBottom: 8, gap: 8 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: colors.primaryLight, backgroundColor: colors.card },
  filterChipText: { fontSize: 12, color: colors.textMid, fontWeight: '600' },
  filterChipTextActive: { color: '#fff' },
  list: { padding: 20, paddingBottom: 100 },
  empty: { textAlign: 'center', color: colors.textLight, marginTop: 40, fontSize: 14 },
  vendorCard: { backgroundColor: colors.card, borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  vendorTop: { flexDirection: 'row' },
  vendorIconBox: { width: 48, height: 48, borderRadius: 14, backgroundColor: colors.primaryLight, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  vendorIcon: { fontSize: 22 },
  vendorInfo: { flex: 1 },
  vendorName: { fontSize: 16, fontWeight: '700', color: colors.textDark },
  vendorCategory: { fontSize: 12, color: colors.textLight, marginTop: 2 },
  vendorMeta: { fontSize: 12, color: colors.textMid, marginTop: 3 },
  vendorRight: { alignItems: 'flex-end' },
  vendorCost: { fontSize: 15, fontWeight: '800', color: colors.textDark },
  statusBadge: { marginTop: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  statusText: { fontSize: 10, fontWeight: '700' },
  contractBadge: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 3 },
  contractText: { fontSize: 10, color: '#4CAF50', fontWeight: '600' },
  vendorActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: colors.primaryLight },
  deleteText: { fontSize: 13, color: '#F44336', fontWeight: '600' },
  fab: { position: 'absolute', right: 24, bottom: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 },
  modalSafe: { flex: 1, backgroundColor: colors.background },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.primaryLight },
  modalTitle: { fontSize: 17, fontWeight: '700', color: colors.textDark },
  modalCancel: { fontSize: 15, color: colors.textMid },
  modalSave: { fontSize: 15, fontWeight: '700', color: colors.primary },
  modalBody: { padding: 20 },
  input: { backgroundColor: colors.card, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: colors.textDark, borderWidth: 1, borderColor: colors.primaryLight },
  textArea: { height: 80, textAlignVertical: 'top' },
  catChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: colors.primaryLight, backgroundColor: colors.card },
  catChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  catChipText: { fontSize: 12, color: colors.textMid, fontWeight: '600' },
  catChipTextActive: { color: '#fff' },
  statusOption: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 10, borderWidth: 1, borderColor: colors.primaryLight, backgroundColor: colors.card, gap: 10 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  statusOptionText: { fontSize: 14, color: colors.textMid },
});
