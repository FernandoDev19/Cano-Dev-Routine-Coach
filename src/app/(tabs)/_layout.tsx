import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { usePendingQuestionCount } from '@/features/coach';

type IconName = keyof typeof Ionicons.glyphMap;

export default function TabsLayout() {
  const pending = usePendingQuestionCount();

  const tabIcon = (name: IconName, focusedName: IconName) =>
    function TabIcon({ color, focused, size }: { color: unknown; focused: boolean; size: number }) {
      return <Ionicons name={focused ? focusedName : name} size={size} color={String(color)} />;
    };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#34d399',
        tabBarInactiveTintColor: '#64748b',
        tabBarStyle: { backgroundColor: '#0f172a', borderTopColor: '#1e293b' },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        sceneStyle: { backgroundColor: '#020617' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Hoy', tabBarIcon: tabIcon('checkbox-outline', 'checkbox') }} />
      <Tabs.Screen
        name="coach"
        options={{
          title: 'Coach',
          tabBarIcon: tabIcon('sparkles-outline', 'sparkles'),
          tabBarBadge: pending > 0 ? pending : undefined,
          tabBarBadgeStyle: { backgroundColor: '#f59e0b', color: '#020617' },
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{ title: 'Progreso', tabBarIcon: tabIcon('stats-chart-outline', 'stats-chart') }}
      />
      <Tabs.Screen
        name="settings"
        options={{ title: 'Ajustes', tabBarIcon: tabIcon('settings-outline', 'settings') }}
      />
    </Tabs>
  );
}
