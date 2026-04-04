import { AppScreenBackground } from '@/constants/screen';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const emptyIllustration = require('../../../assets/icons/noorders.svg');

/** Replace with real counts / lists when wired to data */
const PENDING_COUNT = 0;
const HISTORY_COUNT = 0;

export default function AppointmentsScreen() {
  const [tab, setTab] = useState<'pending' | 'history'>('pending');

  const isPending = tab === 'pending';
  const isEmpty = isPending ? PENDING_COUNT === 0 : HISTORY_COUNT === 0;

  const emptyTitle = isPending ? 'No Appointments Yet' : 'No History Yet';
  const emptySubtitle = isPending
    ? 'You have no active appointments right now.'
    : 'You have no past appointments yet.';

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <View style={styles.headerShell}>
        <Text style={styles.headerTitle}>Appointments</Text>
      </View>

      <View style={styles.tabsBar}>
        <Pressable
          onPress={() => setTab('pending')}
          style={[styles.tabBtn, isPending && styles.tabBtnActive]}
          accessibilityRole="tab"
          accessibilityState={{ selected: isPending }}>
          <Text style={[styles.tabLabel, isPending ? styles.tabLabelActive : styles.tabLabelInactive]}>Pending</Text>
        </Pressable>
        <Pressable
          onPress={() => setTab('history')}
          style={[styles.tabBtn, !isPending && styles.tabBtnActive]}
          accessibilityRole="tab"
          accessibilityState={{ selected: !isPending }}>
          <Text style={[styles.tabLabel, !isPending ? styles.tabLabelActive : styles.tabLabelInactive]}>
            History
          </Text>
        </Pressable>
      </View>

      <View style={styles.body}>
        {isEmpty ? (
          <>
            <Image source={emptyIllustration} style={styles.art} contentFit="contain" />
            <Text style={styles.emptyTitle}>{emptyTitle}</Text>
            <Text style={styles.emptySubtitle}>{emptySubtitle}</Text>
          </>
        ) : (
          <Text style={styles.listPlaceholder}>Appointment list — connect your data here.</Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: AppScreenBackground,
  },
  headerShell: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(15, 15, 15, 0.08)',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    letterSpacing: -0.2,
  },
  tabsBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(15, 15, 15, 0.08)',
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabBtnActive: {
    borderBottomColor: '#000000',
  },
  tabLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  tabLabelActive: {
    color: '#000000',
  },
  tabLabelInactive: {
    color: '#6B7280',
    fontWeight: '500',
  },
  body: {
    flex: 1,
    backgroundColor: AppScreenBackground,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingBottom: 24,
  },
  art: {
    width: '85%',
    maxWidth: 280,
    aspectRatio: 1,
    maxHeight: 280,
  },
  emptyTitle: {
    marginTop: 28,
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  emptySubtitle: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: '400',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 300,
  },
  listPlaceholder: {
    fontSize: 16,
    color: '#6B7280',
  },
});
