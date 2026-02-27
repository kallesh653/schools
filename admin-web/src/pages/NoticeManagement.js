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
  Search as SearchIcon, Notifications as NotifIcon,
  PriorityHigh as UrgentIcon, People as PeopleIcon, School as SchoolIcon
} from '@mui/icons-material';
import { noticeAPI } from '../services/api';

export default function NoticeManagement() {
  const [notices, setNotices] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [form, setForm] = useState({
    title: '', content: '', noticeType: 'GENERAL', targetAudience: 'ALL', priority: 'NORMAL'
  });

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const response = await noticeAPI.getAll();
      setNotices(response.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleOpen = (item = null) => {
    if (item) {
      setEditingItem(item);
      setForm({
        title: item.title || '',
        content: item.content || '',
        noticeType: item.noticeType || 'GENERAL',
        targetAudience: item.targetAudience || 'ALL',
        priority: item.priority || 'NORMAL'
      });
    } else {
      setEditingItem(null);
      setForm({ title: '', content: '', noticeType: 'GENERAL', targetAudience: 'ALL', priority: 'NORMAL' });
    }
    setOpenDialog(true);
  };

  const handleSave = async () => {
    if (!form.title) {
      setSnackbar({ open: true, message: 'Title is required', severity: 'error' });
      return;
    }
    try {
      const payload = {
        title: form.title,
        content: form.content || ' ',
        noticeType: form.noticeType,
        targetAudience: form.targetAudience,
        priority: form.priority,
        published: true,
        publishDate: new Date().toISOString().split('T')[0]
      };
      if (editingItem) {
        await noticeAPI.update(editingItem.id, payload);
        setSnackbar({ open: true, message: 'Notice updated successfully', severity: 'success' });
      } else {
        await noticeAPI.create(payload);
        setSnackbar({ open: true, message: 'Notice published successfully', severity: 'success' });
      }
      setOpenDialog(false);
      fetchNotices();
    } catch (error) {
      setSnackbar({ open: true, message: 'Error saving notice', severity: 'error' });
    }
  };

  const handleDelete = async () => {
    try {
      await noticeAPI.delete(deletingItem.id);
      setSnackbar({ open: true, message: 'Notice deleted', severity: 'success' });
      setOpenDeleteDialog(false);
      fetchNotices();
    } catch (error) {
      setSnackbar({ open: true, message: 'Error deleting notice', severity: 'error' });
    }
  };

  const priorityColor = (p) => p === 'URGENT' ? 'error' : p === 'HIGH' ? 'warning' : 'default';
  const typeColor = (t) => t === 'EXAM' ? 'primary' : t === 'FEE' ? 'success' : t === 'EVENT' ? 'secondary' : 'default';

  const filtered = notices.filter(n =>
    n.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.noticeType?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = [
    { title: 'Total Notices', value: notices.length, gradient: 'linear-gradient(135deg,#667eea,#764ba2)', icon: NotifIcon },
    { title: 'Urgent', value: notices.filter(n => n.priority === 'URGENT').length, gradient: 'linear-gradient(135deg,#f5576c,#f093fb)', icon: UrgentIcon },
    { title: 'For Students', value: notices.filter(n => n.targetAudience === 'STUDENTS' || n.targetAudience === 'ALL').length, gradient: 'linear-gradient(135deg,#4facfe,#00f2fe)', icon: PeopleIcon },
    { title: 'For Teachers', value: notices.filter(n => n.targetAudience === 'TEACHERS' || n.targetAudience === 'ALL').length, gradient: 'linear-gradient(135deg,#11998e,#38ef7d)', icon: SchoolIcon },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a237e' }}>Notice Management</Typography>
          <Typography variant="body2" color="text.secondary">Create and manage school notices</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}
          sx={{ bgcolor: '#1a237e', '&:hover': { bgcolor: '#0d1642' }, borderRadius: 2, px: 3 }}>
          Create Notice
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
            placeholder="Search notices..."
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
                <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Audience</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Priority</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell align="center" sx={{ fontWeight: 600 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                    <Typography color="text.secondary">No notices found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((notice) => (
                  <TableRow key={notice.id} hover>
                    <TableCell>
                      <Typography fontWeight={500}>{notice.title}</Typography>
                      {notice.content && (
                        <Typography variant="caption" color="text.secondary">
                          {notice.content.substring(0, 60)}{notice.content.length > 60 ? '...' : ''}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip label={notice.noticeType} color={typeColor(notice.noticeType)} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>
                      <Chip label={notice.targetAudience} size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip label={notice.priority} color={priorityColor(notice.priority)} size="small" />
                    </TableCell>
                    <TableCell>{notice.publishDate || '-'}</TableCell>
                    <TableCell>
                      <Chip label={notice.published ? 'Published' : 'Draft'} color={notice.published ? 'success' : 'default'} size="small" />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => handleOpen(notice)} sx={{ color: '#1565c0' }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" onClick={() => { setDeletingItem(notice); setOpenDeleteDialog(true); }} sx={{ color: '#d32f2f' }}>
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
          {editingItem ? 'Edit Notice' : 'Create Notice'}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField fullWidth label="Title *" value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Content" multiline rows={4} value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })} />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Notice Type</InputLabel>
                <Select value={form.noticeType} onChange={(e) => setForm({ ...form, noticeType: e.target.value })} label="Notice Type">
                  <MenuItem value="GENERAL">General</MenuItem>
                  <MenuItem value="ACADEMIC">Academic</MenuItem>
                  <MenuItem value="EXAM">Exam</MenuItem>
                  <MenuItem value="EVENT">Event</MenuItem>
                  <MenuItem value="HOLIDAY">Holiday</MenuItem>
                  <MenuItem value="FEE">Fee</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Target Audience</InputLabel>
                <Select value={form.targetAudience} onChange={(e) => setForm({ ...form, targetAudience: e.target.value })} label="Target Audience">
                  <MenuItem value="ALL">All</MenuItem>
                  <MenuItem value="STUDENTS">Students</MenuItem>
                  <MenuItem value="PARENTS">Parents</MenuItem>
                  <MenuItem value="TEACHERS">Teachers</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} label="Priority">
                  <MenuItem value="NORMAL">Normal</MenuItem>
                  <MenuItem value="HIGH">High</MenuItem>
                  <MenuItem value="URGENT">Urgent</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" sx={{ bgcolor: '#1a237e' }}>
            {editingItem ? 'Update' : 'Publish'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Delete notice: <strong>{deletingItem?.title}</strong>?</Typography>
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
