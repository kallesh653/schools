import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Title, Card, Button, DataTable, TextInput, Portal, Dialog, Text } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { marksAPI, classAPI, sectionAPI, subjectAPI, examinationAPI, studentAPI } from '../services/api';

export default function MarksScreen() {
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [examinations, setExaminations] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedExam, setSelectedExam] = useState('');
  const [marksData, setMarksData] = useState([]);
  const [visible, setVisible] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [theoryMarks, setTheoryMarks] = useState('');
  const [practicalMarks, setPracticalMarks] = useState('');

  useEffect(() => {
    fetchClasses();
    fetchSubjects();
    fetchExaminations();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchSections();
      setSelectedSection('');
      setMarksData([]);
    }
  }, [selectedClass]);

  useEffect(() => {
    if (selectedClass && selectedSection) {
      fetchStudents();
    }
  }, [selectedClass, selectedSection]);

  const fetchClasses = async () => {
    try {
      const response = await classAPI.getAll();
      setClasses(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch classes');
    }
  };

  const fetchSections = async () => {
    try {
      const response = await sectionAPI.getByClass(selectedClass);
      setSections(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch sections');
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await subjectAPI.getAll();
      setSubjects(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch subjects');
    }
  };

  const fetchExaminations = async () => {
    try {
      const response = await examinationAPI.getAll();
      setExaminations(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch examinations');
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await studentAPI.getByClassAndSection(selectedClass, selectedSection);
      const initialData = response.data.map(student => ({
        studentId: student.id,
        studentName: `${student.firstName} ${student.lastName}`,
        theoryMarks: '',
        practicalMarks: '',
        totalMarks: '',
      }));
      setMarksData(initialData);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch students');
    }
  };

  const openMarksDialog = (student) => {
    setCurrentStudent(student);
    const existing = marksData.find(m => m.studentId === student.studentId);
    setTheoryMarks(existing?.theoryMarks?.toString() || '');
    setPracticalMarks(existing?.practicalMarks?.toString() || '');
    setVisible(true);
  };

  const saveMarks = () => {
    const theory = parseFloat(theoryMarks) || 0;
    const practical = parseFloat(practicalMarks) || 0;
    const total = theory + practical;
    const updatedData = marksData.map(item =>
      item.studentId === currentStudent.studentId
        ? { ...item, theoryMarks: theory, practicalMarks: practical, totalMarks: total }
        : item
    );
    setMarksData(updatedData);
    setVisible(false);
    setTheoryMarks('');
    setPracticalMarks('');
  };

  const submitMarks = async () => {
    if (!selectedClass || !selectedSection || !selectedSubject || !selectedExam) {
      Alert.alert('Error', 'Please select all fields');
      return;
    }
    try {
      for (const data of marksData) {
        if (data.theoryMarks || data.practicalMarks) {
          await marksAPI.create({
            student: { id: data.studentId },
            examination: { id: parseInt(selectedExam) },
            subject: { id: parseInt(selectedSubject) },
            theoryMarks: data.theoryMarks || 0,
            practicalMarks: data.practicalMarks || 0,
            totalMarks: data.totalMarks,
            isAbsent: false,
          });
        }
      }
      Alert.alert('Success', 'Marks submitted successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to submit marks');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <Title style={styles.title}>Enter Marks</Title>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.label}>Class</Text>
            <Picker selectedValue={selectedClass} onValueChange={setSelectedClass} style={styles.picker}>
              <Picker.Item label="Select Class" value="" />
              {classes.map(cls => (
                <Picker.Item key={cls.id} label={cls.name} value={cls.id.toString()} />
              ))}
            </Picker>

            {selectedClass && (
              <>
                <Text style={styles.label}>Section</Text>
                <Picker selectedValue={selectedSection} onValueChange={setSelectedSection} style={styles.picker}>
                  <Picker.Item label="Select Section" value="" />
                  {sections.map(sec => (
                    <Picker.Item key={sec.id} label={sec.name} value={sec.id.toString()} />
                  ))}
                </Picker>
              </>
            )}

            <Text style={styles.label}>Examination</Text>
            <Picker selectedValue={selectedExam} onValueChange={setSelectedExam} style={styles.picker}>
              <Picker.Item label="Select Examination" value="" />
              {examinations.map(exam => (
                <Picker.Item key={exam.id} label={exam.name} value={exam.id.toString()} />
              ))}
            </Picker>

            <Text style={styles.label}>Subject</Text>
            <Picker selectedValue={selectedSubject} onValueChange={setSelectedSubject} style={styles.picker}>
              <Picker.Item label="Select Subject" value="" />
              {subjects.map(sub => (
                <Picker.Item key={sub.id} label={sub.name} value={sub.id.toString()} />
              ))}
            </Picker>
          </Card.Content>
        </Card>

        {marksData.length > 0 && (
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.subtitle}>Students</Title>
              <DataTable>
                <DataTable.Header>
                  <DataTable.Title>Name</DataTable.Title>
                  <DataTable.Title numeric>Theory</DataTable.Title>
                  <DataTable.Title numeric>Practical</DataTable.Title>
                  <DataTable.Title numeric>Total</DataTable.Title>
                </DataTable.Header>
                {marksData.map((item) => (
                  <DataTable.Row key={item.studentId} onPress={() => openMarksDialog(item)}>
                    <DataTable.Cell>{item.studentName}</DataTable.Cell>
                    <DataTable.Cell numeric>{item.theoryMarks || '-'}</DataTable.Cell>
                    <DataTable.Cell numeric>{item.practicalMarks || '-'}</DataTable.Cell>
                    <DataTable.Cell numeric>{item.totalMarks || '-'}</DataTable.Cell>
                  </DataTable.Row>
                ))}
              </DataTable>
              <Button mode="contained" onPress={submitMarks} style={styles.submitButton}>
                Submit Marks
              </Button>
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      <Portal>
        <Dialog visible={visible} onDismiss={() => setVisible(false)}>
          <Dialog.Title>Enter Marks</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogText}>{currentStudent?.studentName}</Text>
            <TextInput label="Theory Marks" value={theoryMarks} onChangeText={setTheoryMarks} keyboardType="numeric" mode="outlined" style={styles.input} />
            <TextInput label="Practical Marks" value={practicalMarks} onChangeText={setPracticalMarks} keyboardType="numeric" mode="outlined" style={styles.input} />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setVisible(false)}>Cancel</Button>
            <Button onPress={saveMarks}>Save</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, marginTop: 16, marginLeft: 16, marginBottom: 8 },
  subtitle: { fontSize: 18, marginBottom: 12 },
  card: { margin: 16, elevation: 2 },
  label: { fontSize: 16, fontWeight: 'bold', marginTop: 12, marginBottom: 4 },
  picker: { backgroundColor: '#fff', marginBottom: 8 },
  submitButton: { marginTop: 16 },
  dialogText: { fontSize: 16, marginBottom: 12 },
  input: { marginBottom: 12 },
});
