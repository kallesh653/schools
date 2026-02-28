import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  School as SchoolIcon,
  People as PeopleIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  AttachMoney as MoneyIcon,
  Assignment as AssignmentIcon,
  Book as BookIcon,
  Notifications as NotificationsIcon,
  Logout as LogoutIcon,
  AdminPanelSettings as AdminIcon,
  Settings as SettingsIcon,
  Sms as SmsIcon,
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const drawerWidth = 260;

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Academic', icon: <SchoolIcon />, path: '/academic' },
  { text: 'Students', icon: <PeopleIcon />, path: '/students' },
  { text: 'Teachers', icon: <PersonIcon />, path: '/teachers' },
  { text: 'Attendance', icon: <CheckCircleIcon />, path: '/attendance' },
  { text: 'Fees', icon: <MoneyIcon />, path: '/fees' },
  { text: 'Examinations', icon: <AssignmentIcon />, path: '/examinations' },
  { text: 'Homework', icon: <BookIcon />, path: '/homework' },
  { text: 'Notices', icon: <NotificationsIcon />, path: '/notices' },
  { text: 'Communication', icon: <SmsIcon />, path: '/communication' },
  { text: 'Configuration', icon: <SettingsIcon />, path: '/configuration' },
];

export default function Layout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Logo Header */}
      <Box
        sx={{
          p: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          borderBottom: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <Avatar
          sx={{
            width: 45,
            height: 45,
            bgcolor: '#7c4dff',
            boxShadow: '0 4px 14px rgba(124, 77, 255, 0.4)',
          }}
        >
          <SchoolIcon />
        </Avatar>
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              color: '#fff',
              fontSize: '1.1rem',
              letterSpacing: '0.5px',
            }}
          >
            School Admin
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.7rem' }}
          >
            Management System
          </Typography>
        </Box>
      </Box>

      {/* Navigation Menu */}
      <Box sx={{ flex: 1, py: 2, overflowY: 'auto' }}>
        <Typography
          variant="overline"
          sx={{
            px: 3,
            mb: 1,
            display: 'block',
            color: 'rgba(255,255,255,0.4)',
            fontSize: '0.65rem',
            fontWeight: 600,
            letterSpacing: '1px',
          }}
        >
          Main Menu
        </Typography>
        <List sx={{ px: 1.5 }}>
          {menuItems.map((item) => (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => navigate(item.path)}
                sx={{
                  borderRadius: 2,
                  py: 1.2,
                  px: 2,
                  backgroundColor: isActive(item.path)
                    ? 'rgba(124, 77, 255, 0.2)'
                    : 'transparent',
                  border: isActive(item.path)
                    ? '1px solid rgba(124, 77, 255, 0.3)'
                    : '1px solid transparent',
                  '&:hover': {
                    backgroundColor: isActive(item.path)
                      ? 'rgba(124, 77, 255, 0.25)'
                      : 'rgba(255,255,255,0.05)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: isActive(item.path)
                      ? '#7c4dff'
                      : 'rgba(255,255,255,0.7)',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{
                    '& .MuiListItemText-primary': {
                      color: isActive(item.path)
                        ? '#fff'
                        : 'rgba(255,255,255,0.8)',
                      fontWeight: isActive(item.path) ? 600 : 400,
                      fontSize: '0.9rem',
                    },
                  }}
                />
                {isActive(item.path) && (
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      bgcolor: '#7c4dff',
                      boxShadow: '0 0 10px #7c4dff',
                    }}
                  />
                )}
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* User Info & Logout */}
      <Box
        sx={{
          p: 2,
          borderTop: '1px solid rgba(255,255,255,0.1)',
          backgroundColor: 'rgba(0,0,0,0.2)',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            mb: 2,
            p: 1.5,
            borderRadius: 2,
            backgroundColor: 'rgba(255,255,255,0.05)',
          }}
        >
          <Avatar
            sx={{
              width: 38,
              height: 38,
              bgcolor: '#1565c0',
              fontSize: '0.9rem',
              fontWeight: 600,
            }}
          >
            {(user?.fullName || user?.username || 'A').charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="body2"
              sx={{
                color: '#fff',
                fontWeight: 600,
                fontSize: '0.85rem',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {user?.fullName || user?.username || 'Admin'}
            </Typography>
            <Chip
              icon={<AdminIcon sx={{ fontSize: 12, color: '#4caf50 !important' }} />}
              label={user?.role || 'ADMIN'}
              size="small"
              sx={{
                height: 20,
                fontSize: '0.65rem',
                bgcolor: 'rgba(76, 175, 80, 0.15)',
                color: '#4caf50',
                border: '1px solid rgba(76, 175, 80, 0.3)',
                '& .MuiChip-label': { px: 0.8 },
              }}
            />
          </Box>
        </Box>
        <Tooltip title="Logout" placement="top">
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: 2,
              py: 1,
              justifyContent: 'center',
              backgroundColor: 'rgba(244, 67, 54, 0.1)',
              border: '1px solid rgba(244, 67, 54, 0.2)',
              '&:hover': {
                backgroundColor: 'rgba(244, 67, 54, 0.2)',
              },
            }}
          >
            <LogoutIcon sx={{ color: '#f44336', mr: 1, fontSize: 20 }} />
            <Typography
              sx={{ color: '#f44336', fontWeight: 500, fontSize: '0.85rem' }}
            >
              Logout
            </Typography>
          </ListItemButton>
        </Tooltip>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f7fa' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: '#fff',
          borderBottom: '1px solid #e0e0e0',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: 'none' }, color: '#1a237e' }}
            >
              <MenuIcon />
            </IconButton>
            <Typography
              variant="h6"
              noWrap
              component="div"
              sx={{
                color: '#1a237e',
                fontWeight: 600,
                fontSize: '1.2rem',
              }}
            >
              {menuItems.find((item) => isActive(item.path))?.text || 'Dashboard'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography
              variant="body2"
              sx={{ color: '#666', display: { xs: 'none', md: 'block' } }}
            >
              Welcome back,{' '}
              <span style={{ fontWeight: 600, color: '#1a237e' }}>
                {user?.fullName || user?.username}
              </span>
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              backgroundColor: '#1a237e',
              backgroundImage: 'linear-gradient(180deg, #1a237e 0%, #0d1642 100%)',
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              backgroundColor: '#1a237e',
              backgroundImage: 'linear-gradient(180deg, #1a237e 0%, #0d1642 100%)',
              border: 'none',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: 8,
          minHeight: 'calc(100vh - 64px)',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
