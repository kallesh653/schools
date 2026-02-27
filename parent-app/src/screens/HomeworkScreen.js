import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Card, Text, Chip } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { parentAPI, studentAPI, homeworkAPI } from '../services/api';
import ScreenHeader from '../components/ScreenHeader';

const PRIORITY_COLORS = {
  HIGH: '#F44336',
  MEDIUM: '#FF9800',
  LOW: '#4CAF50',
};

export default function HomeworkScreen({ navigation }) {
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState('');
  const [homeworks, setHomeworks] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filterPriority, setFilterPriority] = useState('ALL');

  useEffect(() => { fetchChildren(); }, []);

  useEffect(() => {
    if (selectedChild) fetchHomework();
  }, [selectedChild]);

  const fetchChildren = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      const user = JSON.parse(userData);
      const response = await parentAPI.getChildren(user.entityId);
      setChildren(response.data);
      if (response.data.length > 0) setSelectedChild(response.data[0].id.toString());
    } catch (error) {
      console.error('Error fetching children:', error);
    }
  };

  const fetchHomework = async () => {
    try {
      const studentResponse = await studentAPI.getById(selectedChild);
      const student = studentResponse.data;
      const homeworkResponse = await homeworkAPI.getByClass(student.schoolClass.id);
      const filteredHomework = homeworkResponse.data.filter(
        hw => !hw.section || hw.section.id === student.section?.id
      );
      filteredHomework.sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate) - new Date(b.dueDate);
      });
      setHomeworks(filteredHomework);
    } catch (error) {
      console.error('Error fetching homework:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchChildren();
    if (selectedChild) await fetchHomework();
    setRefreshing(false);
  };

  const getPriorityColor = (priority) => PRIORITY_COLORS[priority] || '#757575';
  const isOverdue = (dueDate) => dueDate && new Date(dueDate) < new Date();

  const filteredHomeworks = filterPriority === 'ALL'
    ? homeworks
    : homeworks.filter(hw => hw.priority === filterPriority);

  const overdueCount = homeworks.filter(hw => isOverdue(hw.dueDate)).length;
  const pendingCount = homeworks.filter(hw => hw.dueDate && !isOverdue(hw.dueDate)).length;

  return (
    <View style={styles.container}>
      <ScreenHeader title="Homework" navigation={navigation} onRefresh={handleRefresh} refreshing={refreshing} />
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.label}>Select Child</Text>
            <View style={styles.pickerWrapper}>
              <Picker selectedValue={selectedChild} onValueChange={v => { setSelectedChild(v); setFilterPriority('ALL'); }} style={styles.picker}>
                {children.map(child => (
                  <Picker.Item key={child.id} label={`${child.firstName} ${child.lastName}`} value={child.id.toString()} />
                ))}
              </Picker>
            </View>
          </Card.Content>
        </Card>

        {selectedChild && (
          <>
            {homeworks.length > 0 && (
              <Card style={styles.card}>
                <Card.Content>
                  <View style={styles.cardTitleRow}>
                    <MaterialCommunityIcons name="clipboard-list" size={20} color="#1976d2" />
                    <Text style={styles.cardTitle}>Homework Summary</Text>
                  </View>
                  <View style={styles.summaryRow}>
                    <View style={styles.summaryItem}>
                      <Text style={[styles.summaryValue, { color: '#1976d2' }]}>{homeworks.length}</Text>
                      <Text style={styles.summaryLabel}>Total</Text>
                    </View>
                    <View style={styles.summaryDivider} />
                    <View style={styles.summaryItem}>
                      <Text style={[styles.summaryValue, { color: '#4CAF50' }]}>{pendingCount}</Text>
                      <Text style={styles.summaryLabel}>Pending</Text>
                    </View>
                    <View style={styles.summaryDivider} />
                    <View style={styles.summaryItem}>
                      <Text style={[styles.summaryValue, { color: '#F44336' }]}>{overdueCount}</Text>
                      <Text style={styles.summaryLabel}>Overdue</Text>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            )}

            {homeworks.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={{ paddingHorizontal: 12, gap: 8 }}>
                {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map(p => (
                  <Chip
                    key={p}
                    mode={filterPriority === p ? 'flat' : 'outlined'}
                    style={[styles.filterChip, filterPriority === p && { backgroundColor: PRIORITY_COLORS[p] || '#1976d2' }]}
                    textStyle={{ color: filterPriority === p ? 'white' : '#555', fontWeight: filterPriority === p ? '700' : '400', fontSize: 12 }}
                    onPress={() => setFilterPriority(p)}
                  >
                    {p === 'ALL' ? `All (${homeworks.length})` : `${p} (${homeworks.filter(h => h.priority === p).length})`}
                  </Chip>
                ))}
              </ScrollView>
            )}

            {filteredHomeworks.length > 0 ? filteredHomeworks.map((homework) => (
              <Card key={homework.id} style={[styles.card, isOverdue(homework.dueDate) && styles.overdueCard]}>
                <Card.Content>
                  <View style={styles.cardHeader}>
                    <Text style={styles.homeworkTitle} numberOfLines={2}>{homework.title}</Text>
                    <Chip
                      mode="flat"
                      style={{ backgroundColor: getPriorityColor(homework.priority) }}
                      textStyle={{ color: 'white', fontWeight: '700', fontSize: 11 }}
                      compact
                    >
                      {homework.priority || 'NORMAL'}
                    </Chip>
                  </View>

                  {homework.description ? (
                    <Text style={styles.description}>{homework.description}</Text>
                  ) : null}

                  <View style={styles.metaGrid}>
                    <View style={styles.metaItem}>
                      <MaterialCommunityIcons name="book-open" size={14} color="#888" />
                      <Text style={styles.metaLabel}>{homework.subject?.name || '-'}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <MaterialCommunityIcons name="account" size={14} color="#888" />
                      <Text style={styles.metaLabel}>{homework.teacher?.firstName} {homework.teacher?.lastName}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <MaterialCommunityIcons name="school" size={14} color="#888" />
                      <Text style={styles.metaLabel}>{homework.schoolClass?.name}{homework.section ? ` - ${homework.section.name}` : ''}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <MaterialCommunityIcons name="calendar-clock" size={14} color={isOverdue(homework.dueDate) ? '#F44336' : '#888'} />
                      <Text style={[styles.metaLabel, isOverdue(homework.dueDate) && styles.overdueText]}>
                        {homework.dueDate || 'No due date'}{isOverdue(homework.dueDate) ? ' · Overdue' : ''}
                      </Text>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            )) : (
              <Card style={styles.card}>
                <Card.Content style={styles.emptyState}>
                  <MaterialCommunityIcons name="clipboard-text-outline" size={48} color="#bdbdbd" />
                  <Text style={styles.emptyText}>No homework assignments available</Text>
                </Card.Content>
              </Card>
            )}
          </>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  card: { margin: 12, marginTop: 8, elevation: 2, borderRadius: 12 },
  overdueCard: { borderLeftWidth: 4, borderLeftColor: '#F44336' },
  label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 4 },
  pickerWrapper: { backgroundColor: '#f8f9fa', borderRadius: 8, borderWidth: 1, borderColor: '#e0e0e0' },
  picker: { backgroundColor: 'transparent' },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#1976d2' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginVertical: 8 },
  summaryItem: { alignItems: 'center', flex: 1 },
  summaryDivider: { width: 1, height: 36, backgroundColor: '#e0e0e0' },
  summaryValue: { fontSize: 26, fontWeight: '800' },
  summaryLabel: { fontSize: 12, color: '#888', marginTop: 2 },
  filterRow: { marginBottom: 4 },
  filterChip: { marginRight: 4 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, gap: 8 },
  homeworkTitle: { fontSize: 15, fontWeight: '700', flex: 1, color: '#1a237e', lineHeight: 21 },
  description: { fontSize: 13, color: '#666', marginBottom: 10, lineHeight: 19 },
  metaGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4, minWidth: '45%', flex: 1 },
  metaLabel: { fontSize: 12, color: '#666', flex: 1 },
  overdueText: { color: '#F44336', fontWeight: '700' },
  emptyState: { alignItems: 'center', padding: 24 },
  emptyText: { fontSize: 14, color: '#888', marginTop: 12, textAlign: 'center' },
});
