import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';

// Types for economy data
interface MarketplaceItem {
  id: string;
  name: string;
  description: string;
  price: number;
  emoji: string;
  category: 'ship' | 'upgrade' | 'consumable' | 'license';
}

interface EconomyData {
  credits: number;
  items: MarketplaceItem[];
  lastUpdated: string;
}

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

const API_BASE = 'http://localhost:3001/api';

// Mock economy data
const mockEconomyData: EconomyData = {
  credits: 15420,
  lastUpdated: new Date().toISOString(),
  items: [
    {
      id: '1',
      name: 'Quantum Fuel Cell',
      description: 'High-efficiency fuel for long-range deliveries',
      price: 500,
      emoji: '⚡',
      category: 'consumable',
    },
    {
      id: '2',
      name: 'Ship Hull Upgrade',
      description: 'Reinforced plating for asteroid fields',
      price: 2500,
      emoji: '🛸',
      category: 'ship',
    },
    {
      id: '3',
      name: 'Agent License',
      description: 'License to operate autonomous delivery agents',
      price: 1000,
      emoji: '📜',
      category: 'license',
    },
    {
      id: '4',
      name: 'Navigation Module',
      description: 'Advanced GPS for deep space navigation',
      price: 1800,
      emoji: '🧭',
      category: 'upgrade',
    },
    {
      id: '5',
      name: 'Emergency Rations',
      description: 'Food supplies for long-haul flights',
      price: 150,
      emoji: '🍔',
      category: 'consumable',
    },
    {
      id: '6',
      name: 'Cargo Bay Extension',
      description: 'Increase carrying capacity by 50%',
      price: 3200,
      emoji: '📦',
      category: 'ship',
    },
  ],
};

// Coming Soon fallback component
const ComingSoon: React.FC = () => (
  <View style={styles.comingSoonContainer}>
    <Text style={styles.comingSoonEmoji}>🚧</Text>
    <Text style={styles.comingSoonTitle}>Coming Soon!</Text>
    <Text style={styles.comingSoonText}>
      The marketplace API is under construction.
    </Text>
    <Text style={styles.comingSoonSubtext}>
      Check back later for exclusive Planet Express merchandise!
    </Text>
  </View>
);

const EconomyScreen: React.FC = () => {
  const [economyData, setEconomyData] = useState<EconomyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasApi, setHasApi] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const fetchEconomy = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/economy`);
      
      if (response.ok) {
        const data = await response.json();
        setEconomyData({
          credits: data.credits || mockEconomyData.credits,
          items: data.items || mockEconomyData.items,
          lastUpdated: data.lastUpdated || new Date().toISOString(),
        });
        setHasApi(true);
      } else {
        // Use mock data when API returns error
        setEconomyData(mockEconomyData);
        setHasApi(false);
      }
    } catch (err) {
      // Use mock data on network error
      console.log('Using mock economy data (API unavailable)');
      setEconomyData(mockEconomyData);
      setHasApi(false);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchEconomy();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchEconomy, 30000);
    return () => clearInterval(interval);
  }, [fetchEconomy]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchEconomy();
  }, [fetchEconomy]);

  // Get category badge color
  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'ship':
        return COLORS.primary;
      case 'upgrade':
        return COLORS.secondary;
      case 'consumable':
        return COLORS.success;
      case 'license':
        return COLORS.warning;
      default:
        return COLORS.textSecondary;
    }
  };

  // Get category icon
  const getCategoryIcon = (category: string): string => {
    switch (category) {
      case 'ship':
        return '🚀';
      case 'upgrade':
        return '⬆️';
      case 'consumable':
        return '📦';
      case 'license':
        return '📋';
      default:
        return '📦';
    }
  };

  // Filter items by category
  const filteredItems = selectedCategory
    ? economyData?.items.filter(item => item.category === selectedCategory)
    : economyData?.items;

  // Categories for filter
  const categories = ['ship', 'upgrade', 'consumable', 'license'];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading marketplace...</Text>
      </View>
    );
  }

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
      {/* Balance Card */}
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>💰 Your Balance</Text>
        <Text style={styles.balanceValue}>
          {economyData?.credits.toLocaleString()} credits
        </Text>
        {!hasApi && (
          <View style={styles.demoBadge}>
            <Text style={styles.demoBadgeText}>DEMO MODE</Text>
          </View>
        )}
      </View>

      {/* Category Filter */}
      <View style={styles.filterSection}>
        <Text style={styles.sectionTitle}>🛒 Marketplace</Text>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          <TouchableOpacity
            style={[
              styles.filterChip,
              !selectedCategory && styles.filterChipActive,
            ]}
            onPress={() => setSelectedCategory(null)}
          >
            <Text style={[
              styles.filterChipText,
              !selectedCategory && styles.filterChipTextActive,
            ]}>All</Text>
          </TouchableOpacity>
          
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.filterChip,
                selectedCategory === cat && styles.filterChipActive,
              ]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text style={[
                styles.filterChipText,
                selectedCategory === cat && styles.filterChipTextActive,
              ]}>
                {getCategoryIcon(cat)} {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Items Grid */}
      {hasApi ? (
        <View style={styles.itemsGrid}>
          {filteredItems?.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.itemCard}
              activeOpacity={0.7}
            >
              <View style={styles.itemHeader}>
                <Text style={styles.itemEmoji}>{item.emoji}</Text>
                <View style={[
                  styles.categoryBadge, 
                  { backgroundColor: getCategoryColor(item.category) + '20' }
                ]}>
                  <Text style={[
                    styles.categoryText, 
                    { color: getCategoryColor(item.category) }
                  ]}>
                    {item.category.toUpperCase()}
                  </Text>
                </View>
              </View>
              
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemDescription} numberOfLines={2}>
                {item.description}
              </Text>
              
              <View style={styles.itemFooter}>
                <Text style={styles.itemPrice}>💰 {item.price.toLocaleString()}</Text>
                <TouchableOpacity style={styles.buyButton}>
                  <Text style={styles.buyButtonText}>Buy</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <ComingSoon />
      )}

      {/* Featured Section (always visible) */}
      <View style={styles.featuredSection}>
        <Text style={styles.sectionTitle}>⭐ Featured Items</Text>
        
        <View style={styles.featuredCard}>
          <Text style={styles.featuredEmoji}>🌟</Text>
          <View style={styles.featuredContent}>
            <Text style={styles.featuredTitle}>Premium Ship Bundle</Text>
            <Text style={styles.featuredDesc}>
              Includes hull upgrade, navigation module, and 10 fuel cells
            </Text>
            <Text style={styles.featuredPrice}>💰 6,999 credits</Text>
          </View>
        </View>
        
        <View style={styles.featuredCard}>
          <Text style={styles.featuredEmoji}>🎁</Text>
          <View style={styles.featuredContent}>
            <Text style={styles.featuredTitle}>Agent Pack</Text>
            <Text style={styles.featuredDesc}>
              License for 3 additional delivery agents
            </Text>
            <Text style={styles.featuredPrice}>💰 2,499 credits</Text>
          </View>
        </View>
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
  balanceCard: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 5,
  },
  balanceLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  balanceValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.primary,
    textShadowColor: COLORS.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  demoBadge: {
    marginTop: 12,
    backgroundColor: COLORS.warning + '20',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  demoBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.warning,
    letterSpacing: 1,
  },
  filterSection: {
    marginBottom: 20,
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
  filterRow: {
    gap: 8,
    paddingVertical: 4,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: COLORS.background,
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  itemCard: {
    width: '47%',
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemEmoji: {
    fontSize: 32,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  categoryText: {
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  itemName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  itemDescription: {
    fontSize: 11,
    color: COLORS.textSecondary,
    lineHeight: 15,
    marginBottom: 10,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.warning,
  },
  buyButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  buyButtonText: {
    color: COLORS.background,
    fontWeight: 'bold',
    fontSize: 12,
  },
  comingSoonContainer: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  comingSoonEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  comingSoonTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  comingSoonText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 4,
  },
  comingSoonSubtext: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  featuredSection: {
    marginTop: 8,
  },
  featuredCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  featuredEmoji: {
    fontSize: 32,
    marginRight: 14,
  },
  featuredContent: {
    flex: 1,
  },
  featuredTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  featuredDesc: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  featuredPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.warning,
  },
});

export default EconomyScreen;
