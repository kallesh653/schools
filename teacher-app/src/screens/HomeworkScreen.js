import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, StatusBar, Alert, ActivityIndicator, Modal,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { teacherAPI, sectionAPI, homeworkAPI } from '../services/api';

const PRIORITY_COLORS = {
  HIGH: { bg: '#ffebee', text: '#c62828', border: '#ef9a9a' },
  MEDIUM: { bg: '#fff3e0', text: '#e65100', border: '#ffcc80' },
  LOW: { bg: '#e8f5e9', text: '#2e7d32', border: '#a5d6a7' },
};

function isOverdue(d) { return d && new Date(d) < new Date(); }
function daysLeft(d) {
  if (!d) return '';
  const diff = Math.ceil((new Date(d) - new Date()) / 86400000);
  if (diff < 0) return 'Overdue by ' + Math.abs(diff) + 'd';
  if (diff === 0) return 'Due Today';
  return diff + ' days left';
}

export default function HomeworkScreen() {
  const [assignments, setAssignments] = useState([]);
  const [homeworks, setHomeworks] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterClassId, setFilterClassId] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', classId: '', sectionId: '', subjectId: '', dueDate: '', priority: 'MEDIUM' });
  const [user, setUser] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem('user').then(u => { if (u) setUser(JSON.parse(u)); });
    loadData();
  }, []);

  useEffect(() => {
    if (form.classId) sectionAPI.getByClass(form.classId).then(r => setSections(r.data || [])).catch(() => {});
  }, [form.classId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [aRes, hwRes] = await Promise.all([teacherAPI.getMyAssignments(), homeworkAPI.getAll()]);
      setAssignments(aRes.data || []);
      const myHomeworks = (hwRes.data || []).sort((a, b) => {
        if (!a.dueDate) return 1; if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      });
      setHomeworks(myHomeworks);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const uniqueClasses = [...new Map(assignments.map(a => [a.schoolClass?.id, a.schoolClass])).values()].filter(Boolean);

  const displayed = homeworks.filter(hw => {
    const matchSearch = !search || hw.title?.toLowerCase().includes(search.toLowerCase()) || hw.subject?.name?.toLowerCase().includes(search.toLowerCase());
    const matchClass = !filterClassId || hw.schoolClass?.id?.toString() === filterClassId;
    return matchSearch && matchClass;
  });

  const classSubjects = assignments.filter(a => a.schoolClass?.id?.toString() === form.classId).map(a => a.subject).filter(Boolean);

  const createHomework = async () => {
    if (!form.title || !form.classId || !form.sectionId || !form.subjectId || !form.dueDate) {
      Alert.alert('Error', 'Please fill all required fields'); return;
    }
    setCreating(true);
    try {
      await homeworkAPI.create({
        title: form.title, description: form.description, dueDate: form.dueDate, priority: form.priority,
        teacher: { id: user?.entityId },
        subject: { id: parseInt(form.subjectId) },
        schoolClass: { id: parseInt(form.classId) },
        section: { id: parseInt(form.sectionId) },
      });
      Alert.alert('Success', 'Homework created!');
      setModalVisible(false);
      setForm({ title: '', description: '', classId: '', sectionId: '', subjectId: '', dueDate: '', priority: 'MEDIUM' });
      loadData();
    } catch (e) { Alert.alert('Error', 'Failed to create homework'); }
    setCreating(false);
  };

  const deleteHomework = (id) => {
    Alert.alert('Delete', 'Delete this homework?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await homeworkAPI.delete(id).catch(() => {});
        loadData();
      }},
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f0f4f8' }}>
      <StatusBar barStyle="light-content" backgroundColor="#ad1457" />

      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.headerIcon}><MaterialCommunityIcons name="book-open-variant" size={24} color="#fff" /></View>
          <View>
            <Text style={styles.headerTitle}>Homework</Text>
            <Text style={styles.headerSub}>Manage student assignments</Text>
          </View>
          <TouchableOpacity style={styles.createBtn} onPress={() => setModalVisible(true)}>
            <MaterialCommunityIcons name="plus" size={20} color="#ad1457" />
            <Text style={styles.createBtnText}>New</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <MaterialCommunityIcons name="magnify" size={18} color="#888" />
          <TextInput style={styles.searchInput} placeholder="Search homework..." placeholderTextColor="#bbb" value={search} onChangeText={setSearch} />
          {search ? <TouchableOpacity onPress={() => setSearch('')}><MaterialCommunityIcons name="close" size={18} color="#888" /></TouchableOpacity> : null}
        </View>
      </View>

      {uniqueClasses.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          <TouchableOpacity style={[styles.filterChip, !filterClassId && styles.filterChipActive]} onPress={() => setFilterClassId('')}>
            <Text style={[styles.filterChipText, !filterClassId && styles.filterChipTextActive]}>All</Text>
          </TouchableOpacity>
          {uniqueClasses.map(cls => (
            <TouchableOpacity key={cls.id} style={[styles.filterChip, filterClassId === cls.id.toString() && styles.filterChipActive]}
              onPress={() => setFilterClassId(filterClassId === cls.id.toString() ? '' : cls.id.toString())}>
              <Text style={[styles.filterChipText, filterClassId === cls.id.toString() && styles.filterChipTextActive]}>Class {cls.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {loading ? <View style={styles.loadingBox}><ActivityIndicator size="large" color="#ad1457" /></View> : (
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {displayed.length > 0 ? displayed.map(hw => {
            const pc = PRIORITY_COLORS[hw.priority] || PRIORITY_COLORS.MEDIUM;
            const overdue = isOverdue(hw.dueDate);
            const dl = daysLeft(hw.dueDate);
            return (
              <View key={hw.id} style={[styles.hwCard, overdue && styles.hwCardOverdue]}>
                <View style={[styles.hwAccent, { backgroundColor: pc.text }]} />
                <View style={{ flex: 1 }}>
                  <View style={styles.hwTop}>
                    <Text style={styles.hwTitle} numberOfLines={1}>{hw.title}</Text>
                    <View style={[styles.priBadge, { backgroundColor: pc.bg, borderColor: pc.border }]}>
                      <Text style={[styles.priText, { color: pc.text }]}>{hw.priority || 'MEDIUM'}</Text>
                    </View>
                  </View>
                  {hw.description ? <Text style={styles.hwDesc} numberOfLines={2}>{hw.description}</Text> : null}
                  <View style={styles.hwMeta}>
                    <View style={styles.hwMetaItem}>
                      <MaterialCommunityIcons name="school" size={13} color="#888" />
                      <Text style={styles.hwMetaText}>Class {hw.schoolClass?.name}{hw.section?.name ? ' - ' + hw.section.name : ''}</Text>
                    </View>
                    <View style={styles.hwMetaItem}>
                      <MaterialCommunityIcons name="book-open" size={13} color="#888" />
                      <Text style={styles.hwMetaText}>{hw.subject?.name || 'N/A'}</Text>
                    </View>
                  </View>
                  <View style={styles.hwFooter}>
                    <View style={[styles.dueBadge, overdue && styles.dueBadgeOverdue]}>
                      <MaterialCommunityIcons name="calendar-clock" size={12} color={overdue ? '#c62828' : '#666'} />
                      <Text style={[styles.dueText, overdue && styles.dueTextOverdue]}>{dl || hw.dueDate || 'No due date'}</Text>
                    </View>
                    <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteHomework(hw.id)}>
                      <MaterialCommunityIcons name="delete-outline" size={18} color="#ef5350" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          }) : (
            <View style={styles.emptyCard}>
              <MaterialCommunityIcons name="clipboard-text-off-outline" size={48} color="#bbb" />
              <Text style={styles.emptyTitle}>No Homework Found</Text>
              <Text style={styles.emptyText}>{search ? 'Try a different search term' : 'Tap "New" to create homework'}</Text>
            </View>
          )}
          <View style={{ height: 24 }} />
        </ScrollView>
      )}

      {/* Create Homework Modal */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Homework</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalLabel}>Title *</Text>
              <TextInput style={styles.modalInput} value={form.title} onChangeText={v => setForm(f => ({...f, title: v}))} placeholder="Homework title" />
              <Text style={styles.modalLabel}>Description</Text>
              <TextInput style={[styles.modalInput, { minHeight: 80 }]} value={form.description} onChangeText={v => setForm(f => ({...f, description: v}))} placeholder="Instructions..." multiline />
              <Text style={styles.modalLabel}>Class *</Text>
              <View style={styles.modalPickerBox}>
                <Picker selectedValue={form.classId} onValueChange={v => setForm(f => ({...f, classId: v, sectionId: '', subjectId: ''}))} style={styles.modalPicker}>
                  <Picker.Item label="Select class" value="" />
                  {uniqueClasses.map(c => <Picker.Item key={c.id} label={"Class " + c.name} value={c.id.toString()} />)}
                </Picker>
              </View>
              {form.classId ? (
                <>
                  <Text style={styles.modalLabel}>Section *</Text>
                  <View style={styles.modalPickerBox}>
                    <Picker selectedValue={form.sectionId} onValueChange={v => setForm(f => ({...f, sectionId: v}))} style={styles.modalPicker}>
                      <Picker.Item label="Select section" value="" />
                      {sections.map(s => <Picker.Item key={s.id} label={s.name} value={s.id.toString()} />)}
                    </Picker>
                  </View>
                  <Text style={styles.modalLabel}>Subject *</Text>
                  <View style={styles.modalPickerBox}>
                    <Picker selectedValue={form.subjectId} onValueChange={v => setForm(f => ({...f, subjectId: v}))} style={styles.modalPicker}>
                      <Picker.Item label="Select subject (assigned)" value="" />
                      {classSubjects.map(s => <Picker.Item key={s.id} label={s.name} value={s.id.toString()} />)}
                    </Picker>
                  </View>
                </>
              ) : null}
              <Text style={styles.modalLabel}>Due Date * (YYYY-MM-DD)</Text>
              <TextInput style={styles.modalInput} value={form.dueDate} onChangeText={v => setForm(f => ({...f, dueDate: v}))} placeholder="e.g. 2026-03-15" />
              <Text style={styles.modalLabel}>Priority</Text>
              <View style={styles.priorityRow}>
                {['LOW','MEDIUM','HIGH'].map(p => {
                  const pc = PRIORITY_COLORS[p];
                  return (
                    <TouchableOpacity key={p} style={[styles.priorityBtn, { borderColor: pc.border, backgroundColor: form.priority === p ? pc.bg : '#fff' }]}
                      onPress={() => setForm(f => ({...f, priority: p}))}>
                      <Text style={[styles.priorityBtnText, { color: pc.text }]}>{p}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              <TouchableOpacity style={[styles.createHwBtn, creating && { opacity: 0.7 }]} onPress={createHomework} disabled={creating}>
                {creating ? <ActivityIndicator size="small" color="#fff" /> : (
                  <Text style={styles.createHwBtnText}>Create Homework</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: '#ad1457', paddingTop: 44, paddingBottom: 20, paddingHorizontal: 16, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '700', flex: 1 },
  headerSub: { color: 'rgba(255,255,255,0.75)', fontSize: 12 },
  createBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, gap: 4 },
  createBtnText: { color: '#ad1457', fontWeight: '700', fontSize: 13 },
  searchRow: { margin: 12, marginBottom: 4 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, gap: 8, elevation: 1 },
  searchInput: { flex: 1, fontSize: 14, color: '#333' },
  filterRow: { paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#e0e0e0' },
  filterChipActive: { backgroundColor: '#ad1457', borderColor: '#ad1457' },
  filterChipText: { fontSize: 12, color: '#666', fontWeight: '600' },
  filterChipTextActive: { color: '#fff' },
  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  hwCard: { backgroundColor: '#fff', borderRadius: 14, marginHorizontal: 12, marginBottom: 10, flexDirection: 'row', overflow: 'hidden', elevation: 2 },
  hwCardOverdue: { borderWidth: 1, borderColor: '#ef9a9a' },
  hwAccent: { width: 4, backgroundColor: '#ad1457' },
  hwTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', margin: 12, marginBottom: 6, gap: 8 },
  hwTitle: { fontSize: 15, fontWeight: '700', color: '#1a237e', flex: 1 },
  priBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1 },
  priText: { fontSize: 10, fontWeight: '700' },
  hwDesc: { fontSize: 12, color: '#777', marginHorizontal: 12, marginBottom: 8, lineHeight: 17 },
  hwMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginHorizontal: 12, marginBottom: 8 },
  hwMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  hwMetaText: { fontSize: 11, color: '#888' },
  hwFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', margin: 12, marginTop: 0 },
  dueBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#f5f5f5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  dueBadgeOverdue: { backgroundColor: '#ffebee' },
  dueText: { fontSize: 11, color: '#666' },
  dueTextOverdue: { color: '#c62828', fontWeight: '700' },
  deleteBtn: { padding: 4 },
  emptyCard: { margin: 32, alignItems: 'center' },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#555', marginTop: 12 },
  emptyText: { fontSize: 13, color: '#aaa', marginTop: 4, textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1a237e' },
  modalLabel: { fontSize: 12, fontWeight: '600', color: '#555', marginBottom: 6, marginTop: 12 },
  modalInput: { borderWidth: 1.5, borderColor: '#e0e0e0', borderRadius: 10, padding: 12, fontSize: 14, backgroundColor: '#fafafa', marginBottom: 4 },
  modalPickerBox: { borderWidth: 1.5, borderColor: '#e0e0e0', borderRadius: 10, backgroundColor: '#fafafa', marginBottom: 4 },
  modalPicker: { height: 48 },
  priorityRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  priorityBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center', borderWidth: 1.5 },
  priorityBtnText: { fontSize: 12, fontWeight: '700' },
  createHwBtn: { backgroundColor: '#ad1457', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 4, marginBottom: 24 },
  createHwBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
