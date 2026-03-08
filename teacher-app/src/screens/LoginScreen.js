import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  StatusBar, Animated, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { authAPI } from '../services/api';

const SCHOOL_NAME = 'Sirigannada Pri-Primary\n& Higher Primary School';
const SCHOOL_SHORT = 'SPHS';

export default function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const logoScale = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(logoScale, { toValue: 1, friction: 5, useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) { setError('Please enter username and password'); return; }
    setLoading(true); setError('');
    try {
      const response = await authAPI.login({ username: username.trim(), password });
      const data = response.data;
      if (data.role !== 'ROLE_TEACHER' && data.role !== 'TEACHER') {
        setError('Access denied. This app is for teachers only.'); setLoading(false); return;
      }
      await AsyncStorage.setItem('token', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data));
      await AsyncStorage.setItem('fullName', data.fullName || data.username || '');
      onLogin();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data || '';
      if (err?.response?.status === 401) setError('Invalid username or password');
      else if (msg) setError(String(msg));
      else setError('Connection failed. Please check your network.');
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="light-content" backgroundColor="#0d47a1" />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.circle1} />
          <View style={styles.circle2} />

          <Animated.View style={[styles.logoWrap, { transform: [{ scale: logoScale }] }]}>
            <View style={styles.logoOuter}>
              <View style={styles.logoInner}>
                <MaterialCommunityIcons name="school" size={44} color="#1565c0" />
              </View>
            </View>
            <View style={styles.initialsChip}>
              <Text style={styles.initialsText}>{SCHOOL_SHORT}</Text>
            </View>
          </Animated.View>

          <Text style={styles.schoolName}>{SCHOOL_NAME}</Text>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Teacher Portal</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <MaterialCommunityIcons name="account-tie" size={12} color="#fff" />
              <Text style={styles.badgeText}>Staff Login</Text>
            </View>
          </View>
        </View>

        {/* Form card */}
        <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.formTitleRow}>
            <View style={styles.formTitleAccent} />
            <Text style={styles.welcomeText}>Welcome Back!</Text>
          </View>
          <Text style={styles.signInText}>Sign in to your teacher account</Text>

          {error ? (
            <View style={styles.errorBox}>
              <MaterialCommunityIcons name="alert-circle-outline" size={16} color="#c62828" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Username</Text>
            <View style={styles.inputWrapper}>
              <MaterialCommunityIcons name="account-outline" size={20} color="#888" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your username"
                placeholderTextColor="#bbb"
                value={username}
                onChangeText={v => { setUsername(v); setError(''); }}
                autoCapitalize="none" autoCorrect={false} returnKeyType="next"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrapper}>
              <MaterialCommunityIcons name="lock-outline" size={20} color="#888" style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Enter your password"
                placeholderTextColor="#bbb"
                value={password}
                onChangeText={v => { setPassword(v); setError(''); }}
                secureTextEntry={!showPassword}
                returnKeyType="done" onSubmitEditing={handleLogin}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <MaterialCommunityIcons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#888" />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.loginBtn, loading && { opacity: 0.7 }]}
            onPress={handleLogin} disabled={loading} activeOpacity={0.85}
          >
            {loading ? <ActivityIndicator size="small" color="#fff" /> : (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <MaterialCommunityIcons name="login" size={20} color="#fff" />
                <Text style={styles.loginBtnText}>Sign In</Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <MaterialCommunityIcons name="information-outline" size={14} color="#aaa" />
            <Text style={styles.footerText}>Use your school-assigned teacher credentials</Text>
          </View>

          <View style={styles.footerBrand}>
            <Text style={styles.footerBrandText}>Sirigannada Pri-Primary & Higher Primary School</Text>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: '#1565c0', alignItems: 'center', paddingTop: 60, paddingBottom: 46, overflow: 'hidden' },
  circle1: { position: 'absolute', width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(255,255,255,0.06)', top: -60, right: -60 },
  circle2: { position: 'absolute', width: 150, height: 150, borderRadius: 75, backgroundColor: 'rgba(255,255,255,0.06)', bottom: -40, left: -40 },
  logoWrap: { alignItems: 'center', marginBottom: 14 },
  logoOuter: { width: 108, height: 108, borderRadius: 54, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)' },
  logoInner: { width: 88, height: 88, borderRadius: 44, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', elevation: 6 },
  initialsChip: { position: 'absolute', bottom: -8, right: -4, backgroundColor: '#f9a825', borderRadius: 12, paddingHorizontal: 8, paddingVertical: 2, borderWidth: 2, borderColor: '#1565c0' },
  initialsText: { fontSize: 10, fontWeight: '800', color: '#1565c0' },
  schoolName: { fontSize: 17, fontWeight: '800', color: '#fff', textAlign: 'center', letterSpacing: 0.3, paddingHorizontal: 20, lineHeight: 24 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, marginBottom: 8, paddingHorizontal: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.3)' },
  dividerText: { fontSize: 11, color: '#90caf9', fontWeight: '700', letterSpacing: 3, paddingHorizontal: 10, textTransform: 'uppercase' },
  badgeRow: { flexDirection: 'row', gap: 8 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  badgeText: { fontSize: 11, color: '#fff', fontWeight: '600' },
  card: { flex: 1, backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, marginTop: -22, padding: 28, paddingBottom: 40, elevation: 8 },
  formTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  formTitleAccent: { width: 4, height: 26, borderRadius: 2, backgroundColor: '#1565c0' },
  welcomeText: { fontSize: 22, fontWeight: '800', color: '#1a237e' },
  signInText: { fontSize: 14, color: '#888', marginBottom: 22 },
  errorBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffebee', borderRadius: 10, padding: 12, marginBottom: 16, gap: 8, borderLeftWidth: 3, borderLeftColor: '#c62828' },
  errorText: { color: '#c62828', fontSize: 13, flex: 1 },
  inputGroup: { marginBottom: 18 },
  label: { fontSize: 13, fontWeight: '600', color: '#444', marginBottom: 6 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#e0e0e0', borderRadius: 12, backgroundColor: '#fafafa', paddingHorizontal: 12, minHeight: 50 },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: 15, color: '#333', paddingVertical: 12 },
  eyeBtn: { padding: 4 },
  loginBtn: { backgroundColor: '#1565c0', borderRadius: 14, paddingVertical: 16, alignItems: 'center', justifyContent: 'center', marginTop: 8, elevation: 4, shadowColor: '#1565c0', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  loginBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 22 },
  footerText: { fontSize: 12, color: '#aaa' },
  footerBrand: { marginTop: 10, alignItems: 'center' },
  footerBrandText: { fontSize: 10, color: '#ccc', textAlign: 'center' },
});
