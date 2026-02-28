import React, { useState, useEffect, useRef } from 'react';
import {
  View, StyleSheet, ScrollView, RefreshControl, Animated,
} from 'react-native';
import { Text, Chip } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { parentAPI, feeAPI } from '../services/api';
import ScreenHeader from '../components/ScreenHeader';
import { markSeen, SECTIONS } from '../utils/notifications';

const FEE_COMPONENTS = [
  { key: 'tuitionFee', label: 'Tuition Fee', icon: 'school', color: '#1976d2' },
  { key: 'admissionFee', label: 'Admission Fee', icon: 'file-account', color: '#7b1fa2' },
  { key: 'examFee', label: 'Exam Fee', icon: 'pencil-box', color: '#e65100' },
  { key: 'transportFee', label: 'Transport Fee', icon: 'bus', color: '#00838f' },
  { key: 'libraryFee', label: 'Library Fee', icon: 'book-multiple', color: '#2e7d32' },
  { key: 'labFee', label: 'Laboratory Fee', icon: 'flask', color: '#ad1457' },
  { key: 'sportsFee', label: 'Sports Fee', icon: 'run', color: '#f57f17' },
  { key: 'otherFee', label: 'Other Charges', icon: 'dots-horizontal-circle', color: '#546e7a' },
];

const PAYMENT_MODE_COLORS = {
  CASH: { bg: '#e8f5e9', text: '#2e7d32', icon: 'cash' },
  ONLINE: { bg: '#e3f2fd', text: '#1565c0', icon: 'bank-transfer' },
  CHEQUE: { bg: '#fff3e0', text: '#e65100', icon: 'checkbook' },
  DD: { bg: '#f3e5f5', text: '#6a1b9a', icon: 'file-document' },
  CARD: { bg: '#fce4ec', text: '#ad1457', icon: 'credit-card' },
  UPI: { bg: '#e0f7fa', text: '#006064', icon: 'qrcode-scan' },
};

function AnimatedProgressRing({ percentage, color, size = 100 }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: percentage,
      duration: 900,
      useNativeDriver: false,
    }).start();
  }, [percentage]);

  const pct = Math.min(Math.max(percentage, 0), 100);
  const radius = size / 2 - 8;
  const circumference = 2 * Math.PI * radius;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* Background ring */}
      <View style={{
        position: 'absolute',
        width: size - 16, height: size - 16, borderRadius: (size - 16) / 2,
        borderWidth: 8, borderColor: '#e0e0e0',
      }} />
      {/* Filled ring using border trick */}
      <View style={{
        position: 'absolute',
        width: size - 16, height: size - 16, borderRadius: (size - 16) / 2,
        borderWidth: 8,
        borderColor: 'transparent',
        borderTopColor: pct > 0 ? color : 'transparent',
        borderRightColor: pct > 25 ? color : 'transparent',
        borderBottomColor: pct > 50 ? color : 'transparent',
        borderLeftColor: pct > 75 ? color : 'transparent',
        transform: [{ rotate: '-90deg' }],
      }} />
      <View style={{ alignItems: 'center' }}>
        <Text style={{ fontSize: 18, fontWeight: '900', color }}>{pct.toFixed(0)}%</Text>
        <Text style={{ fontSize: 9, color: '#888', fontWeight: '600' }}>PAID</Text>
      </View>
    </View>
  );
}

export default function FeeScreen({ navigation }) {
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState('');
  const [feeStatus, setFeeStatus] = useState(null);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    fetchChildren();
    markSeen(SECTIONS.FEES);
  }, []);

  useEffect(() => {
    if (selectedChild) {
      setFeeStatus(null);
      setError(null);
      fetchFeeStatus();
    }
  }, [selectedChild]);

  const animateIn = () => {
    fadeAnim.setValue(0);
    slideAnim.setValue(20);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 80, friction: 9, useNativeDriver: true }),
    ]).start();
  };

  const fetchChildren = async () => {
    try {
      const userData = await AsyncStorage.getItem('user');
      const user = JSON.parse(userData);
      if (!user?.entityId) return;
      const res = await parentAPI.getChildren(user.entityId);
      setChildren(res.data || []);
      if (res.data?.length > 0) setSelectedChild(res.data[0].id.toString());
    } catch (e) {
      console.error('Error fetching children:', e);
    }
  };

  const fetchFeeStatus = async () => {
    setLoading(true);
    try {
      const res = await feeAPI.getStatusByStudent(selectedChild);
      setFeeStatus(res.data);
      setError(null);
      animateIn();
    } catch (e) {
      const msg = e?.response?.data?.message || e?.message || 'Failed to load fee information';
      setError(msg);
      setFeeStatus(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchChildren();
    if (selectedChild) await fetchFeeStatus();
    setRefreshing(false);
  };

  // Parse fee data
  const totalFee = parseFloat(feeStatus?.totalFee || 0);
  const paidAmount = parseFloat(feeStatus?.paidAmount || 0);
  const pendingAmount = parseFloat(feeStatus?.pendingAmount || 0);
  const payments = feeStatus?.payments || [];
  const feeStructure = feeStatus?.feeStructure;
  const paymentPct = totalFee > 0 ? (paidAmount / totalFee) * 100 : 0;
  const progressColor = paymentPct >= 100 ? '#4CAF50' : paymentPct >= 50 ? '#FF9800' : '#F44336';
  const feeNote = feeStatus?.note;

  const feeComponents = feeStructure
    ? FEE_COMPONENTS.filter(fc => parseFloat(feeStructure[fc.key] || 0) > 0)
    : [];

  const selectedChildName = children.find(c => c.id.toString() === selectedChild);
  const childName = selectedChildName ? `${selectedChildName.firstName} ${selectedChildName.lastName}` : '';

  return (
    <View style={styles.container}>
      <ScreenHeader title="Fee Management" navigation={navigation} onRefresh={handleRefresh} refreshing={refreshing} />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#1a237e']} />}
      >
        {/* Child selector */}
        <View style={styles.pickerCard}>
          <View style={styles.pickerLabelRow}>
            <MaterialCommunityIcons name="account-child" size={18} color="#1976d2" />
            <Text style={styles.pickerLabel}>Select Student</Text>
          </View>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={selectedChild}
              onValueChange={v => setSelectedChild(v)}
              style={styles.picker}
            >
              {children.map(child => (
                <Picker.Item
                  key={child.id}
                  label={`${child.firstName} ${child.lastName}`}
                  value={child.id.toString()}
                />
              ))}
            </Picker>
          </View>
        </View>

        {loading && (
          <View style={styles.loadingCard}>
            <MaterialCommunityIcons name="loading" size={28} color="#1976d2" />
            <Text style={styles.loadingText}>Loading fee information...</Text>
          </View>
        )}

        {/* No active academic year or fee structure warning */}
        {!loading && feeNote && (
          <View style={styles.warningCard}>
            <View style={styles.warningIcon}>
              <MaterialCommunityIcons name="information-outline" size={22} color="#e65100" />
            </View>
            <View style={styles.warningContent}>
              <Text style={styles.warningTitle}>Notice</Text>
              <Text style={styles.warningText}>{feeNote}</Text>
            </View>
          </View>
        )}

        {/* Error state */}
        {error && !loading && (
          <View style={styles.errorCard}>
            <MaterialCommunityIcons name="alert-circle-outline" size={40} color="#ef5350" />
            <Text style={styles.errorTitle}>Could Not Load Fees</Text>
            <Text style={styles.errorMsg}>{error}</Text>
          </View>
        )}

        {!loading && feeStatus && (
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

            {/* ─── Fee Summary Card ─────────────────────────────────────── */}
            <View style={styles.summaryCard}>
              {/* Top gradient-like header */}
              <View style={styles.summaryHeader}>
                <View>
                  <Text style={styles.summaryHeaderTitle}>Fee Summary</Text>
                  <Text style={styles.summaryHeaderSub}>{childName}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: paymentPct >= 100 ? '#4CAF50' : paymentPct > 0 ? '#FF9800' : '#f44336' }]}>
                  <Text style={styles.statusBadgeText}>
                    {paymentPct >= 100 ? 'PAID' : paymentPct > 0 ? 'PARTIAL' : 'UNPAID'}
                  </Text>
                </View>
              </View>

              {/* Ring + amounts */}
              <View style={styles.summaryBody}>
                <AnimatedProgressRing percentage={paymentPct} color={progressColor} size={108} />
                <View style={styles.amountsGrid}>
                  <View style={styles.amountItem}>
                    <Text style={styles.amountLabel}>Total Fee</Text>
                    <Text style={[styles.amountValue, { color: '#1a237e' }]}>
                      ₹{totalFee.toLocaleString('en-IN')}
                    </Text>
                  </View>
                  <View style={styles.amountDivider} />
                  <View style={styles.amountItem}>
                    <Text style={styles.amountLabel}>Paid</Text>
                    <Text style={[styles.amountValue, { color: '#2e7d32' }]}>
                      ₹{paidAmount.toLocaleString('en-IN')}
                    </Text>
                  </View>
                  <View style={styles.amountDivider} />
                  <View style={styles.amountItem}>
                    <Text style={styles.amountLabel}>Balance</Text>
                    <Text style={[styles.amountValue, { color: pendingAmount > 0 ? '#c62828' : '#2e7d32' }]}>
                      ₹{pendingAmount.toLocaleString('en-IN')}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Progress bar */}
              <View style={styles.progressContainer}>
                <View style={styles.progressBg}>
                  <Animated.View style={[
                    styles.progressFill,
                    { width: `${Math.min(paymentPct, 100)}%`, backgroundColor: progressColor }
                  ]} />
                </View>
                <Text style={[styles.progressLabel, { color: progressColor }]}>
                  {paymentPct.toFixed(1)}% payment completed
                </Text>
              </View>
            </View>

            {/* ─── Fee Structure Breakdown ─────────────────────────────── */}
            {feeComponents.length > 0 && (
              <View style={styles.card}>
                <View style={styles.cardTitleRow}>
                  <MaterialCommunityIcons name="format-list-bulleted" size={20} color="#1976d2" />
                  <Text style={styles.cardTitle}>Fee Breakdown</Text>
                  {feeStructure?.installmentType && (
                    <View style={styles.installmentBadge}>
                      <Text style={styles.installmentText}>{feeStructure.installmentType}</Text>
                    </View>
                  )}
                </View>

                {feeComponents.map((fc, i) => (
                  <View key={fc.key} style={[
                    styles.feeRow,
                    i === feeComponents.length - 1 && { borderBottomWidth: 0 }
                  ]}>
                    <View style={[styles.feeIconWrap, { backgroundColor: fc.color + '18' }]}>
                      <MaterialCommunityIcons name={fc.icon} size={18} color={fc.color} />
                    </View>
                    <Text style={styles.feeName}>{fc.label}</Text>
                    <Text style={[styles.feeAmount, { color: fc.color }]}>
                      ₹{parseFloat(feeStructure[fc.key]).toLocaleString('en-IN')}
                    </Text>
                  </View>
                ))}

                {/* Total row */}
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total Annual Fee</Text>
                  <Text style={styles.totalAmount}>
                    ₹{parseFloat(feeStructure?.totalFee || totalFee).toLocaleString('en-IN')}
                  </Text>
                </View>
              </View>
            )}

            {/* ─── Payment History ─────────────────────────────────────── */}
            <View style={[styles.card, { marginBottom: 24 }]}>
              <View style={styles.cardTitleRow}>
                <MaterialCommunityIcons name="history" size={20} color="#1976d2" />
                <Text style={styles.cardTitle}>Payment History</Text>
                {payments.length > 0 && (
                  <View style={styles.countBadge}>
                    <Text style={styles.countBadgeText}>{payments.length}</Text>
                  </View>
                )}
              </View>

              {payments.length > 0 ? (
                payments.map((payment, i) => {
                  const modeInfo = PAYMENT_MODE_COLORS[payment.paymentMode] || PAYMENT_MODE_COLORS.CASH;
                  return (
                    <View key={payment.id || i} style={styles.paymentRow}>
                      {/* Timeline dot */}
                      <View style={styles.timelineCol}>
                        <View style={[styles.timelineDot, { backgroundColor: modeInfo.text }]} />
                        {i < payments.length - 1 && <View style={styles.timelineLine} />}
                      </View>
                      {/* Content */}
                      <View style={styles.paymentContent}>
                        <View style={styles.paymentHeader}>
                          <Text style={styles.paymentDate}>
                            {payment.paymentDate
                              ? new Date(payment.paymentDate).toLocaleDateString('en-IN', {
                                  day: 'numeric', month: 'short', year: 'numeric'
                                })
                              : 'Date N/A'}
                          </Text>
                          <Text style={[styles.paymentAmount, { color: '#2e7d32' }]}>
                            +₹{parseFloat(payment.amount || 0).toLocaleString('en-IN')}
                          </Text>
                        </View>
                        <View style={styles.paymentMeta}>
                          <View style={[styles.modeBadge, { backgroundColor: modeInfo.bg }]}>
                            <MaterialCommunityIcons name={modeInfo.icon} size={12} color={modeInfo.text} />
                            <Text style={[styles.modeText, { color: modeInfo.text }]}>
                              {payment.paymentMode || 'CASH'}
                            </Text>
                          </View>
                          {payment.transactionId && (
                            <Text style={styles.txnId}>Txn: {payment.transactionId}</Text>
                          )}
                          {payment.remarks && (
                            <Text style={styles.paymentRemarks} numberOfLines={1}>{payment.remarks}</Text>
                          )}
                        </View>
                      </View>
                    </View>
                  );
                })
              ) : (
                <View style={styles.noPayments}>
                  <View style={styles.noPaymentsIcon}>
                    <MaterialCommunityIcons name="receipt-text-outline" size={36} color="#90caf9" />
                  </View>
                  <Text style={styles.noPaymentsTitle}>No Payments Yet</Text>
                  <Text style={styles.noPaymentsSub}>
                    {totalFee > 0
                      ? `₹${totalFee.toLocaleString('en-IN')} fee is pending payment`
                      : 'No payment records found for this academic year'}
                  </Text>
                </View>
              )}
            </View>

          </Animated.View>
        )}

        {/* Empty state when no children */}
        {!loading && !error && !feeStatus && !feeNote && selectedChild && (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="cash-clock" size={48} color="#90caf9" />
            <Text style={styles.emptyTitle}>Loading Fee Information</Text>
            <Text style={styles.emptySub}>Please wait while we fetch fee details</Text>
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8' },

  // Picker
  pickerCard: {
    margin: 12, marginTop: 12, backgroundColor: '#fff',
    borderRadius: 16, padding: 14, elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4,
  },
  pickerLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  pickerLabel: { fontSize: 13, fontWeight: '700', color: '#333' },
  pickerWrapper: { backgroundColor: '#f8f9fa', borderRadius: 10, borderWidth: 1, borderColor: '#e0e0e0' },
  picker: { backgroundColor: 'transparent' },

  // Loading
  loadingCard: {
    margin: 12, backgroundColor: '#fff', borderRadius: 16, padding: 32,
    alignItems: 'center', gap: 12, elevation: 2,
  },
  loadingText: { color: '#888', fontSize: 14 },

  // Warning
  warningCard: {
    margin: 12, backgroundColor: '#fff8e1', borderRadius: 14,
    padding: 14, flexDirection: 'row', alignItems: 'flex-start', gap: 12,
    borderLeftWidth: 4, borderLeftColor: '#FF9800', elevation: 2,
  },
  warningIcon: {
    width: 38, height: 38, borderRadius: 10, backgroundColor: '#fff3e0',
    alignItems: 'center', justifyContent: 'center',
  },
  warningContent: { flex: 1 },
  warningTitle: { fontSize: 13, fontWeight: '700', color: '#e65100', marginBottom: 3 },
  warningText: { fontSize: 12, color: '#795548', lineHeight: 18 },

  // Error
  errorCard: {
    margin: 12, backgroundColor: '#fff', borderRadius: 16, padding: 32,
    alignItems: 'center', gap: 8, elevation: 2,
  },
  errorTitle: { fontSize: 16, fontWeight: '700', color: '#c62828' },
  errorMsg: { fontSize: 13, color: '#888', textAlign: 'center', lineHeight: 20 },

  // Summary Card
  summaryCard: {
    margin: 12, backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden',
    elevation: 4, shadowColor: '#1a237e', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15, shadowRadius: 8,
  },
  summaryHeader: {
    backgroundColor: '#1a237e',
    paddingHorizontal: 18, paddingVertical: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  summaryHeaderTitle: { color: '#fff', fontSize: 16, fontWeight: '800' },
  summaryHeaderSub: { color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  statusBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  summaryBody: {
    flexDirection: 'row', alignItems: 'center', padding: 18, gap: 16,
  },
  amountsGrid: { flex: 1, gap: 12 },
  amountItem: {},
  amountLabel: { fontSize: 11, color: '#888', fontWeight: '600', marginBottom: 2 },
  amountValue: { fontSize: 17, fontWeight: '800' },
  amountDivider: { height: 1, backgroundColor: '#f0f0f0' },
  progressContainer: { paddingHorizontal: 18, paddingBottom: 18 },
  progressBg: {
    height: 10, backgroundColor: '#e0e0e0', borderRadius: 5, overflow: 'hidden', marginBottom: 6,
  },
  progressFill: { height: '100%', borderRadius: 5 },
  progressLabel: { fontSize: 11, fontWeight: '700', textAlign: 'right' },

  // Generic card
  card: {
    margin: 12, marginTop: 0, backgroundColor: '#fff', borderRadius: 16,
    padding: 16, elevation: 3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 5,
  },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  cardTitle: { flex: 1, fontSize: 15, fontWeight: '800', color: '#1a237e' },
  installmentBadge: {
    backgroundColor: '#e3f2fd', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
  },
  installmentText: { fontSize: 10, color: '#1565c0', fontWeight: '700' },
  countBadge: {
    backgroundColor: '#1a237e', width: 22, height: 22, borderRadius: 11,
    alignItems: 'center', justifyContent: 'center',
  },
  countBadgeText: { color: '#fff', fontSize: 11, fontWeight: '800' },

  // Fee rows
  feeRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f5f5f5',
  },
  feeIconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  feeName: { flex: 1, fontSize: 13.5, fontWeight: '600', color: '#333' },
  feeAmount: { fontSize: 14, fontWeight: '700' },
  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 12, paddingTop: 12,
    borderTopWidth: 2, borderTopColor: '#1a237e',
  },
  totalLabel: { fontSize: 14, fontWeight: '800', color: '#1a237e' },
  totalAmount: { fontSize: 18, fontWeight: '900', color: '#1a237e' },

  // Payment timeline
  paymentRow: { flexDirection: 'row', gap: 12, paddingBottom: 12 },
  timelineCol: { alignItems: 'center', paddingTop: 4 },
  timelineDot: { width: 12, height: 12, borderRadius: 6 },
  timelineLine: { width: 2, flex: 1, backgroundColor: '#e0e0e0', marginTop: 4 },
  paymentContent: { flex: 1, paddingBottom: 8 },
  paymentHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  paymentDate: { fontSize: 13, fontWeight: '700', color: '#333' },
  paymentAmount: { fontSize: 14, fontWeight: '800' },
  paymentMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center' },
  modeBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
  },
  modeText: { fontSize: 11, fontWeight: '700' },
  txnId: { fontSize: 11, color: '#888' },
  paymentRemarks: { fontSize: 11, color: '#aaa', fontStyle: 'italic', flex: 1 },

  // No payments
  noPayments: { alignItems: 'center', padding: 24, gap: 8 },
  noPaymentsIcon: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: '#e3f2fd',
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  noPaymentsTitle: { fontSize: 15, fontWeight: '700', color: '#333' },
  noPaymentsSub: { fontSize: 13, color: '#888', textAlign: 'center', lineHeight: 20 },

  // Empty state
  emptyState: { margin: 12, alignItems: 'center', padding: 40, gap: 10 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#333' },
  emptySub: { fontSize: 13, color: '#aaa', textAlign: 'center' },
});
