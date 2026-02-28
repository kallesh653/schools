import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Tabs, Tab, Grid, Button, TextField,
  FormControl, InputLabel, Select, MenuItem, Chip, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, Alert, CircularProgress,
  LinearProgress, Tooltip,
} from '@mui/material';
import {
  Send as SendIcon, CheckCircle as CheckIcon, Refresh as RefreshIcon,
  Info as InfoIcon, Preview as PreviewIcon,
} from '@mui/icons-material';
import { smsAPI, academicAPI, noticeAPI } from '../services/api';

function TabPanel({ children, value, index }) {
  return value === index ? <Box>{children}</Box> : null;
}

export default function CommunicationManagement() {
  const [tab, setTab] = useState(0);
  const [classes, setClasses] = useState([]);
  // Separate sections state for each tab to avoid cross-contamination
  const [composeSections, setComposeSections] = useState([]);
  const [attSections, setAttSections] = useState([]);
  const [notices, setNotices] = useState([]);
  const [smsStatus, setSmsStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);

  // Compose tab state
  const [composeMsg, setComposeMsg] = useState('');
  const [composeTarget, setComposeTarget] = useState('ALL');
  const [composeClassId, setComposeClassId] = useState('');
  const [composeSectionId, setComposeSectionId] = useState('');
  const [composeNumbers, setComposeNumbers] = useState('');

  // Attendance tab state
  const [attDate, setAttDate] = useState(new Date().toISOString().split('T')[0]);
  const [attClassId, setAttClassId] = useState('');
  const [attSectionId, setAttSectionId] = useState('');
  const [absentStudents, setAbsentStudents] = useState([]);
  const [attMsg, setAttMsg] = useState('');
  const [attPreviewDone, setAttPreviewDone] = useState(false);

  // Notice tab state
  const [selectedNotice, setSelectedNotice] = useState('');
  const [noticeMsg, setNoticeMsg] = useState('');

  // Fee tab state
  const [feeClassId, setFeeClassId] = useState('');
  const [feePendingStudents, setFeePendingStudents] = useState([]);
  const [feeMsg, setFeeMsg] = useState('');
  const [feePreviewDone, setFeePreviewDone] = useState(false);

  useEffect(() => { loadInitialData(); }, []);
  useEffect(() => { if (tab === 4) loadLogs(); }, [tab]);

  // Separate section loaders — each writes to its own state variable
  useEffect(() => { loadComposeSections(composeClassId); }, [composeClassId]);
  useEffect(() => { loadAttSections(attClassId); }, [attClassId]);

  useEffect(() => {
    if (!selectedNotice) return;
    const n = notices.find(x => x.id === Number(selectedNotice));
    if (n) {
      const content = n.content && n.content.length > 100 ? n.content.substring(0, 97) + '...' : n.content;
      setNoticeMsg(`Dear Parent, Notice: ${n.title}. ${content || ''} - ${smsStatus?.schoolName || 'School'}`);
    }
  }, [selectedNotice, notices, smsStatus]);

  const loadInitialData = async () => {
    try {
      const [classRes, noticeRes, statusRes] = await Promise.all([
        academicAPI.getClasses(),
        noticeAPI.getAll().catch(() => ({ data: [] })),
        smsAPI.getStatus().catch(() => ({ data: { configured: false } })),
      ]);
      setClasses(classRes.data || []);
      setNotices(noticeRes.data || []);
      setSmsStatus(statusRes.data);
    } catch (e) { console.error('loadInitialData error:', e); }
  };

  const loadComposeSections = async (classId) => {
    if (!classId) { setComposeSections([]); return; }
    try {
      const res = await academicAPI.getSectionsByClass(classId);
      setComposeSections(res.data || []);
    } catch (e) { setComposeSections([]); }
  };

  const loadAttSections = async (classId) => {
    if (!classId) { setAttSections([]); return; }
    try {
      const res = await academicAPI.getSectionsByClass(classId);
      setAttSections(res.data || []);
    } catch (e) { setAttSections([]); }
  };

  const loadLogs = async () => {
    setLogsLoading(true);
    try {
      const res = await smsAPI.getLogs();
      setLogs(res.data || []);
    } catch (e) { setLogs([]); }
    setLogsLoading(false);
  };

  const showResult = (data) => {
    setResult(data);
    setTimeout(() => setResult(null), 7000);
  };

  const handleComposeSend = async () => {
    if (!composeMsg.trim()) return;
    setLoading(true);
    try {
      let res;
      if (composeTarget === 'CUSTOM') {
        const numbers = composeNumbers.split(/[\n,;]/).map(n => n.trim()).filter(Boolean);
        if (numbers.length === 0) { showResult({ success: false, error: 'Enter at least one phone number' }); setLoading(false); return; }
        res = await smsAPI.sendCustom({ numbers, message: composeMsg });
      } else {
        res = await smsAPI.sendToClass({
          classId: composeTarget === 'CLASS' ? (composeClassId || null) : null,
          sectionId: composeTarget === 'CLASS' ? (composeSectionId || null) : null,
          message: composeMsg,
        });
      }
      showResult(res.data);
    } catch (e) { showResult({ success: false, error: e.response?.data?.message || e.message }); }
    setLoading(false);
  };

  const handleAttPreview = async () => {
    setLoading(true);
    setAttPreviewDone(false);
    setAbsentStudents([]);
    try {
      const params = { date: attDate };
      if (attClassId) params.classId = attClassId;
      if (attSectionId) params.sectionId = attSectionId;
      const res = await smsAPI.previewAbsent(params);
      const data = res.data || [];
      setAbsentStudents(data);
      setAttPreviewDone(true);
      if (!attMsg) {
        setAttMsg(`Dear Parent, [Student Name] was marked ABSENT on ${attDate}. Please ensure regular attendance. - ${smsStatus?.schoolName || 'School'}`);
      }
    } catch (e) {
      console.error('previewAbsent error:', e);
      setAbsentStudents([]);
      setAttPreviewDone(true);
    }
    setLoading(false);
  };

  const handleAttSend = async () => {
    setLoading(true);
    try {
      const res = await smsAPI.sendAbsentAlert({
        date: attDate,
        classId: attClassId || null,
        sectionId: attSectionId || null,
        message: attMsg.includes('[Student Name]') ? '' : attMsg,
      });
      showResult(res.data);
    } catch (e) { showResult({ success: false, error: e.response?.data?.message || e.message }); }
    setLoading(false);
  };

  const handleNoticeSend = async () => {
    if (!selectedNotice) return;
    setLoading(true);
    try {
      const res = await smsAPI.sendNoticeAlert(selectedNotice, { message: noticeMsg });
      showResult(res.data);
    } catch (e) { showResult({ success: false, error: e.response?.data?.message || e.message }); }
    setLoading(false);
  };

  const handleFeePreview = async () => {
    setLoading(true);
    setFeePreviewDone(false);
    setFeePendingStudents([]);
    try {
      const params = {};
      if (feeClassId) params.classId = feeClassId;
      const res = await smsAPI.previewFeePending(params);
      setFeePendingStudents(res.data || []);
      setFeePreviewDone(true);
      if (!feeMsg) {
        setFeeMsg(`Dear Parent, Fee of Rs.[Amount] is pending for [Student Name]. Please pay at the earliest to avoid late fees. - ${smsStatus?.schoolName || 'School'}`);
      }
    } catch (e) {
      console.error('previewFeePending error:', e);
      setFeePendingStudents([]);
      setFeePreviewDone(true);
    }
    setLoading(false);
  };

  const handleFeeSend = async () => {
    setLoading(true);
    try {
      const res = await smsAPI.sendFeeReminder({
        classId: feeClassId || null,
        message: feeMsg.includes('[Amount]') ? '' : feeMsg,
      });
      showResult(res.data);
    } catch (e) { showResult({ success: false, error: e.response?.data?.message || e.message }); }
    setLoading(false);
  };

  const phoneCount = (arr) => arr.filter(s => s.hasPhone).length;

  const TYPE_COLORS = {
    ATTENDANCE_ALERT: { bg: '#e3f2fd', color: '#1565c0', label: 'Attendance' },
    NOTICE_ALERT: { bg: '#f3e5f5', color: '#6a1b9a', label: 'Notice' },
    FEE_REMINDER: { bg: '#fff3e0', color: '#e65100', label: 'Fee' },
    CUSTOM: { bg: '#e8f5e9', color: '#2e7d32', label: 'Custom' },
  };

  const templates = [
    { label: 'Absent Alert', text: `Dear Parent, [Student Name] was absent today. Please ensure regular attendance. - ${smsStatus?.schoolName || 'School'}` },
    { label: 'Holiday Notice', text: `Dear Parent, School will remain closed on [Date] due to [Reason]. - ${smsStatus?.schoolName || 'School'}` },
    { label: 'PTM Notice', text: `Dear Parent, Parent-Teacher Meeting is scheduled on [Date] at [Time]. Your presence is requested. - ${smsStatus?.schoolName || 'School'}` },
    { label: 'Fee Reminder', text: `Dear Parent, Please clear the pending school fees for [Student Name] at the earliest. - ${smsStatus?.schoolName || 'School'}` },
    { label: 'Exam Alert', text: `Dear Parent, Exams are starting from [Date]. Please ensure your child is well prepared. - ${smsStatus?.schoolName || 'School'}` },
  ];

  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a237e' }}>Communication Center</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Send SMS messages to parents — individual, class-wise, or all
          </Typography>
        </Box>
        <Box>
          {smsStatus?.configured
            ? <Chip label="SMS Active" icon={<CheckIcon />} color="success" variant="outlined" sx={{ fontWeight: 600 }} />
            : <Chip label="Demo Mode" icon={<InfoIcon />} color="warning" variant="outlined" sx={{ fontWeight: 600 }} />
          }
        </Box>
      </Box>

      {/* Demo mode warning */}
      {smsStatus && !smsStatus.configured && (
        <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
          <strong>SMS API not configured — running in Demo Mode.</strong>{' '}
          Messages are logged but not actually sent. To enable live SMS: get a free key from{' '}
          <strong>Fast2SMS.com</strong> and set <code>sms.fast2sms.apikey=YOUR_KEY</code> in{' '}
          <code>application.properties</code>, then rebuild the backend.
        </Alert>
      )}

      {/* Result Alert */}
      {result && (
        <Alert
          severity={result.success ? 'success' : 'error'}
          sx={{ mb: 2, borderRadius: 2 }}
          onClose={() => setResult(null)}
        >
          {result.success
            ? `SMS sent to ${result.sentCount} recipient(s)!${result.demoMode ? ' (Demo mode — not actually sent)' : ''}`
            : `Error: ${result.error || 'Failed to send SMS'}`}
        </Alert>
      )}

      <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
        {loading && <LinearProgress />}

        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            bgcolor: '#f8f9fa',
            borderBottom: '2px solid #e0e0e0',
            '& .MuiTab-root': { fontWeight: 600, textTransform: 'none', minHeight: 52, fontSize: '0.9rem' },
            '& .Mui-selected': { color: '#1565c0' },
            '& .MuiTabs-indicator': { bgcolor: '#1565c0', height: 3 },
          }}
        >
          <Tab label="Compose Message" />
          <Tab label="Attendance Alerts" />
          <Tab label="Notice Alerts" />
          <Tab label="Fee Reminders" />
          <Tab label="SMS Logs" />
        </Tabs>

        <Box sx={{ p: 3 }}>

          {/* ===== TAB 0: COMPOSE ===== */}
          <TabPanel value={tab} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={7}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2, color: '#1a237e' }}>
                  Compose & Send SMS
                </Typography>

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Send To</InputLabel>
                  <Select
                    value={composeTarget}
                    onChange={e => { setComposeTarget(e.target.value); setComposeClassId(''); setComposeSectionId(''); }}
                    label="Send To"
                  >
                    <MenuItem value="ALL">All Parents (Everyone)</MenuItem>
                    <MenuItem value="CLASS">By Class / Section</MenuItem>
                    <MenuItem value="CUSTOM">Custom Phone Numbers</MenuItem>
                  </Select>
                </FormControl>

                {composeTarget === 'CLASS' && (
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <FormControl fullWidth>
                        <InputLabel>Class</InputLabel>
                        <Select
                          value={composeClassId}
                          onChange={e => { setComposeClassId(e.target.value); setComposeSectionId(''); }}
                          label="Class"
                        >
                          <MenuItem value="">All Classes</MenuItem>
                          {classes.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                      <FormControl fullWidth disabled={!composeClassId}>
                        <InputLabel>Section (Optional)</InputLabel>
                        <Select
                          value={composeSectionId}
                          onChange={e => setComposeSectionId(e.target.value)}
                          label="Section (Optional)"
                        >
                          <MenuItem value="">All Sections</MenuItem>
                          {composeSections.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                )}

                {composeTarget === 'CUSTOM' && (
                  <TextField
                    fullWidth multiline rows={3}
                    label="Phone Numbers (one per line, or comma/semicolon separated)"
                    value={composeNumbers}
                    onChange={e => setComposeNumbers(e.target.value)}
                    placeholder={'9999999999\n8888888888\n7777777777'}
                    sx={{ mb: 2 }}
                  />
                )}

                <TextField
                  fullWidth multiline rows={5} label="Message"
                  value={composeMsg} onChange={e => setComposeMsg(e.target.value)}
                  placeholder="Type your message here..."
                  inputProps={{ maxLength: 500 }}
                  helperText={`${composeMsg.length}/500 characters · ~${Math.ceil((composeMsg.length || 1) / 160)} SMS part(s)`}
                  sx={{ mb: 2 }}
                />

                <Button
                  variant="contained" size="large" startIcon={<SendIcon />}
                  onClick={handleComposeSend}
                  disabled={loading || !composeMsg.trim()}
                  sx={{ bgcolor: '#1565c0', '&:hover': { bgcolor: '#0d47a1' }, px: 4, borderRadius: 2 }}
                >
                  Send SMS
                </Button>
              </Grid>

              <Grid item xs={12} md={5}>
                <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ mb: 1.5, textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.5 }}>
                  Quick Templates — Click to Apply
                </Typography>
                {templates.map(t => (
                  <Box
                    key={t.label}
                    onClick={() => setComposeMsg(t.text)}
                    sx={{
                      mb: 1, p: 1.5, bgcolor: '#f8f9fa', borderRadius: 2,
                      border: '1px solid #e0e0e0', cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': { borderColor: '#1565c0', bgcolor: '#e8f0fe', transform: 'translateX(2px)' },
                    }}
                  >
                    <Typography fontSize={12} fontWeight={700} color="primary.main">{t.label}</Typography>
                    <Typography fontSize={11} color="text.secondary" sx={{ mt: 0.3, lineHeight: 1.4 }}>
                      {t.text.substring(0, 70)}...
                    </Typography>
                  </Box>
                ))}
              </Grid>
            </Grid>
          </TabPanel>

          {/* ===== TAB 1: ATTENDANCE ALERTS ===== */}
          <TabPanel value={tab} index={1}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5, color: '#1a237e' }}>
              Attendance Absence Alerts
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Find absent students for a date and send personalized SMS alerts to their parents.
            </Typography>

            <Grid container spacing={2} sx={{ mb: 2, alignItems: 'center' }}>
              <Grid item xs={12} sm={3}>
                <TextField
                  fullWidth type="date" label="Date" value={attDate}
                  onChange={e => { setAttDate(e.target.value); setAttPreviewDone(false); setAbsentStudents([]); }}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth>
                  <InputLabel>Class (Optional)</InputLabel>
                  <Select
                    value={attClassId}
                    onChange={e => { setAttClassId(e.target.value); setAttSectionId(''); setAttPreviewDone(false); setAbsentStudents([]); }}
                    label="Class (Optional)"
                  >
                    <MenuItem value="">All Classes</MenuItem>
                    {classes.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth disabled={!attClassId}>
                  <InputLabel>Section (Optional)</InputLabel>
                  <Select
                    value={attSectionId}
                    onChange={e => { setAttSectionId(e.target.value); setAttPreviewDone(false); setAbsentStudents([]); }}
                    label="Section (Optional)"
                  >
                    <MenuItem value="">All Sections</MenuItem>
                    {attSections.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Button
                  variant="outlined" startIcon={<PreviewIcon />}
                  onClick={handleAttPreview} disabled={loading}
                  fullWidth sx={{ height: 56, borderRadius: 2 }}
                >
                  Find Absent Students
                </Button>
              </Grid>
            </Grid>

            {attPreviewDone && (
              <>
                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  <Chip label={`${absentStudents.length} Absent`} sx={{ bgcolor: '#ffebee', color: '#c62828', fontWeight: 700 }} />
                  <Chip label={`${phoneCount(absentStudents)} With Phone`} sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 700 }} />
                  <Chip label={`${absentStudents.length - phoneCount(absentStudents)} No Phone`} sx={{ bgcolor: '#f5f5f5', color: '#666', fontWeight: 600 }} />
                </Box>

                {absentStudents.length > 0 ? (
                  <>
                    <TableContainer component={Paper} sx={{ mb: 2, maxHeight: 260, borderRadius: 2, border: '1px solid #e0e0e0' }}>
                      <Table size="small" stickyHeader>
                        <TableHead>
                          <TableRow>
                            {['Student Name', 'Class', 'Parent', 'Phone', 'SMS Status'].map(h => (
                              <TableCell key={h} sx={{ fontWeight: 700, bgcolor: '#1565c0 !important', color: '#fff !important', whiteSpace: 'nowrap' }}>{h}</TableCell>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {absentStudents.map((s, i) => (
                            <TableRow key={i} sx={{ '&:nth-of-type(odd)': { bgcolor: '#fafafa' } }}>
                              <TableCell sx={{ fontWeight: 500 }}>{s.studentName}</TableCell>
                              <TableCell>{s.class} {s.section}</TableCell>
                              <TableCell>{s.parentName}</TableCell>
                              <TableCell sx={{ fontFamily: 'monospace' }}>{s.phone}</TableCell>
                              <TableCell>
                                <Chip
                                  size="small"
                                  label={s.hasPhone ? 'Ready' : 'No Phone'}
                                  sx={{
                                    fontWeight: 700, fontSize: 10,
                                    bgcolor: s.hasPhone ? '#e8f5e9' : '#ffebee',
                                    color: s.hasPhone ? '#2e7d32' : '#c62828',
                                  }}
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>

                    <TextField
                      fullWidth multiline rows={3}
                      label="SMS Message — use [Student Name] for personalized messages"
                      value={attMsg} onChange={e => setAttMsg(e.target.value)}
                      sx={{ mb: 2 }}
                      helperText="[Student Name] will be automatically replaced with each student's actual name"
                    />

                    <Button
                      variant="contained" startIcon={<SendIcon />}
                      onClick={handleAttSend}
                      disabled={loading || phoneCount(absentStudents) === 0}
                      sx={{ bgcolor: '#c62828', '&:hover': { bgcolor: '#b71c1c' }, px: 4, borderRadius: 2 }}
                    >
                      Send Absent Alert to {phoneCount(absentStudents)} Parent(s)
                    </Button>
                  </>
                ) : (
                  <Alert severity="info" sx={{ borderRadius: 2 }}>
                    No absent students found for the selected date and filters. Make sure attendance has been marked for this date.
                  </Alert>
                )}
              </>
            )}
          </TabPanel>

          {/* ===== TAB 2: NOTICE ALERTS ===== */}
          <TabPanel value={tab} index={2}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5, color: '#1a237e' }}>
              Notice Notifications
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Select a notice and send an SMS notification to all parents.
            </Typography>

            <FormControl fullWidth sx={{ mb: 2, maxWidth: 550 }}>
              <InputLabel>Select Notice</InputLabel>
              <Select
                value={selectedNotice}
                onChange={e => setSelectedNotice(e.target.value)}
                label="Select Notice"
              >
                <MenuItem value="">-- Select a Notice --</MenuItem>
                {notices.length === 0 && (
                  <MenuItem disabled value="">No notices found</MenuItem>
                )}
                {notices.map(n => (
                  <MenuItem key={n.id} value={n.id}>
                    <Box>
                      <Typography fontSize={13} fontWeight={600}>{n.title}</Typography>
                      <Typography fontSize={11} color="text.secondary">{n.type} · {n.publishDate || 'Draft'}</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {selectedNotice && (() => {
              const n = notices.find(x => x.id === Number(selectedNotice));
              return n ? (
                <>
                  <Card sx={{ mb: 2, bgcolor: '#f5f7fa', border: '1px solid #dde3f0', borderRadius: 2, maxWidth: 600 }}>
                    <CardContent sx={{ pb: '12px !important' }}>
                      <Typography fontWeight={700} fontSize={14}>{n.title}</Typography>
                      <Typography fontSize={12} color="text.secondary" sx={{ mt: 0.5, lineHeight: 1.5 }}>{n.content}</Typography>
                      <Box sx={{ mt: 1.5, display: 'flex', gap: 1 }}>
                        <Chip label={n.type || 'INFO'} size="small" color="primary" sx={{ fontWeight: 600 }} />
                        <Chip label={n.targetAudience || 'ALL'} size="small" variant="outlined" />
                      </Box>
                    </CardContent>
                  </Card>

                  <TextField
                    fullWidth multiline rows={4} label="SMS Message"
                    value={noticeMsg} onChange={e => setNoticeMsg(e.target.value)}
                    sx={{ mb: 2, maxWidth: 600 }}
                    inputProps={{ maxLength: 500 }}
                    helperText={`${noticeMsg.length}/500 characters`}
                  />

                  <Button
                    variant="contained" startIcon={<SendIcon />}
                    onClick={handleNoticeSend} disabled={loading}
                    sx={{ bgcolor: '#6a1b9a', '&:hover': { bgcolor: '#4a148c' }, px: 4, borderRadius: 2 }}
                  >
                    Send to All Parents
                  </Button>
                </>
              ) : null;
            })()}
          </TabPanel>

          {/* ===== TAB 3: FEE REMINDERS ===== */}
          <TabPanel value={tab} index={3}>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5, color: '#1a237e' }}>
              Fee Payment Reminders
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Find students with pending fees and send personalized reminders to their parents.
            </Typography>

            <Grid container spacing={2} sx={{ mb: 2, alignItems: 'center' }}>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Class (or All)</InputLabel>
                  <Select
                    value={feeClassId}
                    onChange={e => { setFeeClassId(e.target.value); setFeePreviewDone(false); setFeePendingStudents([]); }}
                    label="Class (or All)"
                  >
                    <MenuItem value="">All Classes</MenuItem>
                    {classes.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Button
                  variant="outlined" startIcon={<PreviewIcon />}
                  onClick={handleFeePreview} disabled={loading}
                  fullWidth sx={{ height: 56, borderRadius: 2 }}
                >
                  Find Pending Students
                </Button>
              </Grid>
            </Grid>

            {feePreviewDone && (
              <>
                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  <Chip label={`${feePendingStudents.length} Pending`} sx={{ bgcolor: '#fff3e0', color: '#e65100', fontWeight: 700 }} />
                  <Chip label={`${phoneCount(feePendingStudents)} With Phone`} sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 700 }} />
                  <Chip
                    label={`₹${feePendingStudents.reduce((s, x) => s + (x.pendingAmount || 0), 0).toLocaleString()} Total Pending`}
                    sx={{ bgcolor: '#ffebee', color: '#c62828', fontWeight: 700 }}
                  />
                </Box>

                {feePendingStudents.length > 0 ? (
                  <>
                    <TableContainer component={Paper} sx={{ mb: 2, maxHeight: 260, borderRadius: 2, border: '1px solid #e0e0e0' }}>
                      <Table size="small" stickyHeader>
                        <TableHead>
                          <TableRow>
                            {['Student Name', 'Class', 'Parent', 'Phone', 'Pending Amount'].map(h => (
                              <TableCell key={h} sx={{ fontWeight: 700, bgcolor: '#1565c0 !important', color: '#fff !important', whiteSpace: 'nowrap' }}>{h}</TableCell>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {feePendingStudents.map((s, i) => (
                            <TableRow key={i} sx={{ '&:nth-of-type(odd)': { bgcolor: '#fafafa' } }}>
                              <TableCell sx={{ fontWeight: 500 }}>{s.studentName}</TableCell>
                              <TableCell>{s.class} {s.section}</TableCell>
                              <TableCell>{s.parentName}</TableCell>
                              <TableCell sx={{ fontFamily: 'monospace' }}>{s.phone}</TableCell>
                              <TableCell>
                                <Chip
                                  label={`₹${(s.pendingAmount || 0).toLocaleString()}`}
                                  size="small"
                                  sx={{ bgcolor: '#ffebee', color: '#c62828', fontWeight: 700 }}
                                />
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>

                    <TextField
                      fullWidth multiline rows={3}
                      label="SMS Message — use [Amount] and [Student Name] for personalized messages"
                      value={feeMsg} onChange={e => setFeeMsg(e.target.value)}
                      sx={{ mb: 2 }}
                      helperText="[Amount] and [Student Name] will be replaced with actual values for each student"
                    />

                    <Button
                      variant="contained" startIcon={<SendIcon />}
                      onClick={handleFeeSend}
                      disabled={loading || phoneCount(feePendingStudents) === 0}
                      sx={{ bgcolor: '#e65100', '&:hover': { bgcolor: '#bf360c' }, px: 4, borderRadius: 2 }}
                    >
                      Send Reminder to {phoneCount(feePendingStudents)} Parent(s)
                    </Button>
                  </>
                ) : (
                  <Alert severity="success" sx={{ borderRadius: 2 }}>
                    No pending fee students found{feeClassId ? ' for the selected class' : ''}. Either all fees are paid or no fee structure is configured yet.
                  </Alert>
                )}
              </>
            )}
          </TabPanel>

          {/* ===== TAB 4: SMS LOGS ===== */}
          <TabPanel value={tab} index={4}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" fontWeight={700} color="#1a237e">SMS History</Typography>
              <Button
                startIcon={<RefreshIcon />} onClick={loadLogs}
                disabled={logsLoading} variant="outlined" size="small" sx={{ borderRadius: 2 }}
              >
                Refresh
              </Button>
            </Box>

            {logsLoading ? (
              <Box sx={{ py: 5, display: 'flex', justifyContent: 'center' }}><CircularProgress /></Box>
            ) : logs.length === 0 ? (
              <Alert severity="info" sx={{ borderRadius: 2 }}>No SMS messages have been sent yet.</Alert>
            ) : (
              <>
                <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                  <Chip label={`Total: ${logs.length}`} sx={{ fontWeight: 600 }} />
                  <Chip label={`Sent: ${logs.filter(l => l.status === 'SENT').length}`} sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 600 }} />
                  <Chip label={`Failed: ${logs.filter(l => l.status === 'FAILED').length}`} sx={{ bgcolor: '#ffebee', color: '#c62828', fontWeight: 600 }} />
                </Box>
                <TableContainer component={Paper} sx={{ borderRadius: 2, maxHeight: 500, border: '1px solid #e0e0e0' }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        {['Date & Time', 'Recipient', 'Phone', 'Type', 'Message', 'Status'].map(h => (
                          <TableCell key={h} sx={{ fontWeight: 700, bgcolor: '#1565c0 !important', color: '#fff !important', whiteSpace: 'nowrap' }}>{h}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {logs.map((log) => {
                        const tc = TYPE_COLORS[log.messageType] || TYPE_COLORS.CUSTOM;
                        return (
                          <TableRow key={log.id} sx={{ '&:nth-of-type(odd)': { bgcolor: '#fafafa' } }}>
                            <TableCell sx={{ fontSize: 11, whiteSpace: 'nowrap' }}>
                              {log.createdAt ? new Date(log.createdAt).toLocaleString('en-IN') : '-'}
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600, fontSize: 13 }}>{log.recipientName || '-'}</TableCell>
                            <TableCell sx={{ fontSize: 12, fontFamily: 'monospace' }}>{log.phoneNumber}</TableCell>
                            <TableCell>
                              <Chip
                                label={tc.label || (log.messageType || 'CUSTOM').replace(/_/g, ' ')}
                                size="small"
                                sx={{ fontSize: 10, fontWeight: 700, bgcolor: tc.bg, color: tc.color }}
                              />
                            </TableCell>
                            <TableCell sx={{ maxWidth: 220 }}>
                              <Tooltip title={log.message} placement="top">
                                <Typography fontSize={12} sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220 }}>
                                  {log.message}
                                </Typography>
                              </Tooltip>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={log.status}
                                size="small"
                                sx={{
                                  fontWeight: 700, fontSize: 11,
                                  bgcolor: log.status === 'SENT' ? '#e8f5e9' : '#ffebee',
                                  color: log.status === 'SENT' ? '#2e7d32' : '#c62828',
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
          </TabPanel>

        </Box>
      </Paper>
    </Box>
  );
}
