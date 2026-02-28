import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, TextField, Grid, Dialog, DialogTitle,
  DialogContent, DialogActions, Tab, Tabs, MenuItem, Select, FormControl,
  InputLabel, Card, CardContent, Chip, IconButton, Snackbar, Alert,
  Tooltip, InputAdornment, TablePagination, CircularProgress, Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon, Search as SearchIcon,
  Receipt as ReceiptIcon, AccountBalance as AccountIcon, TrendingUp as TrendingIcon,
  Payment as PaymentIcon, DirectionsBus as BusIcon, Person as PersonIcon,
  FileDownload as DownloadIcon, CheckCircle as CheckCircleIcon,
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

  // Payment form with class→student flow
  const [paymentClassId, setPaymentClassId] = useState('');
  const [paymentForm, setPaymentForm] = useState({
    studentId: '', amount: '', paymentMode: 'CASH', transactionId: '', remarks: '',
  });

  const [routeForm, setRouteForm] = useState({
    routeName: '', routeCode: '', fromLocation: '', toLocation: '',
    distanceKm: '', monthlyFee: '', annualFee: '', vehicleNumber: '',
    driverName: '', driverPhone: '', description: '', active: true,
  });

  const [assignStudentId, setAssignStudentId] = useState('');
  const [assignRouteId, setAssignRouteId] = useState('');
  const [routeSearchClass, setRouteSearchClass] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Fee Status tab state
  const [feeStatusClassFilter, setFeeStatusClassFilter] = useState('');
  const [feeStatusSearch, setFeeStatusSearch] = useState('');
  const [feeStatusPage, setFeeStatusPage] = useState(0);

  useEffect(() => { fetchInitialData(); }, []);

  useEffect(() => {
    if (paymentClassId) {
      setFilteredStudents(students.filter(s => String(s.schoolClass?.id) === String(paymentClassId)));
      setPaymentForm(f => ({ ...f, studentId: '' }));
    } else {
      setFilteredStudents(students);
    }
  }, [paymentClassId, students]);

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
    ['tuitionFee','admissionFee','examFee','transportFee','libraryFee','labFee','sportsFee','otherFee']
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
      setStructureForm({ tuitionFee:'', admissionFee:'', examFee:'', transportFee:'', libraryFee:'', labFee:'', sportsFee:'', otherFee:'', installmentType:'MONTHLY', description:'' });
    }
    setOpenStructureDialog(true);
  };

  const handleSaveStructure = async () => {
    if (!selectedClass || !selectedYear) { setSnackbar({ open: true, message: 'Select class and academic year', severity: 'error' }); return; }
    try {
      const data = { ...structureForm, totalFee: calculateTotalFee(),
        schoolClass: { id: parseInt(selectedClass) }, academicYear: { id: parseInt(selectedYear) } };
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
    if (!paymentForm.studentId || !paymentForm.amount) { setSnackbar({ open: true, message: 'Fill required fields', severity: 'error' }); return; }
    try {
      const data = { ...paymentForm, amount: parseFloat(paymentForm.amount),
        student: { id: parseInt(paymentForm.studentId) },
        academicYear: { id: activeYear?.id || 1 },
        paymentDate: new Date().toISOString().split('T')[0] };
      await feeAPI.createPayment(data);
      setSnackbar({ open: true, message: 'Payment recorded', severity: 'success' });
      setPaymentForm({ studentId:'', amount:'', paymentMode:'CASH', transactionId:'', remarks:'' });
      setPaymentClassId(''); fetchPayments();
    } catch (e) { setSnackbar({ open: true, message: 'Error recording payment', severity: 'error' }); }
  };

  const handleOpenRouteDialog = (route = null) => {
    if (route) {
      setEditingRoute(route);
      setRouteForm({ routeName: route.routeName||'', routeCode: route.routeCode||'',
        fromLocation: route.fromLocation||'', toLocation: route.toLocation||'',
        distanceKm: route.distanceKm||'', monthlyFee: route.monthlyFee||'',
        annualFee: route.annualFee||'', vehicleNumber: route.vehicleNumber||'',
        driverName: route.driverName||'', driverPhone: route.driverPhone||'',
        description: route.description||'', active: route.active !== false });
    } else {
      setEditingRoute(null);
      setRouteForm({ routeName:'', routeCode:'', fromLocation:'', toLocation:'', distanceKm:'', monthlyFee:'', annualFee:'', vehicleNumber:'', driverName:'', driverPhone:'', description:'', active: true });
    }
    setOpenRouteDialog(true);
  };

  const handleSaveRoute = async () => {
    if (!routeForm.routeName || !routeForm.monthlyFee) { setSnackbar({ open: true, message: 'Route name and monthly fee required', severity: 'error' }); return; }
    try {
      const data = { ...routeForm,
        distanceKm: routeForm.distanceKm ? parseFloat(routeForm.distanceKm) : null,
        monthlyFee: parseFloat(routeForm.monthlyFee),
        annualFee: routeForm.annualFee ? parseFloat(routeForm.annualFee) : parseFloat(routeForm.monthlyFee) * 12 };
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
        const r = await transportAPI.getStudentsByRoute(selectedRouteForStudents.id); setRouteStudents(r.data);
      }
      fetchStudents();
    } catch (e) { setSnackbar({ open: true, message: 'Error removing route', severity: 'error' }); }
  };

  const totalCollection = payments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

  const filteredPayments = payments.filter(p => {
    const sl = searchTerm.toLowerCase();
    return `${p.student?.firstName||''} ${p.student?.lastName||''}`.toLowerCase().includes(sl)
      || (p.student?.admissionNo||'').toLowerCase().includes(sl);
  });
  const studentsWithRoutes = (routeSearchClass
    ? students.filter(s => String(s.schoolClass?.id) === String(routeSearchClass))
    : students).filter(s => s.transportRoute);

  // Compute per-student fee status from existing loaded data
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
    });

  const exportFeeStructuresToExcel = () => {
    const data = feeStructures.map(s => ({
      'Class': s.schoolClass?.name || '',
      'Academic Year': s.academicYear?.name || '',
      'Tuition Fee': s.tuitionFee || 0,
      'Transport Fee': s.transportFee || 0,
      'Library Fee': s.libraryFee || 0,
      'Lab Fee': s.labFee || 0,
      'Sports Fee': s.sportsFee || 0,
      'Other Fee': s.otherFee || 0,
      'Total Fee': s.totalFee || 0,
      'Installment Type': s.installmentType || 'MONTHLY',
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Fee Structures');
    XLSX.writeFile(wb, `fee_structures_export_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportPaymentsToExcel = () => {
    const data = filteredPayments.map(p => ({
      'Student Name': `${p.student?.firstName || ''} ${p.student?.lastName || ''}`.trim(),
      'Admission No': p.student?.admissionNo || '',
      'Class': p.student?.schoolClass?.name || '',
      'Amount (₹)': parseFloat(p.amount || 0),
      'Payment Date': p.paymentDate || '',
      'Payment Mode': p.paymentMode || '',
      'Transaction ID': p.transactionId || '',
      'Remarks': p.remarks || '',
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Payments');
    XLSX.writeFile(wb, `fee_payments_export_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a237e' }}>Fee Management</Typography>
          <Typography variant="body2" color="text.secondary">Fee structures, payments and van transport routes</Typography>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Collection" value={`₹${totalCollection.toLocaleString()}`}
            icon={AccountIcon} gradient="linear-gradient(135deg,#11998e,#38ef7d)" subtitle="All time" />
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

      {/* Fee Overview: Expected / Collected / Balance */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ p: 2.5, borderRadius: 2, borderLeft: '5px solid #1565c0', bgcolor: '#e8f0fe' }}>
            <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Total Expected Fees
            </Typography>
            <Typography variant="h5" fontWeight={800} color="#1565c0" sx={{ mt: 0.5 }}>
              ₹{totalExpected.toLocaleString()}
            </Typography>
            <Typography variant="caption" color="text.secondary">Based on fee structures × enrolled students</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ p: 2.5, borderRadius: 2, borderLeft: '5px solid #2e7d32', bgcolor: '#e8f5e9' }}>
            <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Total Collected
            </Typography>
            <Typography variant="h5" fontWeight={800} color="#2e7d32" sx={{ mt: 0.5 }}>
              ₹{totalCollection.toLocaleString()}
            </Typography>
            <Typography variant="caption" color="text.secondary">All recorded payments</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ p: 2.5, borderRadius: 2, borderLeft: '5px solid #d32f2f', bgcolor: '#ffebee' }}>
            <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Balance Pending
            </Typography>
            <Typography variant="h5" fontWeight={800} color="#d32f2f" sx={{ mt: 0.5 }}>
              ₹{totalBalance.toLocaleString()}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {allFeeStatusData.filter(r => r.statusLabel === 'PENDING').length} Pending ·{' '}
              {allFeeStatusData.filter(r => r.statusLabel === 'PARTIAL').length} Partial ·{' '}
              {allFeeStatusData.filter(r => r.statusLabel === 'PAID').length} Paid
            </Typography>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}
          sx={{ bgcolor: '#f8f9fa', '& .MuiTab-root': { fontWeight: 600, textTransform: 'none' } }}>
          <Tab label="Fee Structures" />
          <Tab label="Record Payment" />
          <Tab label="Payment History" />
          <Tab label="🚌 Van Fees (Routes)" />
          <Tab label="📊 Fee Status" />
        </Tabs>

        {/* Tab 0: Fee Structures */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mb: 3 }}>
            <Button variant="outlined" size="small" startIcon={<DownloadIcon />} onClick={exportFeeStructuresToExcel}
              disabled={feeStructures.length === 0}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
              Export Excel
            </Button>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenStructureDialog()}
              sx={{ bgcolor: '#1a237e', '&:hover': { bgcolor: '#0d1642' }, borderRadius: 2, px: 3 }}>
              Create Fee Structure
            </Button>
          </Box>
          {loading ? <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}><CircularProgress /></Box> : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Class</TableCell><TableCell>Academic Year</TableCell>
                    <TableCell align="right">Tuition</TableCell><TableCell align="right">Transport</TableCell>
                    <TableCell align="right">Library</TableCell><TableCell align="right">Lab</TableCell>
                    <TableCell align="right">Sports</TableCell><TableCell align="right">Other</TableCell>
                    <TableCell align="right">Total</TableCell><TableCell>Type</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {feeStructures.length === 0 ? (
                    <TableRow><TableCell colSpan={11} align="center" sx={{ py: 5 }}>
                      <Typography color="text.secondary">No fee structures found</Typography>
                    </TableCell></TableRow>
                  ) : feeStructures.map(s => (
                    <TableRow key={s.id} hover>
                      <TableCell><Typography fontWeight={500}>{s.schoolClass?.name||'-'}</Typography></TableCell>
                      <TableCell>{s.academicYear?.name||'-'}</TableCell>
                      <TableCell align="right">₹{s.tuitionFee||0}</TableCell>
                      <TableCell align="right">₹{s.transportFee||0}</TableCell>
                      <TableCell align="right">₹{s.libraryFee||0}</TableCell>
                      <TableCell align="right">₹{s.labFee||0}</TableCell>
                      <TableCell align="right">₹{s.sportsFee||0}</TableCell>
                      <TableCell align="right">₹{s.otherFee||0}</TableCell>
                      <TableCell align="right"><Chip label={`₹${s.totalFee||0}`} color="primary" size="small" sx={{ fontWeight: 600 }} /></TableCell>
                      <TableCell><Chip label={s.installmentType||'MONTHLY'} size="small" variant="outlined" /></TableCell>
                      <TableCell align="center">
                        <Tooltip title="Edit"><IconButton size="small" onClick={() => handleOpenStructureDialog(s)} sx={{ color: '#1565c0' }}><EditIcon fontSize="small" /></IconButton></Tooltip>
                        <Tooltip title="Delete"><IconButton size="small" onClick={() => { setDeletingItem({ ...s, _type: 'structure' }); setOpenDeleteDialog(true); }} sx={{ color: '#d32f2f' }}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </TabPanel>

        {/* Tab 1: Record Payment — Class → Student */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ maxWidth: 620, mx: 'auto' }}>
            <Card sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: '#1a237e' }}>Record New Payment</Typography>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Step 1 — Select Class *</InputLabel>
                    <Select value={paymentClassId} onChange={e => setPaymentClassId(e.target.value)} label="Step 1 — Select Class *">
                      <MenuItem value=""><em>— All Classes —</em></MenuItem>
                      {classes.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Step 2 — Select Student *</InputLabel>
                    <Select value={paymentForm.studentId}
                      onChange={e => setPaymentForm({ ...paymentForm, studentId: e.target.value })}
                      label="Step 2 — Select Student *"
                      disabled={filteredStudents.length === 0}>
                      <MenuItem value=""><em>— Select Student —</em></MenuItem>
                      {filteredStudents.map(s => (
                        <MenuItem key={s.id} value={s.id}>
                          {s.firstName} {s.lastName} — {s.admissionNo}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Amount *" type="number" value={paymentForm.amount}
                    onChange={e => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                    InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Payment Mode</InputLabel>
                    <Select value={paymentForm.paymentMode}
                      onChange={e => setPaymentForm({ ...paymentForm, paymentMode: e.target.value })}
                      label="Payment Mode">
                      <MenuItem value="CASH">Cash</MenuItem>
                      <MenuItem value="CHEQUE">Cheque</MenuItem>
                      <MenuItem value="NET_BANKING">Net Banking</MenuItem>
                      <MenuItem value="CARD">Card</MenuItem>
                      <MenuItem value="UPI">UPI</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Transaction ID (Optional)" value={paymentForm.transactionId}
                    onChange={e => setPaymentForm({ ...paymentForm, transactionId: e.target.value })}
                    placeholder="For UPI / Net Banking / Card payments" />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Remarks (Optional)" multiline rows={2} value={paymentForm.remarks}
                    onChange={e => setPaymentForm({ ...paymentForm, remarks: e.target.value })} />
                </Grid>
                <Grid item xs={12}>
                  <Button variant="contained" fullWidth size="large" onClick={handleCreatePayment}
                    sx={{ bgcolor: '#11998e', '&:hover': { bgcolor: '#0a6b5f' }, py: 1.5, borderRadius: 2 }}>
                    Record Payment
                  </Button>
                </Grid>
              </Grid>
            </Card>
          </Box>
        </TabPanel>

        {/* Tab 2: Payment History */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <TextField placeholder="Search by student name or admission no..." value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)} size="small" sx={{ flexGrow: 1, maxWidth: 400 }}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment> }} />
            <Typography variant="body2" color="text.secondary">{filteredPayments.length} records</Typography>
            <Button variant="outlined" size="small" startIcon={<DownloadIcon />} onClick={exportPaymentsToExcel}
              disabled={filteredPayments.length === 0}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
              Export Excel
            </Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Student Name</TableCell><TableCell>Admission No</TableCell>
                  <TableCell>Class</TableCell><TableCell align="right">Amount</TableCell>
                  <TableCell>Date</TableCell><TableCell>Mode</TableCell>
                  <TableCell>Transaction ID</TableCell><TableCell>Remarks</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPayments.length === 0 ? (
                  <TableRow><TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                    <Typography color="text.secondary">No payments found</Typography>
                  </TableCell></TableRow>
                ) : filteredPayments.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(p => (
                  <TableRow key={p.id} hover>
                    <TableCell><Typography fontWeight={500}>{p.student?.firstName} {p.student?.lastName}</Typography></TableCell>
                    <TableCell>{p.student?.admissionNo||'-'}</TableCell>
                    <TableCell>{p.student?.schoolClass?.name||'-'}</TableCell>
                    <TableCell align="right"><Chip label={`₹${parseFloat(p.amount||0).toLocaleString()}`} color="success" size="small" sx={{ fontWeight: 600 }} /></TableCell>
                    <TableCell>{p.paymentDate||'-'}</TableCell>
                    <TableCell><Chip label={p.paymentMode} size="small" variant="outlined"
                      color={p.paymentMode==='CASH'?'default':p.paymentMode==='UPI'?'primary':'secondary'} /></TableCell>
                    <TableCell>{p.transactionId||'-'}</TableCell>
                    <TableCell>{p.remarks||'-'}</TableCell>
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

        {/* Tab 3: Van Fees (Routes) */}
        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            {/* Routes Table */}
            <Grid item xs={12} lg={7}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a237e' }}>Transport Routes</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenRouteDialog()}
                  sx={{ bgcolor: '#1a237e', '&:hover': { bgcolor: '#0d1642' }, borderRadius: 2 }}>
                  Add Route
                </Button>
              </Box>
              <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Route</TableCell><TableCell>From → To</TableCell>
                      <TableCell align="right">Monthly Fee</TableCell><TableCell>Vehicle / Driver</TableCell>
                      <TableCell>Status</TableCell><TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {routes.length === 0 ? (
                      <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                        <BusIcon sx={{ fontSize: 40, color: '#ccc', display: 'block', mx: 'auto', mb: 1 }} />
                        <Typography color="text.secondary">No transport routes configured</Typography>
                      </TableCell></TableRow>
                    ) : routes.map(r => (
                      <TableRow key={r.id} hover>
                        <TableCell>
                          <Typography fontWeight={600} fontSize="0.85rem">{r.routeName}</Typography>
                          {r.routeCode && <Typography variant="caption" color="text.secondary">{r.routeCode}</Typography>}
                        </TableCell>
                        <TableCell>
                          <Typography fontSize="0.8rem">{r.fromLocation||'-'} → {r.toLocation||'-'}</Typography>
                          {r.distanceKm && <Typography variant="caption" color="text.secondary">{r.distanceKm} km</Typography>}
                        </TableCell>
                        <TableCell align="right">
                          <Typography fontWeight={600} color="success.main" fontSize="0.85rem">₹{r.monthlyFee}/mo</Typography>
                          {r.annualFee && <Typography variant="caption" color="text.secondary">₹{r.annualFee}/yr</Typography>}
                        </TableCell>
                        <TableCell>
                          <Typography fontSize="0.8rem">{r.vehicleNumber||'-'}</Typography>
                          <Typography variant="caption" color="text.secondary">{r.driverName||''}</Typography>
                        </TableCell>
                        <TableCell><Chip label={r.active?'Active':'Inactive'} size="small" color={r.active?'success':'default'} /></TableCell>
                        <TableCell align="center">
                          <Tooltip title="View Students"><IconButton size="small" onClick={() => handleViewRouteStudents(r)} sx={{ color: '#7c4dff' }}><PersonIcon fontSize="small" /></IconButton></Tooltip>
                          <Tooltip title="Edit"><IconButton size="small" onClick={() => handleOpenRouteDialog(r)} sx={{ color: '#1565c0' }}><EditIcon fontSize="small" /></IconButton></Tooltip>
                          <Tooltip title="Delete"><IconButton size="small" onClick={() => { setDeletingItem({ ...r, _type: 'route' }); setOpenDeleteDialog(true); }} sx={{ color: '#d32f2f' }}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
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
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a237e', mb: 2 }}>Assign Route to Student</Typography>
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
                        {(routeSearchClass ? students.filter(s => String(s.schoolClass?.id) === String(routeSearchClass)) : students)
                          .map(s => (
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
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Assigned Students ({studentsWithRoutes.length})
                  </Typography>
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
                    <Typography color="text.secondary" fontSize="0.85rem" sx={{ py: 2, textAlign: 'center' }}>
                      No students assigned to routes
                    </Typography>
                  ) : studentsWithRoutes.map(s => (
                    <Box key={s.id} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      py: 1, borderBottom: '1px solid #f0f0f0' }}>
                      <Box>
                        <Typography fontWeight={500} fontSize="0.85rem">{s.firstName} {s.lastName}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {s.schoolClass?.name} · {s.transportRoute?.routeName}
                        </Typography>
                      </Box>
                      <Tooltip title="Remove route">
                        <IconButton size="small" onClick={() => handleRemoveStudentRoute(s.id)} sx={{ color: '#d32f2f' }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  ))}
                </Box>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        {/* Tab 4: Fee Status */}
        <TabPanel value={tabValue} index={4}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a237e' }}>Student Fee Status</Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip label={`${allFeeStatusData.filter(r => r.statusLabel === 'PAID').length} Paid`} sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 700 }} />
              <Chip label={`${allFeeStatusData.filter(r => r.statusLabel === 'PARTIAL').length} Partial`} sx={{ bgcolor: '#fff3e0', color: '#e65100', fontWeight: 700 }} />
              <Chip label={`${allFeeStatusData.filter(r => r.statusLabel === 'PENDING').length} Pending`} sx={{ bgcolor: '#ffebee', color: '#c62828', fontWeight: 700 }} />
              <Chip label={`${allFeeStatusData.filter(r => r.statusLabel === 'NO_STRUCTURE').length} No Structure`} sx={{ bgcolor: '#f5f5f5', color: '#888', fontWeight: 700 }} />
            </Box>
          </Box>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Filter by Class</InputLabel>
                <Select value={feeStatusClassFilter} onChange={e => { setFeeStatusClassFilter(e.target.value); setFeeStatusPage(0); }} label="Filter by Class">
                  <MenuItem value=""><em>All Classes</em></MenuItem>
                  {classes.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={5}>
              <TextField
                fullWidth size="small"
                placeholder="Search by student name or admission no..."
                value={feeStatusSearch}
                onChange={e => { setFeeStatusSearch(e.target.value); setFeeStatusPage(0); }}
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon color="action" fontSize="small" /></InputAdornment> }}
              />
            </Grid>
          </Grid>

          <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Student Name</TableCell>
                  <TableCell>Adm. No</TableCell>
                  <TableCell>Class</TableCell>
                  <TableCell align="right">Total Fee</TableCell>
                  <TableCell align="right">Paid</TableCell>
                  <TableCell align="right">Balance</TableCell>
                  <TableCell align="center">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredFeeStatus.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
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
                    return (
                      <TableRow key={r.student.id} hover>
                        <TableCell><Typography fontWeight={500}>{r.student.firstName} {r.student.lastName}</Typography></TableCell>
                        <TableCell sx={{ fontFamily: 'monospace', fontSize: 12 }}>{r.student.admissionNo || '-'}</TableCell>
                        <TableCell>{r.student.schoolClass?.name || '-'}</TableCell>
                        <TableCell align="right">
                          <Typography fontWeight={600} color={r.totalFee > 0 ? 'text.primary' : 'text.disabled'}>
                            {r.totalFee > 0 ? `₹${r.totalFee.toLocaleString()}` : '—'}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography fontWeight={600} color="success.main">
                            {r.paid > 0 ? `₹${r.paid.toLocaleString()}` : '—'}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography fontWeight={700} color={r.balance > 0 ? 'error.main' : 'success.main'}>
                            {r.balance > 0 ? `₹${r.balance.toLocaleString()}` : r.totalFee > 0 ? '✓ Clear' : '—'}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={statusConfig.label}
                            size="small"
                            sx={{ fontWeight: 700, fontSize: 11, bgcolor: statusConfig.bgcolor, color: statusConfig.color }}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={filteredFeeStatus.length}
            page={feeStatusPage}
            onPageChange={(e, np) => setFeeStatusPage(np)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setFeeStatusPage(0); }}
            rowsPerPageOptions={[10, 25, 50, 100]}
          />
        </TabPanel>

      </Paper>

      {/* Fee Structure Dialog */}
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
            {[['tuitionFee','Tuition Fee'],['admissionFee','Admission Fee'],['examFee','Exam Fee'],['transportFee','Transport Fee'],
              ['libraryFee','Library Fee'],['labFee','Lab Fee'],['sportsFee','Sports Fee'],['otherFee','Other Fee']].map(([k, lbl]) => (
              <Grid item xs={6} sm={3} key={k}>
                <TextField fullWidth label={lbl} type="number" value={structureForm[k]}
                  onChange={e => setStructureForm({ ...structureForm, [k]: e.target.value })}
                  InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} />
              </Grid>
            ))}
            {routes.length > 0 && (
              <Grid item xs={12}>
                <Box sx={{ p: 1.5, bgcolor: '#e8f4fd', borderRadius: 2, border: '1px dashed #1565c0', display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                  <BusIcon sx={{ color: '#1565c0' }} />
                  <Typography variant="body2" fontWeight={600} color="#1565c0">Auto-fill Transport Fee from Vehicle Route:</Typography>
                  <FormControl size="small" sx={{ minWidth: 200 }}>
                    <InputLabel>Select Route</InputLabel>
                    <Select
                      onChange={e => {
                        const r = routes.find(rt => rt.id === Number(e.target.value));
                        if (r) setStructureForm(f => ({ ...f, transportFee: r.monthlyFee || '' }));
                      }}
                      label="Select Route"
                      value=""
                    >
                      <MenuItem value="">-- Pick Route --</MenuItem>
                      {routes.map(r => (
                        <MenuItem key={r.id} value={r.id}>{r.routeName} — ₹{r.monthlyFee}/mo</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Typography variant="caption" color="text.secondary">Fills the Transport Fee field below</Typography>
                </Box>
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Installment Type</InputLabel>
                <Select value={structureForm.installmentType}
                  onChange={e => setStructureForm({ ...structureForm, installmentType: e.target.value })} label="Installment Type">
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
              <Card sx={{ bgcolor: '#e8f5e9', p: 2 }}>
                <Typography variant="h6" color="success.dark">Total Fee: ₹{calculateTotalFee().toLocaleString()}</Typography>
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

      {/* Route Dialog */}
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

      {/* Route Students Dialog */}
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
                <Typography fontWeight={500}>{s.firstName} {s.lastName}</Typography>
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

      {/* Delete Confirmation */}
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

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
