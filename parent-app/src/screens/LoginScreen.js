import React, { useState } from 'react';
import { View, StyleSheet, StatusBar, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
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
      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data));
      onLogin();
    } catch (err) {
      setError('Invalid username or password. Please try again.');
    }
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1565c0" />

      {/* Header Background */}
      <View style={styles.headerBg}>
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <MaterialCommunityIcons name="school" size={48} color="#1565c0" />
          </View>
        </View>
        <Text style={styles.appName}>School Parent</Text>
        <Text style={styles.tagline}>Stay connected with your child's education</Text>
      </View>

      {/* Login Form */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.formContainer}>
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Parent Login</Text>

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
            outlineColor="#1565c0"
            activeOutlineColor="#1565c0"
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
            outlineColor="#1565c0"
            activeOutlineColor="#1565c0"
          />
          <Button
            mode="contained"
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
            style={styles.button}
            contentStyle={styles.buttonContent}
            buttonColor="#1565c0"
            labelStyle={styles.buttonLabel}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>

          <Text style={styles.helpText}>
            Contact school admin if you need login credentials
          </Text>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1565c0' },
  headerBg: {
    flex: 0.45,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
  },
  logoContainer: { marginBottom: 16 },
  logoCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  appName: { fontSize: 30, fontWeight: '800', color: 'white', letterSpacing: 0.5 },
  tagline: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 6, textAlign: 'center', paddingHorizontal: 40 },
  formContainer: { flex: 0.55 },
  formCard: {
    flex: 1,
    backgroundColor: 'white',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 28,
    paddingTop: 32,
    paddingBottom: 20,
  },
  formTitle: { fontSize: 22, fontWeight: '700', color: '#1565c0', marginBottom: 20 },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#c62828',
  },
  errorText: { fontSize: 13, color: '#c62828', flex: 1 },
  input: { marginBottom: 14, backgroundColor: 'white' },
  button: { marginTop: 8, borderRadius: 12 },
  buttonContent: { height: 50 },
  buttonLabel: { fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
  helpText: { textAlign: 'center', color: '#999', fontSize: 12, marginTop: 20 },
});
