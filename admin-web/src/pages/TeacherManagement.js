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
  Close as CloseIcon, Work as WorkIcon, Email as EmailIcon, Phone as PhoneIcon,
  FileDownload as DownloadIcon
} from '@mui/icons-material';
import { teacherAPI } from '../services/api';
import * as XLSX from 'xlsx';

const initialFormState = {
  firstName: '', lastName: '', dateOfBirth: '', gender: '', phone: '', email: '',
  qualification: '', experience: '', designation: '', specialization: '', address: '',
  joiningDate: new Date().toISOString().split('T')[0],
  // Teacher App Login Credentials
  loginUsername: '', loginPassword: ''
};

export default function TeacherManagement() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true); // eslint-disable-line no-unused-vars
  const [openDialog, setOpenDialog] = useState(false);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [formData, setFormData] = useState(initialFormState);
  const [isEdit, setIsEdit] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      setLoading(true);
      const response = await teacherAPI.getAll();
      setTeachers(response.data);
    } catch (error) {
      showSnackbar('Error loading teachers', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleOpenDialog = (teacher = null) => {
    if (teacher) {
      setIsEdit(true);
      setFormData({
        ...teacher,
        dateOfBirth: teacher.dateOfBirth || '',
        joiningDate: teacher.joiningDate || ''
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

  const handleViewTeacher = (teacher) => {
    setSelectedTeacher(teacher);
    setOpenViewDialog(true);
  };

  const handleDeleteClick = (teacher) => {
    setSelectedTeacher(teacher);
    setOpenDeleteDialog(true);
  };

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
      loadTeachers();
    } catch (error) {
      showSnackbar(error.response?.data?.message || 'Error saving teacher', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await teacherAPI.delete(selectedTeacher.id);
      showSnackbar('Teacher deleted successfully');
      setOpenDeleteDialog(false);
      loadTeachers();
    } catch (error) {
      showSnackbar('Error deleting teacher', 'error');
    }
  };

  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = searchQuery === '' ||
      `${teacher.firstName} ${teacher.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.employeeId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.specialization?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const paginatedTeachers = filteredTeachers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

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
      'Status': t.status || 'Active',
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Teachers');
    XLSX.writeFile(wb, `teachers_export_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <Box>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight="bold" color="primary">
            Teacher Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage all teachers and staff members
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}
          sx={{ borderRadius: 2, px: 3, py: 1, textTransform: 'none', fontWeight: 600 }}>
          Add Teacher
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>Total Teachers</Typography>
                  <Typography variant="h4" fontWeight="bold">{teachers.length}</Typography>
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
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>Active Teachers</Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {teachers.filter(t => t.active !== false).length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <WorkIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>Male Teachers</Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {teachers.filter(t => t.gender === 'Male').length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <PersonIcon />
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
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>Female Teachers</Typography>
                  <Typography variant="h4" fontWeight="bold">
                    {teachers.filter(t => t.gender === 'Female').length}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <PersonIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={8}>
            <TextField fullWidth placeholder="Search by name, employee ID, email, or specialization..."
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
              }}
              size="small"
            />
          </Grid>
          <Grid item xs={12} md={4} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {filteredTeachers.length} of {teachers.length}
            </Typography>
            <Button variant="outlined" size="small" startIcon={<DownloadIcon />} onClick={exportToExcel}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
              Export Excel
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Teachers Table */}
      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'primary.main' }}>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Employee ID</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Teacher Name</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Specialization</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Phone</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Email</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 600 }} align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedTeachers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No teachers found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedTeachers.map((teacher, index) => (
                  <TableRow key={teacher.id} sx={{ '&:hover': { bgcolor: 'action.hover' },
                    bgcolor: index % 2 === 0 ? 'grey.50' : 'white' }}>
                    <TableCell>
                      <Chip label={teacher.employeeId} size="small" color="secondary" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.light', fontSize: 14 }}>
                          {teacher.firstName?.[0]}{teacher.lastName?.[0]}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={500}>
                            {teacher.firstName} {teacher.lastName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {teacher.designation || 'Teacher'}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip label={teacher.specialization || '-'} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>{teacher.phone || '-'}</TableCell>
                    <TableCell>{teacher.email || '-'}</TableCell>
                    <TableCell>
                      <Chip label={teacher.active !== false ? 'Active' : 'Inactive'}
                        color={teacher.active !== false ? 'success' : 'default'} size="small" />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="View"><IconButton size="small" onClick={() => handleViewTeacher(teacher)}>
                        <ViewIcon fontSize="small" />
                      </IconButton></Tooltip>
                      <Tooltip title="Edit"><IconButton size="small" color="primary" onClick={() => handleOpenDialog(teacher)}>
                        <EditIcon fontSize="small" />
                      </IconButton></Tooltip>
                      <Tooltip title="Delete"><IconButton size="small" color="error" onClick={() => handleDeleteClick(teacher)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton></Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination component="div" count={filteredTeachers.length} page={page}
          onPageChange={(e, newPage) => setPage(newPage)} rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          rowsPerPageOptions={[5, 10, 25, 50]}
        />
      </Paper>

      {/* Add/Edit Dialog */}
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
              <TextField fullWidth label="Joining Date" type="date" value={formData.joiningDate}
                onChange={(e) => setFormData({...formData, joiningDate: e.target.value})}
                InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12}><Typography variant="subtitle2" color="primary" fontWeight={600} sx={{ mt: 1 }}>Contact Information</Typography><Divider sx={{ mt: 1 }} /></Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Phone" value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon fontSize="small" /></InputAdornment> }} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Email" type="email" required value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon fontSize="small" /></InputAdornment> }} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Address" multiline rows={2} value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})} />
            </Grid>
            <Grid item xs={12}><Typography variant="subtitle2" color="primary" fontWeight={600} sx={{ mt: 1 }}>Professional Information</Typography><Divider sx={{ mt: 1 }} /></Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Qualification" value={formData.qualification}
                onChange={(e) => setFormData({...formData, qualification: e.target.value})}
                placeholder="e.g., M.Ed, B.Ed, Ph.D" />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Experience (years)" value={formData.experience}
                onChange={(e) => setFormData({...formData, experience: e.target.value})} />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Designation" value={formData.designation}
                onChange={(e) => setFormData({...formData, designation: e.target.value})}
                placeholder="e.g., Senior Teacher, HOD" />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth label="Specialization" value={formData.specialization}
                onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                placeholder="e.g., Mathematics, Science" />
            </Grid>

            {!isEdit && (
              <Grid item xs={12}>
                <Box sx={{ p: 2, bgcolor: '#e3f2fd', borderRadius: 2, border: '1px solid #2196f3' }}>
                  <Typography variant="subtitle2" color="primary.dark" fontWeight={700} sx={{ mb: 1 }}>
                    🔐 Teacher App Login Credentials
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
                    Set a username and password for the teacher to login to the teacher mobile app.
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <TextField fullWidth label="Login Username *" required value={formData.loginUsername}
                        onChange={(e) => setFormData({...formData, loginUsername: e.target.value})}
                        placeholder="e.g., john.smith" />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField fullWidth label="Login Password *" required type="password" value={formData.loginPassword}
                        onChange={(e) => setFormData({...formData, loginPassword: e.target.value})}
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

      {/* View Dialog */}
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
              <Grid item xs={6}><Typography variant="body2" color="text.secondary">Designation</Typography><Typography>{selectedTeacher.designation || '-'}</Typography></Grid>
              <Grid item xs={6}><Typography variant="body2" color="text.secondary">Specialization</Typography><Typography>{selectedTeacher.specialization || '-'}</Typography></Grid>
              <Grid item xs={6}><Typography variant="body2" color="text.secondary">Qualification</Typography><Typography>{selectedTeacher.qualification || '-'}</Typography></Grid>
              <Grid item xs={6}><Typography variant="body2" color="text.secondary">Experience</Typography><Typography>{selectedTeacher.experience || '-'}</Typography></Grid>
              <Grid item xs={6}><Typography variant="body2" color="text.secondary">Gender</Typography><Typography>{selectedTeacher.gender || '-'}</Typography></Grid>
              <Grid item xs={6}><Typography variant="body2" color="text.secondary">Date of Birth</Typography><Typography>{selectedTeacher.dateOfBirth || '-'}</Typography></Grid>
              <Grid item xs={6}><Typography variant="body2" color="text.secondary">Phone</Typography><Typography>{selectedTeacher.phone || '-'}</Typography></Grid>
              <Grid item xs={6}><Typography variant="body2" color="text.secondary">Email</Typography><Typography>{selectedTeacher.email || '-'}</Typography></Grid>
              <Grid item xs={6}><Typography variant="body2" color="text.secondary">Joining Date</Typography><Typography>{selectedTeacher.joiningDate || '-'}</Typography></Grid>
              <Grid item xs={6}><Typography variant="body2" color="text.secondary">Status</Typography><Chip label={selectedTeacher.active !== false ? 'Active' : 'Inactive'} color={selectedTeacher.active !== false ? 'success' : 'default'} size="small" /></Grid>
              <Grid item xs={12}><Typography variant="body2" color="text.secondary">Address</Typography><Typography>{selectedTeacher.address || '-'}</Typography></Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions><Button onClick={() => setOpenViewDialog(false)}>Close</Button></DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete teacher <strong>{selectedTeacher?.firstName} {selectedTeacher?.lastName}</strong>?</Typography>
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
