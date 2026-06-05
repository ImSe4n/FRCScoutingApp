import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator,
  Alert, KeyboardAvoidingView, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { scoutAPI, authAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Assignments() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const [form, setForm] = useState({
    assigned_to_user_id: '',
    event_key: '',
    match_number: '',
    alliance: 'red',
    robot_position: '1',
    frc_team_number: '',
  });

  const load = async () => {
    try {
      const [a, m] = await Promise.all([
        scoutAPI.getAssignments(),
        authAPI.getMembers(),
      ]);
      setAssignments(a.data);
      setMembers(m.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const setF = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleCreate = async () => {
    if (!form.event_key || !form.match_number || !form.frc_team_number || !form.assigned_to_user_id) {
      Alert.alert('Error', 'All fields required');
      return;
    }
    setCreating(true);
    try {
      await scoutAPI.createAssignment({
        ...form,
        match_number: parseInt(form.match_number),
        robot_position: parseInt(form.robot_position),
        frc_team_number: parseInt(form.frc_team_number),
        assigned_to_user_id: parseInt(form.assigned_to_user_id),
      });
      load();
      setForm({ assigned_to_user_id: '', event_key: '', match_number: '', alliance: 'red', robot_position: '1', frc_team_number: '' });
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.detail || 'Could not create assignment');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert('Delete', 'Remove this assignment?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => { await scoutAPI.deleteAssignment(id); load(); },
      },
    ]);
  };

  if (loading) {
    return <View className="flex-1 bg-slate-900 justify-center items-center"><ActivityIndicator size="large" color="#3b82f6" /></View>;
  }

  const isAdmin = user?.role === 'admin';

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1 bg-slate-900">
      <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <TouchableOpacity onPress={() => router.back()} className="flex-row items-center mt-12 mb-4">
          <Ionicons name="chevron-back" size={20} color="#94a3b8" />
          <Text className="text-slate-400 ml-1">Back</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-white mb-4">Scout Assignments</Text>

        {/* Create form (admin only) */}
        {isAdmin && (
          <View className="bg-slate-800 rounded-xl p-4 mb-4">
            <Text className="text-slate-300 font-semibold mb-3">New Assignment</Text>
            <View className="mb-3">
              <Text className="text-slate-400 text-sm mb-1">Assign to Scout</Text>
              <View className="flex-row flex-wrap gap-2">
                {members.map((m) => (
                  <TouchableOpacity
                    key={m.id}
                    onPress={() => setF('assigned_to_user_id', String(m.id))}
                    className={`px-3 py-1 rounded-lg ${form.assigned_to_user_id === String(m.id) ? 'bg-blue-600' : 'bg-slate-700'}`}
                  >
                    <Text className={form.assigned_to_user_id === String(m.id) ? 'text-white' : 'text-slate-400'}>
                      {m.username}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <FRow label="Event Key" value={form.event_key} onChange={(v) => setF('event_key', v)} placeholder="2026oncmp" />
            <FRow label="Match #" value={form.match_number} onChange={(v) => setF('match_number', v)} numeric />
            <FRow label="FRC Team #" value={form.frc_team_number} onChange={(v) => setF('frc_team_number', v)} numeric />
            <View className="mb-3">
              <Text className="text-slate-400 text-sm mb-1">Alliance</Text>
              <View className="flex-row gap-2">
                {['red', 'blue'].map((a) => (
                  <TouchableOpacity key={a} onPress={() => setF('alliance', a)}
                    className={`px-4 py-2 rounded-lg flex-1 items-center ${form.alliance === a ? (a === 'red' ? 'bg-red-600' : 'bg-blue-600') : 'bg-slate-700'}`}>
                    <Text className="text-white capitalize">{a}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View className="mb-3">
              <Text className="text-slate-400 text-sm mb-1">Robot Position</Text>
              <View className="flex-row gap-2">
                {['1', '2', '3'].map((p) => (
                  <TouchableOpacity key={p} onPress={() => setF('robot_position', p)}
                    className={`px-4 py-2 rounded-lg flex-1 items-center ${form.robot_position === p ? 'bg-blue-600' : 'bg-slate-700'}`}>
                    <Text className="text-white">{p}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <TouchableOpacity onPress={handleCreate} disabled={creating}
              className={`py-3 rounded-xl items-center mt-1 ${creating ? 'bg-blue-800' : 'bg-blue-600'}`}>
              {creating ? <ActivityIndicator color="white" /> : <Text className="text-white font-semibold">Create Assignment</Text>}
            </TouchableOpacity>
          </View>
        )}

        {/* Assignments list */}
        <Text className="text-slate-300 font-semibold mb-3">
          All Assignments ({assignments.length})
        </Text>
        {assignments.map((a) => {
          const scout = members.find((m) => m.id === a.assigned_to_user_id);
          return (
            <View key={a.id} className="bg-slate-800 rounded-xl p-4 mb-2 flex-row items-center">
              <View className="flex-1">
                <Text className="text-white font-semibold">
                  Match {a.match_number} · Team #{a.frc_team_number}
                </Text>
                <Text className="text-slate-400 text-sm mt-1">
                  {a.event_key} · <Text className={a.alliance === 'red' ? 'text-red-400' : 'text-blue-400'}>
                    {a.alliance} {a.robot_position}
                  </Text>
                </Text>
                <Text className="text-slate-500 text-xs mt-1">→ {scout?.username ?? `User #${a.assigned_to_user_id}`}</Text>
              </View>
              {isAdmin && (
                <TouchableOpacity onPress={() => handleDelete(a.id)} className="p-2">
                  <Ionicons name="trash-outline" size={18} color="#f87171" />
                </TouchableOpacity>
              )}
            </View>
          );
        })}
        {assignments.length === 0 && (
          <View className="bg-slate-800 rounded-xl p-8 items-center">
            <Text className="text-slate-500">No assignments yet</Text>
          </View>
        )}
        <View className="h-8" />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function FRow({ label, value, onChange, numeric, placeholder }: any) {
  return (
    <View className="mb-3">
      <Text className="text-slate-400 text-sm mb-1">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        keyboardType={numeric ? 'numeric' : 'default'}
        placeholder={placeholder}
        placeholderTextColor="#64748b"
        autoCapitalize="none"
        className="bg-slate-700 text-white rounded-xl px-4 py-3"
      />
    </View>
  );
}
