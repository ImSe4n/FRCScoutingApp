import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { scoutAPI, tbaAPI } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const CLIMB_LEVELS = [
  { value: 0, label: 'None (0pts)' },
  { value: 1, label: 'Level 1 (10pts)' },
  { value: 2, label: 'Level 2 (20pts)' },
  { value: 3, label: 'Level 3 (30pts)' },
];

export default function Scout() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);

  const [form, setForm] = useState({
    team_number: '',
    match_number: '',
    event_key: '',
    scouter_name: user?.username || '',
    auto_fuel: '0',
    tele_fuel: '0',
    end_fuel: '0',
    climb_level: 0,
    defence_time: '0',
    driver_rating: '3',
    accuracy_rating: '3',
    minor_penalties: '0',
    major_penalties: '0',
    notes: '',
  });

  useEffect(() => {
    tbaAPI.getEvents().then((r) => setEvents(r.data)).catch(() => {});
    scoutAPI.getAssignments().then((r) => setAssignments(r.data)).catch(() => {});
  }, []);

  const set = (key: string, val: string | number) =>
    setForm((f) => ({ ...f, [key]: val }));

  const calcScore = () => {
    const acc = form.accuracy_rating ? parseInt(form.accuracy_rating as string) / 5 : 1;
    const fuel = (parseInt(form.auto_fuel) + parseInt(form.tele_fuel) + parseInt(form.end_fuel)) * acc;
    const climb = form.climb_level * 10;
    const pen = parseInt(form.minor_penalties) * 5 + parseInt(form.major_penalties) * 15;
    return Math.round(fuel + climb - pen);
  };

  const handleSubmit = async () => {
    if (!form.team_number || !form.match_number || !form.event_key) {
      Alert.alert('Error', 'Team number, match number, and event key are required');
      return;
    }
    setLoading(true);
    try {
      await scoutAPI.createEntry({
        ...form,
        team_number: parseInt(form.team_number),
        match_number: parseInt(form.match_number),
        auto_fuel: parseInt(form.auto_fuel),
        tele_fuel: parseInt(form.tele_fuel),
        end_fuel: parseInt(form.end_fuel),
        defence_time: parseInt(form.defence_time),
        driver_rating: parseInt(form.driver_rating),
        accuracy_rating: parseInt(form.accuracy_rating),
        minor_penalties: parseInt(form.minor_penalties),
        major_penalties: parseInt(form.major_penalties),
      });
      Alert.alert('Success', 'Scout entry submitted!');
      setForm((f) => ({
        ...f,
        team_number: '',
        match_number: '',
        auto_fuel: '0',
        tele_fuel: '0',
        end_fuel: '0',
        climb_level: 0,
        defence_time: '0',
        notes: '',
        minor_penalties: '0',
        major_penalties: '0',
      }));
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.detail || 'Submission failed');
    } finally {
      setLoading(false);
    }
  };

  const myAssignments = assignments.filter(
    (a) => a.assigned_to_user_id === user?.id
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-slate-900"
    >
      <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
        <Text className="text-xl font-bold text-white mt-12 mb-4">Scout Entry</Text>

        {/* Assignments */}
        {myAssignments.length > 0 && (
          <View className="bg-blue-900/50 rounded-xl p-4 mb-4">
            <Text className="text-blue-300 font-semibold mb-2">Your Assignments</Text>
            {myAssignments.slice(0, 3).map((a) => (
              <TouchableOpacity
                key={a.id}
                onPress={() => {
                  set('team_number', String(a.frc_team_number));
                  set('match_number', String(a.match_number));
                  set('event_key', a.event_key);
                }}
                className="flex-row justify-between py-1"
              >
                <Text className="text-blue-200 text-sm">
                  Match {a.match_number} – Team {a.frc_team_number}
                </Text>
                <Text className="text-blue-400 text-sm capitalize">{a.alliance} {a.robot_position}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Form Fields */}
        <SectionCard title="Match Info">
          <NumField label="Team Number *" value={form.team_number} onChange={(v) => set('team_number', v)} />
          <NumField label="Match Number *" value={form.match_number} onChange={(v) => set('match_number', v)} />
          <View className="mt-3">
            <Text className="text-slate-400 text-sm mb-1">Event Key *</Text>
            <TextInput
              value={form.event_key}
              onChangeText={(v) => set('event_key', v)}
              placeholder="e.g. 2026oncmp"
              placeholderTextColor="#64748b"
              autoCapitalize="none"
              className="bg-slate-700 text-white rounded-xl px-4 py-3"
            />
          </View>
          <View className="mt-3">
            <Text className="text-slate-400 text-sm mb-1">Scouter Name</Text>
            <TextInput
              value={form.scouter_name}
              onChangeText={(v) => set('scouter_name', v)}
              placeholderTextColor="#64748b"
              className="bg-slate-700 text-white rounded-xl px-4 py-3"
            />
          </View>
        </SectionCard>

        <SectionCard title="Fuel Scoring">
          <NumField label="Auto Fuel" value={form.auto_fuel} onChange={(v) => set('auto_fuel', v)} />
          <NumField label="Tele Fuel" value={form.tele_fuel} onChange={(v) => set('tele_fuel', v)} />
          <NumField label="End Fuel" value={form.end_fuel} onChange={(v) => set('end_fuel', v)} />
        </SectionCard>

        <SectionCard title="Climb">
          <View className="flex-row flex-wrap gap-2">
            {CLIMB_LEVELS.map((cl) => (
              <TouchableOpacity
                key={cl.value}
                onPress={() => set('climb_level', cl.value)}
                className={`px-3 py-2 rounded-lg ${form.climb_level === cl.value ? 'bg-blue-600' : 'bg-slate-700'}`}
              >
                <Text className={form.climb_level === cl.value ? 'text-white' : 'text-slate-400'}>
                  {cl.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </SectionCard>

        <SectionCard title="Performance">
          <RatingRow label="Driver Rating" value={parseInt(form.driver_rating)} onChange={(v) => set('driver_rating', String(v))} />
          <RatingRow label="Accuracy Rating" value={parseInt(form.accuracy_rating)} onChange={(v) => set('accuracy_rating', String(v))} />
          <NumField label="Defence Time (s)" value={form.defence_time} onChange={(v) => set('defence_time', v)} />
        </SectionCard>

        <SectionCard title="Penalties">
          <NumField label="Minor Penalties" value={form.minor_penalties} onChange={(v) => set('minor_penalties', v)} />
          <NumField label="Major Penalties" value={form.major_penalties} onChange={(v) => set('major_penalties', v)} />
        </SectionCard>

        <SectionCard title="Notes">
          <TextInput
            value={form.notes}
            onChangeText={(v) => set('notes', v)}
            placeholder="Observations about this robot…"
            placeholderTextColor="#64748b"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            className="bg-slate-700 text-white rounded-xl px-4 py-3"
          />
        </SectionCard>

        {/* Score Preview */}
        <View className="bg-slate-800 rounded-xl p-4 mb-4 flex-row justify-between items-center">
          <Text className="text-slate-400">Estimated Score</Text>
          <Text className="text-2xl font-bold text-green-400">{calcScore()} pts</Text>
        </View>

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          className={`py-4 rounded-xl items-center mb-8 ${loading ? 'bg-blue-800' : 'bg-blue-600'}`}
        >
          {loading
            ? <ActivityIndicator color="white" />
            : <Text className="text-white font-bold text-lg">Submit Entry</Text>}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="bg-slate-800 rounded-xl p-4 mb-4">
      <Text className="text-slate-300 font-semibold mb-3">{title}</Text>
      {children}
    </View>
  );
}

function NumField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <View className="mb-3">
      <Text className="text-slate-400 text-sm mb-1">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChange}
        keyboardType="numeric"
        className="bg-slate-700 text-white rounded-xl px-4 py-3"
      />
    </View>
  );
}

function RatingRow({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <View className="mb-3">
      <Text className="text-slate-400 text-sm mb-2">{label}: {value}/5</Text>
      <View className="flex-row gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <TouchableOpacity
            key={n}
            onPress={() => onChange(n)}
            className={`w-10 h-10 rounded-lg items-center justify-center ${value >= n ? 'bg-blue-600' : 'bg-slate-700'}`}
          >
            <Text className="text-white font-bold">{n}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}
