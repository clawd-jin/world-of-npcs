import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';

// Types for NPC data
interface Skill {
  name: string;
  level: number; // 1-100
  icon: string;
}

interface NPC {
  id: string;
  name: string;
  state: string;
  zone: string;
  mood: string;
  energy: number; // 0-100
  level: number;
  xp: number;
  skills: Skill[];
}

interface DemoStatus {
  timestamp: string;
  npcs: NPC[];
}

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
  success: '#00E676',
  successLight: '#00FF88',
  warning: '#FFD93D',
  warningLight: '#FFE566',
  error: '#FF5252',
  text: '#FFFFFF',
  textSecondary: '#A0A0B0',
  textMuted: '#6B6B80',
  border: '#2D2D4A',
  borderLight: '#3D3D5A',
  energyFull: '#00E676',
  energyMedium: '#FFD93D',
  energyLow: '#FF5252',
};

const API_BASE = 'http://localhost:3001/api';

// Skill icons mapping
const SKILL_ICONS: Record<string, string> = {
  coding: '💻',
  research: '🔬',
  delivery: '📦',
  piloting: '🚀',
  engineering: '⚙️',
  negotiation: '🤝',
  combat: '⚔️',
  diplomacy: '🎭',
  cooking: '🍔',
  mechanics: '🔧',
  medical: '💉',
  stealth: '🌑',
};

// Animated counter component
const AnimatedCounter = (props: { value: number; duration?: number; style?: any }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: props.value,
      duration: props.duration || 1000,
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

// Energy Bar Component
const EnergyBar = (props: { energy: number; size?: 'small' | 'medium' | 'large' }) => {
  const { energy, size = 'medium' } = props;
  
  const getEnergyColor = (e: number) => {
    if (e > 60) return COLORS.energyFull;
    if (e > 30) return COLORS.energyMedium;
    return COLORS.energyLow;
  };

  const dimensions = {
    small: { height: 6, width: 60, borderRadius: 3 },
    medium: { height: 10, width: 80, borderRadius: 5 },
    large: { height: 14, width: 100, borderRadius: 7 },
  }[size];

  const energyColor = getEnergyColor(energy);

  return (
    <View style={[styles.energyBarContainer, dimensions]}>
      <View 
        style={[
          styles.energyBarFill, 
          { 
            width: `${energy}%`, 
            backgroundColor: energyColor,
            height: dimensions.height,
            borderRadius: dimensions.borderRadius,
          }
        ]} 
      />
    </View>
  );
};

// Skill Badge Component
const SkillBadge = (props: { skill: Skill }) => {
  const { skill } = props;
  const icon = SKILL_ICONS[skill.name.toLowerCase()] || '⭐';
  
  const getLevelColor = (level: number) => {
    if (level >= 80) return COLORS.success;
    if (level >= 50) return COLORS.primary;
    if (level >= 25) return COLORS.warning;
    return COLORS.textMuted;
  };

  return (
    <View style={styles.skillBadge}>
      <Text style={styles.skillIcon}>{icon}</Text>
      <View style={styles.skillInfo}>
        <Text style={styles.skillName}>{skill.name}</Text>
        <View style={styles.skillLevelBar}>
          <View 
            style={[
              styles.skillLevelFill, 
              { 
                width: `${skill.level}%`,
                backgroundColor: getLevelColor(skill.level),
              }
            ]} 
          />
        </View>
      </View>
      <Text style={[styles.skillLevelText, { color: getLevelColor(skill.level) }]}>
        {skill.level}
      </Text>
    </View>
  );
};

// Mood Indicator Component
const MoodIndicator = (props: { mood: string; energy: number }) => {
  const { mood, energy } = props;
  
  const getMoodEmoji = (m: string): string => {
    const moodMap: Record<string, string> = {
      determined: '💪',
      greedy: '💰',
      hungry: '🍔',
      mad: '🧪',
      excited: '🎉',
      bureaucratic: '📋',
      loyal: '🐱',
      optimistic: '🦀',
      friendly: '😊',
      focused: '🎯',
      tired: '😴',
      happy: '😄',
      stressed: '😰',
      bored: '😐',
      confused: '😵',
      motivated: '🔥',
      sleepy: '😪',
      angry: '😠',
      curious: '🧐',
      playful: '😜',
    };
    return moodMap[m.toLowerCase()] || '😊';
  };

  const getMoodColor = (m: string, e: number): string => {
    if (e < 20) return COLORS.error;
    const positiveMoods = ['happy', 'excited', 'determined', 'optimistic', 'friendly', 'motivated', 'playful'];
    const negativeMoods = ['angry', 'stressed', 'tired', 'bored', 'confused', 'hungry'];
    
    if (positiveMoods.includes(m.toLowerCase())) return COLORS.success;
    if (negativeMoods.includes(m.toLowerCase())) return COLORS.warning;
    return COLORS.primary;
  };

  return (
    <View style={styles.moodContainer}>
      <View style={[styles.moodBubble, { borderColor: getMoodColor(mood, energy) }]}>
        <Text style={styles.moodEmoji}>{getMoodEmoji(mood)}</Text>
      </View>
      <Text style={[styles.moodText, { color: getMoodColor(mood, energy) }]}>
        {mood}
      </Text>
    </View>
  );
};

// Level Badge Component
const LevelBadge = (props: { level: number; xp: number }) => {
  const { level, xp } = props;
  const xpForNextLevel = level * 100;
  const progress = (xp / xpForNextLevel) * 100;

  const getRankTitle = (lvl: number): string => {
    if (lvl >= 50) return '👑 Legend';
    if (lvl >= 40) return '⭐ Star';
    if (lvl >= 30) return '🔥 Pro';
    if (lvl >= 20) return '💫 Expert';
    if (lvl >= 10) return '🎯 Skilled';
    if (lvl >= 5) return '🌱 Novice';
    return '🥚 Rookie';
  };

  return (
    <View style={styles.levelContainer}>
      <View style={styles.levelBadge}>
        <Text style={styles.levelNumber}>{level}</Text>
      </View>
      <View style={styles.levelInfo}>
        <Text style={styles.rankTitle}>{getRankTitle(level)}</Text>
        <View style={styles.xpBarContainer}>
          <View style={[styles.xpBarFill, { width: `${Math.min(progress, 100)}%` }]} />
        </View>
        <Text style={styles.xpText}>{xp}/{xpForNextLevel} XP</Text>
      </View>
    </View>
  );
};

// Glow card component with press animation
const GlowCard = (props: { 
  children: React.ReactNode; 
  glowColor?: string; 
  onPress?: () => void;
  style?: any;
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, { toValue: 0.98, useNativeDriver: true }).start();
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
          styles.agentCard,
          props.glowColor ? { 
            shadowColor: props.glowColor,
            shadowOpacity: 0.4,
            shadowRadius: 15,
            elevation: 10,
            borderColor: props.glowColor + '40',
          } : {}
        ]}>
          {props.children}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Status indicator with pulse
const StatusDot = (props: { color: string; size?: number }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [pulseAnim]);

  return (
    <Animated.View 
      style={[
        styles.statusDot, 
        { 
          backgroundColor: props.color,
          width: props.size || 10,
          height: props.size || 10,
          transform: [{ scale: pulseAnim }],
        }
      ]} 
    />
  );
};

const AgentsScreen: React.FC = () => {
  const [status, setStatus] = useState<DemoStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [checkingAgent, setCheckingAgent] = useState<string | null>(null);
  const [lastCheckResult, setLastCheckResult] = useState<any>(null);

  // Default NPCs with enhanced data
  const defaultNPCs: NPC[] = [
    { 
      id: '1', 
      name: 'Turanga Leela', 
      state: 'active', 
      zone: 'Cryo-Pod Bay', 
      mood: 'determined',
      energy: 85,
      level: 42,
      xp: 3850,
      skills: [
        { name: 'piloting', level: 92 },
        { name: 'combat', level: 78 },
        { name: 'negotiation', level: 65 },
      ]
    },
    { 
      id: '2', 
      name: 'Bender Bending Rodriguez', 
      state: 'idle', 
      zone: 'Planet Express Ship', 
      mood: 'greedy',
      energy: 45,
      level: 38,
      xp: 3200,
      skills: [
        { name: 'coding', level: 88 },
        { name: 'engineering', level: 75 },
        { name: 'mechanics', level: 60 },
      ]
    },
    { 
      id: '3', 
      name: 'Philip J. Fry', 
      state: 'active', 
      zone: 'Delivery Zone 7', 
      mood: 'hungry',
      energy: 30,
      level: 25,
      xp: 1800,
      skills: [
        { name: 'delivery', level: 55 },
        { name: 'piloting', level: 40 },
        { name: 'cooking', level: 20 },
      ]
    },
    { 
      id: '4', 
      name: 'Professor Farnsworth', 
      state: 'working', 
      zone: 'Engine Room', 
      mood: 'mad',
      energy: 70,
      level: 55,
      xp: 5100,
      skills: [
        { name: 'research', level: 98 },
        { name: 'engineering', level: 95 },
        { name: 'medical', level: 45 },
      ]
    },
    { 
      id: '5', 
      name: 'Amy Wong', 
      state: 'active', 
      zone: 'Mars University', 
      mood: 'excited',
      energy: 92,
      level: 28,
      xp: 2450,
      skills: [
        { name: 'research', level: 72 },
        { name: 'engineering', level: 68 },
        { name: 'diplomacy', level: 50 },
      ]
    },
    { 
      id: '6', 
      name: 'Hermes Conrad', 
      state: 'busy', 
      zone: 'Accounting', 
      mood: 'bureaucratic',
      energy: 55,
      level: 33,
      xp: 2900,
      skills: [
        { name: 'negotiation', level: 85 },
        { name: 'diplomacy', level: 80 },
        { name: 'coding', level: 35 },
      ]
    },
  ];

  const fetchStatus = useCallback(async () => {
    try {
      setError(null);
      const response = await fetch(`${API_BASE}/demo/status`);
      
      if (response.ok) {
        const data = await response.json();
        // Merge API data with default NPC structure (fallback for missing fields)
        const enhancedNPCs = (data.npcs || defaultNPCs).slice(0, 6).map((npc: any, index: number) => ({
          ...defaultNPCs[index],
          ...npc,
          skills: npc.skills || defaultNPCs[index]?.skills || [],
          energy: npc.energy ?? defaultNPCs[index]?.energy ?? Math.floor(Math.random() * 60) + 40,
          level: npc.level ?? defaultNPCs[index]?.level ?? Math.floor(Math.random() * 30) + 10,
          xp: npc.xp ?? defaultNPCs[index]?.xp ?? Math.floor(Math.random() * 2000) + 500,
        }));
        setStatus({
          timestamp: data.timestamp || new Date().toISOString(),
          npcs: enhancedNPCs,
        });
      } else {
        setStatus({
          timestamp: new Date().toISOString(),
          npcs: defaultNPCs,
        });
      }
    } catch (err) {
      console.log('Using default NPCs (API unavailable)');
      setStatus({
        timestamp: new Date().toISOString(),
        npcs: defaultNPCs,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchStatus();
  }, [fetchStatus]);

  // Handle "Check on" action
  const handleCheckOn = async (targetAgentId: string) => {
    if (checkingAgent) return;
    
    setCheckingAgent(targetAgentId);
    try {
      const response = await fetch(`${API_BASE}/demo/check/${targetAgentId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}) // Random checker will be selected
      });
      
      if (response.ok) {
        const data = await response.json();
        setLastCheckResult(data);
        // Auto-hide result after 5 seconds
        setTimeout(() => setLastCheckResult(null), 5000);
      }
    } catch (err) {
      console.log('Check failed:', err);
    } finally {
      setCheckingAgent(null);
    }
  };

  // Get color based on NPC state
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

  // Get avatar emoji based on name
  const getAvatarEmoji = (name: string): string => {
    const nameMap: Record<string, string> = {
      'Turanga Leela': '👩‍🦰',
      'Bender Bending Rodriguez': '🤖',
      'Philip J. Fry': '👨‍🚀',
      'Professor Farnsworth': '👨‍🔬',
      'Amy Wong': '👩‍🎓',
      'Hermes Conrad': '👨‍💼',
      'Nibbler': '🐱',
      'Zoidberg': '🦀',
    };
    return nameMap[name] || '👤';
  };

  // Get background color for avatar based on name
  const getAvatarColor = (name: string): string => {
    const colorMap: Record<string, string> = {
      'Turanga Leela': '#FF6B9D30',
      'Bender Bending Rodriguez': '#6C5CE730',
      'Philip J. Fry': '#00D4FF30',
      'Professor Farnsworth': '#00B89430',
      'Amy Wong': '#FDCB6E30',
      'Hermes Conrad': '#E74C3C30',
      'Nibbler': '#A0A0B030',
      'Zoidberg': '#FF6B9D30',
    };
    return colorMap[name] || COLORS.cardBackgroundLight;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading crew...</Text>
      </View>
    );
  }

  const activeCount = status?.npcs.filter(n => n.state === 'active').length || 0;
  const idleCount = status?.npcs.filter(n => n.state === 'idle').length || 0;
  const busyCount = status?.npcs.filter(n => n.state === 'busy' || n.state === 'working').length || 0;
  const avgEnergy = status?.npcs.length 
    ? Math.round(status.npcs.reduce((acc, n) => acc + (n.energy || 0), 0) / status.npcs.length)
    : 0;

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
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>👥 Crew Agents</Text>
        <Text style={styles.headerSubtitle}>
          {status?.npcs.length || 0} team members
        </Text>
        {status?.timestamp && (
          <Text style={styles.timestamp}>
            Updated: {new Date(status.timestamp).toLocaleTimeString()}
          </Text>
        )}
      </View>

      {/* Stats Row */}
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: COLORS.success + '15' }]}>
          <StatusDot color={COLORS.success} size={12} />
          <AnimatedCounter value={activeCount} style={styles.statValue} />
          <Text style={styles.statLabel}>Active</Text>
        </View>
        
        <View style={[styles.statCard, { backgroundColor: COLORS.warning + '15' }]}>
          <StatusDot color={COLORS.warning} size={12} />
          <AnimatedCounter value={idleCount} style={styles.statValue} />
          <Text style={styles.statLabel}>Idle</Text>
        </View>
        
        <View style={[styles.statCard, { backgroundColor: COLORS.secondary + '15' }]}>
          <StatusDot color={COLORS.secondary} size={12} />
          <AnimatedCounter value={busyCount} style={styles.statValue} />
          <Text style={styles.statLabel}>Busy</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: COLORS.primary + '15' }]}>
          <Text style={styles.energyIcon}>⚡</Text>
          <AnimatedCounter value={avgEnergy} style={styles.statValue} />
          <Text style={styles.statLabel}>Avg Energy</Text>
        </View>
      </View>

      {/* Section Title */}
      <Text style={styles.sectionTitle}>🚀 Team Members</Text>
      
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>⚠️ Using cached data</Text>
        </View>
      )}
      
      {/* Check Result Display */}
      {lastCheckResult && (
        <View style={styles.checkResultBanner}>
          <Text style={styles.checkResultTitle}>🤖 Agent Interaction</Text>
          <Text style={styles.checkResultMessage}>{lastCheckResult.message}</Text>
          <View style={styles.checkResultMeta}>
            <Text style={styles.checkResultMetaText}>
              {lastCheckResult.checker?.name} → {lastCheckResult.checked?.name}
            </Text>
          </View>
        </View>
      )}
      
      {/* Agent List */}
      <View style={styles.agentsList}>
        {status?.npcs.map((npc, index) => (
          <GlowCard
            key={npc.id}
            glowColor={npc.state === 'active' ? COLORS.success : undefined}
            style={{ marginBottom: 16 }}
          >
            <View style={styles.agentCardInner}>
              {/* Avatar with glow */}
              <View style={[styles.agentAvatar, { backgroundColor: getAvatarColor(npc.name) }]}>
                <Text style={styles.agentAvatarEmoji}>{getAvatarEmoji(npc.name)}</Text>
                <View style={[styles.statusIndicator, { backgroundColor: getStateColor(npc.state) }]} />
              </View>
              
              {/* Agent Info */}
              <View style={styles.agentInfo}>
                <View style={styles.nameRow}>
                  <Text style={styles.agentName} numberOfLines={1}>{npc.name}</Text>
                  <View style={[styles.stateBadge, { backgroundColor: getStateColor(npc.state) + '20' }]}>
                    <Text style={[styles.stateText, { color: getStateColor(npc.state) }]}>
                      {npc.state.toUpperCase()}
                    </Text>
                  </View>
                </View>
                
                {/* Level & XP */}
                <LevelBadge level={npc.level} xp={npc.xp} />
                
                {/* Energy Bar */}
                <View style={styles.energyRow}>
                  <Text style={styles.energyLabel}>⚡ Energy</Text>
                  <EnergyBar energy={npc.energy} size="small" />
                  <Text style={styles.energyValue}>{npc.energy}%</Text>
                </View>
                
                {/* Mood */}
                <MoodIndicator mood={npc.mood} energy={npc.energy} />
                
                {/* Skills */}
                <View style={styles.skillsContainer}>
                  {npc.skills?.slice(0, 3).map((skill, idx) => (
                    <SkillBadge key={idx} skill={skill} />
                  ))}
                </View>
                
                {/* Zone */}
                <View style={styles.zoneRow}>
                  <Text style={styles.zoneIcon}>📍</Text>
                  <Text style={styles.zoneText} numberOfLines={1}>{npc.zone}</Text>
                </View>
                
                {/* Check On Button */}
                <TouchableOpacity
                  style={[
                    styles.checkOnButton,
                    checkingAgent === npc.id && styles.checkOnButtonDisabled
                  ]}
                  onPress={() => handleCheckOn(npc.id)}
                  disabled={checkingAgent !== null}
                >
                  <Text style={styles.checkOnButtonText}>
                    {checkingAgent === npc.agentId ? '🤔 Checking...' : '👀 Check On'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </GlowCard>
        ))}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  header: {
    marginBottom: 20,
    alignItems: 'center',
    paddingTop: 10,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.primary,
    marginTop: 6,
    fontWeight: '600',
  },
  timestamp: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 6,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 6,
  },
  statLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 4,
    fontWeight: '600',
  },
  energyIcon: {
    fontSize: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
    paddingLeft: 4,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.secondary,
  },
  errorBanner: {
    backgroundColor: COLORS.warning + '20',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  errorText: {
    color: COLORS.warning,
    fontSize: 12,
    textAlign: 'center',
    fontWeight: '600',
  },
  agentsList: {
    gap: 0,
  },
  agentCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 20,
    padding: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  agentCardInner: {
    flexDirection: 'row',
    padding: 14,
  },
  agentAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    position: 'relative',
  },
  agentAvatarEmoji: {
    fontSize: 32,
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: COLORS.cardBackground,
  },
  agentInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  agentName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
    marginRight: 8,
  },
  stateBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  stateText: {
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  // Level styles
  levelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  levelBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  levelNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  levelInfo: {
    flex: 1,
  },
  rankTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.secondaryLight,
    marginBottom: 4,
  },
  xpBarContainer: {
    height: 4,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  xpBarFill: {
    height: '100%',
    backgroundColor: COLORS.secondary,
    borderRadius: 2,
  },
  xpText: {
    fontSize: 9,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  // Energy styles
  energyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  energyLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginRight: 8,
    width: 60,
  },
  energyBarContainer: {
    backgroundColor: COLORS.border,
    overflow: 'hidden',
  },
  energyBarFill: {
    // width set dynamically
  },
  energyValue: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginLeft: 8,
    width: 35,
    textAlign: 'right',
  },
  // Mood styles
  moodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  moodBubble: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.cardBackgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    marginRight: 8,
  },
  moodEmoji: {
    fontSize: 14,
  },
  moodText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  // Skills styles
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  skillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackgroundLight,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  skillIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  skillInfo: {
    marginRight: 4,
  },
  skillName: {
    fontSize: 9,
    color: COLORS.textSecondary,
    textTransform: 'capitalize',
  },
  skillLevelBar: {
    width: 30,
    height: 3,
    backgroundColor: COLORS.border,
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 2,
  },
  skillLevelFill: {
    height: '100%',
    borderRadius: 2,
  },
  skillLevelText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  // Zone styles
  zoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  zoneIcon: {
    fontSize: 10,
    marginRight: 4,
  },
  zoneText: {
    fontSize: 11,
    color: COLORS.textMuted,
    flex: 1,
  },
  // Check On button styles
  checkOnButton: {
    backgroundColor: COLORS.primary + '20',
    borderWidth: 1,
    borderColor: COLORS.primary + '50',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 10,
    alignItems: 'center',
  },
  checkOnButtonDisabled: {
    opacity: 0.6,
    backgroundColor: COLORS.border,
  },
  checkOnButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
  },
  // Check result banner styles
  checkResultBanner: {
    backgroundColor: COLORS.secondary + '20',
    borderWidth: 1,
    borderColor: COLORS.secondary + '50',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  checkResultTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: 6,
  },
  checkResultMessage: {
    fontSize: 13,
    color: COLORS.text,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  checkResultMeta: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  checkResultMetaText: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  statusDot: {
    borderRadius: 4,
  },
});

export default AgentsScreen;
