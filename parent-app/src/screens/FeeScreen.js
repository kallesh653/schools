import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { Card, DataTable, Text, Chip, ProgressBar } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { parentAPI, feeAPI } from '../services/api';
import ScreenHeader from '../components/ScreenHeader';

export default function FeeScreen({ navigation }) {
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState('');
  const [feeStatus, setFeeStatus] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { fetchChildren(); }, []);

  useEffect(() => {
    if (selectedChild) fetchFeeStatus();
  }, [selectedChild]);

  const fetchChildren = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      const user = JSON.parse(userData);
      const parentId = user?.entityId;
      if (!parentId) return;
      const response = await parentAPI.getChildren(parentId);
      setChildren(response.data || []);
      if (response.data?.length > 0) {
        setSelectedChild(response.data[0].id.toString());
      }
    } catch (error) {
      console.error('Error fetching children:', error);
    }
  };

  const fetchFeeStatus = async () => {
    try {
      const response = await feeAPI.getStatusByStudent(selectedChild);
      setFeeStatus(response.data);
    } catch (error) {
      console.error('Error fetching fee status:', error);
      setFeeStatus(null);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchChildren();
    if (selectedChild) await fetchFeeStatus();
    setRefreshing(false);
  };

  const totalFee = parseFloat(feeStatus?.totalFee || 0);
  const paidAmount = parseFloat(feeStatus?.paidAmount || 0);
  const pendingAmount = parseFloat(feeStatus?.pendingAmount || 0);
  const payments = feeStatus?.payments || [];
  const feeStructure = feeStatus?.feeStructure;
  const paymentPercentage = totalFee > 0 ? (paidAmount / totalFee) * 100 : 0;

  return (
    <View style={styles.container}>
      <ScreenHeader title="Fee Management" navigation={navigation} onRefresh={handleRefresh} refreshing={refreshing} />
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.label}>Select Child</Text>
            <Picker selectedValue={selectedChild} onValueChange={setSelectedChild} style={styles.picker}>
              {children.map(child => (
                <Picker.Item key={child.id} label={`${child.firstName} ${child.lastName}`} value={child.id.toString()} />
              ))}
            </Picker>
          </Card.Content>
        </Card>

        {selectedChild && (
          <>
            <Card style={styles.card}>
              <Card.Content>
                <Text style={styles.subtitle}>Fee Summary</Text>
                <View style={styles.summaryRow}>
                  <View style={styles.summaryItem}>
                    <Text style={styles.summaryValue}>₹{totalFee.toLocaleString()}</Text>
                    <Text style={styles.summaryLabel}>Total Fee</Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={[styles.summaryValue, { color: '#4CAF50' }]}>₹{paidAmount.toLocaleString()}</Text>
                    <Text style={styles.summaryLabel}>Paid</Text>
                  </View>
                  <View style={styles.summaryItem}>
                    <Text style={[styles.summaryValue, { color: '#F44336' }]}>₹{pendingAmount.toLocaleString()}</Text>
                    <Text style={styles.summaryLabel}>Pending</Text>
                  </View>
                </View>
                <Text style={styles.percentageLabel}>Payment Progress: {paymentPercentage.toFixed(1)}%</Text>
                <ProgressBar
                  progress={Math.min(paymentPercentage / 100, 1)}
                  color={paymentPercentage >= 100 ? '#4CAF50' : '#FF9800'}
                  style={styles.progressBar}
                />
              </Card.Content>
            </Card>

            {feeStructure && (
              <Card style={styles.card}>
                <Card.Content>
                  <Text style={styles.subtitle}>Fee Structure</Text>
                  {[
                    ['Tuition Fee', feeStructure.tuitionFee],
                    ['Admission Fee', feeStructure.admissionFee],
                    ['Exam Fee', feeStructure.examFee],
                    ['Transport Fee', feeStructure.transportFee],
                    ['Library Fee', feeStructure.libraryFee],
                    ['Lab Fee', feeStructure.labFee],
                    ['Sports Fee', feeStructure.sportsFee],
                    ['Other Fee', feeStructure.otherFee],
                  ].filter(([, val]) => val && parseFloat(val) > 0).map(([label, value]) => (
                    <View key={label} style={styles.feeRow}>
                      <Text style={styles.feeLabel}>{label}:</Text>
                      <Text style={styles.feeValue}>₹{parseFloat(value).toLocaleString()}</Text>
                    </View>
                  ))}
                  <View style={[styles.feeRow, styles.totalRow]}>
                    <Text style={styles.totalLabel}>Total:</Text>
                    <Text style={styles.totalValue}>₹{parseFloat(feeStructure.totalFee || 0).toLocaleString()}</Text>
                  </View>
                </Card.Content>
              </Card>
            )}

            <Card style={styles.card}>
              <Card.Content>
                <Text style={styles.subtitle}>Payment History</Text>
                {payments.length > 0 ? (
                  <DataTable>
                    <DataTable.Header>
                      <DataTable.Title>Date</DataTable.Title>
                      <DataTable.Title numeric>Amount</DataTable.Title>
                      <DataTable.Title>Mode</DataTable.Title>
                    </DataTable.Header>
                    {payments.map((payment) => (
                      <DataTable.Row key={payment.id}>
                        <DataTable.Cell>{payment.paymentDate || '-'}</DataTable.Cell>
                        <DataTable.Cell numeric>₹{parseFloat(payment.amount || 0).toLocaleString()}</DataTable.Cell>
                        <DataTable.Cell>
                          <Chip mode="flat" style={styles.modeChip} textStyle={{ fontSize: 11 }}>
                            {payment.paymentMode}
                          </Chip>
                        </DataTable.Cell>
                      </DataTable.Row>
                    ))}
                  </DataTable>
                ) : (
                  <Text style={styles.noData}>No payment history available</Text>
                )}
              </Card.Content>
            </Card>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  subtitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#333' },
  card: { margin: 16, marginTop: 8, elevation: 2 },
  label: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
  picker: { backgroundColor: '#fff' },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-around', marginVertical: 12 },
  summaryItem: { alignItems: 'center' },
  summaryValue: { fontSize: 22, fontWeight: 'bold', color: '#1976d2' },
  summaryLabel: { fontSize: 13, color: '#666', marginTop: 4 },
  percentageLabel: { fontSize: 15, fontWeight: 'bold', marginTop: 12, marginBottom: 8 },
  progressBar: { height: 8, borderRadius: 4 },
  feeRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  feeLabel: { fontSize: 14, color: '#666' },
  feeValue: { fontSize: 14, fontWeight: '500' },
  totalRow: { marginTop: 8, paddingTop: 12, borderTopWidth: 2, borderTopColor: '#1976d2', borderBottomWidth: 0 },
  totalLabel: { fontSize: 16, fontWeight: 'bold', color: '#1976d2' },
  totalValue: { fontSize: 16, fontWeight: 'bold', color: '#1976d2' },
  modeChip: { backgroundColor: '#E3F2FD' },
  noData: { textAlign: 'center', padding: 16, color: '#666' },
});
