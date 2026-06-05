import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { authAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function TeamManagement() {
  const { user, updateTeamCode } = useAuth();
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await authAPI.getMembers();
      setMembers(res.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleRegenCode = () => {
    Alert.alert(
      'Regenerate Code',
      'Old code will stop working. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Regenerate',
          onPress: async () => {
            try {
              const res = await authAPI.regenerateCode();
              updateTeamCode(res.data.team_code);
              Alert.alert('New code', res.data.team_code);
            } catch {
              Alert.alert('Error', 'Could not regenerate code');
            }
          },
        },
      ]
    );
  };

  const handleRoleChange = async (uid: number, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'scout' : 'admin';
    Alert.alert('Change Role', `Set to ${newRole}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Confirm',
        onPress: async () => {
          try {
            await authAPI.updateRole(uid, newRole);
            load();
          } catch {
            Alert.alert('Error', 'Could not update role');
          }
        },
      },
    ]);
  };

  const handleRemove = (uid: number, name: string) => {
    Alert.alert('Remove Member', `Remove ${name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive',
        onPress: async () => {
          try {
            await authAPI.removeMember(uid);
            load();
          } catch {
            Alert.alert('Error', 'Could not remove member');
          }
        },
      },
    ]);
  };

  const isAdmin = user?.role === 'admin';

  if (loading) {
    return <View className="flex-1 bg-slate-900 justify-center items-center"><ActivityIndicator size="large" color="#3b82f6" /></View>;
  }

  return (
    <ScrollView className="flex-1 bg-slate-900" contentContainerStyle={{ padding: 16 }}>
      <TouchableOpacity onPress={() => router.back()} className="flex-row items-center mt-12 mb-4">
        <Ionicons name="chevron-back" size={20} color="#94a3b8" />
        <Text className="text-slate-400 ml-1">Back</Text>
      </TouchableOpacity>

      <Text className="text-xl font-bold text-white mb-4">Team Management</Text>

      {/* Join Code */}
      <View className="bg-slate-800 rounded-xl p-4 mb-4">
        <Text className="text-slate-400 text-sm mb-1">Team Join Code</Text>
        <Text className="text-yellow-400 font-mono text-3xl font-bold tracking-widest">
          {user?.team_code ?? '——'}
        </Text>
        <Text className="text-slate-500 text-xs mt-2 mb-3">
          Share this code with scouts to join your team.
        </Text>
        {isAdmin && (
          <TouchableOpacity
            onPress={handleRegenCode}
            className="bg-slate-700 rounded-lg px-4 py-2 self-start flex-row items-center gap-2"
          >
            <Ionicons name="refresh" size={16} color="#94a3b8" />
            <Text className="text-slate-300 text-sm">Regenerate Code</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Members */}
      <Text className="text-slate-300 font-semibold mb-3">
        Members ({members.length})
      </Text>
      {members.map((m) => (
        <View key={m.id} className="bg-slate-800 rounded-xl p-4 mb-2 flex-row items-center">
          <View className="flex-1">
            <Text className="text-white font-semibold">{m.username}</Text>
            <View className="flex-row items-center mt-1">
              <View className={`px-2 py-0.5 rounded-full ${m.role === 'admin' ? 'bg-purple-900/50' : 'bg-slate-700'}`}>
                <Text className={`text-xs capitalize ${m.role === 'admin' ? 'text-purple-300' : 'text-slate-400'}`}>
                  {m.role}
                </Text>
              </View>
            </View>
          </View>
          {isAdmin && m.id !== user?.id && (
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => handleRoleChange(m.id, m.role)}
                className="bg-slate-700 p-2 rounded-lg"
              >
                <Ionicons name="swap-horizontal" size={18} color="#94a3b8" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleRemove(m.id, m.username)}
                className="bg-red-900/30 p-2 rounded-lg"
              >
                <Ionicons name="person-remove-outline" size={18} color="#f87171" />
              </TouchableOpacity>
            </View>
          )}
          {m.id === user?.id && (
            <Text className="text-slate-500 text-xs">You</Text>
          )}
        </View>
      ))}

      <View className="h-8" />
    </ScrollView>
  );
}
