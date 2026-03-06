import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, StatusBar, Alert, ActivityIndicator, Modal,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { teacherAPI, sectionAPI, studentAPI, examinationAPI, marksAPI, subjectAPI } from '../services/api';

function getGrade(pct) {
  if (pct >= 90) return { grade: 'A+', color: '#1b5e20' };
  if (pct >= 80) return { grade: 'A',  color: '#2e7d32' };
  if (pct >= 70) return { grade: 'B+', color: '#1565c0' };
  if (pct >= 60) return { grade: 'B',  color: '#1976d2' };
  if (pct >= 50) return { grade: 'C+', color: '#e65100' };
  if (pct >= 40) return { grade: 'C',  color: '#f57c00' };
  if (pct >= 33) return { grade: 'D',  color: '#6a1b9a' };
  return { grade: 'F', color: '#c62828' };
}

export default function MarksScreen() {
  const [assignments, setAssignments] = useState([]);
  const [exams, setExams] = useState([]);
  const [sections, setSections] = useState([]);
  const [students, setStudents] = useState([]);
  const [marksData, setMarksData] = useState({});
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [maxTheory, setMaxTheory] = useState('100');
  const [maxPractical, setMaxPractical] = useState('0');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [classTeacherClasses, setClassTeacherClasses] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [theoryInput, setTheoryInput] = useState('');
  const [practicalInput, setPracticalInput] = useState('');
  const [isAbsent, setIsAbsent] = useState(false);

  useEffect(() => {
    Promise.all([
      teacherAPI.getMyAssignments(),
      examinationAPI.getAll(),
      teacherAPI.getMyClassTeacherInfo().catch(() => ({ data: [] })),
      subjectAPI.getAll().catch(() => ({ data: [] })),
    ])
      .then(([aRes, eRes, ctRes, sRes]) => {
        setAssignments(aRes.data || []);
        setExams(eRes.data || []);
        setClassTeacherClasses(ctRes.data || []);
        setAllSubjects(sRes.data || []);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedClassId) { sectionAPI.getByClass(selectedClassId).then(r => setSections(r.data || [])).catch(() => {}); }
  }, [selectedClassId]);

  useEffect(() => {
    if (selectedClassId && selectedSectionId) loadStudents();
  }, [selectedClassId, selectedSectionId]);

  const loadStudents = async () => {
    setLoading(true);
    try {
      const res = await studentAPI.getByClassAndSection(selectedClassId, selectedSectionId);
      setStudents(res.data || []);
      setMarksData({});
    } catch (e) { Alert.alert('Error', 'Failed to load students'); }
    setLoading(false);
  };

  const uniqueClasses = [...new Map(assignments.map(a => [a.schoolClass?.id, a.schoolClass])).values()].filter(Boolean);
  // Also show CT-only classes (no subject assignment but teacher is CT)
  const assignedCIds = new Set(uniqueClasses.map(c => c.id?.toString()));
  const ctOnlyClasses = classTeacherClasses
    .filter(c => !assignedCIds.has(c.classId?.toString()))
    .map(c => ({ id: c.classId, name: c.className, code: c.classCode }));
  const allClasses = [...uniqueClasses, ...ctOnlyClasses];
  const isCtClass = (classId) => classTeacherClasses.some(c => c.classId?.toString() === classId?.toString());
  // Class teachers can enter marks for ALL subjects in their class
  const classSubjects = isCtClass(selectedClassId)
    ? allSubjects
    : assignments.filter(a => a.schoolClass?.id?.toString() === selectedClassId).map(a => a.subject).filter(Boolean);

  const openModal = (student) => {
    const existing = marksData[student.id];
    setCurrentStudent(student);
    setTheoryInput(existing?.theory?.toString() || '');
    setPracticalInput(existing?.practical?.toString() || '');
    setIsAbsent(existing?.absent || false);
    setModalVisible(true);
  };

  const saveMarks = () => {
    if (!currentStudent) return;
    const theory = parseFloat(theoryInput) || 0;
    const practical = parseFloat(practicalInput) || 0;
    setMarksData(prev => ({
      ...prev,
      [currentStudent.id]: { theory, practical, total: theory + practical, absent: isAbsent },
    }));
    setModalVisible(false);
  };

  const submitMarks = async () => {
    if (!selectedExam || !selectedSubjectId) { Alert.alert('Error', 'Select exam and subject first'); return; }
    const entries = Object.entries(marksData);
    if (entries.length === 0) { Alert.alert('Info', 'Enter marks for at least one student'); return; }
    setSubmitting(true);
    try {
      const payload = entries.map(([studentId, m]) => ({
        student: { id: parseInt(studentId) },
        examination: { id: parseInt(selectedExam) },
        subject: { id: parseInt(selectedSubjectId) },
        theoryMarks: m.theory || 0,
        practicalMarks: m.practical || 0,
        totalMarks: m.total || 0,
        isAbsent: m.absent || false,
      }));
      await marksAPI.createBulk(payload);
      Alert.alert('Success', 'Marks submitted for ' + payload.length + ' students!');
    } catch (e) { Alert.alert('Error', 'Failed to submit marks'); }
    setSubmitting(false);
  };

  const enteredCount = Object.keys(marksData).length;

  return (
    <View style={{ flex: 1, backgroundColor: '#f0f4f8' }}>
      <StatusBar barStyle="light-content" backgroundColor="#6a1b9a" />

      <View style={styles.header}>
        <View style={styles.headerRow}>
          <View style={styles.headerIcon}><MaterialCommunityIcons name="file-document-outline" size={24} color="#fff" /></View>
          <View>
            <Text style={styles.headerTitle}>Enter Marks</Text>
            <Text style={styles.headerSub}>Record student exam results</Text>
          </View>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Exam Configuration</Text>

          <Text style={styles.pickerLabel}>Examination</Text>
          <View style={styles.pickerBox}>
            <Picker selectedValue={selectedExam} onValueChange={setSelectedExam} style={styles.picker}>
              <Picker.Item label="Select examination" value="" />
              {exams.map(e => <Picker.Item key={e.id} label={e.name} value={e.id.toString()} />)}
            </Picker>
          </View>

          <Text style={styles.pickerLabel}>Class</Text>
          <View style={styles.pickerBox}>
            <Picker selectedValue={selectedClassId} onValueChange={v => { setSelectedClassId(v); setSelectedSectionId(''); setSelectedSubjectId(''); setStudents([]); }} style={styles.picker}>
              <Picker.Item label="Select your class" value="" />
              {allClasses.map(c => <Picker.Item key={c.id} label={"Class " + c.name + (isCtClass(c.id) ? " ★ CT" : "")} value={c.id.toString()} />)}
            </Picker>
          </View>

          {selectedClassId ? (
            <>
              <Text style={styles.pickerLabel}>Section</Text>
              <View style={styles.pickerBox}>
                <Picker selectedValue={selectedSectionId} onValueChange={setSelectedSectionId} style={styles.picker}>
                  <Picker.Item label="Select section" value="" />
                  {sections.map(s => <Picker.Item key={s.id} label={s.name} value={s.id.toString()} />)}
                </Picker>
              </View>

              {isCtClass(selectedClassId) && (
                <View style={styles.ctBanner}>
                  <MaterialCommunityIcons name="star-circle" size={16} color="#fff" />
                  <Text style={styles.ctBannerText}>Class Teacher — enter marks for any subject</Text>
                </View>
              )}
              <Text style={styles.pickerLabel}>{isCtClass(selectedClassId) ? 'Subject (all subjects)' : 'Subject (assigned to you)'}</Text>
              <View style={styles.pickerBox}>
                <Picker selectedValue={selectedSubjectId} onValueChange={setSelectedSubjectId} style={styles.picker}>
                  <Picker.Item label="Select subject" value="" />
                  {classSubjects.map(s => <Picker.Item key={s.id} label={s.name} value={s.id.toString()} />)}
                </Picker>
              </View>

              <View style={styles.maxRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.pickerLabel}>Max Theory Marks</Text>
                  <TextInput style={styles.maxInput} value={maxTheory} onChangeText={setMaxTheory} keyboardType="numeric" placeholder="100" />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.pickerLabel}>Max Practical Marks</Text>
                  <TextInput style={styles.maxInput} value={maxPractical} onChangeText={setMaxPractical} keyboardType="numeric" placeholder="0" />
                </View>
              </View>
            </>
          ) : null}
        </View>

        {loading ? <View style={styles.loadingBox}><ActivityIndicator size="large" color="#6a1b9a" /></View>
        : students.length > 0 ? (
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardTitle}>Students ({students.length})</Text>
              {enteredCount > 0 && (
                <View style={styles.enteredBadge}>
                  <Text style={styles.enteredBadgeText}>{enteredCount} entered</Text>
                </View>
              )}
            </View>
            <Text style={styles.cardSub}>Tap a student to enter marks</Text>

            {students.map((s, idx) => {
              const m = marksData[s.id];
              const maxT = parseFloat(maxTheory) || 100;
              const maxP = parseFloat(maxPractical) || 0;
              const totalMax = maxT + maxP;
              const pct = m && totalMax > 0 ? Math.round(((m.total || 0) / totalMax) * 100) : null;
              const gradeInfo = pct !== null ? getGrade(pct) : null;

              return (
                <TouchableOpacity key={s.id} style={[styles.studentRow, idx % 2 === 0 && styles.studentRowAlt]} onPress={() => openModal(s)} activeOpacity={0.7}>
                  <View style={styles.studentNumber}><Text style={styles.studentNumberText}>{idx + 1}</Text></View>
                  <View style={styles.studentAvatar}>
                    <Text style={styles.studentAvatarText}>{s.firstName?.[0]?.toUpperCase() || '?'}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.studentName}>{s.firstName} {s.lastName}</Text>
                    <Text style={styles.studentRoll}>Roll: {s.rollNumber || s.admissionNumber || 'N/A'}</Text>
                  </View>
                  {m ? (
                    m.absent ? (
                      <View style={styles.absentBadge}><Text style={styles.absentText}>ABSENT</Text></View>
                    ) : (
                      <View style={styles.marksSummary}>
                        <Text style={styles.marksTotal}>{m.total || 0}/{totalMax}</Text>
                        {gradeInfo && <Text style={[styles.grade, { color: gradeInfo.color }]}>{gradeInfo.grade}</Text>}
                      </View>
                    )
                  ) : (
                    <View style={styles.pendingBadge}><Text style={styles.pendingText}>Tap to enter</Text></View>
                  )}
                </TouchableOpacity>
              );
            })}

            <TouchableOpacity style={[styles.submitBtn, submitting && { opacity: 0.7 }]} onPress={submitMarks} disabled={submitting}>
              {submitting ? <ActivityIndicator size="small" color="#fff" /> : (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <MaterialCommunityIcons name="send" size={18} color="#fff" />
                  <Text style={styles.submitBtnText}>Submit Marks ({enteredCount} students)</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        ) : selectedClassId && selectedSectionId ? (
          <View style={styles.emptyCard}>
            <MaterialCommunityIcons name="account-multiple-remove" size={40} color="#bbb" />
            <Text style={styles.emptyText}>No students found</Text>
          </View>
        ) : null}

        <View style={{ height: 24 }} />
      </ScrollView>

      {/* Marks Entry Modal */}
      <Modal visible={modalVisible} transparent animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{currentStudent?.firstName} {currentStudent?.lastName}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={[styles.absentToggle, isAbsent && styles.absentToggleActive]} onPress={() => setIsAbsent(!isAbsent)}>
              <MaterialCommunityIcons name={isAbsent ? 'close-circle' : 'close-circle-outline'} size={20} color={isAbsent ? '#c62828' : '#888'} />
              <Text style={[styles.absentToggleText, isAbsent && { color: '#c62828' }]}>Mark as Absent</Text>
            </TouchableOpacity>

            {!isAbsent && (
              <>
                <View style={styles.marksRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.marksLabel}>Theory Marks (max {maxTheory})</Text>
                    <TextInput style={styles.marksInput} value={theoryInput} onChangeText={setTheoryInput} keyboardType="numeric" placeholder="0" />
                  </View>
                  {parseFloat(maxPractical) > 0 && (
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={styles.marksLabel}>Practical (max {maxPractical})</Text>
                      <TextInput style={styles.marksInput} value={practicalInput} onChangeText={setPracticalInput} keyboardType="numeric" placeholder="0" />
                    </View>
                  )}
                </View>
                {(theoryInput || practicalInput) && (
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Total: </Text>
                    <Text style={styles.totalValue}>{(parseFloat(theoryInput) || 0) + (parseFloat(practicalInput) || 0)}/{(parseFloat(maxTheory) || 0) + (parseFloat(maxPractical) || 0)}</Text>
                  </View>
                )}
              </>
            )}

            <TouchableOpacity style={styles.saveBtnModal} onPress={saveMarks}>
              <Text style={styles.saveBtnText}>Save Marks</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: '#6a1b9a', paddingTop: 44, paddingBottom: 20, paddingHorizontal: 16, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headerIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
  headerSub: { color: 'rgba(255,255,255,0.75)', fontSize: 12 },
  card: { backgroundColor: '#fff', borderRadius: 16, margin: 12, padding: 16, elevation: 2 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#1a237e', marginBottom: 4 },
  cardSub: { fontSize: 11, color: '#888', marginBottom: 12 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  enteredBadge: { backgroundColor: '#e8f5e9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  enteredBadgeText: { color: '#2e7d32', fontSize: 11, fontWeight: '700' },
  pickerLabel: { fontSize: 12, fontWeight: '600', color: '#555', marginTop: 10, marginBottom: 4 },
  pickerBox: { borderWidth: 1.5, borderColor: '#e0e0e0', borderRadius: 10, backgroundColor: '#fafafa' },
  picker: { height: 48 },
  maxRow: { flexDirection: 'row', marginTop: 4 },
  maxInput: { borderWidth: 1.5, borderColor: '#e0e0e0', borderRadius: 10, padding: 12, fontSize: 14, backgroundColor: '#fafafa' },
  loadingBox: { padding: 40, alignItems: 'center' },
  studentRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 4, borderRadius: 10, gap: 10 },
  studentRowAlt: { backgroundColor: '#f8f9fa' },
  studentNumber: { width: 22, alignItems: 'center' },
  studentNumberText: { fontSize: 11, color: '#aaa', fontWeight: '600' },
  studentAvatar: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#6a1b9a', alignItems: 'center', justifyContent: 'center' },
  studentAvatarText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  studentName: { fontSize: 14, fontWeight: '600', color: '#1a237e' },
  studentRoll: { fontSize: 11, color: '#888', marginTop: 1 },
  marksSummary: { alignItems: 'center' },
  marksTotal: { fontSize: 13, fontWeight: '700', color: '#333' },
  grade: { fontSize: 16, fontWeight: '800', marginTop: 2 },
  absentBadge: { backgroundColor: '#ffebee', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  absentText: { color: '#c62828', fontSize: 10, fontWeight: '700' },
  pendingBadge: { backgroundColor: '#f5f5f5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  pendingText: { color: '#aaa', fontSize: 10 },
  submitBtn: { backgroundColor: '#6a1b9a', borderRadius: 12, paddingVertical: 14, alignItems: 'center', justifyContent: 'center', marginTop: 16, elevation: 3 },
  submitBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  emptyCard: { margin: 16, backgroundColor: '#fff', borderRadius: 14, padding: 32, alignItems: 'center', elevation: 1 },
  emptyText: { color: '#aaa', marginTop: 10, fontSize: 13 },
  ctBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#f9a825', padding: 10, borderRadius: 10, marginTop: 10, marginBottom: 2 },
  ctBannerText: { color: '#fff', fontSize: 12, fontWeight: '700', flex: 1 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1a237e' },
  absentToggle: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 10, backgroundColor: '#f5f5f5', marginBottom: 16 },
  absentToggleActive: { backgroundColor: '#ffebee' },
  absentToggleText: { fontSize: 14, color: '#666', fontWeight: '600' },
  marksRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  marksLabel: { fontSize: 12, fontWeight: '600', color: '#555', marginBottom: 6 },
  marksInput: { borderWidth: 1.5, borderColor: '#e0e0e0', borderRadius: 10, padding: 12, fontSize: 16, backgroundColor: '#fafafa' },
  totalRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, padding: 12, backgroundColor: '#f3e5f5', borderRadius: 10 },
  totalLabel: { fontSize: 14, color: '#666' },
  totalValue: { fontSize: 18, fontWeight: '800', color: '#6a1b9a' },
  saveBtnModal: { backgroundColor: '#6a1b9a', borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
