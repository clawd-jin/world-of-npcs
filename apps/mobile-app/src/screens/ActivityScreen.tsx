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
  Dimensions,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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

// Mock activity data
const generateMockActivities = () => {
  const now = Date.now();
  return [
    {
      id: '1',
      type: 'task_completed',
      title: 'Package Delivery Complete',
      description: 'Delivered quantum components to Mars Colony',
      agent: 'Bender',
      timestamp: new Date(now - 1000 * 60 * 15).toISOString(),
      emoji: '📦',
      color: COLORS.success,
    },
    {
      id: '2',
      type: 'agent_status',
      title: 'Agent Status Changed',
      description: 'Fry is now "On Patrol" - Sector 7G',
      agent: 'Fry',
      timestamp: new Date(now - 1000 * 60 * 45).toISOString(),
      emoji: '👨‍🚀',
      color: COLORS.primary,
    },
    {
      id: '3',
      type: 'task_completed',
      title: 'Research Complete',
      description: 'Alternative fuel research finished',
      agent: 'Professor Farnsworth',
      timestamp: new Date(now - 1000 * 60 * 90).toISOString(),
      emoji: '🔬',
      color: COLORS.secondary,
    },
    {
      id: '4',
      type: 'agent_status',
      title: 'Agent Status Changed',
      description: 'Leela is now "Available" for missions',
      agent: 'Leela',
      timestamp: new Date(now - 1000 * 60 * 120).toISOString(),
      emoji: '👁️',
      color: COLORS.accent,
    },
    {
      id: '5',
      type: 'task_completed',
      title: 'Ship Maintenance Done',
      description: 'Nimbus engine diagnostics complete',
      agent: ' Bender',
      timestamp: new Date(now - 1000 * 60 * 180).toISOString(),
      emoji: '🔧',
      color: COLORS.warning,
    },
    {
      id: '6',
      type: 'agent_status',
      title: 'Agent Status Changed',
      description: 'Zoidberg is now "Hungry" - Seeking food',
      agent: 'Zoidberg',
      timestamp: new Date(now - 1000 * 60 * 240).toISOString(),
      emoji: '🦀',
      color: COLORS.danger,
    },
    {
      id: '7',
      type: 'task_completed',
      title: 'Bounty Claimed',
      description: 'Escorted Leela to Mars successfully',
      agent: 'Fry',
      timestamp: new Date(now - 1000 * 60 * 300).toISOString(),
      emoji: '💰',
      color: COLORS.success,
    },
    {
      id: '8',
      type: 'event',
      title: 'New Bounty Available',
      description: 'Capture live Bigfoot for the zoo',
      agent: null,
      timestamp: new Date(now - 1000 * 60 * 360).toISOString(),
      emoji: '💀',
      color: COLORS.warning,
    },
    {
      id: '9',
      type: 'task_completed',
      title: 'Navigation Update',
      description: 'Fixed autopilot drift on Route 66',
      agent: 'Hyperdrive',
      timestamp: new Date(now - 1000 * 60 * 420).toISOString(),
      emoji: '💻',
      color: COLORS.secondary,
    },
    {
      id: '10',
      type: 'agent_status',
      title: 'Agent Status Changed',
      description: 'Nibbler is now "On Watch" - Moon base',
      agent: 'Nibbler',
      timestamp: new Date(now - 1000 * 60 * 480).toISOString(),
      emoji: '🌙',
      color: COLORS.primary,
    },
  ];
};

// Time ago helper
const getTimeAgo = (timestamp: string) => {
  const now = Date.now();
  const time = new Date(timestamp).getTime();
  const diff = now - time;
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};

// Animated activity item
const ActivityItem = ({ activity, index }: { activity: any; index: number }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      delay: index * 80,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 400,
      delay: index * 80,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [index, fadeAnim, slideAnim]);

  return (
    <Animated.View
      style={[
        styles.activityCard,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        },
      ]}
    >
      <View style={[styles.activityIconContainer, { backgroundColor: activity.color + '20' }]}>
        <Text style={styles.activityEmoji}>{activity.emoji}</Text>
      </View>
      <View style={styles.activityContent}>
        <View style={styles.activityHeader}>
          <Text style={styles.activityTitle}>{activity.title}</Text>
          <Text style={styles.activityTime}>{getTimeAgo(activity.timestamp)}</Text>
        </View>
        <Text style={styles.activityDescription}>{activity.description}</Text>
        {activity.agent && (
          <View style={styles.activityAgentBadge}>
            <Text style={[styles.activityAgentText, { color: activity.color }]}>
              🤖 {activity.agent}
            </Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
};

// Filter type badges
const FilterBadge = ({ label, emoji, active, onPress }: { label: string; emoji: string; active: boolean; onPress: () => void }) => (
  <TouchableOpacity
    onPress={onPress}
    style={[
      styles.filterBadge,
      active && styles.filterBadgeActive,
    ]}
  >
    <Text style={styles.filterEmoji}>{emoji}</Text>
    <Text style={[styles.filterLabel, active && styles.filterLabelActive]}>{label}</Text>
  </TouchableOpacity>
);

interface ActivityScreenProps {
  navigation?: NavigationProp<any>;
}

const API_BASE = 'http://localhost:3001/api';

const ActivityScreen: React.FC<ActivityScreenProps> = ({ navigation: nav }) => {
  const navigation = useNavigation();
  const navToUse = nav || navigation;
  const [activities, setActivities] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  const loadActivities = useCallback(async () => {
    try {
      // Try to fetch from API first
      const response = await fetch(`${API_BASE}/demo/status`);
      if (response.ok) {
        const data = await response.json();
        if (data.activities && data.activities.length > 0) {
          setActivities(data.activities);
          return;
        }
      }
    } catch (err) {
      console.log('API unavailable, using mock activities');
    }
    // Fallback to mock data
    setActivities(generateMockActivities());
  }, []);

  useEffect(() => {
    loadActivities();
    // Refresh activities periodically
    const interval = setInterval(loadActivities, 15000);
    return () => clearInterval(interval);
  }, [loadActivities]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setActivities(generateMockActivities());
      setRefreshing(false);
    }, 1000);
  }, []);

  const filteredActivities = activeFilter === 'all'
    ? activities
    : activities.filter((a) => a.type === activeFilter);

  // Stats
  const taskCompleted = activities.filter((a) => a.type === 'task_completed').length;
  const agentChanges = activities.filter((a) => a.type === 'agent_status').length;
  const events = activities.filter((a) => a.type === 'event').length;

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={[styles.headerEmojiContainer, { backgroundColor: COLORS.accent + '20' }]}>
            <Text style={styles.headerEmoji}>📜</Text>
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerText}>Activity</Text>
            <Text style={styles.headerSubtext}>Recent Events</Text>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: COLORS.success + '15' }]}>
            <Text style={styles.statEmoji}>✅</Text>
            <Text style={styles.statValue}>{taskCompleted}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: COLORS.primary + '15' }]}>
            <Text style={styles.statEmoji}>👥</Text>
            <Text style={styles.statValue}>{agentChanges}</Text>
            <Text style={styles.statLabel}>Status</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: COLORS.warning + '15' }]}>
            <Text style={styles.statEmoji}>📢</Text>
            <Text style={styles.statValue}>{events}</Text>
            <Text style={styles.statLabel}>Events</Text>
          </View>
        </View>

        {/* Filter Badges */}
        <View style={styles.filterContainer}>
          <FilterBadge
            label="All"
            emoji="📋"
            active={activeFilter === 'all'}
            onPress={() => setActiveFilter('all')}
          />
          <FilterBadge
            label="Tasks"
            emoji="✅"
            active={activeFilter === 'task_completed'}
            onPress={() => setActiveFilter('task_completed')}
          />
          <FilterBadge
            label="Agents"
            emoji="🤖"
            active={activeFilter === 'agent_status'}
            onPress={() => setActiveFilter('agent_status')}
          />
          <FilterBadge
            label="Events"
            emoji="📢"
            active={activeFilter === 'event'}
            onPress={() => setActiveFilter('event')}
          />
          <FilterBadge
            label="Interactions"
            emoji="👀"
            active={activeFilter === 'interaction'}
            onPress={() => setActiveFilter('interaction')}
          />
        </View>

        {/* Activity List */}
        <View style={styles.activityList}>
          {filteredActivities.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>📭</Text>
              <Text style={styles.emptyTitle}>No Activities</Text>
              <Text style={styles.emptyMessage}>Nothing to show here yet</Text>
            </View>
          ) : (
            filteredActivities.map((activity, index) => (
              <ActivityItem key={activity.id} activity={activity} index={index} />
            ))
          )}
        </View>

        {/* Futurama Quote */}
        <View style={styles.quoteCard}>
          <Text style={styles.quoteEmoji}>💀</Text>
          <Text style={styles.quoteText}>"Bite my shiny metal ass!"</Text>
          <Text style={styles.quoteAuthor}>- Bender</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.cardBackground,
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerEmojiContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerEmoji: {
    fontSize: 24,
  },
  headerTextContainer: {
    flex: 1,
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  headerSubtext: {
    fontSize: 13,
    color: COLORS.accent,
    marginTop: 2,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statEmoji: {
    fontSize: 22,
    marginBottom: 6,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
    fontWeight: '600',
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  filterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 6,
  },
  filterBadgeActive: {
    backgroundColor: COLORS.primary + '20',
    borderColor: COLORS.primary + '50',
  },
  filterEmoji: {
    fontSize: 14,
  },
  filterLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  filterLabelActive: {
    color: COLORS.primary,
  },
  activityList: {
    gap: 12,
    marginBottom: 20,
  },
  activityCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  activityIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  activityEmoji: {
    fontSize: 24,
  },
  activityContent: {
    flex: 1,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  activityTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
  },
  activityTime: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginLeft: 8,
  },
  activityDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  activityAgentBadge: {
    marginTop: 8,
  },
  activityAgentText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 6,
  },
  emptyMessage: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  quoteCard: {
    backgroundColor: COLORS.cardBackgroundLight,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  quoteEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  quoteText: {
    fontSize: 14,
    color: COLORS.text,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  quoteAuthor: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 6,
  },
});

export default ActivityScreen;
