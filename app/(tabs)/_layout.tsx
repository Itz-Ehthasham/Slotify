import { AppScreenBackground } from '@/constants/screen';
import { Colors } from '@/constants/theme';
import {
  getUnreadNotificationCount,
  subscribeUnreadNotificationsChanged,
} from '@/storage/notificationsStorage';
import { Tabs } from 'expo-router';
import { Image } from 'expo-image';
import React, { useCallback, useEffect, useState } from 'react';
import { type ImageSourcePropType, StyleSheet, View } from 'react-native';

const ICON = 26;

const homeIcon = require('../../assets/icons/home.svg') as ImageSourcePropType;
const appointmentsIcon = require('../../assets/icons/orders.svg') as ImageSourcePropType;
const notificationsIcon = require('../../assets/icons/notifications.svg') as ImageSourcePropType;

function TabIcon({ source, color }: { source: ImageSourcePropType; color: string }) {
  return (
    <Image
      source={source}
      style={{ width: ICON, height: ICON, tintColor: color }}
      contentFit="contain"
    />
  );
}

function NotificationsTabIcon({ focused, color }: { focused: boolean; color: string }) {
  const [unread, setUnread] = useState(0);

  const refresh = useCallback(() => {
    void getUnreadNotificationCount().then(setUnread);
  }, []);

  useEffect(() => {
    refresh();
    return subscribeUnreadNotificationsChanged(refresh);
  }, [refresh]);

  return (
    <View style={styles.notifIconWrap}>
      <TabIcon source={notificationsIcon} color={focused ? Colors.light.tabBarIconTintActive : color} />
      {unread > 0 ? <View style={styles.notifBadgeDot} /> : null}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.light.tabIconSelected,
        tabBarInactiveTintColor: Colors.light.tabIconDefault,
        tabBarStyle: {
          backgroundColor: AppScreenBackground,
          borderTopColor: 'rgba(15, 15, 15, 0.08)',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.07,
          shadowRadius: 8,
          elevation: 12,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon source={homeIcon} color={focused ? Colors.light.tabBarIconTintActive : color} />
          ),
        }}
      />
      <Tabs.Screen
        name="appointments"
        options={{
          title: 'Appointments',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon
              source={appointmentsIcon}
              color={focused ? Colors.light.tabBarIconTintActive : color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Notifications',
          tabBarIcon: ({ focused, color }) => <NotificationsTabIcon focused={focused} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  notifIconWrap: {
    width: 32,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifBadgeDot: {
    position: 'absolute',
    top: 1,
    right: 3,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#EF4444',
    borderWidth: 2,
    borderColor: AppScreenBackground,
  },
});
