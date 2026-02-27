import React, { useState, useEffect, useContext } from 'react';
import {
  View, ScrollView, StyleSheet, TouchableOpacity, Text,
  StatusBar, RefreshControl, Dimensions
} from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { parentAPI, noticeAPI } from '../services/api';
import { DrawerContext } from '../context/DrawerContext';

const { width } = Dimensions.get('window');

const quickAccessItems = [
  { label: 'Attendance', icon: 'check-circle-outline', screen: 'Attendance', color: '#4caf50', bg: '#e8f5e9' },
  { label: 'Marks', icon: 'file-document-outline', screen: 'Marks', color: '#9c27b0', bg: '#f3e5f5' },
  { label: 'Fees', icon: 'cash', screen: 'Fees', color: '#f57c00', bg: '#fff3e0' },
  { label: 'Homework', icon: 'book-open-variant', screen: 'Homework', color: '#e91e63', bg: '#fce4ec' },
  { label: 'Notices', icon: 'bell-outline', screen: 'Notices', color: '#00acc1', bg: '#e0f7fa' },
  { label: 'Profile', icon: 'account-circle-outline', screen: 'Profile', color: '#607d8b', bg: '#eceff1' },
];

export default function DashboardScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [children, setChildren] = useState([]);
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { openDrawer } = useContext(DrawerContext);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        const [childrenRes, noticesRes] = await Promise.all([
          parsedUser.entityId
            ? parentAPI.getChildren(parsedUser.entityId).catch(() => ({ data: [] }))
            : Promise.resolve({ data: [] }),
          noticeAPI.getPublished().catch(() => noticeAPI.getAll().catch(() => ({ data: [] }))),
        ]);
        const allNotices = noticesRes.data || [];
        setChildren(childrenRes.data || []);
        setNotices(allNotices.filter(n => n.targetAudience === 'ALL' || n.targetAudience === 'PARENTS').slice(0, 4));
      }
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
  const greeting = new Date().getHours() < 12 ? 'Good Morning' : new Date().getHours() < 17 ? 'Good Afternoon' : 'Good Evening';

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
            <Text style={styles.userName}>{firstName || 'Parent'}</Text>
          </View>
          <View style={styles.headerAvatar}>
            <Text style={styles.headerAvatarText}>{displayName ? displayName[0].toUpperCase() : 'P'}</Text>
          </View>
        </View>
        <Text style={styles.headerDate}>
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1976d2']} />}
      >
        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: '#1976d2' }]}>
            <MaterialCommunityIcons name="account-child" size={22} color="#fff" />
            <Text style={styles.statNumber}>{children.length}</Text>
            <Text style={styles.statLabel}>Children</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#4caf50' }]}>
            <MaterialCommunityIcons name="check-circle" size={22} color="#fff" />
            <Text style={styles.statNumber}>--</Text>
            <Text style={styles.statLabel}>Attendance</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#f57c00' }]}>
            <MaterialCommunityIcons name="cash-remove" size={22} color="#fff" />
            <Text style={styles.statNumber}>--</Text>
            <Text style={styles.statLabel}>Fees Due</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#e91e63' }]}>
            <MaterialCommunityIcons name="book-open" size={22} color="#fff" />
            <Text style={styles.statNumber}>{notices.length}</Text>
            <Text style={styles.statLabel}>Notices</Text>
          </View>
        </View>

        {/* My Children */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Children</Text>
          {children.length > 0 ? children.map((child) => (
            <View key={child.id} style={styles.childCard}>
              <View style={styles.childAvatar}>
                <Text style={styles.childAvatarText}>{(child.firstName || '?')[0].toUpperCase()}</Text>
              </View>
              <View style={styles.childInfo}>
                <Text style={styles.childName}>{child.firstName} {child.lastName}</Text>
                <Text style={styles.childDetail}>
                  {child.schoolClass?.name ? `Class ${child.schoolClass.name}` : ''}{child.section?.name ? ` - Section ${child.section.name}` : ''}
                </Text>
                <Text style={styles.childAdmission}>Adm No: {child.admissionNo || 'N/A'}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color="#bbb" />
            </View>
          )) : (
            <View style={styles.emptyCard}>
              <MaterialCommunityIcons name="account-child-outline" size={40} color="#bbb" />
              <Text style={styles.emptyText}>No children linked to this account</Text>
            </View>
          )}
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

function getTypeColor(type) {
  const colors = { ACADEMIC: '#2196F3', EXAM: '#FF9800', EVENT: '#9C27B0', HOLIDAY: '#4CAF50', FEE: '#F44336' };
  return colors[type] || '#757575';
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
  headerTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
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
  headerDate: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginLeft: 42 },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingTop: 16,
    gap: 8,
  },
  statCard: {
    flex: 1,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  statNumber: { color: '#fff', fontSize: 18, fontWeight: '800', marginTop: 4 },
  statLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 10, marginTop: 2, textAlign: 'center' },
  section: { marginHorizontal: 12, marginTop: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a2e', marginBottom: 10 },
  seeAll: { fontSize: 13, color: '#1976d2', fontWeight: '600' },
  childCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  childAvatar: {
    width: 46, height: 46, borderRadius: 23,
    backgroundColor: '#1976d2',
    alignItems: 'center', justifyContent: 'center', marginRight: 14,
  },
  childAvatarText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  childInfo: { flex: 1 },
  childName: { fontSize: 15, fontWeight: '700', color: '#222' },
  childDetail: { fontSize: 13, color: '#555', marginTop: 2 },
  childAdmission: { fontSize: 11, color: '#999', marginTop: 2 },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickCard: {
    width: (width - 24 - 10 * 2) / 3,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  quickIcon: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 8,
  },
  quickLabel: { fontSize: 12, fontWeight: '700', textAlign: 'center' },
  noticeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 2,
    gap: 10,
  },
  noticeBadge: {
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 6,
  },
  noticeBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  noticeTitle: { fontSize: 13, fontWeight: '600', color: '#333' },
  noticeDate: { fontSize: 11, color: '#999', marginTop: 2 },
  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    elevation: 1,
  },
  emptyText: { color: '#aaa', marginTop: 8, fontSize: 13 },
});
