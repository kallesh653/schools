import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Grid, MenuItem, Select, FormControl, InputLabel,
  Chip, Card, CardContent, InputAdornment, Alert, Snackbar, Avatar,
  TablePagination, Tooltip, Divider
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
  Search as SearchIcon, Person as PersonIcon, Visibility as ViewIcon,
  Close as CloseIcon, School as SchoolIcon, FileDownload as DownloadIcon
} from '@mui/icons-material';
import { studentAPI, academicAPI } from '../services/api';
import * as XLSX from 'xlsx';

const initialFormState = {
  firstName: '', lastName: '', dateOfBirth: '', gender: '', bloodGroup: '',
  address: '', phone: '', email: '', rollNo: '', schoolClass: null, section: null,
  admissionDate: new Date().toISOString().split('T')[0],
  // Parent Info
  fatherName: '', fatherPhone: '', fatherEmail: '', fatherOccupation: '',
  motherName: '', motherPhone: '', motherEmail: '', motherOccupation: '',
  address2: '', emergencyContact: '',
  // Parent App Login Credentials
  parentUsername: '', parentPassword: '', parentFullName: '', parentPhone: '', parentEmail: ''
};

export default function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [allSections, setAllSections] = useState([]);
  const [loading, setLoading] = useState(true); // eslint-disable-line no-unused-vars
  const [openDialog, setOpenDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [isEdit, setIsEdit] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterClass, setFilterClass] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (formData.schoolClass) {
      const filtered = allSections.filter(s => s.schoolClass?.id === parseInt(formData.schoolClass));
      setSections(filtered);
    } else {
      setSections([]);
    }
  }, [formData.schoolClass, allSections]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [studentsRes, classesRes, sectionsRes] = await Promise.all([
        studentAPI.getAll(),
        academicAPI.getClasses(),
        academicAPI.getSections()
      ]);
      setStudents(studentsRes.data);
      setClasses(classesRes.data);
      setAllSections(sectionsRes.data);
    } catch (error) {
      showSnackbar('Error loading data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleOpenDialog = (student = null) => {
    if (student) {
      setIsEdit(true);
      setFormData({
        ...student,
        schoolClass: student.schoolClass?.id || '',
        section: student.section?.id || '',
        dateOfBirth: student.dateOfBirth || '',
        admissionDate: student.admissionDate || ''
      });
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

  const handleViewStudent = (student) => {
    setSelectedStudent(student);
    setOpenViewDialog(true);
  };

  const handleDeleteClick = (student) => {
    setSelectedStudent(student);
    setOpenDeleteDialog(true);
  };

  const handleSubmit = async () => {
    try {
      if (isEdit) {
        const data = {
          ...formData,
          schoolClass: formData.schoolClass ? { id: parseInt(formData.schoolClass) } : null,
          section: formData.section ? { id: parseInt(formData.section) } : null,
        };
        await studentAPI.update(formData.id, data);
        showSnackbar('Student updated successfully');
      } else {
        // New student: send DTO with classId/sectionId and parent credentials
        const data = {
          ...formData,
          classId: formData.schoolClass ? parseInt(formData.schoolClass) : null,
          sectionId: formData.section ? parseInt(formData.section) : null,
          academicYearId: 1,
        };
        await studentAPI.create(data);
        showSnackbar('Student added successfully! Parent login created.');
      }
      handleCloseDialog();
      loadData();
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Error saving student', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await studentAPI.delete(selectedStudent.id);
      showSnackbar('Student deleted successfully');
      setOpenDeleteDialog(false);
      loadData();
    } catch (error) {
      showSnackbar('Error deleting student', 'error');
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = searchQuery === '' ||
      `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.admissionNo?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = filterClass === '' || student.schoolClass?.id === parseInt(filterClass);
    return matchesSearch && matchesClass;
  });

  const paginatedStudents = filteredStudents.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const exportToExcel = () => {
    const data = filteredStudents.map(s => ({
      'Admission No': s.admissionNo || '',
      'First Name': s.firstName || '',
      'Last Name': s.lastName || '',
      'Date of Birth': s.dateOfBirth || '',
      'Gender': s.gender || '',
      'Blood Group': s.bloodGroup || '',
      'Class': s.schoolClass?.name || '',
      'Section': s.section?.name || '',
      'Roll No': s.rollNo || '',
      'Phone': s.phone || '',
      'Email': s.email || '',
      'Address': s.address || '',
      'Admission Date': s.admissionDate || '',
      'Father Name': s.fatherName || '',
      'Father Phone': s.fatherPhone || '',
      'Mother Name': s.motherName || '',
      'Status': s.status || 'Active',
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Students');
    XLSX.writeFile(wb, `students_export_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold" color="primary">
            Student Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage all students in the school
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}
          sx={{ borderRadius: 2, px: 3, py: 1, textTransform: 'none', fontWeight: 600 }}>
          Add Student
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>Total Students</Typography>
                  <Typography variant="h4" fontWeight="bold">{students.length}</Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <PersonIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', color: 'white' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>Active Students</Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {students.filter(s => s.active !== false).length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <SchoolIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #eb3349 0%, #f45c43 100%)', color: 'white' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>Classes</Typography>
                  <Typography variant="h4" fontWeight="bold">{classes.length}</Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <SchoolIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>Sections</Typography>
                  <Typography variant="h4" fontWeight="bold">{allSections.length}</Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <SchoolIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Filter */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField fullWidth placeholder="Search by name, admission no, or email..."
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
              }}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Filter by Class</InputLabel>
              <Select value={filterClass} onChange={(e) => setFilterClass(e.target.value)} label="Filter by Class">
                <MenuItem value="">All Classes</MenuItem>
                {classes.map((cls) => (
                  <MenuItem key={cls.id} value={cls.id}>{cls.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {filteredStudents.length} of {students.length}
            </Typography>
            <Button variant="outlined" size="small" startIcon={<DownloadIcon />} onClick={exportToExcel}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
              Export Excel
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Students Table */}
      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'primary.main' }}>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Admission No</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Student Name</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Class</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Section</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Phone</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No students found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedStudents.map((student, index) => (
                  <TableRow key={student.id} sx={{ '&:hover': { bgcolor: 'action.hover' },
                    bgcolor: index % 2 === 0 ? 'grey.50' : 'white' }}>
                    <TableCell>
                      <Chip label={student.admissionNo} size="small" color="primary" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.light', fontSize: 14 }}>
                          {student.firstName?.[0]}{student.lastName?.[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={500}>
                            {student.firstName} {student.lastName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {student.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{student.schoolClass?.name || '-'}</TableCell>
                    <TableCell>{student.section?.name || '-'}</TableCell>
                    <TableCell>{student.phone || '-'}</TableCell>
                    <TableCell>
                      <Chip label={student.active !== false ? 'Active' : 'Inactive'}
                        color={student.active !== false ? 'success' : 'default'} size="small" />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="View"><IconButton size="small" onClick={() => handleViewStudent(student)}>
                        <ViewIcon fontSize="small" />
                      </IconButton></Tooltip>
                      <Tooltip title="Edit"><IconButton size="small" color="primary" onClick={() => handleOpenDialog(student)}>
                        <EditIcon fontSize="small" />
                      </IconButton></Tooltip>
                      <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => handleDeleteClick(student)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton></Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination component="div" count={filteredStudents.length} page={page}
          onPageChange={(e, newPage) => setPage(newPage)} rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">{isEdit ? 'Edit Student' : 'Add New Student'}</Typography>
          <IconButton onClick={handleCloseDialog} sx={{ color: 'white' }}><CloseIcon /></IconButton>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}><Typography variant="subtitle2" color="primary" fontWeight={600}>Personal Information</Typography><Divider sx={{ mt: 1 }} /></Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="First Name" required value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Last Name" required value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Date of Birth" type="date" value={formData.dateOfBirth}
                onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Gender</InputLabel>
                <Select value={formData.gender} onChange={(e) => setFormData({...formData, gender: e.target.value})} label="Gender">
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Blood Group</InputLabel>
                <Select value={formData.bloodGroup} onChange={(e) => setFormData({...formData, bloodGroup: e.target.value})} label="Blood Group">
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                    <MenuItem key={bg} value={bg}>{bg}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}><Typography variant="subtitle2" color="primary" fontWeight={600} sx={{ mt: 1 }}>Contact Information</Typography><Divider sx={{ mt: 1 }} /></Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Phone" value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Email" type="email" value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Address" multiline rows={2} value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})} />
            </Grid>
            <Grid item xs={12}><Typography variant="subtitle2" color="primary" fontWeight={600} sx={{ mt: 1 }}>Academic Information</Typography><Divider sx={{ mt: 1 }} /></Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth required>
                <InputLabel>Class</InputLabel>
                <Select value={formData.schoolClass} onChange={(e) => setFormData({...formData, schoolClass: e.target.value, section: ''})} label="Class">
                  {classes.map((cls) => (
                    <MenuItem key={cls.id} value={cls.id}>{cls.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth required>
                <InputLabel>Section</InputLabel>
                <Select value={formData.section} onChange={(e) => setFormData({...formData, section: e.target.value})} label="Section" disabled={!formData.schoolClass}>
                  {sections.map((sec) => (
                    <MenuItem key={sec.id} value={sec.id}>{sec.name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Roll No" value={formData.rollNo}
                onChange={(e) => setFormData({...formData, rollNo: e.target.value})} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Admission Date" type="date" value={formData.admissionDate}
                onChange={(e) => setFormData({...formData, admissionDate: e.target.value})}
                InputLabelProps={{ shrink: true }} />
            </Grid>

            {!isEdit && (<>
              <Grid item xs={12}><Typography variant="subtitle2" color="primary" fontWeight={600} sx={{ mt: 1 }}>Parent / Guardian Information</Typography><Divider sx={{ mt: 1 }} /></Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Father's Name" value={formData.fatherName}
                  onChange={(e) => setFormData({...formData, fatherName: e.target.value})} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Father's Phone" value={formData.fatherPhone}
                  onChange={(e) => setFormData({...formData, fatherPhone: e.target.value})} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Father's Email" type="email" value={formData.fatherEmail}
                  onChange={(e) => setFormData({...formData, fatherEmail: e.target.value})} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Father's Occupation" value={formData.fatherOccupation}
                  onChange={(e) => setFormData({...formData, fatherOccupation: e.target.value})} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Mother's Name" value={formData.motherName}
                  onChange={(e) => setFormData({...formData, motherName: e.target.value})} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Mother's Phone" value={formData.motherPhone}
                  onChange={(e) => setFormData({...formData, motherPhone: e.target.value})} />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField fullWidth label="Emergency Contact" value={formData.emergencyContact}
                  onChange={(e) => setFormData({...formData, emergencyContact: e.target.value})} />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ p: 2, bgcolor: '#e8f5e9', borderRadius: 2, border: '1px solid #4caf50' }}>
                  <Typography variant="subtitle2" color="success.dark" fontWeight={700} sx={{ mb: 1 }}>
                    🔐 Parent App Login Credentials
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                    Set a username and password for the parent to login to the parent mobile app.
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField fullWidth label="Parent Username *" required value={formData.parentUsername}
                        onChange={(e) => setFormData({...formData, parentUsername: e.target.value})}
                        placeholder="e.g., rajesh.kumar" />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField fullWidth label="Parent Password *" required type="password" value={formData.parentPassword}
                        onChange={(e) => setFormData({...formData, parentPassword: e.target.value})}
                        placeholder="Min 6 characters" />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField fullWidth label="Parent Full Name" value={formData.parentFullName}
                        onChange={(e) => setFormData({...formData, parentFullName: e.target.value})} />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField fullWidth label="Parent Phone" value={formData.parentPhone}
                        onChange={(e) => setFormData({...formData, parentPhone: e.target.value})} />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField fullWidth label="Parent Email" type="email" value={formData.parentEmail}
                        onChange={(e) => setFormData({...formData, parentEmail: e.target.value})} />
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
            </>)}
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, bgcolor: 'grey.50' }}>
          <Button onClick={handleCloseDialog} variant="outlined">Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">{isEdit ? 'Update Student' : 'Add Student'}</Button>
        </DialogActions>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={openViewDialog} onClose={() => setOpenViewDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>Student Details</DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedStudent && (
            <Grid container spacing={2}>
              <Grid item xs={12} textAlign="center">
                <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 2, bgcolor: 'primary.main', fontSize: 28 }}>
                  {selectedStudent.firstName?.[0]}{selectedStudent.lastName?.[0]}
                </Avatar>
                <Typography variant="h6">{selectedStudent.firstName} {selectedStudent.lastName}</Typography>
                <Chip label={selectedStudent.admissionNo} color="primary" size="small" sx={{ mt: 1 }} />
              </Grid>
              <Grid item xs={6}><Typography variant="body2" color="text.secondary">Class</Typography><Typography>{selectedStudent.schoolClass?.name || '-'}</Typography></Grid>
              <Grid item xs={6}><Typography variant="body2" color="text.secondary">Section</Typography><Typography>{selectedStudent.section?.name || '-'}</Typography></Grid>
              <Grid item xs={6}><Typography variant="body2" color="text.secondary">Roll No</Typography><Typography>{selectedStudent.rollNo || '-'}</Typography></Grid>
              <Grid item xs={6}><Typography variant="body2" color="text.secondary">Gender</Typography><Typography>{selectedStudent.gender || '-'}</Typography></Grid>
              <Grid item xs={6}><Typography variant="body2" color="text.secondary">Date of Birth</Typography><Typography>{selectedStudent.dateOfBirth || '-'}</Typography></Grid>
              <Grid item xs={6}><Typography variant="body2" color="text.secondary">Blood Group</Typography><Typography>{selectedStudent.bloodGroup || '-'}</Typography></Grid>
              <Grid item xs={6}><Typography variant="body2" color="text.secondary">Phone</Typography><Typography>{selectedStudent.phone || '-'}</Typography></Grid>
              <Grid item xs={6}><Typography variant="body2" color="text.secondary">Email</Typography><Typography>{selectedStudent.email || '-'}</Typography></Grid>
              <Grid item xs={12}><Typography variant="body2" color="text.secondary">Address</Typography><Typography>{selectedStudent.address || '-'}</Typography></Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions><Button onClick={() => setOpenViewDialog(false)}>Close</Button></DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete student <strong>{selectedStudent?.firstName} {selectedStudent?.lastName}</strong>?</Typography>
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({...snackbar, open: false})}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} variant="filled" onClose={() => setSnackbar({...snackbar, open: false})}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
