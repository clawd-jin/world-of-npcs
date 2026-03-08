import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  TextInput,
  Animated,
  Easing,
  Alert,
  Linking,
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

// Animated setting toggle
const SettingToggle = ({ 
  label, 
  emoji, 
  value, 
  onValueChange,
  description 
}: { 
  label: string; 
  emoji: string; 
  value: boolean; 
  onValueChange: (val: boolean) => void;
  description?: string;
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    onValueChange(!value);
  };

  return (
    <Animated.View style={[styles.settingRow, { transform: [{ scale: scaleAnim }] }]}>
      <View style={styles.settingLeft}>
        <View style={styles.settingEmojiContainer}>
          <Text style={styles.settingEmoji}>{emoji}</Text>
        </View>
        <View style={styles.settingTextContainer}>
          <Text style={styles.settingLabel}>{label}</Text>
          {description && <Text style={styles.settingDescription}>{description}</Text>}
        </View>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: COLORS.cardBackgroundLighter, true: COLORS.primary + '50' }}
        thumbColor={value ? COLORS.primary : COLORS.textMuted}
        ios_backgroundColor={COLORS.cardBackgroundLighter}
      />
    </Animated.View>
  );
};

// Setting button row
const SettingButton = ({ 
  label, 
  emoji, 
  onPress,
  value,
  description,
  danger = false,
}: { 
  label: string; 
  emoji: string; 
  onPress?: () => void;
  value?: string;
  description?: string;
  danger?: boolean;
}) => (
  <TouchableOpacity 
    style={styles.settingRow} 
    onPress={onPress}
    activeOpacity={0.7}
  >
    <View style={styles.settingLeft}>
      <View style={[styles.settingEmojiContainer, danger && styles.settingEmojiDanger]}>
        <Text style={styles.settingEmoji}>{emoji}</Text>
      </View>
      <View style={styles.settingTextContainer}>
        <Text style={[styles.settingLabel, danger && styles.settingLabelDanger]}>{label}</Text>
        {description && <Text style={styles.settingDescription}>{description}</Text>}
      </View>
    </View>
    {value && (
      <View style={styles.settingValue}>
        <Text style={styles.settingValueText}>{value}</Text>
        <Text style={styles.settingChevron}>›</Text>
      </View>
    )}
  </TouchableOpacity>
);

// Server URL input
const ServerUrlInput = ({ 
  value, 
  onChange,
}: { 
  value: string; 
  onChange: (val: string) => void;
}) => {
  const [localValue, setLocalValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);

  const handleBlur = () => {
    setIsFocused(false);
    onChange(localValue);
  };

  return (
    <View style={styles.serverUrlContainer}>
      <View style={styles.serverUrlHeader}>
        <Text style={styles.serverUrlLabel}>🌐 Server URL</Text>
      </View>
      <View style={[styles.serverUrlInputContainer, isFocused && styles.serverUrlInputFocused]}>
        <TextInput
          style={styles.serverUrlInput}
          value={localValue}
          onChangeText={setLocalValue}
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          placeholder="http://localhost:3001"
          placeholderTextColor={COLORS.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
        />
        <TouchableOpacity 
          style={styles.serverUrlSaveButton}
          onPress={() => onChange(localValue)}
        >
          <Text style={styles.serverUrlSaveText}>Save</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Section header
const SectionHeader = ({ emoji, title }: { emoji: string; title: string }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionEmoji}>{emoji}</Text>
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
);

interface SettingsScreenProps {
  navigation?: NavigationProp<any>;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation: nav }) => {
  const navigation = useNavigation();
  const navToUse = nav || navigation;

  // Settings state
  const [settings, setSettings] = useState({
    notifications: true,
    sound: true,
    hapticFeedback: true,
    autoRefresh: true,
    showOnlineStatus: true,
  });

  const [serverUrl, setServerUrl] = useState('http://localhost:3001');

  // App version info
  const APP_VERSION = '1.0.0';
  const BUILD_NUMBER = '42';
  const API_VERSION = 'v2.1.0';

  const handleNotificationToggle = (val: boolean) => {
    setSettings({ ...settings, notifications: val });
    if (!val) {
      Alert.alert('Notifications Disabled', 'You won\'t receive push notifications for new missions.');
    }
  };

  const handleSoundToggle = (val: boolean) => {
    setSettings({ ...settings, sound: val });
  };

  const handleHapticToggle = (val: boolean) => {
    setSettings({ ...settings, hapticFeedback: val });
  };

  const handleAutoRefreshToggle = (val: boolean) => {
    setSettings({ ...settings, autoRefresh: val });
  };

  const handleOnlineStatusToggle = (val: boolean) => {
    setSettings({ ...settings, showOnlineStatus: val });
  };

  const handleServerUrlChange = (val: string) => {
    setServerUrl(val);
    Alert.alert('Server Updated', `Now connecting to ${val}`);
  };

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'This will remove all cached data. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear', style: 'destructive', onPress: () => {
          Alert.alert('Cache Cleared', 'All cached data has been removed.');
        }},
      ]
    );
  };

  const handleOpenLink = (url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Could not open link');
    });
  };

  return (
    <View style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={[styles.headerEmojiContainer, { backgroundColor: COLORS.secondary + '20' }]}>
            <Text style={styles.headerEmoji}>⚙️</Text>
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerText}>Settings</Text>
            <Text style={styles.headerSubtext}>Configure Your App</Text>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* App Settings */}
        <SectionHeader emoji="🔔" title="Notifications" />
        <View style={styles.settingsCard}>
          <SettingToggle
            label="Push Notifications"
            emoji="🔔"
            value={settings.notifications}
            onValueChange={handleNotificationToggle}
            description="Get alerts for new missions & bounties"
          />
          <View style={styles.settingDivider} />
          <SettingToggle
            label="Sound Effects"
            emoji="🔊"
            value={settings.sound}
            onValueChange={handleSoundToggle}
            description="Play sounds for events"
          />
          <View style={styles.settingDivider} />
          <SettingToggle
            label="Haptic Feedback"
            emoji="📳"
            value={settings.hapticFeedback}
            onValueChange={handleHapticToggle}
            description="Vibrate on interactions"
          />
        </View>

        {/* Connection Settings */}
        <SectionHeader emoji="🔗" title="Connection" />
        <View style={styles.settingsCard}>
          <ServerUrlInput
            value={serverUrl}
            onChange={handleServerUrlChange}
          />
          <View style={styles.settingDivider} />
          <SettingToggle
            label="Auto Refresh"
            emoji="🔄"
            value={settings.autoRefresh}
            onValueChange={handleAutoRefreshToggle}
            description="Automatically update data"
          />
        </View>

        {/* Privacy Settings */}
        <SectionHeader emoji="🔒" title="Privacy" />
        <View style={styles.settingsCard}>
          <SettingToggle
            label="Show Online Status"
            emoji="🟢"
            value={settings.showOnlineStatus}
            onValueChange={handleOnlineStatusToggle}
            description="Let others see when you're online"
          />
        </View>

        {/* Data Settings */}
        <SectionHeader emoji="💾" title="Data" />
        <View style={styles.settingsCard}>
          <SettingButton
            label="Clear Cache"
            emoji="🗑️"
            onPress={handleClearCache}
            description="Free up storage space"
          />
          <View style={styles.settingDivider} />
          <SettingButton
            label="Export Data"
            emoji="📤"
            onPress={() => Alert.alert('Export Data', 'This feature is coming soon!')}
            description="Download your game data"
          />
        </View>

        {/* About Section */}
        <SectionHeader emoji="ℹ️" title="About" />
        <View style={styles.settingsCard}>
          <SettingButton
            label="Version"
            emoji="📱"
            value={`${APP_VERSION} (${BUILD_NUMBER})`}
          />
          <View style={styles.settingDivider} />
          <SettingButton
            label="API Version"
            emoji="🔌"
            value={API_VERSION}
          />
          <View style={styles.settingDivider} />
          <SettingButton
            label="Terms of Service"
            emoji="📄"
            onPress={() => handleOpenLink('https://planetexpress.mother.com/terms')}
          />
          <View style={styles.settingDivider} />
          <SettingButton
            label="Privacy Policy"
            emoji="🔐"
            onPress={() => handleOpenLink('https://planetexpress.mother.com/privacy')}
          />
        </View>

        {/* Credits */}
        <View style={styles.creditsCard}>
          <Text style={styles.creditsEmoji}>🚀</Text>
          <Text style={styles.creditsTitle}>World of NPCs</Text>
          <Text style={styles.creditsSubtitle}>Made with ❤️ by Planet Express</Text>
          <View style={styles.creditsDivider} />
          <Text style={styles.creditsQuote}>"Bite my shiny metal ass!"</Text>
          <Text style={styles.creditsAuthor}>— Bender</Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 3001 Planet Express Inc.</Text>
          <Text style={styles.footerText}>All rights reserved across the galaxy</Text>
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
    color: COLORS.secondary,
    marginTop: 2,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionEmoji: {
    fontSize: 16,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    letterSpacing: 0.5,
  },
  settingsCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingEmojiContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.cardBackgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingEmojiDanger: {
    backgroundColor: COLORS.danger + '20',
  },
  settingEmoji: {
    fontSize: 18,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },
  settingLabelDanger: {
    color: COLORS.danger,
  },
  settingDescription: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  settingValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValueText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginRight: 6,
  },
  settingChevron: {
    fontSize: 20,
    color: COLORS.textMuted,
  },
  settingDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginLeft: 64,
  },
  serverUrlContainer: {
    padding: 16,
  },
  serverUrlHeader: {
    marginBottom: 10,
  },
  serverUrlLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  serverUrlInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackgroundLight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  serverUrlInputFocused: {
    borderColor: COLORS.primary,
  },
  serverUrlInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: COLORS.text,
  },
  serverUrlSaveButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  serverUrlSaveText: {
    color: COLORS.background,
    fontSize: 14,
    fontWeight: 'bold',
  },
  creditsCard: {
    backgroundColor: COLORS.cardBackgroundLight,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginTop: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  creditsEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  creditsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  creditsSubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  creditsDivider: {
    width: 60,
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 16,
  },
  creditsQuote: {
    fontSize: 14,
    color: COLORS.text,
    fontStyle: 'italic',
  },
  creditsAuthor: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 4,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginBottom: 4,
  },
});

export default SettingsScreen;
