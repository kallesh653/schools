import React, { useState, useEffect } from 'react';
import {
  Box, Paper, Typography, Tabs, Tab, Grid, FormControl, InputLabel,
  Select, MenuItem, Button, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, CircularProgress, Alert, Stack, TextField,
  Card, CardContent, Divider, Avatar, LinearProgress, IconButton, Tooltip,
} from '@mui/material';
import {
  FileDownload as ExcelIcon,
  PictureAsPdf as PdfIcon,
  CheckCircle as AttendIcon,
  AttachMoney as FeeIcon,
  Schedule as TimeTableIcon,
  Assignment as MarksIcon,
  Person as AdmissionIcon,
  Receipt as ReceiptIcon,
  Refresh as RefreshIcon,
  School as SchoolIcon,
  Assessment as ReportIcon,
  Print as PrintIcon,
  Search as SearchIcon,
  EmojiEvents as RankIcon,
  TrendingUp as TrendingIcon,
  Warning as WarningIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import * as XLSX from 'xlsx';
import {
  academicAPI, studentAPI, attendanceAPI, feeAPI, examinationAPI,
} from '../services/api';

// ─── School info used in all PDF headers ─────────────────────────────────────
const SCHOOL_INFO = {
  name: 'School Management System',
  address: 'School Address, City - 560001',
  phone: '+91 9999999999',
  email: 'admin@school.edu',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function TabPanel({ children, value, index }) {
  return value === index ? <Box sx={{ pt: 3 }}>{children}</Box> : null;
}

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN') : '-');
const fmtTime = (t) => t || '-';
const grade = (pct) => {
  if (pct >= 90) return { label: 'A+', color: '#2e7d32' };
  if (pct >= 80) return { label: 'A', color: '#388e3c' };
  if (pct >= 70) return { label: 'B+', color: '#1565c0' };
  if (pct >= 60) return { label: 'B', color: '#1976d2' };
  if (pct >= 50) return { label: 'C', color: '#f57c00' };
  if (pct >= 33) return { label: 'D', color: '#ef6c00' };
  return { label: 'F', color: '#d32f2f' };
};

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// ─── Print helper: opens a new window and triggers print ──────────────────────
const openPrintWindow = (title, bodyHTML) => {
  const w = window.open('', '_blank', 'width=1100,height=780');
  w.document.write(`<!DOCTYPE html><html><head><title>${title}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Segoe UI',Arial,sans-serif;background:#fff;color:#222}
    .no-print{display:flex;justify-content:flex-end;gap:8px;padding:10px 20px;
      background:#f5f7fa;border-bottom:1px solid #ddd}
    .no-print button{padding:8px 20px;border:none;border-radius:6px;cursor:pointer;
      font-size:14px;font-weight:600}
    .btn-print{background:#1565c0;color:#fff}
    .btn-close{background:#666;color:#fff}
    table{width:100%;border-collapse:collapse}
    th{background:#1565c0;color:#fff;padding:9px 11px;text-align:left;font-size:12px}
    td{padding:7px 10px;border-bottom:1px solid #e0e0e0;font-size:12px}
    tr:nth-child(even) td{background:#f5f7fa}
    @media print{.no-print{display:none!important}body{margin:0}}
    .school-header{text-align:center;padding:18px 20px 14px;background:linear-gradient(135deg,#1a237e,#1565c0);color:#fff}
    .school-header h1{font-size:22px;font-weight:700;letter-spacing:.5px}
    .school-header p{font-size:12px;opacity:.85;margin-top:3px}
    .school-header h2{font-size:16px;font-weight:600;margin-top:8px;
      background:rgba(255,255,255,.15);display:inline-block;padding:4px 18px;border-radius:20px}
    .info-row{display:flex;justify-content:space-between;padding:10px 20px;
      background:#e3f2fd;border-bottom:1px solid #bbdefb;font-size:12px;flex-wrap:wrap;gap:4px}
    .info-row span{font-weight:600;color:#1565c0}
    .content{padding:16px 20px}
    .summary-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;margin-bottom:18px}
    .summary-card{text-align:center;padding:14px;border-radius:10px;border:1px solid #e0e0e0}
    .summary-card .val{font-size:24px;font-weight:700}
    .summary-card .lbl{font-size:11px;color:#666;margin-top:2px}
    .footer{text-align:center;padding:12px;color:#999;font-size:11px;border-top:1px solid #eee;margin-top:20px}
    .badge-green{background:#e8f5e9;color:#2e7d32;padding:2px 8px;border-radius:12px;font-weight:600}
    .badge-red{background:#ffebee;color:#c62828;padding:2px 8px;border-radius:12px;font-weight:600}
    .badge-orange{background:#fff3e0;color:#e65100;padding:2px 8px;border-radius:12px;font-weight:600}
    .badge-blue{background:#e3f2fd;color:#1565c0;padding:2px 8px;border-radius:12px;font-weight:600}
    .admission-card{max-width:680px;margin:20px auto;border:2px solid #1565c0;border-radius:12px;overflow:hidden}
    .receipt{max-width:620px;margin:20px auto;border:1px solid #ddd;border-radius:12px;overflow:hidden}
    .receipt-header{background:linear-gradient(135deg,#1a237e,#1565c0);color:#fff;padding:18px 24px}
    .receipt-body{padding:20px 24px}
    .receipt-row{display:flex;justify-content:space-between;padding:7px 0;border-bottom:1px dashed #eee}
    .receipt-row:last-child{border:none}
    .receipt-total{background:#1565c0;color:#fff;padding:10px 20px;
      display:flex;justify-content:space-between;font-size:16px;font-weight:700;margin-top:10px;border-radius:6px}
    .sig-row{display:flex;justify-content:space-between;margin-top:28px;padding-top:10px}
    .sig-box{text-align:center;width:160px}
    .sig-line{border-top:1px solid #333;margin-bottom:5px;margin-top:30px}
    .timetable-header{background:linear-gradient(135deg,#4a148c,#7b1fa2);color:#fff;
      text-align:center;padding:16px;margin-bottom:0}
    .timetable-header h1{font-size:20px;font-weight:700}
    .timetable-header h2{font-size:14px;margin-top:6px;opacity:.9}
    .marksheet-header{background:linear-gradient(135deg,#1a237e,#283593);color:#fff;
      text-align:center;padding:16px 20px}
    .marks-table th{background:#283593}
    .pass{color:#2e7d32;font-weight:600}
    .fail{color:#c62828;font-weight:600}
  </style>
  </head><body>
  <div class="no-print">
    <button class="btn-print" onclick="window.print()">🖨 Print / Save PDF</button>
    <button class="btn-close" onclick="window.close()">✕ Close</button>
  </div>
  ${bodyHTML}
  </body></html>`);
  w.document.close();
};

// ─── Summary Stat Card ────────────────────────────────────────────────────────
function StatCard({ label, value, color = '#1565c0', icon, subtitle }) {
  return (
    <Card sx={{ textAlign: 'center', p: 2, border: `2px solid ${color}20`, borderRadius: 3 }}>
      <Box sx={{ color, mb: 0.5 }}>{icon}</Box>
      <Typography variant="h4" sx={{ fontWeight: 800, color, lineHeight: 1 }}>{value}</Typography>
      <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>{label}</Typography>
      {subtitle && <Typography variant="caption" color="text.secondary">{subtitle}</Typography>}
    </Card>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ReportManagement() {
  const [tab, setTab] = useState(0);
  const [error, setError] = useState('');

  // ── Shared data ──
  const [classes, setClasses] = useState([]);
  const [allSections, setAllSections] = useState([]);
  const [examinations, setExaminations] = useState([]);
  const [allStudents, setAllStudents] = useState([]);

  // ── Attendance ──
  const [attClass, setAttClass] = useState('');
  const [attSection, setAttSection] = useState('');
  const [attSections, setAttSections] = useState([]);
  const [attStart, setAttStart] = useState(() => {
    const d = new Date(); d.setMonth(d.getMonth() - 1); return d.toISOString().split('T')[0];
  });
  const [attEnd, setAttEnd] = useState(new Date().toISOString().split('T')[0]);
  const [attData, setAttData] = useState([]);
  const [attLoading, setAttLoading] = useState(false);

  // ── Fee Collection ──
  const [feeClass, setFeeClass] = useState('');
  const [feeSection, setFeeSection] = useState('');
  const [feeSections, setFeeSections] = useState([]);
  const [feeData, setFeeData] = useState([]);
  const [feeLoading, setFeeLoading] = useState(false);

  // ── Exam Timetable ──
  const [ttExam, setTtExam] = useState('');
  const [ttData, setTtData] = useState([]);
  const [ttLoading, setTtLoading] = useState(false);

  // ── Marksheet ──
  const [mkExam, setMkExam] = useState('');
  const [mkClass, setMkClass] = useState('');
  const [mkSection, setMkSection] = useState('');
  const [mkSections, setMkSections] = useState([]);
  const [mkData, setMkData] = useState(null);
  const [mkLoading, setMkLoading] = useState(false);

  // ── Admission Card ──
  const [adStudent, setAdStudent] = useState('');
  const [adData, setAdData] = useState(null);
  const [adLoading, setAdLoading] = useState(false);

  // ── Fee Receipt ──
  const [rcStudent, setRcStudent] = useState('');
  const [rcPayments, setRcPayments] = useState([]);
  const [rcPayment, setRcPayment] = useState('');
  const [rcData, setRcData] = useState(null);
  const [rcLoading, setRcLoading] = useState(false);

  // ─── Load initial data ──────────────────────────────────────────────────────
  useEffect(() => {
    Promise.all([academicAPI.getClasses(), examinationAPI.getAll(), studentAPI.getAll()])
      .then(([c, e, s]) => {
        setClasses(c.data || []);
        setExaminations(e.data || []);
        setAllStudents(s.data || []);
      })
      .catch(() => {});
  }, []);

  const loadSections = async (classId, setter) => {
    if (!classId) { setter([]); return; }
    try {
      const r = await academicAPI.getSectionsByClass(classId);
      setter(r.data || []);
    } catch { setter([]); }
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // TAB 1 – ATTENDANCE REPORT
  // ═══════════════════════════════════════════════════════════════════════════
  const generateAttReport = async () => {
    if (!attClass || !attSection || !attStart || !attEnd) {
      setError('Please select Class, Section and Date Range'); return;
    }
    setAttLoading(true); setError('');
    try {
      const sr = await studentAPI.getByClassSection(attClass, attSection);
      const studs = sr.data || [];
      const results = await Promise.all(studs.map(s =>
        attendanceAPI.getByStudent(s.id).catch(() => ({ data: [] }))
      ));
      const start = new Date(attStart);
      const end = new Date(attEnd);
      const rows = studs.map((s, i) => {
        const recs = (results[i]?.data || []).filter(r => {
          const d = new Date(r.date); return d >= start && d <= end;
        });
        const present = recs.filter(r => r.status === 'PRESENT').length;
        const absent = recs.filter(r => r.status === 'ABSENT').length;
        const late = recs.filter(r => r.status === 'LATE').length;
        const lv = recs.filter(r => r.status === 'LEAVE').length;
        const total = recs.length;
        const pct = total > 0 ? Math.round((present / total) * 100) : 0;
        return {
          rollNo: s.rollNumber || i + 1,
          name: s.name || s.fullName || 'N/A',
          total, present, absent, late, leave: lv, pct,
        };
      });
      setAttData(rows);
    } catch (e) { setError('Failed to generate attendance report'); }
    finally { setAttLoading(false); }
  };

  const exportAttExcel = () => {
    const cn = classes.find(c => c.id === +attClass)?.name || '';
    const sn = attSections.find(s => s.id === +attSection)?.name || '';
    const ws = XLSX.utils.aoa_to_sheet([
      [SCHOOL_INFO.name], ['STUDENT ATTENDANCE REPORT'],
      [`Class: ${cn} - Section: ${sn}  |  Period: ${attStart} to ${attEnd}`], [],
      ['#', 'Roll No', 'Student Name', 'Total Days', 'Present', 'Absent', 'Late', 'Leave', 'Attendance %'],
      ...attData.map((r, i) => [i + 1, r.rollNo, r.name, r.total, r.present, r.absent, r.late, r.leave, `${r.pct}%`]),
      [],
      ['', '', 'AVERAGE', '', Math.round(attData.reduce((a, r) => a + r.present, 0) / (attData.length || 1)),
        Math.round(attData.reduce((a, r) => a + r.absent, 0) / (attData.length || 1)), '', '',
        `${Math.round(attData.reduce((a, r) => a + r.pct, 0) / (attData.length || 1))}%`],
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Attendance');
    XLSX.writeFile(wb, `Attendance_${cn}_${sn}.xlsx`);
  };

  const printAttPDF = () => {
    const cn = classes.find(c => c.id === +attClass)?.name || '';
    const sn = attSections.find(s => s.id === +attSection)?.name || '';
    const avg = attData.length ? Math.round(attData.reduce((a, r) => a + r.pct, 0) / attData.length) : 0;
    const defaulters = attData.filter(r => r.pct < 75).length;
    const rows = attData.map((r, i) => {
      const badge = r.pct >= 75 ? 'badge-green' : 'badge-red';
      return `<tr>
        <td>${i + 1}</td><td>${r.rollNo}</td><td><strong>${r.name}</strong></td>
        <td style="text-align:center">${r.total}</td>
        <td style="text-align:center;color:#2e7d32;font-weight:600">${r.present}</td>
        <td style="text-align:center;color:#c62828;font-weight:600">${r.absent}</td>
        <td style="text-align:center;color:#e65100">${r.late}</td>
        <td style="text-align:center;color:#1565c0">${r.leave}</td>
        <td style="text-align:center"><span class="${badge}">${r.pct}%</span></td>
      </tr>`;
    }).join('');
    const html = `
      <div class="school-header">
        <h1>${SCHOOL_INFO.name}</h1>
        <p>${SCHOOL_INFO.address} | ${SCHOOL_INFO.phone}</p>
        <h2>STUDENT ATTENDANCE REPORT</h2>
      </div>
      <div class="info-row">
        <div>Class: <span>${cn}</span> &nbsp;|&nbsp; Section: <span>${sn}</span></div>
        <div>Period: <span>${attStart}</span> to <span>${attEnd}</span></div>
        <div>Generated: <span>${new Date().toLocaleDateString('en-IN')}</span></div>
      </div>
      <div class="content">
        <div class="summary-grid">
          <div class="summary-card" style="border-color:#1565c0">
            <div class="val" style="color:#1565c0">${attData.length}</div>
            <div class="lbl">Total Students</div>
          </div>
          <div class="summary-card" style="border-color:#2e7d32">
            <div class="val" style="color:#2e7d32">${avg}%</div>
            <div class="lbl">Average Attendance</div>
          </div>
          <div class="summary-card" style="border-color:#c62828">
            <div class="val" style="color:#c62828">${defaulters}</div>
            <div class="lbl">Defaulters (&lt;75%)</div>
          </div>
          <div class="summary-card" style="border-color:#f57c00">
            <div class="val" style="color:#f57c00">${attData.length - defaulters}</div>
            <div class="lbl">Regular (≥75%)</div>
          </div>
        </div>
        <table>
          <thead><tr>
            <th style="width:35px">#</th><th>Roll No</th><th>Student Name</th>
            <th style="text-align:center">Total Days</th>
            <th style="text-align:center">Present</th>
            <th style="text-align:center">Absent</th>
            <th style="text-align:center">Late</th>
            <th style="text-align:center">Leave</th>
            <th style="text-align:center">Attendance %</th>
          </tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <div class="footer">
          Generated on ${new Date().toLocaleString('en-IN')} &nbsp;|&nbsp; ${SCHOOL_INFO.name} &nbsp;|&nbsp; Confidential
        </div>
      </div>`;
    openPrintWindow(`Attendance Report - ${cn} ${sn}`, html);
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // TAB 2 – FEE COLLECTION REPORT
  // ═══════════════════════════════════════════════════════════════════════════
  const generateFeeReport = async () => {
    if (!feeClass) { setError('Please select a Class'); return; }
    setFeeLoading(true); setError('');
    try {
      let studs = [];
      if (feeSection) {
        studs = (await studentAPI.getByClassSection(feeClass, feeSection)).data || [];
      } else {
        studs = (allStudents).filter(s => s.schoolClass?.id === +feeClass || s.classId === +feeClass);
      }
      const statuses = await Promise.all(studs.map(s =>
        feeAPI.getStudentStatus(s.id).catch(() => ({ data: null }))
      ));
      const rows = studs.map((s, i) => {
        const st = statuses[i]?.data;
        return {
          rollNo: s.rollNumber || i + 1,
          name: s.name || s.fullName || 'N/A',
          className: s.schoolClass?.name || classes.find(c => c.id === +feeClass)?.name || '',
          sectionName: s.section?.name || feeSections.find(sc => sc.id === +feeSection)?.name || '',
          totalFee: st?.totalFee || 0,
          paid: st?.paidAmount || 0,
          balance: st?.balance || 0,
          status: st?.status || 'N/A',
        };
      });
      setFeeData(rows);
    } catch { setError('Failed to generate fee report'); }
    finally { setFeeLoading(false); }
  };

  const exportFeeExcel = () => {
    const cn = classes.find(c => c.id === +feeClass)?.name || '';
    const sn = feeSections.find(s => s.id === +feeSection)?.name || 'All';
    const totFee = feeData.reduce((a, r) => a + r.totalFee, 0);
    const totPaid = feeData.reduce((a, r) => a + r.paid, 0);
    const totBal = feeData.reduce((a, r) => a + r.balance, 0);
    const ws = XLSX.utils.aoa_to_sheet([
      [SCHOOL_INFO.name], ['FEE COLLECTION REPORT'],
      [`Class: ${cn} - Section: ${sn}`], [],
      ['#', 'Roll No', 'Student Name', 'Class', 'Section', 'Total Fee', 'Paid', 'Balance', 'Status'],
      ...feeData.map((r, i) => [i + 1, r.rollNo, r.name, r.className, r.sectionName, r.totalFee, r.paid, r.balance, r.status]),
      [],
      ['', '', 'TOTAL', '', '', totFee, totPaid, totBal, `${Math.round((totPaid / (totFee || 1)) * 100)}% collected`],
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Fee Collection');
    XLSX.writeFile(wb, `FeeCollection_${cn}_${sn}.xlsx`);
  };

  const printFeePDF = () => {
    const cn = classes.find(c => c.id === +feeClass)?.name || '';
    const sn = feeSections.find(s => s.id === +feeSection)?.name || 'All';
    const totFee = feeData.reduce((a, r) => a + r.totalFee, 0);
    const totPaid = feeData.reduce((a, r) => a + r.paid, 0);
    const totBal = feeData.reduce((a, r) => a + r.balance, 0);
    const pct = totFee > 0 ? Math.round((totPaid / totFee) * 100) : 0;
    const rows = feeData.map((r, i) => {
      const badge = r.status === 'PAID' ? 'badge-green' : r.status === 'PARTIAL' ? 'badge-orange' : 'badge-red';
      return `<tr>
        <td>${i + 1}</td><td>${r.rollNo}</td><td><strong>${r.name}</strong></td>
        <td>${r.className}</td><td>${r.sectionName}</td>
        <td style="text-align:right">₹${r.totalFee.toLocaleString('en-IN')}</td>
        <td style="text-align:right;color:#2e7d32;font-weight:600">₹${r.paid.toLocaleString('en-IN')}</td>
        <td style="text-align:right;color:${r.balance > 0 ? '#c62828' : '#2e7d32'};font-weight:600">₹${r.balance.toLocaleString('en-IN')}</td>
        <td><span class="${badge}">${r.status}</span></td>
      </tr>`;
    }).join('');
    const html = `
      <div class="school-header">
        <h1>${SCHOOL_INFO.name}</h1>
        <p>${SCHOOL_INFO.address} | ${SCHOOL_INFO.phone}</p>
        <h2>FEE COLLECTION REPORT</h2>
      </div>
      <div class="info-row">
        <div>Class: <span>${cn}</span> &nbsp;|&nbsp; Section: <span>${sn}</span></div>
        <div>Generated: <span>${new Date().toLocaleDateString('en-IN')}</span></div>
      </div>
      <div class="content">
        <div class="summary-grid">
          <div class="summary-card" style="border-color:#1565c0">
            <div class="val" style="color:#1565c0">₹${totFee.toLocaleString('en-IN')}</div>
            <div class="lbl">Total Fee Due</div>
          </div>
          <div class="summary-card" style="border-color:#2e7d32">
            <div class="val" style="color:#2e7d32">₹${totPaid.toLocaleString('en-IN')}</div>
            <div class="lbl">Total Collected</div>
          </div>
          <div class="summary-card" style="border-color:#c62828">
            <div class="val" style="color:#c62828">₹${totBal.toLocaleString('en-IN')}</div>
            <div class="lbl">Total Remaining</div>
          </div>
          <div class="summary-card" style="border-color:#f57c00">
            <div class="val" style="color:#f57c00">${pct}%</div>
            <div class="lbl">Collection Rate</div>
          </div>
        </div>
        <table>
          <thead><tr>
            <th>#</th><th>Roll No</th><th>Student Name</th><th>Class</th><th>Section</th>
            <th style="text-align:right">Total Fee</th>
            <th style="text-align:right">Paid</th>
            <th style="text-align:right">Balance</th>
            <th>Status</th>
          </tr></thead>
          <tbody>${rows}</tbody>
          <tfoot><tr style="background:#1565c0;color:#fff;font-weight:700">
            <td colspan="5" style="padding:10px">TOTAL (${feeData.length} Students)</td>
            <td style="text-align:right;padding:10px">₹${totFee.toLocaleString('en-IN')}</td>
            <td style="text-align:right;padding:10px">₹${totPaid.toLocaleString('en-IN')}</td>
            <td style="text-align:right;padding:10px">₹${totBal.toLocaleString('en-IN')}</td>
            <td style="padding:10px">${pct}% Collected</td>
          </tr></tfoot>
        </table>
        <div class="footer">Generated on ${new Date().toLocaleString('en-IN')} | ${SCHOOL_INFO.name}</div>
      </div>`;
    openPrintWindow(`Fee Collection - ${cn} ${sn}`, html);
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // TAB 3 – EXAM TIMETABLE
  // ═══════════════════════════════════════════════════════════════════════════
  const loadTimetable = async (examId) => {
    if (!examId) return;
    setTtLoading(true);
    try {
      const r = await examinationAPI.getSchedules(examId);
      setTtData((r.data || []).sort((a, b) => new Date(a.examDate) - new Date(b.examDate)));
    } catch { setError('Failed to load timetable'); }
    finally { setTtLoading(false); }
  };

  const printTimetablePDF = () => {
    const examName = examinations.find(e => e.id === +ttExam)?.name || '';
    const rows = ttData.map((r, i) => {
      const d = new Date(r.examDate);
      return `<tr>
        <td style="font-weight:600">${fmtDate(r.examDate)}</td>
        <td style="color:#7b1fa2;font-weight:600">${DAYS[d.getDay()]}</td>
        <td style="font-weight:600">${r.subject?.name || '-'}</td>
        <td>${fmtTime(r.startTime)}</td>
        <td>${fmtTime(r.endTime)}</td>
        <td>${r.room || '-'}</td>
        <td style="text-align:center;font-weight:700">${r.maxMarks || '-'}</td>
      </tr>`;
    }).join('');
    const html = `
      <div class="timetable-header">
        <h1>${SCHOOL_INFO.name}</h1>
        <p style="opacity:.8;font-size:12px">${SCHOOL_INFO.address}</p>
        <h2>${examName} — EXAMINATION TIMETABLE</h2>
      </div>
      <div class="info-row" style="background:#f3e5f5;border-color:#ce93d8">
        <div>Examination: <span style="color:#7b1fa2">${examName}</span></div>
        <div>Total Subjects: <span style="color:#7b1fa2">${ttData.length}</span></div>
        <div>Generated: <span style="color:#7b1fa2">${new Date().toLocaleDateString('en-IN')}</span></div>
      </div>
      <div class="content">
        <table>
          <thead style="background:#7b1fa2"><tr>
            <th>Date</th><th>Day</th><th>Subject</th>
            <th>Start Time</th><th>End Time</th><th>Room / Hall</th>
            <th style="text-align:center">Max Marks</th>
          </tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <div style="margin-top:24px;padding:14px;background:#f3e5f5;border-radius:8px;border-left:4px solid #7b1fa2">
          <strong style="color:#7b1fa2">Instructions:</strong>
          <ul style="margin-top:8px;margin-left:20px;font-size:12px;color:#555;line-height:1.8">
            <li>Students must report 15 minutes before the exam.</li>
            <li>Mobile phones and electronic devices are strictly prohibited.</li>
            <li>Bring your admit card / ID card for every exam.</li>
            <li>No entry allowed after 10 minutes of exam start.</li>
          </ul>
        </div>
        <div class="sig-row">
          <div class="sig-box"><div class="sig-line"></div><div style="font-size:12px">Class Teacher</div></div>
          <div class="sig-box"><div class="sig-line"></div><div style="font-size:12px">Examination Controller</div></div>
          <div class="sig-box"><div class="sig-line"></div><div style="font-size:12px">Principal</div></div>
        </div>
        <div class="footer">Generated on ${new Date().toLocaleString('en-IN')} | ${SCHOOL_INFO.name}</div>
      </div>`;
    openPrintWindow(`Timetable - ${examName}`, html);
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // TAB 4 – MARKSHEET
  // ═══════════════════════════════════════════════════════════════════════════
  const generateMarksheet = async () => {
    if (!mkExam || !mkClass || !mkSection) {
      setError('Please select Exam, Class and Section'); return;
    }
    setMkLoading(true); setError('');
    try {
      const [sr, mr] = await Promise.all([
        studentAPI.getByClassSection(mkClass, mkSection),
        examinationAPI.getMarks(mkExam),
      ]);
      const studs = sr.data || [];
      const allMarks = mr.data || [];
      const subjects = [...new Set(allMarks.map(m => m.subject?.name).filter(Boolean))];
      const byStudent = {};
      allMarks.forEach(m => {
        const id = m.student?.id;
        if (id) { if (!byStudent[id]) byStudent[id] = []; byStudent[id].push(m); }
      });
      const rows = studs.map((s, i) => {
        const sm = byStudent[s.id] || [];
        const subMarks = {};
        let totObt = 0, totMax = 0;
        subjects.forEach(sub => {
          const mk = sm.find(m => m.subject?.name === sub);
          subMarks[sub] = mk ? (mk.totalMarks !== null ? mk.totalMarks : '-') : '-';
          if (mk && mk.totalMarks !== null) {
            totObt += mk.totalMarks || 0;
            totMax += mk.subject?.maxMarks || 100;
          }
        });
        const pct = totMax > 0 ? Math.round((totObt / totMax) * 100) : 0;
        const g = grade(pct);
        return { rollNo: s.rollNumber || i + 1, name: s.name || s.fullName || 'N/A', subMarks, totObt, totMax, pct, grade: g };
      }).sort((a, b) => b.pct - a.pct).map((r, i) => ({ ...r, rank: i + 1 }));
      setMkData({ rows, subjects, exam: examinations.find(e => e.id === +mkExam) });
    } catch { setError('Failed to generate marksheet'); }
    finally { setMkLoading(false); }
  };

  const exportMarksExcel = () => {
    if (!mkData) return;
    const cn = classes.find(c => c.id === +mkClass)?.name || '';
    const sn = mkSections.find(s => s.id === +mkSection)?.name || '';
    const header = ['Rank', 'Roll No', 'Student Name', ...mkData.subjects, 'Total Obtained', 'Total Max', 'Percentage', 'Grade'];
    const wsData = [
      [SCHOOL_INFO.name],
      [`MARKSHEET - ${mkData.exam?.name || ''}`],
      [`Class: ${cn} - Section: ${sn}`], [],
      header,
      ...mkData.rows.map(r => [
        r.rank, r.rollNo, r.name,
        ...mkData.subjects.map(s => r.subMarks[s] ?? '-'),
        r.totObt, r.totMax, `${r.pct}%`, r.grade.label,
      ]),
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Marksheet');
    XLSX.writeFile(wb, `Marksheet_${cn}_${sn}.xlsx`);
  };

  const printMarksheetPDF = () => {
    if (!mkData) return;
    const cn = classes.find(c => c.id === +mkClass)?.name || '';
    const sn = mkSections.find(s => s.id === +mkSection)?.name || '';
    const thCols = ['Rank', 'Roll', 'Student Name', ...mkData.subjects, 'Total', '%', 'Grade'].map(h =>
      `<th style="text-align:center">${h}</th>`).join('');
    const rows = mkData.rows.map(r => {
      const g = r.grade;
      const subCells = mkData.subjects.map(s => {
        const v = r.subMarks[s];
        return `<td style="text-align:center">${v ?? '-'}</td>`;
      }).join('');
      return `<tr>
        <td style="text-align:center;font-weight:700;color:#7b1fa2">${r.rank}</td>
        <td style="text-align:center">${r.rollNo}</td>
        <td><strong>${r.name}</strong></td>
        ${subCells}
        <td style="text-align:center;font-weight:700">${r.totObt}/${r.totMax}</td>
        <td style="text-align:center;font-weight:700">${r.pct}%</td>
        <td style="text-align:center"><span style="background:${g.color}20;color:${g.color};padding:2px 8px;border-radius:12px;font-weight:700">${g.label}</span></td>
      </tr>`;
    }).join('');
    const pass = mkData.rows.filter(r => r.pct >= 33).length;
    const html = `
      <div class="marksheet-header">
        <h1>${SCHOOL_INFO.name}</h1>
        <p style="opacity:.8;font-size:12px">${SCHOOL_INFO.address}</p>
        <h2>${mkData.exam?.name || ''} — MARKSHEET</h2>
      </div>
      <div class="info-row">
        <div>Class: <span>${cn}</span> &nbsp;|&nbsp; Section: <span>${sn}</span></div>
        <div>Total Students: <span>${mkData.rows.length}</span> &nbsp;|&nbsp; Pass: <span style="color:#2e7d32">${pass}</span> &nbsp;|&nbsp; Fail: <span style="color:#c62828">${mkData.rows.length - pass}</span></div>
        <div>Generated: <span>${new Date().toLocaleDateString('en-IN')}</span></div>
      </div>
      <div class="content">
        <table class="marks-table">
          <thead><tr>${thCols}</tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <div style="margin-top:20px;font-size:12px;color:#555">
          <strong>Grade Scale:</strong> &nbsp; A+ ≥90% &nbsp;|&nbsp; A ≥80% &nbsp;|&nbsp; B+ ≥70% &nbsp;|&nbsp; B ≥60% &nbsp;|&nbsp; C ≥50% &nbsp;|&nbsp; D ≥33% &nbsp;|&nbsp; F &lt;33%
        </div>
        <div class="sig-row">
          <div class="sig-box"><div class="sig-line"></div><div style="font-size:12px">Class Teacher</div></div>
          <div class="sig-box"><div class="sig-line"></div><div style="font-size:12px">Examination Controller</div></div>
          <div class="sig-box"><div class="sig-line"></div><div style="font-size:12px">Principal</div></div>
        </div>
        <div class="footer">Generated on ${new Date().toLocaleString('en-IN')} | ${SCHOOL_INFO.name}</div>
      </div>`;
    openPrintWindow(`Marksheet - ${mkData.exam?.name} - ${cn} ${sn}`, html);
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // TAB 5 – ADMISSION CARD
  // ═══════════════════════════════════════════════════════════════════════════
  const loadAdmissionCard = async () => {
    if (!adStudent) { setError('Please select a student'); return; }
    setAdLoading(true); setError('');
    try {
      const [sr, pr] = await Promise.all([
        studentAPI.getById(adStudent),
        studentAPI.getParent(adStudent).catch(() => ({ data: null })),
      ]);
      setAdData({ student: sr.data, parent: pr.data });
    } catch { setError('Failed to load student data'); }
    finally { setAdLoading(false); }
  };

  const printAdmissionCard = () => {
    if (!adData) return;
    const s = adData.student;
    const p = adData.parent;
    const html = `
      <div style="max-width:700px;margin:30px auto">
        <div class="admission-card">
          <div style="background:linear-gradient(135deg,#1a237e,#1565c0);color:#fff;padding:20px 24px;display:flex;justify-content:space-between;align-items:center">
            <div>
              <h1 style="font-size:20px;font-weight:700">${SCHOOL_INFO.name}</h1>
              <p style="font-size:12px;opacity:.85;margin-top:3px">${SCHOOL_INFO.address}</p>
              <div style="margin-top:10px;background:rgba(255,255,255,.15);display:inline-block;padding:4px 14px;border-radius:20px;font-size:13px;font-weight:600">
                STUDENT ADMISSION CARD
              </div>
            </div>
            <div style="width:80px;height:100px;background:rgba(255,255,255,.2);border:2px dashed rgba(255,255,255,.5);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:11px;text-align:center;color:rgba(255,255,255,.7)">
              Photo
            </div>
          </div>
          <div style="padding:20px 24px">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px">
              <div style="padding:10px 14px;background:#f5f7fa;border-radius:8px;border-left:3px solid #1565c0">
                <div style="font-size:11px;color:#666;text-transform:uppercase;font-weight:600">Full Name</div>
                <div style="font-size:15px;font-weight:700;color:#1a237e;margin-top:2px">${s.name || s.fullName || 'N/A'}</div>
              </div>
              <div style="padding:10px 14px;background:#f5f7fa;border-radius:8px;border-left:3px solid #7b1fa2">
                <div style="font-size:11px;color:#666;text-transform:uppercase;font-weight:600">Admission No.</div>
                <div style="font-size:15px;font-weight:700;color:#7b1fa2;margin-top:2px">${s.admissionNumber || s.id || 'N/A'}</div>
              </div>
              <div style="padding:10px 14px;background:#f5f7fa;border-radius:8px;border-left:3px solid #2e7d32">
                <div style="font-size:11px;color:#666;text-transform:uppercase;font-weight:600">Class &amp; Section</div>
                <div style="font-size:15px;font-weight:700;color:#2e7d32;margin-top:2px">${s.schoolClass?.name || 'N/A'} — ${s.section?.name || 'N/A'}</div>
              </div>
              <div style="padding:10px 14px;background:#f5f7fa;border-radius:8px;border-left:3px solid #f57c00">
                <div style="font-size:11px;color:#666;text-transform:uppercase;font-weight:600">Roll Number</div>
                <div style="font-size:15px;font-weight:700;color:#f57c00;margin-top:2px">${s.rollNumber || 'N/A'}</div>
              </div>
              <div style="padding:10px 14px;background:#f5f7fa;border-radius:8px;border-left:3px solid #1565c0">
                <div style="font-size:11px;color:#666;text-transform:uppercase;font-weight:600">Date of Birth</div>
                <div style="font-size:14px;font-weight:700;color:#1565c0;margin-top:2px">${fmtDate(s.dateOfBirth)}</div>
              </div>
              <div style="padding:10px 14px;background:#f5f7fa;border-radius:8px;border-left:3px solid #1565c0">
                <div style="font-size:11px;color:#666;text-transform:uppercase;font-weight:600">Gender</div>
                <div style="font-size:14px;font-weight:700;color:#1565c0;margin-top:2px">${s.gender || 'N/A'}</div>
              </div>
              <div style="padding:10px 14px;background:#f5f7fa;border-radius:8px;border-left:3px solid #c62828;grid-column:span 2">
                <div style="font-size:11px;color:#666;text-transform:uppercase;font-weight:600">Address</div>
                <div style="font-size:13px;font-weight:600;color:#333;margin-top:2px">${s.address || 'N/A'}</div>
              </div>
            </div>
            ${p ? `
            <div style="margin-top:16px;padding:14px;background:#e8f5e9;border-radius:8px;border:1px solid #a5d6a7">
              <div style="font-size:12px;font-weight:700;color:#2e7d32;margin-bottom:8px;text-transform:uppercase">Parent / Guardian Details</div>
              <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:10px;font-size:13px">
                <div><span style="color:#666">Name:</span> <strong>${p.fatherName || p.name || 'N/A'}</strong></div>
                <div><span style="color:#666">Phone:</span> <strong>${p.phone || p.mobileNumber || 'N/A'}</strong></div>
                <div><span style="color:#666">Email:</span> <strong>${p.email || 'N/A'}</strong></div>
              </div>
            </div>` : ''}
            <div style="margin-top:20px;display:flex;justify-content:space-between;padding-top:16px;border-top:1px dashed #ddd">
              <div style="text-align:center;width:140px">
                <div style="border-top:1px solid #333;margin-bottom:5px;margin-top:35px"></div>
                <div style="font-size:11px;color:#666">Student Signature</div>
              </div>
              <div style="text-align:center">
                <div style="width:80px;height:50px;background:#f5f7fa;border:1px dashed #999;border-radius:4px;margin-bottom:4px;display:flex;align-items:center;justify-content:center;font-size:10px;color:#999">Seal</div>
              </div>
              <div style="text-align:center;width:140px">
                <div style="border-top:1px solid #333;margin-bottom:5px;margin-top:35px"></div>
                <div style="font-size:11px;color:#666">Principal Signature</div>
              </div>
            </div>
          </div>
          <div style="background:#1a237e;color:rgba(255,255,255,.7);text-align:center;padding:8px;font-size:11px">
            Issued: ${new Date().toLocaleDateString('en-IN')} &nbsp;|&nbsp; ${SCHOOL_INFO.name} &nbsp;|&nbsp; ${SCHOOL_INFO.phone}
          </div>
        </div>
      </div>`;
    openPrintWindow('Admission Card', html);
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // TAB 6 – FEE RECEIPT
  // ═══════════════════════════════════════════════════════════════════════════
  const loadStudentPayments = async (studentId) => {
    if (!studentId) return;
    setRcLoading(true);
    try {
      const r = await feeAPI.getStudentPayments(studentId);
      setRcPayments(r.data || []);
    } catch { setError('Failed to load payments'); }
    finally { setRcLoading(false); }
  };

  const printFeeReceipt = () => {
    if (!rcPayment) { setError('Please select a payment'); return; }
    const pay = rcPayments.find(p => p.id === +rcPayment);
    if (!pay) return;
    const student = allStudents.find(s => s.id === +rcStudent);
    const receiptNo = pay.receiptNumber || `RCP-${pay.id}`;
    const html = `
      <div style="max-width:620px;margin:30px auto">
        <div class="receipt">
          <div class="receipt-header">
            <div style="display:flex;justify-content:space-between;align-items:flex-start">
              <div>
                <h1 style="font-size:20px;font-weight:700">${SCHOOL_INFO.name}</h1>
                <p style="font-size:12px;opacity:.85;margin-top:3px">${SCHOOL_INFO.address}</p>
                <p style="font-size:12px;opacity:.85">${SCHOOL_INFO.phone} | ${SCHOOL_INFO.email}</p>
              </div>
              <div style="text-align:right">
                <div style="font-size:14px;font-weight:700;background:rgba(255,255,255,.2);padding:6px 14px;border-radius:8px">FEE RECEIPT</div>
                <div style="font-size:12px;margin-top:6px;opacity:.85">Receipt No: <strong>${receiptNo}</strong></div>
                <div style="font-size:12px;opacity:.85">Date: <strong>${fmtDate(pay.paymentDate)}</strong></div>
              </div>
            </div>
          </div>
          <div class="receipt-body">
            <div style="padding:12px 14px;background:#e3f2fd;border-radius:8px;margin-bottom:16px;border:1px solid #bbdefb">
              <div style="font-size:11px;color:#1565c0;text-transform:uppercase;font-weight:700;margin-bottom:6px">Student Details</div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:13px">
                <div><span style="color:#666">Name: </span><strong>${student?.name || student?.fullName || 'N/A'}</strong></div>
                <div><span style="color:#666">Admission No: </span><strong>${student?.admissionNumber || student?.id || 'N/A'}</strong></div>
                <div><span style="color:#666">Class: </span><strong>${student?.schoolClass?.name || 'N/A'}</strong></div>
                <div><span style="color:#666">Section: </span><strong>${student?.section?.name || 'N/A'}</strong></div>
              </div>
            </div>
            <div style="font-size:12px;font-weight:700;color:#666;text-transform:uppercase;margin-bottom:8px">Payment Details</div>
            <div class="receipt-row"><span>Payment Mode</span><strong>${pay.paymentMode || 'Cash'}</strong></div>
            <div class="receipt-row"><span>Payment Date</span><strong>${fmtDate(pay.paymentDate)}</strong></div>
            <div class="receipt-row"><span>Fee Type</span><strong>${pay.feeStructure?.feeType || pay.feeType || 'School Fee'}</strong></div>
            <div class="receipt-row"><span>Academic Year</span><strong>${pay.feeStructure?.academicYear?.year || pay.academicYear || new Date().getFullYear()}</strong></div>
            ${pay.remarks ? `<div class="receipt-row"><span>Remarks</span><strong>${pay.remarks}</strong></div>` : ''}
            <div class="receipt-total">
              <span>Amount Received</span>
              <span>₹ ${(pay.amount || 0).toLocaleString('en-IN')}</span>
            </div>
            <div style="margin-top:8px;padding:8px 12px;background:#e8f5e9;border-radius:6px;font-size:12px;color:#2e7d32;text-align:center;font-weight:600">
              ✓ Payment Successfully Received
            </div>
            <div class="sig-row">
              <div class="sig-box"><div class="sig-line"></div><div style="font-size:11px;color:#666">Parent / Student Signature</div></div>
              <div class="sig-box"><div class="sig-line"></div><div style="font-size:11px;color:#666">Cashier / Accountant</div></div>
            </div>
            <div style="margin-top:16px;padding:10px;background:#fff3e0;border-radius:6px;border:1px solid #ffe0b2;font-size:11px;color:#e65100;text-align:center">
              <strong>Note:</strong> This is a computer-generated receipt. Please keep it for future reference.
            </div>
          </div>
          <div style="background:#1a237e;color:rgba(255,255,255,.7);text-align:center;padding:8px;font-size:11px">
            ${SCHOOL_INFO.name} &nbsp;|&nbsp; ${SCHOOL_INFO.phone} &nbsp;|&nbsp; ${SCHOOL_INFO.email}
          </div>
        </div>
      </div>`;
    openPrintWindow(`Fee Receipt - ${receiptNo}`, html);
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <Box>
      {/* Page Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar sx={{ bgcolor: '#1a237e', width: 50, height: 50 }}>
          <ReportIcon sx={{ fontSize: 28 }} />
        </Avatar>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a237e', lineHeight: 1.1 }}>
            Reports &amp; Documents
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Attendance · Fee Collection · Timetable · Marksheet · Admission Card · Fee Receipt
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>
      )}

      <Paper sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.1)' }}>
        {/* Tab Bar */}
        <Tabs
          value={tab} onChange={(_, v) => setTab(v)}
          variant="scrollable" scrollButtons="auto"
          sx={{
            background: 'linear-gradient(135deg,#1a237e,#283593)',
            '& .MuiTab-root': { color: 'rgba(255,255,255,.65)', fontSize: '0.82rem', minHeight: 56, fontWeight: 500 },
            '& .Mui-selected': { color: '#fff !important', fontWeight: 700 },
            '& .MuiTabs-indicator': { backgroundColor: '#7c4dff', height: 3 },
          }}
        >
          <Tab icon={<AttendIcon sx={{ fontSize: 17 }} />} iconPosition="start" label="Attendance" />
          <Tab icon={<FeeIcon sx={{ fontSize: 17 }} />} iconPosition="start" label="Fee Collection" />
          <Tab icon={<TimeTableIcon sx={{ fontSize: 17 }} />} iconPosition="start" label="Exam Timetable" />
          <Tab icon={<MarksIcon sx={{ fontSize: 17 }} />} iconPosition="start" label="Marksheet" />
          <Tab icon={<AdmissionIcon sx={{ fontSize: 17 }} />} iconPosition="start" label="Admission Card" />
          <Tab icon={<ReceiptIcon sx={{ fontSize: 17 }} />} iconPosition="start" label="Fee Receipt" />
        </Tabs>

        <Box sx={{ p: 3 }}>
          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              TAB 0 – ATTENDANCE REPORT
           ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          <TabPanel value={tab} index={0}>
            <Paper variant="outlined" sx={{ p: 2.5, mb: 3, borderRadius: 2, bgcolor: '#f5f7fa' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: '#1565c0' }}>
                <FilterIcon sx={{ fontSize: 18, verticalAlign: 'middle', mr: 0.5 }} /> Filter Options
              </Typography>
              <Grid container spacing={2} alignItems="flex-end">
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Class</InputLabel>
                    <Select value={attClass} label="Class" onChange={e => {
                      setAttClass(e.target.value); setAttSection('');
                      loadSections(e.target.value, setAttSections);
                    }}>
                      {classes.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Section</InputLabel>
                    <Select value={attSection} label="Section" onChange={e => setAttSection(e.target.value)}>
                      {attSections.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={2}>
                  <TextField fullWidth size="small" label="From Date" type="date"
                    InputLabelProps={{ shrink: true }} value={attStart}
                    onChange={e => setAttStart(e.target.value)} />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <TextField fullWidth size="small" label="To Date" type="date"
                    InputLabelProps={{ shrink: true }} value={attEnd}
                    onChange={e => setAttEnd(e.target.value)} />
                </Grid>
                <Grid item xs={12} sm={2}>
                  <Button fullWidth variant="contained" onClick={generateAttReport}
                    disabled={attLoading} startIcon={attLoading ? <CircularProgress size={16} color="inherit" /> : <SearchIcon />}>
                    Generate
                  </Button>
                </Grid>
              </Grid>
            </Paper>

            {attData.length > 0 && (
              <>
                {/* Summary Cards */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={6} sm={3}>
                    <StatCard label="Total Students" value={attData.length} color="#1565c0"
                      icon={<SchoolIcon />} />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <StatCard label="Avg Attendance"
                      value={`${Math.round(attData.reduce((a, r) => a + r.pct, 0) / attData.length)}%`}
                      color="#2e7d32" icon={<TrendingIcon />} />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <StatCard label="Defaulters (<75%)"
                      value={attData.filter(r => r.pct < 75).length}
                      color="#d32f2f" icon={<WarningIcon />} />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <StatCard label="Regular (≥75%)"
                      value={attData.filter(r => r.pct >= 75).length}
                      color="#2e7d32" icon={<AttendIcon />} />
                  </Grid>
                </Grid>

                {/* Action Buttons */}
                <Stack direction="row" spacing={1.5} sx={{ mb: 2 }}>
                  <Button variant="contained" color="error" startIcon={<PdfIcon />}
                    onClick={printAttPDF} sx={{ borderRadius: 2 }}>
                    Download PDF
                  </Button>
                  <Button variant="contained" color="success" startIcon={<ExcelIcon />}
                    onClick={exportAttExcel} sx={{ borderRadius: 2 }}>
                    Export Excel
                  </Button>
                  <Tooltip title="Refresh">
                    <IconButton onClick={generateAttReport} color="primary">
                      <RefreshIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>

                {/* Table */}
                <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        {['#', 'Roll No', 'Student Name', 'Total Days', 'Present', 'Absent', 'Late', 'Leave', 'Attendance %'].map(h => (
                          <TableCell key={h} align={['Total Days', 'Present', 'Absent', 'Late', 'Leave', 'Attendance %'].includes(h) ? 'center' : 'left'}
                            sx={{ fontWeight: 700 }}>{h}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {attData.map((r, i) => (
                        <TableRow key={i} hover>
                          <TableCell>{i + 1}</TableCell>
                          <TableCell>{r.rollNo}</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{r.name}</TableCell>
                          <TableCell align="center">{r.total}</TableCell>
                          <TableCell align="center" sx={{ color: '#2e7d32', fontWeight: 600 }}>{r.present}</TableCell>
                          <TableCell align="center" sx={{ color: '#c62828', fontWeight: 600 }}>{r.absent}</TableCell>
                          <TableCell align="center" sx={{ color: '#f57c00' }}>{r.late}</TableCell>
                          <TableCell align="center" sx={{ color: '#1565c0' }}>{r.leave}</TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                              <LinearProgress variant="determinate" value={r.pct}
                                sx={{ width: 50, height: 6, borderRadius: 3,
                                  '& .MuiLinearProgress-bar': { bgcolor: r.pct >= 75 ? '#2e7d32' : '#d32f2f' },
                                  bgcolor: '#e0e0e0' }} />
                              <Chip label={`${r.pct}%`} size="small"
                                color={r.pct >= 75 ? 'success' : 'error'} variant="outlined"
                                sx={{ fontWeight: 700, fontSize: '0.75rem' }} />
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
          </TabPanel>

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              TAB 1 – FEE COLLECTION REPORT
           ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          <TabPanel value={tab} index={1}>
            <Paper variant="outlined" sx={{ p: 2.5, mb: 3, borderRadius: 2, bgcolor: '#f5f7fa' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: '#2e7d32' }}>
                <FilterIcon sx={{ fontSize: 18, verticalAlign: 'middle', mr: 0.5 }} /> Filter Options
              </Typography>
              <Grid container spacing={2} alignItems="flex-end">
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Class</InputLabel>
                    <Select value={feeClass} label="Class" onChange={e => {
                      setFeeClass(e.target.value); setFeeSection('');
                      loadSections(e.target.value, setFeeSections);
                    }}>
                      {classes.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Section (Optional)</InputLabel>
                    <Select value={feeSection} label="Section (Optional)"
                      onChange={e => setFeeSection(e.target.value)}>
                      <MenuItem value="">All Sections</MenuItem>
                      {feeSections.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Button fullWidth variant="contained"
                    sx={{ bgcolor: '#2e7d32', '&:hover': { bgcolor: '#1b5e20' } }}
                    onClick={generateFeeReport} disabled={feeLoading}
                    startIcon={feeLoading ? <CircularProgress size={16} color="inherit" /> : <SearchIcon />}>
                    Generate Report
                  </Button>
                </Grid>
              </Grid>
            </Paper>

            {feeData.length > 0 && (() => {
              const totFee = feeData.reduce((a, r) => a + r.totalFee, 0);
              const totPaid = feeData.reduce((a, r) => a + r.paid, 0);
              const totBal = feeData.reduce((a, r) => a + r.balance, 0);
              const pct = totFee > 0 ? Math.round((totPaid / totFee) * 100) : 0;
              return (
                <>
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={6} sm={3}>
                      <StatCard label="Total Due" value={`₹${(totFee / 1000).toFixed(0)}K`}
                        color="#1565c0" icon={<FeeIcon />} subtitle={`₹${totFee.toLocaleString('en-IN')}`} />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <StatCard label="Collected" value={`₹${(totPaid / 1000).toFixed(0)}K`}
                        color="#2e7d32" icon={<TrendingIcon />} subtitle={`₹${totPaid.toLocaleString('en-IN')}`} />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <StatCard label="Remaining" value={`₹${(totBal / 1000).toFixed(0)}K`}
                        color="#d32f2f" icon={<WarningIcon />} subtitle={`₹${totBal.toLocaleString('en-IN')}`} />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <StatCard label="Collection Rate" value={`${pct}%`}
                        color="#f57c00" icon={<TrendingIcon />}
                        subtitle={`${feeData.filter(r => r.status === 'PAID').length} fully paid`} />
                    </Grid>
                  </Grid>

                  <Stack direction="row" spacing={1.5} sx={{ mb: 2 }}>
                    <Button variant="contained" color="error" startIcon={<PdfIcon />}
                      onClick={printFeePDF} sx={{ borderRadius: 2 }}>Download PDF</Button>
                    <Button variant="contained" color="success" startIcon={<ExcelIcon />}
                      onClick={exportFeeExcel} sx={{ borderRadius: 2 }}>Export Excel</Button>
                  </Stack>

                  <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          {['#', 'Roll No', 'Student Name', 'Class', 'Section', 'Total Fee', 'Paid', 'Balance', 'Status'].map(h => (
                            <TableCell key={h} align={['Total Fee', 'Paid', 'Balance'].includes(h) ? 'right' : 'left'}
                              sx={{ fontWeight: 700 }}>{h}</TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {feeData.map((r, i) => (
                          <TableRow key={i} hover>
                            <TableCell>{i + 1}</TableCell>
                            <TableCell>{r.rollNo}</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>{r.name}</TableCell>
                            <TableCell>{r.className}</TableCell>
                            <TableCell>{r.sectionName}</TableCell>
                            <TableCell align="right">₹{r.totalFee.toLocaleString('en-IN')}</TableCell>
                            <TableCell align="right" sx={{ color: '#2e7d32', fontWeight: 600 }}>₹{r.paid.toLocaleString('en-IN')}</TableCell>
                            <TableCell align="right" sx={{ color: r.balance > 0 ? '#c62828' : '#2e7d32', fontWeight: 600 }}>₹{r.balance.toLocaleString('en-IN')}</TableCell>
                            <TableCell>
                              <Chip label={r.status} size="small"
                                color={r.status === 'PAID' ? 'success' : r.status === 'PARTIAL' ? 'warning' : 'error'}
                                sx={{ fontWeight: 700 }} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              );
            })()}
          </TabPanel>

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              TAB 2 – EXAM TIMETABLE
           ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          <TabPanel value={tab} index={2}>
            <Paper variant="outlined" sx={{ p: 2.5, mb: 3, borderRadius: 2, bgcolor: '#faf5ff' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: '#7b1fa2' }}>
                <TimeTableIcon sx={{ fontSize: 18, verticalAlign: 'middle', mr: 0.5 }} /> Select Examination
              </Typography>
              <Grid container spacing={2} alignItems="flex-end">
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Examination</InputLabel>
                    <Select value={ttExam} label="Examination" onChange={e => {
                      setTtExam(e.target.value); loadTimetable(e.target.value);
                    }}>
                      {examinations.map(e => <MenuItem key={e.id} value={e.id}>{e.name}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Stack direction="row" spacing={1}>
                    <Button variant="contained"
                      sx={{ bgcolor: '#7b1fa2', '&:hover': { bgcolor: '#4a148c' } }}
                      startIcon={<PdfIcon />} onClick={printTimetablePDF}
                      disabled={!ttData.length}>
                      Download PDF / Print
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </Paper>

            {ttLoading && <CircularProgress sx={{ display: 'block', mx: 'auto', my: 4 }} />}
            {!ttLoading && ttData.length > 0 && (
              <>
                <Box sx={{
                  p: 2, mb: 2, borderRadius: 2, textAlign: 'center',
                  background: 'linear-gradient(135deg,#4a148c,#7b1fa2)', color: '#fff',
                }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {examinations.find(e => e.id === +ttExam)?.name} — Examination Timetable
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: .8 }}>
                    {ttData.length} Subject(s) &nbsp;|&nbsp; {fmtDate(ttData[0]?.examDate)} — {fmtDate(ttData[ttData.length - 1]?.examDate)}
                  </Typography>
                </Box>
                <TableContainer component={Paper} sx={{ borderRadius: 2 }}>
                  <Table>
                    <TableHead sx={{ '& th': { bgcolor: '#7b1fa2 !important', color: '#fff !important' } }}>
                      <TableRow>
                        {['#', 'Date', 'Day', 'Subject', 'Start Time', 'End Time', 'Room / Hall', 'Max Marks'].map(h => (
                          <TableCell key={h} sx={{ fontWeight: 700 }}>{h}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {ttData.map((r, i) => (
                        <TableRow key={i} hover>
                          <TableCell>{i + 1}</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>{fmtDate(r.examDate)}</TableCell>
                          <TableCell sx={{ color: '#7b1fa2', fontWeight: 600 }}>
                            {DAYS[new Date(r.examDate).getDay()]}
                          </TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>{r.subject?.name || '-'}</TableCell>
                          <TableCell>{fmtTime(r.startTime)}</TableCell>
                          <TableCell>{fmtTime(r.endTime)}</TableCell>
                          <TableCell>{r.room || '-'}</TableCell>
                          <TableCell>
                            <Chip label={r.maxMarks || '-'} size="small"
                              sx={{ bgcolor: '#f3e5f5', color: '#7b1fa2', fontWeight: 700 }} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
          </TabPanel>

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              TAB 3 – MARKSHEET
           ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          <TabPanel value={tab} index={3}>
            <Paper variant="outlined" sx={{ p: 2.5, mb: 3, borderRadius: 2, bgcolor: '#f5f7fa' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: '#1565c0' }}>
                <FilterIcon sx={{ fontSize: 18, verticalAlign: 'middle', mr: 0.5 }} /> Filter Options
              </Typography>
              <Grid container spacing={2} alignItems="flex-end">
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Examination</InputLabel>
                    <Select value={mkExam} label="Examination" onChange={e => setMkExam(e.target.value)}>
                      {examinations.map(e => <MenuItem key={e.id} value={e.id}>{e.name}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Class</InputLabel>
                    <Select value={mkClass} label="Class" onChange={e => {
                      setMkClass(e.target.value); setMkSection('');
                      loadSections(e.target.value, setMkSections);
                    }}>
                      {classes.map(c => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Section</InputLabel>
                    <Select value={mkSection} label="Section" onChange={e => setMkSection(e.target.value)}>
                      {mkSections.map(s => <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>)}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Button fullWidth variant="contained" onClick={generateMarksheet}
                    disabled={mkLoading}
                    startIcon={mkLoading ? <CircularProgress size={16} color="inherit" /> : <SearchIcon />}>
                    Generate
                  </Button>
                </Grid>
              </Grid>
            </Paper>

            {mkData && (
              <>
                <Grid container spacing={2} sx={{ mb: 3 }}>
                  <Grid item xs={6} sm={3}>
                    <StatCard label="Total Students" value={mkData.rows.length}
                      color="#1565c0" icon={<SchoolIcon />} />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <StatCard label="Pass"
                      value={mkData.rows.filter(r => r.pct >= 33).length}
                      color="#2e7d32" icon={<AttendIcon />} />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <StatCard label="Fail"
                      value={mkData.rows.filter(r => r.pct < 33).length}
                      color="#d32f2f" icon={<WarningIcon />} />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <StatCard label="Class Average"
                      value={`${mkData.rows.length ? Math.round(mkData.rows.reduce((a, r) => a + r.pct, 0) / mkData.rows.length) : 0}%`}
                      color="#f57c00" icon={<TrendingIcon />} />
                  </Grid>
                </Grid>

                <Stack direction="row" spacing={1.5} sx={{ mb: 2 }}>
                  <Button variant="contained" color="error" startIcon={<PdfIcon />}
                    onClick={printMarksheetPDF} sx={{ borderRadius: 2 }}>Download PDF</Button>
                  <Button variant="contained" color="success" startIcon={<ExcelIcon />}
                    onClick={exportMarksExcel} sx={{ borderRadius: 2 }}>Export Excel</Button>
                </Stack>

                <TableContainer component={Paper} sx={{ borderRadius: 2, overflowX: 'auto' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 700 }}>Rank</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Roll No</TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>Student Name</TableCell>
                        {mkData.subjects.map(s => (
                          <TableCell key={s} align="center" sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}>{s}</TableCell>
                        ))}
                        <TableCell align="center" sx={{ fontWeight: 700 }}>Total</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700 }}>%</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700 }}>Grade</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {mkData.rows.map((r, i) => {
                        const g = r.grade;
                        return (
                          <TableRow key={i} hover>
                            <TableCell>
                              <Chip label={`#${r.rank}`} size="small"
                                sx={{ bgcolor: r.rank <= 3 ? '#fff3e0' : '#f5f7fa',
                                  color: r.rank <= 3 ? '#f57c00' : '#666', fontWeight: 700 }} />
                            </TableCell>
                            <TableCell>{r.rollNo}</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>{r.name}</TableCell>
                            {mkData.subjects.map(s => (
                              <TableCell key={s} align="center">{r.subMarks[s] ?? '-'}</TableCell>
                            ))}
                            <TableCell align="center" sx={{ fontWeight: 700 }}>{r.totObt}/{r.totMax}</TableCell>
                            <TableCell align="center">
                              <LinearProgress variant="determinate" value={r.pct}
                                sx={{ mb: 0.5, height: 5, borderRadius: 3,
                                  '& .MuiLinearProgress-bar': { bgcolor: g.color }, bgcolor: '#e0e0e0' }} />
                              <Typography variant="caption" sx={{ fontWeight: 700 }}>{r.pct}%</Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Chip label={g.label} size="small"
                                sx={{ bgcolor: `${g.color}18`, color: g.color, fontWeight: 800, fontSize: '0.8rem' }} />
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

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              TAB 4 – ADMISSION CARD
           ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          <TabPanel value={tab} index={4}>
            <Paper variant="outlined" sx={{ p: 2.5, mb: 3, borderRadius: 2, bgcolor: '#f5f7fa' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: '#1565c0' }}>
                <AdmissionIcon sx={{ fontSize: 18, verticalAlign: 'middle', mr: 0.5 }} /> Select Student
              </Typography>
              <Grid container spacing={2} alignItems="flex-end">
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Student</InputLabel>
                    <Select value={adStudent} label="Student" onChange={e => setAdStudent(e.target.value)}>
                      {allStudents.map(s => (
                        <MenuItem key={s.id} value={s.id}>
                          {s.name || s.fullName} — {s.schoolClass?.name} {s.section?.name} (Roll: {s.rollNumber || s.id})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Stack direction="row" spacing={1}>
                    <Button variant="contained" onClick={loadAdmissionCard}
                      disabled={adLoading}
                      startIcon={adLoading ? <CircularProgress size={16} color="inherit" /> : <SearchIcon />}>
                      Load Card
                    </Button>
                    {adData && (
                      <Button variant="contained" color="error" startIcon={<PdfIcon />}
                        onClick={printAdmissionCard}>
                        Download PDF / Print
                      </Button>
                    )}
                  </Stack>
                </Grid>
              </Grid>
            </Paper>

            {adData && (() => {
              const s = adData.student;
              const p = adData.parent;
              return (
                <Box sx={{ maxWidth: 680, mx: 'auto' }}>
                  <Card sx={{
                    border: '2px solid #1565c0', borderRadius: 3, overflow: 'hidden',
                    boxShadow: '0 8px 32px rgba(21,101,192,.2)',
                  }}>
                    {/* Card Header */}
                    <Box sx={{
                      background: 'linear-gradient(135deg,#1a237e,#1565c0)',
                      p: 3, color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                    }}>
                      <Box>
                        <Typography variant="h5" sx={{ fontWeight: 800 }}>{SCHOOL_INFO.name}</Typography>
                        <Typography variant="caption" sx={{ opacity: .8 }}>{SCHOOL_INFO.address}</Typography>
                        <Box sx={{
                          mt: 1.5, display: 'inline-block', px: 2, py: 0.5,
                          bgcolor: 'rgba(255,255,255,.15)', borderRadius: 10, fontSize: '0.8rem', fontWeight: 600,
                        }}>
                          STUDENT ADMISSION CARD
                        </Box>
                      </Box>
                      <Box sx={{
                        width: 80, height: 100, bgcolor: 'rgba(255,255,255,.2)', borderRadius: 2,
                        border: '2px dashed rgba(255,255,255,.5)', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', flexDirection: 'column', gap: 0.5,
                      }}>
                        <AdmissionIcon sx={{ fontSize: 32, opacity: .6 }} />
                        <Typography variant="caption" sx={{ opacity: .7, fontSize: '0.65rem' }}>Photo</Typography>
                      </Box>
                    </Box>
                    <CardContent sx={{ p: 3 }}>
                      <Grid container spacing={2}>
                        {[
                          { label: 'Full Name', value: s.name || s.fullName, color: '#1a237e' },
                          { label: 'Admission No.', value: s.admissionNumber || s.id, color: '#7b1fa2' },
                          { label: 'Class & Section', value: `${s.schoolClass?.name || 'N/A'} — ${s.section?.name || 'N/A'}`, color: '#2e7d32' },
                          { label: 'Roll Number', value: s.rollNumber || 'N/A', color: '#f57c00' },
                          { label: 'Date of Birth', value: fmtDate(s.dateOfBirth), color: '#1565c0' },
                          { label: 'Gender', value: s.gender || 'N/A', color: '#1565c0' },
                        ].map(({ label, value, color }) => (
                          <Grid item xs={12} sm={6} key={label}>
                            <Box sx={{ p: 1.5, bgcolor: '#f5f7fa', borderRadius: 2, borderLeft: `3px solid ${color}` }}>
                              <Typography variant="caption" sx={{ color: '#888', textTransform: 'uppercase', fontWeight: 600, fontSize: '0.65rem' }}>{label}</Typography>
                              <Typography variant="body1" sx={{ fontWeight: 700, color, mt: 0.3 }}>{value}</Typography>
                            </Box>
                          </Grid>
                        ))}
                        <Grid item xs={12}>
                          <Box sx={{ p: 1.5, bgcolor: '#f5f7fa', borderRadius: 2, borderLeft: '3px solid #c62828' }}>
                            <Typography variant="caption" sx={{ color: '#888', textTransform: 'uppercase', fontWeight: 600, fontSize: '0.65rem' }}>Address</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.3 }}>{s.address || 'N/A'}</Typography>
                          </Box>
                        </Grid>
                      </Grid>

                      {p && (
                        <Box sx={{ mt: 2, p: 2, bgcolor: '#e8f5e9', borderRadius: 2, border: '1px solid #a5d6a7' }}>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: '#2e7d32', textTransform: 'uppercase' }}>Parent / Guardian Details</Typography>
                          <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
                            <Grid item xs={4}><Typography variant="body2"><strong>Name:</strong> {p.fatherName || p.name || 'N/A'}</Typography></Grid>
                            <Grid item xs={4}><Typography variant="body2"><strong>Phone:</strong> {p.phone || p.mobileNumber || 'N/A'}</Typography></Grid>
                            <Grid item xs={4}><Typography variant="body2"><strong>Email:</strong> {p.email || 'N/A'}</Typography></Grid>
                          </Grid>
                        </Box>
                      )}

                      <Divider sx={{ my: 2.5 }} />
                      <Stack direction="row" justifyContent="space-between" sx={{ mt: 1 }}>
                        {['Student Signature', 'Principal Signature'].map(lbl => (
                          <Box key={lbl} sx={{ textAlign: 'center', width: 150 }}>
                            <Box sx={{ borderTop: '1px solid #333', mb: 0.5, mt: 4 }} />
                            <Typography variant="caption" color="text.secondary">{lbl}</Typography>
                          </Box>
                        ))}
                      </Stack>
                    </CardContent>
                    <Box sx={{ bgcolor: '#1a237e', p: 1, textAlign: 'center' }}>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,.7)' }}>
                        Issued: {new Date().toLocaleDateString('en-IN')} &nbsp;|&nbsp; {SCHOOL_INFO.name} &nbsp;|&nbsp; {SCHOOL_INFO.phone}
                      </Typography>
                    </Box>
                  </Card>
                </Box>
              );
            })()}
          </TabPanel>

          {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
              TAB 5 – FEE RECEIPT
           ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
          <TabPanel value={tab} index={5}>
            <Paper variant="outlined" sx={{ p: 2.5, mb: 3, borderRadius: 2, bgcolor: '#f5f7fa' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: '#1565c0' }}>
                <ReceiptIcon sx={{ fontSize: 18, verticalAlign: 'middle', mr: 0.5 }} /> Select Student &amp; Payment
              </Typography>
              <Grid container spacing={2} alignItems="flex-end">
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Student</InputLabel>
                    <Select value={rcStudent} label="Student" onChange={e => {
                      setRcStudent(e.target.value); setRcPayment(''); setRcData(null);
                      loadStudentPayments(e.target.value);
                    }}>
                      {allStudents.map(s => (
                        <MenuItem key={s.id} value={s.id}>
                          {s.name || s.fullName} — {s.schoolClass?.name} {s.section?.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Payment</InputLabel>
                    <Select value={rcPayment} label="Payment" onChange={e => setRcPayment(e.target.value)}>
                      {rcPayments.map(p => (
                        <MenuItem key={p.id} value={p.id}>
                          {p.receiptNumber || `Receipt #${p.id}`} — ₹{(p.amount || 0).toLocaleString('en-IN')} ({fmtDate(p.paymentDate)})
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Button fullWidth variant="contained"
                    startIcon={<PrintIcon />}
                    onClick={printFeeReceipt}
                    disabled={!rcPayment}
                    sx={{ bgcolor: '#1565c0' }}>
                    Print Receipt
                  </Button>
                </Grid>
              </Grid>
            </Paper>

            {rcLoading && <CircularProgress sx={{ display: 'block', mx: 'auto', my: 4 }} />}

            {rcPayment && (() => {
              const pay = rcPayments.find(p => p.id === +rcPayment);
              const student = allStudents.find(s => s.id === +rcStudent);
              if (!pay) return null;
              return (
                <Box sx={{ maxWidth: 620, mx: 'auto' }}>
                  <Card sx={{
                    border: '1px solid #e0e0e0', borderRadius: 3, overflow: 'hidden',
                    boxShadow: '0 8px 32px rgba(0,0,0,.1)',
                  }}>
                    {/* Receipt Header */}
                    <Box sx={{
                      background: 'linear-gradient(135deg,#1a237e,#1565c0)',
                      p: 2.5, color: '#fff', display: 'flex', justifyContent: 'space-between',
                    }}>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>{SCHOOL_INFO.name}</Typography>
                        <Typography variant="caption" sx={{ opacity: .8 }}>{SCHOOL_INFO.address}</Typography>
                        <br />
                        <Typography variant="caption" sx={{ opacity: .8 }}>{SCHOOL_INFO.phone} | {SCHOOL_INFO.email}</Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Box sx={{ bgcolor: 'rgba(255,255,255,.15)', px: 2, py: 0.5, borderRadius: 1, fontWeight: 700, fontSize: '0.9rem' }}>
                          FEE RECEIPT
                        </Box>
                        <Typography variant="body2" sx={{ mt: 1, opacity: .9 }}>
                          Receipt No: <strong>{pay.receiptNumber || `RCP-${pay.id}`}</strong>
                        </Typography>
                        <Typography variant="body2" sx={{ opacity: .9 }}>
                          Date: <strong>{fmtDate(pay.paymentDate)}</strong>
                        </Typography>
                      </Box>
                    </Box>

                    <CardContent sx={{ p: 3 }}>
                      {/* Student Info */}
                      <Box sx={{ p: 2, bgcolor: '#e3f2fd', borderRadius: 2, mb: 2.5, border: '1px solid #bbdefb' }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#1565c0', textTransform: 'uppercase' }}>
                          Student Details
                        </Typography>
                        <Grid container spacing={1.5} sx={{ mt: 0.5 }}>
                          <Grid item xs={6}>
                            <Typography variant="body2"><strong>Name:</strong> {student?.name || student?.fullName || 'N/A'}</Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2"><strong>Adm No:</strong> {student?.admissionNumber || student?.id || 'N/A'}</Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2"><strong>Class:</strong> {student?.schoolClass?.name || 'N/A'}</Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="body2"><strong>Section:</strong> {student?.section?.name || 'N/A'}</Typography>
                          </Grid>
                        </Grid>
                      </Box>

                      {/* Payment Details */}
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#666', textTransform: 'uppercase' }}>
                        Payment Details
                      </Typography>
                      <Divider sx={{ my: 1 }} />
                      {[
                        { label: 'Payment Mode', value: pay.paymentMode || 'Cash' },
                        { label: 'Payment Date', value: fmtDate(pay.paymentDate) },
                        { label: 'Fee Type', value: pay.feeStructure?.feeType || pay.feeType || 'School Fee' },
                        { label: 'Academic Year', value: pay.feeStructure?.academicYear?.year || new Date().getFullYear() },
                        ...(pay.remarks ? [{ label: 'Remarks', value: pay.remarks }] : []),
                      ].map(({ label, value }) => (
                        <Box key={label} sx={{
                          display: 'flex', justifyContent: 'space-between', py: 0.8,
                          borderBottom: '1px dashed #eee',
                        }}>
                          <Typography variant="body2" color="text.secondary">{label}</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{value}</Typography>
                        </Box>
                      ))}

                      {/* Total */}
                      <Box sx={{
                        mt: 2, p: 2, background: 'linear-gradient(135deg,#1a237e,#1565c0)',
                        borderRadius: 2, display: 'flex', justifyContent: 'space-between',
                        color: '#fff', alignItems: 'center',
                      }}>
                        <Typography sx={{ fontWeight: 600 }}>Amount Received</Typography>
                        <Typography variant="h5" sx={{ fontWeight: 800 }}>
                          ₹ {(pay.amount || 0).toLocaleString('en-IN')}
                        </Typography>
                      </Box>

                      <Box sx={{ mt: 1.5, p: 1.5, bgcolor: '#e8f5e9', borderRadius: 1.5, textAlign: 'center' }}>
                        <Typography variant="body2" sx={{ color: '#2e7d32', fontWeight: 600 }}>
                          ✓ Payment Successfully Received
                        </Typography>
                      </Box>

                      <Divider sx={{ my: 2.5 }} />
                      <Stack direction="row" justifyContent="space-between">
                        {['Parent / Student', 'Cashier / Accountant'].map(lbl => (
                          <Box key={lbl} sx={{ textAlign: 'center', width: 160 }}>
                            <Box sx={{ borderTop: '1px solid #333', mb: 0.5, mt: 4 }} />
                            <Typography variant="caption" color="text.secondary">{lbl}</Typography>
                          </Box>
                        ))}
                      </Stack>

                      <Box sx={{ mt: 2, p: 1.5, bgcolor: '#fff3e0', borderRadius: 1.5, border: '1px solid #ffe0b2' }}>
                        <Typography variant="caption" sx={{ color: '#e65100', fontWeight: 500 }}>
                          <strong>Note:</strong> This is a computer-generated receipt. Please keep it for future reference.
                        </Typography>
                      </Box>
                    </CardContent>

                    <Box sx={{ bgcolor: '#1a237e', p: 1, textAlign: 'center' }}>
                      <Typography variant="caption" sx={{ color: 'rgba(255,255,255,.7)' }}>
                        {SCHOOL_INFO.name} &nbsp;|&nbsp; {SCHOOL_INFO.phone} &nbsp;|&nbsp; {SCHOOL_INFO.email}
                      </Typography>
                    </Box>
                  </Card>
                </Box>
              );
            })()}
          </TabPanel>
        </Box>
      </Paper>
    </Box>
  );
}
