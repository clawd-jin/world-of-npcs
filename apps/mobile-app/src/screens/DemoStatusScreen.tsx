import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Animated,
  Easing,
  TouchableOpacity,
  ViewStyle,
} from 'react-native';

// Types for NPC data
interface NPC {
  id: string;
  name: string;
  state: string;
  zone: string;
  mood: string;
}

interface DemoStatus {
  timestamp: string;
  npcs: NPC[];
}

// Futurama-themed color palette with rich visuals
const COLORS = {
  background: '#08080F',
  cardBackground: '#12121F',
  cardBorder: '#2A2A45',
  primary: '#00D4FF',
  secondary: '#6C5CE7',
  accent: '#FF6B9D',
  success: '#00E676',
  warning: '#FFD93D',
  error: '#FF5252',
  text: '#FFFFFF',
  textSecondary: '#A0A0B0',
  textMuted: '#6B6B80',
  glow: '#00D4FF',
};

// Character avatars and data
const CHARACTER_DATA: Record<string, { emoji: string; color: string; role: string }> = {
  'Turanga Leela': { emoji: '👩‍🦰', color: '#9B59B6', role: 'Captain' },
  'Bender Bending Rodriguez': { emoji: '🤖', color: '#2ECC71', role: 'Robot' },
  'Bender': { emoji: '🤖', color: '#2ECC71', role: 'Robot' },
  'Philip J. Fry': { emoji: '👨‍🚀', color: '#3498DB', role: 'Delivery Boy' },
  'Fry': { emoji: '👨‍🚀', color: '#3498DB', role: 'Delivery Boy' },
  'Professor Farnsworth': { emoji: '👨‍🔬', color: '#E67E22', role: 'CEO' },
  'Prof. Farnsworth': { emoji: '👨‍🔬', color: '#E67E22', role: 'CEO' },
  'Amy Wong': { emoji: '👩‍🎓', color: '#E91E63', role: 'Intern' },
  'Hermes Conrad': { emoji: '👨‍💼', color: '#1ABC9C', role: 'Accountant' },
  'Nibbler': { emoji: '🐱', color: '#6B5B95', role: 'Command Pet' },
  'Dr. Zoidberg': { emoji: '🦀', color: '#E74C3C', role: 'Doctor' },
  'Zoidberg': { emoji: '🦀', color: '#E74C3C', role: 'Doctor' },
  'default': { emoji: '👤', color: '#95A5A6', role: 'Unknown' },
};

// Animated Badge Component
const AnimatedBadge: React.FC<{ state: string; color: string }> = ({ state, color }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse animation
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    // Glow animation
    const glow = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1500,
          useNativeDriver: false,
        }),
      ])
    );
    glow.start();

    return () => {
      pulse.stop();
      glow.stop();
    };
  }, [scaleAnim, glowAnim]);

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  return (
    <Animated.View
      style={[
        styles.stateBadge,
        {
          backgroundColor: color + '25',
          borderColor: color,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <Animated.View
        style={[
          styles.badgeGlow,
          { backgroundColor: color, opacity: glowOpacity },
        ]}
      />
      <Text style={[styles.stateText, { color }]}>
        {state.toUpperCase()}
      </Text>
    </Animated.View>
  );
};

// Character Card Component
const CharacterCard: React.FC<{ npc: NPC; index: number }> = ({ npc, index }) => {
  const charData = CHARACTER_DATA[npc.name] || CHARACTER_DATA.default;
  const translateAnim = useRef(new Animated.Value(50)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Staggered entrance animation
    const delay = index * 100;
    Animated.parallel([
      Animated.timing(translateAnim, {
        toValue: 0,
        duration: 400,
        delay,
        easing: Easing.out(Easing.back(1.5)),
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [translateAnim, opacityAnim, index]);

  const getStateColor = (state: string): string => {
    switch (state.toLowerCase()) {
      case 'active': return COLORS.success;
      case 'idle': return COLORS.warning;
      case 'busy':
      case 'working': return COLORS.secondary;
      case 'hungry': return COLORS.accent;
      default: return COLORS.textSecondary;
    }
  };

  const getMoodEmoji = (mood: string): string => {
    const moodMap: Record<string, string> = {
      determined: '💪', greedy: '💰', hungry: '🍽️', mad: '🧪',
      excited: '🎉', bureaucratic: '📋', loyal: '🐱', optimistic: '🦀',
      working: '⚡',
    };
    return moodMap[mood.toLowerCase()] || '😊';
  };

  const stateColor = getStateColor(npc.state);

  return (
    <Animated.View
      style={[
        styles.npcCard,
        {
          transform: [{ translateY: translateAnim }],
          opacity: opacityAnim,
          borderColor: charData.color + '40',
        },
      ]}
    >
      {/* Card Glow Effect */}
      <View style={[styles.cardGlow, { backgroundColor: charData.color + '15' }]} />

      {/* Card Header */}
      <View style={styles.cardHeader}>
        {/* Avatar */}
        <View style={[styles.avatarContainer, { borderColor: charData.color }]}>
          <Text style={styles.avatarEmoji}>{charData.emoji}</Text>
          <View style={[styles.statusDot, { backgroundColor: stateColor }]} />
        </View>

        {/* Name & Role */}
        <View style={styles.nameContainer}>
          <Text style={styles.npcName} numberOfLines={1}>{npc.name}</Text>
          <Text style={[styles.npcRole, { color: charData.color }]}>{charData.role}</Text>
        </View>

        {/* Animated Badge */}
        <AnimatedBadge state={npc.state} color={stateColor} />
      </View>

      {/* Card Details */}
      <View style={styles.cardDetails}>
        <View style={styles.detailItem}>
          <Text style={styles.detailIcon}>📍</Text>
          <Text style={styles.detailLabel}>Location</Text>
          <Text style={styles.detailValue}>{npc.zone}</Text>
        </View>
        <View style={styles.detailDivider} />
        <View style={styles.detailItem}>
          <Text style={styles.detailIcon}>{getMoodEmoji(npc.mood)}</Text>
          <Text style={styles.detailLabel}>Mood</Text>
          <Text style={styles.detailValue}>{npc.mood}</Text>
        </View>
      </View>

      {/* Action Indicator */}
      <View style={[styles.actionBar, { borderTopColor: charData.color + '30' }]}>
        <Text style={[styles.actionText, { color: charData.color }]}>
          ▶ Tap for details
        </Text>
      </View>
    </Animated.View>
  );
};

// Stats Card with Animation
const StatsCard: React.FC<{
  title: string;
  value: number;
  icon: string;
  color: string;
  index: number;
}> = ({ title, value, icon, color, index }) => {
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      delay: index * 150,
      friction: 6,
      tension: 100,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim, index]);

  return (
    <Animated.View
      style={[
        styles.statCard,
        {
          transform: [{ scale: scaleAnim }],
          borderColor: color + '40',
        },
      ]}
    >
      <View style={[styles.statGlow, { backgroundColor: color + '20' }]} />
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statNumber, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{title}</Text>
    </Animated.View>
  );
};

const DemoStatusScreen: React.FC = () => {
  const [status, setStatus] = useState<DemoStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/demo/status');
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      } else {
        setStatus(getDemoData());
      }
    } catch (error) {
      setStatus(getDemoData());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const getDemoData = (): DemoStatus => ({
    timestamp: new Date().toISOString(),
    npcs: [
      { id: '1', name: 'Turanga Leela', state: 'active', zone: 'Cryo-Pod Bay', mood: 'determined' },
      { id: '2', name: 'Bender Bending Rodriguez', state: 'idle', zone: 'Planet Express Ship', mood: 'greedy' },
      { id: '3', name: 'Philip J. Fry', state: 'active', zone: 'Delivery Zone 7', mood: 'hungry' },
      { id: '4', name: 'Professor Farnsworth', state: 'working', zone: 'Engine Room', mood: 'mad' },
      { id: '5', name: 'Amy Wong', state: 'active', zone: 'Mars University', mood: 'excited' },
      { id: '6', name: 'Hermes Conrad', state: 'busy', zone: 'Accounting', mood: 'bureaucratic' },
      { id: '7', name: 'Nibbler', state: 'active', zone: 'Command Deck', mood: 'loyal' },
      { id: '8', name: 'Dr. Zoidberg', state: 'hungry', zone: 'Mess Hall', mood: 'optimistic' },
    ],
  });

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchStatus();
  }, [fetchStatus]);

  if (loading) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingEmoji}>🚀</Text>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading Planet Express HQ...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const activeCount = status?.npcs.filter(n => n.state === 'active').length || 0;
  const idleCount = status?.npcs.filter(n => n.state === 'idle').length || 0;
  const busyCount = status?.npcs.filter(n => ['busy', 'working'].includes(n.state)).length || 0;

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* Hero Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerEmoji}>🚀</Text>
            <View>
              <Text style={styles.headerTitle}>Planet Express HQ</Text>
              <Text style={styles.headerSubtitle}>Live Crew Status</Text>
            </View>
          </View>
          <View style={styles.headerDecor}>
            <Text style={styles.headerDecorEmoji}>🌟</Text>
          </View>
        </View>

        {/* Animated Stats Row */}
        <View style={styles.statsRow}>
          <StatsCard
            title="Total Crew"
            value={status?.npcs.length || 0}
            icon="👥"
            color={COLORS.primary}
            index={0}
          />
          <StatsCard
            title="Active"
            value={activeCount}
            icon="⚡"
            color={COLORS.success}
            index={1}
          />
          <StatsCard
            title="Idle"
            value={idleCount}
            icon="💤"
            color={COLORS.warning}
            index={2}
          />
        </View>

        {/* Last Updated */}
        {status?.timestamp && (
          <View style={styles.timestampContainer}>
            <Text style={styles.timestampText}>
              🕐 Last updated: {new Date(status.timestamp).toLocaleTimeString()}
            </Text>
          </View>
        )}

        {/* Section Title */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🎬 Crew Members</Text>
          <View style={styles.sectionDecor} />
        </View>

        {/* Character Cards */}
        <View style={styles.npcGrid}>
          {status?.npcs.map((npc, index) => (
            <CharacterCard key={npc.id} npc={npc} index={index} />
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            💙 Powered by Planet Express Inc.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingEmoji: {
    fontSize: 64,
    marginBottom: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  header: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    overflow: 'hidden',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerEmoji: {
    fontSize: 42,
    marginRight: 14,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    textShadowColor: COLORS.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.primary,
    marginTop: 2,
    fontWeight: '600',
  },
  headerDecor: {
    position: 'absolute',
    right: -10,
    top: -10,
  },
  headerDecorEmoji: {
    fontSize: 60,
    opacity: 0.15,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 14,
    marginHorizontal: 4,
    alignItems: 'center',
    borderWidth: 1,
    overflow: 'hidden',
  },
  statGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    borderRadius: 16,
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  statNumber: {
    fontSize: 26,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
    fontWeight: '600',
  },
  timestampContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  timestampText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  sectionDecor: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.cardBorder,
    marginLeft: 12,
  },
  npcGrid: {
    gap: 14,
  },
  npcCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  cardGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    borderRadius: 18,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    position: 'relative',
    zIndex: 1,
  },
  avatarContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    marginRight: 12,
    position: 'relative',
  },
  avatarEmoji: {
    fontSize: 28,
  },
  statusDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: COLORS.cardBackground,
  },
  nameContainer: {
    flex: 1,
  },
  npcName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  npcRole: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 1,
  },
  stateBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  badgeGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  stateText: {
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  cardDetails: {
    flexDirection: 'row',
    backgroundColor: COLORS.background + '60',
    borderRadius: 12,
    padding: 12,
    position: 'relative',
    zIndex: 1,
  },
  detailItem: {
    flex: 1,
    alignItems: 'center',
  },
  detailDivider: {
    width: 1,
    backgroundColor: COLORS.cardBorder,
    marginHorizontal: 10,
  },
  detailIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
    fontWeight: '500',
  },
  actionBar: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  actionText: {
    fontSize: 11,
    fontWeight: '600',
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
});

export default DemoStatusScreen;
