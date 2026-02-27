import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, TextField, Grid, Dialog, DialogTitle,
  DialogContent, DialogActions, MenuItem, Select, FormControl, InputLabel,
  Chip, IconButton, Snackbar, Alert, Card, CardContent, Avatar, Tooltip,
  InputAdornment, TablePagination
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
  Search as SearchIcon, Book as BookIcon, Assignment as AssignmentIcon,
  Schedule as ScheduleIcon, PriorityHigh as PriorityIcon
} from '@mui/icons-material';
import { academicAPI, teacherAPI, homeworkAPI } from '../services/api';

export default function HomeworkManagement() {
  const [homework, setHomework] = useState([]);
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [form, setForm] = useState({
    teacherId: '', subjectId: '', classId: '', title: '',
    description: '', dueDate: '', priority: 'NORMAL'
  });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [hw, cls, sub, tch] = await Promise.all([
        homeworkAPI.getAll(),
        academicAPI.getClasses(),
        academicAPI.getSubjects(),
        teacherAPI.getAll()
      ]);
      setHomework(hw.data);
      setClasses(cls.data);
      setSubjects(sub.data);
      setTeachers(tch.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const resetForm = () => setForm({
    teacherId: '', subjectId: '', classId: '', title: '',
    description: '', dueDate: '', priority: 'NORMAL'
  });

  const handleOpen = (item = null) => {
    if (item) {
      setEditingItem(item);
      setForm({
        teacherId: item.teacher?.id || '',
        subjectId: item.subject?.id || '',
        classId: item.schoolClass?.id || '',
        title: item.title || '',
        description: item.description || '',
        dueDate: item.dueDate || '',
        priority: item.priority || 'NORMAL'
      });
    } else {
      setEditingItem(null);
      resetForm();
    }
    setOpenDialog(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.classId) {
      setSnackbar({ open: true, message: 'Title and Class are required', severity: 'error' });
      return;
    }
    try {
      const payload = {
        teacher: form.teacherId ? { id: parseInt(form.teacherId) } : null,
        subject: form.subjectId ? { id: parseInt(form.subjectId) } : null,
        schoolClass: { id: parseInt(form.classId) },
        title: form.title,
        description: form.description,
        dueDate: form.dueDate || null,
        priority: form.priority
      };
      if (editingItem) {
        await homeworkAPI.update(editingItem.id, payload);
        setSnackbar({ open: true, message: 'Homework updated successfully', severity: 'success' });
      } else {
        await homeworkAPI.create(payload);
        setSnackbar({ open: true, message: 'Homework created successfully', severity: 'success' });
      }
      setOpenDialog(false);
      fetchAll();
    } catch (error) {
      setSnackbar({ open: true, message: 'Error saving homework', severity: 'error' });
    }
  };

  const handleDelete = async () => {
    try {
      await homeworkAPI.delete(deletingItem.id);
      setSnackbar({ open: true, message: 'Homework deleted successfully', severity: 'success' });
      setOpenDeleteDialog(false);
      setDeletingItem(null);
      fetchAll();
    } catch (error) {
      setSnackbar({ open: true, message: 'Error deleting homework', severity: 'error' });
    }
  };

  const filtered = homework.filter(hw =>
    hw.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hw.schoolClass?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const priorityColor = (p) => p === 'URGENT' ? 'error' : p === 'IMPORTANT' ? 'warning' : 'success';

  const isDueSoon = (dueDate) => {
    if (!dueDate) return false;
    const diff = (new Date(dueDate) - new Date()) / (1000 * 60 * 60 * 24);
    return diff >= 0 && diff <= 3;
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const stats = [
    { title: 'Total Homework', value: homework.length, gradient: 'linear-gradient(135deg,#667eea,#764ba2)', icon: BookIcon },
    { title: 'Urgent', value: homework.filter(h => h.priority === 'URGENT').length, gradient: 'linear-gradient(135deg,#f5576c,#f093fb)', icon: PriorityIcon },
    { title: 'Due This Week', value: homework.filter(h => isDueSoon(h.dueDate)).length, gradient: 'linear-gradient(135deg,#4facfe,#00f2fe)', icon: ScheduleIcon },
    { title: 'Overdue', value: homework.filter(h => isOverdue(h.dueDate)).length, gradient: 'linear-gradient(135deg,#f7971e,#ffd200)', icon: AssignmentIcon },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a237e' }}>Homework Management</Typography>
          <Typography variant="body2" color="text.secondary">Assign and track homework</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}
          sx={{ bgcolor: '#1a237e', '&:hover': { bgcolor: '#0d1642' }, borderRadius: 2, px: 3 }}>
          Assign Homework
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {stats.map((s) => (
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
        <Box sx={{ p: 2, borderBottom: '1px solid #e0e0e0' }}>
          <TextField
            placeholder="Search homework..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            sx={{ width: 300 }}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment> }}
          />
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Class</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Subject</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Teacher</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Due Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Priority</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                    <Typography color="text.secondary">No homework found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((hw) => (
                  <TableRow key={hw.id} hover>
                    <TableCell>
                      <Typography fontWeight={500}>{hw.title}</Typography>
                      {hw.description && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          {hw.description.substring(0, 50)}{hw.description.length > 50 ? '...' : ''}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{hw.schoolClass?.name || '-'}</TableCell>
                    <TableCell>{hw.subject?.name || '-'}</TableCell>
                    <TableCell>{hw.teacher?.firstName} {hw.teacher?.lastName}</TableCell>
                    <TableCell>
                      <Chip
                        label={hw.dueDate || 'No date'}
                        size="small"
                        color={isOverdue(hw.dueDate) ? 'error' : isDueSoon(hw.dueDate) ? 'warning' : 'default'}
                        variant={isOverdue(hw.dueDate) ? 'filled' : 'outlined'}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip label={hw.priority} color={priorityColor(hw.priority)} size="small" />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => handleOpen(hw)} sx={{ color: '#1565c0' }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" onClick={() => { setDeletingItem(hw); setOpenDeleteDialog(true); }} sx={{ color: '#d32f2f' }}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div" count={filtered.length} page={page}
          onPageChange={(e, p) => setPage(p)} rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#1a237e', color: 'white' }}>
          {editingItem ? 'Edit Homework' : 'Assign Homework'}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField fullWidth label="Title *" value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Class *</InputLabel>
                <Select value={form.classId} onChange={(e) => setForm({ ...form, classId: e.target.value })} label="Class *">
                  {classes.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Subject</InputLabel>
                <Select value={form.subjectId} onChange={(e) => setForm({ ...form, subjectId: e.target.value })} label="Subject">
                  <MenuItem value="">None</MenuItem>
                  {subjects.map((s) => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Teacher</InputLabel>
                <Select value={form.teacherId} onChange={(e) => setForm({ ...form, teacherId: e.target.value })} label="Teacher">
                  <MenuItem value="">None</MenuItem>
                  {teachers.map((t) => <MenuItem key={t.id} value={t.id}>{t.firstName} {t.lastName}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Description" multiline rows={3} value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Due Date" type="date" value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} label="Priority">
                  <MenuItem value="NORMAL">Normal</MenuItem>
                  <MenuItem value="IMPORTANT">Important</MenuItem>
                  <MenuItem value="URGENT">Urgent</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" sx={{ bgcolor: '#1a237e' }}>
            {editingItem ? 'Update' : 'Assign'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Delete homework: <strong>{deletingItem?.title}</strong>?</Typography>
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
