import { Tabs } from 'expo-router';
import { Image } from 'expo-image';
import React from 'react';
import { type ImageSourcePropType } from 'react-native';

import { AppScreenBackground } from '@/constants/screen';
import { Colors } from '@/constants/theme';

const ICON = 26;

const homeIcon = require('../../assets/icons/home.svg') as ImageSourcePropType;
const ordersIcon = require('../../assets/icons/orders.svg') as ImageSourcePropType;
const promotionsIcon = require('../../assets/icons/promotions.svg') as ImageSourcePropType;
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
        name="booking"
        options={{
          title: 'Orders',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon source={ordersIcon} color={focused ? Colors.light.tabBarIconTintActive : color} />
          ),
        }}
      />
      <Tabs.Screen
        name="provider"
        options={{
          title: 'Promotions',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon source={promotionsIcon} color={focused ? Colors.light.tabBarIconTintActive : color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Notifications',
          tabBarIcon: ({ focused, color }) => (
            <TabIcon source={notificationsIcon} color={focused ? Colors.light.tabBarIconTintActive : color} />
          ),
        }}
      />
    </Tabs>
  );
}
