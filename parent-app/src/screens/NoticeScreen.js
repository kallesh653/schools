import React, { useState, useEffect } from 'react';
import {
  View, StyleSheet, ScrollView, RefreshControl,
  TouchableOpacity, TextInput,
} from 'react-native';
import { Text, Chip, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { noticeAPI } from '../services/api';
import ScreenHeader from '../components/ScreenHeader';
import { markSeen, SECTIONS } from '../utils/notifications';

const TYPE_COLORS = {
  ACADEMIC: { bg: '#1565c0', light: '#e3f2fd', icon: 'school' },
  EXAM:     { bg: '#e65100', light: '#fff3e0', icon: 'clipboard-text' },
  EVENT:    { bg: '#6a1b9a', light: '#f3e5f5', icon: 'calendar-star' },
  HOLIDAY:  { bg: '#2e7d32', light: '#e8f5e9', icon: 'beach' },
  FEE:      { bg: '#c62828', light: '#ffebee', icon: 'cash' },
  GENERAL:  { bg: '#455a64', light: '#eceff1', icon: 'information' },
};

const PRIORITY_COLORS = {
  URGENT: '#c62828',
  HIGH: '#e65100',
  NORMAL: '#2e7d32',
};

const ALL_TYPES = ['ALL', 'ACADEMIC', 'EXAM', 'EVENT', 'HOLIDAY', 'FEE', 'GENERAL'];

function formatDate(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch { return dateStr; }
}

function daysLeft(expiryDate) {
  if (!expiryDate) return null;
  const diff = Math.ceil((new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
  return diff;
}

export default function NoticeScreen({ navigation }) {
  const [notices, setNotices] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeType, setActiveType] = useState('ALL');
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    fetchNotices();
    markSeen(SECTIONS.NOTICES);
  }, []);

  useEffect(() => {
    applyFilter(notices, search, activeType);
  }, [notices, search, activeType]);

  const fetchNotices = async () => {
    setLoading(true);
    try {
      let response;
      try { response = await noticeAPI.getPublished(); }
      catch { response = await noticeAPI.getAll(); }
      const parentNotices = (response.data || []).filter(
        n => n.targetAudience === 'ALL' || n.targetAudience === 'PARENTS'
      ).sort((a, b) => new Date(b.publishDate || 0) - new Date(a.publishDate || 0));
      setNotices(parentNotices);
    } catch (e) {
      setNotices([]);
    }
    setLoading(false);
  };

  const applyFilter = (list, searchTerm, type) => {
    let result = list;
    if (type !== 'ALL') {
      result = result.filter(n => (n.noticeType || 'GENERAL') === type);
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(n =>
        n.title?.toLowerCase().includes(q) || n.content?.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchNotices();
    setRefreshing(false);
  };

  const toggleExpand = (id) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getType = (notice) => (notice.noticeType || 'GENERAL').toUpperCase();

  const urgentCount = notices.filter(n => n.priority === 'URGENT').length;

  return (
    <View style={styles.container}>
      <ScreenHeader title="Notices" navigation={navigation} onRefresh={handleRefresh} refreshing={refreshing} />

      {/* Search Bar */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <MaterialCommunityIcons name="magnify" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search notices..."
            placeholderTextColor="#aaa"
            value={search}
            onChangeText={setSearch}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <MaterialCommunityIcons name="close-circle" size={18} color="#bbb" />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Filter Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow} contentContainerStyle={{ paddingHorizontal: 12, gap: 8 }}>
        {ALL_TYPES.map(type => {
          const conf = TYPE_COLORS[type] || TYPE_COLORS.GENERAL;
          const active = activeType === type;
          return (
            <TouchableOpacity
              key={type}
              onPress={() => setActiveType(type)}
              style={[styles.filterChip, active ? { backgroundColor: conf.bg } : { backgroundColor: '#f0f0f0' }]}
            >
              {type !== 'ALL' && (
                <MaterialCommunityIcons name={conf.icon} size={13} color={active ? '#fff' : '#666'} />
              )}
              <Text style={[styles.filterChipText, active ? { color: '#fff' } : { color: '#555' }]}>{type}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}>

        {/* Urgent Banner */}
        {urgentCount > 0 && (
          <View style={styles.urgentBanner}>
            <MaterialCommunityIcons name="alert" size={18} color="#fff" />
            <Text style={styles.urgentText}>{urgentCount} urgent notice{urgentCount > 1 ? 's' : ''} — please read immediately</Text>
          </View>
        )}

        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color="#1565c0" />
            <Text style={styles.loadingText}>Loading notices...</Text>
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="bell-off-outline" size={64} color="#e0e0e0" />
            <Text style={styles.emptyTitle}>No Notices Found</Text>
            <Text style={styles.emptySubtitle}>
              {search || activeType !== 'ALL' ? 'Try adjusting your filters' : 'Check back later for school announcements'}
            </Text>
          </View>
        ) : (
          filtered.map((notice) => {
            const typeKey = getType(notice);
            const conf = TYPE_COLORS[typeKey] || TYPE_COLORS.GENERAL;
            const isExpanded = expanded[notice.id];
            const days = daysLeft(notice.expiryDate);
            const isExpiring = days !== null && days >= 0 && days <= 3;
            const isExpired = days !== null && days < 0;

            return (
              <TouchableOpacity
                key={notice.id}
                onPress={() => toggleExpand(notice.id)}
                activeOpacity={0.9}
                style={[styles.noticeCard, isExpired && styles.expiredCard]}
              >
                {/* Left accent bar */}
                <View style={[styles.accentBar, { backgroundColor: conf.bg }]} />

                <View style={styles.cardBody}>
                  {/* Top row */}
                  <View style={styles.topRow}>
                    <View style={[styles.typeIconBadge, { backgroundColor: conf.light }]}>
                      <MaterialCommunityIcons name={conf.icon} size={18} color={conf.bg} />
                    </View>
                    <View style={styles.titleBlock}>
                      <Text style={styles.noticeTitle} numberOfLines={isExpanded ? 0 : 2}>
                        {notice.title}
                      </Text>
                    </View>
                    <MaterialCommunityIcons
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={20}
                      color="#bbb"
                    />
                  </View>

                  {/* Chips row */}
                  <View style={styles.chipsInRow}>
                    <View style={[styles.typePill, { backgroundColor: conf.light }]}>
                      <Text style={[styles.typePillText, { color: conf.bg }]}>{typeKey}</Text>
                    </View>
                    {notice.priority && notice.priority !== 'NORMAL' && (
                      <View style={[styles.priorityPill, { backgroundColor: PRIORITY_COLORS[notice.priority] + '20' }]}>
                        <View style={[styles.priorityDot, { backgroundColor: PRIORITY_COLORS[notice.priority] }]} />
                        <Text style={[styles.priorityText, { color: PRIORITY_COLORS[notice.priority] }]}>
                          {notice.priority}
                        </Text>
                      </View>
                    )}
                    {isExpiring && !isExpired && (
                      <View style={styles.expiringPill}>
                        <MaterialCommunityIcons name="clock-alert" size={11} color="#e65100" />
                        <Text style={styles.expiringText}>Expires in {days}d</Text>
                      </View>
                    )}
                    {isExpired && (
                      <View style={styles.expiredPill}>
                        <Text style={styles.expiredPillText}>Expired</Text>
                      </View>
                    )}
                  </View>

                  {/* Content (expanded) */}
                  {isExpanded && (
                    <View style={styles.contentBlock}>
                      <Text style={styles.contentText}>{notice.content}</Text>
                    </View>
                  )}

                  {/* Footer */}
                  <View style={styles.footer}>
                    <MaterialCommunityIcons name="calendar" size={12} color="#bbb" />
                    <Text style={styles.footerText}>Published: {formatDate(notice.publishDate)}</Text>
                    {notice.expiryDate && (
                      <>
                        <Text style={styles.footerDot}> · </Text>
                        <MaterialCommunityIcons name="calendar-remove" size={12} color="#bbb" />
                        <Text style={styles.footerText}>Until: {formatDate(notice.expiryDate)}</Text>
                      </>
                    )}
                    <View style={{ flex: 1 }} />
                    <Text style={styles.tapHint}>{isExpanded ? 'Tap to collapse' : 'Tap to read'}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  searchRow: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f5', borderRadius: 10, paddingHorizontal: 10, gap: 6 },
  searchInput: { flex: 1, height: 38, fontSize: 14, color: '#333' },
  chipsRow: { backgroundColor: '#fff', paddingVertical: 10, maxHeight: 52, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  filterChip: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  filterChipText: { fontSize: 12, fontWeight: '600' },
  urgentBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, margin: 12, marginBottom: 4, backgroundColor: '#c62828', padding: 10, borderRadius: 10 },
  urgentText: { color: '#fff', fontSize: 13, fontWeight: '600', flex: 1 },
  centered: { alignItems: 'center', paddingTop: 60 },
  loadingText: { marginTop: 12, color: '#888', fontSize: 14 },
  emptyState: { alignItems: 'center', paddingTop: 80, paddingHorizontal: 32 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#bbb', marginTop: 16 },
  emptySubtitle: { fontSize: 13, color: '#ccc', textAlign: 'center', marginTop: 6 },
  noticeCard: { flexDirection: 'row', backgroundColor: '#fff', marginHorizontal: 12, marginTop: 10, borderRadius: 12, elevation: 2, overflow: 'hidden' },
  expiredCard: { opacity: 0.6 },
  accentBar: { width: 5, borderRadius: 0 },
  cardBody: { flex: 1, padding: 14 },
  topRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  typeIconBadge: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  titleBlock: { flex: 1 },
  noticeTitle: { fontSize: 15, fontWeight: '700', color: '#1a237e', lineHeight: 21 },
  chipsInRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  typePill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  typePillText: { fontSize: 11, fontWeight: '700' },
  priorityPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  priorityDot: { width: 6, height: 6, borderRadius: 3 },
  priorityText: { fontSize: 11, fontWeight: '700' },
  expiringPill: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12, backgroundColor: '#fff3e0' },
  expiringText: { fontSize: 11, color: '#e65100', fontWeight: '600' },
  expiredPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12, backgroundColor: '#eeeeee' },
  expiredPillText: { fontSize: 11, color: '#999', fontWeight: '600' },
  contentBlock: { backgroundColor: '#fafafa', borderRadius: 8, padding: 12, marginBottom: 8 },
  contentText: { fontSize: 14, color: '#444', lineHeight: 22 },
  footer: { flexDirection: 'row', alignItems: 'center', gap: 3, flexWrap: 'wrap' },
  footerText: { fontSize: 11, color: '#bbb' },
  footerDot: { color: '#ddd', fontSize: 11 },
  tapHint: { fontSize: 11, color: '#bbb', fontStyle: 'italic' },
});
