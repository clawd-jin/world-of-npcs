import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Animated,
  Easing,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';

// Theme colors
const COLORS = {
  background: '#0D0D1A',
  cardBackground: '#1A1A2E',
  cardBackgroundLight: '#252542',
  cardBackgroundLighter: '#2F2F55',
  primary: '#00D4FF',
  primaryLight: '#4DE8FF',
  secondary: '#6C5CE7',
  secondaryLight: '#8B7CF8',
  accent: '#FF6B9D',
  accentLight: '#FF8FB3',
  warning: '#FDCB6E',
  warningLight: '#FFE066',
  success: '#00B894',
  successLight: '#00D9A8',
  danger: '#E74C3C',
  text: '#FFFFFF',
  textSecondary: '#A0A0B0',
  textMuted: '#6B6B80',
  border: '#2D2D4A',
  borderLight: '#3D3D5A',
};

interface HomeScreenProps {
  navigation?: NavigationProp<any>;
}

// Animated counter component
const AnimatedCounter = (props: { value: number; duration?: number; style?: any }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: props.value,
      duration: props.duration || 1200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    const listener = animatedValue.addListener(({ value }) => {
      setDisplayValue(Math.round(value));
    });

    return () => animatedValue.removeListener(listener);
  }, [props.value, animatedValue]);

  return <Text style={props.style}>{displayValue}</Text>;
};

// Pulse animation wrapper
const PulseCard = (props: { children: React.ReactNode; color?: string; onPress?: () => void; style?: any }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.96, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, props.style]}>
      <TouchableOpacity
        onPress={props.onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={1}
      >
        <View style={[
          styles.pulseCard,
          props.color ? { 
            shadowColor: props.color,
            shadowOpacity: 0.3,
            shadowRadius: 15,
            elevation: 10,
            borderColor: props.color + '30',
          } : {}
        ]}>
          {props.children}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation: nav }) => {
  const navigation = useNavigation();
  const navToUse = nav || navigation;
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    npcs: 8,
    tasks: 12,
    bounties: 4,
  });

  // Header animation
  const headerAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [headerAnim]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setStats({
        npcs: Math.floor(Math.random() * 5) + 6,
        tasks: Math.floor(Math.random() * 10) + 8,
        bounties: Math.floor(Math.random() * 5) + 2,
      });
      setRefreshing(false);
    }, 1200);
  }, []);

  const navigateTo = (screen: string) => {
    if (navToUse) {
      (navToUse as any).navigate(screen);
    }
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={COLORS.primary}
          colors={[COLORS.primary]}
        />
      }
    >
      {/* Welcome Header with gradient effect */}
      <Animated.View style={[
        styles.welcomeCard,
        {
          opacity: headerAnim,
          transform: [{
            translateY: headerAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [-20, 0],
            })
          }]
        }
      ]}>
        <View style={styles.welcomeHeaderRow}>
          <Text style={styles.logoEmoji}>🚀</Text>
          <View style={styles.welcomeTitleContainer}>
            <Text style={styles.welcomeTitle}>Planet Express HQ</Text>
            <Text style={styles.welcomeSubtitle}>Delivering the Future</Text>
          </View>
        </View>
        <View style={styles.welcomeDecorLine} />
        <Text style={styles.welcomeTagline}>"It's a delivery dilemma, Fry!"</Text>
      </Animated.View>

      {/* Enhanced Stats Row */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>📊 Quick Stats</Text>
      </View>
      
      <View style={styles.statsRow}>
        <PulseCard 
          color={COLORS.primary}
          onPress={() => navigateTo('Agents')}
          style={styles.statCardWrapper}
        >
          <View style={[styles.statCard, { backgroundColor: COLORS.primary + '15' }]}>
            <View style={[styles.statIconCircle, { backgroundColor: COLORS.primary + '25' }]}>
              <Text style={styles.statEmoji}>🤖</Text>
            </View>
            <AnimatedCounter value={stats.npcs} style={styles.statValue} />
            <Text style={styles.statLabel}>NPCs</Text>
            <View style={[styles.statGlowBar, { backgroundColor: COLORS.primary }]} />
          </View>
        </PulseCard>
        
        <PulseCard 
          color={COLORS.secondary}
          onPress={() => navigateTo('Tasks')}
          style={styles.statCardWrapper}
        >
          <View style={[styles.statCard, { backgroundColor: COLORS.secondary + '15' }]}>
            <View style={[styles.statIconCircle, { backgroundColor: COLORS.secondary + '25' }]}>
              <Text style={styles.statEmoji}>📋</Text>
            </View>
            <AnimatedCounter value={stats.tasks} style={styles.statValue} />
            <Text style={styles.statLabel}>Tasks</Text>
            <View style={[styles.statGlowBar, { backgroundColor: COLORS.secondary }]} />
          </View>
        </PulseCard>
        
        <PulseCard 
          color={COLORS.accent}
          onPress={() => navigateTo('Bounties')}
          style={styles.statCardWrapper}
        >
          <View style={[styles.statCard, { backgroundColor: COLORS.accent + '15' }]}>
            <View style={[styles.statIconCircle, { backgroundColor: COLORS.accent + '25' }]}>
              <Text style={styles.statEmoji}>💀</Text>
            </View>
            <AnimatedCounter value={stats.bounties} style={styles.statValue} />
            <Text style={styles.statLabel}>Bounties</Text>
            <View style={[styles.statGlowBar, { backgroundColor: COLORS.accent }]} />
          </View>
        </PulseCard>
      </View>

      {/* Quick Links */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>⚡ Quick Links</Text>
      </View>

      <View style={styles.quickLinks}>
        <PulseCard 
          color={COLORS.success}
          onPress={() => navigateTo('World')}
          style={styles.quickLinkWrapper}
        >
          <View style={styles.quickLinkCard}>
            <View style={[styles.quickLinkIcon, { backgroundColor: COLORS.success + '20' }]}>
              <Text style={styles.quickLinkEmoji}>🌍</Text>
            </View>
            <Text style={styles.quickLinkTitle}>World Map</Text>
            <Text style={styles.quickLinkDesc}>Explore the galaxy</Text>
          </View>
        </PulseCard>

        <PulseCard 
          color={COLORS.warning}
          onPress={() => navigateTo('Economy')}
          style={styles.quickLinkWrapper}
        >
          <View style={styles.quickLinkCard}>
            <View style={[styles.quickLinkIcon, { backgroundColor: COLORS.warning + '20' }]}>
              <Text style={styles.quickLinkEmoji}>🛒</Text>
            </View>
            <Text style={styles.quickLinkTitle}>Marketplace</Text>
            <Text style={styles.quickLinkDesc}>Buy & sell items</Text>
          </View>
        </PulseCard>

        <PulseCard 
          color={COLORS.primary}
          onPress={() => navigateTo('Profile')}
          style={styles.quickLinkWrapper}
        >
          <View style={styles.quickLinkCard}>
            <View style={[styles.quickLinkIcon, { backgroundColor: COLORS.primary + '20' }]}>
              <Text style={styles.quickLinkEmoji}>👤</Text>
            </View>
            <Text style={styles.quickLinkTitle}>Profile</Text>
            <Text style={styles.quickLinkDesc}>Your stats & settings</Text>
          </View>
        </PulseCard>

        <PulseCard 
          color={COLORS.danger}
          onPress={() => navigateTo('DemoStatus')}
          style={styles.quickLinkWrapper}
        >
          <View style={styles.quickLinkCard}>
            <View style={[styles.quickLinkIcon, { backgroundColor: COLORS.danger + '20' }]}>
              <Text style={styles.quickLinkEmoji}>📡</Text>
            </View>
            <Text style={styles.quickLinkTitle}>Live Status</Text>
            <Text style={styles.quickLinkDesc}>Real-time NPC data</Text>
          </View>
        </PulseCard>
      </View>

      {/* Recent Activity */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>📜 Recent Activity</Text>
      </View>

      <View style={styles.activityCard}>
        <View style={[styles.activityIcon, { backgroundColor: COLORS.success + '20' }]}>
          <Text style={styles.activityEmoji}>🚀</Text>
        </View>
        <View style={styles.activityContent}>
          <Text style={styles.activityText}>Ship "Nimbus" arrived at Mars Colony</Text>
          <View style={styles.activityMeta}>
            <Text style={styles.activityTime}>2 hours ago</Text>
            <View style={[styles.activityDot, { backgroundColor: COLORS.success }]} />
          </View>
        </View>
      </View>

      <View style={styles.activityCard}>
        <View style={[styles.activityIcon, { backgroundColor: COLORS.warning + '20' }]}>
          <Text style={styles.activityEmoji}>📦</Text>
        </View>
        <View style={styles.activityContent}>
          <Text style={styles.activityText}>Package #4281 delivered to Earth</Text>
          <View style={styles.activityMeta}>
            <Text style={styles.activityTime}>5 hours ago</Text>
            <View style={[styles.activityDot, { backgroundColor: COLORS.success }]} />
          </View>
        </View>
      </View>

      <View style={styles.activityCard}>
        <View style={[styles.activityIcon, { backgroundColor: COLORS.secondary + '20' }]}>
          <Text style={styles.activityEmoji}>🤖</Text>
        </View>
        <View style={styles.activityContent}>
          <Text style={styles.activityText}>Agent Bender completed maintenance</Text>
          <View style={styles.activityMeta}>
            <Text style={styles.activityTime}>Yesterday</Text>
            <View style={[styles.activityDot, { backgroundColor: COLORS.textMuted }]} />
          </View>
        </View>
      </View>

      {/* Credits Footer */}
      <View style={styles.footerCard}>
        <Text style={styles.footerEmoji}>🦀</Text>
        <Text style={styles.footerText}>Why not Zoidberg?</Text>
        <Text style={styles.footerSubtext}>- Dr. John A. Zoidberg</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  welcomeCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 8,
  },
  welcomeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoEmoji: {
    fontSize: 48,
    marginRight: 16,
  },
  welcomeTitleContainer: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: COLORS.text,
    letterSpacing: 0.5,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: COLORS.primary,
    marginTop: 4,
    fontWeight: '600',
    letterSpacing: 1,
  },
  welcomeDecorLine: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 16,
  },
  welcomeTagline: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 12,
    paddingLeft: 4,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.secondary,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCardWrapper: {
    flex: 1,
  },
  statCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 18,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statEmoji: {
    fontSize: 22,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
    fontWeight: '600',
  },
  statGlowBar: {
    width: 30,
    height: 3,
    borderRadius: 2,
    marginTop: 10,
  },
  quickLinks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  quickLinkWrapper: {
    width: '47%',
  },
  quickLinkCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quickLinkIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickLinkEmoji: {
    fontSize: 24,
  },
  quickLinkTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  quickLinkDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activityIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  activityEmoji: {
    fontSize: 20,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 6,
    fontWeight: '500',
  },
  activityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityTime: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  activityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: 10,
  },
  footerCard: {
    backgroundColor: COLORS.cardBackgroundLight,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  footerEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  footerText: {
    fontSize: 14,
    color: COLORS.text,
    fontStyle: 'italic',
  },
  footerSubtext: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  pulseCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
});

export default HomeScreen;
