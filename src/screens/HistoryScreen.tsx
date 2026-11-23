// src/screens/HistoryScreen.tsx
// FR10, FR22. Newest first, grouped by day, with filter chips and "Clear history".
import { useCallback, useMemo } from 'react';
import { Alert, Pressable, SectionList, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { clearAlerts } from '../data/alertRepo';
import { groupByDay } from '../data/alertRows';
import { currentUser } from '../data/auth';
import { deleteAllAlerts } from '../data/remote';
import { dayHeader } from '../core/format';
import { ALERT_FILTERS, FILTER_LABEL } from '../domain/types';
import { AlertTile } from '../components/AlertTile';
import { useNav } from '../navigation/types';
import { useAlerts } from '../state/useAlerts';
import { Button } from '../ui/Button';
import { colors, space, type } from '../ui/theme';

export function HistoryScreen() {
  const nav = useNav();
  const { rows, filter, loading, error, setFilter, refresh } = useAlerts();
  useFocusEffect(useCallback(() => void refresh(), [refresh]));

  const sections = useMemo(
    () => groupByDay(rows).map((g) => ({ title: dayHeader(new Date(g.dayStart)), data: g.rows })),
    [rows],
  );

  const clear = () =>
    Alert.alert('Clear all history?', 'Every alert will be deleted from this phone and from your account. This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            await clearAlerts();
            if (currentUser() !== null) await deleteAllAlerts().catch(() => undefined);
            await refresh();
          })();
        },
      },
    ]);

  return (
    <View style={styles.fill}>
      <View style={styles.chips}>
        {ALERT_FILTERS.map((f) => (
          <Pressable
            key={f}
            onPress={() => void setFilter(f)}
            accessibilityRole="radio"
            accessibilityState={{ selected: filter === f }}
            style={[styles.chip, filter === f && styles.chipOn]}
          >
            <Text style={[styles.chipText, filter === f && { color: '#fff' }]}>{FILTER_LABEL[f]}</Text>
          </Pressable>
        ))}
      </View>
      {error !== null ? <Text style={styles.error}>Could not load alerts: {error}</Text> : null}
      <SectionList
        sections={sections}
        keyExtractor={(r) => String(r.id)}
        refreshing={loading}
        onRefresh={() => void refresh()}
        contentContainerStyle={{ padding: space.l, paddingTop: space.s }}
        renderSectionHeader={({ section }) => <Text style={styles.header}>{section.title}</Text>}
        renderItem={({ item }) => <AlertTile row={item} onViewMap={(r) => nav.navigate('LastLocation', { alertId: r.id })} />}
        ListEmptyComponent={<Text style={[type.body, styles.empty]}>No alerts here yet.</Text>}
        ListFooterComponent={rows.length > 0 ? <Button label="Clear history" kind="text" onPress={clear} /> : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.sand },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: space.s, padding: space.l, paddingBottom: 0 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18, borderWidth: 1.5, borderColor: colors.teal, backgroundColor: '#fff' },
  chipOn: { backgroundColor: colors.teal },
  chipText: { fontSize: 14, fontWeight: '700', color: colors.teal },
  header: { fontSize: 13, fontWeight: '700', color: colors.muted, marginTop: space.m, marginBottom: space.s, textTransform: 'uppercase' },
  empty: { textAlign: 'center', marginTop: 48, color: colors.muted },
  error: { color: colors.coralDark, paddingHorizontal: space.l, paddingTop: space.s },
});
