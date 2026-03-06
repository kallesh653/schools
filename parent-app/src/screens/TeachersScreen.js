import React, { useState, useEffect, useRef } from 'react';
import {
  View, StyleSheet, ScrollView, RefreshControl, Animated,
  TouchableOpacity, TextInput,
} from 'react-native';
import { Text } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { parentAPI, teacherAPI } from '../services/api';
import ScreenHeader from '../components/ScreenHeader';

const SUBJECT_COLORS = [
  { bg: '#e3f2fd', border: '#1976d2', text: '#1565c0' },
  { bg: '#f3e5f5', border: '#7b1fa2', text: '#6a1b9a' },
  { bg: '#e8f5e9', border: '#388e3c', text: '#2e7d32' },
  { bg: '#fff3e0', border: '#ef6c00', text: '#e65100' },
  { bg: '#fce4ec', border: '#c2185b', text: '#ad1457' },
  { bg: '#e0f2f1', border: '#00796b', text: '#00695c' },
  { bg: '#fff8e1', border: '#f9a825', text: '#f57f17' },
  { bg: '#e8eaf6', border: '#3949ab', text: '#283593' },
];
const AVATAR_COLORS = ['#1a237e', '#4a148c', '#b71c1c', '#1b5e20', '#e65100', '#006064'];
const CARD_ACCENTS = ['#1a237e', '#4a148c', '#c62828', '#2e7d32', '#e65100', '#00838f'];

function SubjectChip({ name, code, colorSet }) {
  return (
    <View style={[styles.subjectChip, { backgroundColor: colorSet.bg, borderColor: colorSet.border }]}>
      <Text style={[styles.subjectChipText, { color: colorSet.text }]}>{name}</Text>
      {code ? (
        <View style={[styles.subjectCodeBadge, { backgroundColor: colorSet.border }]}>
          <Text style={styles.subjectCodeText}>{code}</Text>
        </View>
      ) : null}
    </View>
  );
}

function SkeletonCard() {
  const fadeAnim = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <Animated.View style={[styles.teacherCard, { opacity: fadeAnim }]}>
      <View style={[styles.cardAccentBar, { backgroundColor: '#e0e0e0' }]} />
      <View style={styles.cardBody}>
        <View style={styles.cardHeader}>
          <View style={styles.skeletonAvatar} />
          <View style={styles.teacherMeta}>
            <View style={styles.skeletonLine} />
            <View style={[styles.skeletonLine, { width: '60%', marginTop: 8 }]} />
            <View style={[styles.skeletonLine, { width: '45%', marginTop: 8 }]} />
          </View>
        </View>
        <View style={styles.cardDivider} />
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View style={[styles.skeletonChip, { width: 80 }]} />
          <View style={[styles.skeletonChip, { width: 100 }]} />
          <View style={[styles.skeletonChip, { width: 70 }]} />
        </View>
      </View>
    </Animated.View>
  );
}

// ── Class Teacher Card ────────────────────────────────────────────────────────
function ClassTeacherCard({ teacher }) {
  const initials = `${(teacher.firstName || '?')[0]}${(teacher.lastName || '?')[0]}`.toUpperCase();
  return (
    <View style={styles.ctCard}>
      {/* Gold header strip */}
      <View style={styles.ctHeader}>
        <MaterialCommunityIcons name="star-circle" size={18} color="#fff" />
        <Text style={styles.ctHeaderLabel}>CLASS TEACHER</Text>
        <View style={styles.ctHeaderSpacer} />
        <View style={styles.ctHeaderBadge}>
          <MaterialCommunityIcons name="shield-star" size={13} color="#FFB300" />
          <Text style={styles.ctHeaderBadgeText}>ASSIGNED BY ADMIN</Text>
        </View>
      </View>

      {/* Body */}
      <View style={styles.ctBody}>
        <View style={styles.ctAvatarWrap}>
          <View style={styles.ctAvatar}>
            <Text style={styles.ctAvatarText}>{initials}</Text>
          </View>
          <View style={styles.ctStarBadge}>
            <MaterialCommunityIcons name="star" size={12} color="#fff" />
          </View>
        </View>
        <View style={styles.ctInfo}>
          <Text style={styles.ctName}>{teacher.firstName} {teacher.lastName}</Text>
          {teacher.employeeId ? (
            <View style={styles.ctEmpRow}>
              <MaterialCommunityIcons name="badge-account-horizontal-outline" size={11} color="#999" />
              <Text style={styles.ctEmpId}>{teacher.employeeId}</Text>
            </View>
          ) : null}
          {teacher.designation ? (
            <View style={styles.ctDesignRow}>
              <MaterialCommunityIcons name="briefcase-outline" size={12} color="#2e7d32" />
              <Text style={styles.ctDesignation}>{teacher.designation}</Text>
            </View>
          ) : null}
          {teacher.specialization ? (
            <View style={styles.ctSpecRow}>
              <MaterialCommunityIcons name="star-circle-outline" size={12} color="#7b1fa2" />
              <Text style={styles.ctSpecText}>{teacher.specialization}</Text>
            </View>
          ) : null}
        </View>
      </View>

      {/* Contact row */}
      {(teacher.phone || teacher.email) ? (
        <View style={styles.ctContactWrap}>
          {teacher.phone ? (
            <View style={styles.ctContactItem}>
              <View style={[styles.ctContactIcon, { backgroundColor: '#e8f5e9' }]}>
                <MaterialCommunityIcons name="phone-outline" size={13} color="#2e7d32" />
              </View>
              <Text style={styles.ctContactText} numberOfLines={1}>{teacher.phone}</Text>
            </View>
          ) : null}
          {teacher.email ? (
            <View style={styles.ctContactItem}>
              <View style={[styles.ctContactIcon, { backgroundColor: '#e3f2fd' }]}>
                <MaterialCommunityIcons name="email-outline" size={13} color="#1565c0" />
              </View>
              <Text style={styles.ctContactText} numberOfLines={1}>{teacher.email}</Text>
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

// ── Teacher Card ──────────────────────────────────────────────────────────────
function TeacherCard({ teacher, index, anim, isClassTeacher }) {
  const initials = `${(teacher.firstName || '?')[0]}${(teacher.lastName || '?')[0]}`.toUpperCase();
  const avatarColor = AVATAR_COLORS[index % AVATAR_COLORS.length];
  const accentColor = CARD_ACCENTS[index % CARD_ACCENTS.length];

  return (
    <Animated.View style={[styles.teacherCard, {
      opacity: anim,
      transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) }],
    }]}>
      <View style={[styles.cardAccentBar, { backgroundColor: isClassTeacher ? '#f9a825' : accentColor }]} />
      <View style={styles.cardBody}>

        {/* CT badge top-right */}
        {isClassTeacher ? (
          <View style={styles.ctCornerBadge}>
            <MaterialCommunityIcons name="star-circle" size={12} color="#f9a825" />
            <Text style={styles.ctCornerText}>Class Teacher</Text>
          </View>
        ) : null}

        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={[styles.avatar, { backgroundColor: isClassTeacher ? '#e65100' : avatarColor }]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.teacherMeta}>
            <Text style={styles.teacherName}>{teacher.firstName} {teacher.lastName}</Text>
            {teacher.employeeId ? (
              <View style={styles.empIdRow}>
                <MaterialCommunityIcons name="badge-account-horizontal-outline" size={12} color="#999" />
                <Text style={styles.empId}>{teacher.employeeId}</Text>
              </View>
            ) : null}
            {teacher.designation ? (
              <View style={[styles.designationBadge, { borderColor: (isClassTeacher ? '#f9a825' : accentColor) + '55' }]}>
                <MaterialCommunityIcons name="briefcase-outline" size={11} color={isClassTeacher ? '#f57f17' : accentColor} />
                <Text style={[styles.designationText, { color: isClassTeacher ? '#f57f17' : accentColor }]}>{teacher.designation}</Text>
              </View>
            ) : null}
            {teacher.specialization ? (
              <View style={styles.specializationRow}>
                <MaterialCommunityIcons name="star-circle-outline" size={12} color="#7b1fa2" />
                <Text style={styles.specializationText}>{teacher.specialization}</Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.cardDivider} />

        {/* Subjects */}
        {teacher.subjects && teacher.subjects.length > 0 ? (
          <View style={styles.subjectsSection}>
            <View style={styles.sectionLabelRow}>
              <MaterialCommunityIcons name="book-open-variant" size={13} color="#1976d2" />
              <Text style={styles.sectionLabelText}>SUBJECTS TAUGHT</Text>
            </View>
            <View style={styles.chipsWrap}>
              {teacher.subjects.map((subj, i) => (
                <SubjectChip
                  key={subj.id || i}
                  name={subj.name}
                  code={subj.code}
                  colorSet={SUBJECT_COLORS[i % SUBJECT_COLORS.length]}
                />
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.noSubjectsRow}>
            <MaterialCommunityIcons name="book-off-outline" size={14} color="#bbb" />
            <Text style={styles.noSubjectsText}>No subjects assigned yet</Text>
          </View>
        )}

        {/* Contact */}
        {(teacher.email || teacher.phone || teacher.qualification) ? (
          <>
            <View style={styles.cardDivider} />
            <View style={styles.contactSection}>
              {teacher.email ? (
                <View style={styles.contactRow}>
                  <View style={[styles.contactIconBox, { backgroundColor: '#e3f2fd' }]}>
                    <MaterialCommunityIcons name="email-outline" size={14} color="#1976d2" />
                  </View>
                  <Text style={styles.contactText} numberOfLines={1}>{teacher.email}</Text>
                </View>
              ) : null}
              {teacher.phone ? (
                <View style={styles.contactRow}>
                  <View style={[styles.contactIconBox, { backgroundColor: '#e8f5e9' }]}>
                    <MaterialCommunityIcons name="phone-outline" size={14} color="#388e3c" />
                  </View>
                  <Text style={styles.contactText}>{teacher.phone}</Text>
                </View>
              ) : null}
              {teacher.qualification ? (
                <View style={styles.contactRow}>
                  <View style={[styles.contactIconBox, { backgroundColor: '#f3e5f5' }]}>
                    <MaterialCommunityIcons name="school-outline" size={14} color="#7b1fa2" />
                  </View>
                  <Text style={styles.contactText}>{teacher.qualification}</Text>
                </View>
              ) : null}
            </View>
          </>
        ) : null}

        {/* Footer */}
        {(teacher.experience || teacher.joiningDate) ? (
          <View style={styles.cardFooter}>
            {teacher.experience ? (
              <View style={styles.footerItem}>
                <MaterialCommunityIcons name="clock-outline" size={12} color="#888" />
                <Text style={styles.footerText}>{teacher.experience} exp</Text>
              </View>
            ) : null}
            {teacher.joiningDate ? (
              <View style={styles.footerItem}>
                <MaterialCommunityIcons name="calendar-check-outline" size={12} color="#888" />
                <Text style={styles.footerText}>Joined {teacher.joiningDate}</Text>
              </View>
            ) : null}
          </View>
        ) : null}
      </View>
    </Animated.View>
  );
}

// ── Main Screen ───────────────────────────────────────────────────────────────
export default function TeachersScreen({ navigation }) {
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState('');
  const [teachers, setTeachers] = useState([]);
  const [classTeacher, setClassTeacher] = useState(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const cardAnims = useRef([]).current;
  const bannerAnim = useRef(new Animated.Value(0)).current;
  const ctAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => { fetchChildren(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (selectedChild) {
      setTeachers([]);
      setClassTeacher(null);
      setError(null);
      setSearchQuery('');
      fetchTeachers();
    }
  }, [selectedChild]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchChildren = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      const user = JSON.parse(userData);
      if (!user?.entityId) return;
      const res = await parentAPI.getChildren(user.entityId);
      const kids = res.data || [];
      setChildren(kids);
      if (kids.length > 0) setSelectedChild(kids[0].id.toString());
    } catch (e) {
      console.error('Error fetching children:', e);
    }
  };

  const fetchTeachers = async () => {
    const child = children.find(c => c.id.toString() === selectedChild);
    if (!child?.schoolClass?.id) {
      setError('No class assigned to this student');
      return;
    }
    setLoading(true);
    try {
      const classId = child.schoolClass.id;
      const [res, ctRes] = await Promise.all([
        teacherAPI.getByClass(classId),
        teacherAPI.getClassTeacher(classId).catch(() => ({ data: null })),
      ]);
      const list = res.data || [];
      setTeachers(list);
      setClassTeacher(ctRes.data || null);
      setError(null);

      // Animate cards staggered
      const anims = list.map(() => new Animated.Value(0));
      cardAnims.length = 0;
      anims.forEach(a => cardAnims.push(a));
      Animated.stagger(90, anims.map(a =>
        Animated.spring(a, { toValue: 1, tension: 65, friction: 8, useNativeDriver: true })
      )).start();

      // CT card animation
      ctAnim.setValue(0);
      Animated.spring(ctAnim, { toValue: 1, tension: 80, friction: 10, useNativeDriver: true }).start();

      bannerAnim.setValue(0);
      Animated.spring(bannerAnim, { toValue: 1, tension: 80, friction: 10, useNativeDriver: true }).start();
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || 'Failed to load teacher information';
      setError(msg);
      setTeachers([]);
      setClassTeacher(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchChildren();
    if (selectedChild) await fetchTeachers();
    setRefreshing(false);
  };

  const selectedChildData = children.find(c => c.id.toString() === selectedChild);
  const className = selectedChildData?.schoolClass?.name || '';

  const filteredTeachers = teachers.filter(t => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const name = `${t.firstName} ${t.lastName}`.toLowerCase();
    const subjectNames = (t.subjects || []).map(s => s.name.toLowerCase()).join(' ');
    return name.includes(q) || subjectNames.includes(q) || (t.designation || '').toLowerCase().includes(q);
  });

  return (
    <View style={styles.container}>
      <ScreenHeader title="Teachers" navigation={navigation} onRefresh={handleRefresh} refreshing={refreshing} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#1a237e']} />}
      >
        {/* Student Picker */}
        <View style={styles.pickerCard}>
          <View style={styles.pickerLabelRow}>
            <MaterialCommunityIcons name="account-child" size={18} color="#1976d2" />
            <Text style={styles.pickerLabel}>Select Student</Text>
          </View>
          <View style={styles.pickerWrapper}>
            <Picker selectedValue={selectedChild} onValueChange={v => setSelectedChild(v)} style={styles.picker}>
              {children.map(child => (
                <Picker.Item key={child.id} label={`${child.firstName} ${child.lastName}`} value={child.id.toString()} />
              ))}
            </Picker>
          </View>
        </View>

        {/* Class Banner */}
        {!loading && className ? (
          <Animated.View style={[styles.classBannerWrap, {
            opacity: bannerAnim,
            transform: [{ scale: bannerAnim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) }],
          }]}>
            <View style={styles.classBannerGradient}>
              <View style={styles.classBannerLeft}>
                <View style={styles.classIconBox}>
                  <MaterialCommunityIcons name="google-classroom" size={28} color="#FFB300" />
                </View>
                <View>
                  <Text style={styles.classBannerTitle}>Class {className}</Text>
                  <Text style={styles.classBannerSub}>
                    {teachers.length} Teacher{teachers.length !== 1 ? 's' : ''} assigned
                    {classTeacher ? ' · CT Assigned' : ''}
                  </Text>
                </View>
              </View>
              <View style={styles.teacherBadge}>
                <Text style={styles.teacherBadgeNum}>{teachers.length}</Text>
                <Text style={styles.teacherBadgeLabel}>TEACHERS</Text>
              </View>
            </View>
          </Animated.View>
        ) : null}

        {/* Class Teacher Card */}
        {!loading && classTeacher ? (
          <Animated.View style={{
            opacity: ctAnim,
            transform: [{ scale: ctAnim.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] }) }],
          }}>
            <ClassTeacherCard teacher={classTeacher} />
          </Animated.View>
        ) : null}

        {/* Search Bar */}
        {!loading && teachers.length > 0 ? (
          <View style={styles.searchCard}>
            <MaterialCommunityIcons name="magnify" size={18} color="#999" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name, subject, or designation..."
              placeholderTextColor="#bbb"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <MaterialCommunityIcons name="close-circle" size={16} color="#bbb" />
              </TouchableOpacity>
            ) : null}
          </View>
        ) : null}

        {/* Search result label */}
        {!loading && searchQuery && filteredTeachers.length !== teachers.length ? (
          <View style={{ marginHorizontal: 12, marginBottom: 4 }}>
            <Text style={{ fontSize: 12, color: '#888', fontStyle: 'italic' }}>
              {filteredTeachers.length} result{filteredTeachers.length !== 1 ? 's' : ''} for "{searchQuery}"
            </Text>
          </View>
        ) : null}

        {/* Loading Skeletons */}
        {loading ? [0, 1, 2].map(i => <SkeletonCard key={i} />) : null}

        {/* Error */}
        {error && !loading ? (
          <View style={styles.errorCard}>
            <View style={styles.errorIconBox}>
              <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#ef5350" />
            </View>
            <Text style={styles.errorTitle}>Could Not Load Teachers</Text>
            <Text style={styles.errorMsg}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={fetchTeachers}>
              <Text style={styles.retryText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Subject Teachers list */}
        {!loading && !error && teachers.length > 0 ? (
          <View style={{ marginHorizontal: 12, marginBottom: 4, marginTop: classTeacher ? 4 : 0 }}>
            <View style={styles.sectionDividerRow}>
              <View style={styles.sectionDividerLine} />
              <Text style={styles.sectionDividerText}>SUBJECT TEACHERS</Text>
              <View style={styles.sectionDividerLine} />
            </View>
          </View>
        ) : null}

        {!loading && !error && filteredTeachers.map((teacher, idx) => (
          <TeacherCard
            key={teacher.id || idx}
            teacher={teacher}
            index={idx}
            anim={cardAnims[teachers.indexOf(teacher)] ?? new Animated.Value(1)}
            isClassTeacher={classTeacher?.id === teacher.id}
          />
        ))}

        {/* No search results */}
        {!loading && !error && teachers.length > 0 && filteredTeachers.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconBox}>
              <MaterialCommunityIcons name="magnify-close" size={40} color="#90caf9" />
            </View>
            <Text style={styles.emptyTitle}>No Results Found</Text>
            <Text style={styles.emptySub}>No teachers match "{searchQuery}"</Text>
            <TouchableOpacity style={styles.clearSearchBtn} onPress={() => setSearchQuery('')}>
              <Text style={styles.clearSearchText}>Clear Search</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Empty state */}
        {!loading && !error && teachers.length === 0 && !classTeacher && selectedChild ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconBox}>
              <MaterialCommunityIcons name="account-group-outline" size={48} color="#90caf9" />
            </View>
            <Text style={styles.emptyTitle}>No Teachers Found</Text>
            <Text style={styles.emptySub}>
              No teachers have been assigned to{className ? ` Class ${className}` : ' this class'} yet.{'\n'}
              Please contact the school administration.
            </Text>
          </View>
        ) : null}

        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8' },

  pickerCard: {
    margin: 12, marginTop: 12, backgroundColor: '#fff',
    borderRadius: 16, padding: 14, elevation: 2,
  },
  pickerLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  pickerLabel: { fontSize: 13, fontWeight: '700', color: '#333' },
  pickerWrapper: { backgroundColor: '#f8f9fa', borderRadius: 10, borderWidth: 1, borderColor: '#e0e0e0' },
  picker: { backgroundColor: 'transparent' },

  classBannerWrap: {
    marginHorizontal: 12, marginBottom: 12, borderRadius: 18, overflow: 'hidden',
    elevation: 5, shadowColor: '#1a237e', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10,
  },
  classBannerGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 18, backgroundColor: '#1a237e' },
  classBannerLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  classIconBox: { width: 52, height: 52, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  classBannerTitle: { color: '#fff', fontSize: 19, fontWeight: '800' },
  classBannerSub: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2 },
  teacherBadge: { backgroundColor: '#FFB300', width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
  teacherBadgeNum: { fontSize: 24, fontWeight: '900', color: '#1a237e' },
  teacherBadgeLabel: { fontSize: 8, fontWeight: '800', color: '#1a237e', letterSpacing: 0.5 },

  // ── Class Teacher Card ──
  ctCard: {
    marginHorizontal: 12, marginBottom: 12, backgroundColor: '#fff',
    borderRadius: 18, elevation: 5,
    shadowColor: '#f9a825', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 10,
    overflow: 'hidden', borderWidth: 1.5, borderColor: '#FFE082',
  },
  ctHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#f9a825', paddingHorizontal: 16, paddingVertical: 10,
  },
  ctHeaderLabel: { fontSize: 12, fontWeight: '900', color: '#fff', letterSpacing: 1.5 },
  ctHeaderSpacer: { flex: 1 },
  ctHeaderBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.25)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  ctHeaderBadgeText: { fontSize: 9, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },

  ctBody: { flexDirection: 'row', alignItems: 'flex-start', padding: 16, gap: 14 },
  ctAvatarWrap: { position: 'relative' },
  ctAvatar: { width: 72, height: 72, borderRadius: 22, backgroundColor: '#e65100', alignItems: 'center', justifyContent: 'center' },
  ctAvatarText: { color: '#fff', fontSize: 26, fontWeight: '900', letterSpacing: 1 },
  ctStarBadge: { position: 'absolute', bottom: -4, right: -4, width: 22, height: 22, borderRadius: 11, backgroundColor: '#f9a825', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },

  ctInfo: { flex: 1, paddingTop: 4 },
  ctName: { fontSize: 18, fontWeight: '800', color: '#1a237e', marginBottom: 5 },
  ctEmpRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  ctEmpId: { fontSize: 11, color: '#aaa', fontWeight: '600' },
  ctDesignRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 3 },
  ctDesignation: { fontSize: 12, color: '#2e7d32', fontWeight: '700' },
  ctSpecRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  ctSpecText: { fontSize: 12, color: '#7b1fa2', fontWeight: '600' },

  ctContactWrap: { flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 14, gap: 12, flexWrap: 'wrap' },
  ctContactItem: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1, minWidth: 140 },
  ctContactIcon: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  ctContactText: { fontSize: 13, color: '#444', fontWeight: '600', flex: 1 },

  // ── Section Divider ──
  sectionDividerRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 8 },
  sectionDividerLine: { flex: 1, height: 1, backgroundColor: '#e0e0e0' },
  sectionDividerText: { fontSize: 10, fontWeight: '800', color: '#999', letterSpacing: 1 },

  searchCard: {
    marginHorizontal: 12, marginBottom: 8, backgroundColor: '#fff', borderRadius: 14,
    paddingHorizontal: 14, paddingVertical: 2, flexDirection: 'row', alignItems: 'center', gap: 8, elevation: 2,
  },
  searchInput: { flex: 1, fontSize: 14, color: '#333', paddingVertical: 11 },

  // ── Teacher Card ──
  teacherCard: {
    marginHorizontal: 12, marginBottom: 12, backgroundColor: '#fff', borderRadius: 18,
    flexDirection: 'row', elevation: 3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.09, shadowRadius: 8,
    overflow: 'hidden',
  },
  cardAccentBar: { width: 5 },
  cardBody: { flex: 1, padding: 16 },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },

  ctCornerBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-end', marginBottom: 8, backgroundColor: '#fff8e1', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, borderWidth: 1, borderColor: '#FFE082' },
  ctCornerText: { fontSize: 10, fontWeight: '700', color: '#f57f17' },

  avatar: { width: 64, height: 64, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 22, fontWeight: '900', letterSpacing: 1 },
  teacherMeta: { flex: 1, paddingTop: 2 },
  teacherName: { fontSize: 17, fontWeight: '800', color: '#1a237e', marginBottom: 4, lineHeight: 22 },
  empIdRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 5 },
  empId: { fontSize: 11, color: '#aaa', fontWeight: '600' },
  designationBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3, marginBottom: 4 },
  designationText: { fontSize: 11, fontWeight: '700' },
  specializationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  specializationText: { fontSize: 12, color: '#7b1fa2', fontWeight: '600' },

  cardDivider: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 12 },

  subjectsSection: { marginBottom: 2 },
  sectionLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  sectionLabelText: { fontSize: 11, fontWeight: '800', color: '#1976d2', letterSpacing: 0.8 },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  subjectChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, borderWidth: 1 },
  subjectChipText: { fontSize: 12, fontWeight: '700' },
  subjectCodeBadge: { borderRadius: 5, paddingHorizontal: 5, paddingVertical: 1 },
  subjectCodeText: { fontSize: 9, fontWeight: '800', color: '#fff' },
  noSubjectsRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 4 },
  noSubjectsText: { fontSize: 12, color: '#bbb', fontStyle: 'italic' },

  contactSection: { gap: 7 },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  contactIconBox: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  contactText: { fontSize: 13, color: '#555', flex: 1 },

  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopColor: '#f5f5f5' },
  footerItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  footerText: { fontSize: 11, color: '#888' },

  skeletonAvatar: { width: 64, height: 64, borderRadius: 20, backgroundColor: '#e8e8e8' },
  skeletonLine: { height: 12, backgroundColor: '#e8e8e8', borderRadius: 6, width: '80%' },
  skeletonChip: { height: 28, backgroundColor: '#e8e8e8', borderRadius: 10 },

  errorCard: { margin: 12, backgroundColor: '#fff', borderRadius: 18, padding: 32, alignItems: 'center', elevation: 2 },
  errorIconBox: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#ffebee', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  errorTitle: { fontSize: 16, fontWeight: '700', color: '#c62828', marginBottom: 6 },
  errorMsg: { fontSize: 13, color: '#888', textAlign: 'center', lineHeight: 20, marginBottom: 16 },
  retryBtn: { backgroundColor: '#1a237e', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 12 },
  retryText: { color: '#fff', fontSize: 14, fontWeight: '700' },

  emptyState: { margin: 24, alignItems: 'center', gap: 10 },
  emptyIconBox: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#e3f2fd', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: '#333' },
  emptySub: { fontSize: 13, color: '#888', textAlign: 'center', lineHeight: 22 },
  clearSearchBtn: { marginTop: 6, backgroundColor: '#e3f2fd', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 12 },
  clearSearchText: { color: '#1976d2', fontSize: 13, fontWeight: '700' },
});
