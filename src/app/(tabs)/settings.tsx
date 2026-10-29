import { resetAllData } from '@/core/resetAll';
import { SettingsScreen } from '@/features/settings';

export default function SettingsRoute() {
  return <SettingsScreen onResetAll={resetAllData} />;
}
