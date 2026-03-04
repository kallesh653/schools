const fs = require('fs');
const path = require('path');

const SCREENS_DIR = path.join(__dirname, 'teacher-app', 'src', 'screens');

// ============================================================
// LoginScreen.js
// ============================================================
const LOGIN = `import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  StatusBar, Animated, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { authAPI } from '../services/api';

export default function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) { setError('Please enter username and password'); return; }
    setLoading(true); setError('');
    try {
      const response = await authAPI.login({ username: username.trim(), password });
      const data = response.data;
      if (data.role !== 'ROLE_TEACHER' && data.role !== 'TEACHER') {
        setError('Access denied. This app is for teachers only.'); setLoading(false); return;
      }
      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data));
      await AsyncStorage.setItem('fullName', data.fullName || data.username || '');
      onLogin();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data || '';
      if (err?.response?.status === 401) setError('Invalid username or password');
      else if (msg) setError(String(msg));
      else setError('Connection failed. Please check your network.');
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="light-content" backgroundColor="#0d47a1" />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <MaterialCommunityIcons name="school" size={48} color="#fff" />
          </View>
          <Text style={styles.appName}>EduConnect</Text>
          <Text style={styles.appSub}>Teacher Portal</Text>
        </View>

        <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.welcomeText}>Welcome Back!</Text>
          <Text style={styles.signInText}>Sign in to your teacher account</Text>

          {error ? (
            <View style={styles.errorBox}>
              <MaterialCommunityIcons name="alert-circle-outline" size={16} color="#c62828" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username</Text>
            <View style={styles.inputWrapper}>
              <MaterialCommunityIcons name="account-outline" size={20} color="#888" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your username"
                placeholderTextColor="#bbb"
                value={username}
                onChangeText={v => { setUsername(v); setError(''); }}
                autoCapitalize="none" autoCorrect={false} returnKeyType="next"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <MaterialCommunityIcons name="lock-outline" size={20} color="#888" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Enter your password"
                placeholderTextColor="#bbb"
                value={password}
                onChangeText={v => { setPassword(v); setError(''); }}
                secureTextEntry={!showPassword}
                returnKeyType="done" onSubmitEditing={handleLogin}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <MaterialCommunityIcons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#888" />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={[styles.loginBtn, loading && { opacity: 0.7 }]} onPress={handleLogin} disabled={loading} activeOpacity={0.85}>
            {loading ? <ActivityIndicator size="small" color="#fff" /> : (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <MaterialCommunityIcons name="login" size={20} color="#fff" />
                <Text style={styles.loginBtnText}>Sign In</Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <MaterialCommunityIcons name="information-outline" size={14} color="#aaa" />
            <Text style={styles.footerText}>Use your school-assigned teacher credentials</Text>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: '#1565c0', alignItems: 'center', paddingTop: 70, paddingBottom: 50 },
  logoCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)' },
  appName: { color: '#fff', fontSize: 28, fontWeight: '800', letterSpacing: 0.5 },
  appSub: { color: 'rgba(255,255,255,0.75)', fontSize: 14, marginTop: 4, letterSpacing: 1 },
  card: { flex: 1, backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, marginTop: -24, padding: 28, paddingBottom: 40, elevation: 8 },
  welcomeText: { fontSize: 22, fontWeight: '800', color: '#1a237e', marginBottom: 4 },
  signInText: { fontSize: 14, color: '#888', marginBottom: 24 },
  errorBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffebee', borderRadius: 10, padding: 12, marginBottom: 16, gap: 8, borderLeftWidth: 3, borderLeftColor: '#c62828' },
  errorText: { color: '#c62828', fontSize: 13, flex: 1 },
  inputGroup: { marginBottom: 18 },
  label: { fontSize: 13, fontWeight: '600', color: '#444', marginBottom: 6 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#e0e0e0', borderRadius: 12, backgroundColor: '#fafafa', paddingHorizontal: 12, minHeight: 50 },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: 15, color: '#333', paddingVertical: 12 },
  eyeBtn: { padding: 4 },
  loginBtn: { backgroundColor: '#1565c0', borderRadius: 14, paddingVertical: 16, alignItems: 'center', justifyContent: 'center', marginTop: 8, elevation: 4 },
  loginBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 24 },
  footerText: { fontSize: 12, color: '#aaa' },
});
`;

// ============================================================
// DashboardScreen.js
// ============================================================
const DASHBOARD = `import React, { useState, useEffect, useContext } from 'react';
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
`;

// ============================================================
// AttendanceScreen.js
// ============================================================
const ATTENDANCE = `import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, RefreshControl, Alert, ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { teacherAPI, sectionAPI, studentAPI, attendanceAPI } from '../services/api';

const STATUS_CONFIG = {
  PRESENT: { label: 'P', color: '#2e7d32', bg: '#e8f5e9', icon: 'check-circle' },
  ABSENT:  { label: 'A', color: '#c62828', bg: '#ffebee', icon: 'close-circle' },
  LATE:    { label: 'L', color: '#e65100', bg: '#fff3e0', icon: 'clock-alert' },
  LEAVE:   { label: 'LE', color: '#1565c0', bg: '#e3f2fd', icon: 'calendar-remove' },
};
const STATUS_ORDER = ['PRESENT', 'ABSENT', 'LATE', 'LEAVE'];

function getGrade(status) {
  return STATUS_CONFIG[status] || STATUS_CONFIG.PRESENT;
}

export default function AttendanceScreen() {
  const [assignments, setAssignments] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [sections, setSections] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { loadAssignments(); }, []);
  useEffect(() => { if (selectedClassId) loadSections(); }, [selectedClassId]);
  useEffect(() => { if (selectedClassId && selectedSectionId) loadStudents(); }, [selectedClassId, selectedSectionId, date]);

  const loadAssignments = async () => {
    try {
      const res = await teacherAPI.getMyAssignments();
      setAssignments(res.data || []);
    } catch (e) { console.error(e); }
  };

  const loadSections = async () => {
    try {
      const res = await sectionAPI.getByClass(selectedClassId);
      setSections(res.data || []);
      setSelectedSectionId('');
      setStudents([]);
    } catch (e) { setSections([]); }
  };

  const loadStudents = async () => {
    setLoadingStudents(true); setSubmitted(false);
    try {
      const [studRes, attRes] = await Promise.all([
        studentAPI.getByClassAndSection(selectedClassId, selectedSectionId),
        attendanceAPI.getByClassSectionDate(selectedClassId, selectedSectionId, date).catch(() => ({ data: [] })),
      ]);
      const studs = studRes.data || [];
      const existingAtt = {};
      (attRes.data || []).forEach(a => { if (a.student?.id) existingAtt[a.student.id] = a.status; });
      setStudents(studs);
      const init = {};
      studs.forEach(s => { init[s.id] = existingAtt[s.id] || 'PRESENT'; });
      setAttendance(init);
      if (Object.keys(existingAtt).length > 0) setSubmitted(true);
    } catch (e) { Alert.alert('Error', 'Failed to load students'); }
    setLoadingStudents(false);
  };

  const cycleStatus = (studentId) => {
    setAttendance(prev => {
      const cur = prev[studentId] || 'PRESENT';
      const idx = STATUS_ORDER.indexOf(cur);
      const next = STATUS_ORDER[(idx + 1) % STATUS_ORDER.length];
      return { ...prev, [studentId]: next };
    });
  };

  const markAll = (status) => {
    const newAtt = {};
    students.forEach(s => { newAtt[s.id] = status; });
    setAttendance(newAtt);
  };

  const submitAttendance = async () => {
    if (!selectedClassId || !selectedSectionId) return;
    setSubmitting(true);
    try {
      const payload = students.map(s => ({
        student: { id: s.id },
        date,
        status: attendance[s.id] || 'PRESENT',
        schoolClass: { id: parseInt(selectedClassId) },
        section: { id: parseInt(selectedSectionId) },
      }));
      await attendanceAPI.mark(payload);
      setSubmitted(true);
      Alert.alert('Success', 'Attendance submitted successfully!');
    } catch (e) { Alert.alert('Error', 'Failed to submit attendance'); }
    setSubmitting(false);
  };

  const uniqueClasses = [...new Map(assignments.map(a => [a.schoolClass?.id, a.schoolClass])).values()].filter(Boolean);
  const counts = { PRESENT: 0, ABSENT: 0, LATE: 0, LEAVE: 0 };
  Object.values(attendance).forEach(s => { if (counts[s] !== undefined) counts[s]++; });

  return (
    <View style={{ flex: 1, backgroundColor: '#f0f4f8' }}>
      <StatusBar barStyle="light-content" backgroundColor="#2e7d32" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.headerIcon}>
            <MaterialCommunityIcons name="check-circle-outline" size={24} color="#fff" />
          </View>
          <View>
            <Text style={styles.headerTitle}>Take Attendance</Text>
            <Text style={styles.headerSub}>Mark your students</Text>
          </View>
        </View>
        <Text style={styles.headerDate}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</Text>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadStudents().finally(() => setRefreshing(false)); }} colors={['#2e7d32']} />}>

        {/* Class/Section Selection */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Select Class & Section</Text>
          {assignments.length === 0 ? (
            <View style={styles.noAssignBox}>
              <MaterialCommunityIcons name="alert-circle-outline" size={28} color="#ffb300" />
              <Text style={styles.noAssignText}>No classes assigned. Contact admin.</Text>
            </View>
          ) : (
            <>
              <Text style={styles.pickerLabel}>Class</Text>
              <View style={styles.pickerBox}>
                <Picker selectedValue={selectedClassId} onValueChange={v => { setSelectedClassId(v); setSelectedSectionId(''); setStudents([]); }} style={styles.picker}>
                  <Picker.Item label="Select your class" value="" />
                  {uniqueClasses.map(cls => <Picker.Item key={cls.id} label={"Class " + cls.name} value={cls.id.toString()} />)}
                </Picker>
              </View>

              {selectedClassId ? (
                <>
                  <Text style={styles.pickerLabel}>Section</Text>
                  <View style={styles.pickerBox}>
                    <Picker selectedValue={selectedSectionId} onValueChange={setSelectedSectionId} style={styles.picker}>
                      <Picker.Item label="Select section" value="" />
                      {sections.map(sec => <Picker.Item key={sec.id} label={sec.name} value={sec.id.toString()} />)}
                    </Picker>
                  </View>
                </>
              ) : null}

              <Text style={styles.pickerLabel}>Date</Text>
              <TouchableOpacity style={styles.dateBox}>
                <MaterialCommunityIcons name="calendar" size={18} color="#666" />
                <Text style={styles.dateText}>{date}</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Student List */}
        {loadingStudents ? (
          <View style={styles.loadingBox}><ActivityIndicator size="large" color="#2e7d32" /></View>
        ) : students.length > 0 ? (
          <>
            {/* Summary */}
            <View style={styles.summaryRow}>
              {Object.entries(counts).map(([status, count]) => {
                const cfg = STATUS_CONFIG[status];
                return (
                  <View key={status} style={[styles.summaryCard, { backgroundColor: cfg.bg, borderColor: cfg.color }]}>
                    <Text style={[styles.summaryCount, { color: cfg.color }]}>{count}</Text>
                    <Text style={[styles.summaryLabel, { color: cfg.color }]}>{cfg.label}</Text>
                  </View>
                );
              })}
            </View>

            {/* Mark All Buttons */}
            <View style={styles.markAllRow}>
              <Text style={styles.markAllLabel}>Mark All:</Text>
              {STATUS_ORDER.map(s => {
                const cfg = STATUS_CONFIG[s];
                return (
                  <TouchableOpacity key={s} style={[styles.markAllBtn, { backgroundColor: cfg.bg, borderColor: cfg.color }]}
                    onPress={() => markAll(s)}>
                    <Text style={[styles.markAllBtnText, { color: cfg.color }]}>{cfg.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {submitted && (
              <View style={styles.submittedBanner}>
                <MaterialCommunityIcons name="check-circle" size={16} color="#2e7d32" />
                <Text style={styles.submittedText}>Attendance already submitted today. You can update it.</Text>
              </View>
            )}

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Students ({students.length})</Text>
              <Text style={styles.cardSub}>Tap a student to cycle through status (P → A → L → LE)</Text>
              {students.map((student, idx) => {
                const status = attendance[student.id] || 'PRESENT';
                const cfg = STATUS_CONFIG[status];
                return (
                  <TouchableOpacity key={student.id} style={[styles.studentRow, idx % 2 === 0 && styles.studentRowAlt]} onPress={() => cycleStatus(student.id)} activeOpacity={0.7}>
                    <View style={styles.studentNumber}>
                      <Text style={styles.studentNumberText}>{idx + 1}</Text>
                    </View>
                    <View style={styles.studentAvatar}>
                      <Text style={styles.studentAvatarText}>{student.firstName?.[0]?.toUpperCase() || '?'}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.studentName}>{student.firstName} {student.lastName}</Text>
                      <Text style={styles.studentRoll}>Roll: {student.rollNumber || student.admissionNumber || 'N/A'}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: cfg.bg, borderColor: cfg.color }]}>
                      <MaterialCommunityIcons name={cfg.icon} size={14} color={cfg.color} />
                      <Text style={[styles.statusText, { color: cfg.color }]}>{status}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}

              <TouchableOpacity style={[styles.submitBtn, submitting && { opacity: 0.7 }]} onPress={submitAttendance} disabled={submitting}>
                {submitting ? <ActivityIndicator size="small" color="#fff" /> : (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <MaterialCommunityIcons name="send" size={18} color="#fff" />
                    <Text style={styles.submitBtnText}>{submitted ? 'Update Attendance' : 'Submit Attendance'}</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </>
        ) : selectedClassId && selectedSectionId ? (
          <View style={styles.emptyCard}>
            <MaterialCommunityIcons name="account-multiple-remove" size={40} color="#bbb" />
            <Text style={styles.emptyText}>No students found in this class</Text>
          </View>
        ) : null}

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: '#2e7d32', paddingTop: 44, paddingBottom: 20, paddingHorizontal: 16, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 8 },
  headerIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
  headerSub: { color: 'rgba(255,255,255,0.75)', fontSize: 12 },
  headerDate: { color: 'rgba(255,255,255,0.8)', fontSize: 12, marginLeft: 56 },
  card: { backgroundColor: '#fff', borderRadius: 16, margin: 12, padding: 16, elevation: 2 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#1a237e', marginBottom: 4 },
  cardSub: { fontSize: 11, color: '#888', marginBottom: 12 },
  noAssignBox: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, backgroundColor: '#fff8e1', borderRadius: 10 },
  noAssignText: { fontSize: 13, color: '#e65100', flex: 1 },
  pickerLabel: { fontSize: 12, fontWeight: '600', color: '#555', marginTop: 10, marginBottom: 4 },
  pickerBox: { borderWidth: 1.5, borderColor: '#e0e0e0', borderRadius: 10, backgroundColor: '#fafafa', marginBottom: 4 },
  picker: { height: 48 },
  dateBox: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#e0e0e0', borderRadius: 10, backgroundColor: '#fafafa', padding: 12, gap: 8, marginTop: 4 },
  dateText: { fontSize: 14, color: '#444' },
  loadingBox: { padding: 40, alignItems: 'center' },
  summaryRow: { flexDirection: 'row', marginHorizontal: 12, gap: 8, marginTop: 4 },
  summaryCard: { flex: 1, borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1.5 },
  summaryCount: { fontSize: 22, fontWeight: '800' },
  summaryLabel: { fontSize: 11, fontWeight: '700', marginTop: 2 },
  markAllRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 12, marginTop: 8, gap: 8 },
  markAllLabel: { fontSize: 12, color: '#666', fontWeight: '600' },
  markAllBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1.5 },
  markAllBtnText: { fontSize: 11, fontWeight: '700' },
  submittedBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 12, marginTop: 8, backgroundColor: '#e8f5e9', padding: 10, borderRadius: 8 },
  submittedText: { fontSize: 12, color: '#2e7d32', flex: 1 },
  studentRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 4, borderRadius: 10, gap: 10 },
  studentRowAlt: { backgroundColor: '#f8f9fa' },
  studentNumber: { width: 24, alignItems: 'center' },
  studentNumberText: { fontSize: 11, color: '#aaa', fontWeight: '600' },
  studentAvatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: '#1565c0', alignItems: 'center', justifyContent: 'center' },
  studentAvatarText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  studentName: { fontSize: 14, fontWeight: '600', color: '#1a237e' },
  studentRoll: { fontSize: 11, color: '#888', marginTop: 1 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, borderWidth: 1.5, gap: 4 },
  statusText: { fontSize: 11, fontWeight: '700' },
  submitBtn: { backgroundColor: '#2e7d32', borderRadius: 12, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', marginTop: 16, elevation: 3 },
  submitBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  emptyCard: { margin: 16, backgroundColor: '#fff', borderRadius: 14, padding: 32, alignItems: 'center', elevation: 1 },
  emptyText: { color: '#aaa', marginTop: 10, fontSize: 13 },
});
`;

// ============================================================
// MarksScreen.js
// ============================================================
const MARKS = `import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, StatusBar, Alert, ActivityIndicator, Modal,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { teacherAPI, sectionAPI, studentAPI, examinationAPI, marksAPI } from '../services/api';

function getGrade(pct) {
  if (pct >= 90) return { grade: 'A+', color: '#1b5e20' };
  if (pct >= 80) return { grade: 'A',  color: '#2e7d32' };
  if (pct >= 70) return { grade: 'B+', color: '#1565c0' };
  if (pct >= 60) return { grade: 'B',  color: '#1976d2' };
  if (pct >= 50) return { grade: 'C+', color: '#e65100' };
  if (pct >= 40) return { grade: 'C',  color: '#f57c00' };
  if (pct >= 33) return { grade: 'D',  color: '#6a1b9a' };
  return { grade: 'F', color: '#c62828' };
}

export default function MarksScreen() {
  const [assignments, setAssignments] = useState([]);
  const [exams, setExams] = useState([]);
  const [sections, setSections] = useState([]);
  const [students, setStudents] = useState([]);
  const [marksData, setMarksData] = useState({});
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [maxTheory, setMaxTheory] = useState('100');
  const [maxPractical, setMaxPractical] = useState('0');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [theoryInput, setTheoryInput] = useState('');
  const [practicalInput, setPracticalInput] = useState('');
  const [isAbsent, setIsAbsent] = useState(false);

  useEffect(() => {
    Promise.all([teacherAPI.getMyAssignments(), examinationAPI.getAll()])
      .then(([aRes, eRes]) => { setAssignments(aRes.data || []); setExams(eRes.data || []); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedClassId) { sectionAPI.getByClass(selectedClassId).then(r => setSections(r.data || [])).catch(() => {}); }
  }, [selectedClassId]);

  useEffect(() => {
    if (selectedClassId && selectedSectionId) loadStudents();
  }, [selectedClassId, selectedSectionId]);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const res = await studentAPI.getByClassAndSection(selectedClassId, selectedSectionId);
      setStudents(res.data || []);
      setMarksData({});
    } catch (e) { Alert.alert('Error', 'Failed to load students'); }
    setLoading(false);
  };

  const uniqueClasses = [...new Map(assignments.map(a => [a.schoolClass?.id, a.schoolClass])).values()].filter(Boolean);
  const classSubjects = assignments.filter(a => a.schoolClass?.id?.toString() === selectedClassId).map(a => a.subject).filter(Boolean);

  const openModal = (student) => {
    const existing = marksData[student.id];
    setCurrentStudent(student);
    setTheoryInput(existing?.theory?.toString() || '');
    setPracticalInput(existing?.practical?.toString() || '');
    setIsAbsent(existing?.absent || false);
    setModalVisible(true);
  };

  const saveMarks = () => {
    if (!currentStudent) return;
    const theory = parseFloat(theoryInput) || 0;
    const practical = parseFloat(practicalInput) || 0;
    setMarksData(prev => ({
      ...prev,
      [currentStudent.id]: { theory, practical, total: theory + practical, absent: isAbsent },
    }));
    setModalVisible(false);
  };

  const submitMarks = async () => {
    if (!selectedExam || !selectedSubjectId) { Alert.alert('Error', 'Select exam and subject first'); return; }
    const entries = Object.entries(marksData);
    if (entries.length === 0) { Alert.alert('Info', 'Enter marks for at least one student'); return; }
    setSubmitting(true);
    try {
      const payload = entries.map(([studentId, m]) => ({
        student: { id: parseInt(studentId) },
        examination: { id: parseInt(selectedExam) },
        subject: { id: parseInt(selectedSubjectId) },
        theoryMarks: m.theory || 0,
        practicalMarks: m.practical || 0,
        totalMarks: m.total || 0,
        isAbsent: m.absent || false,
      }));
      await marksAPI.createBulk(payload);
      Alert.alert('Success', 'Marks submitted for ' + payload.length + ' students!');
    } catch (e) { Alert.alert('Error', 'Failed to submit marks'); }
    setSubmitting(false);
  };

  const enteredCount = Object.keys(marksData).length;

  return (
    <View style={{ flex: 1, backgroundColor: '#f0f4f8' }}>
      <StatusBar barStyle="light-content" backgroundColor="#6a1b9a" />

      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.headerIcon}><MaterialCommunityIcons name="file-document-outline" size={24} color="#fff" /></View>
          <View>
            <Text style={styles.headerTitle}>Enter Marks</Text>
            <Text style={styles.headerSub}>Record student exam results</Text>
          </View>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Exam Configuration</Text>

          <Text style={styles.pickerLabel}>Examination</Text>
          <View style={styles.pickerBox}>
            <Picker selectedValue={selectedExam} onValueChange={setSelectedExam} style={styles.picker}>
              <Picker.Item label="Select examination" value="" />
              {exams.map(e => <Picker.Item key={e.id} label={e.name} value={e.id.toString()} />)}
            </Picker>
          </View>

          <Text style={styles.pickerLabel}>Class</Text>
          <View style={styles.pickerBox}>
            <Picker selectedValue={selectedClassId} onValueChange={v => { setSelectedClassId(v); setSelectedSectionId(''); setSelectedSubjectId(''); setStudents([]); }} style={styles.picker}>
              <Picker.Item label="Select your class" value="" />
              {uniqueClasses.map(c => <Picker.Item key={c.id} label={"Class " + c.name} value={c.id.toString()} />)}
            </Picker>
          </View>

          {selectedClassId ? (
            <>
              <Text style={styles.pickerLabel}>Section</Text>
              <View style={styles.pickerBox}>
                <Picker selectedValue={selectedSectionId} onValueChange={setSelectedSectionId} style={styles.picker}>
                  <Picker.Item label="Select section" value="" />
                  {sections.map(s => <Picker.Item key={s.id} label={s.name} value={s.id.toString()} />)}
                </Picker>
              </View>

              <Text style={styles.pickerLabel}>Subject (assigned to you)</Text>
              <View style={styles.pickerBox}>
                <Picker selectedValue={selectedSubjectId} onValueChange={setSelectedSubjectId} style={styles.picker}>
                  <Picker.Item label="Select subject" value="" />
                  {classSubjects.map(s => <Picker.Item key={s.id} label={s.name} value={s.id.toString()} />)}
                </Picker>
              </View>

              <View style={styles.maxRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.pickerLabel}>Max Theory Marks</Text>
                  <TextInput style={styles.maxInput} value={maxTheory} onChangeText={setMaxTheory} keyboardType="numeric" placeholder="100" />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.pickerLabel}>Max Practical Marks</Text>
                  <TextInput style={styles.maxInput} value={maxPractical} onChangeText={setMaxPractical} keyboardType="numeric" placeholder="0" />
                </View>
              </View>
            </>
          ) : null}
        </View>

        {loading ? <View style={styles.loadingBox}><ActivityIndicator size="large" color="#6a1b9a" /></View>
        : students.length > 0 ? (
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardTitle}>Students ({students.length})</Text>
              {enteredCount > 0 && (
                <View style={styles.enteredBadge}>
                  <Text style={styles.enteredBadgeText}>{enteredCount} entered</Text>
                </View>
              )}
            </View>
            <Text style={styles.cardSub}>Tap a student to enter marks</Text>

            {students.map((s, idx) => {
              const m = marksData[s.id];
              const maxT = parseFloat(maxTheory) || 100;
              const maxP = parseFloat(maxPractical) || 0;
              const totalMax = maxT + maxP;
              const pct = m && totalMax > 0 ? Math.round(((m.total || 0) / totalMax) * 100) : null;
              const gradeInfo = pct !== null ? getGrade(pct) : null;

              return (
                <TouchableOpacity key={s.id} style={[styles.studentRow, idx % 2 === 0 && styles.studentRowAlt]} onPress={() => openModal(s)} activeOpacity={0.7}>
                  <View style={styles.studentNumber}><Text style={styles.studentNumberText}>{idx + 1}</Text></View>
                  <View style={styles.studentAvatar}>
                    <Text style={styles.studentAvatarText}>{s.firstName?.[0]?.toUpperCase() || '?'}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.studentName}>{s.firstName} {s.lastName}</Text>
                    <Text style={styles.studentRoll}>Roll: {s.rollNumber || s.admissionNumber || 'N/A'}</Text>
                  </View>
                  {m ? (
                    m.absent ? (
                      <View style={styles.absentBadge}><Text style={styles.absentText}>ABSENT</Text></View>
                    ) : (
                      <View style={styles.marksSummary}>
                        <Text style={styles.marksTotal}>{m.total || 0}/{totalMax}</Text>
                        {gradeInfo && <Text style={[styles.grade, { color: gradeInfo.color }]}>{gradeInfo.grade}</Text>}
                      </View>
                    )
                  ) : (
                    <View style={styles.pendingBadge}><Text style={styles.pendingText}>Tap to enter</Text></View>
                  )}
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity style={[styles.submitBtn, submitting && { opacity: 0.7 }]} onPress={submitMarks} disabled={submitting}>
              {submitting ? <ActivityIndicator size="small" color="#fff" /> : (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <MaterialCommunityIcons name="send" size={18} color="#fff" />
                  <Text style={styles.submitBtnText}>Submit Marks ({enteredCount} students)</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        ) : selectedClassId && selectedSectionId ? (
          <View style={styles.emptyCard}>
            <MaterialCommunityIcons name="account-multiple-remove" size={40} color="#bbb" />
            <Text style={styles.emptyText}>No students found</Text>
          </View>
        ) : null}

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Marks Entry Modal */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{currentStudent?.firstName} {currentStudent?.lastName}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={[styles.absentToggle, isAbsent && styles.absentToggleActive]} onPress={() => setIsAbsent(!isAbsent)}>
              <MaterialCommunityIcons name={isAbsent ? 'close-circle' : 'close-circle-outline'} size={20} color={isAbsent ? '#c62828' : '#888'} />
              <Text style={[styles.absentToggleText, isAbsent && { color: '#c62828' }]}>Mark as Absent</Text>
            </TouchableOpacity>

            {!isAbsent && (
              <>
                <View style={styles.marksRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.marksLabel}>Theory Marks (max {maxTheory})</Text>
                    <TextInput style={styles.marksInput} value={theoryInput} onChangeText={setTheoryInput} keyboardType="numeric" placeholder="0" />
                  </View>
                  {parseFloat(maxPractical) > 0 && (
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={styles.marksLabel}>Practical (max {maxPractical})</Text>
                      <TextInput style={styles.marksInput} value={practicalInput} onChangeText={setPracticalInput} keyboardType="numeric" placeholder="0" />
                    </View>
                  )}
                </View>
                {(theoryInput || practicalInput) && (
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Total: </Text>
                    <Text style={styles.totalValue}>{(parseFloat(theoryInput) || 0) + (parseFloat(practicalInput) || 0)}/{(parseFloat(maxTheory) || 0) + (parseFloat(maxPractical) || 0)}</Text>
                  </View>
                )}
              </>
            )}

            <TouchableOpacity style={styles.saveBtnModal} onPress={saveMarks}>
              <Text style={styles.saveBtnText}>Save Marks</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: '#6a1b9a', paddingTop: 44, paddingBottom: 20, paddingHorizontal: 16, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
  headerSub: { color: 'rgba(255,255,255,0.75)', fontSize: 12 },
  card: { backgroundColor: '#fff', borderRadius: 16, margin: 12, padding: 16, elevation: 2 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#1a237e', marginBottom: 4 },
  cardSub: { fontSize: 11, color: '#888', marginBottom: 12 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  enteredBadge: { backgroundColor: '#e8f5e9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  enteredBadgeText: { color: '#2e7d32', fontSize: 11, fontWeight: '700' },
  pickerLabel: { fontSize: 12, fontWeight: '600', color: '#555', marginTop: 10, marginBottom: 4 },
  pickerBox: { borderWidth: 1.5, borderColor: '#e0e0e0', borderRadius: 10, backgroundColor: '#fafafa' },
  picker: { height: 48 },
  maxRow: { flexDirection: 'row', marginTop: 4 },
  maxInput: { borderWidth: 1.5, borderColor: '#e0e0e0', borderRadius: 10, padding: 12, fontSize: 14, backgroundColor: '#fafafa' },
  loadingBox: { padding: 40, alignItems: 'center' },
  studentRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 4, borderRadius: 10, gap: 10 },
  studentRowAlt: { backgroundColor: '#f8f9fa' },
  studentNumber: { width: 22, alignItems: 'center' },
  studentNumberText: { fontSize: 11, color: '#aaa', fontWeight: '600' },
  studentAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#6a1b9a', alignItems: 'center', justifyContent: 'center' },
  studentAvatarText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  studentName: { fontSize: 14, fontWeight: '600', color: '#1a237e' },
  studentRoll: { fontSize: 11, color: '#888', marginTop: 1 },
  marksSummary: { alignItems: 'center' },
  marksTotal: { fontSize: 13, fontWeight: '700', color: '#333' },
  grade: { fontSize: 16, fontWeight: '800', marginTop: 2 },
  absentBadge: { backgroundColor: '#ffebee', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  absentText: { color: '#c62828', fontSize: 10, fontWeight: '700' },
  pendingBadge: { backgroundColor: '#f5f5f5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  pendingText: { color: '#aaa', fontSize: 10 },
  submitBtn: { backgroundColor: '#6a1b9a', borderRadius: 12, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', marginTop: 16, elevation: 3 },
  submitBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  emptyCard: { margin: 16, backgroundColor: '#fff', borderRadius: 14, padding: 32, alignItems: 'center', elevation: 1 },
  emptyText: { color: '#aaa', marginTop: 10, fontSize: 13 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1a237e' },
  absentToggle: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 10, backgroundColor: '#f5f5f5', marginBottom: 16 },
  absentToggleActive: { backgroundColor: '#ffebee' },
  absentToggleText: { fontSize: 14, color: '#666', fontWeight: '600' },
  marksRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  marksLabel: { fontSize: 12, fontWeight: '600', color: '#555', marginBottom: 6 },
  marksInput: { borderWidth: 1.5, borderColor: '#e0e0e0', borderRadius: 10, padding: 12, fontSize: 16, backgroundColor: '#fafafa' },
  totalRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, padding: 12, backgroundColor: '#f3e5f5', borderRadius: 10 },
  totalLabel: { fontSize: 14, color: '#666' },
  totalValue: { fontSize: 18, fontWeight: '800', color: '#6a1b9a' },
  saveBtnModal: { backgroundColor: '#6a1b9a', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
`;

// ============================================================
// HomeworkScreen.js
// ============================================================
const HOMEWORK = `import React, { useState, useEffect } from 'react';
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
`;

// ============================================================
// NoticeScreen.js
// ============================================================
const NOTICE = `import React, { useState, useEffect } from 'react';
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
`;

// ============================================================
// ProfileScreen.js
// ============================================================
const PROFILE = `import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Alert, ActivityIndicator,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { teacherAPI } from '../services/api';

function InfoRow({ icon, label, value }) {
  return (
    <View style={styles.infoRow}>
      <View style={styles.infoIcon}><MaterialCommunityIcons name={icon} size={18} color="#1976d2" /></View>
      <View style={{ flex: 1 }}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value || '—'}</Text>
      </View>
    </View>
  );
}

export default function ProfileScreen({ onLogout }) {
  const [user, setUser] = useState(null);
  const [teacher, setTeacher] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (userData) {
        const u = JSON.parse(userData);
        setUser(u);
        const [tRes, aRes] = await Promise.all([
          teacherAPI.getById(u.entityId).catch(() => ({ data: null })),
          teacherAPI.getMyAssignments().catch(() => ({ data: [] })),
        ]);
        setTeacher(tRes.data);
        setAssignments(aRes.data || []);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: async () => { await AsyncStorage.clear(); onLogout && onLogout(); } },
    ]);
  };

  const displayName = user ? (user.fullName || user.username || '') : '';
  const initials = displayName ? displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'T';
  const uniqueClasses = [...new Map(assignments.map(a => [a.schoolClass?.id, a.schoolClass])).values()].filter(Boolean);
  const uniqueSubjects = [...new Map(assignments.map(a => [a.subject?.id, a.subject])).values()].filter(Boolean);

  if (loading) {
    return <View style={styles.loadingBox}><ActivityIndicator size="large" color="#1976d2" /></View>;
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f0f4f8' }}>
      <StatusBar barStyle="light-content" backgroundColor="#1565c0" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.name}>{displayName}</Text>
        <Text style={styles.role}>Teacher</Text>
        {teacher?.designation && (
          <View style={styles.designationBadge}>
            <Text style={styles.designationText}>{teacher.designation}</Text>
          </View>
        )}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{uniqueClasses.length}</Text>
            <Text style={styles.statLbl}>Classes</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{uniqueSubjects.length}</Text>
            <Text style={styles.statLbl}>Subjects</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNum}>{assignments.length}</Text>
            <Text style={styles.statLbl}>Assignments</Text>
          </View>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {/* Account Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Account Information</Text>
          <InfoRow icon="account-outline" label="Username" value={user?.username} />
          <InfoRow icon="email-outline" label="Email" value={user?.email} />
          <InfoRow icon="phone-outline" label="Contact" value={user?.contact} />
          <InfoRow icon="shield-account-outline" label="Role" value="Teacher" />
        </View>

        {/* Teacher Details */}
        {teacher && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Teacher Details</Text>
            <InfoRow icon="badge-account-outline" label="Employee ID" value={teacher.employeeId} />
            <InfoRow icon="office-building-outline" label="Department" value={teacher.department} />
            <InfoRow icon="star-outline" label="Designation" value={teacher.designation} />
            <InfoRow icon="school-outline" label="Qualification" value={teacher.qualification} />
            <InfoRow icon="book-education-outline" label="Specialization" value={teacher.specialization} />
            <InfoRow icon="briefcase-outline" label="Experience" value={teacher.experience ? teacher.experience + ' years' : null} />
            <InfoRow icon="calendar-outline" label="Joining Date" value={teacher.joiningDate} />
          </View>
        )}

        {/* Assigned Classes */}
        {assignments.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>My Assigned Classes</Text>
            {uniqueClasses.map((cls, i) => {
              const classAssignments = assignments.filter(a => a.schoolClass?.id === cls.id);
              const colors = ['#1565c0', '#6a1b9a', '#ad1457', '#00838f', '#2e7d32'];
              const color = colors[i % colors.length];
              return (
                <View key={cls.id} style={[styles.classRow, { borderLeftColor: color }]}>
                  <View style={[styles.classColorDot, { backgroundColor: color }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.className, { color }]}>Class {cls.name}</Text>
                    <Text style={styles.classSubjects}>{classAssignments.map(a => a.subject?.name).filter(Boolean).join(', ')}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <MaterialCommunityIcons name="logout" size={20} color="#fff" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0f4f8' },
  header: { backgroundColor: '#1565c0', paddingTop: 44, paddingBottom: 24, paddingHorizontal: 16, alignItems: 'center', borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  avatarCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 12, borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)' },
  avatarText: { color: '#fff', fontSize: 32, fontWeight: '800' },
  name: { color: '#fff', fontSize: 22, fontWeight: '700', marginBottom: 4 },
  role: { color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  designationBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20, marginTop: 8 },
  designationText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  statsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 20, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 14, padding: 14, gap: 0 },
  statItem: { flex: 1, alignItems: 'center' },
  statNum: { color: '#fff', fontSize: 22, fontWeight: '800' },
  statLbl: { color: 'rgba(255,255,255,0.8)', fontSize: 11, marginTop: 2 },
  statDivider: { width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.3)' },
  card: { backgroundColor: '#fff', borderRadius: 16, margin: 12, marginTop: 8, padding: 16, elevation: 2 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#1a237e', marginBottom: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f5f5f5', gap: 12 },
  infoIcon: { width: 34, height: 34, borderRadius: 10, backgroundColor: '#e3f2fd', alignItems: 'center', justifyContent: 'center' },
  infoLabel: { fontSize: 11, color: '#888', marginBottom: 2 },
  infoValue: { fontSize: 14, fontWeight: '600', color: '#333' },
  classRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingLeft: 12, borderLeftWidth: 3, borderRadius: 4, marginBottom: 8, backgroundColor: '#f8f9fa', gap: 10 },
  classColorDot: { width: 8, height: 8, borderRadius: 4 },
  className: { fontSize: 14, fontWeight: '700' },
  classSubjects: { fontSize: 12, color: '#888', marginTop: 2 },
  logoutBtn: { backgroundColor: '#f44336', borderRadius: 14, marginHorizontal: 12, marginTop: 8, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, elevation: 3 },
  logoutText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
`;

// Write all files
const files = {
  'LoginScreen.js': LOGIN,
  'DashboardScreen.js': DASHBOARD,
  'AttendanceScreen.js': ATTENDANCE,
  'MarksScreen.js': MARKS,
  'HomeworkScreen.js': HOMEWORK,
  'NoticeScreen.js': NOTICE,
  'ProfileScreen.js': PROFILE,
};

let success = 0;
for (const [name, content] of Object.entries(files)) {
  try {
    fs.writeFileSync(path.join(SCREENS_DIR, name), content, 'utf8');
    console.log('✓ Written: ' + name);
    success++;
  } catch (e) {
    console.error('✗ Failed: ' + name, e.message);
  }
}
console.log('\nDone: ' + success + '/' + Object.keys(files).length + ' files written');
