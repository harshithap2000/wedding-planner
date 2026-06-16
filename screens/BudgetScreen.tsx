import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, SectionList, TouchableOpacity,
  SafeAreaView, Modal, ScrollView, TextInput, Alert, Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/theme';
import { useWedding } from '../context/WeddingContext';
import { BudgetItem, BudgetCategory } from '../types';

const CATEGORIES: BudgetCategory[] = [
  'Venue', 'Catering', 'Photography', 'Flowers & Decor',
  'Music & Entertainment', 'Attire', 'Invitations', 'Transportation', 'Honeymoon', 'Miscellaneous',
];

const CATEGORY_ICONS: Record<BudgetCategory, string> = {
  'Venue': '🏛️', 'Catering': '🍽️', 'Photography': '📸', 'Flowers & Decor': '💐',
  'Music & Entertainment': '🎵', 'Attire': '👗', 'Invitations': '✉️',
  'Transportation': '🚗', 'Honeymoon': '✈️', 'Miscellaneous': '📦',
};

const EMPTY_FORM: Omit<BudgetItem, 'id'> = {
  category: 'Miscellaneous', name: '', estimatedCost: 0, actualCost: undefined, paid: false, notes: '',
};

function formatINR(n: number) {
  return '₹' + n.toLocaleString('en-IN');
}

export default function BudgetScreen() {
  const { budgetItems, budgetTotal, addBudgetItem, updateBudgetItem, deleteBudgetItem, setBudgetTotal } = useWedding();
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<BudgetItem | null>(null);
  const [form, setForm] = useState<Omit<BudgetItem, 'id'>>(EMPTY_FORM);
  const [editingTotal, setEditingTotal] = useState(false);
  const [totalInput, setTotalInput] = useState('');

  const totalSpent = useMemo(() =>
    budgetItems.reduce((sum, b) => sum + (b.actualCost ?? b.estimatedCost), 0),
    [budgetItems]);
  const totalEstimated = useMemo(() =>
    budgetItems.reduce((sum, b) => sum + b.estimatedCost, 0),
    [budgetItems]);
  const remaining = budgetTotal - totalSpent;
  const spentPct = Math.min((totalSpent / budgetTotal) * 100, 100);

  const sections = useMemo(() => {
    return CATEGORIES
      .map(cat => ({
        title: cat,
        data: budgetItems.filter(b => b.category === cat),
        subtotal: budgetItems.filter(b => b.category === cat)
          .reduce((s, b) => s + (b.actualCost ?? b.estimatedCost), 0),
      }))
      .filter(s => s.data.length > 0);
  }, [budgetItems]);

  function openAdd() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalVisible(true);
  }

  function openEdit(item: BudgetItem) {
    setEditing(item);
    setForm({ category: item.category, name: item.name, estimatedCost: item.estimatedCost,
      actualCost: item.actualCost, paid: item.paid, notes: item.notes ?? '' });
    setModalVisible(true);
  }

  function save() {
    if (!form.name.trim()) return Alert.alert('Name is required');
    if (editing) updateBudgetItem(editing.id, form);
    else addBudgetItem(form);
    setModalVisible(false);
  }

  function confirmDelete(id: string) {
    Alert.alert('Delete Item', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteBudgetItem(id) },
    ]);
  }

  function saveBudgetTotal() {
    const val = parseFloat(totalInput.replace(/,/g, ''));
    if (!isNaN(val) && val > 0) setBudgetTotal(val);
    setEditingTotal(false);
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Budget Overview */}
      <View style={styles.overviewCard}>
        <View style={styles.overviewHeader}>
          <Text style={styles.screenTitle}>Budget</Text>
          <TouchableOpacity onPress={() => { setTotalInput(budgetTotal.toString()); setEditingTotal(true); }}>
            <Ionicons name="pencil-outline" size={18} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {editingTotal ? (
          <View style={styles.totalEditRow}>
            <TextInput
              style={styles.totalInput}
              value={totalInput}
              onChangeText={setTotalInput}
              keyboardType="numeric"
              autoFocus
              onSubmitEditing={saveBudgetTotal}
            />
            <TouchableOpacity style={styles.totalSaveBtn} onPress={saveBudgetTotal}>
              <Text style={styles.totalSaveBtnText}>Set</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Text style={styles.totalBudgetText}>{formatINR(budgetTotal)} total budget</Text>
        )}

        <View style={styles.budgetStatsRow}>
          <MiniStat label="Spent" value={formatINR(totalSpent)} color={colors.primary} />
          <MiniStat label="Estimated" value={formatINR(totalEstimated)} color={colors.accent} />
          <MiniStat label="Remaining" value={formatINR(remaining)} color={remaining >= 0 ? '#4CAF50' : '#F44336'} />
        </View>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${spentPct}%`, backgroundColor: remaining < 0 ? '#F44336' : colors.primary }]} />
        </View>
        <Text style={styles.progressLabel}>{spentPct.toFixed(1)}% of budget used</Text>
      </View>

      {/* Items list */}
      <SectionList
        sections={sections}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No budget items yet. Tap + to add one.</Text>}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>
              {CATEGORY_ICONS[section.title as BudgetCategory]} {section.title}
            </Text>
            <Text style={styles.sectionSubtotal}>{formatINR(section.subtotal)}</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.itemCard} onPress={() => openEdit(item)} activeOpacity={0.8}>
            <View style={styles.itemLeft}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemEst}>Est: {formatINR(item.estimatedCost)}</Text>
            </View>
            <View style={styles.itemRight}>
              <Text style={styles.itemActual}>
                {item.actualCost != null ? formatINR(item.actualCost) : '—'}
              </Text>
              <View style={[styles.paidBadge, item.paid && styles.paidBadgeOn]}>
                <Text style={[styles.paidText, item.paid && styles.paidTextOn]}>
                  {item.paid ? 'Paid' : 'Unpaid'}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => confirmDelete(item.id)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} style={{ marginLeft: 8 }}>
              <Ionicons name="trash-outline" size={16} color={colors.textLight} />
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity style={styles.fab} onPress={openAdd}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Add/Edit Modal */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalSafe}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{editing ? 'Edit Item' : 'Add Item'}</Text>
            <TouchableOpacity onPress={save}>
              <Text style={styles.modalSave}>Save</Text>
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.modalBody}>
            <Field label="Item Name *">
              <TextInput style={styles.input} value={form.name} onChangeText={v => setForm(p => ({ ...p, name: v }))} placeholder="e.g. Wedding Hall Booking" placeholderTextColor={colors.textLight} />
            </Field>
            <Field label="Category">
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {CATEGORIES.map(cat => (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.catChip, form.category === cat && styles.catChipActive]}
                      onPress={() => setForm(p => ({ ...p, category: cat }))}>
                      <Text style={[styles.catChipText, form.category === cat && styles.catChipTextActive]}>
                        {CATEGORY_ICONS[cat]} {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </Field>
            <Field label="Estimated Cost (₹)">
              <TextInput style={styles.input} value={form.estimatedCost ? form.estimatedCost.toString() : ''} onChangeText={v => setForm(p => ({ ...p, estimatedCost: parseFloat(v) || 0 }))} keyboardType="numeric" placeholder="0" placeholderTextColor={colors.textLight} />
            </Field>
            <Field label="Actual Cost (₹)">
              <TextInput style={styles.input} value={form.actualCost != null ? form.actualCost.toString() : ''} onChangeText={v => setForm(p => ({ ...p, actualCost: v ? parseFloat(v) : undefined }))} keyboardType="numeric" placeholder="Leave blank if unknown" placeholderTextColor={colors.textLight} />
            </Field>
            <Field label="Paid">
              <Switch value={form.paid} onValueChange={v => setForm(p => ({ ...p, paid: v }))} trackColor={{ true: colors.primary }} />
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

function MiniStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <Text style={{ fontSize: 14, fontWeight: '800', color }}>{value}</Text>
      <Text style={{ fontSize: 10, color: colors.textLight, marginTop: 2, fontWeight: '600' }}>{label}</Text>
    </View>
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
  overviewCard: { margin: 20, backgroundColor: colors.card, borderRadius: 20, padding: 20, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 10, elevation: 4 },
  overviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  screenTitle: { fontSize: 26, fontWeight: '800', color: colors.textDark },
  totalBudgetText: { fontSize: 14, color: colors.textMid, marginBottom: 16 },
  totalEditRow: { flexDirection: 'row', marginBottom: 16, gap: 8 },
  totalInput: { flex: 1, backgroundColor: colors.background, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, fontSize: 15, color: colors.textDark, borderWidth: 1, borderColor: colors.primaryLight },
  totalSaveBtn: { backgroundColor: colors.primary, borderRadius: 8, paddingHorizontal: 16, justifyContent: 'center' },
  totalSaveBtnText: { color: '#fff', fontWeight: '700' },
  budgetStatsRow: { flexDirection: 'row', marginBottom: 16 },

  progressTrack: { height: 8, backgroundColor: colors.primaryLight, borderRadius: 99, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 99 },
  progressLabel: { fontSize: 11, color: colors.textLight, marginTop: 6, fontWeight: '600' },
  list: { paddingHorizontal: 20, paddingBottom: 100 },
  empty: { textAlign: 'center', color: colors.textLight, marginTop: 40, fontSize: 14 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8, marginTop: 4 },
  sectionHeaderText: { fontSize: 13, fontWeight: '700', color: colors.textDark },
  sectionSubtotal: { fontSize: 13, fontWeight: '700', color: colors.primary },
  itemCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: 12, padding: 14, marginBottom: 8, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  itemLeft: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: '600', color: colors.textDark },
  itemEst: { fontSize: 12, color: colors.textLight, marginTop: 2 },
  itemRight: { alignItems: 'flex-end', marginRight: 4 },
  itemActual: { fontSize: 14, fontWeight: '700', color: colors.textDark },
  paidBadge: { marginTop: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, backgroundColor: colors.primaryLight },
  paidBadgeOn: { backgroundColor: '#E8F5E9' },
  paidText: { fontSize: 10, fontWeight: '700', color: colors.primary },
  paidTextOn: { color: '#4CAF50' },
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
});
