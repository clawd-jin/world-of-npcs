import React from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import GameCanvas from '../components/GameCanvas';

export default function WorldScreen() {
  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <GameCanvas />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#1A1A2E',
  },
  content: {
    flexGrow: 1,
    paddingBottom: 20,
  },
});
