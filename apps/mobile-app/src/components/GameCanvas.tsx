import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
  Easing,
  TouchableOpacity,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CANVAS_SIZE = SCREEN_WIDTH - 32;
const GRID_COLS = 3;
const GRID_ROWS = 2;
const CELL_SIZE = CANVAS_SIZE / GRID_COLS;

// Zone layout with rich visual properties
const ZONE_LAYOUT: Record<string, {
  col: number;
  row: number;
  primaryColor: string;
  gradientColors: string[];
  icon: string;
  description: string;
}> = {
  office: {
    col: 0, row: 0,
    primaryColor: '#2E5A88',
    gradientColors: ['#1E3A5F', '#2E5A88', '#3D7AB5'],
    icon: '📋',
    description: 'Mission Control'
  },
  lounge: {
    col: 1, row: 0,
    primaryColor: '#6B3FA0',
    gradientColors: ['#4A1D73', '#6B3FA0', '#8B5FC0'],
    icon: '🎰',
    description: 'Relaxation Zone'
  },
  lab: {
    col: 2, row: 0,
    primaryColor: '#1D6F42',
    gradientColors: ['#145230', '#1D6F42', '#2A9D5C'],
    icon: '🧪',
    description: 'Innovation Lab'
  },
  cafeteria: {
    col: 0, row: 1,
    primaryColor: '#B86E1A',
    gradientColors: ['#8B4D0F', '#B86E1A', '#E8912A'],
    icon: '🍕',
    description: 'Food Court'
  },
  hangar: {
    col: 1, row: 1,
    primaryColor: '#A83232',
    gradientColors: ['#7A1E1E', '#A83232', '#D94040'],
    icon: '🚀',
    description: 'Ship Bay'
  },
  'crew-quarters': {
    col: 2, row: 1,
    primaryColor: '#0D8A74',
    gradientColors: ['#085F52', '#0D8A74', '#12B596'],
    icon: '🛏️',
    description: 'Living Area'
  },
};

interface NPC {
  id: string;
  name: string;
  agentId: string;
  state: string;
  zone: string;
  mood: string;
}

interface WorldStatus {
  world: string;
  npcs: NPC[];
  zones: string[];
  timestamp: string;
}

// Character emojis for NPCs
const CHARACTER_EMOJIS: Record<string, string> = {
  'Turanga Leela': '👩‍🦰',
  'Bender Bending Rodriguez': '🤖',
  'Philip J. Fry': '👨‍🚀',
  'Professor Farnsworth': '👨‍🔬',
  'Amy Wong': '👩‍🎓',
  'Hermes Conrad': '👨‍💼',
  'Nibbler': '🐱',
  'Dr. Zoidberg': '🦀',
  'Zoidberg': '🦀',
  'default': '👤',
};

// State animations
const STATE_ANIMATIONS: Record<string, { emoji: string; color: string }> = {
  idle: { emoji: '💤', color: '#F39C12' },
  working: { emoji: '⚡', color: '#3498DB' },
  walking: { emoji: '👟', color: '#9B59B6' },
  socializing: { emoji: '💬', color: '#E91E63' },
  active: { emoji: '🎯', color: '#00E676' },
  hungry: { emoji: '🍔', color: '#FF6B9D' },
  busy: { emoji: '📊', color: '#6C5CE7' },
};

// Generate random position within a zone
const getPositionInZone = (zone: string): { x: number; y: number } => {
  const layout = ZONE_LAYOUT[zone];
  if (!layout) {
    return { x: CELL_SIZE / 2, y: CELL_SIZE / 2 };
  }

  const padding = 35;
  const zoneWidth = CELL_SIZE - padding * 2;
  const zoneHeight = CELL_SIZE - padding * 2;

  const col = layout.col * CELL_SIZE + padding + Math.random() * zoneWidth;
  const row = layout.row * CELL_SIZE + padding + Math.random() * zoneHeight;

  return { x: col, y: row };
};

const getCharacterEmoji = (name: string): string => {
  return CHARACTER_EMOJIS[name] || CHARACTER_EMOJIS.default;
};

const getStateInfo = (state: string) => {
  return STATE_ANIMATIONS[state.toLowerCase()] || STATE_ANIMATIONS.active;
};

export default function GameCanvas() {
  const [worldStatus, setWorldStatus] = useState<WorldStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  // Ambient pulsing animation
  useEffect(() => {
    const pulse = Animated.loop(
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
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  // Glow animation for selected zone
  useEffect(() => {
    if (selectedZone) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 800,
            useNativeDriver: false,
          }),
        ])
      ).start();
    } else {
      glowAnim.setValue(0);
    }
  }, [selectedZone, glowAnim]);

  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:3001/api/demo/status');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setWorldStatus(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch world status:', err);
      setError('Unable to connect to server');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 2000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  // Calculate NPC positions with smooth transitions
  const npcPositions: Array<NPC & { x: number; y: number; targetX: number; targetY: number }> =
    worldStatus?.npcs.map(npc => {
      const pos = getPositionInZone(npc.zone);
      return {
        ...npc,
        x: pos.x,
        y: pos.y,
        targetX: pos.x,
        targetY: pos.y,
      };
    }) || [];

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Animated.Text style={[styles.loadingEmoji, { transform: [{ scale: pulseAnim }] }]}>
            🚀
          </Animated.Text>
          <Text style={styles.loadingText}>Loading Planet Express HQ...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorEmoji}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.errorSubtext}>Make sure the server is running</Text>
        </View>
      </View>
    );
  }

  // Count NPCs per zone
  const zoneCounts: Record<string, number> = {};
  worldStatus?.npcs.forEach(npc => {
    zoneCounts[npc.zone] = (zoneCounts[npc.zone] || 0) + 1;
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.worldName}>🏢 Planet Express HQ</Text>
          <Text style={styles.worldSubtitle}>Live Floor Map</Text>
        </View>
        <View style={styles.liveIndicator}>
          <Animated.View style={[styles.liveDot, { transform: [{ scale: pulseAnim }] }]} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>

      {/* Main Game Canvas */}
      <View style={styles.canvasWrapper}>
        <View style={styles.canvas}>
          {/* Zone Backgrounds with Visual Depth */}
          {Object.entries(ZONE_LAYOUT).map(([zoneId, layout]) => {
            const isSelected = selectedZone === zoneId;
            const npcCount = zoneCounts[zoneId] || 0;

            return (
              <TouchableOpacity
                key={zoneId}
                activeOpacity={0.8}
                onPress={() => setSelectedZone(isSelected ? null : zoneId)}
              >
                <Animated.View
                  style={[
                    styles.zone,
                    {
                      left: layout.col * CELL_SIZE + 4,
                      top: layout.row * CELL_SIZE + 4,
                      backgroundColor: layout.primaryColor + '30',
                      borderColor: isSelected ? layout.primaryColor : layout.primaryColor + '60',
                      transform: [{ scale: isSelected ? 1.02 : 1 }],
                    },
                  ]}
                >
                  {/* Zone Pattern Overlay */}
                  <View style={[styles.zonePattern, { backgroundColor: layout.primaryColor + '10' }]} />

                  {/* Zone Icon & Label */}
                  <View style={styles.zoneContent}>
                    <Text style={styles.zoneIcon}>{layout.icon}</Text>
                    <Text style={[styles.zoneName, { color: layout.primaryColor }]}>
                      {zoneId.replace('-', ' ').toUpperCase()}
                    </Text>
                    <Text style={styles.zoneDescription}>{layout.description}</Text>

                    {/* NPC Count Badge */}
                    {npcCount > 0 && (
                      <View style={[styles.npcCountBadge, { backgroundColor: layout.primaryColor }]}>
                        <Text style={styles.npcCountText}>{npcCount}</Text>
                      </View>
                    )}
                  </View>

                  {/* Corner Accents */}
                  <View style={[styles.cornerAccent, styles.topLeft, { borderColor: layout.primaryColor }]} />
                  <View style={[styles.cornerAccent, styles.topRight, { borderColor: layout.primaryColor }]} />
                  <View style={[styles.cornerAccent, styles.bottomLeft, { borderColor: layout.primaryColor }]} />
                  <View style={[styles.cornerAccent, styles.bottomRight, { borderColor: layout.primaryColor }]} />
                </Animated.View>
              </TouchableOpacity>
            );
          })}

          {/* Animated NPCs */}
          {npcPositions.map((npc) => {
            const emoji = getCharacterEmoji(npc.name);
            const stateInfo = getStateInfo(npc.state);

            return (
              <Animated.View
                key={npc.id}
                style={[
                  styles.npcContainer,
                  {
                    left: npc.targetX - 24,
                    top: npc.targetY - 24,
                    transform: [{ scale: pulseAnim }],
                  },
                ]}
              >
                {/* Glow Effect */}
                <View style={[styles.npcGlow, { backgroundColor: stateInfo.color + '40' }]} />

                {/* NPC Body */}
                <View style={[styles.npcBody, { backgroundColor: stateInfo.color }]}>
                  <Text style={styles.npcEmoji}>{emoji}</Text>
                </View>

                {/* State Indicator */}
                <View style={styles.stateIndicator}>
                  <Text style={styles.stateEmoji}>{stateInfo.emoji}</Text>
                </View>

                {/* Name Label */}
                <View style={styles.npcLabel}>
                  <Text style={styles.npcLabelText} numberOfLines={1}>
                    {npc.name.split(' ')[0]}
                  </Text>
                </View>
              </Animated.View>
            );
          })}
        </View>
      </View>

      {/* Minimap Legend */}
      <View style={styles.minimapContainer}>
        <Text style={styles.minimapTitle}>🗺️ Facility Map</Text>
        <View style={styles.minimap}>
          {Object.entries(ZONE_LAYOUT).map(([zoneId, layout]) => (
            <TouchableOpacity
              key={zoneId}
              style={[
                styles.minimapZone,
                {
                  backgroundColor: layout.primaryColor,
                  left: `${layout.col * 33.33}%`,
                  top: `${layout.row * 50}%`,
                },
              ]}
              onPress={() => setSelectedZone(zoneId)}
            >
              <Text style={styles.minimapIcon}>{layout.icon}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Selected Zone Info */}
        {selectedZone && (
          <Animated.View style={styles.selectedZoneInfo}>
            <Text style={styles.selectedZoneName}>
              {ZONE_LAYOUT[selectedZone]?.icon} {selectedZone.replace('-', ' ').toUpperCase()}
            </Text>
            <Text style={styles.selectedZoneDesc}>
              {ZONE_LAYOUT[selectedZone]?.description}
            </Text>
          </Animated.View>
        )}
      </View>

      {/* NPC Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>👥 Crew ({worldStatus?.npcs.length || 0})</Text>
        <View style={styles.legendGrid}>
          {worldStatus?.npcs.slice(0, 4).map((npc) => {
            const stateInfo = getStateInfo(npc.state);
            return (
              <View key={npc.id} style={styles.legendItem}>
                <View style={[styles.legendAvatar, { borderColor: stateInfo.color }]}>
                  <Text style={styles.legendEmoji}>{getCharacterEmoji(npc.name)}</Text>
                </View>
                <View style={styles.legendInfo}>
                  <Text style={styles.legendName}>{npc.name.split(' ')[0]}</Text>
                  <Text style={[styles.legendState, { color: stateInfo.color }]}>
                    {stateInfo.emoji} {npc.state}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A14',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  worldName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  worldSubtitle: {
    fontSize: 13,
    color: '#6B6B80',
    marginTop: 2,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00E676',
    marginRight: 6,
  },
  liveText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#00E676',
  },
  canvasWrapper: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#2D2D44',
  },
  canvas: {
    width: CANVAS_SIZE,
    height: CANVAS_SIZE * (GRID_ROWS / GRID_COLS),
    backgroundColor: '#12121F',
    position: 'relative',
  },
  zone: {
    position: 'absolute',
    width: CELL_SIZE - 8,
    height: CELL_SIZE * (GRID_ROWS / GRID_COLS) - 8,
    borderRadius: 12,
    borderWidth: 2,
    overflow: 'hidden',
  },
  zonePattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.5,
  },
  zoneContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
  },
  zoneIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  zoneName: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  zoneDescription: {
    fontSize: 9,
    color: '#A0A0B0',
    marginTop: 2,
  },
  npcCountBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  npcCountText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  cornerAccent: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderWidth: 2,
  },
  topLeft: {
    top: 4,
    left: 4,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 4,
    right: 4,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 4,
    left: 4,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 4,
    right: 4,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  npcContainer: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 10,
  },
  npcGlow: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    top: -4,
  },
  npcBody: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  npcEmoji: {
    fontSize: 24,
  },
  stateIndicator: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#1A1A2E',
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2D2D44',
  },
  stateEmoji: {
    fontSize: 12,
  },
  npcLabel: {
    marginTop: 2,
    backgroundColor: '#1A1A2E',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  npcLabelText: {
    fontSize: 9,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  minimapContainer: {
    marginTop: 16,
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#2D2D44',
  },
  minimapTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  minimap: {
    height: 80,
    backgroundColor: '#0A0A14',
    borderRadius: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  minimapZone: {
    position: 'absolute',
    width: 28,
    height: 36,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 2,
  },
  minimapIcon: {
    fontSize: 14,
  },
  selectedZoneInfo: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#0A0A14',
    borderRadius: 8,
  },
  selectedZoneName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  selectedZoneDesc: {
    fontSize: 12,
    color: '#A0A0B0',
    marginTop: 2,
  },
  legend: {
    marginTop: 12,
    backgroundColor: '#1A1A2E',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#2D2D44',
  },
  legendTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  legendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%',
    marginBottom: 8,
  },
  legendAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0A0A14',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    marginRight: 8,
  },
  legendEmoji: {
    fontSize: 18,
  },
  legendInfo: {
    flex: 1,
  },
  legendName: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  legendState: {
    fontSize: 10,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0A14',
  },
  loadingEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  loadingText: {
    fontSize: 16,
    color: '#A0A0B0',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0A14',
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 18,
    color: '#FF5252',
    marginBottom: 8,
  },
  errorSubtext: {
    fontSize: 14,
    color: '#6B6B80',
  },
});

GameCanvas;
