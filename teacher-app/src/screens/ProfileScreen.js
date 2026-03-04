import React, { useState, useEffect } from 'react';
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
