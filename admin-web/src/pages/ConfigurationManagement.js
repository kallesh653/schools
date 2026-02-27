import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, Card, CardContent, Button, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions, Tab, Tabs, MenuItem,
  Select, FormControl, InputLabel, Chip, IconButton, Snackbar, Alert,
  Tooltip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Switch, FormControlLabel, InputAdornment, Stepper, Step, StepLabel,
  StepContent, CircularProgress, Divider, Avatar, List, ListItem,
  ListItemText, ListItemSecondaryAction,
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
  School as SchoolIcon, Class as ClassIcon, Subject as SubjectIcon,
  CalendarToday as CalendarIcon, PersonAdd as PersonAddIcon,
  CheckCircle as CheckIcon, Settings as SettingsIcon,
  AccountBalance as FeeIcon, Group as GroupIcon,
} from '@mui/icons-material';
import { academicAPI, studentAPI, feeAPI } from '../services/api';

function TabPanel({ children, value, index }) {
  return value === index ? <Box sx={{ p: 3 }}>{children}</Box> : null;
}

const sectionGradients = [
  'linear-gradient(135deg,#1a237e,#283593)',
  'linear-gradient(135deg,#00695c,#00897b)',
  'linear-gradient(135deg,#6a1b9a,#8e24aa)',
  'linear-gradient(135deg,#e65100,#f57c00)',
  'linear-gradient(135deg,#1565c0,#1976d2)',
];

export default function ConfigurationManagement() {
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(false);

  // Data
  const [academicYears, setAcademicYears] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [feeStructures, setFeeStructures] = useState([]);
  const [students, setStudents] = useState([]);

  // Dialogs
  const [yearDialog, setYearDialog] = useState(false);
  const [classDialog, setClassDialog] = useState(false);
  const [sectionDialog, setSectionDialog] = useState(false);
  const [subjectDialog, setSubjectDialog] = useState(false);
  const [feeDialog, setFeeDialog] = useState(false);
  const [admissionDialog, setAdmissionDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, type: '', item: null });
  const [editItem, setEditItem] = useState(null);

  // Forms
  const [yearForm, setYearForm] = useState({ name: '', startDate: '', endDate: '', isActive: false });
  const [classForm, setClassForm] = useState({ name: '', code: '', grade: '', capacity: 40, description: '' });
  const [sectionForm, setSectionForm] = useState({ name: '', classId: '', capacity: 40 });
  const [subjectForm, setSubjectForm] = useState({
    name: '', code: '', subjectType: 'THEORY', maxMarks: 100,
    theoryMaxMarks: 80, practicalMaxMarks: 20, passMarks: 35, description: '',
  });
  const [feeForm, setFeeForm] = useState({
    classId: '', yearId: '', tuitionFee: '', admissionFee: '', examFee: '',
    transportFee: '', libraryFee: '', labFee: '', sportsFee: '', otherFee: '',
    installmentType: 'MONTHLY', description: '',
  });
  const [admissionForm, setAdmissionForm] = useState({
    firstName: '', lastName: '', gender: 'Male', dateOfBirth: '', bloodGroup: '',
    address: '', phone: '', email: '', rollNo: '', classId: '', sectionId: '',
    academicYearId: '', admissionDate: new Date().toISOString().split('T')[0],
    previousSchool: '',
    fatherName: '', fatherPhone: '', fatherEmail: '', fatherOccupation: '',
    motherName: '', motherPhone: '',
  });
  const [admissionSections, setAdmissionSections] = useState([]);

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [yr, cl, sec, sub, fee, stu] = await Promise.all([
        academicAPI.getYears(), academicAPI.getClasses(), academicAPI.getSections(),
        academicAPI.getSubjects(), feeAPI.getStructures(), studentAPI.getAll(),
      ]);
      setAcademicYears(yr.data); setClasses(cl.data); setSections(sec.data);
      setSubjects(sub.data); setFeeStructures(fee.data); setStudents(stu.data);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const showSnack = (message, severity = 'success') => setSnackbar({ open: true, message, severity });

  // ─── Academic Year ───
  const openYearDialog = (item = null) => {
    setEditItem(item);
    setYearForm(item
      ? { name: item.name, startDate: item.startDate||'', endDate: item.endDate||'', isActive: item.isActive||false }
      : { name: '', startDate: '', endDate: '', isActive: false });
    setYearDialog(true);
  };
  const saveYear = async () => {
    if (!yearForm.name) { showSnack('Year name required', 'error'); return; }
    try {
      if (editItem) await academicAPI.updateYear(editItem.id, yearForm);
      else await academicAPI.createYear(yearForm);
      showSnack(editItem ? 'Year updated' : 'Year created');
      setYearDialog(false); fetchAll();
    } catch (e) { showSnack('Error saving year', 'error'); }
  };
  const deleteYear = async () => {
    try { await academicAPI.deleteYear(deleteDialog.item.id); showSnack('Year deleted'); setDeleteDialog({ open: false }); fetchAll(); }
    catch (e) { showSnack('Error deleting year', 'error'); }
  };

  // ─── Class ───
  const openClassDialog = (item = null) => {
    setEditItem(item);
    setClassForm(item
      ? { name: item.name, code: item.code||'', grade: item.grade||'', capacity: item.capacity||40, description: item.description||'' }
      : { name: '', code: '', grade: '', capacity: 40, description: '' });
    setClassDialog(true);
  };
  const saveClass = async () => {
    if (!classForm.name) { showSnack('Class name required', 'error'); return; }
    try {
      if (editItem) await academicAPI.updateClass(editItem.id, classForm);
      else await academicAPI.createClass(classForm);
      showSnack(editItem ? 'Class updated' : 'Class created');
      setClassDialog(false); fetchAll();
    } catch (e) { showSnack('Error saving class', 'error'); }
  };
  const deleteClass = async () => {
    try { await academicAPI.deleteClass(deleteDialog.item.id); showSnack('Class deleted'); setDeleteDialog({ open: false }); fetchAll(); }
    catch (e) { showSnack('Error deleting class', 'error'); }
  };

  // ─── Section ───
  const openSectionDialog = (item = null) => {
    setEditItem(item);
    setSectionForm(item
      ? { name: item.name, classId: item.schoolClass?.id||'', capacity: item.capacity||40 }
      : { name: '', classId: '', capacity: 40 });
    setSectionDialog(true);
  };
  const saveSection = async () => {
    if (!sectionForm.name || !sectionForm.classId) { showSnack('Name and class required', 'error'); return; }
    try {
      const data = { name: sectionForm.name, capacity: sectionForm.capacity, schoolClass: { id: parseInt(sectionForm.classId) } };
      if (editItem) await academicAPI.updateSection(editItem.id, data);
      else await academicAPI.createSection(data);
      showSnack(editItem ? 'Section updated' : 'Section created');
      setSectionDialog(false); fetchAll();
    } catch (e) { showSnack('Error saving section', 'error'); }
  };
  const deleteSection = async () => {
    try { await academicAPI.deleteSection(deleteDialog.item.id); showSnack('Section deleted'); setDeleteDialog({ open: false }); fetchAll(); }
    catch (e) { showSnack('Error deleting section', 'error'); }
  };

  // ─── Subject ───
  const openSubjectDialog = (item = null) => {
    setEditItem(item);
    setSubjectForm(item
      ? { name: item.name, code: item.code||'', subjectType: item.subjectType||'THEORY',
          maxMarks: item.maxMarks||100, theoryMaxMarks: item.theoryMaxMarks||80,
          practicalMaxMarks: item.practicalMaxMarks||20, passMarks: item.passMarks||35,
          description: item.description||'' }
      : { name:'', code:'', subjectType:'THEORY', maxMarks:100, theoryMaxMarks:80, practicalMaxMarks:20, passMarks:35, description:'' });
    setSubjectDialog(true);
  };
  const saveSubject = async () => {
    if (!subjectForm.name) { showSnack('Subject name required', 'error'); return; }
    try {
      if (editItem) await academicAPI.updateSubject(editItem.id, subjectForm);
      else await academicAPI.createSubject(subjectForm);
      showSnack(editItem ? 'Subject updated' : 'Subject created');
      setSubjectDialog(false); fetchAll();
    } catch (e) { showSnack('Error saving subject', 'error'); }
  };
  const deleteSubject = async () => {
    try { await academicAPI.deleteSubject(deleteDialog.item.id); showSnack('Subject deleted'); setDeleteDialog({ open: false }); fetchAll(); }
    catch (e) { showSnack('Error deleting subject', 'error'); }
  };

  // ─── Fee Category ───
  const openFeeDialog = (item = null) => {
    setEditItem(item);
    const activeYear = academicYears.find(y => y.isActive);
    setFeeForm(item
      ? { classId: item.schoolClass?.id||'', yearId: item.academicYear?.id||'',
          tuitionFee: item.tuitionFee||'', admissionFee: item.admissionFee||'',
          examFee: item.examFee||'', transportFee: item.transportFee||'',
          libraryFee: item.libraryFee||'', labFee: item.labFee||'',
          sportsFee: item.sportsFee||'', otherFee: item.otherFee||'',
          installmentType: item.installmentType||'MONTHLY', description: item.description||'' }
      : { classId:'', yearId: activeYear?.id||'', tuitionFee:'', admissionFee:'', examFee:'',
          transportFee:'', libraryFee:'', labFee:'', sportsFee:'', otherFee:'',
          installmentType:'MONTHLY', description:'' });
    setFeeDialog(true);
  };
  const calcFeeTotalForm = () =>
    ['tuitionFee','admissionFee','examFee','transportFee','libraryFee','labFee','sportsFee','otherFee']
      .reduce((s, k) => s + parseFloat(feeForm[k] || 0), 0);
  const saveFee = async () => {
    if (!feeForm.classId || !feeForm.yearId) { showSnack('Class and year required', 'error'); return; }
    try {
      const data = { ...feeForm, totalFee: calcFeeTotalForm(),
        schoolClass: { id: parseInt(feeForm.classId) }, academicYear: { id: parseInt(feeForm.yearId) } };
      if (editItem) await feeAPI.updateStructure(editItem.id, data);
      else await feeAPI.createStructure(data);
      showSnack(editItem ? 'Fee structure updated' : 'Fee structure created');
      setFeeDialog(false); fetchAll();
    } catch (e) { showSnack('Error saving fee structure', 'error'); }
  };
  const deleteFee = async () => {
    try { await feeAPI.deleteStructure(deleteDialog.item.id); showSnack('Fee structure deleted'); setDeleteDialog({ open: false }); fetchAll(); }
    catch (e) { showSnack('Error deleting fee structure', 'error'); }
  };

  // ─── Student Admission ───
  const handleAdmissionClassChange = async (classId) => {
    setAdmissionForm(f => ({ ...f, classId, sectionId: '' }));
    if (classId) {
      try { const r = await academicAPI.getSectionsByClass(classId); setAdmissionSections(r.data); }
      catch (e) { setAdmissionSections([]); }
    } else { setAdmissionSections([]); }
  };
  const saveAdmission = async () => {
    if (!admissionForm.firstName || !admissionForm.lastName || !admissionForm.classId) {
      showSnack('First name, last name and class are required', 'error'); return;
    }
    try {
      const studentData = {
        firstName: admissionForm.firstName, lastName: admissionForm.lastName,
        gender: admissionForm.gender, dateOfBirth: admissionForm.dateOfBirth||null,
        bloodGroup: admissionForm.bloodGroup, address: admissionForm.address,
        phone: admissionForm.phone, email: admissionForm.email, rollNo: admissionForm.rollNo,
        admissionDate: admissionForm.admissionDate,
        previousSchool: admissionForm.previousSchool,
        schoolClass: { id: parseInt(admissionForm.classId) },
        section: admissionForm.sectionId ? { id: parseInt(admissionForm.sectionId) } : null,
        academicYear: admissionForm.academicYearId ? { id: parseInt(admissionForm.academicYearId) } : null,
        parent: {
          fatherName: admissionForm.fatherName, fatherPhone: admissionForm.fatherPhone,
          fatherEmail: admissionForm.fatherEmail, fatherOccupation: admissionForm.fatherOccupation,
          motherName: admissionForm.motherName, motherPhone: admissionForm.motherPhone,
          address: admissionForm.address,
        },
      };
      await studentAPI.create(studentData);
      showSnack('Student admitted successfully');
      setAdmissionDialog(false);
      setAdmissionForm({
        firstName:'', lastName:'', gender:'Male', dateOfBirth:'', bloodGroup:'', address:'',
        phone:'', email:'', rollNo:'', classId:'', sectionId:'', academicYearId:'',
        admissionDate: new Date().toISOString().split('T')[0], previousSchool:'',
        fatherName:'', fatherPhone:'', fatherEmail:'', fatherOccupation:'', motherName:'', motherPhone:'',
      });
      fetchAll();
    } catch (e) { showSnack('Error admitting student', 'error'); }
  };

  const activeYear = academicYears.find(y => y.isActive);

  // Stats
  const stats = [
    { label: 'Academic Years', value: academicYears.length, icon: CalendarIcon, color: '#1a237e' },
    { label: 'Classes', value: classes.length, icon: ClassIcon, color: '#00695c' },
    { label: 'Sections', value: sections.length, icon: GroupIcon, color: '#6a1b9a' },
    { label: 'Subjects', value: subjects.length, icon: SubjectIcon, color: '#e65100' },
    { label: 'Fee Structures', value: feeStructures.length, icon: FeeIcon, color: '#1565c0' },
    { label: 'Students', value: students.length, icon: PersonAddIcon, color: '#2e7d32' },
  ];

  const confirmDelete = (type, item) => setDeleteDialog({ open: true, type, item });

  const handleConfirmDelete = () => {
    const handlers = { year: deleteYear, class: deleteClass, section: deleteSection, subject: deleteSubject, fee: deleteFee };
    handlers[deleteDialog.type]?.();
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a237e' }}>Configuration</Typography>
          <Typography variant="body2" color="text.secondary">
            Setup academic year, fee categories, classes, sections, subjects and admissions
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<PersonAddIcon />}
          onClick={() => { setAdmissionSections([]); setAdmissionDialog(true); }}
          sx={{ bgcolor: '#2e7d32', '&:hover': { bgcolor: '#1b5e20' }, borderRadius: 2, px: 3 }}>
          New Admission
        </Button>
      </Box>

      {/* Stats Row */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        {stats.map((s, i) => (
          <Grid item xs={6} sm={4} md={2} key={s.label}>
            <Card sx={{ background: sectionGradients[i % sectionGradients.length], color: '#fff', borderRadius: 3, textAlign: 'center', py: 1 }}>
              <CardContent sx={{ py: '12px !important' }}>
                <s.icon sx={{ fontSize: 32, mb: 0.5, opacity: 0.9 }} />
                <Typography variant="h4" sx={{ fontWeight: 700 }}>{s.value}</Typography>
                <Typography variant="caption" sx={{ opacity: 0.85 }}>{s.label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Tabs value={tab} onChange={(e, v) => setTab(v)}
          variant="scrollable" scrollButtons="auto"
          sx={{ bgcolor: '#f8f9fa', '& .MuiTab-root': { fontWeight: 600, textTransform: 'none' } }}>
          <Tab label="📅 Academic Years" />
          <Tab label="🏫 Classes" />
          <Tab label="📋 Sections" />
          <Tab label="📚 Subjects" />
          <Tab label="💰 Fee Categories" />
          <Tab label="👤 Admissions" />
        </Tabs>

        {/* ─── Academic Years ─── */}
        <TabPanel value={tab} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>Academic Years</Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => openYearDialog()}
              sx={{ bgcolor: '#1a237e', borderRadius: 2 }}>Add Year</Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead><TableRow>
                <TableCell>Year Name</TableCell><TableCell>Start Date</TableCell>
                <TableCell>End Date</TableCell><TableCell>Status</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow></TableHead>
              <TableBody>
                {academicYears.length === 0 ? (
                  <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4 }}><Typography color="text.secondary">No academic years</Typography></TableCell></TableRow>
                ) : academicYears.map(y => (
                  <TableRow key={y.id} hover>
                    <TableCell><Typography fontWeight={600}>{y.name}</Typography></TableCell>
                    <TableCell>{y.startDate||'-'}</TableCell>
                    <TableCell>{y.endDate||'-'}</TableCell>
                    <TableCell><Chip label={y.isActive ? 'Active' : 'Inactive'} size="small" color={y.isActive ? 'success' : 'default'} /></TableCell>
                    <TableCell align="center">
                      <Tooltip title="Edit"><IconButton size="small" onClick={() => openYearDialog(y)} sx={{ color: '#1565c0' }}><EditIcon fontSize="small" /></IconButton></Tooltip>
                      <Tooltip title="Delete"><IconButton size="small" onClick={() => confirmDelete('year', y)} sx={{ color: '#d32f2f' }}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* ─── Classes ─── */}
        <TabPanel value={tab} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>Classes</Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => openClassDialog()}
              sx={{ bgcolor: '#1a237e', borderRadius: 2 }}>Add Class</Button>
          </Box>
          <Grid container spacing={2}>
            {classes.length === 0 ? (
              <Grid item xs={12}><Typography color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>No classes found</Typography></Grid>
            ) : classes.map(c => {
              const classSections = sections.filter(s => s.schoolClass?.id === c.id);
              return (
                <Grid item xs={12} sm={6} md={4} key={c.id}>
                  <Card sx={{ borderRadius: 2, border: '1px solid #e3e8ef' }}>
                    <CardContent sx={{ pb: '16px !important' }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box>
                          <Typography variant="h6" fontWeight={700}>{c.name}</Typography>
                          {c.code && <Typography variant="caption" color="text.secondary">Code: {c.code}</Typography>}
                          {c.grade && <Chip label={`Grade ${c.grade}`} size="small" sx={{ ml: 1 }} />}
                        </Box>
                        <Box>
                          <Tooltip title="Edit"><IconButton size="small" onClick={() => openClassDialog(c)} sx={{ color: '#1565c0' }}><EditIcon fontSize="small" /></IconButton></Tooltip>
                          <Tooltip title="Delete"><IconButton size="small" onClick={() => confirmDelete('class', c)} sx={{ color: '#d32f2f' }}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                        </Box>
                      </Box>
                      <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {classSections.map(sec => <Chip key={sec.id} label={`Section ${sec.name}`} size="small" variant="outlined" />)}
                        {classSections.length === 0 && <Typography variant="caption" color="text.secondary">No sections yet</Typography>}
                      </Box>
                      {c.capacity && <Typography variant="caption" color="text.secondary">Capacity: {c.capacity}</Typography>}
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </TabPanel>

        {/* ─── Sections ─── */}
        <TabPanel value={tab} index={2}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>Sections</Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => openSectionDialog()}
              sx={{ bgcolor: '#1a237e', borderRadius: 2 }}>Add Section</Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead><TableRow>
                <TableCell>Section Name</TableCell><TableCell>Class</TableCell>
                <TableCell>Capacity</TableCell><TableCell align="center">Actions</TableCell>
              </TableRow></TableHead>
              <TableBody>
                {sections.length === 0 ? (
                  <TableRow><TableCell colSpan={4} align="center" sx={{ py: 4 }}><Typography color="text.secondary">No sections</Typography></TableCell></TableRow>
                ) : sections.map(s => (
                  <TableRow key={s.id} hover>
                    <TableCell><Typography fontWeight={600}>{s.name}</Typography></TableCell>
                    <TableCell>{s.schoolClass?.name||'-'}</TableCell>
                    <TableCell>{s.capacity||'-'}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Edit"><IconButton size="small" onClick={() => openSectionDialog(s)} sx={{ color: '#1565c0' }}><EditIcon fontSize="small" /></IconButton></Tooltip>
                      <Tooltip title="Delete"><IconButton size="small" onClick={() => confirmDelete('section', s)} sx={{ color: '#d32f2f' }}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* ─── Subjects ─── */}
        <TabPanel value={tab} index={3}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>Subjects</Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => openSubjectDialog()}
              sx={{ bgcolor: '#1a237e', borderRadius: 2 }}>Add Subject</Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead><TableRow>
                <TableCell>Subject Name</TableCell><TableCell>Code</TableCell>
                <TableCell>Type</TableCell><TableCell align="right">Max Marks</TableCell>
                <TableCell align="right">Theory</TableCell><TableCell align="right">Practical</TableCell>
                <TableCell align="right">Pass Marks</TableCell><TableCell align="center">Actions</TableCell>
              </TableRow></TableHead>
              <TableBody>
                {subjects.length === 0 ? (
                  <TableRow><TableCell colSpan={8} align="center" sx={{ py: 4 }}><Typography color="text.secondary">No subjects</Typography></TableCell></TableRow>
                ) : subjects.map(s => (
                  <TableRow key={s.id} hover>
                    <TableCell><Typography fontWeight={600}>{s.name}</Typography></TableCell>
                    <TableCell><Chip label={s.code||'-'} size="small" variant="outlined" /></TableCell>
                    <TableCell><Chip label={s.subjectType||'THEORY'} size="small"
                      color={s.subjectType==='THEORY'?'primary':s.subjectType==='PRACTICAL'?'secondary':'success'} /></TableCell>
                    <TableCell align="right">{s.maxMarks||'-'}</TableCell>
                    <TableCell align="right">{s.theoryMaxMarks||'-'}</TableCell>
                    <TableCell align="right">{s.practicalMaxMarks||'-'}</TableCell>
                    <TableCell align="right">{s.passMarks||'-'}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Edit"><IconButton size="small" onClick={() => openSubjectDialog(s)} sx={{ color: '#1565c0' }}><EditIcon fontSize="small" /></IconButton></Tooltip>
                      <Tooltip title="Delete"><IconButton size="small" onClick={() => confirmDelete('subject', s)} sx={{ color: '#d32f2f' }}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* ─── Fee Categories ─── */}
        <TabPanel value={tab} index={4}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>Fee Categories (Structures)</Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => openFeeDialog()}
              sx={{ bgcolor: '#1a237e', borderRadius: 2 }}>Add Fee Structure</Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead><TableRow>
                <TableCell>Class</TableCell><TableCell>Academic Year</TableCell>
                <TableCell align="right">Tuition</TableCell><TableCell align="right">Admission</TableCell>
                <TableCell align="right">Exam</TableCell><TableCell align="right">Transport</TableCell>
                <TableCell align="right">Others</TableCell><TableCell align="right">Total</TableCell>
                <TableCell>Type</TableCell><TableCell align="center">Actions</TableCell>
              </TableRow></TableHead>
              <TableBody>
                {feeStructures.length === 0 ? (
                  <TableRow><TableCell colSpan={10} align="center" sx={{ py: 4 }}><Typography color="text.secondary">No fee structures</Typography></TableCell></TableRow>
                ) : feeStructures.map(f => (
                  <TableRow key={f.id} hover>
                    <TableCell><Typography fontWeight={600}>{f.schoolClass?.name||'-'}</Typography></TableCell>
                    <TableCell>{f.academicYear?.name||'-'}</TableCell>
                    <TableCell align="right">₹{f.tuitionFee||0}</TableCell>
                    <TableCell align="right">₹{f.admissionFee||0}</TableCell>
                    <TableCell align="right">₹{f.examFee||0}</TableCell>
                    <TableCell align="right">₹{f.transportFee||0}</TableCell>
                    <TableCell align="right">₹{(parseFloat(f.libraryFee||0)+parseFloat(f.labFee||0)+parseFloat(f.sportsFee||0)+parseFloat(f.otherFee||0)).toLocaleString()}</TableCell>
                    <TableCell align="right"><Chip label={`₹${f.totalFee||0}`} color="primary" size="small" sx={{ fontWeight: 700 }} /></TableCell>
                    <TableCell><Chip label={f.installmentType||'MONTHLY'} size="small" variant="outlined" /></TableCell>
                    <TableCell align="center">
                      <Tooltip title="Edit"><IconButton size="small" onClick={() => openFeeDialog(f)} sx={{ color: '#1565c0' }}><EditIcon fontSize="small" /></IconButton></Tooltip>
                      <Tooltip title="Delete"><IconButton size="small" onClick={() => confirmDelete('fee', f)} sx={{ color: '#d32f2f' }}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* ─── Admissions ─── */}
        <TabPanel value={tab} index={5}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>Student Admissions</Typography>
            <Button variant="contained" startIcon={<PersonAddIcon />}
              onClick={() => { setAdmissionSections([]); setAdmissionDialog(true); }}
              sx={{ bgcolor: '#2e7d32', '&:hover': { bgcolor: '#1b5e20' }, borderRadius: 2 }}>
              New Admission
            </Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead><TableRow>
                <TableCell>Admission No</TableCell><TableCell>Student Name</TableCell>
                <TableCell>Class</TableCell><TableCell>Section</TableCell>
                <TableCell>Academic Year</TableCell><TableCell>Gender</TableCell>
                <TableCell>Admission Date</TableCell>
              </TableRow></TableHead>
              <TableBody>
                {students.length === 0 ? (
                  <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4 }}><Typography color="text.secondary">No admissions yet</Typography></TableCell></TableRow>
                ) : students.map(s => (
                  <TableRow key={s.id} hover>
                    <TableCell><Chip label={s.admissionNo||'-'} size="small" sx={{ fontWeight: 600 }} /></TableCell>
                    <TableCell><Typography fontWeight={500}>{s.firstName} {s.lastName}</Typography></TableCell>
                    <TableCell>{s.schoolClass?.name||'-'}</TableCell>
                    <TableCell>{s.section?.name||'-'}</TableCell>
                    <TableCell>{s.academicYear?.name||'-'}</TableCell>
                    <TableCell><Chip label={s.gender||'-'} size="small" variant="outlined"
                      color={s.gender==='Male'||s.gender==='MALE'?'info':'secondary'} /></TableCell>
                    <TableCell>{s.admissionDate||'-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Paper>

      {/* ─── Academic Year Dialog ─── */}
      <Dialog open={yearDialog} onClose={() => setYearDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#1a237e', color: 'white' }}>{editItem ? 'Edit' : 'Add'} Academic Year</DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}><TextField fullWidth label="Year Name *" value={yearForm.name} onChange={e => setYearForm({ ...yearForm, name: e.target.value })} placeholder="e.g. 2025-2026" /></Grid>
            <Grid item xs={6}><TextField fullWidth label="Start Date" type="date" value={yearForm.startDate} onChange={e => setYearForm({ ...yearForm, startDate: e.target.value })} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={6}><TextField fullWidth label="End Date" type="date" value={yearForm.endDate} onChange={e => setYearForm({ ...yearForm, endDate: e.target.value })} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={12}><FormControlLabel control={<Switch checked={yearForm.isActive} onChange={e => setYearForm({ ...yearForm, isActive: e.target.checked })} color="success" />} label="Set as Active Year" /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setYearDialog(false)}>Cancel</Button>
          <Button onClick={saveYear} variant="contained" sx={{ bgcolor: '#1a237e' }}>{editItem ? 'Update' : 'Create'}</Button>
        </DialogActions>
      </Dialog>

      {/* ─── Class Dialog ─── */}
      <Dialog open={classDialog} onClose={() => setClassDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#1a237e', color: 'white' }}>{editItem ? 'Edit' : 'Add'} Class</DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={8}><TextField fullWidth label="Class Name *" value={classForm.name} onChange={e => setClassForm({ ...classForm, name: e.target.value })} placeholder="e.g. Class 1" /></Grid>
            <Grid item xs={4}><TextField fullWidth label="Code" value={classForm.code} onChange={e => setClassForm({ ...classForm, code: e.target.value })} placeholder="e.g. CL1" /></Grid>
            <Grid item xs={4}><TextField fullWidth label="Grade" type="number" value={classForm.grade} onChange={e => setClassForm({ ...classForm, grade: e.target.value })} /></Grid>
            <Grid item xs={4}><TextField fullWidth label="Capacity" type="number" value={classForm.capacity} onChange={e => setClassForm({ ...classForm, capacity: e.target.value })} /></Grid>
            <Grid item xs={12}><TextField fullWidth label="Description" value={classForm.description} onChange={e => setClassForm({ ...classForm, description: e.target.value })} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setClassDialog(false)}>Cancel</Button>
          <Button onClick={saveClass} variant="contained" sx={{ bgcolor: '#1a237e' }}>{editItem ? 'Update' : 'Create'}</Button>
        </DialogActions>
      </Dialog>

      {/* ─── Section Dialog ─── */}
      <Dialog open={sectionDialog} onClose={() => setSectionDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#1a237e', color: 'white' }}>{editItem ? 'Edit' : 'Add'} Section</DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Class *</InputLabel>
                <Select value={sectionForm.classId} onChange={e => setSectionForm({ ...sectionForm, classId: e.target.value })} label="Class *">
                  {classes.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={8}><TextField fullWidth label="Section Name *" value={sectionForm.name} onChange={e => setSectionForm({ ...sectionForm, name: e.target.value })} placeholder="e.g. A" /></Grid>
            <Grid item xs={4}><TextField fullWidth label="Capacity" type="number" value={sectionForm.capacity} onChange={e => setSectionForm({ ...sectionForm, capacity: e.target.value })} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setSectionDialog(false)}>Cancel</Button>
          <Button onClick={saveSection} variant="contained" sx={{ bgcolor: '#1a237e' }}>{editItem ? 'Update' : 'Create'}</Button>
        </DialogActions>
      </Dialog>

      {/* ─── Subject Dialog ─── */}
      <Dialog open={subjectDialog} onClose={() => setSubjectDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#1a237e', color: 'white' }}>{editItem ? 'Edit' : 'Add'} Subject</DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={8}><TextField fullWidth label="Subject Name *" value={subjectForm.name} onChange={e => setSubjectForm({ ...subjectForm, name: e.target.value })} /></Grid>
            <Grid item xs={4}><TextField fullWidth label="Code" value={subjectForm.code} onChange={e => setSubjectForm({ ...subjectForm, code: e.target.value })} /></Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select value={subjectForm.subjectType} onChange={e => setSubjectForm({ ...subjectForm, subjectType: e.target.value })} label="Type">
                  <MenuItem value="THEORY">Theory</MenuItem>
                  <MenuItem value="PRACTICAL">Practical</MenuItem>
                  <MenuItem value="BOTH">Theory + Practical</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}><TextField fullWidth label="Max Marks" type="number" value={subjectForm.maxMarks} onChange={e => setSubjectForm({ ...subjectForm, maxMarks: e.target.value })} /></Grid>
            <Grid item xs={4}><TextField fullWidth label="Theory Marks" type="number" value={subjectForm.theoryMaxMarks} onChange={e => setSubjectForm({ ...subjectForm, theoryMaxMarks: e.target.value })} /></Grid>
            <Grid item xs={4}><TextField fullWidth label="Practical Marks" type="number" value={subjectForm.practicalMaxMarks} onChange={e => setSubjectForm({ ...subjectForm, practicalMaxMarks: e.target.value })} /></Grid>
            <Grid item xs={4}><TextField fullWidth label="Pass Marks" type="number" value={subjectForm.passMarks} onChange={e => setSubjectForm({ ...subjectForm, passMarks: e.target.value })} /></Grid>
            <Grid item xs={12}><TextField fullWidth label="Description" value={subjectForm.description} onChange={e => setSubjectForm({ ...subjectForm, description: e.target.value })} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setSubjectDialog(false)}>Cancel</Button>
          <Button onClick={saveSubject} variant="contained" sx={{ bgcolor: '#1a237e' }}>{editItem ? 'Update' : 'Create'}</Button>
        </DialogActions>
      </Dialog>

      {/* ─── Fee Dialog ─── */}
      <Dialog open={feeDialog} onClose={() => setFeeDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: '#1a237e', color: 'white' }}>{editItem ? 'Edit' : 'Add'} Fee Structure</DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Class *</InputLabel>
                <Select value={feeForm.classId} onChange={e => setFeeForm({ ...feeForm, classId: e.target.value })} label="Class *">
                  {classes.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Academic Year *</InputLabel>
                <Select value={feeForm.yearId} onChange={e => setFeeForm({ ...feeForm, yearId: e.target.value })} label="Academic Year *">
                  {academicYears.map(y => <MenuItem key={y.id} value={y.id}>{y.name}{y.isActive && ' ✓'}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            {[['tuitionFee','Tuition Fee'],['admissionFee','Admission Fee'],['examFee','Exam Fee'],['transportFee','Transport Fee'],
              ['libraryFee','Library Fee'],['labFee','Lab Fee'],['sportsFee','Sports Fee'],['otherFee','Other Fee']].map(([k, lbl]) => (
              <Grid item xs={6} sm={3} key={k}>
                <TextField fullWidth label={lbl} type="number" value={feeForm[k]}
                  onChange={e => setFeeForm({ ...feeForm, [k]: e.target.value })}
                  InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }} />
              </Grid>
            ))}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Installment Type</InputLabel>
                <Select value={feeForm.installmentType} onChange={e => setFeeForm({ ...feeForm, installmentType: e.target.value })} label="Installment Type">
                  <MenuItem value="MONTHLY">Monthly</MenuItem>
                  <MenuItem value="QUARTERLY">Quarterly</MenuItem>
                  <MenuItem value="HALFYEARLY">Half-Yearly</MenuItem>
                  <MenuItem value="YEARLY">Yearly</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="Description" value={feeForm.description} onChange={e => setFeeForm({ ...feeForm, description: e.target.value })} /></Grid>
            <Grid item xs={12}>
              <Card sx={{ bgcolor: '#e8f5e9', p: 2 }}>
                <Typography variant="h6" color="success.dark">Total Fee: ₹{calcFeeTotalForm().toLocaleString()}</Typography>
              </Card>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setFeeDialog(false)}>Cancel</Button>
          <Button onClick={saveFee} variant="contained" sx={{ bgcolor: '#1a237e' }}>{editItem ? 'Update' : 'Create'}</Button>
        </DialogActions>
      </Dialog>

      {/* ─── Admission Dialog ─── */}
      <Dialog open={admissionDialog} onClose={() => setAdmissionDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: '#2e7d32', color: 'white' }}>New Student Admission</DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Typography variant="subtitle2" sx={{ mb: 2, color: '#1a237e', fontWeight: 700 }}>Academic Assignment</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Academic Year</InputLabel>
                <Select value={admissionForm.academicYearId}
                  onChange={e => setAdmissionForm({ ...admissionForm, academicYearId: e.target.value })} label="Academic Year">
                  {academicYears.map(y => <MenuItem key={y.id} value={y.id}>{y.name}{y.isActive && ' ✓'}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Class *</InputLabel>
                <Select value={admissionForm.classId}
                  onChange={e => handleAdmissionClassChange(e.target.value)} label="Class *">
                  {classes.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Section</InputLabel>
                <Select value={admissionForm.sectionId}
                  onChange={e => setAdmissionForm({ ...admissionForm, sectionId: e.target.value })} label="Section">
                  <MenuItem value=""><em>— Select —</em></MenuItem>
                  {admissionSections.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" sx={{ mb: 2, color: '#1a237e', fontWeight: 700 }}>Student Details</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}><TextField fullWidth size="small" label="First Name *" value={admissionForm.firstName} onChange={e => setAdmissionForm({ ...admissionForm, firstName: e.target.value })} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth size="small" label="Last Name *" value={admissionForm.lastName} onChange={e => setAdmissionForm({ ...admissionForm, lastName: e.target.value })} /></Grid>
            <Grid item xs={6} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Gender</InputLabel>
                <Select value={admissionForm.gender} onChange={e => setAdmissionForm({ ...admissionForm, gender: e.target.value })} label="Gender">
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6} sm={3}><TextField fullWidth size="small" label="Date of Birth" type="date" value={admissionForm.dateOfBirth} onChange={e => setAdmissionForm({ ...admissionForm, dateOfBirth: e.target.value })} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={6} sm={3}><TextField fullWidth size="small" label="Blood Group" value={admissionForm.bloodGroup} onChange={e => setAdmissionForm({ ...admissionForm, bloodGroup: e.target.value })} placeholder="O+" /></Grid>
            <Grid item xs={6} sm={3}><TextField fullWidth size="small" label="Roll No" value={admissionForm.rollNo} onChange={e => setAdmissionForm({ ...admissionForm, rollNo: e.target.value })} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth size="small" label="Phone" value={admissionForm.phone} onChange={e => setAdmissionForm({ ...admissionForm, phone: e.target.value })} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth size="small" label="Email" value={admissionForm.email} onChange={e => setAdmissionForm({ ...admissionForm, email: e.target.value })} /></Grid>
            <Grid item xs={12}><TextField fullWidth size="small" label="Address" value={admissionForm.address} onChange={e => setAdmissionForm({ ...admissionForm, address: e.target.value })} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth size="small" label="Admission Date" type="date" value={admissionForm.admissionDate} onChange={e => setAdmissionForm({ ...admissionForm, admissionDate: e.target.value })} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth size="small" label="Previous School" value={admissionForm.previousSchool} onChange={e => setAdmissionForm({ ...admissionForm, previousSchool: e.target.value })} /></Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2" sx={{ mb: 2, color: '#1a237e', fontWeight: 700 }}>Parent / Guardian Details</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}><TextField fullWidth size="small" label="Father's Name" value={admissionForm.fatherName} onChange={e => setAdmissionForm({ ...admissionForm, fatherName: e.target.value })} /></Grid>
            <Grid item xs={12} sm={4}><TextField fullWidth size="small" label="Father's Phone" value={admissionForm.fatherPhone} onChange={e => setAdmissionForm({ ...admissionForm, fatherPhone: e.target.value })} /></Grid>
            <Grid item xs={12} sm={4}><TextField fullWidth size="small" label="Father's Occupation" value={admissionForm.fatherOccupation} onChange={e => setAdmissionForm({ ...admissionForm, fatherOccupation: e.target.value })} /></Grid>
            <Grid item xs={12} sm={4}><TextField fullWidth size="small" label="Mother's Name" value={admissionForm.motherName} onChange={e => setAdmissionForm({ ...admissionForm, motherName: e.target.value })} /></Grid>
            <Grid item xs={12} sm={4}><TextField fullWidth size="small" label="Mother's Phone" value={admissionForm.motherPhone} onChange={e => setAdmissionForm({ ...admissionForm, motherPhone: e.target.value })} /></Grid>
            <Grid item xs={12} sm={4}><TextField fullWidth size="small" label="Father's Email" value={admissionForm.fatherEmail} onChange={e => setAdmissionForm({ ...admissionForm, fatherEmail: e.target.value })} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setAdmissionDialog(false)}>Cancel</Button>
          <Button onClick={saveAdmission} variant="contained" sx={{ bgcolor: '#2e7d32', '&:hover': { bgcolor: '#1b5e20' } }}>
            Admit Student
          </Button>
        </DialogActions>
      </Dialog>

      {/* ─── Delete Confirmation ─── */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false })}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete <strong>{deleteDialog.item?.name || deleteDialog.item?.routeName || deleteDialog.item?.schoolClass?.name}</strong>?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false })}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
