import React, { useState, useEffect, useContext } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity, Text, StatusBar, RefreshControl, Dimensions } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { teacherAPI, homeworkAPI, noticeAPI, attendanceAPI } from '../services/api';
import { DrawerContext } from '../context/DrawerContext';

const { width } = Dimensions.get('window');

const quickItems = [
  { label: 'Attendance', icon: 'check-circle-outline', screen: 'Attendance', color: '#2e7d32', bg: '#e8f5e9' },
  { label: 'Marks', icon: 'file-document-outline', screen: 'Marks', color: '#6a1b9a', bg: '#f3e5f5' },
  { label: 'Homework', icon: 'book-open-variant', screen: 'Homework', color: '#ad1457', bg: '#fce4ec' },
  { label: 'Notices', icon: 'bell-outline', screen: 'Notices', color: '#00838f', bg: '#e0f7fa' },
  { label: 'Profile', icon: 'account-circle-outline', screen: 'Profile', color: '#37474f', bg: '#eceff1' },
];

function getPriColor(p) {
  return p === 'HIGH' ? '#f44336' : p === 'MEDIUM' ? '#ff9800' : '#4caf50';
}
function getTypeColor(t) {
  const c = { ACADEMIC: '#2196F3', EXAM: '#FF9800', EVENT: '#9C27B0', HOLIDAY: '#4CAF50', FEE: '#F44336' };
  return c[t] || '#757575';
}

export default function DashboardScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [homeworks, setHomeworks] = useState([]);
  const [notices, setNotices] = useState([]);
  const [todayStats, setTodayStats] = useState({ present: 0, absent: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { openDrawer } = useContext(DrawerContext);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) setUser(JSON.parse(userData));
      const [asgRes, hwRes, noticeRes] = await Promise.all([
        teacherAPI.getMyAssignments().catch(() => ({ data: [] })),
        homeworkAPI.getAll().catch(() => ({ data: [] })),
        noticeAPI.getPublished().catch(() => ({ data: [] })),
      ]);
      const myAssignments = asgRes.data || [];
      setAssignments(myAssignments);
      setHomeworks((hwRes.data || []).slice(0, 4));
      setNotices((noticeRes.data || []).filter(n => n.targetAudience === 'ALL' || n.targetAudience === 'TEACHERS').slice(0, 3));
    } catch (e) {
      console.error('Dashboard error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => { setRefreshing(true); loadData(); };

  const uniqueClasses = [...new Map(assignments.map(a => [a.schoolClass?.id, a.schoolClass])).values()].filter(Boolean);
  const uniqueSubjects = [...new Map(assignments.map(a => [a.subject?.id, a.subject])).values()].filter(Boolean);

  const displayName = user ? (user.fullName || user.username || '') : '';
  const firstName = displayName.split(' ')[0] || 'Teacher';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const initials = displayName ? displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'T';

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1976d2" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f0f4f8' }}>
      <StatusBar barStyle="light-content" backgroundColor="#1565c0" />
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={openDrawer} style={styles.menuBtn}>
            <MaterialCommunityIcons name="menu" size={26} color="#fff" />
          </TouchableOpacity>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.greeting}>{greeting},</Text>
            <Text style={styles.userName}>{firstName}</Text>
          </View>
          <View style={styles.headerAvatar}>
            <Text style={styles.headerAvatarText}>{initials}</Text>
          </View>
        </View>
        <Text style={styles.headerDate}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
        <View style={styles.headerBadge}>
          <MaterialCommunityIcons name="teach" size={13} color="#fff" />
          <Text style={styles.headerBadgeText}>Teacher Portal</Text>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#1976d2']} />}>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          {[
            { icon: 'google-classroom', value: uniqueClasses.length, label: 'Classes', color: '#1976d2' },
            { icon: 'book-education', value: uniqueSubjects.length, label: 'Subjects', color: '#7b1fa2' },
            { icon: 'book-open-variant', value: homeworks.length, label: 'Homework', color: '#c2185b' },
            { icon: 'bell-ring', value: notices.length, label: 'Notices', color: '#0097a7' },
          ].map(s => (
            <View key={s.label} style={[styles.statCard, { backgroundColor: s.color }]}>
              <MaterialCommunityIcons name={s.icon} size={20} color="#fff" />
              <Text style={styles.statNumber}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* My Classes */}
        {uniqueClasses.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>My Assigned Classes</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
              {uniqueClasses.map((cls, i) => {
                const classSubjects = assignments.filter(a => a.schoolClass?.id === cls.id).map(a => a.subject?.name).filter(Boolean);
                const colors = ['#1565c0', '#6a1b9a', '#ad1457', '#00838f', '#2e7d32', '#e65100'];
                const color = colors[i % colors.length];
                return (
                  <View key={cls.id} style={[styles.classCard, { borderTopColor: color }]}>
                    <View style={[styles.classIcon, { backgroundColor: color + '18' }]}>
                      <MaterialCommunityIcons name="google-classroom" size={22} color={color} />
                    </View>
                    <Text style={[styles.className, { color }]}>Class {cls.name}</Text>
                    <Text style={styles.classSubjects} numberOfLines={2}>{classSubjects.join(', ') || 'No subjects'}</Text>
                    <TouchableOpacity style={[styles.attendanceBtn, { backgroundColor: color }]}
                      onPress={() => navigation.navigate('Attendance')}>
                      <Text style={styles.attendanceBtnText}>Mark Attendance</Text>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </ScrollView>
          </View>
        )}

        {assignments.length === 0 && (
          <View style={styles.noAssignCard}>
            <MaterialCommunityIcons name="alert-circle-outline" size={36} color="#ffb300" />
            <Text style={styles.noAssignTitle}>No Classes Assigned</Text>
            <Text style={styles.noAssignSub}>Contact admin to get classes assigned to you</Text>
          </View>
        )}

        {/* Quick Access */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Access</Text>
          <View style={styles.quickGrid}>
            {quickItems.map(item => (
              <TouchableOpacity key={item.label} style={[styles.quickCard, { backgroundColor: item.bg }]}
                onPress={() => navigation.navigate(item.screen)} activeOpacity={0.7}>
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
          {homeworks.length > 0 ? homeworks.map(hw => (
            <View key={hw.id} style={styles.hwCard}>
              <View style={[styles.hwDot, { backgroundColor: getPriColor(hw.priority) }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.hwTitle} numberOfLines={1}>{hw.title}</Text>
                <Text style={styles.hwDetail}>
                  {hw.schoolClass?.name ? 'Class ' + hw.schoolClass.name : ''}{hw.section?.name ? ' - ' + hw.section.name : ''}
                  {hw.subject?.name ? '  |  ' + hw.subject.name : ''}
                  {hw.dueDate ? '  |  Due: ' + hw.dueDate : ''}
                </Text>
              </View>
              <View style={[styles.priBadge, { backgroundColor: getPriColor(hw.priority) + '22' }]}>
                <Text style={[styles.priText, { color: getPriColor(hw.priority) }]}>{hw.priority || 'N/A'}</Text>
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
          {notices.length > 0 ? notices.map(n => (
            <View key={n.id} style={styles.noticeCard}>
              <View style={[styles.noticeBadge, { backgroundColor: getTypeColor(n.noticeType) }]}>
                <Text style={styles.noticeBadgeText}>{n.noticeType || 'INFO'}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.noticeTitle} numberOfLines={1}>{n.title}</Text>
                <Text style={styles.noticeDate}>{n.publishDate || ''}</Text>
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

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f4f8' },
  loadingText: { marginTop: 12, color: '#666', fontSize: 14 },
  header: { backgroundColor: '#1565c0', paddingTop: 44, paddingBottom: 20, paddingHorizontal: 16, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  menuBtn: { padding: 4 },
  greeting: { color: 'rgba(255,255,255,0.8)', fontSize: 13 },
  userName: { color: '#fff', fontSize: 20, fontWeight: '700' },
  headerAvatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.5)' },
  headerAvatarText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  headerDate: { color: 'rgba(255,255,255,0.75)', fontSize: 12, marginLeft: 42, marginBottom: 8 },
  headerBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginLeft: 42, gap: 4 },
  headerBadgeText: { color: '#fff', fontSize: 11, fontWeight: '600' },
  statsRow: { flexDirection: 'row', paddingHorizontal: 12, paddingTop: 16, gap: 8 },
  statCard: { flex: 1, borderRadius: 14, padding: 10, alignItems: 'center', elevation: 3 },
  statNumber: { color: '#fff', fontSize: 18, fontWeight: '800', marginTop: 4 },
  statLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 10, marginTop: 2, textAlign: 'center' },
  section: { marginHorizontal: 12, marginTop: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1a1a2e', marginBottom: 10 },
  seeAll: { fontSize: 13, color: '#1976d2', fontWeight: '600' },
  classCard: { width: 160, backgroundColor: '#fff', borderRadius: 14, padding: 14, borderTopWidth: 3, elevation: 2 },
  classIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  className: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  classSubjects: { fontSize: 11, color: '#888', marginBottom: 12, lineHeight: 15 },
  attendanceBtn: { borderRadius: 8, paddingVertical: 7, alignItems: 'center' },
  attendanceBtnText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  noAssignCard: { margin: 16, backgroundColor: '#fff', borderRadius: 16, padding: 28, alignItems: 'center', elevation: 2 },
  noAssignTitle: { fontSize: 16, fontWeight: '700', color: '#333', marginTop: 12 },
  noAssignSub: { fontSize: 13, color: '#888', marginTop: 4, textAlign: 'center' },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  quickCard: { width: (width - 24 - 10 * 2) / 3, borderRadius: 14, padding: 14, alignItems: 'center', elevation: 2 },
  quickIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  quickLabel: { fontSize: 12, fontWeight: '700', textAlign: 'center' },
  hwCard: { backgroundColor: '#fff', borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'center', marginBottom: 8, elevation: 1, gap: 10 },
  hwDot: { width: 10, height: 10, borderRadius: 5 },
  hwTitle: { fontSize: 13, fontWeight: '600', color: '#333' },
  hwDetail: { fontSize: 11, color: '#888', marginTop: 2 },
  priBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  priText: { fontSize: 10, fontWeight: '700' },
  noticeCard: { backgroundColor: '#fff', borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8, elevation: 1, gap: 10 },
  noticeBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  noticeBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  noticeTitle: { fontSize: 13, fontWeight: '600', color: '#333' },
  noticeDate: { fontSize: 11, color: '#999', marginTop: 2 },
  emptyCard: { backgroundColor: '#fff', borderRadius: 14, padding: 24, alignItems: 'center', elevation: 1 },
  emptyText: { color: '#aaa', marginTop: 8, fontSize: 13 },
});
