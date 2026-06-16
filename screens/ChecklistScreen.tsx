import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, SectionList, TouchableOpacity,
  SafeAreaView, Modal, ScrollView, TextInput, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/theme';
import { useWedding } from '../context/WeddingContext';
import { ChecklistItem, ChecklistCategory } from '../types';

const CATEGORIES: ChecklistCategory[] = [
  'Planning', 'Venue & Catering', 'Attire', 'Vendors', 'Guests', 'Week Before', 'Day Of',
];

const CATEGORY_ICONS: Record<ChecklistCategory, string> = {
  'Planning': '📋', 'Venue & Catering': '🏛️', 'Attire': '👗',
  'Vendors': '🤝', 'Guests': '👥', 'Week Before': '📅', 'Day Of': '💍',
};

const EMPTY_FORM: Omit<ChecklistItem, 'id'> = {
  title: '', category: 'Planning', completed: false, dueDate: '', notes: '',
};

type Filter = 'all' | 'pending' | 'done';

export default function ChecklistScreen() {
  const { checklist, addChecklistItem, toggleChecklistItem, deleteChecklistItem } = useWedding();
  const [filter, setFilter] = useState<Filter>('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [form, setForm] = useState<Omit<ChecklistItem, 'id'>>(EMPTY_FORM);

  const filtered = useMemo(() => {
    if (filter === 'pending') return checklist.filter(c => !c.completed);
    if (filter === 'done') return checklist.filter(c => c.completed);
    return checklist;
  }, [checklist, filter]);

  const sections = useMemo(() =>
    CATEGORIES
      .map(cat => ({ title: cat, data: filtered.filter(c => c.category === cat) }))
      .filter(s => s.data.length > 0),
    [filtered]);

  const completedCount = checklist.filter(c => c.completed).length;
  const pct = checklist.length > 0 ? (completedCount / checklist.length) * 100 : 0;

  function save() {
    if (!form.title.trim()) return Alert.alert('Title is required');
    addChecklistItem(form);
    setModalVisible(false);
    setForm(EMPTY_FORM);
  }

  function confirmDelete(id: string) {
    Alert.alert('Delete Task', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteChecklistItem(id) },
    ]);
  }

  function isOverdue(item: ChecklistItem) {
    if (!item.dueDate || item.completed) return false;
    return new Date(item.dueDate) < new Date();
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Progress header */}
      <View style={styles.header}>
        <Text style={styles.title}>Checklist</Text>
        <Text style={styles.subtitle}>{completedCount} of {checklist.length} tasks complete</Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${pct}%` }]} />
        </View>
        <Text style={styles.pctText}>{pct.toFixed(0)}% done</Text>
      </View>

      {/* Filter */}
      <View style={styles.filterRow}>
        {(['all', 'pending', 'done'] as Filter[]).map(f => (
          <TouchableOpacity key={f} style={[styles.filterTab, filter === f && styles.filterTabActive]} onPress={() => setFilter(f)}>
            <Text style={[styles.filterTabText, filter === f && styles.filterTabTextActive]}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <SectionList
        sections={sections}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No tasks found.</Text>}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderText}>
              {CATEGORY_ICONS[section.title as ChecklistCategory]} {section.title}
            </Text>
            <Text style={styles.sectionCount}>
              {section.data.filter(c => c.completed).length}/{section.data.length}
            </Text>
          </View>
        )}
        renderItem={({ item }) => (
          <View style={[styles.taskCard, item.completed && styles.taskCardDone]}>
            <TouchableOpacity style={styles.checkbox} onPress={() => toggleChecklistItem(item.id)}>
              {item.completed
                ? <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                : <Ionicons name="ellipse-outline" size={24} color={colors.textLight} />}
            </TouchableOpacity>
            <View style={styles.taskBody}>
              <Text style={[styles.taskTitle, item.completed && styles.taskTitleDone]}>{item.title}</Text>
              {item.dueDate ? (
                <View style={styles.dueDateRow}>
                  <Ionicons name="calendar-outline" size={12} color={isOverdue(item) ? '#F44336' : colors.textLight} />
                  <Text style={[styles.dueDate, isOverdue(item) && styles.overdue]}>
                    {new Date(item.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {isOverdue(item) ? ' · Overdue' : ''}
                  </Text>
                </View>
              ) : null}
              {item.notes ? <Text style={styles.taskNotes}>{item.notes}</Text> : null}
            </View>
            <TouchableOpacity onPress={() => confirmDelete(item.id)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="trash-outline" size={16} color={colors.textLight} />
            </TouchableOpacity>
          </View>
        )}
      />

      <TouchableOpacity style={styles.fab} onPress={() => { setForm(EMPTY_FORM); setModalVisible(true); }}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalSafe}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Task</Text>
            <TouchableOpacity onPress={save}>
              <Text style={styles.modalSave}>Save</Text>
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.modalBody}>
            <Field label="Task Title *">
              <TextInput style={styles.input} value={form.title} onChangeText={v => setForm(p => ({ ...p, title: v }))} placeholder="e.g. Book the venue" placeholderTextColor={colors.textLight} />
            </Field>
            <Field label="Category">
              <View style={styles.catGrid}>
                {CATEGORIES.map(cat => (
                  <TouchableOpacity key={cat} style={[styles.catChip, form.category === cat && styles.catChipActive]} onPress={() => setForm(p => ({ ...p, category: cat }))}>
                    <Text style={[styles.catChipText, form.category === cat && styles.catChipTextActive]}>
                      {CATEGORY_ICONS[cat]} {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Field>
            <Field label="Due Date (YYYY-MM-DD)">
              <TextInput style={styles.input} value={form.dueDate} onChangeText={v => setForm(p => ({ ...p, dueDate: v }))} placeholder="2026-10-01" placeholderTextColor={colors.textLight} />
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
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 },
  title: { fontSize: 26, fontWeight: '800', color: colors.textDark },
  subtitle: { fontSize: 13, color: colors.textMid, marginTop: 4, marginBottom: 12 },
  progressTrack: { height: 8, backgroundColor: colors.primaryLight, borderRadius: 99, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 99 },
  pctText: { fontSize: 11, color: colors.textLight, marginTop: 5, fontWeight: '600' },
  filterRow: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 8, gap: 8 },
  filterTab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.primaryLight },
  filterTabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterTabText: { fontSize: 12, color: colors.textMid, fontWeight: '600' },
  filterTabTextActive: { color: '#fff' },
  list: { paddingHorizontal: 20, paddingBottom: 100 },
  empty: { textAlign: 'center', color: colors.textLight, marginTop: 40, fontSize: 14 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, marginTop: 4 },
  sectionHeaderText: { fontSize: 13, fontWeight: '700', color: colors.textDark },
  sectionCount: { fontSize: 12, color: colors.primary, fontWeight: '700' },
  taskCard: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: colors.card, borderRadius: 12, padding: 14, marginBottom: 8, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  taskCardDone: { opacity: 0.6 },
  checkbox: { marginRight: 12, marginTop: 1 },
  taskBody: { flex: 1 },
  taskTitle: { fontSize: 14, fontWeight: '600', color: colors.textDark },
  taskTitleDone: { textDecorationLine: 'line-through', color: colors.textLight },
  dueDateRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 4 },
  dueDate: { fontSize: 11, color: colors.textLight },
  overdue: { color: '#F44336', fontWeight: '600' },
  taskNotes: { fontSize: 12, color: colors.textLight, marginTop: 4 },
  fab: { position: 'absolute', right: 24, bottom: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 },
  modalSafe: { flex: 1, backgroundColor: colors.background },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.primaryLight },
  modalTitle: { fontSize: 17, fontWeight: '700', color: colors.textDark },
  modalCancel: { fontSize: 15, color: colors.textMid },
  modalSave: { fontSize: 15, fontWeight: '700', color: colors.primary },
  modalBody: { padding: 20 },
  input: { backgroundColor: colors.card, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: colors.textDark, borderWidth: 1, borderColor: colors.primaryLight },
  textArea: { height: 80, textAlignVertical: 'top' },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  catChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: colors.primaryLight, backgroundColor: colors.card },
  catChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  catChipText: { fontSize: 12, color: colors.textMid, fontWeight: '600' },
  catChipTextActive: { color: '#fff' },
});
