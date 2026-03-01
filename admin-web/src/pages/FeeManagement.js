import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, TextField, Grid, Dialog, DialogTitle,
  DialogContent, DialogActions, Tab, Tabs, MenuItem, Select, FormControl,
  InputLabel, Card, CardContent, Chip, IconButton, Snackbar, Alert,
  Tooltip, InputAdornment, TablePagination, CircularProgress, Switch,
  FormControlLabel, Divider, ToggleButtonGroup, ToggleButton, LinearProgress,
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon,
  Receipt as ReceiptIcon, AccountBalance as AccountIcon, Payment as PaymentIcon,
  DirectionsBus as BusIcon, Person as PersonIcon, FileDownload as DownloadIcon,
  CheckCircle as CheckCircleIcon, Print as PrintIcon, School as SchoolIcon,
  Warning as WarningIcon, Refresh as RefreshIcon, ArrowForward as ArrowIcon,
  MoneyOff as BalanceIcon,
} from '@mui/icons-material';
import { academicAPI, studentAPI, feeAPI, transportAPI } from '../services/api';
import * as XLSX from 'xlsx';

function TabPanel({ children, value, index }) {
  return value === index ? <Box sx={{ p: 3 }}>{children}</Box> : null;
}

const StatCard = ({ title, value, icon: Icon, gradient, subtitle }) => (
  <Card sx={{ background: gradient, color: 'white', borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
    <CardContent>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5 }}>{title}</Typography>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>{value}</Typography>
          {subtitle && <Typography variant="caption" sx={{ opacity: 0.8 }}>{subtitle}</Typography>}
        </Box>
        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.2)' }}>
          <Icon sx={{ fontSize: 28 }} />
        </Box>
      </Box>
    </CardContent>
  </Card>
);

// ─── Professional Fee Slip / Receipt Dialog ───────────────────────────────────
function FeeSlipDialog({ open, onClose, slipData }) {
  const printRef = useRef();
  if (!slipData) return null;

  const { payment, receipt, student, feeStructure, prevPaid, newBalance } = slipData;
  const receiptNo = receipt?.receiptNo || `RCP-${payment?.id || Date.now()}`;
  const paymentDate = payment?.paymentDate || new Date().toISOString().split('T')[0];
  const amount = parseFloat(payment?.amount || 0);

  const feeComponents = feeStructure
    ? [
        { label: 'Tuition Fee', value: parseFloat(feeStructure.tuitionFee || 0) },
        { label: 'Admission Fee', value: parseFloat(feeStructure.admissionFee || 0) },
        { label: 'Exam Fee', value: parseFloat(feeStructure.examFee || 0) },
        { label: 'Transport Fee', value: parseFloat(feeStructure.transportFee || 0) },
        { label: 'Library Fee', value: parseFloat(feeStructure.libraryFee || 0) },
        { label: 'Lab Fee', value: parseFloat(feeStructure.labFee || 0) },
        { label: 'Sports Fee', value: parseFloat(feeStructure.sportsFee || 0) },
        { label: 'Other Fee', value: parseFloat(feeStructure.otherFee || 0) },
      ].filter(c => c.value > 0)
    : [];
  const totalFee = feeComponents.reduce((s, c) => s + c.value, 0) || parseFloat(feeStructure?.totalFee || 0);

  const handlePrint = () => {
    const printContent = printRef.current?.innerHTML || '';
    const printWindow = window.open('', '_blank', 'width=700,height=900');
    printWindow.document.write(`
      <html><head><title>Fee Receipt - ${receiptNo}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
        .receipt { max-width: 560px; margin: 0 auto; border: 2px solid #1a237e; border-radius: 8px; overflow: hidden; background: white; }
        .header { background: #1a237e; color: white; padding: 20px; text-align: center; }
        .header h1 { font-size: 22px; font-weight: 800; margin-bottom: 4px; }
        .header p { font-size: 12px; opacity: 0.8; }
        .banner { background: #FFB300; text-align: center; padding: 8px; font-weight: 800; font-size: 16px; color: #1a237e; letter-spacing: 3px; }
        .body { padding: 20px; }
        .row { display: flex; justify-content: space-between; align-items: center; }
        .info-box { background: #f8f9fa; border-radius: 8px; padding: 14px; margin: 12px 0; }
        .label { font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; }
        .value { font-size: 13px; font-weight: 600; color: #111; margin-top: 2px; }
        .receipt-id { font-family: monospace; font-size: 14px; font-weight: 700; color: #1a237e; }
        .divider { border: none; border-top: 1px dashed #ccc; margin: 14px 0; }
        .fee-row { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #f0f0f0; font-size: 13px; }
        .total-row { display: flex; justify-content: space-between; background: #e8f0fe; padding: 8px 10px; border-radius: 6px; font-weight: 700; font-size: 14px; color: #1a237e; margin-top: 6px; }
        .paid-box { background: #e8f5e9; padding: 14px; border-radius: 8px; border-left: 5px solid #4CAF50; margin: 14px 0; }
        .paid-amount { font-size: 28px; font-weight: 800; color: #2e7d32; }
        .mode-tag { display: inline-block; background: #C8E6C9; color: #1B5E20; padding: 2px 10px; border-radius: 10px; font-size: 11px; font-weight: 700; margin-top: 6px; }
        .balance-box { display: flex; justify-content: space-between; background: ${newBalance > 0 ? '#ffebee' : '#e8f5e9'}; padding: 10px 14px; border-radius: 8px; font-weight: 700; color: ${newBalance > 0 ? '#c62828' : '#2e7d32'}; }
        .sig-row { display: flex; justify-content: space-between; padding: 30px 40px 10px; }
        .sig-box { text-align: center; }
        .sig-line { border-top: 1px solid #333; width: 120px; margin-bottom: 4px; }
        .footer-note { text-align: center; font-size: 11px; color: #aaa; padding-top: 14px; border-top: 1px dashed #ddd; }
        @media print { body { background: white; padding: 0; } }
      </style>
      </head><body>
      <div class="receipt">
        <div class="header">
          <h1>&#127979; EduConnect School</h1>
          <p>Excellence in Education · Knowledge is Power</p>
        </div>
        <div class="banner">FEE RECEIPT</div>
        <div class="body">
          <div class="row" style="margin-bottom:16px;">
            <div><div class="label">Receipt No.</div><div class="receipt-id">${receiptNo}</div></div>
            <div style="text-align:right"><div class="label">Date</div><div class="value">${new Date(paymentDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div></div>
          </div>
          <div class="info-box">
            <div class="label" style="margin-bottom:8px;">Student Details</div>
            <div class="row"><div><div class="label">Name</div><div class="value">${student?.firstName || ''} ${student?.lastName || ''}</div></div><div style="text-align:right"><div class="label">Admission No.</div><div class="value" style="font-family:monospace">${student?.admissionNo || '-'}</div></div></div>
            <div class="row" style="margin-top:8px;"><div><div class="label">Class</div><div class="value">${student?.schoolClass?.name || '-'}</div></div><div style="text-align:right"><div class="label">Academic Year</div><div class="value">${payment?.academicYear?.name || 'Current Year'}</div></div></div>
          </div>
          ${feeComponents.length > 0 ? `
          <div class="label" style="margin-bottom:6px;">Fee Structure</div>
          ${feeComponents.map(c => `<div class="fee-row"><span>${c.label}</span><span>&#8377;${c.value.toLocaleString()}</span></div>`).join('')}
          <div class="total-row"><span>Total Annual Fee</span><span>&#8377;${totalFee.toLocaleString()}</span></div>
          <hr class="divider"/>` : ''}
          <div class="label" style="margin-bottom:6px;">Payment Details</div>
          ${prevPaid > 0 ? `<div class="fee-row"><span style="color:#888">Previously Paid</span><span style="color:#888">&#8377;${prevPaid.toLocaleString()}</span></div>` : ''}
          <div class="paid-box">
            <div class="label">Amount Paid</div>
            <div class="paid-amount">&#8377;${amount.toLocaleString()}</div>
            <div class="mode-tag">${payment?.paymentMode || 'CASH'}</div>
            ${payment?.transactionId ? `<div style="font-size:12px;color:#555;margin-top:4px;">Txn: ${payment.transactionId}</div>` : ''}
          </div>
          ${totalFee > 0 ? `<div class="balance-box"><span>${newBalance > 0 ? '⚠️ Balance Remaining' : '✓ Fee Cleared'}</span><span>${newBalance > 0 ? '&#8377;' + newBalance.toLocaleString() : 'PAID IN FULL'}</span></div>` : ''}
          ${payment?.remarks ? `<div style="font-size:12px;color:#888;margin-top:8px;font-style:italic;">Remarks: ${payment.remarks}</div>` : ''}
          <div class="sig-row">
            <div class="sig-box"><div class="sig-line"></div><div class="label">Parent Signature</div></div>
            <div class="sig-box"><div class="sig-line"></div><div class="label">Authorized Signature</div></div>
          </div>
          <div class="footer-note">
            This is a computer-generated receipt · EduConnect School Management System<br/>
            For queries, contact the school office
          </div>
        </div>
      </div>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 500);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ bgcolor: '#1a237e', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ReceiptIcon />
          <Typography fontWeight={700}>Fee Receipt</Typography>
        </Box>
        <Button variant="outlined" size="small" startIcon={<PrintIcon />} onClick={handlePrint}
          sx={{ color: 'white', borderColor: 'rgba(255,255,255,0.5)', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', borderColor: 'white' } }}>
          Print
        </Button>
      </DialogTitle>
      <DialogContent sx={{ p: 2, bgcolor: '#f0f0f0' }}>
        <Box ref={printRef}>
          <Box sx={{ border: '2px solid #1a237e', borderRadius: 2, overflow: 'hidden', bgcolor: 'white' }}>
            {/* Header */}
            <Box sx={{ bgcolor: '#1a237e', color: 'white', p: 2.5, textAlign: 'center' }}>
              <SchoolIcon sx={{ fontSize: 36, color: '#FFB300' }} />
              <Typography variant="h5" fontWeight={800} letterSpacing={1}>EduConnect School</Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>Excellence in Education · Knowledge is Power</Typography>
            </Box>
            {/* Banner */}
            <Box sx={{ bgcolor: '#FFB300', py: 1, textAlign: 'center' }}>
              <Typography variant="subtitle1" fontWeight={800} color="#1a237e" letterSpacing={3}>FEE RECEIPT</Typography>
            </Box>
            {/* Body */}
            <Box sx={{ p: 2.5 }}>
              {/* Receipt no + Date */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Receipt No.</Typography>
                  <Typography fontWeight={800} color="#1a237e" fontFamily="monospace">{receiptNo}</Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="caption" color="text.secondary">Date</Typography>
                  <Typography fontWeight={700}>{new Date(paymentDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</Typography>
                </Box>
              </Box>
              {/* Student Info */}
              <Box sx={{ bgcolor: '#f8f9fa', p: 2, borderRadius: 2, mb: 2 }}>
                <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>Student Details</Typography>
                <Grid container spacing={1} sx={{ mt: 0.5 }}>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Name</Typography>
                    <Typography fontWeight={600} fontSize="0.9rem">{student?.firstName} {student?.lastName}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Admission No.</Typography>
                    <Typography fontWeight={600} fontSize="0.9rem" fontFamily="monospace">{student?.admissionNo || '-'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Class</Typography>
                    <Typography fontWeight={600} fontSize="0.9rem">{student?.schoolClass?.name || '-'}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">Academic Year</Typography>
                    <Typography fontWeight={600} fontSize="0.9rem">{payment?.academicYear?.name || 'Current Year'}</Typography>
                  </Grid>
                </Grid>
              </Box>
              {/* Fee breakdown */}
              {feeComponents.length > 0 && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>Fee Structure</Typography>
                  {feeComponents.map(c => (
                    <Box key={c.label} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5, borderBottom: '1px solid #f0f0f0' }}>
                      <Typography variant="body2" color="text.secondary">{c.label}</Typography>
                      <Typography variant="body2" fontWeight={500}>₹{c.value.toLocaleString()}</Typography>
                    </Box>
                  ))}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, bgcolor: '#e8f0fe', px: 1.5, borderRadius: 1, mt: 0.5 }}>
                    <Typography fontWeight={700} fontSize="0.85rem">Total Annual Fee</Typography>
                    <Typography fontWeight={700} color="#1a237e" fontSize="0.85rem">₹{totalFee.toLocaleString()}</Typography>
                  </Box>
                </Box>
              )}
              <Divider sx={{ my: 2, borderStyle: 'dashed' }} />
              {/* Payment details */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>Payment Details</Typography>
                {prevPaid > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">Previously Paid</Typography>
                    <Typography variant="body2" color="text.secondary">₹{prevPaid.toLocaleString()}</Typography>
                  </Box>
                )}
                {/* Amount paid highlight */}
                <Box sx={{ bgcolor: '#e8f5e9', p: 1.5, borderRadius: 2, border: '2px solid #4CAF50', my: 1.5 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="caption" color="#2e7d32" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>Amount Paid</Typography>
                      <Typography variant="h4" fontWeight={800} color="#2e7d32">₹{amount.toLocaleString()}</Typography>
                    </Box>
                    <CheckCircleIcon sx={{ fontSize: 44, color: '#4CAF50' }} />
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, mt: 0.5, flexWrap: 'wrap' }}>
                    <Chip label={payment?.paymentMode || 'CASH'} size="small" sx={{ bgcolor: '#C8E6C9', color: '#1B5E20', fontWeight: 700, fontSize: 10 }} />
                    {payment?.transactionId && <Chip label={`Txn: ${payment.transactionId}`} size="small" variant="outlined" sx={{ fontSize: 10 }} />}
                  </Box>
                </Box>
                {totalFee > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, px: 1.5, bgcolor: newBalance > 0 ? '#ffebee' : '#e8f5e9', borderRadius: 1 }}>
                    <Typography fontWeight={700} fontSize="0.85rem" color={newBalance > 0 ? '#c62828' : '#2e7d32'}>
                      {newBalance > 0 ? '⚠ Balance Remaining' : '✓ Fee Cleared'}
                    </Typography>
                    <Typography fontWeight={800} color={newBalance > 0 ? '#c62828' : '#2e7d32'} fontSize="0.85rem">
                      {newBalance > 0 ? `₹${newBalance.toLocaleString()}` : 'PAID IN FULL'}
                    </Typography>
                  </Box>
                )}
                {payment?.remarks && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', fontStyle: 'italic' }}>
                    Remarks: {payment.remarks}
                  </Typography>
                )}
              </Box>
              <Divider sx={{ my: 2 }} />
              {/* Signatures */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 2, mt: 2 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Box sx={{ borderTop: '1px solid #333', width: 120, mb: 0.5 }} />
                  <Typography variant="caption" color="text.secondary">Parent Signature</Typography>
                </Box>
                <Box sx={{ textAlign: 'center' }}>
                  <Box sx={{ borderTop: '1px solid #333', width: 120, mb: 0.5 }} />
                  <Typography variant="caption" color="text.secondary">Authorized Signature</Typography>
                </Box>
              </Box>
              {/* Footer */}
              <Box sx={{ textAlign: 'center', mt: 2.5, pt: 2, borderTop: '1px dashed #ccc' }}>
                <Typography variant="caption" color="text.secondary">
                  This is a computer-generated receipt · EduConnect School Management System
                </Typography>
                <br />
                <Typography variant="caption" color="text.secondary">For queries, contact the school office</Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="contained" sx={{ bgcolor: '#1a237e' }}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function FeeManagement() {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [feeStructures, setFeeStructures] = useState([]);
  const [payments, setPayments] = useState([]);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [activeYear, setActiveYear] = useState(null);
  const [routes, setRoutes] = useState([]);

  const [openStructureDialog, setOpenStructureDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openRouteDialog, setOpenRouteDialog] = useState(false);
  const [openRouteStudentsDialog, setOpenRouteStudentsDialog] = useState(false);
  const [editingStructure, setEditingStructure] = useState(null);
  const [editingRoute, setEditingRoute] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [selectedRouteForStudents, setSelectedRouteForStudents] = useState(null);
  const [routeStudents, setRouteStudents] = useState([]);

  const [selectedClass, setSelectedClass] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [structureForm, setStructureForm] = useState({
    tuitionFee: '', admissionFee: '', examFee: '', transportFee: '',
    libraryFee: '', labFee: '', sportsFee: '', otherFee: '',
    installmentType: 'MONTHLY', description: '',
  });

  // Payment form
  const [paymentClassId, setPaymentClassId] = useState('');
  const [paymentForm, setPaymentForm] = useState({
    studentId: '', amount: '', paymentMode: 'CASH', transactionId: '', remarks: '',
  });
  const [studentFeeInfo, setStudentFeeInfo] = useState(null); // balance card for selected student

  // Route form
  const [routeForm, setRouteForm] = useState({
    routeName: '', routeCode: '', fromLocation: '', toLocation: '',
    distanceKm: '', monthlyFee: '', annualFee: '', vehicleNumber: '',
    driverName: '', driverPhone: '', description: '', active: true,
  });
  const [assignStudentId, setAssignStudentId] = useState('');
  const [assignRouteId, setAssignRouteId] = useState('');
  const [routeSearchClass, setRouteSearchClass] = useState('');

  // Search / pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Fee Status tab
  const [feeStatusClassFilter, setFeeStatusClassFilter] = useState('');
  const [feeStatusSearch, setFeeStatusSearch] = useState('');
  const [feeStatusPage, setFeeStatusPage] = useState(0);
  const [feeStatusFilter, setFeeStatusFilter] = useState('ALL'); // ALL | PENDING | PARTIAL | PAID

  // Fee Slip Dialog
  const [feeSlipData, setFeeSlipData] = useState(null);
  const [openFeeSlip, setOpenFeeSlip] = useState(false);

  useEffect(() => { fetchInitialData(); }, []);

  // Filter students for Record Payment by class
  useEffect(() => {
    if (paymentClassId) {
      setFilteredStudents(students.filter(s => String(s.schoolClass?.id) === String(paymentClassId)));
      setPaymentForm(f => ({ ...f, studentId: '' }));
    } else {
      setFilteredStudents(students);
    }
  }, [paymentClassId, students]);

  // Compute student fee balance when a student is selected in Record Payment
  useEffect(() => {
    const sid = paymentForm.studentId;
    if (sid && students.length > 0) {
      const student = students.find(s => String(s.id) === String(sid));
      if (!student) { setStudentFeeInfo(null); return; }
      const structure = feeStructures.find(fs =>
        String(fs.schoolClass?.id) === String(student.schoolClass?.id) &&
        (!activeYear || String(fs.academicYear?.id) === String(activeYear?.id))
      );
      const totalFee = parseFloat(structure?.totalFee || 0);
      const paid = payments
        .filter(p => String(p.student?.id) === String(student.id))
        .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
      const balance = Math.max(0, totalFee - paid);
      setStudentFeeInfo({ totalFee, paid, balance, structure });
      if (balance > 0) {
        setPaymentForm(f => ({ ...f, amount: String(Math.round(balance)) }));
      }
    } else {
      setStudentFeeInfo(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paymentForm.studentId]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchClasses(), fetchAcademicYears(), fetchFeeStructures(), fetchPayments(), fetchStudents(), fetchRoutes()]);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const fetchClasses = async () => { const r = await academicAPI.getClasses(); setClasses(r.data); };
  const fetchAcademicYears = async () => {
    const r = await academicAPI.getYears(); setAcademicYears(r.data);
    const active = r.data.find(y => y.isActive);
    if (active) { setActiveYear(active); setSelectedYear(active.id); }
  };
  const fetchFeeStructures = async () => { const r = await feeAPI.getStructures(); setFeeStructures(r.data); };
  const fetchPayments = async () => { const r = await feeAPI.getAllPayments(); setPayments(r.data); };
  const fetchStudents = async () => { const r = await studentAPI.getAll(); setStudents(r.data); setFilteredStudents(r.data); };
  const fetchRoutes = async () => {
    try { const r = await transportAPI.getRoutes(); setRoutes(r.data); } catch (e) { setRoutes([]); }
  };

  const calculateTotalFee = () =>
    ['tuitionFee', 'admissionFee', 'examFee', 'transportFee', 'libraryFee', 'labFee', 'sportsFee', 'otherFee']
      .reduce((s, k) => s + parseFloat(structureForm[k] || 0), 0);

  const handleOpenStructureDialog = (structure = null) => {
    if (structure) {
      setEditingStructure(structure);
      setSelectedClass(structure.schoolClass?.id || '');
      setSelectedYear(structure.academicYear?.id || activeYear?.id || '');
      setStructureForm({
        tuitionFee: structure.tuitionFee || '', admissionFee: structure.admissionFee || '',
        examFee: structure.examFee || '', transportFee: structure.transportFee || '',
        libraryFee: structure.libraryFee || '', labFee: structure.labFee || '',
        sportsFee: structure.sportsFee || '', otherFee: structure.otherFee || '',
        installmentType: structure.installmentType || 'MONTHLY', description: structure.description || '',
      });
    } else {
      setEditingStructure(null); setSelectedClass(''); setSelectedYear(activeYear?.id || '');
      setStructureForm({ tuitionFee: '', admissionFee: '', examFee: '', transportFee: '', libraryFee: '', labFee: '', sportsFee: '', otherFee: '', installmentType: 'MONTHLY', description: '' });
    }
    setOpenStructureDialog(true);
  };

  const handleSaveStructure = async () => {
    if (!selectedClass || !selectedYear) { setSnackbar({ open: true, message: 'Select class and academic year', severity: 'error' }); return; }
    try {
      const data = {
        ...structureForm, totalFee: calculateTotalFee(),
        schoolClass: { id: parseInt(selectedClass) }, academicYear: { id: parseInt(selectedYear) },
      };
      if (editingStructure) { await feeAPI.updateStructure(editingStructure.id, data); setSnackbar({ open: true, message: 'Fee structure updated', severity: 'success' }); }
      else { await feeAPI.createStructure(data); setSnackbar({ open: true, message: 'Fee structure created', severity: 'success' }); }
      setOpenStructureDialog(false); fetchFeeStructures();
    } catch (e) { setSnackbar({ open: true, message: 'Error saving fee structure', severity: 'error' }); }
  };

  const handleDeleteStructure = async () => {
    if (!deletingItem) return;
    try {
      await feeAPI.deleteStructure(deletingItem.id);
      setSnackbar({ open: true, message: 'Deleted', severity: 'success' });
      setOpenDeleteDialog(false); setDeletingItem(null); fetchFeeStructures();
    } catch (e) { setSnackbar({ open: true, message: 'Error deleting', severity: 'error' }); }
  };

  const handleCreatePayment = async () => {
    if (!paymentForm.studentId || !paymentForm.amount) {
      setSnackbar({ open: true, message: 'Select student and enter amount', severity: 'error' }); return;
    }
    try {
      const paymentData = {
        ...paymentForm,
        amount: parseFloat(paymentForm.amount),
        student: { id: parseInt(paymentForm.studentId) },
        academicYear: { id: activeYear?.id || 1 },
        paymentDate: new Date().toISOString().split('T')[0],
      };
      const response = await feeAPI.createPayment(paymentData);
      const responseData = response.data;
      const payment = responseData?.payment || responseData;
      const receipt = responseData?.receipt;

      // Build slip data
      const student = students.find(s => String(s.id) === String(paymentForm.studentId));
      const feeStructure = studentFeeInfo?.structure || null;
      const prevPaid = studentFeeInfo?.paid || 0;
      const totalFee = parseFloat(feeStructure?.totalFee || 0);
      const newBalance = Math.max(0, totalFee - prevPaid - parseFloat(paymentForm.amount));

      setFeeSlipData({
        payment: { ...payment, ...paymentData, academicYear: activeYear },
        receipt,
        student,
        feeStructure,
        prevPaid,
        newBalance,
      });
      setOpenFeeSlip(true);

      setSnackbar({ open: true, message: 'Payment recorded successfully!', severity: 'success' });
      setPaymentForm({ studentId: '', amount: '', paymentMode: 'CASH', transactionId: '', remarks: '' });
      setPaymentClassId('');
      setStudentFeeInfo(null);
      fetchPayments();
    } catch (e) {
      setSnackbar({ open: true, message: 'Error recording payment', severity: 'error' });
    }
  };

  const handleViewReceipt = (payment) => {
    const student = students.find(s => String(s.id) === String(payment.student?.id)) || payment.student;
    const feeStructure = feeStructures.find(fs =>
      String(fs.schoolClass?.id) === String(student?.schoolClass?.id) &&
      (!activeYear || String(fs.academicYear?.id) === String(activeYear?.id))
    );
    const prevPaid = payments
      .filter(p => String(p.student?.id) === String(student?.id) && p.id < payment.id)
      .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
    const totalFee = parseFloat(feeStructure?.totalFee || 0);
    const totalPaidAfter = prevPaid + parseFloat(payment.amount || 0);
    const newBalance = Math.max(0, totalFee - totalPaidAfter);

    setFeeSlipData({
      payment: { ...payment, academicYear: activeYear },
      receipt: { receiptNo: `RCP-${payment.id}` },
      student,
      feeStructure,
      prevPaid,
      newBalance,
    });
    setOpenFeeSlip(true);
  };

  // Quick pay from Fee Status tab — jump to Record Payment with student pre-selected
  const handleQuickPay = (studentRecord) => {
    const s = studentRecord.student;
    setTabValue(1);
    const classId = String(s.schoolClass?.id || '');
    setPaymentClassId(classId);
    setFilteredStudents(students.filter(st => String(st.schoolClass?.id) === classId));
    setPaymentForm(f => ({ ...f, studentId: String(s.id) }));
  };

  const handleOpenRouteDialog = (route = null) => {
    if (route) {
      setEditingRoute(route);
      setRouteForm({
        routeName: route.routeName || '', routeCode: route.routeCode || '',
        fromLocation: route.fromLocation || '', toLocation: route.toLocation || '',
        distanceKm: route.distanceKm || '', monthlyFee: route.monthlyFee || '',
        annualFee: route.annualFee || '', vehicleNumber: route.vehicleNumber || '',
        driverName: route.driverName || '', driverPhone: route.driverPhone || '',
        description: route.description || '', active: route.active !== false,
      });
    } else {
      setEditingRoute(null);
      setRouteForm({ routeName: '', routeCode: '', fromLocation: '', toLocation: '', distanceKm: '', monthlyFee: '', annualFee: '', vehicleNumber: '', driverName: '', driverPhone: '', description: '', active: true });
    }
    setOpenRouteDialog(true);
  };

  const handleSaveRoute = async () => {
    if (!routeForm.routeName || !routeForm.monthlyFee) {
      setSnackbar({ open: true, message: 'Route name and monthly fee required', severity: 'error' }); return;
    }
    try {
      const data = {
        ...routeForm,
        distanceKm: routeForm.distanceKm ? parseFloat(routeForm.distanceKm) : null,
        monthlyFee: parseFloat(routeForm.monthlyFee),
        annualFee: routeForm.annualFee ? parseFloat(routeForm.annualFee) : parseFloat(routeForm.monthlyFee) * 12,
      };
      if (editingRoute) { await transportAPI.updateRoute(editingRoute.id, data); setSnackbar({ open: true, message: 'Route updated', severity: 'success' }); }
      else { await transportAPI.createRoute(data); setSnackbar({ open: true, message: 'Route created', severity: 'success' }); }
      setOpenRouteDialog(false); fetchRoutes();
    } catch (e) { setSnackbar({ open: true, message: 'Error saving route', severity: 'error' }); }
  };

  const handleDeleteRoute = async () => {
    if (!deletingItem) return;
    try {
      await transportAPI.deleteRoute(deletingItem.id);
      setSnackbar({ open: true, message: 'Route deleted', severity: 'success' });
      setOpenDeleteDialog(false); setDeletingItem(null); fetchRoutes();
    } catch (e) { setSnackbar({ open: true, message: 'Error deleting route', severity: 'error' }); }
  };

  const handleViewRouteStudents = async (route) => {
    setSelectedRouteForStudents(route);
    try { const r = await transportAPI.getStudentsByRoute(route.id); setRouteStudents(r.data); } catch (e) { setRouteStudents([]); }
    setOpenRouteStudentsDialog(true);
  };

  const handleAssignRoute = async () => {
    if (!assignStudentId || !assignRouteId) { setSnackbar({ open: true, message: 'Select student and route', severity: 'error' }); return; }
    try {
      await transportAPI.assignRoute(assignStudentId, assignRouteId);
      setSnackbar({ open: true, message: 'Route assigned', severity: 'success' });
      setAssignStudentId(''); setAssignRouteId(''); fetchStudents();
    } catch (e) { setSnackbar({ open: true, message: 'Error assigning route', severity: 'error' }); }
  };

  const handleRemoveStudentRoute = async (studentId) => {
    try {
      await transportAPI.removeRoute(studentId);
      setSnackbar({ open: true, message: 'Route removed', severity: 'success' });
      if (selectedRouteForStudents) {
        const r = await transportAPI.getStudentsByRoute(selectedRouteForStudents.id);
        setRouteStudents(r.data);
      }
      fetchStudents();
    } catch (e) { setSnackbar({ open: true, message: 'Error removing route', severity: 'error' }); }
  };

  // ─── Computed values ────────────────────────────────────────────────────────
  const totalCollection = payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

  const filteredPayments = payments.filter(p => {
    const sl = searchTerm.toLowerCase();
    return `${p.student?.firstName || ''} ${p.student?.lastName || ''}`.toLowerCase().includes(sl)
      || (p.student?.admissionNo || '').toLowerCase().includes(sl);
  });

  const studentsWithRoutes = (routeSearchClass
    ? students.filter(s => String(s.schoolClass?.id) === String(routeSearchClass))
    : students).filter(s => s.transportRoute);

  const allFeeStatusData = students.map(student => {
    const structure = feeStructures.find(s =>
      String(s.schoolClass?.id) === String(student.schoolClass?.id) &&
      (!activeYear || String(s.academicYear?.id) === String(activeYear?.id))
    );
    const totalFee = parseFloat(structure?.totalFee || 0);
    const paid = payments
      .filter(p => String(p.student?.id) === String(student.id))
      .reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
    const balance = Math.max(0, totalFee - paid);
    const statusLabel = totalFee === 0 ? 'NO_STRUCTURE' : balance === 0 ? 'PAID' : paid > 0 ? 'PARTIAL' : 'PENDING';
    return { student, totalFee, paid, balance, statusLabel };
  });

  const totalExpected = allFeeStatusData.reduce((sum, r) => sum + r.totalFee, 0);
  const totalBalance = allFeeStatusData.reduce((sum, r) => sum + r.balance, 0);

  const filteredFeeStatus = allFeeStatusData
    .filter(r => !feeStatusClassFilter || String(r.student.schoolClass?.id) === String(feeStatusClassFilter))
    .filter(r => {
      if (!feeStatusSearch) return true;
      const name = `${r.student.firstName || ''} ${r.student.lastName || ''}`.toLowerCase();
      return name.includes(feeStatusSearch.toLowerCase()) || (r.student.admissionNo || '').toLowerCase().includes(feeStatusSearch.toLowerCase());
    })
    .filter(r => feeStatusFilter === 'ALL' || r.statusLabel === feeStatusFilter)
    .sort((a, b) => b.balance - a.balance); // highest balance first

  // ─── Export functions ───────────────────────────────────────────────────────
  const exportFeeStructuresToExcel = () => {
    const data = feeStructures.map(s => ({
      'Class': s.schoolClass?.name || '', 'Academic Year': s.academicYear?.name || '',
      'Tuition Fee': s.tuitionFee || 0, 'Transport Fee': s.transportFee || 0,
      'Library Fee': s.libraryFee || 0, 'Lab Fee': s.labFee || 0,
      'Sports Fee': s.sportsFee || 0, 'Other Fee': s.otherFee || 0,
      'Total Fee': s.totalFee || 0, 'Installment Type': s.installmentType || 'MONTHLY',
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Fee Structures');
    XLSX.writeFile(wb, `fee_structures_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportPaymentsToExcel = () => {
    const data = filteredPayments.map(p => ({
      'Student Name': `${p.student?.firstName || ''} ${p.student?.lastName || ''}`.trim(),
      'Admission No': p.student?.admissionNo || '', 'Class': p.student?.schoolClass?.name || '',
      'Amount (₹)': parseFloat(p.amount || 0), 'Payment Date': p.paymentDate || '',
      'Payment Mode': p.paymentMode || '', 'Transaction ID': p.transactionId || '', 'Remarks': p.remarks || '',
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Payments');
    XLSX.writeFile(wb, `fee_payments_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportFeeStatusToExcel = () => {
    const data = filteredFeeStatus.map(r => ({
      'Student Name': `${r.student.firstName || ''} ${r.student.lastName || ''}`.trim(),
      'Admission No': r.student.admissionNo || '', 'Class': r.student.schoolClass?.name || '',
      'Total Fee (₹)': r.totalFee, 'Paid (₹)': r.paid, 'Balance (₹)': r.balance, 'Status': r.statusLabel,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Fee Status');
    XLSX.writeFile(wb, `fee_status_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const collectionPercent = totalExpected > 0 ? Math.round((totalCollection / totalExpected) * 100) : 0;

  // ─── JSX ────────────────────────────────────────────────────────────────────
  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a237e' }}>Fee Management</Typography>
          <Typography variant="body2" color="text.secondary">Manage fee structures, collect payments, and track student balances</Typography>
        </Box>
        <Tooltip title="Refresh all data">
          <IconButton onClick={fetchInitialData} sx={{ bgcolor: '#e8f0fe', color: '#1a237e' }}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Stat cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Collection" value={`₹${totalCollection.toLocaleString()}`}
            icon={AccountIcon} gradient="linear-gradient(135deg,#11998e,#38ef7d)" subtitle="All payments recorded" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Payments" value={payments.length}
            icon={PaymentIcon} gradient="linear-gradient(135deg,#667eea,#764ba2)" subtitle="Transactions" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Fee Structures" value={feeStructures.length}
            icon={ReceiptIcon} gradient="linear-gradient(135deg,#f093fb,#f5576c)" subtitle="Configured" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Transport Routes" value={routes.length}
            icon={BusIcon} gradient="linear-gradient(135deg,#4facfe,#00f2fe)" subtitle="Van routes" />
        </Grid>
      </Grid>

      {/* Overview: Expected / Collected / Balance */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ p: 2.5, borderRadius: 2, borderLeft: '5px solid #1565c0', bgcolor: '#e8f0fe' }}>
            <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>Total Expected Fees</Typography>
            <Typography variant="h5" fontWeight={800} color="#1565c0" sx={{ mt: 0.5 }}>₹{totalExpected.toLocaleString()}</Typography>
            <Typography variant="caption" color="text.secondary">Based on fee structures × enrolled students</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ p: 2.5, borderRadius: 2, borderLeft: '5px solid #2e7d32', bgcolor: '#e8f5e9' }}>
            <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>Total Collected</Typography>
            <Typography variant="h5" fontWeight={800} color="#2e7d32" sx={{ mt: 0.5 }}>₹{totalCollection.toLocaleString()}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <LinearProgress variant="determinate" value={collectionPercent} sx={{ flexGrow: 1, height: 6, borderRadius: 3, bgcolor: '#c8e6c9', '& .MuiLinearProgress-bar': { bgcolor: '#2e7d32' } }} />
              <Typography variant="caption" fontWeight={700} color="#2e7d32">{collectionPercent}%</Typography>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ p: 2.5, borderRadius: 2, borderLeft: '5px solid #d32f2f', bgcolor: '#ffebee' }}>
            <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>Balance Pending</Typography>
            <Typography variant="h5" fontWeight={800} color="#d32f2f" sx={{ mt: 0.5 }}>₹{totalBalance.toLocaleString()}</Typography>
            <Typography variant="caption" color="text.secondary">
              {allFeeStatusData.filter(r => r.statusLabel === 'PENDING').length} Pending ·{' '}
              {allFeeStatusData.filter(r => r.statusLabel === 'PARTIAL').length} Partial ·{' '}
              {allFeeStatusData.filter(r => r.statusLabel === 'PAID').length} Paid
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}
          sx={{ bgcolor: '#f8f9fa', '& .MuiTab-root': { fontWeight: 600, textTransform: 'none', fontSize: '0.85rem' } }}
          variant="scrollable" scrollButtons="auto">
          <Tab label="📋 Fee Structures" />
          <Tab label="💳 Record Payment" />
          <Tab label="📜 Payment History" />
          <Tab label="🚌 Van Fees (Routes)" />
          <Tab label="📊 Fee Status" />
        </Tabs>

        {/* ── Tab 0: Fee Structures ── */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mb: 3 }}>
            <Button variant="outlined" size="small" startIcon={<DownloadIcon />} onClick={exportFeeStructuresToExcel}
              disabled={feeStructures.length === 0} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
              Export Excel
            </Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenStructureDialog()}
              sx={{ bgcolor: '#1a237e', '&:hover': { bgcolor: '#0d1642' }, borderRadius: 2, px: 3 }}>
              Create Fee Structure
            </Button>
          </Box>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}><CircularProgress /></Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                    <TableCell><strong>Class</strong></TableCell>
                    <TableCell><strong>Academic Year</strong></TableCell>
                    <TableCell align="right"><strong>Tuition</strong></TableCell>
                    <TableCell align="right"><strong>Transport</strong></TableCell>
                    <TableCell align="right"><strong>Library</strong></TableCell>
                    <TableCell align="right"><strong>Lab</strong></TableCell>
                    <TableCell align="right"><strong>Sports</strong></TableCell>
                    <TableCell align="right"><strong>Other</strong></TableCell>
                    <TableCell align="right"><strong>Total</strong></TableCell>
                    <TableCell><strong>Type</strong></TableCell>
                    <TableCell align="center"><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {feeStructures.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={11} align="center" sx={{ py: 6 }}>
                        <ReceiptIcon sx={{ fontSize: 48, color: '#ccc', display: 'block', mx: 'auto', mb: 1 }} />
                        <Typography color="text.secondary">No fee structures configured yet</Typography>
                        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenStructureDialog()} sx={{ mt: 2, bgcolor: '#1a237e' }}>Create First Structure</Button>
                      </TableCell>
                    </TableRow>
                  ) : feeStructures.map(s => (
                    <TableRow key={s.id} hover>
                      <TableCell><Typography fontWeight={600}>{s.schoolClass?.name || '-'}</Typography></TableCell>
                      <TableCell>{s.academicYear?.name || '-'}</TableCell>
                      <TableCell align="right">₹{(s.tuitionFee || 0).toLocaleString()}</TableCell>
                      <TableCell align="right">
                        {parseFloat(s.transportFee || 0) > 0
                          ? <Chip label={`₹${parseFloat(s.transportFee).toLocaleString()}`} size="small" sx={{ bgcolor: '#e3f2fd', color: '#1565c0', fontWeight: 600 }} icon={<BusIcon sx={{ fontSize: '14px !important' }} />} />
                          : <Typography color="text.disabled" fontSize="0.8rem">—</Typography>}
                      </TableCell>
                      <TableCell align="right">₹{(s.libraryFee || 0).toLocaleString()}</TableCell>
                      <TableCell align="right">₹{(s.labFee || 0).toLocaleString()}</TableCell>
                      <TableCell align="right">₹{(s.sportsFee || 0).toLocaleString()}</TableCell>
                      <TableCell align="right">₹{(s.otherFee || 0).toLocaleString()}</TableCell>
                      <TableCell align="right">
                        <Chip label={`₹${(s.totalFee || 0).toLocaleString()}`} color="primary" size="small" sx={{ fontWeight: 700 }} />
                      </TableCell>
                      <TableCell><Chip label={s.installmentType || 'MONTHLY'} size="small" variant="outlined" /></TableCell>
                      <TableCell align="center">
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => handleOpenStructureDialog(s)} sx={{ color: '#1565c0' }}><EditIcon fontSize="small" /></IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" onClick={() => { setDeletingItem({ ...s, _type: 'structure' }); setOpenDeleteDialog(true); }} sx={{ color: '#d32f2f' }}><DeleteIcon fontSize="small" /></IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>

        {/* ── Tab 1: Record Payment ── */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ maxWidth: 680, mx: 'auto' }}>
            <Card sx={{ p: 3, borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 700, color: '#1a237e' }}>Record New Payment</Typography>
              <Grid container spacing={2.5}>
                {/* Step 1: Class */}
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Step 1 — Select Class *</InputLabel>
                    <Select value={paymentClassId} onChange={e => setPaymentClassId(e.target.value)} label="Step 1 — Select Class *">
                      <MenuItem value=""><em>— All Classes —</em></MenuItem>
                      {classes.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Step 2: Student */}
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Step 2 — Select Student *</InputLabel>
                    <Select value={paymentForm.studentId}
                      onChange={e => setPaymentForm({ ...paymentForm, studentId: e.target.value })}
                      label="Step 2 — Select Student *"
                      disabled={filteredStudents.length === 0}>
                      <MenuItem value=""><em>— Select Student —</em></MenuItem>
                      {filteredStudents.map(s => {
                        const sts = allFeeStatusData.find(r => String(r.student.id) === String(s.id));
                        return (
                          <MenuItem key={s.id} value={s.id}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
                              <span>{s.firstName} {s.lastName} — {s.admissionNo}</span>
                              {sts && sts.balance > 0 && <Chip label={`Bal ₹${sts.balance.toLocaleString()}`} size="small" color="error" sx={{ ml: 1, fontSize: 10 }} />}
                            </Box>
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Balance Card (shown when student selected) */}
                {studentFeeInfo && (
                  <Grid item xs={12}>
                    <Card sx={{
                      p: 2, borderRadius: 2,
                      background: studentFeeInfo.balance > 0
                        ? 'linear-gradient(135deg, #ffebee, #fce4ec)'
                        : 'linear-gradient(135deg, #e8f5e9, #f1f8e9)',
                      border: `2px solid ${studentFeeInfo.balance > 0 ? '#ef9a9a' : '#a5d6a7'}`,
                    }}>
                      <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        Fee Summary for Selected Student
                      </Typography>
                      <Grid container spacing={2} sx={{ mt: 0.5 }}>
                        <Grid item xs={4}>
                          <Typography variant="caption" color="text.secondary">Total Fee</Typography>
                          <Typography fontWeight={700} color="#1565c0">₹{studentFeeInfo.totalFee.toLocaleString()}</Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <Typography variant="caption" color="text.secondary">Already Paid</Typography>
                          <Typography fontWeight={700} color="#2e7d32">₹{studentFeeInfo.paid.toLocaleString()}</Typography>
                        </Grid>
                        <Grid item xs={4}>
                          <Typography variant="caption" color="text.secondary">Balance Due</Typography>
                          <Typography fontWeight={800} color={studentFeeInfo.balance > 0 ? '#c62828' : '#2e7d32'} fontSize="1.1rem">
                            {studentFeeInfo.balance > 0 ? `₹${studentFeeInfo.balance.toLocaleString()}` : '✓ Paid'}
                          </Typography>
                        </Grid>
                      </Grid>
                      {studentFeeInfo.totalFee > 0 && (
                        <Box sx={{ mt: 1.5 }}>
                          <LinearProgress
                            variant="determinate"
                            value={Math.min(100, (studentFeeInfo.paid / studentFeeInfo.totalFee) * 100)}
                            sx={{ height: 8, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.5)', '& .MuiLinearProgress-bar': { bgcolor: studentFeeInfo.balance > 0 ? '#d32f2f' : '#2e7d32' } }}
                          />
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block', textAlign: 'right' }}>
                            {Math.round((studentFeeInfo.paid / studentFeeInfo.totalFee) * 100)}% collected
                          </Typography>
                        </Box>
                      )}
                    </Card>
                  </Grid>
                )}

                {/* Amount */}
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Amount *" type="number" value={paymentForm.amount}
                    onChange={e => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                    InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
                    helperText={studentFeeInfo?.balance > 0 ? `Balance: ₹${studentFeeInfo.balance.toLocaleString()} (pre-filled)` : ''} />
                </Grid>

                {/* Payment Mode */}
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Payment Mode</InputLabel>
                    <Select value={paymentForm.paymentMode}
                      onChange={e => setPaymentForm({ ...paymentForm, paymentMode: e.target.value })}
                      label="Payment Mode">
                      <MenuItem value="CASH">💵 Cash</MenuItem>
                      <MenuItem value="CHEQUE">🏦 Cheque</MenuItem>
                      <MenuItem value="NET_BANKING">🌐 Net Banking</MenuItem>
                      <MenuItem value="CARD">💳 Card</MenuItem>
                      <MenuItem value="UPI">📱 UPI</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* Transaction ID */}
                <Grid item xs={12}>
                  <TextField fullWidth label="Transaction ID (Optional)" value={paymentForm.transactionId}
                    onChange={e => setPaymentForm({ ...paymentForm, transactionId: e.target.value })}
                    placeholder="For UPI / Net Banking / Card payments" />
                </Grid>

                {/* Remarks */}
                <Grid item xs={12}>
                  <TextField fullWidth label="Remarks (Optional)" multiline rows={2} value={paymentForm.remarks}
                    onChange={e => setPaymentForm({ ...paymentForm, remarks: e.target.value })} />
                </Grid>

                {/* Submit */}
                <Grid item xs={12}>
                  <Button variant="contained" fullWidth size="large" onClick={handleCreatePayment}
                    startIcon={<CheckCircleIcon />}
                    sx={{ bgcolor: '#11998e', '&:hover': { bgcolor: '#0a6b5f' }, py: 1.5, borderRadius: 2, fontWeight: 700, fontSize: '1rem' }}>
                    Record Payment & Generate Receipt
                  </Button>
                </Grid>
              </Grid>
            </Card>
          </Box>
        </TabPanel>

        {/* ── Tab 2: Payment History ── */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <TextField placeholder="Search by student name or admission no..." value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)} size="small" sx={{ flexGrow: 1, maxWidth: 400 }}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment> }} />
            <Typography variant="body2" color="text.secondary">{filteredPayments.length} records</Typography>
            <Button variant="outlined" size="small" startIcon={<DownloadIcon />} onClick={exportPaymentsToExcel}
              disabled={filteredPayments.length === 0} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
              Export Excel
            </Button>
          </Box>
          <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                  <TableCell><strong>Student Name</strong></TableCell>
                  <TableCell><strong>Adm. No</strong></TableCell>
                  <TableCell><strong>Class</strong></TableCell>
                  <TableCell align="right"><strong>Amount</strong></TableCell>
                  <TableCell><strong>Date</strong></TableCell>
                  <TableCell><strong>Mode</strong></TableCell>
                  <TableCell><strong>Transaction ID</strong></TableCell>
                  <TableCell><strong>Remarks</strong></TableCell>
                  <TableCell align="center"><strong>Receipt</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 5 }}>
                      <Typography color="text.secondary">No payments found</Typography>
                    </TableCell>
                  </TableRow>
                ) : filteredPayments.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(p => (
                  <TableRow key={p.id} hover>
                    <TableCell><Typography fontWeight={600}>{p.student?.firstName} {p.student?.lastName}</Typography></TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: 12 }}>{p.student?.admissionNo || '-'}</TableCell>
                    <TableCell>{p.student?.schoolClass?.name || '-'}</TableCell>
                    <TableCell align="right">
                      <Chip label={`₹${parseFloat(p.amount || 0).toLocaleString()}`} color="success" size="small" sx={{ fontWeight: 700 }} />
                    </TableCell>
                    <TableCell>{p.paymentDate || '-'}</TableCell>
                    <TableCell>
                      <Chip label={p.paymentMode} size="small" variant="outlined"
                        color={p.paymentMode === 'CASH' ? 'default' : p.paymentMode === 'UPI' ? 'primary' : 'secondary'} />
                    </TableCell>
                    <TableCell sx={{ fontSize: 12, fontFamily: 'monospace' }}>{p.transactionId || '-'}</TableCell>
                    <TableCell sx={{ maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.remarks || '-'}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="View / Print Receipt">
                        <IconButton size="small" onClick={() => handleViewReceipt(p)} sx={{ color: '#1a237e', bgcolor: '#e8f0fe', '&:hover': { bgcolor: '#c5cae9' } }}>
                          <ReceiptIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination component="div" count={filteredPayments.length} page={page}
            onPageChange={(e, np) => setPage(np)} rowsPerPage={rowsPerPage}
            onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            rowsPerPageOptions={[5, 10, 25, 50]} />
        </TabPanel>

        {/* ── Tab 3: Van Fees (Routes) ── */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            {/* Routes Table */}
            <Grid item xs={12} lg={7}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a237e' }}>Transport Routes</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenRouteDialog()}
                  sx={{ bgcolor: '#1a237e', '&:hover': { bgcolor: '#0d1642' }, borderRadius: 2 }}>
                  Add Route
                </Button>
              </Box>
              <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                      <TableCell><strong>Route</strong></TableCell>
                      <TableCell><strong>From → To</strong></TableCell>
                      <TableCell align="right"><strong>Monthly Fee</strong></TableCell>
                      <TableCell><strong>Vehicle / Driver</strong></TableCell>
                      <TableCell><strong>Status</strong></TableCell>
                      <TableCell align="center"><strong>Actions</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {routes.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                          <BusIcon sx={{ fontSize: 48, color: '#ccc', display: 'block', mx: 'auto', mb: 1 }} />
                          <Typography color="text.secondary">No transport routes configured</Typography>
                        </TableCell>
                      </TableRow>
                    ) : routes.map(r => (
                      <TableRow key={r.id} hover>
                        <TableCell>
                          <Typography fontWeight={600} fontSize="0.85rem">{r.routeName}</Typography>
                          {r.routeCode && <Typography variant="caption" color="text.secondary">{r.routeCode}</Typography>}
                        </TableCell>
                        <TableCell>
                          <Typography fontSize="0.8rem">{r.fromLocation || '-'} → {r.toLocation || '-'}</Typography>
                          {r.distanceKm && <Typography variant="caption" color="text.secondary">{r.distanceKm} km</Typography>}
                        </TableCell>
                        <TableCell align="right">
                          <Typography fontWeight={700} color="success.main">₹{r.monthlyFee}/mo</Typography>
                          {r.annualFee && <Typography variant="caption" color="text.secondary">₹{r.annualFee}/yr</Typography>}
                        </TableCell>
                        <TableCell>
                          <Typography fontSize="0.8rem" fontWeight={500}>{r.vehicleNumber || '-'}</Typography>
                          <Typography variant="caption" color="text.secondary">{r.driverName || ''}</Typography>
                        </TableCell>
                        <TableCell><Chip label={r.active ? 'Active' : 'Inactive'} size="small" color={r.active ? 'success' : 'default'} /></TableCell>
                        <TableCell align="center">
                          <Tooltip title="View Students">
                            <IconButton size="small" onClick={() => handleViewRouteStudents(r)} sx={{ color: '#7c4dff' }}><PersonIcon fontSize="small" /></IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton size="small" onClick={() => handleOpenRouteDialog(r)} sx={{ color: '#1565c0' }}><EditIcon fontSize="small" /></IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton size="small" onClick={() => { setDeletingItem({ ...r, _type: 'route' }); setOpenDeleteDialog(true); }} sx={{ color: '#d32f2f' }}><DeleteIcon fontSize="small" /></IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>

            {/* Assign Route Panel */}
            <Grid item xs={12} lg={5}>
              <Card sx={{ p: 3, borderRadius: 2, mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a237e', mb: 2 }}>Assign Route to Student</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Filter by Class</InputLabel>
                      <Select value={routeSearchClass} onChange={e => setRouteSearchClass(e.target.value)} label="Filter by Class">
                        <MenuItem value=""><em>— All Classes —</em></MenuItem>
                        {classes.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Select Student</InputLabel>
                      <Select value={assignStudentId} onChange={e => setAssignStudentId(e.target.value)} label="Select Student">
                        <MenuItem value=""><em>— Select Student —</em></MenuItem>
                        {(routeSearchClass ? students.filter(s => String(s.schoolClass?.id) === String(routeSearchClass)) : students).map(s => (
                          <MenuItem key={s.id} value={s.id}>
                            {s.firstName} {s.lastName} ({s.admissionNo})
                            {s.transportRoute && ` — ${s.transportRoute.routeName}`}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Select Route</InputLabel>
                      <Select value={assignRouteId} onChange={e => setAssignRouteId(e.target.value)} label="Select Route">
                        <MenuItem value=""><em>— Select Route —</em></MenuItem>
                        {routes.filter(r => r.active).map(r => (
                          <MenuItem key={r.id} value={r.id}>{r.routeName} — ₹{r.monthlyFee}/mo</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <Button variant="contained" fullWidth onClick={handleAssignRoute}
                      sx={{ bgcolor: '#7c4dff', '&:hover': { bgcolor: '#5e35b1' }, borderRadius: 2 }}>
                      Assign Route
                    </Button>
                  </Grid>
                </Grid>
              </Card>
              <Card sx={{ p: 2, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle1" fontWeight={700}>Assigned Students ({studentsWithRoutes.length})</Typography>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <InputLabel>Filter Class</InputLabel>
                    <Select value={routeSearchClass} onChange={e => setRouteSearchClass(e.target.value)} label="Filter Class">
                      <MenuItem value=""><em>All</em></MenuItem>
                      {classes.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ maxHeight: 280, overflowY: 'auto' }}>
                  {studentsWithRoutes.length === 0 ? (
                    <Typography color="text.secondary" fontSize="0.85rem" sx={{ py: 2, textAlign: 'center' }}>No students assigned to routes</Typography>
                  ) : studentsWithRoutes.map(s => (
                    <Box key={s.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1, borderBottom: '1px solid #f0f0f0' }}>
                      <Box>
                        <Typography fontWeight={600} fontSize="0.85rem">{s.firstName} {s.lastName}</Typography>
                        <Typography variant="caption" color="text.secondary">{s.schoolClass?.name} · {s.transportRoute?.routeName}</Typography>
                      </Box>
                      <Tooltip title="Remove route">
                        <IconButton size="small" onClick={() => handleRemoveStudentRoute(s.id)} sx={{ color: '#d32f2f' }}><DeleteIcon fontSize="small" /></IconButton>
                      </Tooltip>
                    </Box>
                  ))}
                </Box>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* ── Tab 4: Fee Status ── */}
        <TabPanel value={tabValue} index={4}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a237e' }}>Student Fee Status</Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
              <Chip label={`${allFeeStatusData.filter(r => r.statusLabel === 'PAID').length} Paid`} sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 700 }} />
              <Chip label={`${allFeeStatusData.filter(r => r.statusLabel === 'PARTIAL').length} Partial`} sx={{ bgcolor: '#fff3e0', color: '#e65100', fontWeight: 700 }} />
              <Chip label={`${allFeeStatusData.filter(r => r.statusLabel === 'PENDING').length} Pending`} sx={{ bgcolor: '#ffebee', color: '#c62828', fontWeight: 700 }} />
              <Button variant="outlined" size="small" startIcon={<DownloadIcon />} onClick={exportFeeStatusToExcel}
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
                Export
              </Button>
            </Box>
          </Box>

          {/* Filters */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Filter by Class</InputLabel>
                <Select value={feeStatusClassFilter} onChange={e => { setFeeStatusClassFilter(e.target.value); setFeeStatusPage(0); }} label="Filter by Class">
                  <MenuItem value=""><em>All Classes</em></MenuItem>
                  {classes.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={5}>
              <TextField fullWidth size="small" placeholder="Search by student name or admission no..."
                value={feeStatusSearch}
                onChange={e => { setFeeStatusSearch(e.target.value); setFeeStatusPage(0); }}
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon color="action" fontSize="small" /></InputAdornment> }} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <ToggleButtonGroup value={feeStatusFilter} exclusive size="small" fullWidth
                onChange={(e, val) => { if (val !== null) { setFeeStatusFilter(val); setFeeStatusPage(0); } }}>
                <ToggleButton value="ALL" sx={{ fontWeight: 600, textTransform: 'none', fontSize: 12 }}>All</ToggleButton>
                <ToggleButton value="PENDING" sx={{ fontWeight: 600, textTransform: 'none', fontSize: 12, color: '#c62828', '&.Mui-selected': { bgcolor: '#ffebee', color: '#c62828' } }}>Pending</ToggleButton>
                <ToggleButton value="PARTIAL" sx={{ fontWeight: 600, textTransform: 'none', fontSize: 12, color: '#e65100', '&.Mui-selected': { bgcolor: '#fff3e0', color: '#e65100' } }}>Partial</ToggleButton>
                <ToggleButton value="PAID" sx={{ fontWeight: 600, textTransform: 'none', fontSize: 12, color: '#2e7d32', '&.Mui-selected': { bgcolor: '#e8f5e9', color: '#2e7d32' } }}>Paid</ToggleButton>
              </ToggleButtonGroup>
            </Grid>
          </Grid>

          <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                  <TableCell><strong>Student Name</strong></TableCell>
                  <TableCell><strong>Adm. No</strong></TableCell>
                  <TableCell><strong>Class</strong></TableCell>
                  <TableCell align="right"><strong>Total Fee</strong></TableCell>
                  <TableCell align="right"><strong>Paid</strong></TableCell>
                  <TableCell align="right"><strong>Balance</strong></TableCell>
                  <TableCell><strong>Progress</strong></TableCell>
                  <TableCell align="center"><strong>Status</strong></TableCell>
                  <TableCell align="center"><strong>Action</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredFeeStatus.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                      <BalanceIcon sx={{ fontSize: 48, color: '#ccc', display: 'block', mx: 'auto', mb: 1 }} />
                      <Typography color="text.secondary">No students found</Typography>
                    </TableCell>
                  </TableRow>
                ) : filteredFeeStatus
                  .slice(feeStatusPage * rowsPerPage, feeStatusPage * rowsPerPage + rowsPerPage)
                  .map(r => {
                    const statusConfig = {
                      PAID: { label: 'Paid', bgcolor: '#e8f5e9', color: '#2e7d32' },
                      PARTIAL: { label: 'Partial', bgcolor: '#fff3e0', color: '#e65100' },
                      PENDING: { label: 'Pending', bgcolor: '#ffebee', color: '#c62828' },
                      NO_STRUCTURE: { label: 'No Structure', bgcolor: '#f5f5f5', color: '#888' },
                    }[r.statusLabel] || { label: r.statusLabel, bgcolor: '#f5f5f5', color: '#888' };
                    const pct = r.totalFee > 0 ? Math.min(100, Math.round((r.paid / r.totalFee) * 100)) : 0;
                    return (
                      <TableRow key={r.student.id} hover sx={{ '&:hover': { bgcolor: '#fafafa' } }}>
                        <TableCell><Typography fontWeight={600} fontSize="0.9rem">{r.student.firstName} {r.student.lastName}</Typography></TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: 12, color: '#555' }}>{r.student.admissionNo || '-'}</TableCell>
                        <TableCell>{r.student.schoolClass?.name || '-'}</TableCell>
                        <TableCell align="right">
                          <Typography fontWeight={600} color={r.totalFee > 0 ? 'text.primary' : 'text.disabled'}>
                            {r.totalFee > 0 ? `₹${r.totalFee.toLocaleString()}` : '—'}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography fontWeight={600} color="success.main">{r.paid > 0 ? `₹${r.paid.toLocaleString()}` : '—'}</Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography fontWeight={800} color={r.balance > 0 ? 'error.main' : 'success.main'} fontSize="0.95rem">
                            {r.balance > 0 ? `₹${r.balance.toLocaleString()}` : r.totalFee > 0 ? '✓ Clear' : '—'}
                          </Typography>
                        </TableCell>
                        <TableCell sx={{ minWidth: 100 }}>
                          {r.totalFee > 0 && (
                            <Box>
                              <LinearProgress variant="determinate" value={pct}
                                sx={{ height: 6, borderRadius: 3, bgcolor: '#f0f0f0', '& .MuiLinearProgress-bar': { bgcolor: r.balance > 0 ? '#e53935' : '#43a047' } }} />
                              <Typography variant="caption" color="text.secondary">{pct}%</Typography>
                            </Box>
                          )}
                        </TableCell>
                        <TableCell align="center">
                          <Chip label={statusConfig.label} size="small"
                            sx={{ fontWeight: 700, fontSize: 11, bgcolor: statusConfig.bgcolor, color: statusConfig.color }} />
                        </TableCell>
                        <TableCell align="center">
                          {r.statusLabel !== 'PAID' && r.statusLabel !== 'NO_STRUCTURE' && (
                            <Tooltip title={`Collect payment — ₹${r.balance.toLocaleString()} due`}>
                              <Button size="small" variant="contained" startIcon={<ArrowIcon />}
                                onClick={() => handleQuickPay(r)}
                                sx={{ bgcolor: '#1a237e', '&:hover': { bgcolor: '#0d1642' }, fontSize: 11, py: 0.5, px: 1.5, textTransform: 'none', borderRadius: 2 }}>
                                Pay
                              </Button>
                            </Tooltip>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination component="div" count={filteredFeeStatus.length} page={feeStatusPage}
            onPageChange={(e, np) => setFeeStatusPage(np)} rowsPerPage={rowsPerPage}
            onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setFeeStatusPage(0); }}
            rowsPerPageOptions={[10, 25, 50, 100]} />
        </TabPanel>
      </Paper>

      {/* ── Fee Structure Dialog ── */}
      <Dialog open={openStructureDialog} onClose={() => setOpenStructureDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: '#1a237e', color: 'white' }}>
          {editingStructure ? 'Edit Fee Structure' : 'Create Fee Structure'}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth sx={{ mt: 1 }}>
                <InputLabel>Class *</InputLabel>
                <Select value={selectedClass} onChange={e => setSelectedClass(e.target.value)} label="Class *">
                  {classes.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth sx={{ mt: 1 }}>
                <InputLabel>Academic Year *</InputLabel>
                <Select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} label="Academic Year *">
                  {academicYears.map(y => <MenuItem key={y.id} value={y.id}>{y.name}{y.isActive && ' (Active)'}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>

            {/* Fee fields */}
            {[['tuitionFee', 'Tuition Fee'], ['admissionFee', 'Admission Fee'], ['examFee', 'Exam Fee'], ['transportFee', 'Transport Fee'],
              ['libraryFee', 'Library Fee'], ['labFee', 'Lab Fee'], ['sportsFee', 'Sports Fee'], ['otherFee', 'Other Fee']].map(([k, lbl]) => (
              <Grid item xs={6} sm={3} key={k}>
                <TextField fullWidth label={lbl} type="number" value={structureForm[k]}
                  onChange={e => setStructureForm({ ...structureForm, [k]: e.target.value })}
                  InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} />
              </Grid>
            ))}

            {/* Vehicle fee auto-fill from route */}
            {routes.length > 0 && (
              <Grid item xs={12}>
                <Box sx={{ p: 2, bgcolor: '#e3f2fd', borderRadius: 2, border: '1px dashed #1565c0', display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                  <BusIcon sx={{ color: '#1565c0' }} />
                  <Typography variant="body2" fontWeight={700} color="#1565c0">Auto-fill Transport Fee from Vehicle Route:</Typography>
                  <FormControl size="small" sx={{ minWidth: 220 }}>
                    <InputLabel>Select Route</InputLabel>
                    <Select
                      onChange={e => {
                        const r = routes.find(rt => rt.id === Number(e.target.value));
                        if (r) setStructureForm(f => ({ ...f, transportFee: r.monthlyFee || '' }));
                      }}
                      label="Select Route" value="">
                      <MenuItem value="">-- Pick Route --</MenuItem>
                      {routes.map(r => (
                        <MenuItem key={r.id} value={r.id}>
                          🚌 {r.routeName} — ₹{r.monthlyFee}/mo
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Typography variant="caption" color="text.secondary">Fills the Transport Fee field above</Typography>
                </Box>
              </Grid>
            )}

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Installment Type</InputLabel>
                <Select value={structureForm.installmentType}
                  onChange={e => setStructureForm({ ...structureForm, installmentType: e.target.value })}
                  label="Installment Type">
                  <MenuItem value="MONTHLY">Monthly</MenuItem>
                  <MenuItem value="QUARTERLY">Quarterly</MenuItem>
                  <MenuItem value="HALFYEARLY">Half-Yearly</MenuItem>
                  <MenuItem value="YEARLY">Yearly</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Description (Optional)" value={structureForm.description}
                onChange={e => setStructureForm({ ...structureForm, description: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <Card sx={{ bgcolor: '#e8f5e9', p: 2, borderRadius: 2 }}>
                <Typography variant="h6" color="success.dark" fontWeight={700}>Total Fee: ₹{calculateTotalFee().toLocaleString()}</Typography>
              </Card>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenStructureDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveStructure} variant="contained" sx={{ bgcolor: '#1a237e' }}>
            {editingStructure ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Route Dialog ── */}
      <Dialog open={openRouteDialog} onClose={() => setOpenRouteDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: '#1a237e', color: 'white' }}>
          {editingRoute ? 'Edit Transport Route' : 'Add Transport Route'}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Route Name *" value={routeForm.routeName} onChange={e => setRouteForm({ ...routeForm, routeName: e.target.value })} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Route Code" value={routeForm.routeCode} onChange={e => setRouteForm({ ...routeForm, routeCode: e.target.value })} placeholder="e.g. RT-01" /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="From Location" value={routeForm.fromLocation} onChange={e => setRouteForm({ ...routeForm, fromLocation: e.target.value })} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="To Location (School)" value={routeForm.toLocation} onChange={e => setRouteForm({ ...routeForm, toLocation: e.target.value })} /></Grid>
            <Grid item xs={12} sm={4}><TextField fullWidth label="Distance (km)" type="number" value={routeForm.distanceKm} onChange={e => setRouteForm({ ...routeForm, distanceKm: e.target.value })} /></Grid>
            <Grid item xs={12} sm={4}><TextField fullWidth label="Monthly Fee *" type="number" value={routeForm.monthlyFee} onChange={e => setRouteForm({ ...routeForm, monthlyFee: e.target.value })} InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} /></Grid>
            <Grid item xs={12} sm={4}><TextField fullWidth label="Annual Fee" type="number" value={routeForm.annualFee} onChange={e => setRouteForm({ ...routeForm, annualFee: e.target.value })} InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} placeholder="Auto: ×12" /></Grid>
            <Grid item xs={12} sm={4}><TextField fullWidth label="Vehicle Number" value={routeForm.vehicleNumber} onChange={e => setRouteForm({ ...routeForm, vehicleNumber: e.target.value })} placeholder="e.g. MH-12-AB-1234" /></Grid>
            <Grid item xs={12} sm={4}><TextField fullWidth label="Driver Name" value={routeForm.driverName} onChange={e => setRouteForm({ ...routeForm, driverName: e.target.value })} /></Grid>
            <Grid item xs={12} sm={4}><TextField fullWidth label="Driver Phone" value={routeForm.driverPhone} onChange={e => setRouteForm({ ...routeForm, driverPhone: e.target.value })} /></Grid>
            <Grid item xs={12}><TextField fullWidth label="Description" multiline rows={2} value={routeForm.description} onChange={e => setRouteForm({ ...routeForm, description: e.target.value })} /></Grid>
            <Grid item xs={12}><FormControlLabel control={<Switch checked={routeForm.active} onChange={e => setRouteForm({ ...routeForm, active: e.target.checked })} color="success" />} label="Route Active" /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenRouteDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveRoute} variant="contained" sx={{ bgcolor: '#1a237e' }}>{editingRoute ? 'Update' : 'Add Route'}</Button>
        </DialogActions>
      </Dialog>

      {/* ── Route Students Dialog ── */}
      <Dialog open={openRouteStudentsDialog} onClose={() => setOpenRouteStudentsDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#1a237e', color: 'white' }}>
          Students on Route: {selectedRouteForStudents?.routeName}
        </DialogTitle>
        <DialogContent sx={{ mt: 1 }}>
          {routeStudents.length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>No students on this route</Typography>
          ) : routeStudents.map(s => (
            <Box key={s.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.5, borderBottom: '1px solid #f0f0f0' }}>
              <Box>
                <Typography fontWeight={600}>{s.firstName} {s.lastName}</Typography>
                <Typography variant="caption" color="text.secondary">{s.admissionNo} · {s.schoolClass?.name}</Typography>
              </Box>
              <IconButton size="small" onClick={() => handleRemoveStudentRoute(s.id)} sx={{ color: '#d32f2f' }}>
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
        </DialogContent>
        <DialogActions><Button onClick={() => setOpenRouteStudentsDialog(false)}>Close</Button></DialogActions>
      </Dialog>

      {/* ── Delete Confirmation ── */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete <strong>
            {deletingItem?._type === 'route' ? deletingItem?.routeName : deletingItem?.schoolClass?.name}
          </strong>?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={deletingItem?._type === 'route' ? handleDeleteRoute : handleDeleteStructure} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* ── Fee Slip Dialog ── */}
      <FeeSlipDialog open={openFeeSlip} onClose={() => setOpenFeeSlip(false)} slipData={feeSlipData} />

      {/* ── Snackbar ── */}
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
