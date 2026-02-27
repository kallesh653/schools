import React, { useState, useEffect, useContext } from 'react';
import {
  View, ScrollView, StyleSheet, TouchableOpacity, Text,
  StatusBar, RefreshControl, Dimensions
} from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { homeworkAPI, noticeAPI } from '../services/api';
import { DrawerContext } from '../context/DrawerContext';

const { width } = Dimensions.get('window');

const quickAccessItems = [
  { label: 'Attendance', icon: 'check-circle-outline', screen: 'Attendance', color: '#4caf50', bg: '#e8f5e9' },
  { label: 'Marks', icon: 'file-document-outline', screen: 'Marks', color: '#9c27b0', bg: '#f3e5f5' },
  { label: 'Homework', icon: 'book-open-variant', screen: 'Homework', color: '#e91e63', bg: '#fce4ec' },
  { label: 'Notices', icon: 'bell-outline', screen: 'Notices', color: '#00acc1', bg: '#e0f7fa' },
  { label: 'Profile', icon: 'account-circle-outline', screen: 'Profile', color: '#607d8b', bg: '#eceff1' },
];

export default function DashboardScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [homeworks, setHomeworks] = useState([]);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { openDrawer } = useContext(DrawerContext);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) setUser(JSON.parse(userData));
      const [hwRes, noticeRes] = await Promise.all([
        homeworkAPI.getAll().catch(() => ({ data: [] })),
        noticeAPI.getAll().catch(() => ({ data: [] })),
      ]);
      setHomeworks((hwRes.data || []).slice(0, 4));
      setNotices((noticeRes.data || []).slice(0, 4));
    } catch (e) {
      console.error('Dashboard error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => { setRefreshing(true); loadData(); };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1976d2" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  const displayName = user ? (user.fullName || user.username || '') : '';
  const firstName = displayName.split(' ')[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <View style={{ flex: 1, backgroundColor: '#f0f4f8' }}>
      <StatusBar barStyle="light-content" backgroundColor="#1565c0" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={openDrawer} style={styles.menuBtn}>
            <MaterialCommunityIcons name="menu" size={26} color="#fff" />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.greeting}>{greeting},</Text>
            <Text style={styles.userName}>{firstName || 'Teacher'}</Text>
          </View>
          <View style={styles.headerAvatar}>
            <Text style={styles.headerAvatarText}>{displayName ? displayName[0].toUpperCase() : 'T'}</Text>
          </View>
        </View>
        <Text style={styles.headerDate}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </Text>
        <View style={styles.headerBadge}>
          <MaterialCommunityIcons name="school" size={14} color="#fff" />
          <Text style={styles.headerBadgeText}>Teacher Portal</Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1976d2']} />}
      >
        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: '#1976d2' }]}>
            <MaterialCommunityIcons name="account-group" size={22} color="#fff" />
            <Text style={styles.statNumber}>--</Text>
            <Text style={styles.statLabel}>Students</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#4caf50' }]}>
            <MaterialCommunityIcons name="check-all" size={22} color="#fff" />
            <Text style={styles.statNumber}>--</Text>
            <Text style={styles.statLabel}>Attendance</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#e91e63' }]}>
            <MaterialCommunityIcons name="book-open" size={22} color="#fff" />
            <Text style={styles.statNumber}>{homeworks.length}</Text>
            <Text style={styles.statLabel}>Homework</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#00acc1' }]}>
            <MaterialCommunityIcons name="bell" size={22} color="#fff" />
            <Text style={styles.statNumber}>{notices.length}</Text>
            <Text style={styles.statLabel}>Notices</Text>
          </View>
        </View>

        {/* Quick Access */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Access</Text>
          <View style={styles.quickGrid}>
            {quickAccessItems.map((item) => (
              <TouchableOpacity
                key={item.label}
                style={[styles.quickCard, { backgroundColor: item.bg }]}
                onPress={() => navigation.navigate(item.screen)}
                activeOpacity={0.7}
              >
                <View style={[styles.quickIcon, { backgroundColor: item.color }]}>
                  <MaterialCommunityIcons name={item.icon} size={22} color="#fff" />
                </View>
                <Text style={[styles.quickLabel, { color: item.color }]}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Homework */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Homework</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Homework')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          {homeworks.length > 0 ? homeworks.map((hw) => (
            <View key={hw.id} style={styles.hwCard}>
              <View style={[styles.hwDot, { backgroundColor: getPriorityColor(hw.priority) }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.hwTitle}>{hw.title}</Text>
                <Text style={styles.hwDetail}>
                  {hw.schoolClass?.name ? `Class ${hw.schoolClass.name}` : ''}{hw.section?.name ? ` - ${hw.section.name}` : ''}
                  {hw.dueDate ? `  |  Due: ${hw.dueDate}` : ''}
                </Text>
              </View>
              <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(hw.priority) + '22' }]}>
                <Text style={[styles.priorityText, { color: getPriorityColor(hw.priority) }]}>{hw.priority || 'N/A'}</Text>
              </View>
            </View>
          )) : (
            <View style={styles.emptyCard}>
              <MaterialCommunityIcons name="book-off-outline" size={36} color="#bbb" />
              <Text style={styles.emptyText}>No homework assigned yet</Text>
            </View>
          )}
        </View>

        {/* Recent Notices */}
        <View style={[styles.section, { marginBottom: 24 }]}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Notices</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Notices')}>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>
          {notices.length > 0 ? notices.map((notice) => (
            <View key={notice.id} style={styles.noticeCard}>
              <View style={[styles.noticeBadge, { backgroundColor: getTypeColor(notice.type) }]}>
                <Text style={styles.noticeBadgeText}>{notice.type || 'INFO'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.noticeTitle}>{notice.title}</Text>
                <Text style={styles.noticeDate}>{notice.publishDate || ''}</Text>
              </View>
            </View>
          )) : (
            <View style={styles.emptyCard}>
              <MaterialCommunityIcons name="bell-sleep-outline" size={36} color="#bbb" />
              <Text style={styles.emptyText}>No recent notices</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

function getPriorityColor(p) {
  return p === 'HIGH' ? '#f44336' : p === 'MEDIUM' ? '#ff9800' : p === 'LOW' ? '#4caf50' : '#9e9e9e';
}

function getTypeColor(type) {
  const c = { ACADEMIC: '#2196F3', EXAM: '#FF9800', EVENT: '#9C27B0', HOLIDAY: '#4CAF50', FEE: '#F44336' };
  return c[type] || '#757575';
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f4f8' },
  loadingText: { marginTop: 12, color: '#666', fontSize: 14 },
  header: {
    backgroundColor: '#1565c0',
    paddingTop: 44,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  menuBtn: { padding: 4 },
  greeting: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },
  userName: { color: '#fff', fontSize: 20, fontWeight: '700' },
  headerAvatar: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)',
  },
  headerAvatarText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  headerDate: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginLeft: 42, marginBottom: 8 },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginLeft: 42,
    gap: 4,
  },
  headerBadgeText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  statsRow: { flexDirection: 'row', paddingHorizontal: 12, paddingTop: 16, gap: 8 },
  statCard: {
    flex: 1, borderRadius: 14, padding: 12, alignItems: 'center',
    elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, shadowRadius: 4,
  },
  statNumber: { color: '#fff', fontSize: 18, fontWeight: '800', marginTop: 4 },
  statLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 10, marginTop: 2, textAlign: 'center' },
  section: { marginHorizontal: 12, marginTop: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a2e', marginBottom: 10 },
  seeAll: { fontSize: 13, color: '#1976d2', fontWeight: '600' },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  quickCard: {
    width: (width - 24 - 10 * 2) / 3,
    borderRadius: 14, padding: 14, alignItems: 'center',
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08, shadowRadius: 3,
  },
  quickIcon: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  quickLabel: { fontSize: 12, fontWeight: '700', textAlign: 'center' },
  hwCard: {
    backgroundColor: '#fff', borderRadius: 12, padding: 12,
    flexDirection: 'row', alignItems: 'center', marginBottom: 8,
    elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07, shadowRadius: 2, gap: 10,
  },
  hwDot: { width: 10, height: 10, borderRadius: 5 },
  hwTitle: { fontSize: 13, fontWeight: '600', color: '#333' },
  hwDetail: { fontSize: 11, color: '#888', marginTop: 2 },
  priorityBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  priorityText: { fontSize: 10, fontWeight: '700' },
  noticeCard: {
    backgroundColor: '#fff', borderRadius: 12, padding: 12,
    flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8,
    elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07, shadowRadius: 2, gap: 10,
  },
  noticeBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  noticeBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  noticeTitle: { fontSize: 13, fontWeight: '600', color: '#333' },
  noticeDate: { fontSize: 11, color: '#999', marginTop: 2 },
  emptyCard: {
    backgroundColor: '#fff', borderRadius: 14, padding: 24, alignItems: 'center', elevation: 1,
  },
  emptyText: { color: '#aaa', marginTop: 8, fontSize: 13 },
});
