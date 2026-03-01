import React, { useState, useEffect, useRef } from 'react';
import {
  View, StyleSheet, ScrollView, RefreshControl, Animated,
  TouchableOpacity,
} from 'react-native';
import { Text } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { parentAPI, teacherAPI } from '../services/api';
import ScreenHeader from '../components/ScreenHeader';

const SUBJECT_COLORS = [
  '#1976d2', '#7b1fa2', '#e65100', '#00838f',
  '#2e7d32', '#ad1457', '#f57f17', '#546e7a',
  '#c62828', '#1565c0', '#4a148c', '#006064',
];

function SubjectChip({ name, code, index }) {
  const color = SUBJECT_COLORS[index % SUBJECT_COLORS.length];
  return (
    <View style={[styles.chip, { backgroundColor: color + '18', borderColor: color + '44' }]}>
      <Text style={[styles.chipText, { color }]}>{name}</Text>
      {code ? <Text style={[styles.chipCode, { color: color + 'cc' }]}>{code}</Text> : null}
    </View>
  );
}

function TeacherCard({ teacher, index, anim }) {
  const initials = `${(teacher.firstName || '?')[0]}${(teacher.lastName || '?')[0]}`.toUpperCase();
  const avatarColors = ['#1a237e', '#7b1fa2', '#00838f', '#c62828', '#2e7d32', '#e65100'];
  const avatarBg = avatarColors[index % avatarColors.length];

  return (
    <Animated.View style={[styles.teacherCard, {
      opacity: anim,
      transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [30, 0] }) }],
    }]}>
      {/* Card header */}
      <View style={styles.cardHeader}>
        <View style={[styles.avatar, { backgroundColor: avatarBg }]}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={styles.teacherInfo}>
          <Text style={styles.teacherName}>{teacher.firstName} {teacher.lastName}</Text>
          {teacher.designation ? (
            <View style={styles.designationRow}>
              <MaterialCommunityIcons name="briefcase-outline" size={12} color="#666" />
              <Text style={styles.designation}>{teacher.designation}</Text>
            </View>
          ) : null}
          {teacher.specialization ? (
            <View style={styles.specializationRow}>
              <MaterialCommunityIcons name="star-circle-outline" size={12} color="#7b1fa2" />
              <Text style={styles.specialization}>{teacher.specialization}</Text>
            </View>
          ) : null}
        </View>
      </View>

      {/* Divider */}
      <View style={styles.cardDivider} />

      {/* Subjects taught */}
      {teacher.subjects && teacher.subjects.length > 0 && (
        <View style={styles.subjectsSection}>
          <View style={styles.sectionLabelRow}>
            <MaterialCommunityIcons name="book-open-variant" size={14} color="#1976d2" />
            <Text style={styles.sectionLabel}>Subjects Taught</Text>
          </View>
          <View style={styles.chipsRow}>
            {teacher.subjects.map((subj, i) => (
              <SubjectChip key={subj.id || i} name={subj.name} code={subj.code} index={i} />
            ))}
          </View>
        </View>
      )}

      {/* Contact info */}
      <View style={styles.contactSection}>
        {teacher.email ? (
          <View style={styles.contactRow}>
            <View style={styles.contactIcon}>
              <MaterialCommunityIcons name="email-outline" size={15} color="#1976d2" />
            </View>
            <Text style={styles.contactText}>{teacher.email}</Text>
          </View>
        ) : null}
        {teacher.phone ? (
          <View style={styles.contactRow}>
            <View style={styles.contactIcon}>
              <MaterialCommunityIcons name="phone-outline" size={15} color="#2e7d32" />
            </View>
            <Text style={styles.contactText}>{teacher.phone}</Text>
          </View>
        ) : null}
        {teacher.qualification ? (
          <View style={styles.contactRow}>
            <View style={styles.contactIcon}>
              <MaterialCommunityIcons name="school-outline" size={15} color="#7b1fa2" />
            </View>
            <Text style={styles.contactText}>{teacher.qualification}</Text>
          </View>
        ) : null}
      </View>
    </Animated.View>
  );
}

export default function TeachersScreen({ navigation }) {
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState('');
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const cardAnims = useRef([]).current;
  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchChildren();
  }, []);

  useEffect(() => {
    if (selectedChild) {
      setTeachers([]);
      setError(null);
      fetchTeachers();
    }
  }, [selectedChild]);

  const fetchChildren = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      const user = JSON.parse(userData);
      if (!user?.entityId) return;
      const res = await parentAPI.getChildren(user.entityId);
      setChildren(res.data || []);
      if (res.data?.length > 0) setSelectedChild(res.data[0].id.toString());
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
      const res = await teacherAPI.getByClass(child.schoolClass.id);
      const teacherList = res.data || [];
      setTeachers(teacherList);
      setError(null);

      // Animate cards in staggered
      const anims = teacherList.map(() => new Animated.Value(0));
      cardAnims.length = 0;
      anims.forEach(a => cardAnims.push(a));

      Animated.stagger(80, anims.map(a =>
        Animated.spring(a, { toValue: 1, tension: 70, friction: 9, useNativeDriver: true })
      )).start();

      // Header animation
      Animated.spring(headerAnim, { toValue: 1, tension: 80, friction: 10, useNativeDriver: true }).start();
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || 'Failed to load teacher information';
      setError(msg);
      setTeachers([]);
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

  return (
    <View style={styles.container}>
      <ScreenHeader title="Teachers" navigation={navigation} onRefresh={handleRefresh} refreshing={refreshing} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#1a237e']} />}
      >
        {/* Child selector */}
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

        {/* Class info banner */}
        {!loading && className ? (
          <Animated.View style={[styles.classBanner, {
            opacity: headerAnim,
            transform: [{ scale: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) }],
          }]}>
            <View style={styles.classBannerLeft}>
              <MaterialCommunityIcons name="google-classroom" size={32} color="#FFB300" />
              <View>
                <Text style={styles.classBannerTitle}>Class {className}</Text>
                <Text style={styles.classBannerSub}>
                  {teachers.length} Teacher{teachers.length !== 1 ? 's' : ''} assigned
                </Text>
              </View>
            </View>
            <View style={styles.teacherCountBadge}>
              <Text style={styles.teacherCountNum}>{teachers.length}</Text>
              <Text style={styles.teacherCountLabel}>Teachers</Text>
            </View>
          </Animated.View>
        ) : null}

        {/* Loading */}
        {loading && (
          <View style={styles.loadingCard}>
            <MaterialCommunityIcons name="loading" size={28} color="#1976d2" />
            <Text style={styles.loadingText}>Loading teacher information...</Text>
          </View>
        )}

        {/* Error */}
        {error && !loading && (
          <View style={styles.errorCard}>
            <MaterialCommunityIcons name="alert-circle-outline" size={40} color="#ef5350" />
            <Text style={styles.errorTitle}>Could Not Load Teachers</Text>
            <Text style={styles.errorMsg}>{error}</Text>
          </View>
        )}

        {/* Teachers list */}
        {!loading && !error && teachers.length > 0 && teachers.map((teacher, index) => (
          <TeacherCard
            key={teacher.id || index}
            teacher={teacher}
            index={index}
            anim={cardAnims[index] || new Animated.Value(1)}
          />
        ))}

        {/* Empty state */}
        {!loading && !error && teachers.length === 0 && selectedChild && (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <MaterialCommunityIcons name="account-group-outline" size={48} color="#90caf9" />
            </View>
            <Text style={styles.emptyTitle}>No Teachers Found</Text>
            <Text style={styles.emptySub}>
              No teachers have been assigned to{className ? ` Class ${className}` : ' this class'} yet.{'\n'}
              Please contact the school administration.
            </Text>
          </View>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8' },

  pickerCard: {
    margin: 12, marginTop: 12, backgroundColor: '#fff',
    borderRadius: 16, padding: 14, elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4,
  },
  pickerLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  pickerLabel: { fontSize: 13, fontWeight: '700', color: '#333' },
  pickerWrapper: { backgroundColor: '#f8f9fa', borderRadius: 10, borderWidth: 1, borderColor: '#e0e0e0' },
  picker: { backgroundColor: 'transparent' },

  classBanner: {
    margin: 12, marginTop: 0, backgroundColor: '#1a237e',
    borderRadius: 16, padding: 16, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'space-between',
    elevation: 4, shadowColor: '#1a237e', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8,
  },
  classBannerLeft: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  classBannerTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  classBannerSub: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2 },
  teacherCountBadge: {
    backgroundColor: '#FFB300', width: 60, height: 60, borderRadius: 30,
    alignItems: 'center', justifyContent: 'center',
  },
  teacherCountNum: { fontSize: 22, fontWeight: '900', color: '#1a237e' },
  teacherCountLabel: { fontSize: 9, fontWeight: '700', color: '#1a237e', textTransform: 'uppercase' },

  loadingCard: {
    margin: 12, backgroundColor: '#fff', borderRadius: 16, padding: 32,
    alignItems: 'center', gap: 12, elevation: 2,
  },
  loadingText: { color: '#888', fontSize: 14 },

  errorCard: {
    margin: 12, backgroundColor: '#fff', borderRadius: 16, padding: 32,
    alignItems: 'center', gap: 8, elevation: 2,
  },
  errorTitle: { fontSize: 16, fontWeight: '700', color: '#c62828' },
  errorMsg: { fontSize: 13, color: '#888', textAlign: 'center', lineHeight: 20 },

  teacherCard: {
    margin: 12, marginTop: 0, backgroundColor: '#fff', borderRadius: 18,
    padding: 16, elevation: 3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1, shadowRadius: 6,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  avatar: {
    width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 20, fontWeight: '900' },
  teacherInfo: { flex: 1 },
  teacherName: { fontSize: 17, fontWeight: '800', color: '#1a237e', marginBottom: 4 },
  designationRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 3 },
  designation: { fontSize: 12, color: '#666', fontWeight: '600' },
  specializationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  specialization: { fontSize: 12, color: '#7b1fa2', fontWeight: '600' },

  cardDivider: { height: 1, backgroundColor: '#f0f0f0', marginVertical: 14 },

  subjectsSection: { marginBottom: 12 },
  sectionLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: '#1976d2', textTransform: 'uppercase', letterSpacing: 0.5 },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10,
    borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 4,
  },
  chipText: { fontSize: 12, fontWeight: '700' },
  chipCode: { fontSize: 10, fontWeight: '600' },

  contactSection: { gap: 8 },
  contactRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  contactIcon: {
    width: 28, height: 28, borderRadius: 8, backgroundColor: '#f5f5f5',
    alignItems: 'center', justifyContent: 'center',
  },
  contactText: { fontSize: 13, color: '#444', flex: 1 },

  emptyState: { margin: 24, alignItems: 'center', gap: 12 },
  emptyIcon: {
    width: 96, height: 96, borderRadius: 48, backgroundColor: '#e3f2fd',
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: '#333' },
  emptySub: { fontSize: 13, color: '#888', textAlign: 'center', lineHeight: 22 },
});
