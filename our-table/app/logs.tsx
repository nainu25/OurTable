import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { inMemoryLogs, LogEntry } from '../lib/logger';

export default function LogsScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const router = useRouter();
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    // Basic polling to keep logs updated every second while looking at the page
    setLogs([...inMemoryLogs]);
    const interval = setInterval(() => {
      setLogs([...inMemoryLogs]);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const getLevelColor = (level: string) => {
    switch(level) {
      case 'error': return '#ff4a4a';
      case 'warn': return '#ffae42';
      case 'info': return '#3498db';
      default: return '#95a5a6';
    }
  };

  const renderItem = ({ item }: { item: LogEntry }) => (
    <View style={styles.logItem}>
      <Text style={styles.logHeader}>
        <Text style={{ color: '#888' }}>[{item.timestamp}] </Text>
        <Text style={{ color: getLevelColor(item.level), fontWeight: 'bold' }}>{item.level.toUpperCase()} </Text>
        <Text style={{ color: '#b48ead', fontWeight: 'bold' }}>[{item.scope.toUpperCase()}]</Text>
      </Text>
      <Text style={styles.logMessage}>{item.message}</Text>
      {item.data !== undefined && (
        <Text style={styles.logData}>{JSON.stringify(item.data, null, 2)}</Text>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: '#0d1117' }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#58a6ff" />
        </TouchableOpacity>
        <Text style={styles.title}>Developer Logs</Text>
        <TouchableOpacity 
          onPress={() => {
            inMemoryLogs.length = 0;
            setLogs([]);
          }} 
          style={styles.clearButton}
        >
          <Ionicons name="trash-outline" size={20} color="#ff4a4a" />
        </TouchableOpacity>
      </View>
      <FlatList
        data={logs}
        keyExtractor={(item, index) => `${index}-${item.timestamp}`}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#21262d',
  },
  backButton: {
    padding: 8,
  },
  clearButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e6edf3',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  logItem: {
    marginBottom: 4,
  },
  logHeader: {
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 2,
  },
  logMessage: {
    fontSize: 13,
    color: '#c9d1d9',
    fontFamily: 'monospace',
    lineHeight: 18,
  },
  logData: {
    fontSize: 12,
    color: '#8b949e',
    fontFamily: 'monospace',
    marginTop: 4,
  },
  separator: {
    height: 1,
    backgroundColor: '#21262d',
    marginVertical: 12,
  },
});
