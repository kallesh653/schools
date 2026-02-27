import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Title, Card, Text, Chip } from 'react-native-paper';
import { noticeAPI } from '../services/api';

export default function NoticeScreen() {
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const response = await noticeAPI.getAll();
      const teacherNotices = response.data.filter(
        notice => notice.targetAudience === 'ALL' || notice.targetAudience === 'TEACHERS'
      );
      setNotices(teacherNotices);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch notices');
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'ACADEMIC': return '#2196F3';
      case 'EXAM': return '#FF9800';
      case 'EVENT': return '#9C27B0';
      case 'HOLIDAY': return '#4CAF50';
      case 'FEE': return '#F44336';
      default: return '#757575';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'URGENT': return '#F44336';
      case 'HIGH': return '#FF9800';
      case 'NORMAL': return '#4CAF50';
      default: return '#757575';
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView>
        <Title style={styles.title}>Notices & Announcements</Title>

        {notices.length > 0 ? (
          notices.map((notice) => (
            <Card key={notice.id} style={styles.card}>
              <Card.Content>
                <View style={styles.cardHeader}>
                  <Title style={styles.noticeTitle}>{notice.title}</Title>
                  <View style={styles.chipContainer}>
                    <Chip mode="flat" style={{ backgroundColor: getTypeColor(notice.noticeType), marginBottom: 4 }} textStyle={{ color: 'white', fontSize: 12 }}>
                      {notice.noticeType || 'INFO'}
                    </Chip>
                    <Chip mode="flat" style={{ backgroundColor: getPriorityColor(notice.priority) }} textStyle={{ color: 'white', fontSize: 12 }}>
                      {notice.priority}
                    </Chip>
                  </View>
                </View>
                <Text style={styles.content}>{notice.content}</Text>
                <View style={styles.metaRow}>
                  <Text style={styles.metaLabel}>Published: </Text>
                  <Text style={styles.metaValue}>{notice.publishDate}</Text>
                </View>
                {notice.expiryDate && (
                  <View style={styles.metaRow}>
                    <Text style={styles.metaLabel}>Valid Until: </Text>
                    <Text style={styles.metaValue}>{notice.expiryDate}</Text>
                  </View>
                )}
              </Card.Content>
            </Card>
          ))
        ) : (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.noData}>No notices available</Text>
            </Card.Content>
          </Card>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, marginTop: 16, marginLeft: 16, marginBottom: 8 },
  card: { margin: 16, marginTop: 8, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  noticeTitle: { fontSize: 18, flex: 1, marginRight: 8 },
  chipContainer: { alignItems: 'flex-end' },
  content: { fontSize: 14, color: '#666', lineHeight: 20, marginBottom: 12 },
  metaRow: { flexDirection: 'row', marginVertical: 2 },
  metaLabel: { fontSize: 13, fontWeight: 'bold', color: '#333' },
  metaValue: { fontSize: 13, color: '#666' },
  noData: { textAlign: 'center', padding: 16, color: '#666' },
});
