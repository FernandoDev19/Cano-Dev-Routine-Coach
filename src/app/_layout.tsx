import '../../global.css';
import { ActivityIndicator, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAppReady } from '@/core/useAppReady';
import { useNotificationSync } from '@/core/useNotificationSync';

export default function RootLayout() {
  const ready = useAppReady();
  useNotificationSync(ready);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#020617' } }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="checkin" options={{ presentation: 'modal' }} />
      </Stack>
      {!ready ? (
        <View className="absolute inset-0 items-center justify-center bg-slate-950">
          <ActivityIndicator color="#34d399" />
        </View>
      ) : null}
    </SafeAreaProvider>
  );
}
