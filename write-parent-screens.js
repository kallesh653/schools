// Script to write improved parent app screens
const fs = require('fs');
const path = require('path');

const screensDir = path.join(__dirname, 'parent-app', 'src', 'screens');

// ─── 1. NoticeScreen.js ────────────────────────────────────────────────────────
const noticeScreen = `import React, { useState, useEffect } from 'react';
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
`;

// ─── 2. ProfileScreen.js ───────────────────────────────────────────────────────
const profileScreen = `import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity, StatusBar, RefreshControl } from 'react-native';
import { Text, Divider, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { parentAPI } from '../services/api';

const CHILD_COLORS = ['#1565c0', '#2e7d32', '#6a1b9a', '#c62828', '#00695c'];

export default function ProfileScreen({ onLogout, navigation }) {
  const [user, setUser] = useState(null);
  const [children, setChildren] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    setLoading(true);
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        if (parsedUser.entityId) {
          const res = await parentAPI.getChildren(parsedUser.entityId).catch(() => ({ data: [] }));
          setChildren(res.data || []);
        }
      }
    } catch (e) {}
    setLoading(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProfile();
    setRefreshing(false);
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => { if (onLogout) onLogout(); } },
    ]);
  };

  const displayName = user ? (user.fullName || user.username || '') : '';
  const initials = displayName
    ? displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'P';

  return (
    <View style={styles.outerContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#1565c0" />
      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#fff" />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerNav}>
            <TouchableOpacity onPress={() => navigation?.navigate('Dashboard')} style={styles.navBtn}>
              <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
            </TouchableOpacity>
            <View style={{ flex: 1 }} />
            <TouchableOpacity onPress={handleRefresh} style={styles.navBtn} disabled={refreshing}>
              <MaterialCommunityIcons name="refresh" size={24} color={refreshing ? 'rgba(255,255,255,0.5)' : '#fff'} />
            </TouchableOpacity>
          </View>

          {/* Avatar */}
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={styles.headerName}>{displayName || 'Parent'}</Text>
          <View style={styles.roleBadge}>
            <MaterialCommunityIcons name="account-heart" size={13} color="#fff" />
            <Text style={styles.roleText}>Parent Account</Text>
          </View>

          {/* Quick stats */}
          <View style={styles.headerStats}>
            <View style={styles.statItem}>
              <Text style={styles.statNum}>{children.length}</Text>
              <Text style={styles.statLbl}>Children</Text>
            </View>
            <View style={styles.statSep} />
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="check-circle" size={22} color="rgba(255,255,255,0.9)" />
              <Text style={styles.statLbl}>Active</Text>
            </View>
            <View style={styles.statSep} />
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="school" size={22} color="rgba(255,255,255,0.9)" />
              <Text style={styles.statLbl}>Enrolled</Text>
            </View>
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color="#1565c0" />
          </View>
        ) : (
          <>
            {/* Account Info Card */}
            <View style={styles.card}>
              <View style={styles.cardTitleRow}>
                <MaterialCommunityIcons name="account-circle" size={20} color="#1565c0" />
                <Text style={styles.cardTitle}>Account Information</Text>
              </View>
              <Divider style={styles.divider} />
              <InfoRow icon="account" label="Username" value={user?.username} />
              <InfoRow icon="badge-account" label="Full Name" value={user?.fullName || 'Not provided'} />
              <InfoRow icon="email" label="Email" value={user?.email || 'Not provided'} />
              <InfoRow icon="phone" label="Contact" value={user?.contact || 'Not provided'} />
              <InfoRow icon="shield-account" label="Role" value="Parent" />
            </View>

            {/* Children Card */}
            <View style={styles.card}>
              <View style={styles.cardTitleRow}>
                <MaterialCommunityIcons name="account-group" size={20} color="#1565c0" />
                <Text style={styles.cardTitle}>My Children</Text>
                <View style={styles.countBadge}>
                  <Text style={styles.countText}>{children.length}</Text>
                </View>
              </View>
              <Divider style={styles.divider} />
              {children.length === 0 ? (
                <View style={styles.emptyChildren}>
                  <MaterialCommunityIcons name="account-off-outline" size={40} color="#e0e0e0" />
                  <Text style={styles.emptyText}>No children linked to your account</Text>
                </View>
              ) : (
                children.map((child, index) => {
                  const color = CHILD_COLORS[index % CHILD_COLORS.length];
                  const childInitial = (child.firstName || '?')[0].toUpperCase();
                  return (
                    <View key={child.id}>
                      <View style={styles.childRow}>
                        <View style={[styles.childAvatar, { backgroundColor: color }]}>
                          <Text style={styles.childAvatarText}>{childInitial}</Text>
                        </View>
                        <View style={styles.childDetails}>
                          <Text style={styles.childName}>{child.firstName} {child.lastName}</Text>
                          <View style={styles.childMetaRow}>
                            <MaterialCommunityIcons name="school" size={12} color="#888" />
                            <Text style={styles.childMeta}>
                              {child.schoolClass?.name}{child.section ? ' - ' + child.section.name : ''}
                            </Text>
                          </View>
                          <View style={styles.childMetaRow}>
                            <MaterialCommunityIcons name="identifier" size={12} color="#888" />
                            <Text style={styles.childMeta}>Admission: {child.admissionNo || 'N/A'}</Text>
                          </View>
                          {child.rollNo && (
                            <View style={styles.childMetaRow}>
                              <MaterialCommunityIcons name="numeric" size={12} color="#888" />
                              <Text style={styles.childMeta}>Roll No: {child.rollNo}</Text>
                            </View>
                          )}
                        </View>
                        <View style={[styles.activeChip, { borderColor: color + '50' }]}>
                          <View style={[styles.activeDot, { backgroundColor: '#4CAF50' }]} />
                          <Text style={styles.activeText}>Active</Text>
                        </View>
                      </View>
                      {index < children.length - 1 && <Divider style={styles.divider} />}
                    </View>
                  );
                })
              )}
            </View>

            {/* Logout Button */}
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <MaterialCommunityIcons name="logout" size={20} color="#fff" />
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>

            <Text style={styles.versionText}>EduConnect v1.0 · Parent App</Text>
          </>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <View style={styles.infoRow}>
      <MaterialCommunityIcons name={icon} size={18} color="#1565c0" style={{ marginRight: 10 }} />
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || '-'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: { flex: 1, backgroundColor: '#1565c0' },
  container: { flex: 1 },
  header: { backgroundColor: '#1565c0', alignItems: 'center', paddingBottom: 28 },
  headerNav: { flexDirection: 'row', alignItems: 'center', width: '100%', paddingHorizontal: 8, paddingTop: 44, paddingBottom: 8 },
  navBtn: { padding: 8 },
  avatarCircle: {
    width: 88, height: 88, borderRadius: 44,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  avatarText: { fontSize: 32, fontWeight: '800', color: '#fff' },
  headerName: { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 6 },
  roleBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, marginBottom: 20 },
  roleText: { fontSize: 12, color: '#fff', fontWeight: '600' },
  headerStats: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 16, paddingHorizontal: 20, paddingVertical: 12, gap: 24 },
  statItem: { alignItems: 'center', gap: 4 },
  statNum: { fontSize: 22, fontWeight: '800', color: '#fff' },
  statLbl: { fontSize: 11, color: 'rgba(255,255,255,0.8)' },
  statSep: { width: 1, height: 30, backgroundColor: 'rgba(255,255,255,0.3)' },
  loadingBox: { padding: 32, alignItems: 'center', backgroundColor: '#f0f2f5' },
  card: { backgroundColor: '#fff', margin: 12, marginTop: 12, borderRadius: 16, elevation: 2, padding: 16 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#1565c0', flex: 1 },
  countBadge: { backgroundColor: '#e3f2fd', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  countText: { fontSize: 12, fontWeight: '700', color: '#1565c0' },
  divider: { backgroundColor: '#f5f5f5', marginBottom: 8 },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  infoLabel: { fontSize: 13, color: '#888', width: 90 },
  infoValue: { fontSize: 13, fontWeight: '600', color: '#333', flex: 1, textAlign: 'right' },
  childRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12 },
  childAvatar: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  childAvatarText: { fontSize: 20, fontWeight: '800', color: '#fff' },
  childDetails: { flex: 1 },
  childName: { fontSize: 15, fontWeight: '700', color: '#1a237e', marginBottom: 4 },
  childMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 },
  childMeta: { fontSize: 12, color: '#888' },
  activeChip: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  activeDot: { width: 6, height: 6, borderRadius: 3 },
  activeText: { fontSize: 11, color: '#4CAF50', fontWeight: '600' },
  emptyChildren: { alignItems: 'center', padding: 20 },
  emptyText: { color: '#bbb', textAlign: 'center', marginTop: 8, fontSize: 13 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#c62828', margin: 12, marginTop: 8, padding: 14, borderRadius: 12 },
  logoutText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  versionText: { textAlign: 'center', color: '#bbb', fontSize: 11, marginTop: 4 },
});
`;

// ─── 3. LoginScreen.js ─────────────────────────────────────────────────────────
const loginScreen = `import React, { useState } from 'react';
import { View, StyleSheet, StatusBar, KeyboardAvoidingView, Platform, TouchableOpacity, Animated } from 'react-native';
import { TextInput, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../services/api';

export default function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError('Please enter username and password');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const response = await authAPI.login({ username: username.trim(), password });
      const userData = response.data;
      if (userData.role !== 'ROLE_PARENT' && userData.role !== 'PARENT') {
        setError('This app is for parents only. Please use the Teacher App to login as a teacher.');
        setLoading(false);
        return;
      }
      await AsyncStorage.setItem('token', userData.token);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      await AsyncStorage.setItem('fullName', userData.fullName || userData.username || '');
      await AsyncStorage.setItem('entityId', String(userData.entityId || ''));
      await AsyncStorage.setItem('entityType', userData.entityType || '');
      onLogin();
    } catch (err) {
      setError('Invalid username or password. Please try again.');
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a237e" />

      {/* Header */}
      <View style={styles.headerBg}>
        <View style={styles.logoCircle}>
          <MaterialCommunityIcons name="school" size={52} color="#1a237e" />
        </View>
        <Text style={styles.appName}>EduConnect</Text>
        <Text style={styles.appSub}>Parent Portal</Text>
        <Text style={styles.tagline}>Stay connected with your child's education</Text>
      </View>

      {/* Form */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.formOuter}>
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Parent Login</Text>
          <Text style={styles.formSubtitle}>Sign in to monitor your child's progress</Text>

          {error ? (
            <View style={styles.errorBox}>
              <MaterialCommunityIcons name="alert-circle" size={16} color="#c62828" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <TextInput
            label="Username"
            value={username}
            onChangeText={setUsername}
            style={styles.input}
            mode="outlined"
            left={<TextInput.Icon icon="account" />}
            autoCapitalize="none"
            autoCorrect={false}
            outlineColor="#c5cae9"
            activeOutlineColor="#1a237e"
          />
          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            style={styles.input}
            mode="outlined"
            left={<TextInput.Icon icon="lock" />}
            right={
              <TextInput.Icon
                icon={showPassword ? 'eye-off' : 'eye'}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
            outlineColor="#c5cae9"
            activeOutlineColor="#1a237e"
          />

          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            style={[styles.loginBtn, loading && { opacity: 0.7 }]}
          >
            {loading ? (
              <MaterialCommunityIcons name="loading" size={22} color="#fff" />
            ) : (
              <MaterialCommunityIcons name="login" size={22} color="#fff" />
            )}
            <Text style={styles.loginBtnText}>{loading ? 'Signing in...' : 'Sign In'}</Text>
          </TouchableOpacity>

          <View style={styles.helpRow}>
            <MaterialCommunityIcons name="information-outline" size={14} color="#bbb" />
            <Text style={styles.helpText}>Contact school admin if you need login credentials</Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a237e' },
  headerBg: {
    flex: 0.48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 16,
  },
  logoCircle: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: 'white',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 10,
    marginBottom: 16,
  },
  appName: { fontSize: 32, fontWeight: '800', color: 'white', letterSpacing: 1 },
  appSub: { fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: '600', letterSpacing: 3, marginTop: 2, marginBottom: 8 },
  tagline: { fontSize: 13, color: 'rgba(255,255,255,0.7)', textAlign: 'center', paddingHorizontal: 40 },
  formOuter: { flex: 0.52 },
  formCard: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 28,
    paddingTop: 30,
    paddingBottom: 20,
    elevation: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.15, shadowRadius: 12,
  },
  formTitle: { fontSize: 24, fontWeight: '800', color: '#1a237e', marginBottom: 4 },
  formSubtitle: { fontSize: 13, color: '#999', marginBottom: 20 },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#ffebee', padding: 12, borderRadius: 10,
    marginBottom: 16, borderLeftWidth: 3, borderLeftColor: '#c62828',
  },
  errorText: { fontSize: 13, color: '#c62828', flex: 1 },
  input: { marginBottom: 14, backgroundColor: 'white' },
  loginBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#1a237e', borderRadius: 12, paddingVertical: 14, marginTop: 4,
  },
  loginBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  helpRow: { flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center', marginTop: 16 },
  helpText: { fontSize: 12, color: '#bbb', flex: 1 },
});
`;

// Write files
const files = {
  'NoticeScreen.js': noticeScreen,
  'ProfileScreen.js': profileScreen,
  'LoginScreen.js': loginScreen,
};

for (const [filename, content] of Object.entries(files)) {
  const filepath = path.join(screensDir, filename);
  fs.writeFileSync(filepath, content, 'utf8');
  console.log(`Written: ${filepath}`);
}

console.log('\nAll parent screens written successfully!');
