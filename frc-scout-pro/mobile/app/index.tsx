import { Redirect } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Index() {
  const { user, loading } = useAuth();
  if (loading) return <LoadingSpinner />;
  return <Redirect href={user ? '/(tabs)/home' : '/login'} />;
}
