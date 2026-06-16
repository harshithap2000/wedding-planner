import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/theme';
import DashboardScreen from '../screens/DashboardScreen';
import GuestListScreen from '../screens/GuestListScreen';
import BudgetScreen from '../screens/BudgetScreen';
import VendorsScreen from '../screens/VendorsScreen';
import ChecklistScreen from '../screens/ChecklistScreen';

const Tab = createBottomTabNavigator();

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const tabs: { name: string; component: React.ComponentType<any>; icon: IoniconName; activeIcon: IoniconName }[] = [
  { name: 'Dashboard', component: DashboardScreen, icon: 'home-outline', activeIcon: 'home' },
  { name: 'Guests', component: GuestListScreen, icon: 'people-outline', activeIcon: 'people' },
  { name: 'Budget', component: BudgetScreen, icon: 'wallet-outline', activeIcon: 'wallet' },
  { name: 'Vendors', component: VendorsScreen, icon: 'storefront-outline', activeIcon: 'storefront' },
  { name: 'Checklist', component: ChecklistScreen, icon: 'checkbox-outline', activeIcon: 'checkbox' },
];

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const tab = tabs.find(t => t.name === route.name)!;
        return {
          headerShown: false,
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textLight,
          tabBarStyle: {
            backgroundColor: colors.card,
            borderTopColor: colors.primaryLight,
            borderTopWidth: 1,
            height: 64,
            paddingBottom: 10,
            paddingTop: 6,
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '600',
            letterSpacing: 0.5,
          },
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? tab.activeIcon : tab.icon} size={size} color={color} />
          ),
        };
      }}
    >
      {tabs.map(tab => (
        <Tab.Screen key={tab.name} name={tab.name} component={tab.component} />
      ))}
    </Tab.Navigator>
  );
}
