import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View, ScrollView, StyleSheet, TouchableOpacity, Text,
  StatusBar, RefreshControl, Dimensions, Animated,
} from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { parentAPI, noticeAPI, feeAPI } from '../services/api';
import { loadBadges, shouldShowBadge, SECTIONS } from '../utils/notifications';

const { width } = Dimensions.get('window');

const QUICK_ITEMS = [
  { label: 'Attendance', icon: 'calendar-check', screen: 'Attendance', color: '#2e7d32', light: '#e8f5e9', section: SECTIONS.ATTENDANCE },
  { label: 'Marks', icon: 'clipboard-text', screen: 'Marks', color: '#6a1b9a', light: '#f3e5f5', section: SECTIONS.MARKS },
  { label: 'Fees', icon: 'cash-multiple', screen: 'Fees', color: '#e65100', light: '#fff3e0', section: SECTIONS.FEES },
  { label: 'Homework', icon: 'book-open-page-variant', screen: 'Homework', color: '#c62828', light: '#ffebee', section: SECTIONS.HOMEWORK },
  { label: 'Teachers', icon: 'account-tie', screen: 'Teachers', color: '#00695c', light: '#e0f2f1', section: null },
  { label: 'Notices', icon: 'bell-badge', screen: 'Notices', color: '#00838f', light: '#e0f7fa', section: SECTIONS.NOTICES },
  { label: 'Profile', icon: 'account-circle', screen: 'Profile', color: '#37474f', light: '#eceff1', section: null },
];

const STATS = [
  { key: 'children', icon: 'account-group', color: '#1976d2', bg: '#1a237e', label: 'Children' },
  { key: 'attendance', icon: 'calendar-check', color: '#43a047', bg: '#2e7d32', label: 'Attend %' },
  { key: 'fees', icon: 'cash-remove', color: '#ef6c00', bg: '#e65100', label: 'Fees Due' },
  { key: 'notices', icon: 'bell', color: '#0097a7', bg: '#006064', label: 'Notices' },
];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return { text: 'Good Morning', icon: 'weather-sunny' };
  if (h < 17) return { text: 'Good Afternoon', icon: 'weather-partly-cloudy' };
  return { text: 'Good Evening', icon: 'weather-night' };
}

function NotificationDot({ visible, pulseAnim }) {
  if (!visible) return null;
  return (
    <Animated.View style={[dotStyles.dot, { transform: [{ scale: pulseAnim }] }]}>
      <View style={dotStyles.inner} />
    </Animated.View>
  );
}

export default function DashboardScreen({ navigation, openDrawer }) {
  const [user, setUser] = useState(null);
  const [children, setChildren] = useState([]);
  const [notices, setNotices] = useState([]);
  const [badges, setBadges] = useState({});
  const [statsData, setStatsData] = useState({ children: '--', attendance: '--', fees: '--', notices: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ─── Animation refs ───────────────────────────────────────────────────────
  const headerY = useRef(new Animated.Value(-80)).current;
  const headerOpacity = useRef(new Animated.Value(0)).current;
  const statsY = useRef(new Animated.Value(40)).current;
  const statsOpacity = useRef(new Animated.Value(0)).current;
  const childrenOpacity = useRef(new Animated.Value(0)).current;
  const childrenY = useRef(new Animated.Value(30)).current;
  const gridOpacity = useRef(new Animated.Value(0)).current;
  const gridY = useRef(new Animated.Value(40)).current;
  const noticesOpacity = useRef(new Animated.Value(0)).current;

  const cardAnims = useMemo(() =>
    Array.from({ length: 7 }, () => ({
      scale: new Animated.Value(0.7),
      opacity: new Animated.Value(0),
    })), []);

  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Pulse animation for notification dots
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.35, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  const runEntryAnimations = useCallback(() => {
    Animated.sequence([
      // 1. Header slides down
      Animated.parallel([
        Animated.spring(headerY, { toValue: 0, tension: 80, friction: 10, useNativeDriver: true }),
        Animated.timing(headerOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
      // 2. Stats cards pop up
      Animated.parallel([
        Animated.spring(statsY, { toValue: 0, tension: 100, friction: 9, useNativeDriver: true }),
        Animated.timing(statsOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]),
      // 3. Children cards fade in
      Animated.parallel([
        Animated.spring(childrenY, { toValue: 0, tension: 80, friction: 8, useNativeDriver: true }),
        Animated.timing(childrenOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]),
      // 4. Quick grid items stagger in
      Animated.stagger(55, cardAnims.map(a =>
        Animated.parallel([
          Animated.spring(a.scale, { toValue: 1, tension: 110, friction: 8, useNativeDriver: true }),
          Animated.timing(a.opacity, { toValue: 1, duration: 220, useNativeDriver: true }),
        ])
      )),
      // 5. Notices fade in
      Animated.timing(noticesOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      if (!userData) return;

      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);

      const [childrenRes, noticesRes, badgeData] = await Promise.all([
        parsedUser.entityId
          ? parentAPI.getChildren(parsedUser.entityId).catch(() => ({ data: [] }))
          : Promise.resolve({ data: [] }),
        noticeAPI.getPublished().catch(() => noticeAPI.getAll().catch(() => ({ data: [] }))),
        loadBadges(),
      ]);

      const allChildren = childrenRes.data || [];
      const allNotices = (noticesRes.data || []).filter(
        n => n.targetAudience === 'ALL' || n.targetAudience === 'PARENTS'
      );

      setChildren(allChildren);
      setNotices(allNotices.slice(0, 5));
      setBadges(badgeData);

      // Compute stats
      const latestNotice = allNotices[0];
      setStatsData({
        children: allChildren.length,
        attendance: '--',
        fees: allChildren.length > 0 ? '₹--' : '--',
        notices: allNotices.length,
      });

    } catch (e) {
      console.error('Dashboard load error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
      runEntryAnimations();
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    // Reset animations for refresh
    headerY.setValue(-80);
    headerOpacity.setValue(0);
    statsY.setValue(40);
    statsOpacity.setValue(0);
    childrenOpacity.setValue(0);
    childrenY.setValue(30);
    gridOpacity.setValue(0);
    gridY.setValue(40);
    noticesOpacity.setValue(0);
    cardAnims.forEach(a => { a.scale.setValue(0.7); a.opacity.setValue(0); });
    loadData();
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#1a237e" />
        <ActivityIndicator size="large" color="#FFB300" />
        <Text style={styles.loadingText}>Loading your dashboard...</Text>
      </View>
    );
  }

  const greeting = getGreeting();
  const displayName = user?.fullName || user?.username || '';
  const firstName = displayName.split(' ')[0];

  // Check which sections have notifications
  const sectionBadges = {};
  for (const item of QUICK_ITEMS) {
    if (item.section) {
      const latestDate = item.section === SECTIONS.NOTICES
        ? notices[0]?.publishDate : null;
      sectionBadges[item.section] = shouldShowBadge(badges, item.section, latestDate);
    }
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a237e" translucent={false} />

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#FFB300', '#1976d2']}
            tintColor="#FFB300"
            progressBackgroundColor="#1a237e"
          />
        }
      >
        {/* ─── HEADER ─────────────────────────────────────────────────────── */}
        <Animated.View style={[styles.header, {
          opacity: headerOpacity,
          transform: [{ translateY: headerY }],
        }]}>
          {/* Background decorations */}
          <View style={styles.headerCircle1} />
          <View style={styles.headerCircle2} />

          {/* Top bar */}
          <View style={styles.headerTopBar}>
            <TouchableOpacity style={styles.menuBtn} onPress={openDrawer} activeOpacity={0.7}>
              <View style={styles.menuBtnInner}>
                <View style={styles.menuLine} />
                <View style={[styles.menuLine, { width: 16 }]} />
                <View style={[styles.menuLine, { width: 12 }]} />
              </View>
            </TouchableOpacity>

            {/* School Logo */}
            <View style={styles.logoRow}>
              <View style={styles.logoMini}>
                <MaterialCommunityIcons name="school" size={22} color="#FFB300" />
              </View>
              <View>
                <Text style={styles.schoolName}>EduConnect</Text>
                <Text style={styles.schoolTagline}>PARENT PORTAL</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.avatarBtn}
              onPress={() => navigation.navigate('Profile')}
            >
              <View style={styles.headerAvatar}>
                <Text style={styles.headerAvatarText}>
                  {displayName ? displayName[0].toUpperCase() : 'P'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Greeting */}
          <View style={styles.greetingRow}>
            <MaterialCommunityIcons name={greeting.icon} size={18} color="rgba(255,179,0,0.8)" />
            <Text style={styles.greetingText}>{greeting.text},</Text>
          </View>
          <Text style={styles.userNameText}>{firstName || 'Parent'} 👋</Text>
          <Text style={styles.dateText}>
            {new Date().toLocaleDateString('en-IN', {
              weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
            })}
          </Text>
        </Animated.View>

        {/* ─── STATS ROW ───────────────────────────────────────────────────── */}
        <Animated.View style={[styles.statsWrapper, {
          opacity: statsOpacity,
          transform: [{ translateY: statsY }],
        }]}>
          {STATS.map((stat, i) => {
            const value = statsData[stat.key];
            return (
              <View key={stat.key} style={[styles.statCard, { backgroundColor: stat.bg }]}>
                <View style={[styles.statIconWrap, { backgroundColor: 'rgba(255,255,255,0.15)' }]}>
                  <MaterialCommunityIcons name={stat.icon} size={18} color="#fff" />
                </View>
                <Text style={styles.statValue}>{value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            );
          })}
        </Animated.View>

        {/* ─── MY CHILDREN ────────────────────────────────────────────────── */}
        <Animated.View style={[styles.section, {
          opacity: childrenOpacity,
          transform: [{ translateY: childrenY }],
        }]}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <View style={styles.sectionAccent} />
              <Text style={styles.sectionTitle}>My Children</Text>
            </View>
          </View>

          {children.length > 0 ? children.map((child, idx) => (
            <ChildCard key={child.id} child={child} index={idx} navigation={navigation} />
          )) : (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIconWrap}>
                <MaterialCommunityIcons name="account-child-outline" size={36} color="#90caf9" />
              </View>
              <Text style={styles.emptyTitle}>No Children Linked</Text>
              <Text style={styles.emptySubtitle}>Contact school admin to link your children</Text>
            </View>
          )}
        </Animated.View>

        {/* ─── QUICK ACCESS GRID ───────────────────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.sectionAccent} />
            <Text style={styles.sectionTitle}>Quick Access</Text>
          </View>
          <View style={styles.quickGrid}>
            {QUICK_ITEMS.map((item, i) => {
              const hasBadge = item.section ? sectionBadges[item.section] : false;
              return (
                <Animated.View key={item.label} style={{
                  opacity: cardAnims[i].opacity,
                  transform: [{ scale: cardAnims[i].scale }],
                  width: (width - 24 - 12 * 2) / 3,
                }}>
                  <TouchableOpacity
                    style={[styles.quickCard]}
                    onPress={() => navigation.navigate(item.screen)}
                    activeOpacity={0.8}
                  >
                    <View style={[styles.quickIconBg, { backgroundColor: item.color }]}>
                      <MaterialCommunityIcons name={item.icon} size={26} color="#fff" />
                      <NotificationDot visible={hasBadge} pulseAnim={pulseAnim} />
                    </View>
                    <Text style={[styles.quickLabel, { color: item.color }]}>{item.label}</Text>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>
        </View>

        {/* ─── RECENT NOTICES ─────────────────────────────────────────────── */}
        {notices.length > 0 && (
          <Animated.View style={[styles.section, { opacity: noticesOpacity, marginBottom: 32 }]}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <View style={styles.sectionAccent} />
                <Text style={styles.sectionTitle}>Recent Notices</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('Notices')}>
                <View style={styles.seeAllBtn}>
                  <Text style={styles.seeAllText}>See All</Text>
                  <MaterialCommunityIcons name="arrow-right" size={14} color="#1976d2" />
                </View>
              </TouchableOpacity>
            </View>

            {notices.slice(0, 3).map((notice, i) => (
              <NoticeCard key={notice.id || i} notice={notice} />
            ))}
          </Animated.View>
        )}

        <View style={{ height: 16 }} />
      </ScrollView>
    </View>
  );
}

// ─── Child Card Component ────────────────────────────────────────────────────
function ChildCard({ child, index }) {
  const translateX = useRef(new Animated.Value(index % 2 === 0 ? -50 : 50)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(translateX, {
        toValue: 0, delay: index * 120, tension: 80, friction: 9, useNativeDriver: true
      }),
      Animated.timing(opacity, {
        toValue: 1, delay: index * 120, duration: 350, useNativeDriver: true
      }),
    ]).start();
  }, []);

  const avatarColors = ['#1976d2', '#388e3c', '#7b1fa2', '#c62828'];
  const avatarColor = avatarColors[index % avatarColors.length];

  return (
    <Animated.View style={[styles.childCard, { opacity, transform: [{ translateX }] }]}>
      <View style={[styles.childAvatar, { backgroundColor: avatarColor }]}>
        <Text style={styles.childAvatarText}>{(child.firstName || '?')[0].toUpperCase()}</Text>
      </View>
      <View style={styles.childInfo}>
        <Text style={styles.childName}>{child.firstName} {child.lastName}</Text>
        <View style={styles.childMetaRow}>
          {child.schoolClass?.name && (
            <View style={styles.childTag}>
              <MaterialCommunityIcons name="google-classroom" size={11} color="#1976d2" />
              <Text style={styles.childTagText}>Class {child.schoolClass.name}</Text>
            </View>
          )}
          {child.section?.name && (
            <View style={styles.childTag}>
              <MaterialCommunityIcons name="alphabetical" size={11} color="#8e24aa" />
              <Text style={[styles.childTagText, { color: '#8e24aa' }]}>Section {child.section.name}</Text>
            </View>
          )}
        </View>
        {child.admissionNo && (
          <Text style={styles.childAdmission}>
            <MaterialCommunityIcons name="identifier" size={11} color="#9e9e9e" /> {child.admissionNo}
          </Text>
        )}
      </View>
      <View style={[styles.childStatusDot, { backgroundColor: '#4CAF50' }]} />
    </Animated.View>
  );
}

// ─── Notice Card Component ───────────────────────────────────────────────────
const TYPE_COLORS = {
  ACADEMIC: { bg: '#e3f2fd', text: '#1565c0', icon: 'book-education' },
  EXAM: { bg: '#fff3e0', text: '#e65100', icon: 'pencil-box' },
  EVENT: { bg: '#f3e5f5', text: '#6a1b9a', icon: 'calendar-star' },
  HOLIDAY: { bg: '#e8f5e9', text: '#2e7d32', icon: 'beach' },
  FEE: { bg: '#fce4ec', text: '#ad1457', icon: 'cash' },
};

function NoticeCard({ notice }) {
  const typeInfo = TYPE_COLORS[notice.type] || { bg: '#f5f5f5', text: '#555', icon: 'information' };
  return (
    <View style={[noticeStyles.card, { borderLeftColor: typeInfo.text }]}>
      <View style={[noticeStyles.typeIcon, { backgroundColor: typeInfo.bg }]}>
        <MaterialCommunityIcons name={typeInfo.icon} size={18} color={typeInfo.text} />
      </View>
      <View style={noticeStyles.content}>
        <Text style={noticeStyles.title} numberOfLines={1}>{notice.title}</Text>
        <Text style={noticeStyles.meta}>
          {notice.type && <Text style={[noticeStyles.type, { color: typeInfo.text }]}>{notice.type} · </Text>}
          {notice.publishDate || ''}
        </Text>
      </View>
      {notice.priority === 'URGENT' && (
        <View style={noticeStyles.urgentBadge}>
          <Text style={noticeStyles.urgentText}>URGENT</Text>
        </View>
      )}
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1a237e' },
  loadingText: { marginTop: 16, color: 'rgba(255,255,255,0.7)', fontSize: 14 },

  // Header
  header: {
    backgroundColor: '#1a237e',
    paddingTop: 46,
    paddingBottom: 28,
    paddingHorizontal: 18,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#1a237e',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
  },
  headerCircle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.04)',
    top: -60,
    right: -30,
  },
  headerCircle2: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,179,0,0.06)',
    bottom: -40,
    left: 60,
  },
  headerTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  menuBtn: { padding: 6, marginRight: 12 },
  menuBtnInner: { gap: 4, width: 24 },
  menuLine: { height: 2.5, width: 24, backgroundColor: '#fff', borderRadius: 2 },
  logoRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoMini: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: 'rgba(255,179,0,0.15)',
    borderWidth: 1.5, borderColor: 'rgba(255,179,0,0.4)',
    alignItems: 'center', justifyContent: 'center',
  },
  schoolName: { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },
  schoolTagline: { color: '#FFB300', fontSize: 8, fontWeight: '700', letterSpacing: 2 },
  avatarBtn: { padding: 4 },
  headerAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 2, borderColor: 'rgba(255,179,0,0.6)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerAvatarText: { color: '#fff', fontSize: 17, fontWeight: '800' },
  greetingRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  greetingText: { color: 'rgba(255,255,255,0.75)', fontSize: 13, fontWeight: '500' },
  userNameText: { color: '#fff', fontSize: 24, fontWeight: '800', marginBottom: 6 },
  dateText: { color: 'rgba(255,179,0,0.8)', fontSize: 12, fontWeight: '500' },

  // Stats
  statsWrapper: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingTop: 16,
    gap: 8,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    gap: 4,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  statIconWrap: {
    width: 32, height: 32, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 2,
  },
  statValue: { color: '#fff', fontSize: 17, fontWeight: '800' },
  statLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 9.5, fontWeight: '600', textAlign: 'center' },

  // Section
  section: { marginHorizontal: 12, marginTop: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  sectionAccent: { width: 4, height: 18, backgroundColor: '#FFB300', borderRadius: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#1a237e' },
  seeAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  seeAllText: { fontSize: 13, color: '#1976d2', fontWeight: '600' },

  // Child Card
  childCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 3,
    shadowColor: '#1a237e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  childAvatar: {
    width: 50, height: 50, borderRadius: 25,
    alignItems: 'center', justifyContent: 'center',
    marginRight: 14,
    elevation: 2,
  },
  childAvatarText: { color: '#fff', fontSize: 22, fontWeight: '800' },
  childInfo: { flex: 1 },
  childName: { fontSize: 15, fontWeight: '700', color: '#1a237e', marginBottom: 5 },
  childMetaRow: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: 4 },
  childTag: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    backgroundColor: '#e8f0fe', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
  },
  childTagText: { fontSize: 11, fontWeight: '600', color: '#1976d2' },
  childAdmission: { fontSize: 11, color: '#9e9e9e', marginTop: 1 },
  childStatusDot: {
    width: 10, height: 10, borderRadius: 5,
    marginLeft: 8,
  },

  // Quick Grid
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  quickCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
  },
  quickIconBg: {
    width: 52, height: 52, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  quickLabel: { fontSize: 11.5, fontWeight: '700', textAlign: 'center' },

  // Empty state
  emptyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    elevation: 2,
  },
  emptyIconWrap: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#e3f2fd',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: '#333', marginBottom: 4 },
  emptySubtitle: { fontSize: 12, color: '#aaa', textAlign: 'center' },
});

const noticeStyles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 3,
    gap: 12,
  },
  typeIcon: {
    width: 38, height: 38, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center',
  },
  content: { flex: 1 },
  title: { fontSize: 13.5, fontWeight: '700', color: '#222', marginBottom: 3 },
  meta: { fontSize: 11, color: '#aaa' },
  type: { fontWeight: '700', fontSize: 11 },
  urgentBadge: {
    backgroundColor: '#ffebee', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6,
  },
  urgentText: { fontSize: 9, color: '#c62828', fontWeight: '800', letterSpacing: 0.5 },
});

const dotStyles = StyleSheet.create({
  dot: {
    position: 'absolute',
    top: -4, right: -4,
    width: 16, height: 16, borderRadius: 8,
    backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    elevation: 4,
  },
  inner: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: '#4CAF50',
  },
});
