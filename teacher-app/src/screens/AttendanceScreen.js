import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Title, Card, Button, DataTable, Chip, Portal, Dialog, RadioButton, Text } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { attendanceAPI, classAPI, sectionAPI, studentAPI } from '../services/api';

export default function AttendanceScreen() {
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [visible, setVisible] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('PRESENT');

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchSections();
      setSelectedSection('');
      setAttendanceData([]);
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

  const fetchStudents = async () => {
    try {
      const response = await studentAPI.getByClassAndSection(selectedClass, selectedSection);
      const initialData = response.data.map(student => ({
        studentId: student.id,
        studentName: `${student.firstName} ${student.lastName}`,
        status: 'PRESENT',
      }));
      setAttendanceData(initialData);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch students');
    }
  };

  const openStatusDialog = (student) => {
    setCurrentStudent(student);
    setSelectedStatus(student.status);
    setVisible(true);
  };

  const saveStatus = () => {
    const updatedData = attendanceData.map(item =>
      item.studentId === currentStudent.studentId
        ? { ...item, status: selectedStatus }
        : item
    );
    setAttendanceData(updatedData);
    setVisible(false);
  };

  const submitAttendance = async () => {
    if (!selectedClass || !selectedSection) {
      Alert.alert('Error', 'Please select class and section');
      return;
    }
    try {
      const bulkData = attendanceData.map(data => ({
        student: { id: data.studentId },
        date: selectedDate,
        status: data.status,
        schoolClass: { id: parseInt(selectedClass) },
        section: { id: parseInt(selectedSection) },
      }));
      await attendanceAPI.mark(bulkData);
      Alert.alert('Success', `Attendance marked for ${bulkData.length} students`);
    } catch (error) {
      Alert.alert('Error', 'Failed to mark attendance');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <Title style={styles.title}>Mark Attendance</Title>

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

            <Text style={styles.label}>Date: {selectedDate}</Text>
          </Card.Content>
        </Card>

        {attendanceData.length > 0 && (
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.subtitle}>Students</Title>
              <DataTable>
                <DataTable.Header>
                  <DataTable.Title>Student Name</DataTable.Title>
                  <DataTable.Title>Status</DataTable.Title>
                </DataTable.Header>
                {attendanceData.map((item) => (
                  <DataTable.Row key={item.studentId} onPress={() => openStatusDialog(item)}>
                    <DataTable.Cell>{item.studentName}</DataTable.Cell>
                    <DataTable.Cell>
                      <Chip
                        mode="flat"
                        style={{
                          backgroundColor:
                            item.status === 'PRESENT' ? '#4CAF50' :
                            item.status === 'ABSENT' ? '#F44336' : '#FF9800',
                        }}
                        textStyle={{ color: 'white' }}>
                        {item.status}
                      </Chip>
                    </DataTable.Cell>
                  </DataTable.Row>
                ))}
              </DataTable>
              <Button mode="contained" onPress={submitAttendance} style={styles.submitButton}>
                Submit Attendance
              </Button>
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      <Portal>
        <Dialog visible={visible} onDismiss={() => setVisible(false)}>
          <Dialog.Title>Mark Attendance</Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogText}>{currentStudent?.studentName}</Text>
            <RadioButton.Group onValueChange={setSelectedStatus} value={selectedStatus}>
              <RadioButton.Item label="Present" value="PRESENT" />
              <RadioButton.Item label="Absent" value="ABSENT" />
              <RadioButton.Item label="Late" value="LATE" />
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setVisible(false)}>Cancel</Button>
            <Button onPress={saveStatus}>Save</Button>
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
});
