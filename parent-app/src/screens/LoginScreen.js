import React, { useState } from 'react';
import { View, StyleSheet, StatusBar, KeyboardAvoidingView, Platform, TouchableOpacity, Animated } from 'react-native';
import { TextInput, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../services/api';

export default function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

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
      <StatusBar barStyle="light-content" backgroundColor="#1a237e" />

      {/* Header */}
      <View style={styles.headerBg}>
        <View style={styles.logoCircle}>
          <MaterialCommunityIcons name="school" size={52} color="#1a237e" />
        </View>
        <Text style={styles.appName}>EduConnect</Text>
        <Text style={styles.appSub}>Parent Portal</Text>
        <Text style={styles.tagline}>Stay connected with your child's education</Text>
      </View>

      {/* Form */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.formOuter}>
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Parent Login</Text>
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
            outlineColor="#c5cae9"
            activeOutlineColor="#1a237e"
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
            outlineColor="#c5cae9"
            activeOutlineColor="#1a237e"
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
            <Text style={styles.helpText}>Contact school admin if you need login credentials</Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a237e' },
  headerBg: {
    flex: 0.48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 16,
  },
  logoCircle: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: 'white',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 10,
    marginBottom: 16,
  },
  appName: { fontSize: 32, fontWeight: '800', color: 'white', letterSpacing: 1 },
  appSub: { fontSize: 14, color: 'rgba(255,255,255,0.7)', fontWeight: '600', letterSpacing: 3, marginTop: 2, marginBottom: 8 },
  tagline: { fontSize: 13, color: 'rgba(255,255,255,0.7)', textAlign: 'center', paddingHorizontal: 40 },
  formOuter: { flex: 0.52 },
  formCard: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 28,
    paddingTop: 30,
    paddingBottom: 20,
    elevation: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.15, shadowRadius: 12,
  },
  formTitle: { fontSize: 24, fontWeight: '800', color: '#1a237e', marginBottom: 4 },
  formSubtitle: { fontSize: 13, color: '#999', marginBottom: 20 },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#ffebee', padding: 12, borderRadius: 10,
    marginBottom: 16, borderLeftWidth: 3, borderLeftColor: '#c62828',
  },
  errorText: { fontSize: 13, color: '#c62828', flex: 1 },
  input: { marginBottom: 14, backgroundColor: 'white' },
  loginBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#1a237e', borderRadius: 12, paddingVertical: 14, marginTop: 4,
  },
  loginBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  helpRow: { flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center', marginTop: 16 },
  helpText: { fontSize: 12, color: '#bbb', flex: 1 },
});
