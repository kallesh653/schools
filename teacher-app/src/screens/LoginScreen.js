import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  StatusBar, Animated, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { authAPI } from '../services/api';

export default function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
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
        <View style={styles.header}>
          <View style={styles.logoCircle}>
            <MaterialCommunityIcons name="school" size={48} color="#fff" />
          </View>
          <Text style={styles.appName}>EduConnect</Text>
          <Text style={styles.appSub}>Teacher Portal</Text>
        </View>

        <Animated.View style={[styles.card, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <Text style={styles.welcomeText}>Welcome Back!</Text>
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

          <TouchableOpacity style={[styles.loginBtn, loading && { opacity: 0.7 }]} onPress={handleLogin} disabled={loading} activeOpacity={0.85}>
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
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: { backgroundColor: '#1565c0', alignItems: 'center', paddingTop: 70, paddingBottom: 50 },
  logoCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', marginBottom: 16, borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)' },
  appName: { color: '#fff', fontSize: 28, fontWeight: '800', letterSpacing: 0.5 },
  appSub: { color: 'rgba(255,255,255,0.75)', fontSize: 14, marginTop: 4, letterSpacing: 1 },
  card: { flex: 1, backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, marginTop: -24, padding: 28, paddingBottom: 40, elevation: 8 },
  welcomeText: { fontSize: 22, fontWeight: '800', color: '#1a237e', marginBottom: 4 },
  signInText: { fontSize: 14, color: '#888', marginBottom: 24 },
  errorBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffebee', borderRadius: 10, padding: 12, marginBottom: 16, gap: 8, borderLeftWidth: 3, borderLeftColor: '#c62828' },
  errorText: { color: '#c62828', fontSize: 13, flex: 1 },
  inputGroup: { marginBottom: 18 },
  label: { fontSize: 13, fontWeight: '600', color: '#444', marginBottom: 6 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: '#e0e0e0', borderRadius: 12, backgroundColor: '#fafafa', paddingHorizontal: 12, minHeight: 50 },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, fontSize: 15, color: '#333', paddingVertical: 12 },
  eyeBtn: { padding: 4 },
  loginBtn: { backgroundColor: '#1565c0', borderRadius: 14, paddingVertical: 16, alignItems: 'center', justifyContent: 'center', marginTop: 8, elevation: 4 },
  loginBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 24 },
  footerText: { fontSize: 12, color: '#aaa' },
});
