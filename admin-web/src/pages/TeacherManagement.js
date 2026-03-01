import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Grid, MenuItem, Select, FormControl, InputLabel,
  Chip, Card, CardContent, InputAdornment, Alert, Snackbar, Avatar,
  TablePagination, Tooltip, Divider, Tabs, Tab, CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
  Search as SearchIcon, Person as PersonIcon, Visibility as ViewIcon,
  Close as CloseIcon, Work as WorkIcon, Email as EmailIcon, Phone as PhoneIcon,
  FileDownload as DownloadIcon, Assignment as AssignIcon, Class as ClassIcon,
  MenuBook as SubjectIcon, School as SchoolIcon,
} from '@mui/icons-material';
import { teacherAPI, academicAPI } from '../services/api';
import * as XLSX from 'xlsx';

const initialFormState = {
  firstName: '', lastName: '', dateOfBirth: '', gender: '', phone: '', email: '',
  qualification: '', experience: '', designation: '', specialization: '', address: '',
  joiningDate: new Date().toISOString().split('T')[0],
  loginUsername: '', loginPassword: ''
};

const AVATAR_COLORS = [
  '#1a237e', '#7b1fa2', '#c62828', '#2e7d32', '#e65100', '#00838f',
  '#37474f', '#ad1457', '#1565c0', '#4a148c', '#006064', '#558b2f',
];

function TabPanel({ children, value, index }) {
  return value === index ? <Box sx={{ pt: 3 }}>{children}</Box> : null;
}

export default function TeacherManagement() {
  const [tabValue, setTabValue] = useState(0);

  // --- Teachers tab state ---
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true); // eslint-disable-line no-unused-vars
  const [openDialog, setOpenDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [isEdit, setIsEdit] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // --- Assignments tab state ---
  const [assignments, setAssignments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [years, setYears] = useState([]);
  const [assignForm, setAssignForm] = useState({
    teacherId: '', classId: '', sectionId: '', subjectId: '', academicYearId: ''
  });
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignSearch, setAssignSearch] = useState('');

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    loadAll();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (assignForm.classId) {
      academicAPI.getSectionsByClass(assignForm.classId)
        .then(res => setSections(res.data || []))
        .catch(() => setSections([]));
      setAssignForm(f => ({ ...f, sectionId: '' }));
    } else {
      setSections([]);
    }
  }, [assignForm.classId]);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [tRes, cRes, sRes, yRes, aRes] = await Promise.allSettled([
        teacherAPI.getAll(),
        academicAPI.getClasses(),
        academicAPI.getSubjects(),
        academicAPI.getYears(),
        teacherAPI.getAssignments(),
      ]);
      if (tRes.status === 'fulfilled') setTeachers(tRes.value.data || []);
      if (cRes.status === 'fulfilled') setClasses(cRes.value.data || []);
      if (sRes.status === 'fulfilled') setSubjects(sRes.value.data || []);
      if (yRes.status === 'fulfilled') setYears(yRes.value.data || []);
      if (aRes.status === 'fulfilled') setAssignments(aRes.value.data || []);
    } catch (e) {
      showSnackbar('Error loading data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadAssignments = async () => {
    try {
      const res = await teacherAPI.getAssignments();
      setAssignments(res.data || []);
    } catch (e) {
      showSnackbar('Error loading assignments', 'error');
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  // --- Teacher CRUD handlers ---
  const handleOpenDialog = (teacher = null) => {
    if (teacher) {
      setIsEdit(true);
      setFormData({ ...teacher, dateOfBirth: teacher.dateOfBirth || '', joiningDate: teacher.joiningDate || '' });
    } else {
      setIsEdit(false);
      setFormData(initialFormState);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData(initialFormState);
    setIsEdit(false);
  };

  const handleViewTeacher = (teacher) => { setSelectedTeacher(teacher); setOpenViewDialog(true); };
  const handleDeleteClick = (teacher) => { setSelectedTeacher(teacher); setOpenDeleteDialog(true); };

  const handleSubmit = async () => {
    try {
      if (isEdit) {
        await teacherAPI.update(formData.id, formData);
        showSnackbar('Teacher updated successfully');
      } else {
        await teacherAPI.create(formData);
        showSnackbar('Teacher added successfully');
      }
      handleCloseDialog();
      loadAll();
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Error saving teacher', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await teacherAPI.delete(selectedTeacher.id);
      showSnackbar('Teacher deleted successfully');
      setOpenDeleteDialog(false);
      loadAll();
    } catch (error) {
      showSnackbar('Error deleting teacher', 'error');
    }
  };

  // --- Assignment handlers ---
  const handleAssign = async () => {
    if (!assignForm.teacherId || !assignForm.classId || !assignForm.subjectId || !assignForm.academicYearId) {
      showSnackbar('Please fill all required fields (Teacher, Class, Subject, Academic Year)', 'warning');
      return;
    }
    setAssignLoading(true);
    try {
      await teacherAPI.createAssignment({
        teacherId: assignForm.teacherId,
        classId: assignForm.classId,
        sectionId: assignForm.sectionId || null,
        subjectId: assignForm.subjectId,
        academicYearId: assignForm.academicYearId,
      });
      showSnackbar('Teacher assigned successfully!');
      setAssignForm({ teacherId: '', classId: '', sectionId: '', subjectId: '', academicYearId: '' });
      loadAssignments();
    } catch (e) {
      showSnackbar(e.response?.data?.message || 'Error creating assignment', 'error');
    } finally {
      setAssignLoading(false);
    }
  };

  const handleDeleteAssignment = async (id) => {
    if (!window.confirm('Remove this teacher assignment?')) return;
    try {
      await teacherAPI.deleteAssignment(id);
      showSnackbar('Assignment removed successfully');
      loadAssignments();
    } catch (e) {
      showSnackbar('Error removing assignment', 'error');
    }
  };

  const filteredTeachers = teachers.filter(t =>
    !searchQuery ||
    `${t.firstName} ${t.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.employeeId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.specialization?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const paginatedTeachers = filteredTeachers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const filteredAssignments = assignments.filter(a =>
    !assignSearch ||
    `${a.teacher?.firstName} ${a.teacher?.lastName}`.toLowerCase().includes(assignSearch.toLowerCase()) ||
    a.subject?.name?.toLowerCase().includes(assignSearch.toLowerCase()) ||
    a.schoolClass?.name?.toLowerCase().includes(assignSearch.toLowerCase())
  );

  // Assignment stats
  const uniqueTeachersAssigned = new Set(assignments.map(a => a.teacher?.id)).size;
  const uniqueClassesCovered = new Set(assignments.map(a => a.schoolClass?.id)).size;

  const exportToExcel = () => {
    const data = filteredTeachers.map(t => ({
      'Employee ID': t.employeeId || '',
      'First Name': t.firstName || '',
      'Last Name': t.lastName || '',
      'Designation': t.designation || '',
      'Specialization': t.specialization || '',
      'Qualification': t.qualification || '',
      'Experience': t.experience || '',
      'Phone': t.phone || '',
      'Email': t.email || '',
      'Address': t.address || '',
      'Joining Date': t.joiningDate || '',
      'Gender': t.gender || '',
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Teachers');
    XLSX.writeFile(wb, `teachers_export_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <Box>
      {/* Page Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold" color="primary">Teacher Management</Typography>
          <Typography variant="body2" color="text.secondary">Manage teachers and their class/subject assignments</Typography>
        </Box>
        {tabValue === 0 && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}
            sx={{ borderRadius: 2, px: 3, py: 1, textTransform: 'none', fontWeight: 600 }}>
            Add Teacher
          </Button>
        )}
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3, borderRadius: 2 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}
          sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}
          indicatorColor="primary" textColor="primary">
          <Tab icon={<PersonIcon />} iconPosition="start" label="All Teachers"
            sx={{ textTransform: 'none', fontWeight: 600, minHeight: 56 }} />
          <Tab icon={<AssignIcon />} iconPosition="start" label="Subject Assignments"
            sx={{ textTransform: 'none', fontWeight: 600, minHeight: 56 }} />
        </Tabs>
      </Paper>

      {/* ===== TAB 0: Teachers ===== */}
      <TabPanel value={tabValue} index={0}>
        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {[
            { label: 'Total Teachers', value: teachers.length, icon: <PersonIcon />, gradient: 'linear-gradient(135deg,#667eea,#764ba2)' },
            { label: 'Active Teachers', value: teachers.filter(t => t.active !== false).length, icon: <WorkIcon />, gradient: 'linear-gradient(135deg,#11998e,#38ef7d)' },
            { label: 'Male Teachers', value: teachers.filter(t => t.gender === 'Male').length, icon: <PersonIcon />, gradient: 'linear-gradient(135deg,#f093fb,#f5576c)' },
            { label: 'Female Teachers', value: teachers.filter(t => t.gender === 'Female').length, icon: <PersonIcon />, gradient: 'linear-gradient(135deg,#4facfe,#00f2fe)' },
          ].map((s, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Card sx={{ background: s.gradient, color: 'white', borderRadius: 2 }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box><Typography variant="body2" sx={{ opacity: 0.9 }}>{s.label}</Typography>
                      <Typography variant="h4" fontWeight="bold">{s.value}</Typography></Box>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>{s.icon}</Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Search + Export */}
        <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <TextField fullWidth placeholder="Search by name, employee ID, email, or specialization..."
                value={searchQuery} onChange={e => setSearchQuery(e.target.value)} size="small"
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }} />
            </Grid>
            <Grid item xs={12} md={4} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
              <Typography variant="body2" color="text.secondary">{filteredTeachers.length} of {teachers.length}</Typography>
              <Button variant="outlined" size="small" startIcon={<DownloadIcon />} onClick={exportToExcel}
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>Export</Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Teachers Table */}
        <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'primary.main' }}>
                  {['Employee ID', 'Teacher Name', 'Specialization', 'Phone', 'Email', 'Status', 'Actions'].map(h => (
                    <TableCell key={h} sx={{ color: 'white', fontWeight: 600 }} align={h === 'Actions' ? 'center' : 'left'}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedTeachers.length === 0 ? (
                  <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No teachers found</Typography>
                  </TableCell></TableRow>
                ) : paginatedTeachers.map((teacher, index) => (
                  <TableRow key={teacher.id} sx={{ bgcolor: index % 2 === 0 ? 'grey.50' : 'white', '&:hover': { bgcolor: 'action.hover' } }}>
                    <TableCell><Chip label={teacher.employeeId} size="small" color="secondary" variant="outlined" /></TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Avatar sx={{ width: 36, height: 36, bgcolor: AVATAR_COLORS[index % AVATAR_COLORS.length], fontSize: 13, fontWeight: 700 }}>
                          {teacher.firstName?.[0]}{teacher.lastName?.[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>{teacher.firstName} {teacher.lastName}</Typography>
                          <Typography variant="caption" color="text.secondary">{teacher.designation || 'Teacher'}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell><Chip label={teacher.specialization || '—'} size="small" variant="outlined" /></TableCell>
                    <TableCell>{teacher.phone || '—'}</TableCell>
                    <TableCell>{teacher.email || '—'}</TableCell>
                    <TableCell>
                      <Chip label={teacher.active !== false ? 'Active' : 'Inactive'}
                        color={teacher.active !== false ? 'success' : 'default'} size="small" />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="View"><IconButton size="small" onClick={() => handleViewTeacher(teacher)}><ViewIcon fontSize="small" /></IconButton></Tooltip>
                      <Tooltip title="Edit"><IconButton size="small" color="primary" onClick={() => handleOpenDialog(teacher)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                      <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => handleDeleteClick(teacher)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination component="div" count={filteredTeachers.length} page={page}
            onPageChange={(e, newPage) => setPage(newPage)} rowsPerPage={rowsPerPage}
            onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            rowsPerPageOptions={[5, 10, 25, 50]} />
        </Paper>
      </TabPanel>

      {/* ===== TAB 1: Subject Assignments ===== */}
      <TabPanel value={tabValue} index={1}>
        {/* Assignment Stats */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {[
            { label: 'Total Assignments', value: assignments.length, icon: <AssignIcon />, gradient: 'linear-gradient(135deg,#667eea,#764ba2)' },
            { label: 'Teachers Assigned', value: uniqueTeachersAssigned, icon: <PersonIcon />, gradient: 'linear-gradient(135deg,#11998e,#38ef7d)' },
            { label: 'Classes Covered', value: uniqueClassesCovered, icon: <ClassIcon />, gradient: 'linear-gradient(135deg,#f093fb,#f5576c)' },
          ].map((s, i) => (
            <Grid item xs={12} sm={4} key={i}>
              <Card sx={{ background: s.gradient, color: 'white', borderRadius: 2 }}>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box><Typography variant="body2" sx={{ opacity: 0.9 }}>{s.label}</Typography>
                      <Typography variant="h4" fontWeight="bold">{s.value}</Typography></Box>
                    <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>{s.icon}</Avatar>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Assignment Form */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Box display="flex" alignItems="center" gap={1.5} mb={2.5}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}><AssignIcon fontSize="small" /></Avatar>
            <Box>
              <Typography variant="h6" fontWeight={700}>Assign Teacher to Class &amp; Subject</Typography>
              <Typography variant="caption" color="text.secondary">Select a teacher, class, and subject to create an assignment</Typography>
            </Box>
          </Box>
          <Divider sx={{ mb: 3 }} />
          <Grid container spacing={2.5} alignItems="flex-end">
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Teacher *</InputLabel>
                <Select value={assignForm.teacherId} label="Teacher *"
                  onChange={e => setAssignForm(f => ({ ...f, teacherId: e.target.value }))}>
                  {teachers.filter(t => t.active !== false).map(t => (
                    <MenuItem key={t.id} value={t.id}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Avatar sx={{ width: 24, height: 24, fontSize: 10, bgcolor: AVATAR_COLORS[teachers.indexOf(t) % AVATAR_COLORS.length] }}>
                          {t.firstName?.[0]}{t.lastName?.[0]}
                        </Avatar>
                        {t.firstName} {t.lastName}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Class *</InputLabel>
                <Select value={assignForm.classId} label="Class *"
                  onChange={e => setAssignForm(f => ({ ...f, classId: e.target.value, sectionId: '' }))}>
                  {classes.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Section</InputLabel>
                <Select value={assignForm.sectionId} label="Section"
                  onChange={e => setAssignForm(f => ({ ...f, sectionId: e.target.value }))}>
                  <MenuItem value="">All Sections</MenuItem>
                  {sections.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Subject *</InputLabel>
                <Select value={assignForm.subjectId} label="Subject *"
                  onChange={e => setAssignForm(f => ({ ...f, subjectId: e.target.value }))}>
                  {subjects.map(s => (
                    <MenuItem key={s.id} value={s.id}>
                      <Box>
                        <Typography variant="body2">{s.name}</Typography>
                        {s.code && <Typography variant="caption" color="text.secondary">{s.code}</Typography>}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Academic Year *</InputLabel>
                <Select value={assignForm.academicYearId} label="Academic Year *"
                  onChange={e => setAssignForm(f => ({ ...f, academicYearId: e.target.value }))}>
                  {years.map(y => (
                    <MenuItem key={y.id} value={y.id}>
                      {y.name} {y.isActive && <Chip label="Active" size="small" color="success" sx={{ ml: 1, height: 16, fontSize: 10 }} />}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={8}>
              <Button fullWidth variant="contained" size="large" startIcon={assignLoading ? <CircularProgress size={16} color="inherit" /> : <AddIcon />}
                onClick={handleAssign} disabled={assignLoading}
                sx={{ borderRadius: 2, py: 1.2, textTransform: 'none', fontWeight: 700, fontSize: 15,
                  background: 'linear-gradient(135deg, #1a237e 0%, #283593 100%)',
                  '&:hover': { background: 'linear-gradient(135deg, #283593 0%, #3949ab 100%)' } }}>
                {assignLoading ? 'Assigning...' : 'Assign Teacher'}
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Current Assignments Table */}
        <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box display="flex" alignItems="center" gap={1}>
              <SubjectIcon color="primary" />
              <Typography variant="h6" fontWeight={700}>Current Assignments</Typography>
              <Chip label={filteredAssignments.length} size="small" color="primary" sx={{ ml: 1 }} />
            </Box>
            <TextField size="small" placeholder="Search assignments..." value={assignSearch}
              onChange={e => setAssignSearch(e.target.value)}
              InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
              sx={{ width: 260 }} />
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                  {['#', 'Teacher', 'Emp ID', 'Class', 'Section', 'Subject', 'Academic Year', 'Remove'].map(h => (
                    <TableCell key={h} sx={{ fontWeight: 700, color: '#333', fontSize: 13 }}
                      align={h === '#' || h === 'Remove' ? 'center' : 'left'}>{h}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAssignments.length === 0 ? (
                  <TableRow><TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                    <SchoolIcon sx={{ fontSize: 48, color: '#ccc', mb: 1 }} />
                    <Typography color="text.secondary" fontWeight={500}>No assignments yet</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Use the form above to assign teachers to classes and subjects
                    </Typography>
                  </TableCell></TableRow>
                ) : filteredAssignments.map((a, idx) => {
                  const teacher = a.teacher || {};
                  const avatarColor = AVATAR_COLORS[idx % AVATAR_COLORS.length];
                  return (
                    <TableRow key={a.id} sx={{ bgcolor: idx % 2 === 0 ? 'white' : '#fafafa', '&:hover': { bgcolor: '#f0f4ff' } }}>
                      <TableCell align="center">
                        <Typography variant="body2" color="text.secondary" fontWeight={600}>{idx + 1}</Typography>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1.5}>
                          <Avatar sx={{ width: 38, height: 38, bgcolor: avatarColor, fontSize: 13, fontWeight: 800 }}>
                            {teacher.firstName?.[0]}{teacher.lastName?.[0]}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={700} sx={{ lineHeight: 1.3 }}>
                              {teacher.firstName} {teacher.lastName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">{teacher.designation || 'Teacher'}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label={teacher.employeeId || '—'} size="small" variant="outlined" color="secondary" sx={{ fontWeight: 600 }} />
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <ClassIcon fontSize="small" sx={{ color: '#1976d2' }} />
                          <Typography variant="body2" fontWeight={600}>{a.schoolClass?.name || '—'}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {a.section
                          ? <Chip label={`Section ${a.section.name}`} size="small" sx={{ bgcolor: '#e3f2fd', color: '#1565c0', fontWeight: 600 }} />
                          : <Typography variant="body2" color="text.secondary">—</Typography>
                        }
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>{a.subject?.name || '—'}</Typography>
                          {a.subject?.code && (
                            <Chip label={a.subject.code} size="small"
                              sx={{ mt: 0.3, height: 18, fontSize: 10, bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 700 }} />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <Typography variant="body2">{a.academicYear?.name || '—'}</Typography>
                          {a.academicYear?.isActive && <Chip label="Active" size="small" color="success" sx={{ height: 16, fontSize: 9 }} />}
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Remove Assignment">
                          <IconButton size="small" color="error" onClick={() => handleDeleteAssignment(a.id)}
                            sx={{ '&:hover': { bgcolor: '#ffebee' } }}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </TabPanel>

      {/* ===== Add/Edit Teacher Dialog ===== */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">{isEdit ? 'Edit Teacher' : 'Add New Teacher'}</Typography>
          <IconButton onClick={handleCloseDialog} sx={{ color: 'white' }}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}><Typography variant="subtitle2" color="primary" fontWeight={600}>Personal Information</Typography><Divider sx={{ mt: 1 }} /></Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="First Name" required value={formData.firstName}
                onChange={e => setFormData({ ...formData, firstName: e.target.value })} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Last Name" required value={formData.lastName}
                onChange={e => setFormData({ ...formData, lastName: e.target.value })} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Date of Birth" type="date" value={formData.dateOfBirth}
                onChange={e => setFormData({ ...formData, dateOfBirth: e.target.value })}
                InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Gender</InputLabel>
                <Select value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })} label="Gender">
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Joining Date" type="date" value={formData.joiningDate}
                onChange={e => setFormData({ ...formData, joiningDate: e.target.value })}
                InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12}><Typography variant="subtitle2" color="primary" fontWeight={600} sx={{ mt: 1 }}>Contact Information</Typography><Divider sx={{ mt: 1 }} /></Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Phone" value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon fontSize="small" /></InputAdornment> }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Email" type="email" value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon fontSize="small" /></InputAdornment> }} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Address" multiline rows={2} value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })} />
            </Grid>
            <Grid item xs={12}><Typography variant="subtitle2" color="primary" fontWeight={600} sx={{ mt: 1 }}>Professional Information</Typography><Divider sx={{ mt: 1 }} /></Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Qualification" value={formData.qualification}
                onChange={e => setFormData({ ...formData, qualification: e.target.value })}
                placeholder="e.g., M.Ed, B.Ed, Ph.D" />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Experience" value={formData.experience}
                onChange={e => setFormData({ ...formData, experience: e.target.value })}
                placeholder="e.g., 5 years" />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Designation" value={formData.designation}
                onChange={e => setFormData({ ...formData, designation: e.target.value })}
                placeholder="e.g., Senior Teacher, HOD" />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Specialization" value={formData.specialization}
                onChange={e => setFormData({ ...formData, specialization: e.target.value })}
                placeholder="e.g., Mathematics, Science" />
            </Grid>
            {!isEdit && (
              <Grid item xs={12}>
                <Box sx={{ p: 2, bgcolor: '#e3f2fd', borderRadius: 2, border: '1px solid #2196f3' }}>
                  <Typography variant="subtitle2" color="primary.dark" fontWeight={700} sx={{ mb: 0.5 }}>
                    Teacher App Login Credentials
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                    Set credentials for the teacher to login to the mobile app.
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField fullWidth label="Login Username" value={formData.loginUsername}
                        onChange={e => setFormData({ ...formData, loginUsername: e.target.value })}
                        placeholder="e.g., john.smith" />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField fullWidth label="Login Password" type="password" value={formData.loginPassword}
                        onChange={e => setFormData({ ...formData, loginPassword: e.target.value })}
                        placeholder="Min 6 characters" />
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: 'grey.50' }}>
          <Button onClick={handleCloseDialog} variant="outlined">Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">{isEdit ? 'Update Teacher' : 'Add Teacher'}</Button>
        </DialogActions>
      </Dialog>

      {/* View Teacher Dialog */}
      <Dialog open={openViewDialog} onClose={() => setOpenViewDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>Teacher Details</DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedTeacher && (
            <Grid container spacing={2}>
              <Grid item xs={12} textAlign="center">
                <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 2, bgcolor: 'secondary.main', fontSize: 28 }}>
                  {selectedTeacher.firstName?.[0]}{selectedTeacher.lastName?.[0]}
                </Avatar>
                <Typography variant="h6">{selectedTeacher.firstName} {selectedTeacher.lastName}</Typography>
                <Chip label={selectedTeacher.employeeId} color="secondary" size="small" sx={{ mt: 1 }} />
              </Grid>
              {[
                ['Designation', selectedTeacher.designation],
                ['Specialization', selectedTeacher.specialization],
                ['Qualification', selectedTeacher.qualification],
                ['Experience', selectedTeacher.experience],
                ['Gender', selectedTeacher.gender],
                ['Date of Birth', selectedTeacher.dateOfBirth],
                ['Phone', selectedTeacher.phone],
                ['Email', selectedTeacher.email],
                ['Joining Date', selectedTeacher.joiningDate],
              ].map(([label, val]) => (
                <Grid item xs={6} key={label}>
                  <Typography variant="body2" color="text.secondary">{label}</Typography>
                  <Typography>{val || '—'}</Typography>
                </Grid>
              ))}
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">Address</Typography>
                <Typography>{selectedTeacher.address || '—'}</Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions><Button onClick={() => setOpenViewDialog(false)}>Close</Button></DialogActions>
      </Dialog>

      {/* Delete Teacher Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete <strong>{selectedTeacher?.firstName} {selectedTeacher?.lastName}</strong>?</Typography>
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} variant="filled" onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
