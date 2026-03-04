import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, StatusBar, Alert, ActivityIndicator, Modal,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { noticeAPI } from '../services/api';

const TYPE_COLORS = {
  ACADEMIC: { bg: '#e3f2fd', text: '#1565c0', border: '#90caf9' },
  EXAM:     { bg: '#fff3e0', text: '#e65100', border: '#ffcc80' },
  EVENT:    { bg: '#f3e5f5', text: '#6a1b9a', border: '#ce93d8' },
  HOLIDAY:  { bg: '#e8f5e9', text: '#2e7d32', border: '#a5d6a7' },
  FEE:      { bg: '#ffebee', text: '#c62828', border: '#ef9a9a' },
  GENERAL:  { bg: '#f5f5f5', text: '#455a64', border: '#cfd8dc' },
};

export default function NoticeScreen() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', noticeType: 'ACADEMIC', priority: 'NORMAL', targetAudience: 'ALL', publishDate: new Date().toISOString().split('T')[0], expiryDate: '' });

  useEffect(() => { loadNotices(); }, []);

  const loadNotices = async () => {
    setLoading(true);
    try {
      const res = await noticeAPI.getAll();
      setNotices((res.data || []).filter(n => n.targetAudience === 'ALL' || n.targetAudience === 'TEACHERS')
        .sort((a, b) => new Date(b.publishDate || 0) - new Date(a.publishDate || 0)));
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const createNotice = async () => {
    if (!form.title || !form.content) { Alert.alert('Error', 'Please enter title and content'); return; }
    setCreating(true);
    try {
      await noticeAPI.create({ ...form, isPublished: true });
      Alert.alert('Success', 'Notice posted!');
      setModalVisible(false);
      setForm({ title: '', content: '', noticeType: 'ACADEMIC', priority: 'NORMAL', targetAudience: 'ALL', publishDate: new Date().toISOString().split('T')[0], expiryDate: '' });
      loadNotices();
    } catch (e) { Alert.alert('Error', 'Failed to post notice'); }
    setCreating(false);
  };

  const types = [...new Set(notices.map(n => n.noticeType).filter(Boolean))];
  const displayed = notices.filter(n => {
    const matchSearch = !search || n.title?.toLowerCase().includes(search.toLowerCase()) || n.content?.toLowerCase().includes(search.toLowerCase());
    const matchType = !filterType || n.noticeType === filterType;
    return matchSearch && matchType;
  });

  return (
    <View style={{ flex: 1, backgroundColor: '#f0f4f8' }}>
      <StatusBar barStyle="light-content" backgroundColor="#00838f" />

      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.headerIcon}><MaterialCommunityIcons name="bell-ring-outline" size={24} color="#fff" /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Notices</Text>
            <Text style={styles.headerSub}>School announcements</Text>
          </View>
          <TouchableOpacity style={styles.postBtn} onPress={() => setModalVisible(true)}>
            <MaterialCommunityIcons name="plus" size={20} color="#00838f" />
            <Text style={styles.postBtnText}>Post</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <MaterialCommunityIcons name="magnify" size={18} color="#888" />
          <TextInput style={styles.searchInput} placeholder="Search notices..." placeholderTextColor="#bbb" value={search} onChangeText={setSearch} />
          {search ? <TouchableOpacity onPress={() => setSearch('')}><MaterialCommunityIcons name="close" size={18} color="#888" /></TouchableOpacity> : null}
        </View>
      </View>

      {types.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          <TouchableOpacity style={[styles.filterChip, !filterType && styles.filterChipActive]} onPress={() => setFilterType('')}>
            <Text style={[styles.filterText, !filterType && styles.filterTextActive]}>All</Text>
          </TouchableOpacity>
          {types.map(t => {
            const tc = TYPE_COLORS[t] || TYPE_COLORS.GENERAL;
            return (
              <TouchableOpacity key={t} style={[styles.filterChip, filterType === t && { backgroundColor: tc.text, borderColor: tc.text }]}
                onPress={() => setFilterType(filterType === t ? '' : t)}>
                <Text style={[styles.filterText, filterType === t && { color: '#fff' }]}>{t}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {loading ? <View style={styles.loadingBox}><ActivityIndicator size="large" color="#00838f" /></View> : (
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {displayed.length > 0 ? displayed.map(notice => {
            const tc = TYPE_COLORS[notice.noticeType] || TYPE_COLORS.GENERAL;
            return (
              <View key={notice.id} style={styles.noticeCard}>
                <View style={[styles.noticeAccent, { backgroundColor: tc.text }]} />
                <View style={{ flex: 1 }}>
                  <View style={styles.noticeTop}>
                    <View style={[styles.typeBadge, { backgroundColor: tc.bg, borderColor: tc.border }]}>
                      <Text style={[styles.typeText, { color: tc.text }]}>{notice.noticeType || 'INFO'}</Text>
                    </View>
                    {notice.priority === 'URGENT' && (
                      <View style={styles.urgentBadge}>
                        <MaterialCommunityIcons name="alert" size={11} color="#fff" />
                        <Text style={styles.urgentText}>URGENT</Text>
                      </View>
                    )}
                    <Text style={styles.noticeDate}>{notice.publishDate || ''}</Text>
                  </View>
                  <Text style={styles.noticeTitle}>{notice.title}</Text>
                  <Text style={styles.noticeContent} numberOfLines={3}>{notice.content}</Text>
                  {notice.expiryDate && (
                    <View style={styles.expiryRow}>
                      <MaterialCommunityIcons name="calendar-end" size={13} color="#aaa" />
                      <Text style={styles.expiryText}>Valid until {notice.expiryDate}</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          }) : (
            <View style={styles.emptyCard}>
              <MaterialCommunityIcons name="bell-sleep-outline" size={48} color="#bbb" />
              <Text style={styles.emptyTitle}>No Notices</Text>
              <Text style={styles.emptyText}>{search ? 'Try different search' : 'No notices available'}</Text>
            </View>
          )}
          <View style={{ height: 24 }} />
        </ScrollView>
      )}

      {/* Create Notice Modal */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Post Notice</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}><MaterialCommunityIcons name="close" size={24} color="#666" /></TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalLabel}>Title *</Text>
              <TextInput style={styles.modalInput} value={form.title} onChangeText={v => setForm(f => ({...f, title: v}))} placeholder="Notice title" />
              <Text style={styles.modalLabel}>Content *</Text>
              <TextInput style={[styles.modalInput, { minHeight: 100 }]} value={form.content} onChangeText={v => setForm(f => ({...f, content: v}))} placeholder="Notice content..." multiline />
              <Text style={styles.modalLabel}>Type</Text>
              <View style={styles.modalPickerBox}>
                <Picker selectedValue={form.noticeType} onValueChange={v => setForm(f => ({...f, noticeType: v}))} style={styles.modalPicker}>
                  {['ACADEMIC','EXAM','EVENT','HOLIDAY','FEE','GENERAL'].map(t => <Picker.Item key={t} label={t} value={t} />)}
                </Picker>
              </View>
              <Text style={styles.modalLabel}>Target Audience</Text>
              <View style={styles.modalPickerBox}>
                <Picker selectedValue={form.targetAudience} onValueChange={v => setForm(f => ({...f, targetAudience: v}))} style={styles.modalPicker}>
                  <Picker.Item label="All (Students, Parents, Teachers)" value="ALL" />
                  <Picker.Item label="Parents Only" value="PARENTS" />
                  <Picker.Item label="Teachers Only" value="TEACHERS" />
                </Picker>
              </View>
              <Text style={styles.modalLabel}>Expiry Date (optional, YYYY-MM-DD)</Text>
              <TextInput style={styles.modalInput} value={form.expiryDate} onChangeText={v => setForm(f => ({...f, expiryDate: v}))} placeholder="e.g. 2026-04-01" />
              <TouchableOpacity style={[styles.postSubmitBtn, creating && { opacity: 0.7 }]} onPress={createNotice} disabled={creating}>
                {creating ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.postSubmitText}>Post Notice</Text>}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: '#00838f', paddingTop: 44, paddingBottom: 20, paddingHorizontal: 16, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
  headerSub: { color: 'rgba(255,255,255,0.75)', fontSize: 12 },
  postBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 7, gap: 4 },
  postBtnText: { color: '#00838f', fontWeight: '700', fontSize: 13 },
  searchRow: { margin: 12, marginBottom: 4 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8, gap: 8, elevation: 1 },
  searchInput: { flex: 1, fontSize: 14, color: '#333' },
  filterRow: { paddingHorizontal: 12, paddingVertical: 8, gap: 8 },
  filterChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#e0e0e0' },
  filterChipActive: { backgroundColor: '#00838f', borderColor: '#00838f' },
  filterText: { fontSize: 12, color: '#666', fontWeight: '600' },
  filterTextActive: { color: '#fff' },
  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  noticeCard: { backgroundColor: '#fff', borderRadius: 14, marginHorizontal: 12, marginBottom: 10, flexDirection: 'row', overflow: 'hidden', elevation: 2 },
  noticeAccent: { width: 4 },
  noticeTop: { flexDirection: 'row', alignItems: 'center', gap: 8, margin: 12, marginBottom: 6 },
  typeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1 },
  typeText: { fontSize: 10, fontWeight: '700' },
  urgentBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#c62828', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
  urgentText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  noticeDate: { fontSize: 11, color: '#aaa', marginLeft: 'auto' },
  noticeTitle: { fontSize: 15, fontWeight: '700', color: '#1a237e', marginHorizontal: 12, marginBottom: 6 },
  noticeContent: { fontSize: 13, color: '#666', marginHorizontal: 12, lineHeight: 19, marginBottom: 8 },
  expiryRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginHorizontal: 12, marginBottom: 10 },
  expiryText: { fontSize: 11, color: '#aaa' },
  emptyCard: { margin: 32, alignItems: 'center' },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#555', marginTop: 12 },
  emptyText: { fontSize: 13, color: '#aaa', marginTop: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1a237e' },
  modalLabel: { fontSize: 12, fontWeight: '600', color: '#555', marginBottom: 6, marginTop: 12 },
  modalInput: { borderWidth: 1.5, borderColor: '#e0e0e0', borderRadius: 10, padding: 12, fontSize: 14, backgroundColor: '#fafafa' },
  modalPickerBox: { borderWidth: 1.5, borderColor: '#e0e0e0', borderRadius: 10, backgroundColor: '#fafafa' },
  modalPicker: { height: 48 },
  postSubmitBtn: { backgroundColor: '#00838f', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 16, marginBottom: 24 },
  postSubmitText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
