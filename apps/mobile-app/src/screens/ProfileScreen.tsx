import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Switch,
  Alert,
} from 'react-native';

// Theme colors
const COLORS = {
  background: '#0D0D1A',
  cardBackground: '#1A1A2E',
  cardBackgroundLight: '#252542',
  primary: '#00D4FF', // Cyan neon
  secondary: '#6C5CE7', // Purple
  accent: '#FF6B9D', // Pink accent
  warning: '#FDCB6E',
  success: '#00B894',
  danger: '#E74C3C',
  text: '#FFFFFF',
  textSecondary: '#A0A0B0',
  textMuted: '#6B6B80',
  border: '#2D2D4A',
};

// User data interface
interface UserProfile {
  name: string;
  level: number;
  credits: number;
  title: string;
  deliveries: number;
  bounties: number;
  agents: number;
  joinDate: string;
}

const defaultProfile: UserProfile = {
  name: 'Captain',
  level: 5,
  credits: 15420,
  title: 'Planet Express Commander',
  deliveries: 47,
  bounties: 12,
  agents: 6,
  joinDate: '2024-01-15',
};

const ProfileScreen: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);
  const [refreshing, setRefreshing] = useState(false);
  
  // Settings state
  const [notifications, setNotifications] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setProfile({
        ...profile,
        credits: profile.credits + Math.floor(Math.random() * 100),
        deliveries: profile.deliveries + (Math.random() > 0.5 ? 1 : 0),
      });
      setRefreshing(false);
    }, 1000);
  }, [profile]);

  const handleSettingsPress = (setting: string) => {
    Alert.alert(
      `${setting}`,
      `This setting would open ${setting} options.`,
      [{ text: 'OK' }]
    );
  };

  // Get rank badge color based on level
  const getRankColor = (level: number): string => {
    if (level >= 10) return COLORS.warning; // Gold
    if (level >= 5) return COLORS.secondary; // Purple
    if (level >= 3) return COLORS.primary; // Cyan
    return COLORS.textSecondary; // Gray
  };

  // Get rank title based on level
  const getRankTitle = (level: number): string => {
    if (level >= 10) return '⭐ Legendary Commander';
    if (level >= 8) return '🌟 Senior Commander';
    if (level >= 5) return '🎖️ Commander';
    if (level >= 3) return '🚀 Pilot';
    return '🌱 Rookie';
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
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarEmoji}>👨‍🚀</Text>
          </View>
          <View style={[styles.levelBadge, { backgroundColor: getRankColor(profile.level) }]}>
            <Text style={styles.levelText}>Lv.{profile.level}</Text>
          </View>
        </View>
        
        <Text style={styles.profileName}>{profile.name}</Text>
        <Text style={styles.profileTitle}>{profile.title}</Text>
        <Text style={styles.rankTitle}>{getRankTitle(profile.level)}</Text>
        
        <View style={styles.creditsContainer}>
          <Text style={styles.creditsLabel}>💰 Balance</Text>
          <Text style={styles.creditsValue}>{profile.credits.toLocaleString()} credits</Text>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{profile.deliveries}</Text>
          <Text style={styles.statLabel}>📦 Deliveries</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{profile.bounties}</Text>
          <Text style={styles.statLabel}>💀 Bounties</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{profile.agents}</Text>
          <Text style={styles.statLabel}>🤖 Agents</Text>
        </View>
      </View>

      {/* Account Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📋 Account Info</Text>
        
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Member Since</Text>
            <Text style={styles.infoValue}>
              {new Date(profile.joinDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Account Type</Text>
            <Text style={styles.infoValue}>Premium Commander</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status</Text>
            <Text style={[styles.infoValue, { color: COLORS.success }]}>● Active</Text>
          </View>
        </View>
      </View>

      {/* Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚙️ Settings</Text>
        
        <View style={styles.settingsCard}>
          {/* Notifications */}
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingIcon}>🔔</Text>
              <View>
                <Text style={styles.settingLabel}>Notifications</Text>
                <Text style={styles.settingDesc}>Push alerts for missions</Text>
              </View>
            </View>
            <Switch
              value={notifications}
              onValueChange={setNotifications}
              trackColor={{ false: COLORS.border, true: COLORS.primary + '50' }}
              thumbColor={notifications ? COLORS.primary : COLORS.textMuted}
            />
          </View>
          
          <View style={styles.divider} />
          
          {/* Sound Effects */}
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingIcon}>🔊</Text>
              <View>
                <Text style={styles.settingLabel}>Sound Effects</Text>
                <Text style={styles.settingDesc}>Game audio feedback</Text>
              </View>
            </View>
            <Switch
              value={soundEffects}
              onValueChange={setSoundEffects}
              trackColor={{ false: COLORS.border, true: COLORS.primary + '50' }}
              thumbColor={soundEffects ? COLORS.primary : COLORS.textMuted}
            />
          </View>
          
          <View style={styles.divider} />
          
          {/* Auto Refresh */}
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingIcon}>🔄</Text>
              <View>
                <Text style={styles.settingLabel}>Auto Refresh</Text>
                <Text style={styles.settingDesc}>Auto-update agent status</Text>
              </View>
            </View>
            <Switch
              value={autoRefresh}
              onValueChange={setAutoRefresh}
              trackColor={{ false: COLORS.border, true: COLORS.primary + '50' }}
              thumbColor={autoRefresh ? COLORS.primary : COLORS.textMuted}
            />
          </View>
          
          <View style={styles.divider} />
          
          {/* Dark Mode */}
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingIcon}>🌙</Text>
              <View>
                <Text style={styles.settingLabel}>Dark Mode</Text>
                <Text style={styles.settingDesc}>Use dark theme</Text>
              </View>
            </View>
            <Switch
              value={darkMode}
              onValueChange={setDarkMode}
              trackColor={{ false: COLORS.border, true: COLORS.primary + '50' }}
              thumbColor={darkMode ? COLORS.primary : COLORS.textMuted}
            />
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎮 Quick Actions</Text>
        
        <View style={styles.actionsGrid}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => Alert.alert('Help', 'Contact support team')}
          >
            <Text style={styles.actionEmoji}>❓</Text>
            <Text style={styles.actionLabel}>Help</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => Alert.alert('Achievements', 'View your achievements')}
          >
            <Text style={styles.actionEmoji}>🏆</Text>
            <Text style={styles.actionLabel}>Achievements</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => Alert.alert('Statistics', 'View detailed stats')}
          >
            <Text style={styles.actionEmoji}>📊</Text>
            <Text style={styles.actionLabel}>Statistics</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => Alert.alert('About', 'Planet Express HQ v1.0.0')}
          >
            <Text style={styles.actionEmoji}>ℹ️</Text>
            <Text style={styles.actionLabel}>About</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Logout Button */}
      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={() => Alert.alert('Logout', 'Are you sure you want to logout?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Logout', style: 'destructive' },
        ])}
      >
        <Text style={styles.logoutText}>🚪 Logout</Text>
      </TouchableOpacity>

      {/* Version Info */}
      <Text style={styles.versionText}>Planet Express HQ v1.0.0</Text>
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
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 5,
  },
  avatarEmoji: {
    fontSize: 48,
  },
  levelBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: COLORS.background,
  },
  profileName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  profileTitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  rankTitle: {
    fontSize: 13,
    color: COLORS.warning,
    fontWeight: '600',
    marginBottom: 16,
  },
  creditsContainer: {
    backgroundColor: COLORS.cardBackground,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  creditsLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  creditsValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statValue: {
    fontSize: 26,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  section: {
    marginBottom: 24,
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
  infoCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 4,
  },
  settingsCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    fontSize: 22,
    marginRight: 12,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  settingDesc: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    width: '47%',
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  actionEmoji: {
    fontSize: 28,
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  logoutButton: {
    backgroundColor: COLORS.danger + '20',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.danger + '50',
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.danger,
  },
  versionText: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});

export default ProfileScreen;
