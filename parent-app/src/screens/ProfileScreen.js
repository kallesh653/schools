import React, { useState, useEffect } from 'react';
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
