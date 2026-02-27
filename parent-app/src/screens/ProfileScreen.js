import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity, StatusBar, RefreshControl } from 'react-native';
import { Card, Text, Button, Divider, Avatar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { parentAPI } from '../services/api';

export default function ProfileScreen({ onLogout, navigation }) {
  const [user, setUser] = useState(null);
  const [children, setChildren] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
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
    } catch (error) {
      console.error('Profile load error:', error);
    }
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
    : '?';

  return (
    <View style={styles.outerContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#1565c0" />
      <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#fff" />}>
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
          <Avatar.Text size={72} label={initials} style={styles.avatar} />
          <Text style={styles.name}>{displayName}</Text>
          <Text style={styles.role}>Parent</Text>
        </View>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Account Information</Text>
            <InfoRow label="Username" value={user?.username} />
            <Divider style={styles.divider} />
            <InfoRow label="Full Name" value={user?.fullName || 'Not provided'} />
            <Divider style={styles.divider} />
            <InfoRow label="Email" value={user?.email || 'Not provided'} />
            <Divider style={styles.divider} />
            <InfoRow label="Contact" value={user?.contact || 'Not provided'} />
            <Divider style={styles.divider} />
            <InfoRow label="Role" value="Parent" />
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>My Children ({children.length})</Text>
            {children.length > 0 ? (
              children.map((child, index) => (
                <View key={child.id}>
                  <View style={styles.childRow}>
                    <View style={styles.childAvatar}>
                      <Text style={styles.childAvatarText}>
                        {(child.firstName || '?')[0].toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.childInfo}>
                      <Text style={styles.childName}>{child.firstName} {child.lastName}</Text>
                      <Text style={styles.childDetail}>Class: {child.schoolClass?.name} - {child.section?.name}</Text>
                      <Text style={styles.childDetail}>Admission No: {child.admissionNo || 'N/A'}</Text>
                    </View>
                  </View>
                  {index < children.length - 1 && <Divider style={styles.divider} />}
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>No children linked</Text>
            )}
          </Card.Content>
        </Card>

        <Button mode="contained" onPress={handleLogout} style={styles.logoutButton} buttonColor="#F44336">
          Logout
        </Button>
      </ScrollView>
    </View>
  );
}

function InfoRow({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value || '-'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: { flex: 1, backgroundColor: '#1565c0' },
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#1976d2', alignItems: 'center', paddingBottom: 32, paddingTop: 0 },
  headerNav: { flexDirection: 'row', alignItems: 'center', width: '100%', paddingHorizontal: 8, paddingTop: 44, paddingBottom: 12 },
  navBtn: { padding: 8 },
  avatar: { backgroundColor: 'rgba(255,255,255,0.3)', marginBottom: 12 },
  name: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  role: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 4 },
  card: { margin: 16, marginTop: 12, elevation: 2 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1976d2', marginBottom: 8 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
  infoLabel: { fontSize: 14, color: '#666', flex: 1 },
  infoValue: { fontSize: 14, fontWeight: '500', color: '#333', flex: 2, textAlign: 'right' },
  divider: { backgroundColor: '#f0f0f0' },
  childRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  childAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#1976d2', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  childAvatarText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  childInfo: { flex: 1 },
  childName: { fontSize: 14, fontWeight: '600', color: '#333' },
  childDetail: { fontSize: 12, color: '#666', marginTop: 2 },
  emptyText: { color: '#888', textAlign: 'center', padding: 12 },
  logoutButton: { margin: 16, marginTop: 8, marginBottom: 32 },
});
