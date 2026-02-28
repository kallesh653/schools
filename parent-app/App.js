import React, { useState, useEffect, useRef, useContext } from 'react';
import { DrawerContext } from './src/context/DrawerContext';
import {
  View, Text, TouchableOpacity, Animated, StyleSheet,
  TouchableWithoutFeedback, StatusBar, Dimensions, ActivityIndicator,
} from 'react-native';
import { NavigationContainer, createNavigationContainerRef, useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { clearAllBadges } from './src/utils/notifications';

import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import AttendanceScreen from './src/screens/AttendanceScreen';
import MarksScreen from './src/screens/MarksScreen';
import FeeScreen from './src/screens/FeeScreen';
import HomeworkScreen from './src/screens/HomeworkScreen';
import NoticeScreen from './src/screens/NoticeScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Stack = createStackNavigator();
const { width, height } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.78;

export const navigationRef = createNavigationContainerRef();

const theme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, primary: '#1a237e', accent: '#FFB300' },
};

const drawerItems = [
  { name: 'Dashboard', icon: 'view-dashboard-outline', color: '#1976d2', label: 'Dashboard' },
  { name: 'Attendance', icon: 'calendar-check-outline', color: '#43a047', label: 'Attendance' },
  { name: 'Marks', icon: 'clipboard-text-outline', color: '#8e24aa', label: 'Marks & Results' },
  { name: 'Fees', icon: 'cash-multiple', color: '#e65100', label: 'Fee Payments' },
  { name: 'Homework', icon: 'book-open-page-variant-outline', color: '#d81b60', label: 'Homework' },
  { name: 'Notices', icon: 'bell-badge-outline', color: '#0097a7', label: 'Notices' },
  { name: 'Profile', icon: 'account-circle-outline', color: '#546e7a', label: 'My Profile' },
];

// ─── Animated Splash Screen ───────────────────────────────────────────────────
function AnimatedSplash() {
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textSlide = useRef(new Animated.Value(30)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const ring1 = useRef(new Animated.Value(0.8)).current;
  const ring2 = useRef(new Animated.Value(0.6)).current;
  const dotY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Main entry animation
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, tension: 55, friction: 7, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.spring(textSlide, { toValue: 0, tension: 80, friction: 10, useNativeDriver: true }),
        Animated.timing(textOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
    ]).start();

    // Pulsing rings
    Animated.loop(
      Animated.sequence([
        Animated.timing(ring1, { toValue: 1.15, duration: 1200, useNativeDriver: true }),
        Animated.timing(ring1, { toValue: 0.8, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.delay(600),
        Animated.timing(ring2, { toValue: 1.2, duration: 1200, useNativeDriver: true }),
        Animated.timing(ring2, { toValue: 0.6, duration: 1200, useNativeDriver: true }),
      ])
    ).start();

    // Loading dots bounce
    Animated.loop(
      Animated.sequence([
        Animated.timing(dotY, { toValue: -8, duration: 400, useNativeDriver: true }),
        Animated.timing(dotY, { toValue: 0, duration: 400, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={splashStyles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a237e" />

      {/* Background decorative circles */}
      <View style={splashStyles.bgCircle1} />
      <View style={splashStyles.bgCircle2} />

      {/* Logo */}
      <Animated.View style={[splashStyles.logoWrapper, {
        opacity: logoOpacity,
        transform: [{ scale: logoScale }],
      }]}>
        <Animated.View style={[splashStyles.ring2, { transform: [{ scale: ring2 }] }]} />
        <Animated.View style={[splashStyles.ring1, { transform: [{ scale: ring1 }] }]} />
        <View style={splashStyles.logoCircle}>
          <MaterialCommunityIcons name="school" size={58} color="#FFB300" />
        </View>
      </Animated.View>

      {/* Text */}
      <Animated.View style={{
        opacity: textOpacity,
        transform: [{ translateY: textSlide }],
        alignItems: 'center',
        marginTop: 32,
      }}>
        <Text style={splashStyles.appName}>EduConnect</Text>
        <Text style={splashStyles.tagline}>Parent Portal</Text>
        <View style={splashStyles.divider} />
        <Text style={splashStyles.subtagline}>Stay Connected · Stay Informed</Text>
      </Animated.View>

      {/* Loading indicator */}
      <Animated.View style={[splashStyles.loadingRow, { transform: [{ translateY: dotY }] }]}>
        {[0, 1, 2].map(i => (
          <View key={i} style={[splashStyles.dot, i === 1 && { opacity: 0.7 }, i === 2 && { opacity: 0.4 }]} />
        ))}
      </Animated.View>
    </View>
  );
}

// ─── Custom Drawer ────────────────────────────────────────────────────────────
function CustomDrawer({ isOpen, onClose, onLogout, navigation, userName, userInitial }) {
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const itemAnims = useRef(drawerItems.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    if (isOpen) {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 0.55, duration: 300, useNativeDriver: true }),
      ]).start(() => {
        Animated.stagger(50, itemAnims.map(a =>
          Animated.spring(a, { toValue: 1, tension: 100, friction: 8, useNativeDriver: true })
        )).start();
      });
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: -DRAWER_WIDTH, duration: 260, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 0, duration: 260, useNativeDriver: true }),
        ...itemAnims.map(a => Animated.timing(a, { toValue: 0, duration: 150, useNativeDriver: true })),
      ]).start();
    }
  }, [isOpen]);

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents={isOpen ? 'auto' : 'none'}>
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[drawerStyles.overlay, { opacity: fadeAnim }]} />
      </TouchableWithoutFeedback>

      <Animated.View style={[drawerStyles.drawer, { transform: [{ translateX: slideAnim }] }]}>
        {/* Header */}
        <View style={drawerStyles.header}>
          <View style={drawerStyles.headerBg} />
          <View style={drawerStyles.avatarContainer}>
            <View style={drawerStyles.avatarOuter}>
              <View style={drawerStyles.avatar}>
                <Text style={drawerStyles.avatarText}>{userInitial || 'P'}</Text>
              </View>
            </View>
          </View>
          <Text style={drawerStyles.userName}>{userName || 'Parent'}</Text>
          <View style={drawerStyles.roleBadge}>
            <MaterialCommunityIcons name="shield-account" size={12} color="#FFB300" />
            <Text style={drawerStyles.roleText}>Parent Portal</Text>
          </View>
          <TouchableOpacity style={drawerStyles.closeBtn} onPress={onClose}>
            <MaterialCommunityIcons name="close" size={20} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
        </View>

        {/* Navigation Items */}
        <View style={drawerStyles.body}>
          {drawerItems.map((item, i) => (
            <Animated.View key={item.name} style={{
              opacity: itemAnims[i],
              transform: [{ translateX: itemAnims[i].interpolate({ inputRange: [0, 1], outputRange: [-30, 0] }) }],
            }}>
              <TouchableOpacity
                style={drawerStyles.item}
                onPress={() => { navigation.navigate(item.name); onClose(); }}
                activeOpacity={0.7}
              >
                <View style={[drawerStyles.itemIconWrap, { backgroundColor: item.color + '18' }]}>
                  <MaterialCommunityIcons name={item.icon} size={22} color={item.color} />
                </View>
                <Text style={drawerStyles.itemLabel}>{item.label}</Text>
                <MaterialCommunityIcons name="chevron-right" size={18} color="#d0d0d0" />
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        {/* Footer */}
        <View style={drawerStyles.footer}>
          <View style={drawerStyles.footerDivider} />
          <TouchableOpacity
            style={drawerStyles.logoutBtn}
            onPress={() => { onClose(); onLogout(); }}
            activeOpacity={0.8}
          >
            <View style={drawerStyles.logoutIcon}>
              <MaterialCommunityIcons name="logout" size={20} color="#f44336" />
            </View>
            <Text style={drawerStyles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
          <Text style={drawerStyles.footerVersion}>EduConnect v1.0</Text>
        </View>
      </Animated.View>
    </View>
  );
}

// ─── Drawer Navigator (needs useNavigation inside stack) ──────────────────────
function DrawerNavigator({ drawerOpen, onClose, onLogout, userName }) {
  const navigation = useNavigation();
  const userInitial = userName ? userName[0].toUpperCase() : 'P';
  return (
    <CustomDrawer
      isOpen={drawerOpen}
      onClose={onClose}
      onLogout={onLogout}
      navigation={navigation}
      userName={userName}
      userInitial={userInitial}
    />
  );
}

// ─── Main App (Stack Navigation, no bottom tabs) ──────────────────────────────
function MainApp({ onLogout }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    AsyncStorage.getItem('fullName').then(n => n && setUserName(n));
  }, []);

  const openDrawer = () => setDrawerOpen(true);
  const closeDrawer = () => setDrawerOpen(false);

  const handleLogout = async () => {
    await clearAllBadges();
    onLogout();
  };

  return (
    <DrawerContext.Provider value={{ openDrawer, closeDrawer }}>
      <View style={{ flex: 1 }}>
        <Stack.Navigator screenOptions={{ headerShown: false, animationEnabled: true }}>
          <Stack.Screen
            name="Dashboard"
            options={{ animationTypeForReplace: 'push' }}
          >
            {(props) => <DashboardScreen {...props} openDrawer={openDrawer} />}
          </Stack.Screen>
          <Stack.Screen name="Attendance" component={AttendanceScreen} />
          <Stack.Screen name="Marks" component={MarksScreen} />
          <Stack.Screen name="Fees" component={FeeScreen} />
          <Stack.Screen name="Homework" component={HomeworkScreen} />
          <Stack.Screen name="Notices" component={NoticeScreen} />
          <Stack.Screen name="Profile">
            {(props) => <ProfileScreen {...props} onLogout={handleLogout} />}
          </Stack.Screen>
        </Stack.Navigator>

        <DrawerNavigator
          drawerOpen={drawerOpen}
          onClose={closeDrawer}
          onLogout={handleLogout}
          userName={userName}
        />
      </View>
    </DrawerContext.Provider>
  );
}

// ─── Root App ────────────────────────────────────────────────────────────────
export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const splashOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => { checkAuth(); }, []);

  const checkAuth = async () => {
    const token = await AsyncStorage.getItem('token');
    setIsLoggedIn(!!token);
    // Fade out splash after minimum display time
    setTimeout(() => {
      Animated.timing(splashOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => setLoading(false));
    }, 1800);
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
    setIsLoggedIn(false);
  };

  return (
    <PaperProvider theme={theme}>
      <StatusBar barStyle="light-content" backgroundColor="#1a237e" />
      {loading ? (
        <Animated.View style={{ flex: 1, opacity: splashOpacity }}>
          <AnimatedSplash />
        </Animated.View>
      ) : (
        <NavigationContainer ref={navigationRef}>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {isLoggedIn ? (
              <Stack.Screen name="Main">
                {(props) => <MainApp {...props} onLogout={handleLogout} />}
              </Stack.Screen>
            ) : (
              <Stack.Screen name="Login">
                {(props) => <LoginScreen {...props} onLogin={() => setIsLoggedIn(true)} />}
              </Stack.Screen>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      )}
    </PaperProvider>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const splashStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a237e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bgCircle1: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: 'rgba(255,255,255,0.03)',
    top: -100,
    right: -100,
  },
  bgCircle2: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(255,179,0,0.06)',
    bottom: -60,
    left: -60,
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 140,
    height: 140,
  },
  ring1: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 2,
    borderColor: 'rgba(255,179,0,0.25)',
  },
  ring2: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  logoCircle: {
    width: 108,
    height: 108,
    borderRadius: 54,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderWidth: 2,
    borderColor: 'rgba(255,179,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 1.5,
    marginTop: 4,
  },
  tagline: {
    fontSize: 15,
    color: '#FFB300',
    fontWeight: '600',
    letterSpacing: 2,
    marginTop: 6,
    textTransform: 'uppercase',
  },
  divider: {
    width: 50,
    height: 2,
    backgroundColor: 'rgba(255,179,0,0.5)',
    borderRadius: 1,
    marginVertical: 14,
  },
  subtagline: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.55)',
    letterSpacing: 1,
  },
  loadingRow: {
    position: 'absolute',
    bottom: 60,
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFB300',
  },
});

const drawerStyles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
  },
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: DRAWER_WIDTH,
    height: '100%',
    backgroundColor: '#fff',
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 6, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  header: {
    backgroundColor: '#1a237e',
    paddingTop: 52,
    paddingBottom: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
    overflow: 'hidden',
  },
  headerBg: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.05)',
    top: -60,
    right: -40,
  },
  closeBtn: {
    position: 'absolute',
    top: 50,
    right: 16,
    padding: 8,
  },
  avatarContainer: {
    marginBottom: 12,
  },
  avatarOuter: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 2.5,
    borderColor: '#FFB300',
    padding: 3,
  },
  avatar: {
    flex: 1,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
  },
  userName: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 6,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,179,0,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,179,0,0.3)',
  },
  roleText: {
    color: '#FFB300',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  body: {
    flex: 1,
    paddingTop: 10,
    paddingHorizontal: 10,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 2,
  },
  itemIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  itemLabel: {
    flex: 1,
    fontSize: 14.5,
    fontWeight: '600',
    color: '#2c3e50',
  },
  footer: {
    paddingBottom: 28,
  },
  footerDivider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginHorizontal: 16,
    marginBottom: 8,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 22,
    gap: 14,
  },
  logoutIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#fff5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    fontSize: 15,
    color: '#f44336',
    fontWeight: '700',
  },
  footerVersion: {
    textAlign: 'center',
    fontSize: 11,
    color: '#c0c0c0',
    paddingBottom: 4,
  },
});
