import { useRouter } from 'expo-router';
import { JournalScreen } from '@/features/journal';
import { writeTodayDiary } from '@/core/journalActions';

export default function JournalRoute() {
  const router = useRouter();

  return (
    <JournalScreen
      onGenerateToday={() => {
        writeTodayDiary({ keepEdited: false }).catch(() => {});
      }}
      onOpenCheckout={() => router.push('/checkin')}
    />
  );
}
