import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Chip,
  LinearProgress,
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
} from '@mui/icons-material';
import { studentAPI, teacherAPI, attendanceAPI, feeAPI } from '../services/api';

function StatCard({ title, value, icon: Icon, gradient, subtitle, onClick }) {
  return (
    <Card
      onClick={onClick}
      sx={{
        background: gradient,
        color: 'white',
        borderRadius: 3,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': onClick ? {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.2)',
        } : {},
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="body2" sx={{ opacity: 0.9, mb: 0.5, fontWeight: 500 }}>
              {title}
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 700, mb: 0.5 }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              bgcolor: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)',
            }}
          >
            <Icon sx={{ fontSize: 32 }} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    todayAttendance: 0,
    totalPresent: 0,
    totalAbsent: 0,
    monthlyFeeCollection: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [students, teachers, attendance, payments] = await Promise.all([
        studentAPI.getAll(),
        teacherAPI.getAll(),
        attendanceAPI.getTodayStats(),
        feeAPI.getAllPayments().catch(() => ({ data: [] })),
      ]);

      const attendancePercent =
        attendance.data.total > 0
          ? Math.round((attendance.data.present / attendance.data.total) * 100)
          : 0;

      const totalCollection = payments.data.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

      setStats({
        totalStudents: students.data.length,
        totalTeachers: teachers.data.length,
        todayAttendance: attendancePercent,
        totalPresent: attendance.data.present || 0,
        totalAbsent: attendance.data.absent || 0,
        monthlyFeeCollection: totalCollection,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
    setLoading(false);
  };

  const quickActions = [
    { title: 'Mark Attendance', icon: CheckCircleIcon, path: '/attendance', color: '#ff9800' },
    { title: 'Record Payment', icon: MoneyIcon, path: '/fees', color: '#4caf50' },
    { title: 'Add Student', icon: PeopleIcon, path: '/students', color: '#2196f3' },
    { title: 'Create Notice', icon: NotificationsIcon, path: '/notices', color: '#9c27b0' },
  ];

  const menuCards = [
    { title: 'Students', subtitle: 'Manage student records', icon: PeopleIcon, path: '/students', color: '#1565c0' },
    { title: 'Teachers', subtitle: 'Manage teaching staff', icon: PersonIcon, path: '/teachers', color: '#2e7d32' },
    { title: 'Attendance', subtitle: 'Track daily attendance', icon: CheckCircleIcon, path: '/attendance', color: '#ed6c02' },
    { title: 'Fees', subtitle: 'Fee collection & reports', icon: MoneyIcon, path: '/fees', color: '#9c27b0' },
    { title: 'Examinations', subtitle: 'Exams & results', icon: AssignmentIcon, path: '/examinations', color: '#d32f2f' },
    { title: 'Homework', subtitle: 'Assignments & tasks', icon: BookIcon, path: '/homework', color: '#0288d1' },
  ];

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a237e', mb: 0.5 }}>
          Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome to School Management System
        </Typography>
      </Box>

      {loading && <LinearProgress sx={{ mb: 3 }} />}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Students"
            value={stats.totalStudents}
            icon={PeopleIcon}
            gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            subtitle="Enrolled students"
            onClick={() => navigate('/students')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Teachers"
            value={stats.totalTeachers}
            icon={PersonIcon}
            gradient="linear-gradient(135deg, #11998e 0%, #38ef7d 100%)"
            subtitle="Teaching staff"
            onClick={() => navigate('/teachers')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Today's Attendance"
            value={`${stats.todayAttendance}%`}
            icon={CheckCircleIcon}
            gradient="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
            subtitle={`${stats.totalPresent} present, ${stats.totalAbsent} absent`}
            onClick={() => navigate('/attendance')}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Fee Collection"
            value={`₹${stats.monthlyFeeCollection.toLocaleString()}`}
            icon={MoneyIcon}
            gradient="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
            subtitle="Total collected"
            onClick={() => navigate('/fees')}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <TrendingUpIcon sx={{ color: '#1a237e', mr: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a237e' }}>
                Quick Actions
              </Typography>
            </Box>
            <Grid container spacing={2}>
              {quickActions.map((action) => (
                <Grid item xs={6} key={action.title}>
                  <Card
                    onClick={() => navigate(action.path)}
                    sx={{
                      p: 2,
                      cursor: 'pointer',
                      textAlign: 'center',
                      border: '1px solid #e0e0e0',
                      boxShadow: 'none',
                      transition: 'all 0.2s',
                      '&:hover': {
                        borderColor: action.color,
                        transform: 'translateY(-2px)',
                        boxShadow: `0 4px 12px ${action.color}30`,
                      },
                    }}
                  >
                    <Avatar
                      sx={{
                        bgcolor: `${action.color}15`,
                        color: action.color,
                        mx: 'auto',
                        mb: 1,
                        width: 48,
                        height: 48,
                      }}
                    >
                      <action.icon />
                    </Avatar>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {action.title}
                    </Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Today's Overview */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <CalendarIcon sx={{ color: '#1a237e', mr: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a237e' }}>
                Today's Overview
              </Typography>
            </Box>
            <List disablePadding>
              <ListItem sx={{ px: 0, py: 1.5 }}>
                <ListItemIcon>
                  <Avatar sx={{ bgcolor: '#e3f2fd', width: 40, height: 40 }}>
                    <PeopleIcon sx={{ color: '#1565c0', fontSize: 20 }} />
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary={<Typography fontWeight={500}>Students Present</Typography>}
                  secondary={`${stats.totalPresent} out of ${stats.totalPresent + stats.totalAbsent}`}
                />
                <Chip
                  label={`${stats.todayAttendance}%`}
                  size="small"
                  color={stats.todayAttendance >= 75 ? 'success' : 'warning'}
                />
              </ListItem>
              <ListItem sx={{ px: 0, py: 1.5 }}>
                <ListItemIcon>
                  <Avatar sx={{ bgcolor: '#fce4ec', width: 40, height: 40 }}>
                    <PersonIcon sx={{ color: '#d32f2f', fontSize: 20 }} />
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary={<Typography fontWeight={500}>Students Absent</Typography>}
                  secondary="Requires attention"
                />
                <Chip label={stats.totalAbsent} size="small" color="error" variant="outlined" />
              </ListItem>
              <ListItem sx={{ px: 0, py: 1.5 }}>
                <ListItemIcon>
                  <Avatar sx={{ bgcolor: '#e8f5e9', width: 40, height: 40 }}>
                    <MoneyIcon sx={{ color: '#2e7d32', fontSize: 20 }} />
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary={<Typography fontWeight={500}>Fee Collected</Typography>}
                  secondary="Total amount"
                />
                <Chip
                  label={`₹${stats.monthlyFeeCollection.toLocaleString()}`}
                  size="small"
                  color="success"
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* System Info */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <SchoolIcon sx={{ color: '#1a237e', mr: 1 }} />
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a237e' }}>
                System Info
              </Typography>
            </Box>
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">Student Capacity</Typography>
                <Typography variant="body2" fontWeight={500}>{stats.totalStudents}/500</Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(stats.totalStudents / 500) * 100}
                sx={{ height: 8, borderRadius: 4, bgcolor: '#e0e0e0' }}
              />
            </Box>
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">Teacher Capacity</Typography>
                <Typography variant="body2" fontWeight={500}>{stats.totalTeachers}/50</Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(stats.totalTeachers / 50) * 100}
                color="success"
                sx={{ height: 8, borderRadius: 4, bgcolor: '#e0e0e0' }}
              />
            </Box>
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" color="text.secondary">Attendance Rate</Typography>
                <Typography variant="body2" fontWeight={500}>{stats.todayAttendance}%</Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={stats.todayAttendance}
                color={stats.todayAttendance >= 75 ? 'success' : 'warning'}
                sx={{ height: 8, borderRadius: 4, bgcolor: '#e0e0e0' }}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Module Cards */}
        <Grid item xs={12}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a237e', mb: 2 }}>
            Modules
          </Typography>
          <Grid container spacing={2}>
            {menuCards.map((card) => (
              <Grid item xs={6} sm={4} md={2} key={card.title}>
                <Card
                  onClick={() => navigate(card.path)}
                  sx={{
                    p: 2,
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                    },
                  }}
                >
                  <Avatar
                    sx={{
                      bgcolor: card.color,
                      mx: 'auto',
                      mb: 1.5,
                      width: 50,
                      height: 50,
                    }}
                  >
                    <card.icon />
                  </Avatar>
                  <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {card.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {card.subtitle}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
}
