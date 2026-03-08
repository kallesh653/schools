import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, StatusBar, KeyboardAvoidingView, Platform, TouchableOpacity, Animated } from 'react-native';
import { TextInput, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../services/api';

const SCHOOL_NAME = 'Sirigannada Pri-Primary\n& Higher Primary School';
const SCHOOL_SHORT = 'SPHS';

export default function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const logoScale = useRef(new Animated.Value(0.6)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(logoScale, { toValue: 1, friction: 5, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError('Please enter username and password');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const response = await authAPI.login({ username: username.trim(), password });
      const userData = response.data;
      if (userData.role !== 'ROLE_PARENT' && userData.role !== 'PARENT') {
        setError('This app is for parents only. Please use the Teacher App to login as a teacher.');
        setLoading(false);
        return;
      }
      await AsyncStorage.setItem('token', userData.token);
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      await AsyncStorage.setItem('fullName', userData.fullName || userData.username || '');
      await AsyncStorage.setItem('entityId', String(userData.entityId || ''));
      await AsyncStorage.setItem('entityType', userData.entityType || '');
      onLogin();
    } catch (err) {
      setError('Invalid username or password. Please try again.');
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1b5e20" />

      {/* Header */}
      <View style={styles.headerBg}>
        {/* Decorative circles */}
        <View style={styles.circle1} />
        <View style={styles.circle2} />

        <Animated.View style={[styles.logoWrap, { transform: [{ scale: logoScale }] }]}>
          <View style={styles.logoOuter}>
            <View style={styles.logoInner}>
              <MaterialCommunityIcons name="school" size={44} color="#1b5e20" />
            </View>
          </View>
          {/* School initials badge */}
          <View style={styles.initialsChip}>
            <Text style={styles.initialsText}>{SCHOOL_SHORT}</Text>
          </View>
        </Animated.View>

        <Text style={styles.schoolName}>{SCHOOL_NAME}</Text>
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>Parent Portal</Text>
          <View style={styles.dividerLine} />
        </View>
        <Text style={styles.tagline}>Monitor your child's academic journey</Text>
      </View>

      {/* Form */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.formOuter}>
        <Animated.View style={[styles.formCard, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.formTitleRow}>
            <View style={styles.formTitleAccent} />
            <Text style={styles.formTitle}>Parent Login</Text>
          </View>
          <Text style={styles.formSubtitle}>Sign in to monitor your child's progress</Text>

          {error ? (
            <View style={styles.errorBox}>
              <MaterialCommunityIcons name="alert-circle" size={16} color="#c62828" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <TextInput
            label="Username"
            value={username}
            onChangeText={setUsername}
            style={styles.input}
            mode="outlined"
            left={<TextInput.Icon icon="account" />}
            autoCapitalize="none"
            autoCorrect={false}
            outlineColor="#c8e6c9"
            activeOutlineColor="#1b5e20"
          />
          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            style={styles.input}
            mode="outlined"
            left={<TextInput.Icon icon="lock" />}
            right={
              <TextInput.Icon
                icon={showPassword ? 'eye-off' : 'eye'}
                onPress={() => setShowPassword(!showPassword)}
              />
            }
            outlineColor="#c8e6c9"
            activeOutlineColor="#1b5e20"
          />

          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            style={[styles.loginBtn, loading && { opacity: 0.7 }]}
          >
            {loading ? (
              <MaterialCommunityIcons name="loading" size={22} color="#fff" />
            ) : (
              <MaterialCommunityIcons name="login" size={22} color="#fff" />
            )}
            <Text style={styles.loginBtnText}>{loading ? 'Signing in...' : 'Sign In'}</Text>
          </TouchableOpacity>

          <View style={styles.helpRow}>
            <MaterialCommunityIcons name="information-outline" size={14} color="#bbb" />
            <Text style={styles.helpText}>Contact school admin for login credentials</Text>
          </View>

          <View style={styles.footerBrand}>
            <Text style={styles.footerBrandText}>Sirigannada Pri-Primary & Higher Primary School</Text>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1b5e20' },
  headerBg: {
    flex: 0.5,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 16,
    overflow: 'hidden',
  },
  circle1: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.05)', top: -60, right: -60,
  },
  circle2: {
    position: 'absolute', width: 150, height: 150, borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.05)', bottom: -40, left: -40,
  },
  logoWrap: { alignItems: 'center', marginBottom: 14 },
  logoOuter: {
    width: 110, height: 110, borderRadius: 55,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)',
  },
  logoInner: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: 'white',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2, shadowRadius: 8, elevation: 8,
  },
  initialsChip: {
    position: 'absolute', bottom: -8, right: -4,
    backgroundColor: '#f9a825', borderRadius: 12,
    paddingHorizontal: 8, paddingVertical: 2,
    borderWidth: 2, borderColor: '#1b5e20',
  },
  initialsText: { fontSize: 10, fontWeight: '800', color: '#1b5e20' },
  schoolName: {
    fontSize: 17, fontWeight: '800', color: 'white',
    textAlign: 'center', letterSpacing: 0.3,
    paddingHorizontal: 20, lineHeight: 24,
  },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, marginBottom: 6, paddingHorizontal: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.3)' },
  dividerText: {
    fontSize: 11, color: '#a5d6a7', fontWeight: '700',
    letterSpacing: 3, paddingHorizontal: 10, textTransform: 'uppercase',
  },
  tagline: { fontSize: 12, color: 'rgba(255,255,255,0.65)', textAlign: 'center', paddingHorizontal: 40 },
  formOuter: { flex: 0.5 },
  formCard: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 28,
    paddingTop: 28,
    paddingBottom: 16,
    elevation: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.15, shadowRadius: 12,
  },
  formTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  formTitleAccent: { width: 4, height: 26, borderRadius: 2, backgroundColor: '#2e7d32' },
  formTitle: { fontSize: 22, fontWeight: '800', color: '#1b5e20' },
  formSubtitle: { fontSize: 13, color: '#999', marginBottom: 18 },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#ffebee', padding: 12, borderRadius: 10,
    marginBottom: 14, borderLeftWidth: 3, borderLeftColor: '#c62828',
  },
  errorText: { fontSize: 13, color: '#c62828', flex: 1 },
  input: { marginBottom: 12, backgroundColor: 'white' },
  loginBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#2e7d32', borderRadius: 14, paddingVertical: 14, marginTop: 4,
    elevation: 4, shadowColor: '#2e7d32', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8,
  },
  loginBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  helpRow: { flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center', marginTop: 14 },
  helpText: { fontSize: 12, color: '#bbb', flex: 1 },
  footerBrand: { marginTop: 12, alignItems: 'center' },
  footerBrandText: { fontSize: 10, color: '#ccc', textAlign: 'center' },
});
