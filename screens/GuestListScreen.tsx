import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  SafeAreaView, TextInput, Modal, ScrollView, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/theme';
import { useWedding } from '../context/WeddingContext';
import { Guest, RSVPStatus, MealPreference } from '../types';

const RSVP_COLORS: Record<RSVPStatus, string> = {
  confirmed: '#4CAF50',
  pending: '#FF9800',
  declined: '#F44336',
};

const RSVP_LABELS: Record<RSVPStatus, string> = {
  confirmed: 'Confirmed',
  pending: 'Pending',
  declined: 'Declined',
};

type FilterTab = 'all' | 'bride' | 'groom';

const EMPTY_FORM: Omit<Guest, 'id'> = {
  name: '', phone: '', email: '', rsvpStatus: 'pending',
  plusOne: false, side: 'both', mealPreference: 'veg', notes: '',
};

export default function GuestListScreen() {
  const { guests, addGuest, updateGuest, deleteGuest } = useWedding();
  const [filter, setFilter] = useState<FilterTab>('all');
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState<Guest | null>(null);
  const [form, setForm] = useState<Omit<Guest, 'id'>>(EMPTY_FORM);

  const filtered = useMemo(() => {
    return guests.filter(g => {
      const matchesSide = filter === 'all' || g.side === filter || g.side === 'both';
      const matchesSearch = g.name.toLowerCase().includes(search.toLowerCase());
      return matchesSide && matchesSearch;
    });
  }, [guests, filter, search]);

  const stats = useMemo(() => ({
    total: guests.length,
    confirmed: guests.filter(g => g.rsvpStatus === 'confirmed').length,
    pending: guests.filter(g => g.rsvpStatus === 'pending').length,
    declined: guests.filter(g => g.rsvpStatus === 'declined').length,
  }), [guests]);

  function openAdd() {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModalVisible(true);
  }

  function openEdit(guest: Guest) {
    setEditing(guest);
    setForm({ name: guest.name, phone: guest.phone ?? '', email: guest.email ?? '',
      rsvpStatus: guest.rsvpStatus, plusOne: guest.plusOne, side: guest.side,
      mealPreference: guest.mealPreference, notes: guest.notes ?? '' });
    setModalVisible(true);
  }

  function save() {
    if (!form.name.trim()) return Alert.alert('Name is required');
    if (editing) updateGuest(editing.id, form);
    else addGuest(form);
    setModalVisible(false);
  }

  function confirmDelete(id: string) {
    Alert.alert('Remove Guest', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => deleteGuest(id) },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Guest List</Text>
        <View style={styles.statsRow}>
          <StatChip label="Total" value={stats.total} color={colors.primary} />
          <StatChip label="Confirmed" value={stats.confirmed} color="#4CAF50" />
          <StatChip label="Pending" value={stats.pending} color="#FF9800" />
          <StatChip label="Declined" value={stats.declined} color="#F44336" />
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <Ionicons name="search" size={16} color={colors.textLight} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search guests..."
          placeholderTextColor={colors.textLight}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Filter tabs */}
      <View style={styles.filterRow}>
        {(['all', 'bride', 'groom'] as FilterTab[]).map(f => (
          <TouchableOpacity key={f} style={[styles.filterTab, filter === f && styles.filterTabActive]} onPress={() => setFilter(f)}>
            <Text style={[styles.filterTabText, filter === f && styles.filterTabTextActive]}>
              {f === 'all' ? 'All' : f === 'bride' ? "Bride's Side" : "Groom's Side"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.empty}>No guests found</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.guestCard} onPress={() => openEdit(item)} activeOpacity={0.8}>
            <View style={styles.guestAvatar}>
              <Text style={styles.guestAvatarText}>{item.name.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.guestInfo}>
              <Text style={styles.guestName}>{item.name}{item.plusOne ? ' +1' : ''}</Text>
              <Text style={styles.guestMeta}>{item.mealPreference} · {item.side}</Text>
            </View>
            <View style={styles.guestRight}>
              <View style={[styles.rsvpBadge, { backgroundColor: RSVP_COLORS[item.rsvpStatus] + '20' }]}>
                <Text style={[styles.rsvpText, { color: RSVP_COLORS[item.rsvpStatus] }]}>
                  {RSVP_LABELS[item.rsvpStatus]}
                </Text>
              </View>
              <TouchableOpacity onPress={() => confirmDelete(item.id)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Ionicons name="trash-outline" size={16} color={colors.textLight} style={{ marginTop: 6 }} />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={openAdd}>
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>

      {/* Modal */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalSafe}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.modalCancel}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{editing ? 'Edit Guest' : 'Add Guest'}</Text>
            <TouchableOpacity onPress={save}>
              <Text style={styles.modalSave}>Save</Text>
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.modalBody}>
            <Field label="Full Name *">
              <TextInput style={styles.input} value={form.name} onChangeText={v => setForm(p => ({ ...p, name: v }))} placeholder="e.g. Priya Sharma" placeholderTextColor={colors.textLight} />
            </Field>
            <Field label="Phone">
              <TextInput style={styles.input} value={form.phone} onChangeText={v => setForm(p => ({ ...p, phone: v }))} placeholder="9876543210" keyboardType="phone-pad" placeholderTextColor={colors.textLight} />
            </Field>
            <Field label="Email">
              <TextInput style={styles.input} value={form.email} onChangeText={v => setForm(p => ({ ...p, email: v }))} placeholder="email@example.com" keyboardType="email-address" autoCapitalize="none" placeholderTextColor={colors.textLight} />
            </Field>
            <Field label="RSVP Status">
              <SegmentControl
                options={['pending', 'confirmed', 'declined']}
                labels={['Pending', 'Confirmed', 'Declined']}
                value={form.rsvpStatus}
                onChange={v => setForm(p => ({ ...p, rsvpStatus: v as RSVPStatus }))}
                colors={['#FF9800', '#4CAF50', '#F44336']}
              />
            </Field>
            <Field label="Side">
              <SegmentControl
                options={['bride', 'groom', 'both']}
                labels={["Bride's", "Groom's", 'Both']}
                value={form.side}
                onChange={v => setForm(p => ({ ...p, side: v as Guest['side'] }))}
              />
            </Field>
            <Field label="Meal Preference">
              <SegmentControl
                options={['veg', 'non-veg', 'vegan', 'none']}
                labels={['Veg', 'Non-Veg', 'Vegan', 'None']}
                value={form.mealPreference}
                onChange={v => setForm(p => ({ ...p, mealPreference: v as MealPreference }))}
              />
            </Field>
            <Field label="Plus One">
              <TouchableOpacity style={[styles.toggle, form.plusOne && styles.toggleOn]} onPress={() => setForm(p => ({ ...p, plusOne: !p.plusOne }))}>
                <Text style={[styles.toggleText, form.plusOne && styles.toggleTextOn]}>{form.plusOne ? 'Yes' : 'No'}</Text>
              </TouchableOpacity>
            </Field>
            <Field label="Notes">
              <TextInput style={[styles.input, styles.textArea]} value={form.notes} onChangeText={v => setForm(p => ({ ...p, notes: v }))} placeholder="Any special notes..." placeholderTextColor={colors.textLight} multiline numberOfLines={3} />
            </Field>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

function StatChip({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={[statStyles.chip, { borderColor: color + '40', backgroundColor: color + '15' }]}>
      <Text style={[statStyles.value, { color }]}>{value}</Text>
      <Text style={statStyles.label}>{label}</Text>
    </View>
  );
}

const statStyles = StyleSheet.create({
  chip: { alignItems: 'center', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1, marginRight: 8 },
  value: { fontSize: 18, fontWeight: '800' },
  label: { fontSize: 10, color: colors.textLight, fontWeight: '600', marginTop: 1 },
});

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={fieldStyles.container}>
      <Text style={fieldStyles.label}>{label}</Text>
      {children}
    </View>
  );
}
const fieldStyles = StyleSheet.create({
  container: { marginBottom: 20 },
  label: { fontSize: 12, fontWeight: '700', color: colors.textMid, letterSpacing: 0.5, marginBottom: 8, textTransform: 'uppercase' },
});

function SegmentControl({ options, labels, value, onChange, colors: optColors }: {
  options: string[]; labels: string[]; value: string; onChange: (v: string) => void; colors?: string[];
}) {
  return (
    <View style={segStyles.row}>
      {options.map((opt, i) => {
        const active = value === opt;
        const activeColor = optColors?.[i] ?? colors.primary;
        return (
          <TouchableOpacity key={opt} style={[segStyles.seg, active && { backgroundColor: activeColor, borderColor: activeColor }]} onPress={() => onChange(opt)}>
            <Text style={[segStyles.text, active && segStyles.textActive]}>{labels[i]}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
const segStyles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  seg: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: colors.primaryLight },
  text: { fontSize: 13, color: colors.textMid, fontWeight: '600' },
  textActive: { color: '#fff' },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12 },
  title: { fontSize: 26, fontWeight: '800', color: colors.textDark, marginBottom: 14 },
  statsRow: { flexDirection: 'row' },
  searchRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 12, backgroundColor: colors.card, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 14, color: colors.textDark },
  filterRow: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 12, gap: 8 },
  filterTab: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.primaryLight },
  filterTabActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  filterTabText: { fontSize: 12, color: colors.textMid, fontWeight: '600' },
  filterTabTextActive: { color: '#fff' },
  list: { paddingHorizontal: 20, paddingBottom: 100 },
  empty: { textAlign: 'center', color: colors.textLight, marginTop: 40, fontSize: 14 },
  guestCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.card, borderRadius: 14, padding: 14, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  guestAvatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primaryLight, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  guestAvatarText: { fontSize: 18, fontWeight: '700', color: colors.primary },
  guestInfo: { flex: 1 },
  guestName: { fontSize: 15, fontWeight: '700', color: colors.textDark },
  guestMeta: { fontSize: 12, color: colors.textLight, marginTop: 2, textTransform: 'capitalize' },
  guestRight: { alignItems: 'flex-end' },
  rsvpBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  rsvpText: { fontSize: 11, fontWeight: '700' },
  fab: { position: 'absolute', right: 24, bottom: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6 },
  modalSafe: { flex: 1, backgroundColor: colors.background },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: colors.primaryLight },
  modalTitle: { fontSize: 17, fontWeight: '700', color: colors.textDark },
  modalCancel: { fontSize: 15, color: colors.textMid },
  modalSave: { fontSize: 15, fontWeight: '700', color: colors.primary },
  modalBody: { padding: 20 },
  input: { backgroundColor: colors.card, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, color: colors.textDark, borderWidth: 1, borderColor: colors.primaryLight },
  textArea: { height: 80, textAlignVertical: 'top' },
  toggle: { alignSelf: 'flex-start', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: colors.primaryLight, backgroundColor: colors.card },
  toggleOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  toggleText: { fontSize: 14, fontWeight: '600', color: colors.textMid },
  toggleTextOn: { color: '#fff' },
});
