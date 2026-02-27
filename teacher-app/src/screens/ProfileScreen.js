import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Title, Card, Text, Button, Divider, Avatar } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { teacherAPI } from '../services/api';

export default function ProfileScreen({ onLogout }) {
  const [user, setUser] = useState(null);
  const [teacher, setTeacher] = useState(null);

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
          const res = await teacherAPI.getById(parsedUser.entityId).catch(() => ({ data: null }));
          setTeacher(res.data || null);
        }
      }
    } catch (error) {
      console.error('Profile load error:', error);
    }
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
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Avatar.Text size={72} label={initials} style={styles.avatar} />
        <Title style={styles.name}>{displayName}</Title>
        <Text style={styles.role}>Teacher</Text>
        {teacher?.department && (
          <Text style={styles.department}>{teacher.department}</Text>
        )}
      </View>

      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Account Information</Title>
          <InfoRow label="Username" value={user?.username} />
          <Divider style={styles.divider} />
          <InfoRow label="Full Name" value={user?.fullName || 'Not provided'} />
          <Divider style={styles.divider} />
          <InfoRow label="Email" value={user?.email || 'Not provided'} />
          <Divider style={styles.divider} />
          <InfoRow label="Contact" value={user?.contact || 'Not provided'} />
          <Divider style={styles.divider} />
          <InfoRow label="Role" value="Teacher" />
        </Card.Content>
      </Card>

      {teacher && (
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Teacher Details</Title>
            <InfoRow label="Employee ID" value={teacher.employeeId || 'N/A'} />
            <Divider style={styles.divider} />
            <InfoRow label="Department" value={teacher.department || 'N/A'} />
            <Divider style={styles.divider} />
            <InfoRow label="Designation" value={teacher.designation || 'N/A'} />
            <Divider style={styles.divider} />
            <InfoRow label="Qualification" value={teacher.qualification || 'N/A'} />
          </Card.Content>
        </Card>
      )}

      <Button mode="contained" onPress={handleLogout} style={styles.logoutButton} buttonColor="#F44336">
        Logout
      </Button>
    </ScrollView>
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
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#1976d2', alignItems: 'center', padding: 32, paddingTop: 40 },
  avatar: { backgroundColor: 'rgba(255,255,255,0.3)', marginBottom: 12 },
  name: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  role: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 4 },
  department: { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 2 },
  card: { margin: 16, marginTop: 12, elevation: 2 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1976d2', marginBottom: 8 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
  infoLabel: { fontSize: 14, color: '#666', flex: 1 },
  infoValue: { fontSize: 14, fontWeight: '500', color: '#333', flex: 2, textAlign: 'right' },
  divider: { backgroundColor: '#f0f0f0' },
  logoutButton: { margin: 16, marginTop: 8, marginBottom: 32 },
});
