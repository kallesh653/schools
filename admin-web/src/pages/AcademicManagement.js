import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Paper, Tab, Tabs, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Grid, MenuItem, Select, FormControl, InputLabel,
  Chip, IconButton, Snackbar, Alert, Card, CardContent, Avatar, Tooltip,
  Switch, FormControlLabel
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
  CalendarToday as YearIcon, Class as ClassIcon,
  Book as SubjectIcon, Groups as SectionIcon
} from '@mui/icons-material';
import { academicAPI } from '../services/api';

function TabPanel({ children, value, index }) {
  return value === index ? <Box sx={{ p: 3 }}>{children}</Box> : null;
}

export default function AcademicManagement() {
  const [tabValue, setTabValue] = useState(0);
  const [years, setYears] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [dialogType, setDialogType] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const [yearForm, setYearForm] = useState({ name: '', startDate: '', endDate: '', isActive: false, description: '' });
  const [classForm, setClassForm] = useState({ name: '', code: '', grade: '', capacity: '', description: '' });
  const [sectionForm, setSectionForm] = useState({ name: '', classId: '', capacity: '', description: '' });
  const [subjectForm, setSubjectForm] = useState({
    name: '', code: '', subjectType: 'THEORY', maxMarks: 100,
    theoryMaxMarks: 100, practicalMaxMarks: 0, passMarks: 33, description: ''
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [y, c, s, sub] = await Promise.all([
        academicAPI.getYears(), academicAPI.getClasses(),
        academicAPI.getSections(), academicAPI.getSubjects()
      ]);
      setYears(y.data);
      setClasses(c.data);
      setSections(s.data);
      setSubjects(sub.data);
    } catch (e) {
      showSnackbar('Error loading data', 'error');
    }
  };

  const showSnackbar = (msg, sev = 'success') => setSnackbar({ open: true, message: msg, severity: sev });

  const handleOpen = (type, item = null) => {
    setDialogType(type);
    setEditingItem(item);
    if (type === 'year') {
      setYearForm(item
        ? { name: item.name || '', startDate: item.startDate || '', endDate: item.endDate || '', isActive: item.isActive || false, description: item.description || '' }
        : { name: '', startDate: '', endDate: '', isActive: false, description: '' });
    } else if (type === 'class') {
      setClassForm(item
        ? { name: item.name || '', code: item.code || '', grade: item.grade || '', capacity: item.capacity || '', description: item.description || '' }
        : { name: '', code: '', grade: '', capacity: '', description: '' });
    } else if (type === 'section') {
      setSectionForm(item
        ? { name: item.name || '', classId: item.schoolClass?.id || '', capacity: item.capacity || '', description: item.description || '' }
        : { name: '', classId: '', capacity: '', description: '' });
    } else if (type === 'subject') {
      setSubjectForm(item
        ? { name: item.name || '', code: item.code || '', subjectType: item.subjectType || 'THEORY', maxMarks: item.maxMarks || 100, theoryMaxMarks: item.theoryMaxMarks || 100, practicalMaxMarks: item.practicalMaxMarks || 0, passMarks: item.passMarks || 33, description: item.description || '' }
        : { name: '', code: '', subjectType: 'THEORY', maxMarks: 100, theoryMaxMarks: 100, practicalMaxMarks: 0, passMarks: 33, description: '' });
    }
    setOpenDialog(true);
  };

  const handleSave = async () => {
    try {
      if (dialogType === 'year') {
        if (!yearForm.name) { showSnackbar('Year name is required', 'error'); return; }
        if (editingItem) {
          await academicAPI.updateYear(editingItem.id, yearForm);
        } else {
          await academicAPI.createYear(yearForm);
        }
        showSnackbar('Academic year ' + (editingItem ? 'updated' : 'created') + ' successfully');
      } else if (dialogType === 'class') {
        if (!classForm.name) { showSnackbar('Class name is required', 'error'); return; }
        const payload = {
          ...classForm,
          grade: classForm.grade ? parseInt(classForm.grade) : null,
          capacity: classForm.capacity ? parseInt(classForm.capacity) : null
        };
        if (editingItem) {
          await academicAPI.updateClass(editingItem.id, payload);
        } else {
          await academicAPI.createClass(payload);
        }
        showSnackbar('Class ' + (editingItem ? 'updated' : 'created') + ' successfully');
      } else if (dialogType === 'section') {
        if (!sectionForm.name || !sectionForm.classId) { showSnackbar('Name and Class are required', 'error'); return; }
        const payload = {
          name: sectionForm.name,
          capacity: sectionForm.capacity ? parseInt(sectionForm.capacity) : null,
          description: sectionForm.description,
          schoolClass: { id: parseInt(sectionForm.classId) }
        };
        if (editingItem) {
          await academicAPI.updateSection(editingItem.id, payload);
        } else {
          await academicAPI.createSection(payload);
        }
        showSnackbar('Section ' + (editingItem ? 'updated' : 'created') + ' successfully');
      } else if (dialogType === 'subject') {
        if (!subjectForm.name) { showSnackbar('Subject name is required', 'error'); return; }
        const payload = {
          ...subjectForm,
          maxMarks: parseInt(subjectForm.maxMarks),
          theoryMaxMarks: parseInt(subjectForm.theoryMaxMarks),
          practicalMaxMarks: parseInt(subjectForm.practicalMaxMarks),
          passMarks: parseInt(subjectForm.passMarks)
        };
        if (editingItem) {
          await academicAPI.updateSubject(editingItem.id, payload);
        } else {
          await academicAPI.createSubject(payload);
        }
        showSnackbar('Subject ' + (editingItem ? 'updated' : 'created') + ' successfully');
      }
      setOpenDialog(false);
      loadData();
    } catch (e) {
      showSnackbar(e.response?.data?.message || 'Error saving', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      if (dialogType === 'year') await academicAPI.deleteYear(deletingItem.id);
      else if (dialogType === 'class') await academicAPI.deleteClass(deletingItem.id);
      else if (dialogType === 'section') await academicAPI.deleteSection(deletingItem.id);
      else if (dialogType === 'subject') await academicAPI.deleteSubject(deletingItem.id);
      showSnackbar('Deleted successfully');
      setOpenDeleteDialog(false);
      loadData();
    } catch (e) {
      showSnackbar('Error deleting - may have related records', 'error');
    }
  };

  const confirmDelete = (type, item) => {
    setDialogType(type);
    setDeletingItem(item);
    setOpenDeleteDialog(true);
  };

  const statCards = [
    { title: 'Academic Years', value: years.length, gradient: 'linear-gradient(135deg,#667eea,#764ba2)', icon: YearIcon },
    { title: 'Classes', value: classes.length, gradient: 'linear-gradient(135deg,#f5576c,#f093fb)', icon: ClassIcon },
    { title: 'Sections', value: sections.length, gradient: 'linear-gradient(135deg,#4facfe,#00f2fe)', icon: SectionIcon },
    { title: 'Subjects', value: subjects.length, gradient: 'linear-gradient(135deg,#11998e,#38ef7d)', icon: SubjectIcon },
  ];

  const tableHeadSx = { bgcolor: '#1a237e' };
  const thSx = { color: 'white', fontWeight: 600 };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a237e' }}>Academic Management</Typography>
          <Typography variant="body2" color="text.secondary">Manage years, classes, sections and subjects</Typography>
        </Box>
      </Box>

      {/* Stat Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {statCards.map((s) => (
          <Grid item xs={12} sm={6} md={3} key={s.title}>
            <Card sx={{ background: s.gradient, color: 'white', borderRadius: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>{s.title}</Typography>
                    <Typography variant="h3" sx={{ fontWeight: 700 }}>{s.value}</Typography>
                  </Box>
                  <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 50, height: 50 }}>
                    <s.icon sx={{ fontSize: 28 }} />
                  </Avatar>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Paper sx={{ borderRadius: 3 }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} sx={{ borderBottom: '1px solid #e0e0e0', px: 2 }}>
          <Tab label="Academic Years" />
          <Tab label="Classes" />
          <Tab label="Sections" />
          <Tab label="Subjects" />
        </Tabs>

        {/* Academic Years Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen('year')}
              sx={{ bgcolor: '#1a237e', '&:hover': { bgcolor: '#0d1642' }, borderRadius: 2 }}>
              Add Academic Year
            </Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead sx={tableHeadSx}>
                <TableRow>
                  <TableCell sx={thSx}>Name</TableCell>
                  <TableCell sx={thSx}>Start Date</TableCell>
                  <TableCell sx={thSx}>End Date</TableCell>
                  <TableCell sx={thSx}>Status</TableCell>
                  <TableCell sx={thSx}>Description</TableCell>
                  <TableCell align="center" sx={thSx}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {years.length === 0 ? (
                  <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No academic years found</Typography>
                  </TableCell></TableRow>
                ) : years.map((yr) => (
                  <TableRow key={yr.id} hover>
                    <TableCell><Typography fontWeight={500}>{yr.name}</Typography></TableCell>
                    <TableCell>{yr.startDate || '-'}</TableCell>
                    <TableCell>{yr.endDate || '-'}</TableCell>
                    <TableCell>
                      <Chip label={yr.isActive ? 'Active' : 'Inactive'} color={yr.isActive ? 'success' : 'default'} size="small" />
                    </TableCell>
                    <TableCell>{yr.description || '-'}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => handleOpen('year', yr)} sx={{ color: '#1565c0' }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" onClick={() => confirmDelete('year', yr)} sx={{ color: '#d32f2f' }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Classes Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen('class')}
              sx={{ bgcolor: '#1a237e', '&:hover': { bgcolor: '#0d1642' }, borderRadius: 2 }}>
              Add Class
            </Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead sx={tableHeadSx}>
                <TableRow>
                  <TableCell sx={thSx}>Name</TableCell>
                  <TableCell sx={thSx}>Code</TableCell>
                  <TableCell sx={thSx}>Grade</TableCell>
                  <TableCell sx={thSx}>Capacity</TableCell>
                  <TableCell sx={thSx}>Description</TableCell>
                  <TableCell align="center" sx={thSx}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {classes.length === 0 ? (
                  <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No classes found</Typography>
                  </TableCell></TableRow>
                ) : classes.map((cls) => (
                  <TableRow key={cls.id} hover>
                    <TableCell><Typography fontWeight={500}>{cls.name}</Typography></TableCell>
                    <TableCell>{cls.code || '-'}</TableCell>
                    <TableCell>{cls.grade || '-'}</TableCell>
                    <TableCell>{cls.capacity || '-'}</TableCell>
                    <TableCell>{cls.description || '-'}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => handleOpen('class', cls)} sx={{ color: '#1565c0' }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" onClick={() => confirmDelete('class', cls)} sx={{ color: '#d32f2f' }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Sections Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen('section')}
              sx={{ bgcolor: '#1a237e', '&:hover': { bgcolor: '#0d1642' }, borderRadius: 2 }}>
              Add Section
            </Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead sx={tableHeadSx}>
                <TableRow>
                  <TableCell sx={thSx}>Name</TableCell>
                  <TableCell sx={thSx}>Class</TableCell>
                  <TableCell sx={thSx}>Capacity</TableCell>
                  <TableCell sx={thSx}>Description</TableCell>
                  <TableCell align="center" sx={thSx}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sections.length === 0 ? (
                  <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No sections found</Typography>
                  </TableCell></TableRow>
                ) : sections.map((sec) => (
                  <TableRow key={sec.id} hover>
                    <TableCell><Typography fontWeight={500}>{sec.name}</Typography></TableCell>
                    <TableCell>{sec.schoolClass?.name || '-'}</TableCell>
                    <TableCell>{sec.capacity || '-'}</TableCell>
                    <TableCell>{sec.description || '-'}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => handleOpen('section', sec)} sx={{ color: '#1565c0' }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" onClick={() => confirmDelete('section', sec)} sx={{ color: '#d32f2f' }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Subjects Tab */}
        <TabPanel value={tabValue} index={3}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen('subject')}
              sx={{ bgcolor: '#1a237e', '&:hover': { bgcolor: '#0d1642' }, borderRadius: 2 }}>
              Add Subject
            </Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead sx={tableHeadSx}>
                <TableRow>
                  <TableCell sx={thSx}>Name</TableCell>
                  <TableCell sx={thSx}>Code</TableCell>
                  <TableCell sx={thSx}>Type</TableCell>
                  <TableCell sx={thSx}>Max Marks</TableCell>
                  <TableCell sx={thSx}>Pass Marks</TableCell>
                  <TableCell sx={thSx}>Description</TableCell>
                  <TableCell align="center" sx={thSx}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {subjects.length === 0 ? (
                  <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No subjects found</Typography>
                  </TableCell></TableRow>
                ) : subjects.map((sub) => (
                  <TableRow key={sub.id} hover>
                    <TableCell><Typography fontWeight={500}>{sub.name}</Typography></TableCell>
                    <TableCell>{sub.code || '-'}</TableCell>
                    <TableCell>
                      <Chip label={sub.subjectType || 'THEORY'} size="small"
                        color={sub.subjectType === 'PRACTICAL' ? 'secondary' : sub.subjectType === 'BOTH' ? 'primary' : 'default'} />
                    </TableCell>
                    <TableCell>{sub.maxMarks}</TableCell>
                    <TableCell>{sub.passMarks}</TableCell>
                    <TableCell>{sub.description || '-'}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => handleOpen('subject', sub)} sx={{ color: '#1565c0' }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" onClick={() => confirmDelete('subject', sub)} sx={{ color: '#d32f2f' }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#1a237e', color: 'white' }}>
          {editingItem ? 'Edit' : 'Add'} {dialogType === 'year' ? 'Academic Year' : dialogType === 'class' ? 'Class' : dialogType === 'section' ? 'Section' : 'Subject'}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {/* Year Form */}
          {dialogType === 'year' && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField fullWidth label="Year Name *" value={yearForm.name}
                  onChange={(e) => setYearForm({ ...yearForm, name: e.target.value })} />
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth label="Start Date" type="date" value={yearForm.startDate}
                  onChange={(e) => setYearForm({ ...yearForm, startDate: e.target.value })}
                  InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth label="End Date" type="date" value={yearForm.endDate}
                  onChange={(e) => setYearForm({ ...yearForm, endDate: e.target.value })}
                  InputLabelProps={{ shrink: true }} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Description" multiline rows={2} value={yearForm.description}
                  onChange={(e) => setYearForm({ ...yearForm, description: e.target.value })} />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={<Switch checked={yearForm.isActive} onChange={(e) => setYearForm({ ...yearForm, isActive: e.target.checked })} />}
                  label="Set as Active Year"
                />
              </Grid>
            </Grid>
          )}

          {/* Class Form */}
          {dialogType === 'class' && (
            <Grid container spacing={2}>
              <Grid item xs={8}>
                <TextField fullWidth label="Class Name *" value={classForm.name}
                  onChange={(e) => setClassForm({ ...classForm, name: e.target.value })} />
              </Grid>
              <Grid item xs={4}>
                <TextField fullWidth label="Code" value={classForm.code}
                  onChange={(e) => setClassForm({ ...classForm, code: e.target.value })} />
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth label="Grade" type="number" value={classForm.grade}
                  onChange={(e) => setClassForm({ ...classForm, grade: e.target.value })} />
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth label="Capacity" type="number" value={classForm.capacity}
                  onChange={(e) => setClassForm({ ...classForm, capacity: e.target.value })} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Description" multiline rows={2} value={classForm.description}
                  onChange={(e) => setClassForm({ ...classForm, description: e.target.value })} />
              </Grid>
            </Grid>
          )}

          {/* Section Form */}
          {dialogType === 'section' && (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Class *</InputLabel>
                  <Select value={sectionForm.classId} onChange={(e) => setSectionForm({ ...sectionForm, classId: e.target.value })} label="Class *">
                    {classes.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={8}>
                <TextField fullWidth label="Section Name *" value={sectionForm.name}
                  onChange={(e) => setSectionForm({ ...sectionForm, name: e.target.value })} />
              </Grid>
              <Grid item xs={4}>
                <TextField fullWidth label="Capacity" type="number" value={sectionForm.capacity}
                  onChange={(e) => setSectionForm({ ...sectionForm, capacity: e.target.value })} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Description" multiline rows={2} value={sectionForm.description}
                  onChange={(e) => setSectionForm({ ...sectionForm, description: e.target.value })} />
              </Grid>
            </Grid>
          )}

          {/* Subject Form */}
          {dialogType === 'subject' && (
            <Grid container spacing={2}>
              <Grid item xs={8}>
                <TextField fullWidth label="Subject Name *" value={subjectForm.name}
                  onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })} />
              </Grid>
              <Grid item xs={4}>
                <TextField fullWidth label="Code" value={subjectForm.code}
                  onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })} />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Subject Type</InputLabel>
                  <Select value={subjectForm.subjectType} onChange={(e) => setSubjectForm({ ...subjectForm, subjectType: e.target.value })} label="Subject Type">
                    <MenuItem value="THEORY">Theory</MenuItem>
                    <MenuItem value="PRACTICAL">Practical</MenuItem>
                    <MenuItem value="BOTH">Both</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth label="Theory Max Marks" type="number" value={subjectForm.theoryMaxMarks}
                  onChange={(e) => setSubjectForm({ ...subjectForm, theoryMaxMarks: e.target.value })} />
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth label="Practical Max Marks" type="number" value={subjectForm.practicalMaxMarks}
                  onChange={(e) => setSubjectForm({ ...subjectForm, practicalMaxMarks: e.target.value })} />
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth label="Total Max Marks" type="number" value={subjectForm.maxMarks}
                  onChange={(e) => setSubjectForm({ ...subjectForm, maxMarks: e.target.value })} />
              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth label="Pass Marks" type="number" value={subjectForm.passMarks}
                  onChange={(e) => setSubjectForm({ ...subjectForm, passMarks: e.target.value })} />
              </Grid>
              <Grid item xs={12}>
                <TextField fullWidth label="Description" multiline rows={2} value={subjectForm.description}
                  onChange={(e) => setSubjectForm({ ...subjectForm, description: e.target.value })} />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" sx={{ bgcolor: '#1a237e' }}>
            {editingItem ? 'Update' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete <strong>{deletingItem?.name}</strong>?</Typography>
          <Typography variant="caption" color="text.secondary">This cannot be undone and may fail if related records exist.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} variant="filled" onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
