import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Title, Card, Button, FAB, Portal, Dialog, TextInput, Text, Chip } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { homeworkAPI, classAPI, sectionAPI, subjectAPI } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeworkScreen() {
  const [homeworks, setHomeworks] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [visible, setVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('MEDIUM');

  useEffect(() => {
    fetchHomeworks();
    fetchClasses();
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchSections();
    }
  }, [selectedClass]);

  const fetchHomeworks = async () => {
    try {
      const response = await homeworkAPI.getAll();
      setHomeworks(response.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch homework');
    }
  };

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

  const handleCreate = async () => {
    if (!title || !description || !selectedClass || !selectedSection || !selectedSubject || !dueDate) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    try {
      const userData = await AsyncStorage.getItem('user');
      const user = JSON.parse(userData);
      await homeworkAPI.create({
        title,
        description,
        dueDate,
        priority,
        teacher: { id: user.entityId },
        subject: { id: parseInt(selectedSubject) },
        schoolClass: { id: parseInt(selectedClass) },
        section: { id: parseInt(selectedSection) },
      });
      Alert.alert('Success', 'Homework created successfully');
      setVisible(false);
      resetForm();
      fetchHomeworks();
    } catch (error) {
      Alert.alert('Error', 'Failed to create homework');
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setSelectedClass('');
    setSelectedSection('');
    setSelectedSubject('');
    setDueDate('');
    setPriority('MEDIUM');
  };

  const getPriorityColor = (p) => {
    switch (p) {
      case 'HIGH': return '#F44336';
      case 'MEDIUM': return '#FF9800';
      case 'LOW': return '#4CAF50';
      default: return '#757575';
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <Title style={styles.title}>Homework</Title>

        {homeworks.map((homework) => (
          <Card key={homework.id} style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <Title style={styles.homeworkTitle}>{homework.title}</Title>
                <Chip mode="flat" style={{ backgroundColor: getPriorityColor(homework.priority) }} textStyle={{ color: 'white' }}>
                  {homework.priority}
                </Chip>
              </View>
              <Text style={styles.description}>{homework.description}</Text>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Class: </Text>
                <Text>{homework.schoolClass?.name} - {homework.section?.name}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Subject: </Text>
                <Text>{homework.subject?.name}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Due Date: </Text>
                <Text>{homework.dueDate}</Text>
              </View>
            </Card.Content>
          </Card>
        ))}

        {homeworks.length === 0 && (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.emptyText}>No homework assignments yet</Text>
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      <FAB style={styles.fab} icon="plus" onPress={() => setVisible(true)} />

      <Portal>
        <Dialog visible={visible} onDismiss={() => setVisible(false)} style={styles.dialog}>
          <Dialog.Title>Create Homework</Dialog.Title>
          <Dialog.ScrollArea>
            <ScrollView>
              <View style={styles.dialogContent}>
                <TextInput label="Title" value={title} onChangeText={setTitle} mode="outlined" style={styles.input} />
                <TextInput label="Description" value={description} onChangeText={setDescription} mode="outlined" multiline numberOfLines={3} style={styles.input} />

                <Text style={styles.formLabel}>Class</Text>
                <Picker selectedValue={selectedClass} onValueChange={setSelectedClass} style={styles.picker}>
                  <Picker.Item label="Select Class" value="" />
                  {classes.map(cls => (
                    <Picker.Item key={cls.id} label={cls.name} value={cls.id.toString()} />
                  ))}
                </Picker>

                {selectedClass && (
                  <>
                    <Text style={styles.formLabel}>Section</Text>
                    <Picker selectedValue={selectedSection} onValueChange={setSelectedSection} style={styles.picker}>
                      <Picker.Item label="Select Section" value="" />
                      {sections.map(sec => (
                        <Picker.Item key={sec.id} label={sec.name} value={sec.id.toString()} />
                      ))}
                    </Picker>
                  </>
                )}

                <Text style={styles.formLabel}>Subject</Text>
                <Picker selectedValue={selectedSubject} onValueChange={setSelectedSubject} style={styles.picker}>
                  <Picker.Item label="Select Subject" value="" />
                  {subjects.map(sub => (
                    <Picker.Item key={sub.id} label={sub.name} value={sub.id.toString()} />
                  ))}
                </Picker>

                <TextInput label="Due Date (YYYY-MM-DD)" value={dueDate} onChangeText={setDueDate} mode="outlined" placeholder="2024-12-31" style={styles.input} />

                <Text style={styles.formLabel}>Priority</Text>
                <Picker selectedValue={priority} onValueChange={setPriority} style={styles.picker}>
                  <Picker.Item label="Low" value="LOW" />
                  <Picker.Item label="Medium" value="MEDIUM" />
                  <Picker.Item label="High" value="HIGH" />
                </Picker>
              </View>
            </ScrollView>
          </Dialog.ScrollArea>
          <Dialog.Actions>
            <Button onPress={() => { setVisible(false); resetForm(); }}>Cancel</Button>
            <Button onPress={handleCreate}>Create</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, marginTop: 16, marginLeft: 16, marginBottom: 8 },
  card: { margin: 16, marginTop: 8, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  homeworkTitle: { fontSize: 18, flex: 1 },
  description: { fontSize: 14, color: '#666', marginBottom: 12 },
  infoRow: { flexDirection: 'row', marginVertical: 4 },
  infoLabel: { fontWeight: 'bold', fontSize: 14 },
  emptyText: { textAlign: 'center', padding: 12, color: '#666' },
  fab: { position: 'absolute', margin: 16, right: 0, bottom: 0, backgroundColor: '#1976d2' },
  dialog: { maxHeight: '85%' },
  dialogContent: { padding: 8 },
  formLabel: { fontWeight: 'bold', fontSize: 14, marginTop: 8, marginBottom: 4 },
  input: { marginBottom: 12 },
  picker: { backgroundColor: '#fff', marginBottom: 12 },
});
