import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Screen placeholders
const HomeScreen = () => (
  <SafeAreaView style={styles.screen}>
    <View style={styles.content}>
      <Text style={styles.title}>Home</Text>
      <Text style={styles.subtitle}>Welcome to World of NPCs</Text>
    </View>
  </SafeAreaView>
);

const WorldScreen = () => (
  <SafeAreaView style={styles.screen}>
    <View style={styles.content}>
      <Text style={styles.title}>World</Text>
      <Text style={styles.subtitle}>Explore the NPC universe</Text>
    </View>
  </SafeAreaView>
);

const AgentsScreen = () => (
  <SafeAreaView style={styles.screen}>
    <View style={styles.content}>
      <Text style={styles.title}>Agents</Text>
      <Text style={styles.subtitle}>Manage your NPC agents</Text>
    </View>
  </SafeAreaView>
);

const BountiesScreen = () => (
  <SafeAreaView style={styles.screen}>
    <View style={styles.content}>
      <Text style={styles.title}>Bounties</Text>
      <Text style={styles.subtitle}>View and claim bounties</Text>
    </View>
  </SafeAreaView>
);

const EconomyScreen = () => (
  <SafeAreaView style={styles.screen}>
    <View style={styles.content}>
      <Text style={styles.title}>Economy</Text>
      <Text style={styles.subtitle}>Marketplace and trading</Text>
    </View>
  </SafeAreaView>
);

const ProfileScreen = () => (
  <SafeAreaView style={styles.screen}>
    <View style={styles.content}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.subtitle}>Your account and stats</Text>
    </View>
  </SafeAreaView>
);

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: styles.tabBar,
          tabBarActiveTintColor: '#6C5CE7',
          tabBarInactiveTintColor: '#A0A0A0',
          tabBarLabelStyle: styles.tabLabel,
        }}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="World" component={WorldScreen} />
        <Tab.Screen name="Agents" component={AgentsScreen} />
        <Tab.Screen name="Bounties" component={BountiesScreen} />
        <Tab.Screen name="Economy" component={EconomyScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#1A1A2E',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#A0A0A0',
  },
  tabBar: {
    backgroundColor: '#16213E',
    borderTopWidth: 0,
    paddingTop: 8,
    paddingBottom: 8,
    height: 60,
  },
  tabLabel: {
    fontSize: 12,
    marginTop: 4,
  },
});
