import { Redirect } from 'expo-router';
import { useSession } from '../state/hooks';

export default function Index() {
  const { isAuthenticated, localOnly } = useSession();
  if (isAuthenticated || localOnly) {
    return <Redirect href="/(tabs)" />;
  }
  return <Redirect href="/login" />;
}
