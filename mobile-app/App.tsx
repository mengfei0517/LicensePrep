import React from 'react';
import { StyleSheet, SafeAreaView, StatusBar } from 'react-native';
import RecordScreen from './src/screens/RecordScreen';

export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />
      <RecordScreen />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
});
