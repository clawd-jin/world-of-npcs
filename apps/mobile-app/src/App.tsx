import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  StatusBar,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import WorldScreen from './screens/WorldScreen';
import DemoStatusScreen from './screens/DemoStatusScreen';
import HomeScreen from './screens/HomeScreen';
import AgentsScreen from './screens/AgentsScreen';
import EconomyScreen from './screens/EconomyScreen';
import ProfileScreen from './screens/ProfileScreen';
import ActivityScreen from './screens/ActivityScreen';
import SettingsScreen from './screens/SettingsScreen';

// ============================================
// FUTURAMA-THEMED ENHANCED DESIGN SYSTEM
// ============================================

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const COLORS = {
  background: '#0D0D1A',
  backgroundGradientStart: '#0D0D1A',
  backgroundGradientEnd: '#1A1A2E',
  cardBackground: '#1A1A2E',
  cardBackgroundLight: '#252542',
  cardBackgroundLighter: '#2F2F55',
  primary: '#00D4FF',
  primaryLight: '#4DE8FF',
  primaryDark: '#00A8CC',
  secondary: '#6C5CE7',
  secondaryLight: '#8B7CF8',
  accent: '#FF6B9D',
  accentLight: '#FF8FB3',
  warning: '#FDCB6E',
  warningLight: '#FFE066',
  success: '#00B894',
  successLight: '#00D9A8',
  danger: '#E74C3C',
  dangerLight: '#FF6B5B',
  text: '#FFFFFF',
  textSecondary: '#A0A0B0',
  textMuted: '#6B6B80',
  border: '#2D2D4A',
  borderLight: '#3D3D5A',
  glowPrimary: 'rgba(0, 212, 255, 0.4)',
  glowSecondary: 'rgba(108, 92, 231, 0.4)',
  glowAccent: 'rgba(255, 107, 157, 0.4)',
};

// ============================================
// ANIMATED COMPONENTS
// ============================================

const PulseView = (props: { children: React.ReactNode; color?: string; style?: any }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
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
        props.style,
        { 
          transform: [{ scale: pulseAnim }],
          shadowColor: props.color || COLORS.primary,
          shadowOpacity: 0.5,
          shadowRadius: 15,
          elevation: 8,
        }
      ]}
    >
      {props.children}
    </Animated.View>
  );
};

const ProgressBar = (props: { progress: number; color?: string; height?: number }) => {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const color = props.color || COLORS.primary;
  const height = props.height || 8;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: props.progress,
      duration: 800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [props.progress, progressAnim]);

  const width = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.progressBarBg, { height }]}>
      <Animated.View 
        style={[
          styles.progressBarFill, 
          { 
            backgroundColor: color,
            width,
            height,
          }
        ]} 
      />
    </View>
  );
};

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

// ============================================
// SHARED COMPONENTS
// ============================================

const LoadingView = (props: { message?: string }) => {
  const pulseAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.8,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [pulseAnim]);

  return (
    <View style={styles.centeredContent}>
      <Animated.Text 
        style={[
          styles.loadingEmoji, 
          { transform: [{ scale: pulseAnim }] }
        ]}
      >
        🚀
      </Animated.Text>
      <Text style={styles.loadingText}>{props.message || 'Loading...'}</Text>
    </View>
  );
};

const ErrorView = (props: { message?: string; onRetry?: () => void }) => {
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
      ])
    );
    const timeout = setTimeout(() => animation.stop(), 300);
    return () => { clearTimeout(timeout); animation.stop(); };
  }, [shakeAnim]);

  return (
    <View style={styles.errorContainer}>
      <Animated.Text 
        style={[styles.errorEmoji, { transform: [{ translateX: shakeAnim }] }]}
      >
        😱
      </Animated.Text>
      <Text style={styles.errorTitle}>{props.message || 'Something went wrong'}</Text>
      {props.onRetry && (
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={props.onRetry}
          activeOpacity={0.8}
        >
          <Text style={styles.retryButtonText}>🔄 Try Again</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const EmptyState = (props: { emoji?: string; title?: string; message?: string }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <Animated.View style={[styles.emptyContainer, { opacity: fadeAnim }]}>
      <Text style={styles.emptyEmoji}>{props.emoji || '📭'}</Text>
      <Text style={styles.emptyTitle}>{props.title || 'Nothing here yet'}</Text>
      <Text style={styles.emptyMessage}>{props.message || 'Check back later!'}</Text>
    </Animated.View>
  );
};

const GlowCard = (props: { 
  children: React.ReactNode; 
  glowColor?: string; 
  onPress?: () => void;
  style?: any;
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
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
          styles.glowCard,
          props.glowColor ? { 
            shadowColor: props.glowColor,
            shadowOpacity: 0.3,
            shadowRadius: 12,
            elevation: 8,
            borderColor: props.glowColor + '40',
          } : {}
        ]}>
          {props.children}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const ScreenWrapper = (props: {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
  loading?: boolean;
  error?: string;
  onRetry?: () => void;
  gradient?: boolean;
}) => {
  if (props.loading) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerEmojiContainer}>
              <Text style={styles.headerEmoji}>🚀</Text>
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerText}>{props.title}</Text>
              {props.subtitle && <Text style={styles.headerSubtext}>{props.subtitle}</Text>}
            </View>
          </View>
        </View>
        <LoadingView />
      </SafeAreaView>
    );
  }

  if (props.error) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerEmojiContainer}>
              <Text style={styles.headerEmoji}>🚀</Text>
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerText}>{props.title}</Text>
              {props.subtitle && <Text style={styles.headerSubtext}>{props.subtitle}</Text>}
            </View>
          </View>
        </View>
        <ErrorView message={props.error} onRetry={props.onRetry} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.screen, props.gradient && styles.screenGradient]}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerEmojiContainer}>
            <Text style={styles.headerEmoji}>🚀</Text>
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerText}>{props.title}</Text>
            {props.subtitle && <Text style={styles.headerSubtext}>{props.subtitle}</Text>}
          </View>
        </View>
      </View>
      <ScrollView 
        contentContainerStyle={styles.content} 
        showsVerticalScrollIndicator={false}
        bounces={true}
      >
        {props.children}
      </ScrollView>
    </SafeAreaView>
  );
};

// ============================================
// MOCK DATA
// ============================================

const getMockTasks = () => [
  {
    id: '1',
    agentId: null,
    ownerUserId: 'player1',
    type: 'delivery',
    title: 'Deliver Package to Mars',
    description: 'Package contains sensitive quantum components. Handle with care!',
    priority: 1,
    status: 'queued',
    mappedBehaviorId: null,
    rewardValue: 500,
    createdAt: new Date().toISOString(),
    completedAt: null,
    progress: 0,
  },
  {
    id: '2',
    agentId: 'agent-1',
    ownerUserId: 'player1',
    type: 'coding',
    title: 'Update Navigation System',
    description: 'Fix the autopilot drift issue on route 66.',
    priority: 2,
    status: 'in_progress',
    mappedBehaviorId: 'behavior-1',
    rewardValue: 300,
    createdAt: new Date().toISOString(),
    completedAt: null,
    progress: 65,
  },
  {
    id: '3',
    agentId: 'agent-2',
    ownerUserId: 'player1',
    type: 'research',
    title: 'Research New Fuel Type',
    description: 'Find alternative fuels for the Planet Express ship.',
    priority: 3,
    status: 'completed',
    mappedBehaviorId: 'behavior-2',
    rewardValue: 750,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    completedAt: new Date().toISOString(),
    progress: 100,
  },
  {
    id: '4',
    agentId: 'agent-3',
    ownerUserId: 'player1',
    type: 'design',
    title: 'Design New Logo',
    description: 'Create a fresh logo for the new Mars colony branch.',
    priority: 2,
    status: 'in_progress',
    mappedBehaviorId: 'behavior-3',
    rewardValue: 450,
    createdAt: new Date().toISOString(),
    completedAt: null,
    progress: 35,
  },
  {
    id: '5',
    agentId: null,
    ownerUserId: 'player1',
    type: 'meeting',
    title: 'Team Standup',
    description: 'Daily sync with the Planet Express crew.',
    priority: 1,
    status: 'queued',
    mappedBehaviorId: null,
    rewardValue: 100,
    createdAt: new Date().toISOString(),
    completedAt: null,
    progress: 0,
  },
];

const getMockBounties = () => [
  {
    id: 'bounty-001',
    title: 'Deliver Pizza to Mars Colony',
    description: 'Urgent pizza delivery to the Mars colony. Must arrive within 2 hours!',
    category: 'delivery',
    difficulty: 2,
    rewardCredits: 500,
    status: 'open',
    zoneAffinity: 'mars',
    expiresAt: new Date(Date.now() + 3600000).toISOString(),
  },
  {
    id: 'bounty-002',
    title: 'Repair Planet Express Ship Engine',
    description: 'The Nimbus engine is making a weird noise. Fix before the next run!',
    category: 'repair',
    difficulty: 4,
    rewardCredits: 1200,
    status: 'open',
    zoneAffinity: 'planet-express-hq',
    expiresAt: new Date(Date.now() + 86400000).toISOString(),
  },
  {
    id: 'bounty-003',
    title: 'Rescue Captured Package from Nudist Planet',
    description: 'Retrieve the package from the Naked Way World without causing an incident.',
    category: 'retrieval',
    difficulty: 3,
    rewardCredits: 800,
    status: 'claimed',
    zoneAffinity: 'naked-way',
    expiresAt: new Date(Date.now() + 172800000).toISOString(),
  },
  {
    id: 'bounty-004',
    title: 'Capture Live Bigfoot for Zoo',
    description: 'Professor wants a Bigfoot for the zoo. Catch one!',
    category: 'capture',
    difficulty: 5,
    rewardCredits: 2000,
    status: 'open',
    zoneAffinity: null,
    expiresAt: new Date(Date.now() + 604800000).toISOString(),
  },
  {
    id: 'bounty-005',
    title: 'Escort Turanga Leela to Mars',
    description: 'Safe passage required for Leela\'s diplomatic mission.',
    category: 'escort',
    difficulty: 3,
    rewardCredits: 750,
    status: 'in_progress',
    zoneAffinity: 'mars',
    expiresAt: new Date(Date.now() + 43200000).toISOString(),
  },
];

const API_BASE = 'http://localhost:3001/api';

const fetchTasks = async (): Promise<any[]> => {
  try {
    const response = await fetch(`${API_BASE}/tasks`);
    if (!response.ok) throw new Error(`Server error: ${response.status}`);
    const data = await response.json();
    return data.tasks || [];
  } catch (error) {
    console.log('Using mock tasks data');
    return getMockTasks();
  }
};

const fetchBounties = async (): Promise<any[]> => {
  try {
    const response = await fetch(`${API_BASE}/bounties`);
    if (!response.ok) throw new Error(`Server error: ${response.status}`);
    const data = await response.json();
    return data.bounties || [];
  } catch (error) {
    console.log('Using mock bounties data');
    return getMockBounties();
  }
};

const getDifficultyLabel = (difficulty: number) => {
  switch (difficulty) {
    case 1: return 'Trivial';
    case 2: return 'Easy';
    case 3: return 'Medium';
    case 4: return 'Hard';
    case 5: return 'Impossible';
    default: return 'Unknown';
  }
};

// ============================================
// SCREENS
// ============================================

const TasksScreen = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadTasks = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchTasks();
      setTasks(data);
    } catch (err) {
      setError('Failed to load missions');
      console.error('Tasks error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadTasks();
  }, [loadTasks]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return COLORS.success;
      case 'in_progress': return COLORS.primary;
      case 'queued': return COLORS.warning;
      case 'blocked': return COLORS.danger;
      case 'accepted': return COLORS.secondary;
      default: return COLORS.textSecondary;
    }
  };

  const getStatusEmoji = (status: string) => {
    switch (status) {
      case 'completed': return '✅';
      case 'in_progress': return '🔄';
      case 'queued': return '⏳';
      case 'blocked': return '🚫';
      case 'accepted': return '👋';
      default: return '❓';
    }
  };

  const getTypeEmoji = (type: string) => {
    switch (type) {
      case 'delivery': return '📦';
      case 'coding': return '💻';
      case 'writing': return '✍️';
      case 'research': return '🔬';
      case 'meeting': return '📅';
      case 'planning': return '📋';
      case 'review': return '👀';
      case 'design': return '🎨';
      case 'coordination': return '🤝';
      default: return '📋';
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return COLORS.danger;
      case 2: return COLORS.warning;
      case 3: return COLORS.primary;
      default: return COLORS.textSecondary;
    }
  };

  if (loading) {
    return (
      <ScreenWrapper title="Tasks" subtitle="Mission Control" loading>
      </ScreenWrapper>
    );
  }

  const queuedTasks = tasks.filter((t: any) => t.status === 'queued');
  const inProgressTasks = tasks.filter((t: any) => t.status === 'in_progress');
  const completedTasks = tasks.filter((t: any) => t.status === 'completed');

  return (
    <ScreenWrapper title="Tasks" subtitle="Mission Control" error={error || undefined} onRetry={loadTasks} gradient>
      <ScrollView
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
        {/* Enhanced Stats Row */}
        <View style={styles.enhancedStatsRow}>
          <PulseView color={COLORS.warning}>
            <View style={[styles.enhancedStatCard, { backgroundColor: COLORS.warning + '20' }]}>
              <View style={[styles.statIconCircle, { backgroundColor: COLORS.warning + '30' }]}>
                <Text style={styles.statEmoji}>⏳</Text>
              </View>
              <AnimatedCounter value={queuedTasks.length} />
              <Text style={styles.enhancedStatLabel}>Queued</Text>
            </View>
          </PulseView>
          
          <PulseView color={COLORS.primary}>
            <View style={[styles.enhancedStatCard, { backgroundColor: COLORS.primary + '20' }]}>
              <View style={[styles.statIconCircle, { backgroundColor: COLORS.primary + '30' }]}>
                <Text style={styles.statEmoji}>🔄</Text>
              </View>
              <AnimatedCounter value={inProgressTasks.length} />
              <Text style={styles.enhancedStatLabel}>In Progress</Text>
            </View>
          </PulseView>
          
          <PulseView color={COLORS.success}>
            <View style={[styles.enhancedStatCard, { backgroundColor: COLORS.success + '20' }]}>
              <View style={[styles.statIconCircle, { backgroundColor: COLORS.success + '30' }]}>
                <Text style={styles.statEmoji}>✅</Text>
              </View>
              <AnimatedCounter value={completedTasks.length} />
              <Text style={styles.enhancedStatLabel}>Completed</Text>
            </View>
          </PulseView>
        </View>

        {tasks.length === 0 ? (
          <EmptyState emoji="📋" title="No Missions" message="All caught up! Check back later." />
        ) : (
          tasks.map((task: any) => (
            <GlowCard
              key={task.id}
              glowColor={task.status === 'in_progress' ? COLORS.primary : undefined}
              onPress={() => Alert.alert(task.title, task.description)}
              style={{ marginBottom: 16 }}
            >
              <View style={styles.enhancedTaskCard}>
                <View style={styles.enhancedTaskHeader}>
                  <View style={styles.enhancedTaskTypeRow}>
                    <View style={[styles.taskTypeBadge, { backgroundColor: getTypeEmoji(task.type) === '📦' ? '#FF6B9D30' : getTypeEmoji(task.type) === '💻' ? '#00D4FF30' : '#6C5CE730' }]}>
                      <Text style={styles.taskTypeEmoji}>{getTypeEmoji(task.type)}</Text>
                      <Text style={styles.taskTypeText}>{task.type.toUpperCase()}</Text>
                    </View>
                    {task.priority <= 2 && (
                      <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(task.priority) + '30' }]}>
                        <Text style={[styles.priorityText, { color: getPriorityColor(task.priority) }]}>
                          ⚡ PRIORITY
                        </Text>
                      </View>
                    )}
                  </View>
                  <View style={[styles.enhancedStatusBadge, { backgroundColor: getStatusColor(task.status) + '20' }]}>
                    <Text style={[styles.enhancedStatusText, { color: getStatusColor(task.status) }]}>
                      {getStatusEmoji(task.status)} {task.status.replace('_', ' ')}
                    </Text>
                  </View>
                </View>
                
                <Text style={styles.enhancedTaskTitle}>{task.title}</Text>
                <Text style={styles.enhancedTaskDescription} numberOfLines={2}>{task.description}</Text>
                
                {task.status === 'in_progress' && (
                  <View style={styles.progressContainer}>
                    <ProgressBar progress={task.progress / 100} color={COLORS.primary} height={6} />
                    <Text style={styles.progressText}>{task.progress}% complete</Text>
                  </View>
                )}
                
                <View style={styles.enhancedTaskFooter}>
                  <View style={styles.enhancedTaskReward}>
                    <View style={styles.rewardBadge}>
                      <Text style={styles.rewardEmoji}>💰</Text>
                      <Text style={styles.rewardValue}>{task.rewardValue.toLocaleString()}</Text>
                    </View>
                  </View>
                  {task.agentId && (
                    <View style={styles.assignedBadge}>
                      <Text style={styles.assignedText}>🤖 Assigned</Text>
                    </View>
                  )}
                </View>
              </View>
            </GlowCard>
          ))
        )}
      </ScrollView>
    </ScreenWrapper>
  );
};

const BountiesScreen = () => {
  const [bounties, setBounties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadBounties = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchBounties();
      setBounties(data);
    } catch (err) {
      setError('Failed to load bounties');
      console.error('Bounties error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadBounties();
  }, [loadBounties]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadBounties();
  }, [loadBounties]);

  const getDifficultyColor = (difficulty: number) => {
    switch (difficulty) {
      case 5: return COLORS.danger;
      case 4: return COLORS.warning;
      case 3: return COLORS.accent;
      case 2: return COLORS.primary;
      case 1: return COLORS.success;
      default: return COLORS.textSecondary;
    }
  };

  const getCategoryEmoji = (category: string) => {
    switch (category) {
      case 'delivery': return '📦';
      case 'repair': return '🔧';
      case 'retrieval': return '🎯';
      case 'capture': return '🕸️';
      case 'investigation': return '🔍';
      case 'escort': return '🛡️';
      case 'cleanup': return '🧹';
      case 'bureaucracy': return '📋';
      default: return '💰';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return COLORS.success;
      case 'claimed': return COLORS.primary;
      case 'in_progress': return COLORS.warning;
      case 'completed': return COLORS.secondary;
      default: return COLORS.textSecondary;
    }
  };

  const getDifficultyStars = (difficulty: number) => {
    return '★'.repeat(difficulty) + '☆'.repeat(5 - difficulty);
  };

  if (loading) {
    return (
      <ScreenWrapper title="Bounties" subtitle="Wanted Dead or Alive" loading>
      </ScreenWrapper>
    );
  }

  const openBounties = bounties.filter((b: any) => b.status === 'open');
  const activeBounties = bounties.filter((b: any) => b.status === 'claimed' || b.status === 'in_progress');

  return (
    <ScreenWrapper title="Bounties" subtitle="Wanted Dead or Alive" error={error || undefined} onRetry={loadBounties} gradient>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} colors={[COLORS.primary]} />
        }
      >
        <View style={styles.enhancedStatsRow}>
          <View style={[styles.enhancedStatCard, { backgroundColor: COLORS.success + '20' }]}>
            <View style={[styles.statIconCircle, { backgroundColor: COLORS.success + '30' }]}>
              <Text style={styles.statEmoji}>🎯</Text>
            </View>
            <AnimatedCounter value={openBounties.length} />
            <Text style={styles.enhancedStatLabel}>Open</Text>
          </View>
          
          <View style={[styles.enhancedStatCard, { backgroundColor: COLORS.warning + '20' }]}>
            <View style={[styles.statIconCircle, { backgroundColor: COLORS.warning + '30' }]}>
              <Text style={styles.statEmoji}>⚡</Text>
            </View>
            <AnimatedCounter value={activeBounties.length} />
            <Text style={styles.enhancedStatLabel}>Active</Text>
          </View>
          
          <View style={[styles.enhancedStatCard, { backgroundColor: COLORS.secondary + '20' }]}>
            <View style={[styles.statIconCircle, { backgroundColor: COLORS.secondary + '30' }]}>
              <Text style={styles.statEmoji}>💎</Text>
            </View>
            <Text style={styles.enhancedStatValue}>
              {bounties.reduce((acc: number, b: any) => acc + b.rewardCredits, 0).toLocaleString()}
            </Text>
            <Text style={styles.enhancedStatLabel}>Total Value</Text>
          </View>
        </View>

        {bounties.length === 0 ? (
          <EmptyState emoji="💀" title="No Bounties" message="All quiet on the galactic front." />
        ) : (
          bounties.map((bounty: any) => (
            <GlowCard
              key={bounty.id}
              glowColor={bounty.difficulty >= 4 ? COLORS.danger : bounty.status === 'claimed' ? COLORS.primary : undefined}
              onPress={() => Alert.alert(bounty.title, bounty.description)}
              style={{ marginBottom: 16 }}
            >
              <View style={styles.enhancedBountyCard}>
                <View style={styles.enhancedBountyHeader}>
                  <View style={styles.bountyIconContainer}>
                    <Text style={styles.bountyCategoryEmoji}>{getCategoryEmoji(bounty.category)}</Text>
                  </View>
                  <View style={styles.enhancedBountyInfo}>
                    <Text style={styles.enhancedBountyTarget}>{bounty.title}</Text>
                    <View style={styles.bountyMetaRow}>
                      <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(bounty.difficulty) + '20' }]}>
                        <Text style={[styles.difficultyStars, { color: getDifficultyColor(bounty.difficulty) }]}>
                          {getDifficultyStars(bounty.difficulty)}
                        </Text>
                        <Text style={[styles.difficultyLabel, { color: getDifficultyColor(bounty.difficulty) }]}>
                          {getDifficultyLabel(bounty.difficulty)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
                
                <Text style={styles.enhancedBountyDescription} numberOfLines={2}>{bounty.description}</Text>
                
                <View style={styles.enhancedBountyFooter}>
                  <View style={styles.enhancedRewardContainer}>
                    <View style={styles.rewardBadge}>
                      <Text style={styles.rewardLabel}>REWARD</Text>
                      <View style={styles.rewardAmountRow}>
                        <Text style={styles.enhancedRewardAmount}>💰 {bounty.rewardCredits.toLocaleString()}</Text>
                        <Text style={styles.rewardCredits}>credits</Text>
                      </View>
                    </View>
                  </View>
                  
                  <View style={styles.bountyRightSide}>
                    {bounty.zoneAffinity && (
                      <View style={styles.zoneBadge}>
                        <Text style={styles.zoneText}>📍 {bounty.zoneAffinity}</Text>
                      </View>
                    )}
                    <View style={[styles.enhancedStatusBadge, { backgroundColor: getStatusColor(bounty.status) + '20', marginTop: 8 }]}>
                      <Text style={[styles.enhancedStatusText, { color: getStatusColor(bounty.status) }]}>
                        {bounty.status === 'open' ? '🎯' : bounty.status === 'claimed' ? '✋' : bounty.status === 'in_progress' ? '🔄' : '✅'} {bounty.status.replace('_', ' ')}
                      </Text>
                    </View>
                </View>
                  </View>
                
                {bounty.expiresAt && (
                  <View style={styles.expiryContainer}>
                    <Text style={styles.expiryText}>⏰ Expires: {new Date(bounty.expiresAt).toLocaleString()}</Text>
                  </View>
                )}
              </View>
            </GlowCard>
          ))
        )}
      </ScrollView>
    </ScreenWrapper>
  );
};

// ============================================
// TAB NAVIGATOR
// ============================================

const Tab = createBottomTabNavigator();

const TabIcon = (props: { emoji: string; focused: boolean }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (props.focused) {
      Animated.spring(scaleAnim, {
        toValue: 1.2,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    }
  }, [props.focused, scaleAnim]);

  return (
    <Animated.Text style={{ fontSize: props.focused ? 24 : 20, transform: [{ scale: scaleAnim }] }}>
      {props.emoji}
    </Animated.Text>
  );
};

export default function App() {
  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarStyle: styles.tabBar,
            tabBarActiveTintColor: COLORS.primary,
            tabBarInactiveTintColor: COLORS.textSecondary,
            tabBarLabelStyle: styles.tabLabel,
          }}
        >
          <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarIcon: (p) => <TabIcon emoji="🏠" focused={p.focused} /> }} />
          <Tab.Screen name="World" component={WorldScreen} options={{ tabBarIcon: (p) => <TabIcon emoji="🌍" focused={p.focused} /> }} />
          <Tab.Screen name="Tasks" component={TasksScreen} options={{ tabBarIcon: (p) => <TabIcon emoji="📋" focused={p.focused} /> }} />
          <Tab.Screen name="Agents" component={AgentsScreen} options={{ tabBarIcon: (p) => <TabIcon emoji="👥" focused={p.focused} /> }} />
          <Tab.Screen name="Bounties" component={BountiesScreen} options={{ tabBarIcon: (p) => <TabIcon emoji="💀" focused={p.focused} /> }} />
          <Tab.Screen name="Economy" component={EconomyScreen} options={{ tabBarIcon: (p) => <TabIcon emoji="🛒" focused={p.focused} /> }} />
          <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarIcon: (p) => <TabIcon emoji="👤" focused={p.focused} /> }} />
          <Tab.Screen name="Live" component={DemoStatusScreen} options={{ tabBarIcon: (p) => <TabIcon emoji="📡" focused={p.focused} /> }} />
          <Tab.Screen name="Activity" component={ActivityScreen} options={{ tabBarIcon: (p) => <TabIcon emoji="📜" focused={p.focused} /> }} />
          <Tab.Screen name="Settings" component={SettingsScreen} options={{ tabBarIcon: (p) => <TabIcon emoji="⚙️" focused={p.focused} /> }} />
        </Tab.Navigator>
      </NavigationContainer>
    </>
  );
}

// ============================================
// STYLES
// ============================================

const styles = StyleSheet.create({
  // Screen
  screen: { flex: 1, backgroundColor: COLORS.background },
  screenGradient: { backgroundColor: COLORS.backgroundGradientStart },
  
  // Header
  header: { 
    backgroundColor: COLORS.cardBackground, 
    paddingTop: 50, 
    paddingBottom: 16, 
    paddingHorizontal: 20, 
    borderBottomWidth: 1, 
    borderBottomColor: COLORS.border,
  },
  headerContent: { flexDirection: 'row', alignItems: 'center' },
  headerEmojiContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerEmoji: { fontSize: 24 },
  headerTextContainer: { flex: 1 },
  headerText: { fontSize: 22, fontWeight: 'bold', color: COLORS.text },
  headerSubtext: { fontSize: 13, color: COLORS.primary, marginTop: 2 },
  
  // Content
  content: { padding: 16, paddingBottom: 100 },
  centeredContent: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  loadingEmoji: { fontSize: 48, marginBottom: 16 },
  loadingText: { marginTop: 16, fontSize: 16, color: COLORS.textSecondary },
  
  // Error
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  errorEmoji: { fontSize: 64, marginBottom: 16 },
  errorTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.text, textAlign: 'center', marginBottom: 16 },
  retryButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary, paddingVertical: 14, paddingHorizontal: 28, borderRadius: 12, gap: 8 },
  retryButtonText: { color: COLORS.background, fontSize: 16, fontWeight: 'bold' },
  
  // Empty
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 },
  emptyEmoji: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text, marginBottom: 8 },
  emptyMessage: { fontSize: 14, color: COLORS.textSecondary },
  
  // Glow Card
  glowCard: { 
    backgroundColor: COLORS.cardBackground, 
    borderRadius: 20, 
    padding: 18, 
    borderWidth: 1, 
    borderColor: COLORS.border,
  },
  
  // Progress Bar
  progressBarBg: { 
    backgroundColor: COLORS.cardBackgroundLight, 
    borderRadius: 10, 
    overflow: 'hidden',
    marginTop: 12,
  },
  progressBarFill: { 
    borderRadius: 10,
  },
  progressText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 6,
    textAlign: 'right',
  },
  progressContainer: {
    marginTop: 12,
  },
  
  // Enhanced Stats Row
  enhancedStatsRow: { 
    flexDirection: 'row', 
    gap: 12, 
    marginBottom: 24,
  },
  enhancedStatCard: { 
    flex: 1, 
    backgroundColor: COLORS.cardBackground, 
    borderRadius: 16, 
    padding: 14, 
    alignItems: 'center',
    borderWidth: 1, 
    borderColor: COLORS.border,
  },
  statIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statEmoji: { fontSize: 18 },
  enhancedStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  enhancedStatLabel: { 
    fontSize: 11, 
    color: COLORS.textSecondary, 
    marginTop: 4,
    fontWeight: '600',
  },
  
  // Task Card
  enhancedTaskCard: {},
  enhancedTaskHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  enhancedTaskTypeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  taskTypeBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, gap: 4 },
  taskTypeEmoji: { fontSize: 14 },
  taskTypeText: { fontSize: 10, fontWeight: '700', color: COLORS.textSecondary, letterSpacing: 0.5 },
  priorityBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  priorityText: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
  enhancedStatusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  enhancedStatusText: { fontSize: 11, fontWeight: '600', textTransform: 'capitalize' },
  enhancedTaskTitle: { fontSize: 17, fontWeight: 'bold', color: COLORS.text, marginBottom: 6, lineHeight: 22 },
  enhancedTaskDescription: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 18, marginBottom: 14 },
  enhancedTaskFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  enhancedTaskReward: { flexDirection: 'row', alignItems: 'center' },
  rewardBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  rewardEmoji: { fontSize: 14 },
  rewardValue: { fontSize: 15, fontWeight: '700', color: COLORS.warning },
  rewardLabel: { fontSize: 10, color: COLORS.textMuted, letterSpacing: 1, marginBottom: 2 },
  rewardAmountRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  rewardCredits: { fontSize: 12, color: COLORS.textSecondary },
  assignedBadge: { backgroundColor: COLORS.secondary + '25', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  assignedText: { fontSize: 12, color: COLORS.secondary, fontWeight: '600' },
  
  // Bounty Card
  enhancedBountyCard: {},
  enhancedBountyHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 },
  bountyIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: COLORS.cardBackgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  bountyCategoryEmoji: { fontSize: 28 },
  enhancedBountyInfo: { flex: 1 },
  enhancedBountyTarget: { fontSize: 18, fontWeight: 'bold', color: COLORS.text, marginBottom: 8, lineHeight: 22 },
  bountyMetaRow: { flexDirection: 'row', gap: 8 },
  difficultyBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, gap: 4 },
  difficultyStars: { fontSize: 12 },
  difficultyLabel: { fontSize: 10, fontWeight: '600', marginLeft: 2 },
  enhancedBountyDescription: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 18, marginBottom: 16 },
  enhancedBountyFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: 14, borderTopWidth: 1, borderTopColor: COLORS.border },
  enhancedRewardContainer: {},
  enhancedRewardAmount: { fontSize: 20, fontWeight: 'bold', color: COLORS.warning },
  bountyRightSide: { alignItems: 'flex-end' },
  zoneBadge: { backgroundColor: COLORS.secondary + '20', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  zoneText: { fontSize: 11, color: COLORS.secondary, fontWeight: '600' },
  expiryContainer: { marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: COLORS.border },
  expiryText: { fontSize: 11, color: COLORS.textMuted },
  
  // Tab Bar
  tabBar: { 
    backgroundColor: COLORS.cardBackground, 
    borderTopWidth: 1, 
    paddingTop: 10, 
    paddingBottom: 8, 
    height: 70, 
    borderTopColor: COLORS.border,
  },
  tabLabel: { fontSize: 10, marginTop: 4, fontWeight: '600' },
});