import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, TextField, Grid, Card, CardContent,
  Chip, Tab, Tabs, Dialog, DialogTitle, DialogContent, DialogActions,
  MenuItem, Select, FormControl, InputLabel, Snackbar, Alert, Avatar,
  IconButton, Tooltip
} from '@mui/material';
import {
  CheckCircle as CheckIcon, Cancel as CancelIcon,
  HowToReg as AttendIcon, People as PeopleIcon,
  TrendingUp as TrendingIcon, FileDownload as DownloadIcon
} from '@mui/icons-material';
import { attendanceAPI, studentAPI, academicAPI } from '../services/api';
import * as XLSX from 'xlsx';

function TabPanel({ children, value, index }) {
  return value === index ? <Box sx={{ p: 3 }}>{children}</Box> : null;
}

const statusColors = { PRESENT: 'success', ABSENT: 'error', LATE: 'warning', LEAVE: 'info' };

export default function AttendanceManagement() {
  const [tabValue, setTabValue] = useState(0);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [stats, setStats] = useState({ present: 0, absent: 0, total: 0 });
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [allSections, setAllSections] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [students, setStudents] = useState([]);
  const [openMarkDialog, setOpenMarkDialog] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectLeaveId, setRejectLeaveId] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchTodayStats();
    fetchClasses();
    fetchLeaves();
    fetchAllSections();
  }, []);

  useEffect(() => {
    if (selectedDate) fetchAttendanceByDate();
  }, [selectedDate]);

  useEffect(() => {
    if (selectedClass) {
      fetchSectionsByClass(selectedClass);
      setSelectedSection('');
    } else {
      setSections([]);
    }
  }, [selectedClass]);

  const showSnackbar = (message, severity = 'success') =>
    setSnackbar({ open: true, message, severity });

  const fetchAllSections = async () => {
    try {
      const res = await academicAPI.getSections();
      setAllSections(res.data);
    } catch (e) { console.error(e); }
  };

  const fetchSectionsByClass = async (classId) => {
    try {
      const res = await academicAPI.getSectionsByClass(classId);
      setSections(res.data);
    } catch {
      setSections(allSections.filter(s => s.schoolClass?.id === parseInt(classId)));
    }
  };

  const fetchTodayStats = async () => {
    try {
      const res = await attendanceAPI.getTodayStats();
      setStats(res.data);
    } catch (e) { console.error(e); }
  };

  const fetchClasses = async () => {
    try {
      const res = await academicAPI.getClasses();
      setClasses(res.data);
    } catch (e) { console.error(e); }
  };

  const fetchAttendanceByDate = async () => {
    try {
      const res = await attendanceAPI.getByDate(selectedDate);
      setAttendanceRecords(res.data);
    } catch (e) { console.error(e); }
  };

  const fetchLeaves = async () => {
    try {
      const res = await attendanceAPI.getLeaves();
      setLeaves(res.data);
    } catch (e) { console.error(e); }
  };

  const handleApproveLeave = async (id) => {
    try {
      await attendanceAPI.approveLeave(id);
      showSnackbar('Leave approved successfully');
      fetchLeaves();
    } catch {
      showSnackbar('Error approving leave', 'error');
    }
  };

  const handleOpenRejectDialog = (id) => {
    setRejectLeaveId(id);
    setRejectReason('');
    setRejectDialogOpen(true);
  };

  const handleRejectLeave = async () => {
    if (!rejectReason.trim()) {
      showSnackbar('Please enter a rejection reason', 'error');
      return;
    }
    try {
      await attendanceAPI.rejectLeave(rejectLeaveId, rejectReason);
      showSnackbar('Leave rejected');
      setRejectDialogOpen(false);
      fetchLeaves();
    } catch {
      showSnackbar('Error rejecting leave', 'error');
    }
  };

  const handleOpenMarkDialog = async () => {
    if (!selectedClass || !selectedSection) {
      showSnackbar('Please select class and section', 'error');
      return;
    }
    try {
      const res = await studentAPI.getByClassSection(selectedClass, selectedSection);
      const filtered = res.data && res.data.length > 0
        ? res.data
        : (await studentAPI.getAll()).data.filter(
            s => s.schoolClass?.id === parseInt(selectedClass) && s.section?.id === parseInt(selectedSection)
          );
      if (filtered.length === 0) {
        showSnackbar('No students found for this class/section', 'warning');
        return;
      }
      setStudents(filtered.map(s => ({ ...s, status: 'PRESENT' })));
      setOpenMarkDialog(true);
    } catch {
      showSnackbar('Error loading students', 'error');
    }
  };

  const handleMarkAttendance = async () => {
    try {
      const attendanceData = students.map(s => ({
        student: { id: s.id },
        date: selectedDate,
        status: s.status,
        schoolClass: { id: parseInt(selectedClass) },
        section: { id: parseInt(selectedSection) }
      }));
      await attendanceAPI.mark(attendanceData);
      setOpenMarkDialog(false);
      fetchAttendanceByDate();
      fetchTodayStats();
      showSnackbar(`Attendance marked for ${students.length} students`);
    } catch {
      showSnackbar('Error marking attendance', 'error');
    }
  };

  const handleStudentStatusChange = (studentId, status) =>
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, status } : s));

  const presentCount = students.filter(s => s.status === 'PRESENT').length;
  const absentCount = students.filter(s => s.status === 'ABSENT').length;

  const exportAttendanceToExcel = () => {
    const data = attendanceRecords.map(r => ({
      'Student Name': `${r.student?.firstName || ''} ${r.student?.lastName || ''}`.trim(),
      'Admission No': r.student?.admissionNo || '',
      'Class': r.schoolClass?.name || '',
      'Section': r.section?.name || '',
      'Date': r.date || '',
      'Status': r.status || '',
      'Remarks': r.remarks || '',
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Attendance');
    XLSX.writeFile(wb, `attendance_${selectedDate}_export.xlsx`);
  };

  const exportLeavesToExcel = () => {
    const data = leaves.map(l => ({
      'Student Name': `${l.student?.firstName || ''} ${l.student?.lastName || ''}`.trim(),
      'Class': l.student?.schoolClass?.name || '',
      'From Date': l.fromDate || '',
      'To Date': l.toDate || '',
      'Reason': l.reason || '',
      'Status': l.status || '',
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Leave Applications');
    XLSX.writeFile(wb, `leave_applications_export_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const statCards = [
    { title: 'Present Today', value: stats.present, gradient: 'linear-gradient(135deg,#11998e,#38ef7d)', icon: CheckIcon },
    { title: 'Absent Today', value: stats.absent, gradient: 'linear-gradient(135deg,#f5576c,#f093fb)', icon: CancelIcon },
    { title: 'Total Marked', value: stats.total, gradient: 'linear-gradient(135deg,#4facfe,#00f2fe)', icon: PeopleIcon },
    {
      title: 'Attendance Rate',
      value: stats.total > 0 ? `${Math.round((stats.present / stats.total) * 100)}%` : '0%',
      gradient: 'linear-gradient(135deg,#667eea,#764ba2)',
      icon: TrendingIcon
    },
  ];

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a237e' }}>Attendance Management</Typography>
        <Typography variant="body2" color="text.secondary">Track and manage student attendance</Typography>
      </Box>

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

      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)}
          sx={{ bgcolor: '#f8f9fa', '& .MuiTab-root': { fontWeight: 600, textTransform: 'none' } }}>
          <Tab label="View Attendance" />
          <Tab label="Mark Attendance" />
          <Tab label="Leave Applications" />
        </Tabs>

        {/* View Attendance Tab */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <TextField label="Select Date" type="date" value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)} InputLabelProps={{ shrink: true }} />
            <Button variant="outlined" size="small" startIcon={<DownloadIcon />} onClick={exportAttendanceToExcel}
              disabled={attendanceRecords.length === 0}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, ml: 'auto' }}>
              Export Excel ({attendanceRecords.length})
            </Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Student Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Admission No</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Class</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Section</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {attendanceRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                      <Typography color="text.secondary">No attendance records for {selectedDate}</Typography>
                    </TableCell>
                  </TableRow>
                ) : attendanceRecords.map((record) => (
                  <TableRow key={record.id} hover>
                    <TableCell>{record.student?.firstName} {record.student?.lastName}</TableCell>
                    <TableCell>{record.student?.admissionNo}</TableCell>
                    <TableCell>{record.schoolClass?.name}</TableCell>
                    <TableCell>{record.section?.name}</TableCell>
                    <TableCell>
                      <Chip label={record.status} color={statusColors[record.status] || 'default'} size="small" />
                    </TableCell>
                    <TableCell>{record.date}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* Mark Attendance Tab */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={3}>
              <TextField label="Select Date" type="date" fullWidth value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Class</InputLabel>
                <Select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} label="Class">
                  {classes.map((cls) => <MenuItem key={cls.id} value={cls.id}>{cls.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Section</InputLabel>
                <Select value={selectedSection} onChange={(e) => setSelectedSection(e.target.value)} label="Section"
                  disabled={!selectedClass}>
                  {sections.map((sec) => <MenuItem key={sec.id} value={sec.id}>{sec.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button variant="contained" fullWidth onClick={handleOpenMarkDialog}
                startIcon={<AttendIcon />}
                sx={{ height: '56px', bgcolor: '#1a237e', '&:hover': { bgcolor: '#0d1642' }, borderRadius: 2 }}>
                Load Students
              </Button>
            </Grid>
          </Grid>
          <Box sx={{ p: 3, bgcolor: '#f0f4ff', borderRadius: 2, textAlign: 'center' }}>
            <Typography color="text.secondary">
              Select class and section, then click "Load Students" to mark attendance
            </Typography>
          </Box>
        </TabPanel>

        {/* Leave Applications Tab */}
        <TabPanel value={tabValue} index={2}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button variant="outlined" size="small" startIcon={<DownloadIcon />} onClick={exportLeavesToExcel}
              disabled={leaves.length === 0}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
              Export Excel ({leaves.length})
            </Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Student Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Class</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>From Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>To Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Reason</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {leaves.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                      <Typography color="text.secondary">No leave applications</Typography>
                    </TableCell>
                  </TableRow>
                ) : leaves.map((leave) => (
                  <TableRow key={leave.id} hover>
                    <TableCell>{leave.student?.firstName} {leave.student?.lastName}</TableCell>
                    <TableCell>{leave.student?.schoolClass?.name || '-'}</TableCell>
                    <TableCell>{leave.fromDate}</TableCell>
                    <TableCell>{leave.toDate}</TableCell>
                    <TableCell sx={{ maxWidth: 200 }}>
                      <Typography variant="body2" noWrap>{leave.reason}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={leave.status}
                        color={leave.status === 'APPROVED' ? 'success' : leave.status === 'PENDING' ? 'warning' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      {leave.status === 'PENDING' && (
                        <>
                          <Tooltip title="Approve">
                            <IconButton size="small" onClick={() => handleApproveLeave(leave.id)} sx={{ color: '#4caf50' }}>
                              <CheckIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject">
                            <IconButton size="small" onClick={() => handleOpenRejectDialog(leave.id)} sx={{ color: '#f44336' }}>
                              <CancelIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Paper>

      {/* Mark Attendance Dialog */}
      <Dialog open={openMarkDialog} onClose={() => setOpenMarkDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ bgcolor: '#1a237e', color: 'white' }}>
          Mark Attendance — {selectedDate}
          <Typography variant="caption" sx={{ display: 'block', opacity: 0.85, mt: 0.5 }}>
            Present: {presentCount} | Absent: {absentCount} | Total: {students.length}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ p: 2, bgcolor: '#f0f4ff', display: 'flex', gap: 2 }}>
            <Button size="small" variant="outlined" color="success"
              onClick={() => setStudents(prev => prev.map(s => ({ ...s, status: 'PRESENT' })))}>
              Mark All Present
            </Button>
            <Button size="small" variant="outlined" color="error"
              onClick={() => setStudents(prev => prev.map(s => ({ ...s, status: 'ABSENT' })))}>
              Mark All Absent
            </Button>
          </Box>
          <TableContainer>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Roll No</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Student Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.map((student) => (
                  <TableRow key={student.id} hover
                    sx={{ bgcolor: student.status === 'ABSENT' ? '#fff5f5' : student.status === 'LATE' ? '#fffde7' : 'inherit' }}>
                    <TableCell>{student.rollNo}</TableCell>
                    <TableCell>
                      <Typography fontWeight={500}>{student.firstName} {student.lastName}</Typography>
                    </TableCell>
                    <TableCell>
                      <FormControl size="small" sx={{ minWidth: 120 }}>
                        <Select value={student.status}
                          onChange={(e) => handleStudentStatusChange(student.id, e.target.value)}>
                          <MenuItem value="PRESENT">Present</MenuItem>
                          <MenuItem value="ABSENT">Absent</MenuItem>
                          <MenuItem value="LATE">Late</MenuItem>
                          <MenuItem value="LEAVE">Leave</MenuItem>
                        </Select>
                      </FormControl>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setOpenMarkDialog(false)}>Cancel</Button>
          <Button onClick={handleMarkAttendance} variant="contained"
            sx={{ bgcolor: '#1a237e', '&:hover': { bgcolor: '#0d1642' } }}>
            Save Attendance
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Leave Dialog */}
      <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Reject Leave Application</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth autoFocus multiline rows={3} label="Rejection Reason *"
            value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleRejectLeave} color="error" variant="contained">Reject</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} variant="filled"
          onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
