import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, ScrollView, Alert, RefreshControl } from 'react-native';
import { Card, Button, Portal, Dialog, TextInput, Text, Chip, ProgressBar } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { parentAPI, attendanceAPI } from '../services/api';
import ScreenHeader from '../components/ScreenHeader';
import { markSeen, SECTIONS } from '../utils/notifications';

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
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => { fetchChildren(); markSeen(SECTIONS.ATTENDANCE); }, []);

  useEffect(() => {
    if (selectedChild) { setSelectedDate(''); fetchAttendance(); }
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

  // Build markedDates for Calendar
  const markedDates = useMemo(() => {
    const marks = {};
    for (const record of attendanceRecords) {
      if (!record.date) continue;
      const color = STATUS_COLORS[record.status] || '#9e9e9e';
      marks[record.date] = {
        marked: true,
        dotColor: color,
        customStyles: {
          container: { backgroundColor: selectedDate === record.date ? color : 'transparent', borderRadius: 18 },
          text: { color: selectedDate === record.date ? 'white' : '#333', fontWeight: '700' },
        },
      };
    }
    if (selectedDate) {
      marks[selectedDate] = {
        ...(marks[selectedDate] || {}),
        selected: true,
        selectedColor: STATUS_COLORS[attendanceRecords.find(r => r.date === selectedDate)?.status] || '#1976d2',
      };
    }
    return marks;
  }, [attendanceRecords, selectedDate]);

  const selectedRecord = selectedDate ? attendanceRecords.find(r => r.date === selectedDate) : null;

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
              <Picker selectedValue={selectedChild} onValueChange={v => { setSelectedChild(v); }} style={styles.picker}>
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

            {/* Calendar Card */}
            {attendanceRecords.length > 0 && (
              <Card style={styles.card}>
                <Card.Content>
                  <View style={styles.cardTitleRow}>
                    <MaterialCommunityIcons name="calendar-month" size={20} color="#1976d2" />
                    <Text style={styles.cardTitle}>Attendance Calendar</Text>
                  </View>

                  {/* Legend */}
                  <View style={styles.legendRow}>
                    {[['PRESENT', '#4CAF50'], ['ABSENT', '#F44336'], ['LATE', '#FF9800'], ['LEAVE', '#9C27B0']].map(([status, color]) => (
                      <View key={status} style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: color }]} />
                        <Text style={styles.legendText}>{status}</Text>
                      </View>
                    ))}
                  </View>

                  <Calendar
                    markingType="dot"
                    markedDates={markedDates}
                    onDayPress={(day) => {
                      const dateStr = day.dateString;
                      setSelectedDate(prev => prev === dateStr ? '' : dateStr);
                    }}
                    theme={{
                      todayTextColor: '#1976d2',
                      selectedDayBackgroundColor: '#1976d2',
                      arrowColor: '#1976d2',
                      textDayFontSize: 13,
                      textMonthFontSize: 15,
                      textDayHeaderFontSize: 12,
                    }}
                    style={styles.calendar}
                  />

                  {/* Detail card for selected date */}
                  {selectedDate && (
                    <View style={[
                      styles.detailCard,
                      { borderLeftColor: STATUS_COLORS[selectedRecord?.status] || '#bdbdbd' }
                    ]}>
                      {selectedRecord ? (
                        <>
                          <View style={styles.detailRow}>
                            <MaterialCommunityIcons name="calendar" size={16} color="#555" />
                            <Text style={styles.detailDate}>{selectedDate}</Text>
                            <View style={{ flex: 1 }} />
                            <Chip
                              mode="flat"
                              style={{ backgroundColor: STATUS_COLORS[selectedRecord.status] || '#9e9e9e' }}
                              textStyle={{ color: 'white', fontWeight: '700', fontSize: 11 }}
                              compact
                            >
                              {selectedRecord.status}
                            </Chip>
                          </View>
                          {selectedRecord.remarks ? (
                            <Text style={styles.detailRemarks}>Remarks: {selectedRecord.remarks}</Text>
                          ) : null}
                        </>
                      ) : (
                        <Text style={styles.noRecordText}>No attendance record for {selectedDate}</Text>
                      )}
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
  legendRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 10 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 11, color: '#555' },
  calendar: { borderRadius: 8, marginBottom: 8 },
  detailCard: { borderLeftWidth: 4, borderRadius: 8, backgroundColor: '#f8f9fa', padding: 12, marginTop: 8 },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  detailDate: { fontSize: 14, fontWeight: '600', color: '#333' },
  detailRemarks: { fontSize: 13, color: '#666', marginTop: 6 },
  noRecordText: { fontSize: 13, color: '#999', fontStyle: 'italic' },
  leaveBtn: { margin: 12, marginTop: 4 },
  input: { marginBottom: 12 },
});
