import React, { useState, useEffect, useRef } from 'react';
import {
  View, StyleSheet, ScrollView, RefreshControl, Animated,
  TouchableOpacity, Modal, Pressable,
} from 'react-native';
import { Text } from 'react-native-paper';
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
  NET_BANKING: { bg: '#e8eaf6', text: '#3949ab', icon: 'bank' },
};

function AnimatedProgressRing({ percentage, color, size = 100 }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: percentage, duration: 900, useNativeDriver: false }).start();
  }, [percentage]);

  const pct = Math.min(Math.max(percentage, 0), 100);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{
        position: 'absolute', width: size - 16, height: size - 16,
        borderRadius: (size - 16) / 2, borderWidth: 8, borderColor: '#e0e0e0',
      }} />
      <View style={{
        position: 'absolute', width: size - 16, height: size - 16,
        borderRadius: (size - 16) / 2, borderWidth: 8,
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

// ─── Fee Receipt Modal ──────────────────────────────────────────────────────
function FeeReceiptModal({ visible, onClose, payment, student, feeStatus, allPayments }) {
  if (!payment) return null;

  const amount = parseFloat(payment.amount || 0);
  const receiptNo = `RCP-${payment.id || Date.now()}`;
  const payDate = payment.paymentDate
    ? new Date(payment.paymentDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'N/A';

  const modeInfo = PAYMENT_MODE_COLORS[payment.paymentMode] || PAYMENT_MODE_COLORS.CASH;
  const feeStructure = feeStatus?.feeStructure;
  const totalFee = parseFloat(feeStatus?.totalFee || feeStructure?.totalFee || 0);

  // Compute previous paid (all payments with smaller id)
  const prevPaid = (allPayments || [])
    .filter(p => p.id < payment.id)
    .reduce((s, p) => s + parseFloat(p.amount || 0), 0);
  const totalPaidAfter = prevPaid + amount;
  const balanceAfter = Math.max(0, totalFee - totalPaidAfter);

  const feeComponents = feeStructure
    ? FEE_COMPONENTS.filter(fc => parseFloat(feeStructure[fc.key] || 0) > 0)
    : [];

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={rcptStyles.overlay}>
        <View style={rcptStyles.sheet}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={rcptStyles.header}>
              <MaterialCommunityIcons name="school" size={32} color="#FFB300" />
              <Text style={rcptStyles.schoolName}>EduConnect School</Text>
              <Text style={rcptStyles.schoolSub}>Excellence in Education</Text>
            </View>

            {/* Banner */}
            <View style={rcptStyles.banner}>
              <Text style={rcptStyles.bannerText}>FEE RECEIPT</Text>
            </View>

            {/* Body */}
            <View style={rcptStyles.body}>
              {/* Receipt No + Date */}
              <View style={rcptStyles.row}>
                <View>
                  <Text style={rcptStyles.metaLabel}>Receipt No.</Text>
                  <Text style={rcptStyles.receiptNo}>{receiptNo}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={rcptStyles.metaLabel}>Date</Text>
                  <Text style={rcptStyles.metaValue}>{payDate}</Text>
                </View>
              </View>

              {/* Student box */}
              <View style={rcptStyles.infoBox}>
                <Text style={rcptStyles.boxLabel}>Student Details</Text>
                <View style={rcptStyles.row}>
                  <View style={{ flex: 1 }}>
                    <Text style={rcptStyles.metaLabel}>Name</Text>
                    <Text style={rcptStyles.metaValue}>{student?.firstName} {student?.lastName}</Text>
                  </View>
                  <View style={{ flex: 1, alignItems: 'flex-end' }}>
                    <Text style={rcptStyles.metaLabel}>Admission No.</Text>
                    <Text style={[rcptStyles.metaValue, { fontFamily: 'monospace' }]}>{student?.admissionNo || '-'}</Text>
                  </View>
                </View>
                <View style={[rcptStyles.row, { marginTop: 8 }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={rcptStyles.metaLabel}>Class</Text>
                    <Text style={rcptStyles.metaValue}>{student?.schoolClass?.name || '-'}</Text>
                  </View>
                </View>
              </View>

              {/* Fee breakdown (if structure exists) */}
              {feeComponents.length > 0 && (
                <View style={{ marginBottom: 14 }}>
                  <Text style={rcptStyles.sectionLabel}>Fee Structure</Text>
                  {feeComponents.map(fc => (
                    <View key={fc.key} style={rcptStyles.feeLineRow}>
                      <Text style={rcptStyles.feeLineName}>{fc.label}</Text>
                      <Text style={rcptStyles.feeLineValue}>₹{parseFloat(feeStructure[fc.key]).toLocaleString('en-IN')}</Text>
                    </View>
                  ))}
                  <View style={rcptStyles.feeTotalRow}>
                    <Text style={rcptStyles.feeTotalLabel}>Total Annual Fee</Text>
                    <Text style={rcptStyles.feeTotalValue}>₹{totalFee.toLocaleString('en-IN')}</Text>
                  </View>
                </View>
              )}

              <View style={rcptStyles.dottedDivider} />

              {/* Payment details */}
              <Text style={rcptStyles.sectionLabel}>Payment Details</Text>
              {prevPaid > 0 && (
                <View style={rcptStyles.feeLineRow}>
                  <Text style={[rcptStyles.feeLineName, { color: '#888' }]}>Previously Paid</Text>
                  <Text style={[rcptStyles.feeLineValue, { color: '#888' }]}>₹{prevPaid.toLocaleString('en-IN')}</Text>
                </View>
              )}

              {/* Amount paid - highlighted */}
              <View style={rcptStyles.amountBox}>
                <View style={{ flex: 1 }}>
                  <Text style={rcptStyles.amountLabel}>Amount Paid</Text>
                  <Text style={rcptStyles.amountValue}>₹{amount.toLocaleString('en-IN')}</Text>
                  <View style={[rcptStyles.modeBadge, { backgroundColor: modeInfo.bg }]}>
                    <MaterialCommunityIcons name={modeInfo.icon} size={12} color={modeInfo.text} />
                    <Text style={[rcptStyles.modeText, { color: modeInfo.text }]}>{payment.paymentMode || 'CASH'}</Text>
                  </View>
                  {payment.transactionId && (
                    <Text style={rcptStyles.txnText}>Txn: {payment.transactionId}</Text>
                  )}
                </View>
                <MaterialCommunityIcons name="check-circle" size={44} color="#4CAF50" />
              </View>

              {/* Balance */}
              {totalFee > 0 && (
                <View style={[rcptStyles.balanceRow, { backgroundColor: balanceAfter > 0 ? '#ffebee' : '#e8f5e9' }]}>
                  <Text style={[rcptStyles.balanceLabel, { color: balanceAfter > 0 ? '#c62828' : '#2e7d32' }]}>
                    {balanceAfter > 0 ? '⚠ Balance Remaining' : '✓ Fee Cleared'}
                  </Text>
                  <Text style={[rcptStyles.balanceValue, { color: balanceAfter > 0 ? '#c62828' : '#2e7d32' }]}>
                    {balanceAfter > 0 ? `₹${balanceAfter.toLocaleString('en-IN')}` : 'PAID IN FULL'}
                  </Text>
                </View>
              )}

              {payment.remarks ? (
                <Text style={rcptStyles.remarks}>Remarks: {payment.remarks}</Text>
              ) : null}

              {/* Signatures */}
              <View style={rcptStyles.sigRow}>
                <View style={{ alignItems: 'center' }}>
                  <View style={rcptStyles.sigLine} />
                  <Text style={rcptStyles.sigLabel}>Parent Signature</Text>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <View style={rcptStyles.sigLine} />
                  <Text style={rcptStyles.sigLabel}>Authorized Signature</Text>
                </View>
              </View>

              {/* Footer */}
              <Text style={rcptStyles.footerNote}>
                Computer-generated receipt · EduConnect School Management System
              </Text>
            </View>
          </ScrollView>

          {/* Close button */}
          <Pressable style={rcptStyles.closeBtn} onPress={onClose}>
            <MaterialCommunityIcons name="close" size={20} color="#fff" />
            <Text style={rcptStyles.closeBtnText}>Close Receipt</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────
export default function FeeScreen({ navigation }) {
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState('');
  const [feeStatus, setFeeStatus] = useState(null);
  const [allPayments, setAllPayments] = useState([]);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    fetchChildren();
    markSeen(SECTIONS.FEES);
  }, []);

  useEffect(() => {
    if (selectedChild) {
      setFeeStatus(null);
      setAllPayments([]);
      setError(null);
      fetchFeeData();
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

  const fetchFeeData = async () => {
    setLoading(true);
    try {
      // Fetch both: status (for structure/summary) and all payments (for history)
      const [statusRes, paymentsRes] = await Promise.allSettled([
        feeAPI.getStatusByStudent(selectedChild),
        feeAPI.getPaymentsByStudent(selectedChild),
      ]);

      const statusData = statusRes.status === 'fulfilled' ? statusRes.value?.data : null;
      const payments = paymentsRes.status === 'fulfilled' ? (paymentsRes.value?.data || []) : [];

      // Sort payments newest first
      const sortedPayments = [...payments].sort((a, b) => {
        if (a.paymentDate && b.paymentDate) return b.paymentDate.localeCompare(a.paymentDate);
        return b.id - a.id;
      });
      setAllPayments(sortedPayments);

      if (statusData) {
        // Compute total paid from ALL payments (not just active year)
        const totalPaidAllTime = payments.reduce((s, p) => s + parseFloat(p.amount || 0), 0);
        const totalFee = parseFloat(statusData.totalFee || 0);
        setFeeStatus({
          ...statusData,
          payments: sortedPayments, // override with complete list
          paidAmount: totalPaidAllTime,
          pendingAmount: Math.max(0, totalFee - totalPaidAllTime),
        });
        setError(null);
        animateIn();
      } else if (payments.length > 0) {
        // Status endpoint failed but we have payments — show them with a notice
        const totalPaid = payments.reduce((s, p) => s + parseFloat(p.amount || 0), 0);
        setFeeStatus({ payments: sortedPayments, paidAmount: totalPaid, pendingAmount: 0, totalFee: 0, note: 'Fee structure not configured for active year. Showing all payment records.' });
        animateIn();
      } else {
        const errMsg = statusRes.reason?.response?.data?.message || 'No fee information available';
        setError(errMsg);
        setFeeStatus(null);
      }
    } catch (e) {
      setError(e?.message || 'Failed to load fee information');
      setFeeStatus(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchChildren();
    if (selectedChild) await fetchFeeData();
    setRefreshing(false);
  };

  const openReceipt = (payment) => {
    setSelectedPayment(payment);
    setShowReceipt(true);
  };

  // Derived values
  const totalFee = parseFloat(feeStatus?.totalFee || 0);
  const paidAmount = parseFloat(feeStatus?.paidAmount || 0);
  const pendingAmount = parseFloat(feeStatus?.pendingAmount || 0);
  const payments = feeStatus?.payments || [];
  const feeStructure = feeStatus?.feeStructure;
  const paymentPct = totalFee > 0 ? Math.min((paidAmount / totalFee) * 100, 100) : 0;
  const progressColor = paymentPct >= 100 ? '#4CAF50' : paymentPct >= 50 ? '#FF9800' : '#F44336';
  const feeNote = feeStatus?.note;

  const feeComponents = feeStructure
    ? FEE_COMPONENTS.filter(fc => parseFloat(feeStructure[fc.key] || 0) > 0)
    : [];

  const selectedChildData = children.find(c => c.id.toString() === selectedChild);
  const childName = selectedChildData ? `${selectedChildData.firstName} ${selectedChildData.lastName}` : '';

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
            <Picker selectedValue={selectedChild} onValueChange={v => setSelectedChild(v)} style={styles.picker}>
              {children.map(child => (
                <Picker.Item key={child.id} label={`${child.firstName} ${child.lastName}`} value={child.id.toString()} />
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

        {/* Notice */}
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

        {/* Error */}
        {error && !loading && (
          <View style={styles.errorCard}>
            <MaterialCommunityIcons name="alert-circle-outline" size={40} color="#ef5350" />
            <Text style={styles.errorTitle}>Could Not Load Fees</Text>
            <Text style={styles.errorMsg}>{error}</Text>
          </View>
        )}

        {!loading && feeStatus && (
          <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>

            {/* ── Fee Summary Card ── */}
            {totalFee > 0 && (
              <View style={styles.summaryCard}>
                <View style={styles.summaryHeader}>
                  <View>
                    <Text style={styles.summaryHeaderTitle}>Fee Summary</Text>
                    <Text style={styles.summaryHeaderSub}>{childName}</Text>
                  </View>
                  <View style={[styles.statusBadge, {
                    backgroundColor: paymentPct >= 100 ? '#4CAF50' : paymentPct > 0 ? '#FF9800' : '#f44336',
                  }]}>
                    <Text style={styles.statusBadgeText}>
                      {paymentPct >= 100 ? 'PAID' : paymentPct > 0 ? 'PARTIAL' : 'UNPAID'}
                    </Text>
                  </View>
                </View>
                <View style={styles.summaryBody}>
                  <AnimatedProgressRing percentage={paymentPct} color={progressColor} size={108} />
                  <View style={styles.amountsGrid}>
                    <View style={styles.amountItem}>
                      <Text style={styles.amountLabel}>Total Fee</Text>
                      <Text style={[styles.amountValue, { color: '#1a237e' }]}>₹{totalFee.toLocaleString('en-IN')}</Text>
                    </View>
                    <View style={styles.amountDivider} />
                    <View style={styles.amountItem}>
                      <Text style={styles.amountLabel}>Paid</Text>
                      <Text style={[styles.amountValue, { color: '#2e7d32' }]}>₹{paidAmount.toLocaleString('en-IN')}</Text>
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
                <View style={styles.progressContainer}>
                  <View style={styles.progressBg}>
                    <View style={[styles.progressFill, { width: `${Math.min(paymentPct, 100)}%`, backgroundColor: progressColor }]} />
                  </View>
                  <Text style={[styles.progressLabel, { color: progressColor }]}>
                    {paymentPct.toFixed(1)}% payment completed
                  </Text>
                </View>
              </View>
            )}

            {/* ── Fee Breakdown ── */}
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
                  <View key={fc.key} style={[styles.feeRow, i === feeComponents.length - 1 && { borderBottomWidth: 0 }]}>
                    <View style={[styles.feeIconWrap, { backgroundColor: fc.color + '18' }]}>
                      <MaterialCommunityIcons name={fc.icon} size={18} color={fc.color} />
                    </View>
                    <Text style={styles.feeName}>{fc.label}</Text>
                    <Text style={[styles.feeAmount, { color: fc.color }]}>
                      ₹{parseFloat(feeStructure[fc.key]).toLocaleString('en-IN')}
                    </Text>
                  </View>
                ))}
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Total Annual Fee</Text>
                  <Text style={styles.totalAmount}>₹{parseFloat(feeStructure?.totalFee || totalFee).toLocaleString('en-IN')}</Text>
                </View>
              </View>
            )}

            {/* ── Payment History ── */}
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

              {payments.length > 0 ? payments.map((payment, i) => {
                const modeInfo = PAYMENT_MODE_COLORS[payment.paymentMode] || PAYMENT_MODE_COLORS.CASH;
                return (
                  <TouchableOpacity
                    key={payment.id || i}
                    style={styles.paymentRow}
                    onPress={() => openReceipt(payment)}
                    activeOpacity={0.7}
                  >
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
                            ? new Date(payment.paymentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                            : 'Date N/A'}
                        </Text>
                        <Text style={[styles.paymentAmount, { color: '#2e7d32' }]}>
                          +₹{parseFloat(payment.amount || 0).toLocaleString('en-IN')}
                        </Text>
                      </View>
                      <View style={styles.paymentMeta}>
                        <View style={[styles.modeBadge, { backgroundColor: modeInfo.bg }]}>
                          <MaterialCommunityIcons name={modeInfo.icon} size={12} color={modeInfo.text} />
                          <Text style={[styles.modeText, { color: modeInfo.text }]}>{payment.paymentMode || 'CASH'}</Text>
                        </View>
                        {payment.transactionId && <Text style={styles.txnId}>Txn: {payment.transactionId}</Text>}
                        {payment.remarks && <Text style={styles.paymentRemarks} numberOfLines={1}>{payment.remarks}</Text>}
                      </View>
                      {/* View Receipt hint */}
                      <View style={styles.receiptHint}>
                        <MaterialCommunityIcons name="receipt" size={12} color="#1976d2" />
                        <Text style={styles.receiptHintText}>Tap to view receipt</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              }) : (
                <View style={styles.noPayments}>
                  <View style={styles.noPaymentsIcon}>
                    <MaterialCommunityIcons name="receipt-text-outline" size={36} color="#90caf9" />
                  </View>
                  <Text style={styles.noPaymentsTitle}>No Payments Yet</Text>
                  <Text style={styles.noPaymentsSub}>
                    {totalFee > 0
                      ? `₹${totalFee.toLocaleString('en-IN')} fee is pending payment`
                      : 'No payment records found'}
                  </Text>
                </View>
              )}
            </View>
          </Animated.View>
        )}

        {!loading && !error && !feeStatus && selectedChild && (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="cash-clock" size={48} color="#90caf9" />
            <Text style={styles.emptyTitle}>Loading Fee Information</Text>
            <Text style={styles.emptySub}>Please wait while we fetch fee details</Text>
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Fee Receipt Modal */}
      <FeeReceiptModal
        visible={showReceipt}
        onClose={() => setShowReceipt(false)}
        payment={selectedPayment}
        student={selectedChildData}
        feeStatus={feeStatus}
        allPayments={allPayments}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f4f8' },

  pickerCard: {
    margin: 12, marginTop: 12, backgroundColor: '#fff',
    borderRadius: 16, padding: 14, elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4,
  },
  pickerLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  pickerLabel: { fontSize: 13, fontWeight: '700', color: '#333' },
  pickerWrapper: { backgroundColor: '#f8f9fa', borderRadius: 10, borderWidth: 1, borderColor: '#e0e0e0' },
  picker: { backgroundColor: 'transparent' },

  loadingCard: {
    margin: 12, backgroundColor: '#fff', borderRadius: 16, padding: 32,
    alignItems: 'center', gap: 12, elevation: 2,
  },
  loadingText: { color: '#888', fontSize: 14 },

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

  errorCard: {
    margin: 12, backgroundColor: '#fff', borderRadius: 16, padding: 32,
    alignItems: 'center', gap: 8, elevation: 2,
  },
  errorTitle: { fontSize: 16, fontWeight: '700', color: '#c62828' },
  errorMsg: { fontSize: 13, color: '#888', textAlign: 'center', lineHeight: 20 },

  summaryCard: {
    margin: 12, backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden',
    elevation: 4, shadowColor: '#1a237e', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15, shadowRadius: 8,
  },
  summaryHeader: {
    backgroundColor: '#1a237e', paddingHorizontal: 18, paddingVertical: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  summaryHeaderTitle: { color: '#fff', fontSize: 16, fontWeight: '800' },
  summaryHeaderSub: { color: 'rgba(255,255,255,0.65)', fontSize: 12, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  statusBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  summaryBody: { flexDirection: 'row', alignItems: 'center', padding: 18, gap: 16 },
  amountsGrid: { flex: 1, gap: 12 },
  amountItem: {},
  amountLabel: { fontSize: 11, color: '#888', fontWeight: '600', marginBottom: 2 },
  amountValue: { fontSize: 17, fontWeight: '800' },
  amountDivider: { height: 1, backgroundColor: '#f0f0f0' },
  progressContainer: { paddingHorizontal: 18, paddingBottom: 18 },
  progressBg: { height: 10, backgroundColor: '#e0e0e0', borderRadius: 5, overflow: 'hidden', marginBottom: 6 },
  progressFill: { height: '100%', borderRadius: 5 },
  progressLabel: { fontSize: 11, fontWeight: '700', textAlign: 'right' },

  card: {
    margin: 12, marginTop: 0, backgroundColor: '#fff', borderRadius: 16,
    padding: 16, elevation: 3,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 5,
  },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  cardTitle: { flex: 1, fontSize: 15, fontWeight: '800', color: '#1a237e' },
  installmentBadge: { backgroundColor: '#e3f2fd', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  installmentText: { fontSize: 10, color: '#1565c0', fontWeight: '700' },
  countBadge: { backgroundColor: '#1a237e', width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  countBadgeText: { color: '#fff', fontSize: 11, fontWeight: '800' },

  feeRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f5f5f5',
  },
  feeIconWrap: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  feeName: { flex: 1, fontSize: 13.5, fontWeight: '600', color: '#333' },
  feeAmount: { fontSize: 14, fontWeight: '700' },
  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginTop: 12, paddingTop: 12, borderTopWidth: 2, borderTopColor: '#1a237e',
  },
  totalLabel: { fontSize: 14, fontWeight: '800', color: '#1a237e' },
  totalAmount: { fontSize: 18, fontWeight: '900', color: '#1a237e' },

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
  receiptHint: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  receiptHintText: { fontSize: 11, color: '#1976d2', fontStyle: 'italic' },

  noPayments: { alignItems: 'center', padding: 24, gap: 8 },
  noPaymentsIcon: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: '#e3f2fd',
    alignItems: 'center', justifyContent: 'center', marginBottom: 4,
  },
  noPaymentsTitle: { fontSize: 15, fontWeight: '700', color: '#333' },
  noPaymentsSub: { fontSize: 13, color: '#888', textAlign: 'center', lineHeight: 20 },

  emptyState: { margin: 12, alignItems: 'center', padding: 40, gap: 10 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#333' },
  emptySub: { fontSize: 13, color: '#aaa', textAlign: 'center' },
});

// ─── Receipt Modal Styles ─────────────────────────────────────────────────────
const rcptStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#f5f5f5', borderTopLeftRadius: 24, borderTopRightRadius: 24,
    maxHeight: '92%', overflow: 'hidden',
  },
  header: {
    backgroundColor: '#1a237e', alignItems: 'center', paddingTop: 24, paddingBottom: 18, gap: 4,
  },
  schoolName: { color: '#fff', fontSize: 18, fontWeight: '800', letterSpacing: 0.5 },
  schoolSub: { color: 'rgba(255,255,255,0.7)', fontSize: 11 },
  banner: { backgroundColor: '#FFB300', paddingVertical: 8, alignItems: 'center' },
  bannerText: { color: '#1a237e', fontWeight: '800', fontSize: 14, letterSpacing: 3 },
  body: { padding: 18 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  metaLabel: { fontSize: 10, color: '#999', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
  metaValue: { fontSize: 13, fontWeight: '700', color: '#111' },
  receiptNo: { fontSize: 14, fontWeight: '800', color: '#1a237e', fontFamily: 'monospace' },
  infoBox: {
    backgroundColor: '#f8f9fa', borderRadius: 12, padding: 14, marginBottom: 14,
  },
  boxLabel: { fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: '700', marginBottom: 8 },
  sectionLabel: { fontSize: 10, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: '700', marginBottom: 6 },
  feeLineRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  feeLineName: { fontSize: 13, color: '#666' },
  feeLineValue: { fontSize: 13, fontWeight: '600', color: '#333' },
  feeTotalRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#e8f0fe', padding: 10, borderRadius: 8, marginTop: 6 },
  feeTotalLabel: { fontSize: 13, fontWeight: '700', color: '#1a237e' },
  feeTotalValue: { fontSize: 13, fontWeight: '800', color: '#1a237e' },
  dottedDivider: { borderStyle: 'dashed', borderWidth: 0.5, borderColor: '#bbb', marginVertical: 14 },
  amountBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#e8f5e9', padding: 14, borderRadius: 12,
    borderLeftWidth: 5, borderLeftColor: '#4CAF50', marginBottom: 12,
  },
  amountLabel: { fontSize: 10, color: '#2e7d32', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: '700', marginBottom: 2 },
  amountValue: { fontSize: 26, fontWeight: '900', color: '#2e7d32', marginBottom: 6 },
  modeBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, alignSelf: 'flex-start',
  },
  modeText: { fontSize: 11, fontWeight: '700' },
  txnText: { fontSize: 11, color: '#555', marginTop: 4 },
  balanceRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 12, borderRadius: 10, marginBottom: 10,
  },
  balanceLabel: { fontSize: 13, fontWeight: '700' },
  balanceValue: { fontSize: 14, fontWeight: '800' },
  remarks: { fontSize: 12, color: '#888', fontStyle: 'italic', marginBottom: 14 },
  sigRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 12 },
  sigLine: { width: 110, height: 1, backgroundColor: '#333', marginBottom: 4 },
  sigLabel: { fontSize: 10, color: '#888', textAlign: 'center' },
  footerNote: { fontSize: 10, color: '#aaa', textAlign: 'center', marginTop: 8, marginBottom: 16 },
  closeBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#1a237e', margin: 16, marginTop: 0, borderRadius: 14, paddingVertical: 14,
  },
  closeBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
