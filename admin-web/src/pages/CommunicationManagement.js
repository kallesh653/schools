import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent, Tabs, Tab, Grid, Button, TextField,
  FormControl, InputLabel, Select, MenuItem, Chip, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, Alert, CircularProgress,
  Divider, IconButton, Tooltip, Badge, LinearProgress, Dialog, DialogTitle,
  DialogContent, DialogActions, Checkbox, FormControlLabel, Avatar,
} from '@mui/material';
import {
  Sms as SmsIcon, Campaign as CampaignIcon, EventBusy as AbsentIcon,
  Notifications as NoticeIcon, AccountBalance as FeeIcon, History as HistoryIcon,
  Send as SendIcon, CheckCircle as CheckIcon, Cancel as CancelIcon,
  Phone as PhoneIcon, School as SchoolIcon, Refresh as RefreshIcon,
  Info as InfoIcon, Warning as WarningIcon, Settings as SettingsIcon,
  RecordVoiceOver as VoiceIcon, Preview as PreviewIcon, People as PeopleIcon,
} from '@mui/icons-material';
import { smsAPI, academicAPI } from '../services/api';
import { noticeAPI } from '../services/api';

const COLORS = {
  primary: '#1565c0', green: '#2e7d32', orange: '#e65100',
  red: '#c62828', purple: '#6a1b9a', teal: '#00695c',
};

function StatChip({ label, value, color }) {
  return (
    <Chip label={`${label}: ${value}`}
      sx={{ bgcolor: color + '22', color, fontWeight: 700, fontSize: 13, px: 1 }} />
  );
}

export default function CommunicationManagement() {
  const [tab, setTab] = useState(0);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [notices, setNotices] = useState([]);
  const [smsStatus, setSmsStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);

  // Compose tab state
  const [composeMsg, setComposeMsg] = useState('');
  const [composeTarget, setComposeTarget] = useState('CLASS');
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

  useEffect(() => {
    loadInitialData();
  }, []);

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
    } catch (e) { console.error(e); }
  };

  const loadSections = async (classId) => {
    if (!classId) { setSections([]); return; }
    try {
      const res = await academicAPI.getSectionsByClass(classId);
      setSections(res.data || []);
    } catch (e) { setSections([]); }
  };

  const loadLogs = async () => {
    setLogsLoading(true);
    try {
      const res = await smsAPI.getLogs();
      setLogs(res.data || []);
    } catch (e) { setLogs([]); }
    setLogsLoading(false);
  };

  useEffect(() => { if (tab === 4) loadLogs(); }, [tab]);
  useEffect(() => { loadSections(composeClassId); }, [composeClassId]);
  useEffect(() => { loadSections(attClassId); }, [attClassId]);

  const showResult = (data) => {
    setResult(data);
    setTimeout(() => setResult(null), 6000);
  };

  // ---- COMPOSE SEND ----
  const handleComposeSend = async () => {
    if (!composeMsg.trim()) return;
    setLoading(true);
    try {
      let res;
      if (composeTarget === 'CUSTOM') {
        const numbers = composeNumbers.split(/[\n,;]/).map(n => n.trim()).filter(Boolean);
        res = await smsAPI.sendCustom({ numbers, message: composeMsg });
      } else {
        res = await smsAPI.sendToClass({
          classId: composeClassId || null,
          sectionId: composeSectionId || null,
          message: composeMsg,
        });
      }
      showResult(res.data);
    } catch (e) { showResult({ success: false, error: e.message }); }
    setLoading(false);
  };

  // ---- ATTENDANCE PREVIEW ----
  const handleAttPreview = async () => {
    setLoading(true);
    setAttPreviewDone(false);
    try {
      const params = { date: attDate };
      if (attClassId) params.classId = attClassId;
      if (attSectionId) params.sectionId = attSectionId;
      const res = await smsAPI.previewAbsent(params);
      setAbsentStudents(res.data || []);
      setAttPreviewDone(true);
      if (!attMsg) {
        setAttMsg(`Dear Parent, [Student Name] was marked ABSENT on ${attDate}. Please ensure regular attendance. - ${smsStatus?.schoolName || 'School'}`);
      }
    } catch (e) { setAbsentStudents([]); }
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
    } catch (e) { showResult({ success: false, error: e.message }); }
    setLoading(false);
  };

  // ---- NOTICE SEND ----
  useEffect(() => {
    if (!selectedNotice) return;
    const n = notices.find(x => x.id === Number(selectedNotice));
    if (n) {
      const content = n.content && n.content.length > 100 ? n.content.substring(0, 97) + '...' : n.content;
      setNoticeMsg(`Dear Parent, Notice: ${n.title}. ${content || ''} - ${smsStatus?.schoolName || 'School'}`);
    }
  }, [selectedNotice]);

  const handleNoticeSend = async () => {
    if (!selectedNotice) return;
    setLoading(true);
    try {
      const res = await smsAPI.sendNoticeAlert(selectedNotice, { message: noticeMsg });
      showResult(res.data);
    } catch (e) { showResult({ success: false, error: e.message }); }
    setLoading(false);
  };

  // ---- FEE PREVIEW ----
  const handleFeePreview = async () => {
    setLoading(true);
    setFeePreviewDone(false);
    try {
      const params = {};
      if (feeClassId) params.classId = feeClassId;
      const res = await smsAPI.previewFeePending(params);
      setFeePendingStudents(res.data || []);
      setFeePreviewDone(true);
      if (!feeMsg) {
        setFeeMsg(`Dear Parent, Fee of Rs.[Amount] is pending for [Student Name]. Please pay at the earliest. - ${smsStatus?.schoolName || 'School'}`);
      }
    } catch (e) { setFeePendingStudents([]); }
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
    } catch (e) { showResult({ success: false, error: e.message }); }
    setLoading(false);
  };

  const phoneCount = (students) => students.filter(s => s.hasPhone).length;

  return (
    <Box sx={{ p: 3, bgcolor: '#f5f7fa', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{
        background: 'linear-gradient(135deg, #1565c0 0%, #7c4dff 100%)',
        borderRadius: 3, p: 3, mb: 3, color: 'white',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <Box>
          <Typography variant="h5" fontWeight={700} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CampaignIcon sx={{ fontSize: 32 }} /> Communication Center
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.85, mt: 0.5 }}>
            Send SMS & Voice messages to parents — individual, class-wise, or all
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
          {smsStatus?.configured
            ? <Chip label="SMS Active" icon={<CheckIcon />} sx={{ bgcolor: '#2e7d3244', color: '#a5d6a7', fontWeight: 700 }} />
            : <Chip label="Demo Mode" icon={<InfoIcon />} sx={{ bgcolor: '#f5780033', color: '#ffcc80', fontWeight: 700 }} />}
        </Box>
      </Box>

      {/* API Key Warning */}
      {smsStatus && !smsStatus.configured && (
        <Alert severity="warning" icon={<SettingsIcon />} sx={{ mb: 2, borderRadius: 2 }}>
          <strong>SMS API not configured.</strong> Running in Demo Mode (messages are logged but not sent).
          To enable live SMS: Get a Free API key from <strong>Fast2SMS.com</strong> and add it to{' '}
          <code>application.properties</code> as <code>sms.fast2sms.apikey=YOUR_KEY</code> then rebuild.
        </Alert>
      )}

      {/* Result snackbar */}
      {result && (
        <Alert severity={result.success ? 'success' : 'error'} sx={{ mb: 2, borderRadius: 2 }}
          onClose={() => setResult(null)}>
          {result.success
            ? `✓ SMS sent to ${result.sentCount} recipients!${result.demoMode ? ' (Demo mode — not actually sent)' : ''}`
            : `✗ Error: ${result.error || 'Failed to send'}`}
        </Alert>
      )}

      <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable"
          sx={{ bgcolor: '#1565c0', '& .MuiTab-root': { color: 'rgba(255,255,255,0.7)', fontWeight: 600 },
                '& .Mui-selected': { color: '#fff' }, '& .MuiTabs-indicator': { bgcolor: '#fff', height: 3 } }}>
          <Tab icon={<SmsIcon />} label="Compose" iconPosition="start" />
          <Tab icon={<AbsentIcon />} label="Attendance Alerts" iconPosition="start" />
          <Tab icon={<NoticeIcon />} label="Notice Alerts" iconPosition="start" />
          <Tab icon={<FeeIcon />} label="Fee Reminders" iconPosition="start" />
          <Tab icon={<HistoryIcon />} label="SMS Logs" iconPosition="start" />
        </Tabs>

        <CardContent sx={{ p: 3 }}>
          {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}

          {/* ============ TAB 0: COMPOSE ============ */}
          {tab === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={7}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 2, color: COLORS.primary }}>
                  Compose Message
                </Typography>

                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Send To</InputLabel>
                  <Select value={composeTarget} onChange={e => setComposeTarget(e.target.value)} label="Send To">
                    <MenuItem value="CLASS">By Class / Section</MenuItem>
                    <MenuItem value="CUSTOM">Custom Numbers</MenuItem>
                  </Select>
                </FormControl>

                {composeTarget === 'CLASS' && (
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6}>
                      <FormControl fullWidth>
                        <InputLabel>Class (or All)</InputLabel>
                        <Select value={composeClassId} onChange={e => { setComposeClassId(e.target.value); setComposeSectionId(''); }} label="Class (or All)">
                          <MenuItem value="">All Classes</MenuItem>
                          {classes.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                      <FormControl fullWidth disabled={!composeClassId}>
                        <InputLabel>Section (Optional)</InputLabel>
                        <Select value={composeSectionId} onChange={e => setComposeSectionId(e.target.value)} label="Section">
                          <MenuItem value="">All Sections</MenuItem>
                          {sections.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                )}

                {composeTarget === 'CUSTOM' && (
                  <TextField fullWidth multiline rows={3} label="Phone Numbers (one per line or comma-separated)"
                    value={composeNumbers} onChange={e => setComposeNumbers(e.target.value)}
                    placeholder="9999999999&#10;8888888888&#10;7777777777" sx={{ mb: 2 }} />
                )}

                <TextField fullWidth multiline rows={5} label="Message"
                  value={composeMsg} onChange={e => setComposeMsg(e.target.value)}
                  placeholder="Type your message here..." inputProps={{ maxLength: 500 }}
                  helperText={`${composeMsg.length}/500 characters | ~${Math.ceil(composeMsg.length / 160)} SMS`}
                  sx={{ mb: 2 }} />

                <Button variant="contained" size="large" startIcon={<SendIcon />}
                  onClick={handleComposeSend} disabled={loading || !composeMsg.trim()}
                  sx={{ background: 'linear-gradient(135deg, #1565c0, #7c4dff)', px: 4, borderRadius: 2 }}>
                  Send SMS
                </Button>
              </Grid>

              <Grid item xs={12} md={5}>
                <Box sx={{ bgcolor: '#f5f7fa', borderRadius: 2, p: 2 }}>
                  <Typography fontWeight={700} sx={{ mb: 1.5, color: '#555' }}>Message Templates</Typography>
                  {[
                    { label: 'Absent Alert', text: `Dear Parent, [Student Name] was absent today. Please ensure regular attendance. - ${smsStatus?.schoolName || 'School'}` },
                    { label: 'Holiday Notice', text: `Dear Parent, School will remain closed on [Date] due to [Reason]. - ${smsStatus?.schoolName || 'School'}` },
                    { label: 'Meeting Notice', text: `Dear Parent, Parent-Teacher Meeting on [Date] at [Time]. Your presence is requested. - ${smsStatus?.schoolName || 'School'}` },
                    { label: 'Fee Reminder', text: `Dear Parent, This is a reminder to pay the pending school fee for [Student Name]. - ${smsStatus?.schoolName || 'School'}` },
                    { label: 'Exam Alert', text: `Dear Parent, Exams are starting from [Date]. Ensure your child is well prepared. - ${smsStatus?.schoolName || 'School'}` },
                  ].map(t => (
                    <Box key={t.label} sx={{ mb: 1, p: 1.5, bgcolor: 'white', borderRadius: 2, border: '1px solid #e0e0e0',
                      cursor: 'pointer', '&:hover': { borderColor: '#1565c0', bgcolor: '#f0f4ff' } }}
                      onClick={() => setComposeMsg(t.text)}>
                      <Typography fontSize={12} fontWeight={700} color="primary">{t.label}</Typography>
                      <Typography fontSize={11} color="text.secondary" sx={{ mt: 0.3 }}>{t.text.substring(0, 70)}...</Typography>
                    </Box>
                  ))}
                </Box>
              </Grid>
            </Grid>
          )}

          {/* ============ TAB 1: ATTENDANCE ALERTS ============ */}
          {tab === 1 && (
            <Box>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2, color: COLORS.primary }}>
                Attendance Absence Alerts
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Automatically finds absent students for a given date and sends personalized SMS to their parents.
              </Typography>

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={4}>
                  <TextField fullWidth type="date" label="Date" value={attDate}
                    onChange={e => { setAttDate(e.target.value); setAttPreviewDone(false); setAbsentStudents([]); }}
                    InputLabelProps={{ shrink: true }} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel>Class</InputLabel>
                    <Select value={attClassId} onChange={e => { setAttClassId(e.target.value); setAttSectionId(''); setAttPreviewDone(false); }} label="Class">
                      <MenuItem value="">All Classes</MenuItem>
                      {classes.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth disabled={!attClassId}>
                    <InputLabel>Section</InputLabel>
                    <Select value={attSectionId} onChange={e => { setAttSectionId(e.target.value); setAttPreviewDone(false); }} label="Section">
                      <MenuItem value="">All Sections</MenuItem>
                      {sections.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Button variant="outlined" startIcon={<PreviewIcon />} onClick={handleAttPreview}
                disabled={loading} sx={{ mb: 3, borderRadius: 2 }}>
                Find Absent Students
              </Button>

              {attPreviewDone && (
                <>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    <StatChip label="Absent" value={absentStudents.length} color={COLORS.red} />
                    <StatChip label="With Phone" value={phoneCount(absentStudents)} color={COLORS.green} />
                    <StatChip label="No Phone" value={absentStudents.length - phoneCount(absentStudents)} color="#666" />
                  </Box>

                  {absentStudents.length > 0 ? (
                    <>
                      <TableContainer component={Paper} sx={{ mb: 2, borderRadius: 2, maxHeight: 250 }}>
                        <Table size="small" stickyHeader>
                          <TableHead>
                            <TableRow>
                              {['Student', 'Class', 'Parent', 'Phone', 'Status'].map(h => (
                                <TableCell key={h} sx={{ fontWeight: 700, bgcolor: '#1565c0 !important', color: 'white !important' }}>{h}</TableCell>
                              ))}
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {absentStudents.map((s, i) => (
                              <TableRow key={i} sx={{ '&:nth-of-type(odd)': { bgcolor: '#f5f7fa' } }}>
                                <TableCell sx={{ fontWeight: 600 }}>{s.studentName}</TableCell>
                                <TableCell>{s.class} {s.section}</TableCell>
                                <TableCell>{s.parentName}</TableCell>
                                <TableCell>{s.phone}</TableCell>
                                <TableCell>
                                  {s.hasPhone
                                    ? <Chip label="SMS Ready" size="small" sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 700 }} />
                                    : <Chip label="No Phone" size="small" sx={{ bgcolor: '#ffebee', color: '#c62828', fontWeight: 700 }} />}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>

                      <TextField fullWidth multiline rows={3} label="Message (use [Student Name] for personalized names)"
                        value={attMsg} onChange={e => setAttMsg(e.target.value)} sx={{ mb: 2 }}
                        helperText="The [Student Name] placeholder will be replaced automatically for each student" />

                      <Button variant="contained" startIcon={<SendIcon />}
                        onClick={handleAttSend} disabled={loading || phoneCount(absentStudents) === 0}
                        sx={{ background: 'linear-gradient(135deg, #c62828, #ef5350)', px: 4, borderRadius: 2 }}>
                        Send Absent Alert to {phoneCount(absentStudents)} Parents
                      </Button>
                    </>
                  ) : (
                    <Alert severity="info" sx={{ borderRadius: 2 }}>No absent students found for the selected criteria.</Alert>
                  )}
                </>
              )}
            </Box>
          )}

          {/* ============ TAB 2: NOTICE ALERTS ============ */}
          {tab === 2 && (
            <Box>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2, color: COLORS.primary }}>
                Notice Notifications
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Select a notice and send SMS notification to all parents.
              </Typography>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Select Notice</InputLabel>
                <Select value={selectedNotice} onChange={e => setSelectedNotice(e.target.value)} label="Select Notice">
                  <MenuItem value="">-- Select a Notice --</MenuItem>
                  {notices.map(n => (
                    <MenuItem key={n.id} value={n.id}>
                      <Box>
                        <Typography fontSize={14} fontWeight={600}>{n.title}</Typography>
                        <Typography fontSize={11} color="text.secondary">{n.type} · {n.publishDate || 'Draft'}</Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {selectedNotice && (
                <>
                  {(() => {
                    const n = notices.find(x => x.id === Number(selectedNotice));
                    return n ? (
                      <Card sx={{ mb: 2, bgcolor: '#f0f4ff', border: '1px solid #c5cae9', borderRadius: 2 }}>
                        <CardContent>
                          <Typography fontWeight={700}>{n.title}</Typography>
                          <Typography fontSize={13} color="text.secondary" sx={{ mt: 0.5 }}>{n.content}</Typography>
                          <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                            <Chip label={n.type || 'INFO'} size="small" sx={{ bgcolor: '#1565c0', color: 'white', fontWeight: 700 }} />
                            <Chip label={n.targetAudience || 'ALL'} size="small" />
                          </Box>
                        </CardContent>
                      </Card>
                    ) : null;
                  })()}

                  <TextField fullWidth multiline rows={4} label="SMS Message" value={noticeMsg}
                    onChange={e => setNoticeMsg(e.target.value)} sx={{ mb: 2 }}
                    inputProps={{ maxLength: 500 }}
                    helperText={`${noticeMsg.length}/500 characters`} />

                  <Button variant="contained" startIcon={<SendIcon />}
                    onClick={handleNoticeSend} disabled={loading}
                    sx={{ background: 'linear-gradient(135deg, #6a1b9a, #9c27b0)', px: 4, borderRadius: 2 }}>
                    Send Notice to All Parents
                  </Button>
                </>
              )}
            </Box>
          )}

          {/* ============ TAB 3: FEE REMINDERS ============ */}
          {tab === 3 && (
            <Box>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2, color: COLORS.primary }}>
                Fee Payment Reminders
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Automatically finds students with pending fees and sends personalized reminders to their parents.
              </Typography>

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={5}>
                  <FormControl fullWidth>
                    <InputLabel>Class (or All)</InputLabel>
                    <Select value={feeClassId} onChange={e => { setFeeClassId(e.target.value); setFeePreviewDone(false); }} label="Class">
                      <MenuItem value="">All Classes</MenuItem>
                      {classes.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Button variant="outlined" startIcon={<PreviewIcon />} onClick={handleFeePreview}
                    disabled={loading} sx={{ height: 56, borderRadius: 2 }}>
                    Find Pending Students
                  </Button>
                </Grid>
              </Grid>

              {feePreviewDone && (
                <>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    <StatChip label="Pending" value={feePendingStudents.length} color={COLORS.orange} />
                    <StatChip label="With Phone" value={phoneCount(feePendingStudents)} color={COLORS.green} />
                    <StatChip label="Total Pending" value={`₹${feePendingStudents.reduce((s, x) => s + (x.pendingAmount || 0), 0).toLocaleString()}`} color={COLORS.red} />
                  </Box>

                  {feePendingStudents.length > 0 ? (
                    <>
                      <TableContainer component={Paper} sx={{ mb: 2, borderRadius: 2, maxHeight: 250 }}>
                        <Table size="small" stickyHeader>
                          <TableHead>
                            <TableRow>
                              {['Student', 'Class', 'Parent', 'Phone', 'Pending Amount'].map(h => (
                                <TableCell key={h} sx={{ fontWeight: 700, bgcolor: '#1565c0 !important', color: 'white !important' }}>{h}</TableCell>
                              ))}
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {feePendingStudents.map((s, i) => (
                              <TableRow key={i} sx={{ '&:nth-of-type(odd)': { bgcolor: '#f5f7fa' } }}>
                                <TableCell sx={{ fontWeight: 600 }}>{s.studentName}</TableCell>
                                <TableCell>{s.class} {s.section}</TableCell>
                                <TableCell>{s.parentName}</TableCell>
                                <TableCell>{s.phone}</TableCell>
                                <TableCell>
                                  <Chip label={`₹${(s.pendingAmount || 0).toLocaleString()}`} size="small"
                                    sx={{ bgcolor: '#ffebee', color: '#c62828', fontWeight: 700 }} />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>

                      <TextField fullWidth multiline rows={3} label="Message (use [Amount] and [Student Name] for personalized messages)"
                        value={feeMsg} onChange={e => setFeeMsg(e.target.value)} sx={{ mb: 2 }} />

                      <Button variant="contained" startIcon={<SendIcon />}
                        onClick={handleFeeSend} disabled={loading || phoneCount(feePendingStudents) === 0}
                        sx={{ background: 'linear-gradient(135deg, #e65100, #ff9800)', px: 4, borderRadius: 2 }}>
                        Send Reminder to {phoneCount(feePendingStudents)} Parents
                      </Button>
                    </>
                  ) : (
                    <Alert severity="success" sx={{ borderRadius: 2 }}>
                      No pending fee students found{feeClassId ? ' for selected class' : ''}.
                    </Alert>
                  )}
                </>
              )}
            </Box>
          )}

          {/* ============ TAB 4: SMS LOGS ============ */}
          {tab === 4 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={700} color={COLORS.primary}>SMS History</Typography>
                <Button startIcon={<RefreshIcon />} onClick={loadLogs} disabled={logsLoading} variant="outlined" size="small">
                  Refresh
                </Button>
              </Box>

              {logsLoading ? <LinearProgress /> : (
                logs.length === 0 ? (
                  <Alert severity="info" sx={{ borderRadius: 2 }}>No SMS messages sent yet.</Alert>
                ) : (
                  <TableContainer component={Paper} sx={{ borderRadius: 2, maxHeight: 500 }}>
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow>
                          {['Date & Time', 'Recipient', 'Phone', 'Type', 'Message', 'Status'].map(h => (
                            <TableCell key={h} sx={{ fontWeight: 700, bgcolor: '#1565c0 !important', color: 'white !important', whiteSpace: 'nowrap' }}>{h}</TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {logs.map((log, i) => (
                          <TableRow key={log.id} sx={{ '&:nth-of-type(odd)': { bgcolor: '#f5f7fa' } }}>
                            <TableCell sx={{ fontSize: 11, whiteSpace: 'nowrap' }}>
                              {log.createdAt ? new Date(log.createdAt).toLocaleString() : '-'}
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600, fontSize: 13 }}>{log.recipientName || '-'}</TableCell>
                            <TableCell sx={{ fontSize: 12 }}>{log.phoneNumber}</TableCell>
                            <TableCell>
                              <Chip label={log.messageType?.replace('_', ' ') || 'CUSTOM'} size="small"
                                sx={{ fontSize: 10, fontWeight: 700,
                                  bgcolor: log.messageType === 'ATTENDANCE_ALERT' ? '#e3f2fd' :
                                           log.messageType === 'NOTICE_ALERT' ? '#f3e5f5' :
                                           log.messageType === 'FEE_REMINDER' ? '#fff3e0' : '#e8f5e9',
                                  color: log.messageType === 'ATTENDANCE_ALERT' ? '#1565c0' :
                                         log.messageType === 'NOTICE_ALERT' ? '#6a1b9a' :
                                         log.messageType === 'FEE_REMINDER' ? '#e65100' : '#2e7d32',
                                }} />
                            </TableCell>
                            <TableCell sx={{ maxWidth: 200 }}>
                              <Tooltip title={log.message}>
                                <Typography fontSize={12} sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>
                                  {log.message}
                                </Typography>
                              </Tooltip>
                            </TableCell>
                            <TableCell>
                              <Chip label={log.status} size="small"
                                sx={{ fontWeight: 700, fontSize: 11,
                                  bgcolor: log.status === 'SENT' ? '#e8f5e9' : '#ffebee',
                                  color: log.status === 'SENT' ? '#2e7d32' : '#c62828' }} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
