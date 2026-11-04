import React from 'react';
import { Tabs } from 'expo-router';
import { CustomTabBar } from '../../components/CustomTabBar';
import { AppBar } from '../../components/AppBar';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        header: ({ route, options }) => {
          let title = options.title !== undefined ? options.title : route.name;
          if (route.name === 'index') title = 'SafeTether';
          if (route.name === 'alerts') title = 'Alerts';
          if (route.name === 'settings') title = 'Settings';
          return <AppBar kind="tab" title={title} />;
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          title: 'Alerts',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
        }}
      />
    </Tabs>
  );
}
