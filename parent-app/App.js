import React, { useState, useEffect, useRef, useContext } from 'react';
import { DrawerContext } from './src/context/DrawerContext';
import {
  View, Text, TouchableOpacity, Animated, StyleSheet,
  TouchableWithoutFeedback, StatusBar, Image, Dimensions
} from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider, DefaultTheme } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import LoginScreen from './src/screens/LoginScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import AttendanceScreen from './src/screens/AttendanceScreen';
import MarksScreen from './src/screens/MarksScreen';
import FeeScreen from './src/screens/FeeScreen';
import HomeworkScreen from './src/screens/HomeworkScreen';
import NoticeScreen from './src/screens/NoticeScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();
const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.75;

const theme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, primary: '#1976d2', accent: '#dc004e' },
};

const drawerItems = [
  { name: 'Dashboard', icon: 'view-dashboard', color: '#1976d2' },
  { name: 'Attendance', icon: 'check-circle-outline', color: '#4caf50' },
  { name: 'Marks', icon: 'file-document-outline', color: '#9c27b0' },
  { name: 'Fees', icon: 'cash', color: '#f57c00' },
  { name: 'Homework', icon: 'book-open-variant', color: '#e91e63' },
  { name: 'Notices', icon: 'bell-outline', color: '#00acc1' },
  { name: 'Profile', icon: 'account-circle-outline', color: '#607d8b' },
];

function CustomDrawer({ isOpen, onClose, onLogout, navigation, userName, userRole }) {
  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isOpen) {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: 0, duration: 280, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 0.5, duration: 280, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: -DRAWER_WIDTH, duration: 240, useNativeDriver: true }),
        Animated.timing(fadeAnim, { toValue: 0, duration: 240, useNativeDriver: true }),
      ]).start();
    }
  }, [isOpen]);

  if (!isOpen && slideAnim._value === -DRAWER_WIDTH) return null;

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents={isOpen ? 'auto' : 'none'}>
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.overlay, { opacity: fadeAnim }]} />
      </TouchableWithoutFeedback>
      <Animated.View style={[styles.drawer, { transform: [{ translateX: slideAnim }] }]}>
        {/* Drawer Header */}
        <View style={styles.drawerHeader}>
          <View style={styles.drawerAvatar}>
            <Text style={styles.drawerAvatarText}>{userName ? userName[0].toUpperCase() : 'P'}</Text>
          </View>
          <Text style={styles.drawerName}>{userName || 'Parent'}</Text>
          <Text style={styles.drawerRole}>Parent Portal</Text>
        </View>

        {/* Drawer Items */}
        <View style={styles.drawerBody}>
          {drawerItems.map((item) => (
            <TouchableOpacity
              key={item.name}
              style={styles.drawerItem}
              onPress={() => { navigation.navigate(item.name); onClose(); }}
            >
              <View style={[styles.drawerItemIcon, { backgroundColor: item.color + '22' }]}>
                <MaterialCommunityIcons name={item.icon} size={22} color={item.color} />
              </View>
              <Text style={styles.drawerItemText}>{item.name}</Text>
              <MaterialCommunityIcons name="chevron-right" size={18} color="#ccc" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.drawerLogout} onPress={() => { onClose(); onLogout(); }}>
          <MaterialCommunityIcons name="logout" size={22} color="#f44336" />
          <Text style={styles.drawerLogoutText}>Logout</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

function MainTabs({ onLogout }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const navigationRef = useRef(null);

  useEffect(() => {
    AsyncStorage.getItem('fullName').then(n => n && setUserName(n));
  }, []);

  const openDrawer = () => setDrawerOpen(true);
  const closeDrawer = () => setDrawerOpen(false);

  return (
    <DrawerContext.Provider value={{ openDrawer, closeDrawer }}>
      <View style={{ flex: 1 }}>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarIcon: ({ color, size }) => {
              const icons = {
                Dashboard: 'view-dashboard', Attendance: 'check-circle',
                Marks: 'file-document', Fees: 'currency-usd',
                Homework: 'book-open-variant', Notices: 'bell', Profile: 'account'
              };
              return <MaterialCommunityIcons name={icons[route.name] || 'circle'} size={size} color={color} />;
            },
            tabBarActiveTintColor: '#1976d2',
            tabBarInactiveTintColor: 'gray',
            tabBarStyle: { elevation: 8, shadowOpacity: 0.1 },
            headerShown: false,
          })}
        >
          <Tab.Screen name="Dashboard" component={DashboardScreen} />
          <Tab.Screen name="Attendance" component={AttendanceScreen} />
          <Tab.Screen name="Marks" component={MarksScreen} />
          <Tab.Screen name="Fees" component={FeeScreen} />
          <Tab.Screen name="Homework" component={HomeworkScreen} />
          <Tab.Screen name="Notices" component={NoticeScreen} />
          <Tab.Screen name="Profile">
            {(props) => <ProfileScreen {...props} onLogout={onLogout} />}
          </Tab.Screen>
        </Tab.Navigator>

        <DrawerNavigator
          drawerOpen={drawerOpen}
          onClose={closeDrawer}
          onLogout={onLogout}
          userName={userName}
        />
      </View>
    </DrawerContext.Provider>
  );
}

function DrawerNavigator({ drawerOpen, onClose, onLogout, userName }) {
  const navigation = useNavigation();
  return (
    <CustomDrawer
      isOpen={drawerOpen}
      onClose={onClose}
      onLogout={onLogout}
      navigation={navigation}
      userName={userName}
    />
  );
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { checkAuth(); }, []);

  const checkAuth = async () => {
    const token = await AsyncStorage.getItem('token');
    setIsLoggedIn(!!token);
    setLoading(false);
  };

  const handleLogout = async () => {
    await AsyncStorage.clear();
    setIsLoggedIn(false);
  };

  if (loading) return null;

  return (
    <PaperProvider theme={theme}>
      <StatusBar barStyle="light-content" backgroundColor="#1565c0" />
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {isLoggedIn ? (
            <Stack.Screen name="Main">
              {(props) => <MainTabs {...props} onLogout={handleLogout} />}
            </Stack.Screen>
          ) : (
            <Stack.Screen name="Login">
              {(props) => <LoginScreen {...props} onLogin={() => setIsLoggedIn(true)} />}
            </Stack.Screen>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
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
    elevation: 16,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  drawerHeader: {
    backgroundColor: '#1565c0',
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  drawerAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  drawerAvatarText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#fff',
  },
  drawerName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  drawerRole: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
  },
  drawerBody: {
    flex: 1,
    paddingTop: 12,
    paddingHorizontal: 8,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 4,
  },
  drawerItemIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  drawerItemText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  drawerLogout: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 12,
  },
  drawerLogoutText: {
    fontSize: 16,
    color: '#f44336',
    fontWeight: '600',
  },
});
