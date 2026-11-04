import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Colors } from '../../theme/tokens';
import { Ionicons } from '@expo/vector-icons';

interface AlertItem {
  id: string;
  type: 'panic' | 'range' | 'battery' | 'connection' | 'buzzer';
  title: string;
  synced: boolean;
  time: string;
  dayGroup: 'TODAY' | 'YESTERDAY' | '24 OCT 2026';
  distance: string;
  phoneLocation: string;
}

const initialAlertsList: AlertItem[] = [
  {
    id: '1',
    type: 'panic',
    title: 'Panic button pressed',
    synced: true,
    time: '14:32',
    dayGroup: 'TODAY',
    distance: 'about 4 m',
    phoneLocation: '37.7749, -122.4194',
  },
  {
    id: '2',
    type: 'range',
    title: 'Out of range',
    synced: false,
    time: '12:15',
    dayGroup: 'TODAY',
    distance: 'about 14 m',
    phoneLocation: '37.7752, -122.4189',
  },
  {
    id: '3',
    type: 'battery',
    title: 'Low battery',
    synced: true,
    time: '09:04',
    dayGroup: 'TODAY',
    distance: 'about 2 m',
    phoneLocation: '37.7749, -122.4194',
  },
  {
    id: '4',
    type: 'connection',
    title: 'Connection lost',
    synced: true,
    time: '18:45',
    dayGroup: 'YESTERDAY',
    distance: 'about 18 m',
    phoneLocation: '37.7833, -122.4167',
  },
  {
    id: '5',
    type: 'buzzer',
    title: 'Buzzer used',
    synced: true,
    time: '15:20',
    dayGroup: 'YESTERDAY',
    distance: 'about 6 m',
    phoneLocation: '37.7790, -122.4200',
  },
  {
    id: '6',
    type: 'range',
    title: 'Out of range',
    synced: false,
    time: '11:10',
    dayGroup: '24 OCT 2026',
    distance: 'about 12 m',
    phoneLocation: '37.7700, -122.4100',
  },
];

export default function AlertsTabScreen() {
  const [alerts, setAlerts] = useState<AlertItem[]>(initialAlertsList);
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'Panic' | 'Range' | 'Battery' | 'Connection'>('All');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleClearHistory = () => {
    Alert.alert(
      'Clear all history?',
      'Every alert will be deleted from this phone and from your account. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => setAlerts([]),
        },
      ]
    );
  };

  // Filter logic
  const filteredAlerts = alerts.filter((item) => {
    if (selectedFilter === 'All') return true;
    if (selectedFilter === 'Panic') return item.type === 'panic';
    if (selectedFilter === 'Range') return item.type === 'range';
    if (selectedFilter === 'Battery') return item.type === 'battery';
    if (selectedFilter === 'Connection') return item.type === 'connection' || item.type === 'buzzer';
    return true;
  });

  // Group by dayGroup
  const groups: { dayGroup: string; items: AlertItem[] }[] = [];
  const dayOrder = ['TODAY', 'YESTERDAY', '24 OCT 2026'];
  dayOrder.forEach((day) => {
    const items = filteredAlerts.filter((a) => a.dayGroup === day);
    if (items.length > 0) {
      groups.push({ dayGroup: day, items });
    }
  });

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* Wrapping Row of Filter Chips */}
      <View style={styles.filterChipsRow}>
        {(['All', 'Panic', 'Range', 'Battery', 'Connection'] as const).map((filter) => {
          const isSelected = selectedFilter === filter;
          return (
            <TouchableOpacity
              key={filter}
              style={[styles.filterChip, isSelected && styles.filterChipSelected]}
              onPress={() => setSelectedFilter(filter)}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterChipText, isSelected && styles.filterChipTextSelected]}>
                {filter}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* List or Empty State */}
      {groups.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="notifications-off-outline" size={48} color={Colors.textMuted} style={{ marginBottom: 12 }} />
          <Text style={styles.emptyText}>No alerts here yet.</Text>
        </View>
      ) : (
        groups.map((group) => (
          <View key={group.dayGroup} style={styles.groupContainer}>
            <Text style={styles.sectionLabel}>{group.dayGroup}</Text>
            {group.items.map((item) => {
              const isExpanded = expandedId === item.id;
              let badgeColor = Colors.primary;
              let iconName: keyof typeof Ionicons.glyphMap = 'notifications';
              if (item.type === 'panic') {
                badgeColor = Colors.coral;
                iconName = 'warning';
              } else if (item.type === 'range') {
                badgeColor = Colors.warning;
                iconName = 'radio';
              } else if (item.type === 'battery') {
                badgeColor = Colors.warning;
                iconName = 'battery-dead';
              } else if (item.type === 'connection') {
                badgeColor = Colors.textMuted;
                iconName = 'bluetooth';
              } else if (item.type === 'buzzer') {
                badgeColor = Colors.primary;
                iconName = 'volume-high';
              }

              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.alertCard}
                  onPress={() => setExpandedId(isExpanded ? null : item.id)}
                  activeOpacity={0.9}
                >
                  <View style={styles.alertMainRow}>
                    <View style={[styles.typeIconBox, { backgroundColor: `${badgeColor}15` }]}>
                      <Ionicons name={iconName} size={20} color={badgeColor} />
                    </View>

                    <View style={styles.alertTextContent}>
                      <View style={styles.titleTimeRow}>
                        <Text style={styles.alertTitle}>{item.title}</Text>
                        <Text style={styles.alertTime}>{item.time}</Text>
                      </View>
                      <Text style={styles.alertSub}>
                        {item.synced ? 'Saved to your account' : 'Waiting to upload'}
                      </Text>
                    </View>
                  </View>

                  {isExpanded && (
                    <View style={styles.expandedDetails}>
                      <View style={styles.divider} />
                      <Text style={styles.detailText}>Distance: {item.distance}</Text>
                      <Text style={styles.detailText}>Phone location: {item.phoneLocation}</Text>

                      <TouchableOpacity
                        style={styles.mapButton}
                        onPress={() => router.push('/last-location')}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.mapButtonText}>View on map</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ))
      )}

      {/* Clear History Button (only when not empty) */}
      {groups.length > 0 && (
        <TouchableOpacity style={styles.clearHistoryButton} onPress={handleClearHistory} activeOpacity={0.7}>
          <Text style={styles.clearHistoryText}>Clear history</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 110,
    gap: 8,
  },
  filterChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.cardBg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textDark,
  },
  filterChipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  groupContainer: {
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 4,
  },
  alertCard: {
    backgroundColor: Colors.cardBg,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    marginBottom: 8,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  alertMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeIconBox: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  alertTextContent: {
    flex: 1,
  },
  titleTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  alertTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textDark,
  },
  alertTime: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  alertSub: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textMuted,
  },
  expandedDetails: {
    marginTop: 12,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: 10,
  },
  detailText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textDark,
    marginBottom: 4,
  },
  mapButton: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.sand,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 8,
  },
  mapButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textDark,
  },
  clearHistoryButton: {
    alignSelf: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginTop: 12,
  },
  clearHistoryText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.coral,
  },
});
