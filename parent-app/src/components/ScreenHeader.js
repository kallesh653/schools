import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function ScreenHeader({ title, navigation, onRefresh, refreshing }) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1565c0" />
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation?.navigate('Dashboard')}
      >
        <MaterialCommunityIcons name="arrow-left" size={24} color="#fff" />
      </TouchableOpacity>

      <Text style={styles.title} numberOfLines={1}>{title}</Text>

      <TouchableOpacity
        style={styles.refreshBtn}
        onPress={onRefresh}
        disabled={refreshing}
      >
        <MaterialCommunityIcons
          name={refreshing ? 'loading' : 'refresh'}
          size={24}
          color={refreshing ? 'rgba(255,255,255,0.5)' : '#fff'}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1565c0',
    paddingTop: 44,
    paddingBottom: 12,
    paddingHorizontal: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  backBtn: {
    padding: 8,
    borderRadius: 20,
  },
  title: {
    flex: 1,
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginHorizontal: 4,
  },
  refreshBtn: {
    padding: 8,
    borderRadius: 20,
  },
});
