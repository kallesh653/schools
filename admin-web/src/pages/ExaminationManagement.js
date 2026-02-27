import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Button, TextField, Grid, Dialog, DialogTitle,
  DialogContent, DialogActions, Tab, Tabs, MenuItem, Select, FormControl,
  InputLabel, Chip, Card, CardContent, IconButton, Snackbar, Alert,
  Avatar, Tooltip, Checkbox, FormControlLabel, CircularProgress, LinearProgress
} from '@mui/material';
import {
  Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,
  Assignment as AssignmentIcon, CheckCircle as CheckIcon,
  Schedule as ScheduleIcon, CalendarToday as CalendarIcon,
  Save as SaveIcon, Refresh as RefreshIcon, Grade as GradeIcon
} from '@mui/icons-material';
import { academicAPI, studentAPI, examinationAPI } from '../services/api';
import api from '../services/api';

function TabPanel({ children, value, index }) {
  return value === index ? <Box sx={{ p: 3 }}>{children}</Box> : null;
}

const GRADE_COLORS = {
  'A+': '#1b5e20', 'A': '#2e7d32', 'B+': '#558b2f', 'B': '#7cb342',
  'C+': '#f9a825', 'C': '#fbc02d', 'D': '#ef6c00', 'F': '#c62828', '': '#9e9e9e'
};

export default function ExaminationManagement() {
  const [tabValue, setTabValue] = useState(0);
  const [examinations, setExaminations] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [openExamDialog, setOpenExamDialog] = useState(false);
  const [openScheduleDialog, setOpenScheduleDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [examForm, setExamForm] = useState({
    name: '', examType: 'UNIT_TEST', academicYearId: '', startDate: '', endDate: '', description: ''
  });
  const [scheduleForm, setScheduleForm] = useState({
    examId: '', subjectId: '', classId: '', examDate: '',
    startTime: '', endTime: '', maxMarks: 100, passMarks: 40
  });

  // Marks Entry state
  const [marksExamId, setMarksExamId] = useState('');
  const [marksClassId, setMarksClassId] = useState('');
  const [marksSectionId, setMarksSectionId] = useState('');
  const [marksStudents, setMarksStudents] = useState([]);
  const [marksSchedules, setMarksSchedules] = useState([]);
  const [marksGrid, setMarksGrid] = useState({});
  const [marksLoading, setMarksLoading] = useState(false);
  const [marksSaving, setMarksSaving] = useState(false);
  const [marksLoaded, setMarksLoaded] = useState(false);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    try {
      const [exams, cls, sub, yrs] = await Promise.all([
        api.get('/examinations'),
        academicAPI.getClasses(),
        academicAPI.getSubjects(),
        academicAPI.getYears()
      ]);
      setExaminations(exams.data);
      setClasses(cls.data);
      setSubjects(sub.data);
      setAcademicYears(yrs.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchSchedules = async () => {
    try {
      const response = await api.get('/examinations/schedules');
      setSchedules(response.data);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    }
  };

  const handleOpenExam = (exam = null) => {
    if (exam) {
      setEditingExam(exam);
      setExamForm({
        name: exam.name || '',
        examType: exam.examType || 'UNIT_TEST',
        academicYearId: exam.academicYear?.id || '',
        startDate: exam.startDate || '',
        endDate: exam.endDate || '',
        description: exam.description || ''
      });
    } else {
      setEditingExam(null);
      setExamForm({ name: '', examType: 'UNIT_TEST', academicYearId: '', startDate: '', endDate: '', description: '' });
    }
    setOpenExamDialog(true);
  };

  const handleSaveExam = async () => {
    if (!examForm.name) {
      setSnackbar({ open: true, message: 'Examination name is required', severity: 'error' });
      return;
    }
    try {
      const payload = {
        name: examForm.name,
        examType: examForm.examType,
        startDate: examForm.startDate,
        endDate: examForm.endDate,
        description: examForm.description,
        published: false,
        academicYear: examForm.academicYearId ? { id: parseInt(examForm.academicYearId) } : null
      };
      if (editingExam) {
        await api.put(`/examinations/${editingExam.id}`, payload);
        setSnackbar({ open: true, message: 'Examination updated', severity: 'success' });
      } else {
        await api.post('/examinations', payload);
        setSnackbar({ open: true, message: 'Examination created', severity: 'success' });
      }
      setOpenExamDialog(false);
      fetchAll();
    } catch (error) {
      setSnackbar({ open: true, message: 'Error saving examination', severity: 'error' });
    }
  };

  const handleDeleteExam = async () => {
    try {
      await api.delete(`/examinations/${deletingItem.id}`);
      setSnackbar({ open: true, message: 'Examination deleted', severity: 'success' });
      setOpenDeleteDialog(false);
      fetchAll();
    } catch (error) {
      setSnackbar({ open: true, message: 'Error deleting examination', severity: 'error' });
    }
  };

  const handlePublishToggle = async (exam) => {
    try {
      await api.put(`/examinations/${exam.id}`, { ...exam, published: !exam.published });
      setSnackbar({ open: true, message: `Examination ${exam.published ? 'unpublished' : 'published'}`, severity: 'success' });
      fetchAll();
    } catch (error) {
      setSnackbar({ open: true, message: 'Error updating status', severity: 'error' });
    }
  };

  const handleSaveSchedule = async () => {
    if (!scheduleForm.examId || !scheduleForm.classId || !scheduleForm.examDate) {
      setSnackbar({ open: true, message: 'Please fill required fields', severity: 'error' });
      return;
    }
    try {
      await api.post('/examinations/schedules', {
        examination: { id: parseInt(scheduleForm.examId) },
        subject: scheduleForm.subjectId ? { id: parseInt(scheduleForm.subjectId) } : null,
        schoolClass: { id: parseInt(scheduleForm.classId) },
        examDate: scheduleForm.examDate,
        startTime: scheduleForm.startTime,
        endTime: scheduleForm.endTime,
        maxMarks: parseInt(scheduleForm.maxMarks),
        passMarks: parseInt(scheduleForm.passMarks)
      });
      setSnackbar({ open: true, message: 'Schedule created', severity: 'success' });
      setOpenScheduleDialog(false);
      setScheduleForm({ examId: '', subjectId: '', classId: '', examDate: '', startTime: '', endTime: '', maxMarks: 100, passMarks: 40 });
      fetchSchedules();
    } catch (error) {
      setSnackbar({ open: true, message: 'Error creating schedule', severity: 'error' });
    }
  };

  // Marks Entry handlers
  const handleMarksClassChange = async (classId) => {
    setMarksClassId(classId);
    setMarksSectionId('');
    setMarksLoaded(false);
    if (classId) {
      try {
        const resp = await academicAPI.getSectionsByClass(classId);
        setSections(resp.data);
      } catch (e) {
        setSections([]);
      }
    } else {
      setSections([]);
    }
  };

  const updateMarksCell = (studentId, subjectId, field, value) => {
    setMarksGrid(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [subjectId]: {
          ...prev[studentId]?.[subjectId],
          [field]: value,
          ...(field === 'absent' && value ? { theory: '', practical: '' } : {})
        }
      }
    }));
  };

  const handleLoadMarks = async () => {
    if (!marksExamId || !marksClassId || !marksSectionId) {
      setSnackbar({ open: true, message: 'Please select examination, class, and section', severity: 'warning' });
      return;
    }
    setMarksLoading(true);
    setMarksLoaded(false);
    try {
      const [studResp, schedResp, existingMarksResp] = await Promise.all([
        studentAPI.getByClassSection(marksClassId, marksSectionId),
        examinationAPI.getSchedules(marksExamId),
        examinationAPI.getMarks(marksExamId),
      ]);

      const students = studResp.data || [];
      const allSchedules = schedResp.data || [];
      const filteredSchedules = allSchedules.filter(
        s => s.schoolClass?.id === parseInt(marksClassId) && s.subject
      );
      const existingMarks = existingMarksResp.data || [];

      const grid = {};
      students.forEach(student => {
        grid[student.id] = {};
        filteredSchedules.forEach(schedule => {
          const subjectId = schedule.subject?.id;
          if (!subjectId) return;
          const existing = existingMarks.find(
            m => m.student?.id === student.id && m.subject?.id === subjectId
          );
          grid[student.id][subjectId] = {
            theory: existing?.theoryMarks ?? '',
            practical: existing?.practicalMarks ?? '',
            absent: existing?.isAbsent ?? false,
            existingId: existing?.id ?? null,
            grade: existing?.grade ?? '',
            totalMarks: existing?.totalMarks ?? null,
          };
        });
      });

      setMarksStudents(students);
      setMarksSchedules(filteredSchedules);
      setMarksGrid(grid);
      setMarksLoaded(true);
    } catch (err) {
      setSnackbar({ open: true, message: 'Error loading students/schedules', severity: 'error' });
    }
    setMarksLoading(false);
  };

  const handleSaveMarks = async () => {
    if (!marksLoaded) return;
    setMarksSaving(true);
    try {
      const toCreate = [];
      const toUpdate = [];

      marksStudents.forEach(student => {
        marksSchedules.forEach(schedule => {
          const subjectId = schedule.subject?.id;
          if (!subjectId) return;
          const cell = marksGrid[student.id]?.[subjectId];
          if (cell === undefined) return;

          const markData = {
            student: { id: student.id },
            examination: { id: parseInt(marksExamId) },
            subject: { id: subjectId },
            theoryMarks: cell.absent ? null : (cell.theory === '' ? null : parseInt(cell.theory)),
            practicalMarks: cell.absent ? null : (cell.practical === '' ? null : parseInt(cell.practical)),
            isAbsent: cell.absent,
          };

          if (cell.existingId) {
            toUpdate.push({ id: cell.existingId, data: markData });
          } else {
            toCreate.push(markData);
          }
        });
      });

      if (toCreate.length > 0) {
        await examinationAPI.createMarksBulk(toCreate);
      }
      for (const item of toUpdate) {
        await examinationAPI.updateMarks(item.id, item.data);
      }

      setSnackbar({ open: true, message: `Saved ${toCreate.length + toUpdate.length} marks successfully!`, severity: 'success' });
      handleLoadMarks(); // Reload to get server-calculated grades
    } catch (err) {
      setSnackbar({ open: true, message: 'Error saving marks: ' + (err.response?.data?.message || err.message), severity: 'error' });
    }
    setMarksSaving(false);
  };

  const stats = [
    { title: 'Total Exams', value: examinations.length, gradient: 'linear-gradient(135deg,#667eea,#764ba2)', icon: AssignmentIcon },
    { title: 'Published', value: examinations.filter(e => e.published).length, gradient: 'linear-gradient(135deg,#11998e,#38ef7d)', icon: CheckIcon },
    { title: 'Upcoming', value: examinations.filter(e => new Date(e.startDate) > new Date()).length, gradient: 'linear-gradient(135deg,#4facfe,#00f2fe)', icon: CalendarIcon },
    { title: 'Schedules', value: schedules.length, gradient: 'linear-gradient(135deg,#f093fb,#f5576c)', icon: ScheduleIcon },
  ];

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a237e' }}>Examination Management</Typography>
          <Typography variant="body2" color="text.secondary">Manage exams, schedules, and marks</Typography>
        </Box>
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

      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Tabs
          value={tabValue}
          onChange={(e, v) => {
            setTabValue(v);
            if (v === 1) fetchSchedules();
          }}
          sx={{ bgcolor: '#f8f9fa', '& .MuiTab-root': { fontWeight: 600, textTransform: 'none' } }}
        >
          <Tab label="Examinations" />
          <Tab label="Schedules" />
          <Tab label="Marks Entry" icon={<GradeIcon fontSize="small" />} iconPosition="start" />
        </Tabs>

        {/* ─── Tab 0: Examinations ─── */}
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenExam()}
              sx={{ bgcolor: '#1a237e', '&:hover': { bgcolor: '#0d1642' }, borderRadius: 2 }}>
              Create Examination
            </Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Start Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>End Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 600 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {examinations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                      <Typography color="text.secondary">No examinations found</Typography>
                    </TableCell>
                  </TableRow>
                ) : examinations.map((exam) => (
                  <TableRow key={exam.id} hover>
                    <TableCell><Typography fontWeight={500}>{exam.name}</Typography></TableCell>
                    <TableCell>
                      <Chip label={exam.examType?.replace('_', ' ')} size="small" variant="outlined" />
                    </TableCell>
                    <TableCell>{exam.startDate || '-'}</TableCell>
                    <TableCell>{exam.endDate || '-'}</TableCell>
                    <TableCell>
                      <Chip
                        label={exam.published ? 'Published' : 'Draft'}
                        color={exam.published ? 'success' : 'default'}
                        size="small"
                        onClick={() => handlePublishToggle(exam)}
                        sx={{ cursor: 'pointer' }}
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => handleOpenExam(exam)} sx={{ color: '#1565c0' }}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" onClick={() => { setDeletingItem(exam); setOpenDeleteDialog(true); }} sx={{ color: '#d32f2f' }}>
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

        {/* ─── Tab 1: Schedules ─── */}
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenScheduleDialog(true)}
              sx={{ bgcolor: '#1a237e', '&:hover': { bgcolor: '#0d1642' }, borderRadius: 2 }}>
              Create Schedule
            </Button>
          </Box>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#f8f9fa' }}>
                  <TableCell sx={{ fontWeight: 600 }}>Examination</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Class</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Subject</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Time</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Max Marks</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Pass Marks</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {schedules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                      <Typography color="text.secondary">No schedules found</Typography>
                    </TableCell>
                  </TableRow>
                ) : schedules.map((s) => (
                  <TableRow key={s.id} hover>
                    <TableCell>{s.examination?.name}</TableCell>
                    <TableCell>{s.schoolClass?.name}</TableCell>
                    <TableCell>{s.subject?.name || '-'}</TableCell>
                    <TableCell>{s.examDate}</TableCell>
                    <TableCell>{s.startTime} - {s.endTime}</TableCell>
                    <TableCell><Chip label={s.maxMarks} size="small" color="primary" /></TableCell>
                    <TableCell><Chip label={s.passMarks} size="small" color="success" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        {/* ─── Tab 2: Marks Entry ─── */}
        <TabPanel value={tabValue} index={2}>
          {/* Selection controls */}
          <Paper variant="outlined" sx={{ p: 2, mb: 3, borderRadius: 2 }}>
            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, color: '#1a237e' }}>
              Select Examination, Class &amp; Section
            </Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Examination *</InputLabel>
                  <Select
                    value={marksExamId}
                    onChange={(e) => { setMarksExamId(e.target.value); setMarksLoaded(false); }}
                    label="Examination *"
                  >
                    <MenuItem value="">Select</MenuItem>
                    {examinations.map(ex => (
                      <MenuItem key={ex.id} value={String(ex.id)}>{ex.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Class *</InputLabel>
                  <Select
                    value={marksClassId}
                    onChange={(e) => handleMarksClassChange(e.target.value)}
                    label="Class *"
                  >
                    <MenuItem value="">Select</MenuItem>
                    {classes.map(c => (
                      <MenuItem key={c.id} value={String(c.id)}>{c.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Section *</InputLabel>
                  <Select
                    value={marksSectionId}
                    onChange={(e) => { setMarksSectionId(e.target.value); setMarksLoaded(false); }}
                    label="Section *"
                    disabled={!marksClassId}
                  >
                    <MenuItem value="">Select</MenuItem>
                    {sections.map(s => (
                      <MenuItem key={s.id} value={String(s.id)}>{s.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={marksLoading ? <CircularProgress size={18} color="inherit" /> : <RefreshIcon />}
                  onClick={handleLoadMarks}
                  disabled={marksLoading || !marksExamId || !marksClassId || !marksSectionId}
                  sx={{ bgcolor: '#1a237e', '&:hover': { bgcolor: '#0d1642' }, height: 40 }}
                >
                  {marksLoading ? 'Loading...' : 'Load Students'}
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Marks Grid */}
          {marksLoaded && (
            <>
              {marksStudents.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 5 }}>
                  <Typography color="text.secondary">No students found for this class/section</Typography>
                </Box>
              ) : marksSchedules.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 5 }}>
                  <Typography color="text.secondary">No exam schedules found for this examination + class.<br />Please create schedules in the Schedules tab first.</Typography>
                </Box>
              ) : (
                <>
                  {/* Summary Bar */}
                  <Box sx={{ mb: 2, p: 2, bgcolor: '#f8f9fa', borderRadius: 2, border: '1px solid #e0e0e0' }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={8}>
                        <Box sx={{ display: 'flex', gap: 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#1a237e' }} />
                            <Typography variant="body2" fontWeight={600}>{marksStudents.length} Students</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#388e3c' }} />
                            <Typography variant="body2" fontWeight={600}>{marksSchedules.length} Subjects</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#d32f2f' }} />
                            <Typography variant="body2" fontWeight={600}>
                              {marksStudents.filter(s => marksSchedules.some(sc => marksGrid[s.id]?.[sc.subject?.id]?.absent)).length} Absent
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={4} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                          variant="contained"
                          startIcon={marksSaving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
                          onClick={handleSaveMarks}
                          disabled={marksSaving}
                          color="success"
                          sx={{ borderRadius: 2 }}
                        >
                          {marksSaving ? 'Saving...' : 'Save All Marks'}
                        </Button>
                      </Grid>
                    </Grid>
                  </Box>

                  <TableContainer sx={{ overflowX: 'auto', maxHeight: 620, borderRadius: 2, border: '1px solid #e0e0e0' }}>
                    <Table stickyHeader size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{
                            fontWeight: 700, bgcolor: '#1a237e', color: 'white',
                            minWidth: 180, position: 'sticky', left: 0, zIndex: 3,
                            borderRight: '2px solid rgba(255,255,255,0.3)'
                          }}>
                            # Student
                          </TableCell>
                          {marksSchedules.map(schedule => (
                            <TableCell key={schedule.id} align="center" sx={{
                              fontWeight: 600, bgcolor: '#283593', color: 'white',
                              minWidth: 160, borderRight: '1px solid rgba(255,255,255,0.2)'
                            }}>
                              <Typography variant="body2" fontWeight={700} sx={{ color: 'white' }}>{schedule.subject?.name}</Typography>
                              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)', display: 'block' }}>
                                Max {schedule.maxMarks} | Pass {schedule.passMarks}
                              </Typography>
                              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)', display: 'block' }}>
                                {schedule.examDate}
                              </Typography>
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {marksStudents.map((student, idx) => {
                          const isAnyAbsent = marksSchedules.some(s => marksGrid[student.id]?.[s.subject?.id]?.absent);
                          return (
                            <TableRow key={student.id} sx={{
                              bgcolor: isAnyAbsent ? '#fff8f8' : (idx % 2 === 0 ? '#fafafa' : 'white'),
                              '&:hover': { bgcolor: isAnyAbsent ? '#ffe8e8' : '#f0f4ff' }
                            }}>
                              <TableCell sx={{
                                position: 'sticky', left: 0, zIndex: 1,
                                bgcolor: isAnyAbsent ? '#fff8f8' : (idx % 2 === 0 ? '#fafafa' : 'white'),
                                borderRight: '2px solid #e0e0e0'
                              }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Avatar sx={{ width: 32, height: 32, bgcolor: '#1a237e', fontSize: 13 }}>
                                    {student.firstName?.[0]}{student.lastName?.[0]}
                                  </Avatar>
                                  <Box>
                                    <Typography variant="body2" fontWeight={600}>
                                      {idx + 1}. {student.firstName} {student.lastName}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">{student.admissionNo}</Typography>
                                    {/* Show saved grades */}
                                    <Box sx={{ display: 'flex', gap: 0.5, mt: 0.3, flexWrap: 'wrap' }}>
                                      {marksSchedules.map(s => {
                                        const grade = marksGrid[student.id]?.[s.subject?.id]?.grade;
                                        const isAbsent = marksGrid[student.id]?.[s.subject?.id]?.absent;
                                        if (!grade && !isAbsent) return null;
                                        return (
                                          <Chip key={s.id}
                                            label={isAbsent ? 'AB' : grade}
                                            size="small"
                                            sx={{
                                              bgcolor: isAbsent ? '#d32f2f' : (GRADE_COLORS[grade] || '#9e9e9e'),
                                              color: 'white', fontSize: 9, height: 16, px: 0.2
                                            }} />
                                        );
                                      })}
                                    </Box>
                                  </Box>
                                </Box>
                              </TableCell>
                              {marksSchedules.map(schedule => {
                                const subjectId = schedule.subject?.id;
                                const cell = marksGrid[student.id]?.[subjectId] || {};
                                const maxMarks = schedule.maxMarks || 100;
                                const pct = cell.totalMarks != null ? Math.min((cell.totalMarks / maxMarks) * 100, 100) : 0;
                                return (
                                  <TableCell key={schedule.id} align="center" sx={{
                                    verticalAlign: 'middle', p: 1,
                                    borderRight: '1px solid #f0f0f0',
                                    bgcolor: cell.absent ? 'rgba(211,47,47,0.05)' : 'inherit'
                                  }}>
                                    {cell.absent ? (
                                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                                        <Chip label="ABSENT" size="small" sx={{ bgcolor: '#d32f2f', color: 'white', fontWeight: 700 }} />
                                        <Checkbox
                                          checked={true}
                                          onChange={(e) => updateMarksCell(student.id, subjectId, 'absent', e.target.checked)}
                                          size="small"
                                          sx={{ color: '#d32f2f', '&.Mui-checked': { color: '#d32f2f' }, p: 0.5 }}
                                        />
                                        <Typography variant="caption" color="error">Unmark</Typography>
                                      </Box>
                                    ) : (
                                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                                          <TextField
                                            size="small"
                                            label="Theory"
                                            type="number"
                                            value={cell.theory ?? ''}
                                            onChange={(e) => updateMarksCell(student.id, subjectId, 'theory', e.target.value)}
                                            inputProps={{ min: 0, max: maxMarks, style: { padding: '4px 6px', textAlign: 'center', width: 48 } }}
                                            sx={{ width: 68 }}
                                          />
                                          <TextField
                                            size="small"
                                            label="Prac."
                                            type="number"
                                            value={cell.practical ?? ''}
                                            onChange={(e) => updateMarksCell(student.id, subjectId, 'practical', e.target.value)}
                                            inputProps={{ min: 0, style: { padding: '4px 6px', textAlign: 'center', width: 48 } }}
                                            sx={{ width: 68 }}
                                          />
                                        </Box>
                                        {cell.totalMarks != null ? (
                                          <Box sx={{ width: '100%', px: 0.5 }}>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
                                              <Typography variant="caption" color="text.secondary">Total: {cell.totalMarks}/{maxMarks}</Typography>
                                              <Chip label={cell.grade || '?'} size="small"
                                                sx={{ bgcolor: GRADE_COLORS[cell.grade] || '#9e9e9e', color: 'white', fontSize: 10, height: 18 }} />
                                            </Box>
                                            <LinearProgress variant="determinate" value={pct}
                                              sx={{ height: 4, borderRadius: 2,
                                                '& .MuiLinearProgress-bar': { bgcolor: GRADE_COLORS[cell.grade] || '#1976d2' } }} />
                                          </Box>
                                        ) : (
                                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <Checkbox
                                              checked={!!cell.absent}
                                              onChange={(e) => updateMarksCell(student.id, subjectId, 'absent', e.target.checked)}
                                              size="small"
                                              sx={{ color: '#d32f2f', '&.Mui-checked': { color: '#d32f2f' }, p: 0.5 }}
                                            />
                                            <Typography variant="caption" color="error">Mark Absent</Typography>
                                          </Box>
                                        )}
                                      </Box>
                                    )}
                                  </TableCell>
                                );
                              })}
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <Button
                      variant="contained"
                      startIcon={marksSaving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
                      onClick={handleSaveMarks}
                      disabled={marksSaving}
                      color="success"
                      size="large"
                      sx={{ borderRadius: 2, px: 4 }}
                    >
                      {marksSaving ? 'Saving...' : 'Save All Marks'}
                    </Button>
                  </Box>
                </>
              )}
            </>
          )}

          {!marksLoaded && !marksLoading && (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <GradeIcon sx={{ fontSize: 64, color: '#e0e0e0', mb: 2 }} />
              <Typography color="text.secondary" variant="h6">
                Select an examination, class, and section, then click "Load Students"
              </Typography>
            </Box>
          )}
        </TabPanel>
      </Paper>

      {/* Create/Edit Exam Dialog */}
      <Dialog open={openExamDialog} onClose={() => setOpenExamDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#1a237e', color: 'white' }}>
          {editingExam ? 'Edit Examination' : 'Create Examination'}
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField fullWidth label="Examination Name *" value={examForm.name}
                onChange={(e) => setExamForm({ ...examForm, name: e.target.value })} />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Exam Type</InputLabel>
                <Select value={examForm.examType} onChange={(e) => setExamForm({ ...examForm, examType: e.target.value })} label="Exam Type">
                  <MenuItem value="UNIT_TEST">Unit Test</MenuItem>
                  <MenuItem value="MIDTERM">Midterm</MenuItem>
                  <MenuItem value="FINAL">Final</MenuItem>
                  <MenuItem value="HALF_YEARLY">Half Yearly</MenuItem>
                  <MenuItem value="ANNUAL">Annual</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Academic Year</InputLabel>
                <Select value={examForm.academicYearId} onChange={(e) => setExamForm({ ...examForm, academicYearId: e.target.value })} label="Academic Year">
                  <MenuItem value="">None</MenuItem>
                  {academicYears.map((y) => <MenuItem key={y.id} value={y.id}>{y.name}{y.isActive ? ' (Active)' : ''}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Start Date" type="date" value={examForm.startDate}
                onChange={(e) => setExamForm({ ...examForm, startDate: e.target.value })} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="End Date" type="date" value={examForm.endDate}
                onChange={(e) => setExamForm({ ...examForm, endDate: e.target.value })} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Description" multiline rows={2} value={examForm.description}
                onChange={(e) => setExamForm({ ...examForm, description: e.target.value })} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenExamDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveExam} variant="contained" sx={{ bgcolor: '#1a237e' }}>
            {editingExam ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Create Schedule Dialog */}
      <Dialog open={openScheduleDialog} onClose={() => setOpenScheduleDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: '#1a237e', color: 'white' }}>Create Exam Schedule</DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Examination *</InputLabel>
                <Select value={scheduleForm.examId} onChange={(e) => setScheduleForm({ ...scheduleForm, examId: e.target.value })} label="Examination *">
                  {examinations.map((e) => <MenuItem key={e.id} value={e.id}>{e.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Class *</InputLabel>
                <Select value={scheduleForm.classId} onChange={(e) => setScheduleForm({ ...scheduleForm, classId: e.target.value })} label="Class *">
                  {classes.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Subject</InputLabel>
                <Select value={scheduleForm.subjectId} onChange={(e) => setScheduleForm({ ...scheduleForm, subjectId: e.target.value })} label="Subject">
                  <MenuItem value="">None</MenuItem>
                  {subjects.map((s) => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Exam Date *" type="date" value={scheduleForm.examDate}
                onChange={(e) => setScheduleForm({ ...scheduleForm, examDate: e.target.value })} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Start Time" type="time" value={scheduleForm.startTime}
                onChange={(e) => setScheduleForm({ ...scheduleForm, startTime: e.target.value })} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="End Time" type="time" value={scheduleForm.endTime}
                onChange={(e) => setScheduleForm({ ...scheduleForm, endTime: e.target.value })} InputLabelProps={{ shrink: true }} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Max Marks" type="number" value={scheduleForm.maxMarks}
                onChange={(e) => setScheduleForm({ ...scheduleForm, maxMarks: e.target.value })} />
            </Grid>
            <Grid item xs={6}>
              <TextField fullWidth label="Pass Marks" type="number" value={scheduleForm.passMarks}
                onChange={(e) => setScheduleForm({ ...scheduleForm, passMarks: e.target.value })} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setOpenScheduleDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveSchedule} variant="contained" sx={{ bgcolor: '#1a237e' }}>Create</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>Delete examination: <strong>{deletingItem?.name}</strong>?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDeleteExam} color="error" variant="contained">Delete</Button>
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
