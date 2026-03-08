import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { keyframes } from '@mui/system';
import {
  Grid, Paper, Typography, Box, Card, CardContent,
  List, ListItem, ListItemIcon, ListItemText, Avatar,
  Chip, LinearProgress, CircularProgress, Divider, Button,
} from '@mui/material';
import {
  People as PeopleIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  AttachMoney as MoneyIcon,
  School as SchoolIcon,
  Assignment as AssignmentIcon,
  Notifications as NotificationsIcon,
  Book as BookIcon,
  TrendingUp as TrendingUpIcon,
  CalendarToday as CalendarIcon,
  Warning as WarningIcon,
  Star as StarIcon,
  AccessTime as TimeIcon,
  ArrowForward as ArrowIcon,
} from '@mui/icons-material';
import { studentAPI, teacherAPI, attendanceAPI, feeAPI } from '../services/api';

// ─── Animations ───────────────────────────────────────────────────────────────
const fadeSlideUp = keyframes`
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
`;
const fadeSlideRight = keyframes`
  from { opacity: 0; transform: translateX(-20px); }
  to   { opacity: 1; transform: translateX(0); }
`;
const pulseGlow = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(255,255,255,0.15); }
  50%       { box-shadow: 0 0 0 8px rgba(255,255,255,0); }
`;
const countUp = keyframes`
  from { opacity: 0; transform: scale(0.7); }
  to   { opacity: 1; transform: scale(1); }
`;

// ─── Count-up hook ────────────────────────────────────────────────────────────
function useCountUp(target, duration = 1400) {
  const [count, setCount] = useState(0);
  const timer = useRef(null);
  useEffect(() => {
    if (target === 0) { setCount(0); return; }
    let start = 0;
    const step = target / (duration / 16);
    clearInterval(timer.current);
    timer.current = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer.current); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer.current);
  }, [target, duration]);
  return count;
}

// ─── SVG Donut Chart ──────────────────────────────────────────────────────────
function DonutChart({ value, max, color, bg = '#f0f0f0', size = 90, label }) {
  const r = 32, circ = 2 * Math.PI * r;
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const [animated, setAnimated] = useState(false);
  useEffect(() => { const t = setTimeout(() => setAnimated(true), 400); return () => clearTimeout(t); }, []);
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width={size} height={size} viewBox="0 0 72 72">
        <circle cx="36" cy="36" r={r} fill="none" stroke={bg} strokeWidth="8" />
        <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="8"
          strokeDasharray={circ}
          strokeDashoffset={animated ? circ * (1 - pct / 100) : circ}
          strokeLinecap="round"
          transform="rotate(-90 36 36)"
          style={{ transition: 'stroke-dashoffset 1.3s cubic-bezier(0.4,0,0.2,1)' }}
        />
        <text x="36" y="40" textAnchor="middle" fontSize="13" fontWeight="800" fill={color}>
          {Math.round(pct)}%
        </text>
      </svg>
      {label && <Typography variant="caption" sx={{ mt: 0.5, fontWeight: 600, color: '#666', textAlign: 'center' }}>{label}</Typography>}
    </Box>
  );
}

// ─── Animated Progress Bar ────────────────────────────────────────────────────
function AnimatedBar({ value, color, animated }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (animated) { const t = setTimeout(() => setVal(value), 200); return () => clearTimeout(t); }
  }, [animated, value]);
  return (
    <LinearProgress
      variant="determinate"
      value={val}
      sx={{
        height: 10, borderRadius: 5, bgcolor: '#e8eaf6',
        '& .MuiLinearProgress-bar': {
          background: color,
          borderRadius: 5,
          transition: 'transform 1.2s cubic-bezier(0.4,0,0.2,1)',
        },
      }}
    />
  );
}

// ─── Stat Card with count-up ──────────────────────────────────────────────────
function AnimStatCard({ title, rawValue, icon: Icon, gradient, subtitle, onClick, prefix = '', suffix = '', delay = 0 }) {
  const count = useCountUp(typeof rawValue === 'number' ? rawValue : 0);
  const display = typeof rawValue === 'number'
    ? `${prefix}${count.toLocaleString('en-IN')}${suffix}`
    : rawValue;
  return (
    <Card
      onClick={onClick}
      sx={{
        background: gradient, color: 'white', borderRadius: 3,
        cursor: onClick ? 'pointer' : 'default',
        animation: `${fadeSlideUp} 0.55s ease-out ${delay}s both`,
        transition: 'transform 0.25s, box-shadow 0.25s',
        position: 'relative', overflow: 'hidden',
        '&:hover': onClick ? {
          transform: 'translateY(-6px)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.25)',
        } : {},
        '&::after': {
          content: '""', position: 'absolute',
          top: -30, right: -30, width: 100, height: 100,
          borderRadius: '50%', background: 'rgba(255,255,255,0.07)',
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="body2" sx={{ opacity: 0.85, mb: 0.5, fontWeight: 500, fontSize: 13 }}>
              {title}
            </Typography>
            <Typography
              variant="h3"
              sx={{ fontWeight: 800, mb: 0.5, letterSpacing: -1, animation: `${countUp} 0.5s ease-out ${delay + 0.3}s both` }}
            >
              {display}
            </Typography>
            {subtitle && <Typography variant="caption" sx={{ opacity: 0.78, fontSize: 11 }}>{subtitle}</Typography>}
          </Box>
          <Box sx={{
            p: 1.5, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.18)',
            backdropFilter: 'blur(10px)',
            animation: `${pulseGlow} 3s ease-in-out infinite`,
          }}>
            <Icon sx={{ fontSize: 34 }} />
          </Box>
        </Box>
        {onClick && (
          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 0.5, opacity: 0.75 }}>
            <Typography variant="caption" sx={{ fontWeight: 600 }}>View details</Typography>
            <ArrowIcon sx={{ fontSize: 12 }} />
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalStudents: 0, totalTeachers: 0, todayAttendance: 0,
    totalPresent: 0, totalAbsent: 0, monthlyFeeCollection: 0,
  });
  const [loaded, setLoaded] = useState(false);
  const [progressAnimated, setProgressAnimated] = useState(false);

  useEffect(() => { loadDashboardData(); }, []);
  useEffect(() => {
    if (loaded) { const t = setTimeout(() => setProgressAnimated(true), 600); return () => clearTimeout(t); }
  }, [loaded]);

  const loadDashboardData = async () => {
    try {
      const [students, teachers, attendance, payments] = await Promise.all([
        studentAPI.getAll(),
        teacherAPI.getAll(),
        attendanceAPI.getTodayStats(),
        feeAPI.getAllPayments().catch(() => ({ data: [] })),
      ]);
      const pct = attendance.data.total > 0
        ? Math.round((attendance.data.present / attendance.data.total) * 100) : 0;
      const totalCollection = payments.data.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);
      setStats({
        totalStudents: students.data.length,
        totalTeachers: teachers.data.length,
        todayAttendance: pct,
        totalPresent: attendance.data.present || 0,
        totalAbsent: attendance.data.absent || 0,
        monthlyFeeCollection: totalCollection,
      });
    } catch (e) { console.error(e); }
    setLoaded(true);
  };

  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const quickActions = [
    { title: 'Mark Attendance', icon: CheckCircleIcon, path: '/attendance', color: '#ff9800', bg: '#fff3e0' },
    { title: 'Record Payment', icon: MoneyIcon, path: '/fees', color: '#4caf50', bg: '#e8f5e9' },
    { title: 'Add Student', icon: PeopleIcon, path: '/students', color: '#2196f3', bg: '#e3f2fd' },
    { title: 'Create Notice', icon: NotificationsIcon, path: '/notices', color: '#9c27b0', bg: '#f3e5f5' },
  ];

  const menuCards = [
    { title: 'Students', subtitle: 'Manage records', icon: PeopleIcon, path: '/students', gradient: 'linear-gradient(135deg,#1565c0,#1e88e5)' },
    { title: 'Teachers', subtitle: 'Teaching staff', icon: PersonIcon, path: '/teachers', gradient: 'linear-gradient(135deg,#2e7d32,#43a047)' },
    { title: 'Attendance', subtitle: 'Daily tracking', icon: CheckCircleIcon, path: '/attendance', gradient: 'linear-gradient(135deg,#e65100,#fb8c00)' },
    { title: 'Fees', subtitle: 'Collection & reports', icon: MoneyIcon, path: '/fees', gradient: 'linear-gradient(135deg,#6a1b9a,#ab47bc)' },
    { title: 'Examinations', subtitle: 'Exams & results', icon: AssignmentIcon, path: '/examinations', gradient: 'linear-gradient(135deg,#b71c1c,#e53935)' },
    { title: 'Homework', subtitle: 'Assignments', icon: BookIcon, path: '/homework', gradient: 'linear-gradient(135deg,#0277bd,#039be5)' },
    { title: 'Notices', subtitle: 'Announcements', icon: NotificationsIcon, path: '/notices', gradient: 'linear-gradient(135deg,#37474f,#546e7a)' },
    { title: 'Reports', subtitle: 'Analytics & PDF', icon: TrendingUpIcon, path: '/reports', gradient: 'linear-gradient(135deg,#00695c,#00897b)' },
  ];

  return (
    <Box>
      {/* ── School Banner ─────────────────────────────────────────────── */}
      <Paper
        sx={{
          mb: 3, borderRadius: 3, overflow: 'hidden',
          background: 'linear-gradient(135deg, #1b5e20 0%, #1565c0 100%)',
          animation: `${fadeSlideRight} 0.5s ease-out`,
        }}
      >
        <Box sx={{ p: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ p: 1.5, bgcolor: 'rgba(255,255,255,0.15)', borderRadius: 2 }}>
              <SchoolIcon sx={{ fontSize: 36, color: '#fff' }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ color: '#fff', fontWeight: 800, lineHeight: 1.2 }}>
                Sirigannada Pri-Primary & Higher Primary School
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.75)', mt: 0.5, display: 'block' }}>
                School Management System — Admin Dashboard
              </Typography>
            </Box>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Chip
              icon={<CalendarIcon sx={{ fontSize: 14, color: '#fff !important' }} />}
              label={today}
              sx={{ bgcolor: 'rgba(255,255,255,0.15)', color: '#fff', fontWeight: 600, fontSize: 12, backdropFilter: 'blur(8px)' }}
            />
            {stats.todayAttendance < 75 && (
              <Chip
                icon={<WarningIcon sx={{ fontSize: 14, color: '#fff !important' }} />}
                label="Low Attendance Today"
                sx={{ bgcolor: 'rgba(239,83,80,0.7)', color: '#fff', fontWeight: 600, fontSize: 11, mt: 0.5, display: 'block' }}
              />
            )}
          </Box>
        </Box>
        {!loaded && <LinearProgress sx={{ height: 3 }} />}
      </Paper>

      {/* ── Animated Stat Cards ───────────────────────────────────────── */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <AnimStatCard
            title="Total Students" rawValue={stats.totalStudents} icon={PeopleIcon}
            gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            subtitle="Enrolled students" delay={0}
            onClick={() => navigate('/students')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <AnimStatCard
            title="Total Teachers" rawValue={stats.totalTeachers} icon={PersonIcon}
            gradient="linear-gradient(135deg, #11998e 0%, #38ef7d 100%)"
            subtitle="Teaching staff" delay={0.1}
            onClick={() => navigate('/teachers')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <AnimStatCard
            title="Today's Attendance" rawValue={stats.todayAttendance} icon={CheckCircleIcon}
            gradient={stats.todayAttendance >= 75
              ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
              : 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)'}
            subtitle={`${stats.totalPresent} present · ${stats.totalAbsent} absent`}
            suffix="%" delay={0.2}
            onClick={() => navigate('/attendance')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <AnimStatCard
            title="Fee Collection" rawValue={Math.round(stats.monthlyFeeCollection)} icon={MoneyIcon}
            gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
            subtitle="Total collected (all time)" delay={0.3} prefix="₹"
            onClick={() => navigate('/fees')}
          />
        </Grid>
      </Grid>

      {/* ── Middle Row ────────────────────────────────────────────────── */}
      <Grid container spacing={3} sx={{ mb: 4 }}>

        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 3, height: '100%', animation: `${fadeSlideUp} 0.55s ease-out 0.35s both` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5 }}>
              <Avatar sx={{ bgcolor: '#e8eaf6', mr: 1.5, width: 36, height: 36 }}>
                <TrendingUpIcon sx={{ color: '#3949ab', fontSize: 20 }} />
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a237e' }}>Quick Actions</Typography>
            </Box>
            <Grid container spacing={1.5}>
              {quickActions.map((action, i) => (
                <Grid item xs={6} key={action.title}>
                  <Card
                    onClick={() => navigate(action.path)}
                    sx={{
                      p: 2, cursor: 'pointer', textAlign: 'center',
                      border: `1.5px solid ${action.color}30`,
                      boxShadow: 'none', borderRadius: 2.5,
                      animation: `${fadeSlideUp} 0.4s ease-out ${0.4 + i * 0.08}s both`,
                      transition: 'all 0.22s',
                      '&:hover': {
                        borderColor: action.color,
                        transform: 'translateY(-3px)',
                        boxShadow: `0 6px 20px ${action.color}30`,
                        bgcolor: action.bg,
                      },
                    }}
                  >
                    <Avatar sx={{ bgcolor: action.bg, color: action.color, mx: 'auto', mb: 1, width: 44, height: 44 }}>
                      <action.icon />
                    </Avatar>
                    <Typography variant="caption" sx={{ fontWeight: 600, fontSize: 11 }}>{action.title}</Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Attendance + Fee Donuts */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 3, height: '100%', animation: `${fadeSlideUp} 0.55s ease-out 0.45s both` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: '#e8f5e9', mr: 1.5, width: 36, height: 36 }}>
                <StarIcon sx={{ color: '#2e7d32', fontSize: 20 }} />
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a237e' }}>Today at a Glance</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', py: 1 }}>
              <DonutChart value={stats.totalPresent} max={stats.totalPresent + stats.totalAbsent} color="#4caf50" bg="#e8f5e9" label="Attendance" />
              <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
              <DonutChart value={stats.monthlyFeeCollection} max={stats.monthlyFeeCollection + 1} color="#1565c0" bg="#e3f2fd" label="Fee Status" />
            </Box>
            <Divider sx={{ my: 2 }} />
            <List disablePadding dense>
              <ListItem sx={{ px: 0, py: 0.8 }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <Avatar sx={{ bgcolor: '#e8f5e9', width: 30, height: 30 }}>
                    <PeopleIcon sx={{ color: '#2e7d32', fontSize: 16 }} />
                  </Avatar>
                </ListItemIcon>
                <ListItemText primary="Present" secondary={`${stats.totalPresent} students`} primaryTypographyProps={{ fontSize: 13, fontWeight: 600 }} />
                <Chip label={`${stats.todayAttendance}%`} size="small" color={stats.todayAttendance >= 75 ? 'success' : 'warning'} />
              </ListItem>
              <ListItem sx={{ px: 0, py: 0.8 }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <Avatar sx={{ bgcolor: '#ffebee', width: 30, height: 30 }}>
                    <PersonIcon sx={{ color: '#c62828', fontSize: 16 }} />
                  </Avatar>
                </ListItemIcon>
                <ListItemText primary="Absent" secondary="Requires attention" primaryTypographyProps={{ fontSize: 13, fontWeight: 600 }} />
                <Chip label={stats.totalAbsent} size="small" color="error" variant="outlined" />
              </ListItem>
              <ListItem sx={{ px: 0, py: 0.8 }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <Avatar sx={{ bgcolor: '#e3f2fd', width: 30, height: 30 }}>
                    <MoneyIcon sx={{ color: '#1565c0', fontSize: 16 }} />
                  </Avatar>
                </ListItemIcon>
                <ListItemText primary="Fee Collected" secondary="All time total" primaryTypographyProps={{ fontSize: 13, fontWeight: 600 }} />
                <Chip label={`₹${Math.round(stats.monthlyFeeCollection).toLocaleString('en-IN')}`} size="small" color="primary" variant="outlined" />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* Animated capacity bars */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 3, height: '100%', animation: `${fadeSlideUp} 0.55s ease-out 0.5s both` }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5 }}>
              <Avatar sx={{ bgcolor: '#fce4ec', mr: 1.5, width: 36, height: 36 }}>
                <SchoolIcon sx={{ color: '#c62828', fontSize: 20 }} />
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a237e' }}>School Capacity</Typography>
            </Box>

            {[
              { label: 'Student Capacity', value: stats.totalStudents, max: 500, color: 'linear-gradient(90deg,#667eea,#764ba2)' },
              { label: 'Teacher Capacity', value: stats.totalTeachers, max: 50, color: 'linear-gradient(90deg,#11998e,#38ef7d)' },
              { label: 'Attendance Rate', value: stats.todayAttendance, max: 100, color: stats.todayAttendance >= 75 ? 'linear-gradient(90deg,#4caf50,#8bc34a)' : 'linear-gradient(90deg,#ff9800,#ffc107)', suffix: '%' },
            ].map((item, i) => (
              <Box key={item.label} sx={{ mb: 2.5, animation: `${fadeSlideUp} 0.4s ease-out ${0.6 + i * 0.1}s both` }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" color="text.secondary" fontWeight={500}>{item.label}</Typography>
                  <Typography variant="body2" fontWeight={700} color="#1a237e">
                    {item.value}{item.suffix || ''} / {item.max}{item.suffix || ''}
                  </Typography>
                </Box>
                <AnimatedBar value={(item.value / item.max) * 100} color={item.color} animated={progressAnimated} />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  {Math.round((item.value / item.max) * 100)}% utilized
                </Typography>
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>

      {/* ── Module Cards ──────────────────────────────────────────────── */}
      <Box sx={{ animation: `${fadeSlideUp} 0.55s ease-out 0.6s both` }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5, gap: 1 }}>
          <Box sx={{ width: 4, height: 22, borderRadius: 2, background: 'linear-gradient(#1b5e20,#1565c0)' }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a237e' }}>Modules</Typography>
        </Box>
        <Grid container spacing={2}>
          {menuCards.map((card, i) => (
            <Grid item xs={6} sm={3} md={3} key={card.title}>
              <Card
                onClick={() => navigate(card.path)}
                sx={{
                  cursor: 'pointer', textAlign: 'center', p: 2.5,
                  borderRadius: 3, border: '1px solid #e0e0e0',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  animation: `${fadeSlideUp} 0.4s ease-out ${0.65 + i * 0.06}s both`,
                  transition: 'all 0.25s',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
                    borderColor: 'transparent',
                  },
                }}
              >
                <Avatar
                  sx={{
                    background: card.gradient, mx: 'auto', mb: 1.5,
                    width: 52, height: 52, boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
                  }}
                >
                  <card.icon sx={{ fontSize: 26 }} />
                </Avatar>
                <Typography variant="body1" sx={{ fontWeight: 700, mb: 0.3, fontSize: 13 }}>{card.title}</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: 11 }}>{card.subtitle}</Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
}
