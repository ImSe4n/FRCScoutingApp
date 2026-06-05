import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api/client';

type Tab = 'signin' | 'create' | 'join';

export default function Login() {
  const { login } = useAuth();
  const [tab, setTab] = useState<Tab>('signin');
  const [loading, setLoading] = useState(false);

  // Sign in state
  const [siUser, setSiUser] = useState('');
  const [siPass, setSiPass] = useState('');

  // Create team state
  const [ctUser, setCtUser] = useState('');
  const [ctPass, setCtPass] = useState('');
  const [ctTeam, setCtTeam] = useState('');
  const [ctFrc, setCtFrc] = useState('');

  // Join team state
  const [jtUser, setJtUser] = useState('');
  const [jtPass, setJtPass] = useState('');
  const [jtCode, setJtCode] = useState('');

  const handleSignIn = async () => {
    if (!siUser || !siPass) { Alert.alert('Error', 'Fill in all fields'); return; }
    setLoading(true);
    try {
      await login(siUser, siPass);
      router.replace('/(tabs)/home');
    } catch (e: any) {
      Alert.alert('Login failed', e.response?.data?.detail || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async () => {
    if (!ctUser || !ctPass || !ctTeam) { Alert.alert('Error', 'Fill in all required fields'); return; }
    setLoading(true);
    try {
      await authAPI.register({
        username: ctUser,
        password: ctPass,
        team_name: ctTeam,
        frc_number: ctFrc ? parseInt(ctFrc) : undefined,
      });
      await login(ctUser, ctPass);
      router.replace('/(tabs)/home');
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.detail || 'Could not create team');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinTeam = async () => {
    if (!jtUser || !jtPass || !jtCode) { Alert.alert('Error', 'Fill in all fields'); return; }
    setLoading(true);
    try {
      await authAPI.register({
        username: jtUser,
        password: jtPass,
        team_code: jtCode.toUpperCase(),
      });
      await login(jtUser, jtPass);
      router.replace('/(tabs)/home');
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.detail || 'Could not join team');
    } finally {
      setLoading(false);
    }
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: 'signin', label: 'Sign In' },
    { id: 'create', label: 'Create Team' },
    { id: 'join', label: 'Join Team' },
  ];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-slate-900"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="flex-1 justify-center px-6 py-12">
          {/* Header */}
          <View className="items-center mb-10">
            <Text className="text-4xl font-bold text-blue-400">FRC Scout Pro</Text>
            <Text className="text-slate-400 mt-2 text-base">2026 REBUILT Season</Text>
          </View>

          {/* Card */}
          <View className="bg-slate-800 rounded-2xl p-6">
            {/* Tabs */}
            <View className="flex-row bg-slate-900 rounded-xl p-1 mb-6">
              {tabs.map((t) => (
                <TouchableOpacity
                  key={t.id}
                  onPress={() => setTab(t.id)}
                  className={`flex-1 py-2 rounded-lg items-center ${tab === t.id ? 'bg-blue-600' : ''}`}
                >
                  <Text className={`text-sm font-medium ${tab === t.id ? 'text-white' : 'text-slate-400'}`}>
                    {t.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Sign In Form */}
            {tab === 'signin' && (
              <View className="gap-4">
                <Field label="Username" value={siUser} onChange={setSiUser} placeholder="Enter username" />
                <Field label="Password" value={siPass} onChange={setSiPass} placeholder="Enter password" secure />
                <SubmitBtn label={loading ? 'Signing in…' : 'Sign In'} onPress={handleSignIn} disabled={loading} />
              </View>
            )}

            {/* Create Team Form */}
            {tab === 'create' && (
              <View className="gap-4">
                <Field label="Username" value={ctUser} onChange={setCtUser} placeholder="Choose a username" />
                <Field label="Password" value={ctPass} onChange={setCtPass} placeholder="Choose a password" secure />
                <Field label="Team Name *" value={ctTeam} onChange={setCtTeam} placeholder="e.g. Team 254" />
                <Field label="FRC Number (optional)" value={ctFrc} onChange={setCtFrc} placeholder="e.g. 254" keyboard="numeric" />
                <SubmitBtn label={loading ? 'Creating…' : 'Create Team'} onPress={handleCreateTeam} disabled={loading} />
              </View>
            )}

            {/* Join Team Form */}
            {tab === 'join' && (
              <View className="gap-4">
                <Field label="Username" value={jtUser} onChange={setJtUser} placeholder="Choose a username" />
                <Field label="Password" value={jtPass} onChange={setJtPass} placeholder="Choose a password" secure />
                <Field label="Team Code" value={jtCode} onChange={setJtCode} placeholder="6-character code" auto="characters" />
                <SubmitBtn label={loading ? 'Joining…' : 'Join Team'} onPress={handleJoinTeam} disabled={loading} />
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({
  label, value, onChange, placeholder, secure, keyboard, auto,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  secure?: boolean;
  keyboard?: any;
  auto?: any;
}) {
  return (
    <View>
      <Text className="text-slate-300 text-sm mb-1">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor="#64748b"
        secureTextEntry={secure}
        keyboardType={keyboard}
        autoCapitalize={auto ?? 'none'}
        className="bg-slate-700 text-white rounded-xl px-4 py-3 text-base"
      />
    </View>
  );
}

function SubmitBtn({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className={`py-3 rounded-xl items-center mt-2 ${disabled ? 'bg-blue-800' : 'bg-blue-600'}`}
    >
      <Text className="text-white font-semibold text-base">{label}</Text>
    </TouchableOpacity>
  );
}
