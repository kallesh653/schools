import React, { useContext, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DrawerContext } from '../context/DrawerContext';

export default function ScreenHeader({ title, navigation, onRefresh, refreshing, subtitle }) {
  const { openDrawer } = useContext(DrawerContext);
  const spinAnim = useRef(new Animated.Value(0)).current;

  const handleRefresh = () => {
    if (refreshing) return;
    Animated.timing(spinAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start(() => spinAnim.setValue(0));
    onRefresh && onRefresh();
  };

  const spin = spinAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a237e" />

      {/* Left: Back + Menu */}
      <View style={styles.leftSection}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => navigation?.navigate('Dashboard')}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <MaterialCommunityIcons name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Center: Title */}
      <View style={styles.centerSection}>
        <View style={styles.logoMini}>
          <MaterialCommunityIcons name="school" size={14} color="#FFB300" />
        </View>
        <View>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      </View>

      {/* Right: Menu + Refresh */}
      <View style={styles.rightSection}>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={handleRefresh}
          disabled={refreshing}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Animated.View style={{ transform: [{ rotate: refreshing ? '0deg' : spin }] }}>
            <MaterialCommunityIcons
              name="refresh"
              size={22}
              color={refreshing ? 'rgba(255,255,255,0.4)' : '#fff'}
            />
          </Animated.View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={openDrawer}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <MaterialCommunityIcons name="dots-vertical" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Bottom wave decoration */}
      <View style={styles.bottomWave} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a237e',
    paddingTop: 46,
    paddingBottom: 16,
    paddingHorizontal: 4,
    elevation: 6,
    shadowColor: '#1a237e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    overflow: 'hidden',
  },
  bottomWave: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255,179,0,0.4)',
  },
  leftSection: {
    width: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 4,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingRight: 4,
  },
  logoMini: {
    width: 26, height: 26, borderRadius: 7,
    backgroundColor: 'rgba(255,179,0,0.15)',
    borderWidth: 1, borderColor: 'rgba(255,179,0,0.4)',
    alignItems: 'center', justifyContent: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
    fontWeight: '500',
    marginTop: 1,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
