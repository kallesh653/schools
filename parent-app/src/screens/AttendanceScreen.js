import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, RefreshControl, FlatList } from 'react-native';
import { Card, Button, Portal, Dialog, TextInput, Text, Chip, ProgressBar } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { parentAPI, attendanceAPI } from '../services/api';
import ScreenHeader from '../components/ScreenHeader';

const STATUS_COLORS = {
  PRESENT: '#4CAF50',
  ABSENT: '#F44336',
  LATE: '#FF9800',
  LEAVE: '#9C27B0',
};

const STATUS_ICONS = {
  PRESENT: 'check-circle',
  ABSENT: 'close-circle',
  LATE: 'clock-alert',
  LEAVE: 'calendar-remove',
};

export default function AttendanceScreen({ navigation }) {
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState('');
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [stats, setStats] = useState({ present: 0, absent: 0, late: 0, total: 0 });
  const [visible, setVisible] = useState(false);
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveStartDate, setLeaveStartDate] = useState('');
  const [leaveEndDate, setLeaveEndDate] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => { fetchChildren(); }, []);

  useEffect(() => {
    if (selectedChild) fetchAttendance();
  }, [selectedChild]);

  const fetchChildren = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      const user = JSON.parse(userData);
      const parentId = user.entityId;
      if (!parentId) { Alert.alert('Error', 'Parent account not properly linked'); return; }
      const response = await parentAPI.getChildren(parentId);
      setChildren(response.data);
      if (response.data.length > 0) setSelectedChild(response.data[0].id.toString());
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch children');
    }
  };

  const fetchAttendance = async () => {
    try {
      const response = await attendanceAPI.getByStudent(selectedChild);
      const records = (response.data || []).sort((a, b) => new Date(b.date) - new Date(a.date));
      setAttendanceRecords(records);
      const present = records.filter(a => a.status === 'PRESENT').length;
      const absent = records.filter(a => a.status === 'ABSENT').length;
      const late = records.filter(a => a.status === 'LATE').length;
      setStats({ present, absent, late, total: records.length });
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch attendance');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchChildren();
    if (selectedChild) await fetchAttendance();
    setRefreshing(false);
  };

  const attendancePercentage = stats.total > 0 ? (stats.present / stats.total) * 100 : 0;

  const filteredRecords = filterStatus === 'ALL'
    ? attendanceRecords
    : attendanceRecords.filter(r => r.status === filterStatus);

  const handleLeaveApplication = async () => {
    if (!leaveReason || !leaveStartDate || !leaveEndDate) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    try {
      await attendanceAPI.applyLeave({
        student: { id: parseInt(selectedChild) },
        reason: leaveReason,
        fromDate: leaveStartDate,
        toDate: leaveEndDate,
        status: 'PENDING',
      });
      Alert.alert('Success', 'Leave application submitted successfully');
      setVisible(false);
      setLeaveReason(''); setLeaveStartDate(''); setLeaveEndDate('');
    } catch (error) {
      Alert.alert('Error', 'Failed to submit leave application');
    }
  };

  return (
    <View style={styles.container}>
      <ScreenHeader title="Attendance" navigation={navigation} onRefresh={handleRefresh} refreshing={refreshing} />
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}>

        {/* Child Picker */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.label}>Select Child</Text>
            <View style={styles.pickerWrapper}>
              <Picker selectedValue={selectedChild} onValueChange={v => { setSelectedChild(v); setFilterStatus('ALL'); }} style={styles.picker}>
                {children.map(child => (
                  <Picker.Item key={child.id} label={`${child.firstName} ${child.lastName}`} value={child.id.toString()} />
                ))}
              </Picker>
            </View>
          </Card.Content>
        </Card>

        {selectedChild && (
          <>
            {/* Summary Card */}
            <Card style={styles.card}>
              <Card.Content>
                <View style={styles.cardTitleRow}>
                  <MaterialCommunityIcons name="chart-donut" size={20} color="#1976d2" />
                  <Text style={styles.cardTitle}>Attendance Summary</Text>
                  <View style={{ flex: 1 }} />
                  <Text style={styles.periodLabel}>Last 30 days</Text>
                </View>
                <View style={styles.statsRow}>
                  {[
                    { label: 'Present', value: stats.present, color: '#4CAF50', icon: 'check-circle' },
                    { label: 'Absent', value: stats.absent, color: '#F44336', icon: 'close-circle' },
                    { label: 'Late', value: stats.late, color: '#FF9800', icon: 'clock-alert' },
                    { label: 'Total', value: stats.total, color: '#1976d2', icon: 'calendar-check' },
                  ].map(s => (
                    <View key={s.label} style={styles.statCard}>
                      <MaterialCommunityIcons name={s.icon} size={22} color={s.color} />
                      <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
                      <Text style={styles.statLabel}>{s.label}</Text>
                    </View>
                  ))}
                </View>
                <View style={styles.progressRow}>
                  <Text style={styles.progressLabel}>Attendance Rate</Text>
                  <Text style={[styles.progressPct, { color: attendancePercentage >= 75 ? '#4CAF50' : '#F44336' }]}>
                    {attendancePercentage.toFixed(1)}%
                  </Text>
                </View>
                <ProgressBar
                  progress={attendancePercentage / 100}
                  color={attendancePercentage >= 75 ? '#4CAF50' : '#F44336'}
                  style={styles.progressBar}
                />
                {attendancePercentage > 0 && attendancePercentage < 75 && (
                  <View style={styles.warningRow}>
                    <MaterialCommunityIcons name="alert-circle" size={16} color="#F44336" />
                    <Text style={styles.warningText}>Attendance below 75% — please improve regularity</Text>
                  </View>
                )}
              </Card.Content>
            </Card>

            {/* Filter Chips */}
            {attendanceRecords.length > 0 && (
              <Card style={styles.card}>
                <Card.Content>
                  <View style={styles.cardTitleRow}>
                    <MaterialCommunityIcons name="history" size={20} color="#1976d2" />
                    <Text style={styles.cardTitle}>Attendance Records</Text>
                  </View>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
                    {['ALL', 'PRESENT', 'ABSENT', 'LATE', 'LEAVE'].map(status => (
                      <Chip
                        key={status}
                        mode={filterStatus === status ? 'flat' : 'outlined'}
                        style={[
                          styles.filterChip,
                          filterStatus === status && { backgroundColor: STATUS_COLORS[status] || '#1976d2' }
                        ]}
                        textStyle={{
                          color: filterStatus === status ? 'white' : '#555',
                          fontWeight: filterStatus === status ? '700' : '400',
                          fontSize: 12,
                        }}
                        onPress={() => setFilterStatus(status)}
                      >
                        {status === 'ALL' ? `All (${attendanceRecords.length})` : `${status} (${attendanceRecords.filter(r => r.status === status).length})`}
                      </Chip>
                    ))}
                  </ScrollView>

                  {/* Attendance List */}
                  {filteredRecords.map((record) => (
                    <View key={record.id || record.date} style={[styles.recordRow, { borderLeftColor: STATUS_COLORS[record.status] || '#9e9e9e' }]}>
                      <MaterialCommunityIcons
                        name={STATUS_ICONS[record.status] || 'help-circle'}
                        size={22}
                        color={STATUS_COLORS[record.status] || '#9e9e9e'}
                      />
                      <View style={styles.recordInfo}>
                        <Text style={styles.recordDate}>{record.date}</Text>
                        {record.remarks ? <Text style={styles.recordRemarks}>{record.remarks}</Text> : null}
                      </View>
                      <Chip
                        mode="flat"
                        style={{ backgroundColor: STATUS_COLORS[record.status] || '#9e9e9e' }}
                        textStyle={{ color: 'white', fontSize: 10, fontWeight: '700' }}
                        compact
                      >
                        {record.status}
                      </Chip>
                    </View>
                  ))}

                  {filteredRecords.length === 0 && (
                    <View style={styles.emptyState}>
                      <MaterialCommunityIcons name="calendar-blank" size={36} color="#bdbdbd" />
                      <Text style={styles.emptyText}>No {filterStatus !== 'ALL' ? filterStatus.toLowerCase() : ''} records</Text>
                    </View>
                  )}
                </Card.Content>
              </Card>
            )}

            <Button mode="contained" style={styles.leaveBtn} onPress={() => setVisible(true)} icon="file-plus-outline">
              Apply for Leave
            </Button>
          </>
        )}
        <View style={{ height: 20 }} />
      </ScrollView>

      <Portal>
        <Dialog visible={visible} onDismiss={() => setVisible(false)}>
          <Dialog.Title>Apply for Leave</Dialog.Title>
          <Dialog.Content>
            <TextInput label="Reason" value={leaveReason} onChangeText={setLeaveReason} mode="outlined" multiline numberOfLines={3} style={styles.input} />
            <TextInput label="Start Date (YYYY-MM-DD)" value={leaveStartDate} onChangeText={setLeaveStartDate} mode="outlined" placeholder="2025-01-15" style={styles.input} />
            <TextInput label="End Date (YYYY-MM-DD)" value={leaveEndDate} onChangeText={setLeaveEndDate} mode="outlined" placeholder="2025-01-17" style={styles.input} />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setVisible(false)}>Cancel</Button>
            <Button onPress={handleLeaveApplication}>Submit</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  card: { margin: 12, marginTop: 8, elevation: 2, borderRadius: 12 },
  label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 4 },
  pickerWrapper: { backgroundColor: '#f8f9fa', borderRadius: 8, borderWidth: 1, borderColor: '#e0e0e0' },
  picker: { backgroundColor: 'transparent' },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#1976d2' },
  periodLabel: { fontSize: 11, color: '#999', fontStyle: 'italic' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 8 },
  statCard: { alignItems: 'center', gap: 4 },
  statValue: { fontSize: 24, fontWeight: '800' },
  statLabel: { fontSize: 11, color: '#888' },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, marginTop: 8 },
  progressLabel: { fontSize: 13, fontWeight: '600', color: '#555' },
  progressPct: { fontSize: 13, fontWeight: '700' },
  progressBar: { height: 10, borderRadius: 5 },
  warningRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 10, backgroundColor: '#ffebee', padding: 8, borderRadius: 8 },
  warningText: { fontSize: 12, color: '#d32f2f', flex: 1 },
  filterRow: { marginBottom: 12 },
  filterChip: { marginRight: 8, marginBottom: 4 },
  recordRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f0f0f0', borderLeftWidth: 3, paddingLeft: 10, marginBottom: 2, borderRadius: 4 },
  recordInfo: { flex: 1 },
  recordDate: { fontSize: 14, fontWeight: '600', color: '#333' },
  recordRemarks: { fontSize: 12, color: '#888', marginTop: 2 },
  emptyState: { alignItems: 'center', padding: 24, gap: 8 },
  emptyText: { fontSize: 14, color: '#aaa' },
  leaveBtn: { margin: 12, marginTop: 4 },
  input: { marginBottom: 12 },
});
