import React, { useState, useEffect, useCallback } from 'react';
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
