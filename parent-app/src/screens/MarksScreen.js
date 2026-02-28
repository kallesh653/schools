import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, RefreshControl } from 'react-native';
import { Card, DataTable, Text, Chip, ProgressBar, ActivityIndicator } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { parentAPI, examinationAPI } from '../services/api';
import ScreenHeader from '../components/ScreenHeader';
import { markSeen, SECTIONS } from '../utils/notifications';

const GRADE_COLORS = {
  'A+': '#1b5e20', 'A': '#2e7d32', 'B+': '#558b2f', 'B': '#7cb342',
  'C+': '#f9a825', 'C': '#fbc02d', 'D': '#ef6c00', 'F': '#c62828',
};

export default function MarksScreen({ navigation }) {
  const [children, setChildren] = useState([]);
  const [examinations, setExaminations] = useState([]);
  const [selectedChild, setSelectedChild] = useState('');
  const [selectedExam, setSelectedExam] = useState('');
  const [marks, setMarks] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [summary, setSummary] = useState({ totalMarks: 0, obtainedMarks: 0, percentage: 0 });
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMarks, setLoadingMarks] = useState(false);

  useEffect(() => {
    fetchChildren();
    fetchExaminations();
    markSeen(SECTIONS.MARKS);
  }, []);

  useEffect(() => {
    if (selectedChild && selectedExam) {
      fetchMarksAndSchedules();
    } else {
      setMarks([]);
      setSchedules([]);
    }
  }, [selectedChild, selectedExam]);

  const fetchChildren = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      const user = JSON.parse(userData);
      const parentId = user.entityId;
      if (!parentId) return;
      const response = await parentAPI.getChildren(parentId);
      setChildren(response.data);
      if (response.data.length > 0) {
        setSelectedChild(response.data[0].id.toString());
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch children');
    }
  };

  const fetchExaminations = async () => {
    try {
      const response = await examinationAPI.getAll();
      setExaminations(response.data);
      if (response.data.length > 0) {
        setSelectedExam(response.data[0].id.toString());
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch examinations');
    }
  };

  const fetchMarksAndSchedules = async () => {
    setLoadingMarks(true);
    try {
      const [marksResp, schedResp] = await Promise.all([
        examinationAPI.getMarksByStudentAndExam(selectedExam, selectedChild),
        examinationAPI.getSchedules(selectedExam),
      ]);

      const marksData = marksResp.data || [];
      setMarks(marksData);

      const schedData = schedResp.data || [];
      setSchedules(schedData);

      let totalMarks = 0;
      let obtainedMarks = 0;
      marksData.forEach(mark => {
        if (!mark.isAbsent) {
          totalMarks += (mark.examSchedule?.maxMarks || 100);
          obtainedMarks += (mark.totalMarks || 0);
        }
      });
      const percentage = totalMarks > 0 ? (obtainedMarks / totalMarks) * 100 : 0;
      setSummary({ totalMarks, obtainedMarks, percentage });
    } catch (error) {
      setMarks([]);
      setSchedules([]);
      setSummary({ totalMarks: 0, obtainedMarks: 0, percentage: 0 });
    }
    setLoadingMarks(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchChildren(), fetchExaminations()]);
    if (selectedChild && selectedExam) await fetchMarksAndSchedules();
    setRefreshing(false);
  };

  const getGradeColor = (grade) => GRADE_COLORS[grade] || '#757575';

  const getResultColor = (percentage) => {
    if (percentage >= 75) return '#2e7d32';
    if (percentage >= 50) return '#f9a825';
    return '#c62828';
  };

  const selectedExamObj = examinations.find(e => e.id.toString() === selectedExam);

  return (
    <View style={styles.container}>
      <ScreenHeader title="Academic Performance" navigation={navigation} onRefresh={handleRefresh} refreshing={refreshing} />
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}>

        {/* Selection Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionLabel}>Select Child</Text>
            <View style={styles.pickerWrapper}>
              <Picker selectedValue={selectedChild} onValueChange={setSelectedChild} style={styles.picker}>
                {children.map(child => (
                  <Picker.Item key={child.id} label={`${child.firstName} ${child.lastName}`} value={child.id.toString()} />
                ))}
              </Picker>
            </View>
            <Text style={styles.sectionLabel}>Select Examination</Text>
            <View style={styles.pickerWrapper}>
              <Picker selectedValue={selectedExam} onValueChange={setSelectedExam} style={styles.picker}>
                <Picker.Item label="-- Select Examination --" value="" />
                {examinations.map(exam => (
                  <Picker.Item key={exam.id} label={exam.name} value={exam.id.toString()} />
                ))}
              </Picker>
            </View>
            {selectedExamObj && (
              <View style={styles.examMeta}>
                <MaterialCommunityIcons name="calendar-range" size={14} color="#666" />
                <Text style={styles.examMetaText}>
                  {selectedExamObj.startDate} — {selectedExamObj.endDate}
                </Text>
                <Chip mode="flat" style={styles.examTypeChip} textStyle={{ fontSize: 11, color: '#1565c0' }}>
                  {selectedExamObj.examType?.replace('_', ' ')}
                </Chip>
              </View>
            )}
          </Card.Content>
        </Card>

        {loadingMarks && (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#1976d2" />
            <Text style={styles.loadingText}>Loading results...</Text>
          </View>
        )}

        {/* Exam Schedule Card */}
        {!loadingMarks && schedules.length > 0 && (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.cardTitleRow}>
                <MaterialCommunityIcons name="calendar-clock" size={20} color="#1976d2" />
                <Text style={styles.cardTitle}>Exam Schedule</Text>
              </View>
              <DataTable>
                <DataTable.Header style={styles.tableHeader}>
                  <DataTable.Title textStyle={styles.tableHeaderText}>Subject</DataTable.Title>
                  <DataTable.Title textStyle={styles.tableHeaderText}>Date</DataTable.Title>
                  <DataTable.Title textStyle={styles.tableHeaderText} numeric>Max</DataTable.Title>
                  <DataTable.Title textStyle={styles.tableHeaderText} numeric>Pass</DataTable.Title>
                </DataTable.Header>
                {schedules.map(s => (
                  <DataTable.Row key={s.id}>
                    <DataTable.Cell textStyle={{ fontSize: 13 }}>{s.subject?.name || 'General'}</DataTable.Cell>
                    <DataTable.Cell textStyle={{ fontSize: 12, color: '#555' }}>{s.examDate || '-'}</DataTable.Cell>
                    <DataTable.Cell numeric textStyle={{ fontSize: 13, fontWeight: '600', color: '#1976d2' }}>{s.maxMarks}</DataTable.Cell>
                    <DataTable.Cell numeric textStyle={{ fontSize: 13, color: '#388e3c' }}>{s.passMarks}</DataTable.Cell>
                  </DataTable.Row>
                ))}
              </DataTable>
            </Card.Content>
          </Card>
        )}

        {/* Summary Card */}
        {!loadingMarks && marks.length > 0 && (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.cardTitleRow}>
                <MaterialCommunityIcons name="chart-bar" size={20} color="#1976d2" />
                <Text style={styles.cardTitle}>Result Summary</Text>
                <View style={{ flex: 1 }} />
                <Chip
                  mode="flat"
                  style={{ backgroundColor: summary.percentage >= 50 ? '#e8f5e9' : '#ffebee' }}
                  textStyle={{ color: getResultColor(summary.percentage), fontWeight: '700', fontSize: 12 }}
                >
                  {summary.percentage >= 50 ? 'PASS' : 'FAIL'}
                </Chip>
              </View>

              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{summary.obtainedMarks}</Text>
                  <Text style={styles.summaryLabel}>Obtained</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryValue}>{summary.totalMarks}</Text>
                  <Text style={styles.summaryLabel}>Total</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryValue, { color: getResultColor(summary.percentage) }]}>
                    {summary.percentage.toFixed(1)}%
                  </Text>
                  <Text style={styles.summaryLabel}>Percentage</Text>
                </View>
              </View>

              <View style={styles.progressRow}>
                <Text style={styles.progressLabel}>Overall Performance</Text>
                <Text style={[styles.progressPct, { color: getResultColor(summary.percentage) }]}>
                  {summary.percentage.toFixed(1)}%
                </Text>
              </View>
              <ProgressBar
                progress={Math.min(summary.percentage / 100, 1)}
                color={getResultColor(summary.percentage)}
                style={styles.progressBar}
              />
            </Card.Content>
          </Card>
        )}

        {/* Subject-wise Marks */}
        {!loadingMarks && marks.length > 0 && (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.cardTitleRow}>
                <MaterialCommunityIcons name="book-open-variant" size={20} color="#1976d2" />
                <Text style={styles.cardTitle}>Subject-wise Marks</Text>
              </View>
              <DataTable>
                <DataTable.Header style={styles.tableHeader}>
                  <DataTable.Title textStyle={styles.tableHeaderText}>Subject</DataTable.Title>
                  <DataTable.Title numeric textStyle={styles.tableHeaderText}>Theory</DataTable.Title>
                  <DataTable.Title numeric textStyle={styles.tableHeaderText}>Practical</DataTable.Title>
                  <DataTable.Title numeric textStyle={styles.tableHeaderText}>Total</DataTable.Title>
                  <DataTable.Title textStyle={styles.tableHeaderText}>Grade</DataTable.Title>
                </DataTable.Header>
                {marks.map((mark) => (
                  <DataTable.Row key={mark.id} style={mark.isAbsent ? styles.absentRow : {}}>
                    <DataTable.Cell textStyle={{ fontSize: 13, fontWeight: '500' }}>
                      {mark.subject?.name || 'N/A'}
                    </DataTable.Cell>
                    <DataTable.Cell numeric textStyle={{ fontSize: 13 }}>
                      {mark.isAbsent ? '-' : (mark.theoryMarks ?? '-')}
                    </DataTable.Cell>
                    <DataTable.Cell numeric textStyle={{ fontSize: 13 }}>
                      {mark.isAbsent ? '-' : (mark.practicalMarks ?? '-')}
                    </DataTable.Cell>
                    <DataTable.Cell numeric textStyle={{ fontSize: 13, fontWeight: '700', color: mark.isAbsent ? '#9e9e9e' : '#333' }}>
                      {mark.isAbsent ? 'AB' : (mark.totalMarks ?? '-')}
                    </DataTable.Cell>
                    <DataTable.Cell>
                      {mark.isAbsent ? (
                        <Chip mode="flat" style={{ backgroundColor: '#757575' }} textStyle={{ color: 'white', fontSize: 11 }}>AB</Chip>
                      ) : (
                        <Chip mode="flat" style={{ backgroundColor: getGradeColor(mark.grade) }} textStyle={{ color: 'white', fontSize: 11 }}>
                          {mark.grade || 'N/A'}
                        </Chip>
                      )}
                    </DataTable.Cell>
                  </DataTable.Row>
                ))}
              </DataTable>
            </Card.Content>
          </Card>
        )}

        {/* Empty state */}
        {!loadingMarks && selectedChild && selectedExam && marks.length === 0 && (
          <Card style={styles.card}>
            <Card.Content style={styles.emptyState}>
              <MaterialCommunityIcons name="file-document-outline" size={48} color="#bdbdbd" />
              <Text style={styles.emptyText}>No marks available for selected examination</Text>
              <Text style={styles.emptySubText}>Marks will appear here once entered by the school</Text>
            </Card.Content>
          </Card>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  card: { margin: 12, marginTop: 8, elevation: 2, borderRadius: 12 },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 4, marginTop: 8 },
  pickerWrapper: { backgroundColor: '#f8f9fa', borderRadius: 8, marginBottom: 4, borderWidth: 1, borderColor: '#e0e0e0' },
  picker: { backgroundColor: 'transparent' },
  examMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, flexWrap: 'wrap' },
  examMetaText: { fontSize: 12, color: '#666' },
  examTypeChip: { backgroundColor: '#e3f2fd' },
  loadingBox: { alignItems: 'center', padding: 32 },
  loadingText: { marginTop: 12, color: '#666', fontSize: 14 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#1976d2' },
  tableHeader: { backgroundColor: '#e8eaf6' },
  tableHeaderText: { fontWeight: '700', fontSize: 12, color: '#1a237e' },
  absentRow: { backgroundColor: '#fff3f3' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 16, alignItems: 'center' },
  summaryItem: { alignItems: 'center', flex: 1 },
  summaryDivider: { width: 1, height: 40, backgroundColor: '#e0e0e0' },
  summaryValue: { fontSize: 28, fontWeight: '800', color: '#1976d2' },
  summaryLabel: { fontSize: 12, color: '#888', marginTop: 4 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  progressLabel: { fontSize: 13, fontWeight: '600', color: '#555' },
  progressPct: { fontSize: 13, fontWeight: '700' },
  progressBar: { height: 10, borderRadius: 5 },
  emptyState: { alignItems: 'center', padding: 24 },
  emptyText: { fontSize: 15, color: '#888', marginTop: 12, fontWeight: '600' },
  emptySubText: { fontSize: 13, color: '#aaa', marginTop: 6, textAlign: 'center' },
});
