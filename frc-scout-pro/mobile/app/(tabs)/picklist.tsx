import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import { analyticsAPI } from '../../api/client';

interface WeightConfig {
  scout_weight: number;
  opr_weight: number;
  climb_weight: number;
  fuel_weight: number;
  defence_weight: number;
}

function WeightSlider({
  label, colorClass, value, onChange,
}: {
  label: string;
  colorClass: string;
  value: number;
  onChange: (v: number) => void;
}) {
  const step = (delta: number) => {
    const next = Math.min(1, Math.max(0, Math.round((value + delta) * 100) / 100));
    onChange(next);
  };
  const pct = (value * 100).toFixed(0);
  const barWidth = `${pct}%`;
  return (
    <View className="mb-4">
      <View className="flex-row justify-between mb-2">
        <Text className={`text-sm font-medium ${colorClass}`}>{label}</Text>
        <Text className="text-white text-sm font-mono">{pct}%</Text>
      </View>
      <View className="h-2 bg-slate-700 rounded-full mb-2 overflow-hidden">
        <View className="h-full bg-blue-500 rounded-full" style={{ width: barWidth as any }} />
      </View>
      <View className="flex-row gap-2">
        <TouchableOpacity
          onPress={() => step(-0.05)}
          className="flex-1 bg-slate-700 rounded-lg py-1 items-center"
        >
          <Text className="text-white font-bold text-lg">−</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => step(0.05)}
          className="flex-1 bg-slate-700 rounded-lg py-1 items-center"
        >
          <Text className="text-white font-bold text-lg">+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function PickList() {
  const [weights, setWeights] = useState<WeightConfig>({
    scout_weight: 0.4,
    opr_weight: 0.3,
    climb_weight: 0.15,
    fuel_weight: 0.1,
    defence_weight: 0.05,
  });
  const [picklist, setPicklist] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const res = await analyticsAPI.getPicklist(weights);
      setPicklist(res.data);
      setGenerated(true);
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.detail || 'Could not generate pick list');
    } finally {
      setLoading(false);
    }
  };

  const setW = (key: keyof WeightConfig) => (val: number) =>
    setWeights((w) => ({ ...w, [key]: val }));

  const weightRows: { key: keyof WeightConfig; label: string; color: string }[] = [
    { key: 'scout_weight', label: 'Scout Score', color: 'text-blue-400' },
    { key: 'opr_weight', label: 'TBA OPR', color: 'text-purple-400' },
    { key: 'climb_weight', label: 'Climb', color: 'text-yellow-400' },
    { key: 'fuel_weight', label: 'Fuel', color: 'text-green-400' },
    { key: 'defence_weight', label: 'Defence', color: 'text-red-400' },
  ];

  const medalColor = (rank: number) => {
    if (rank === 1) return 'text-yellow-400';
    if (rank === 2) return 'text-slate-300';
    if (rank === 3) return 'text-orange-400';
    return 'text-slate-500';
  };

  return (
    <ScrollView className="flex-1 bg-slate-900" contentContainerStyle={{ padding: 16 }}>
      <Text className="text-xl font-bold text-white mt-12 mb-4">Pick List Generator</Text>

      <View className="bg-slate-800 rounded-xl p-4 mb-4">
        <Text className="text-slate-300 font-semibold mb-4">Scoring Weights</Text>
        {weightRows.map(({ key, label, color }) => (
          <WeightSlider
            key={key}
            label={label}
            colorClass={color}
            value={weights[key]}
            onChange={setW(key)}
          />
        ))}
      </View>

      <TouchableOpacity
        onPress={generate}
        disabled={loading}
        className={`py-4 rounded-xl items-center mb-6 ${loading ? 'bg-blue-800' : 'bg-blue-600'}`}
      >
        {loading
          ? <ActivityIndicator color="white" />
          : <Text className="text-white font-bold text-base">Generate Pick List</Text>}
      </TouchableOpacity>

      {generated && picklist.length === 0 && (
        <View className="bg-slate-800 rounded-xl p-8 items-center">
          <Text className="text-slate-500">No data — submit some scout entries first</Text>
        </View>
      )}

      {picklist.map((team, idx) => (
        <View
          key={team.team_number}
          className="bg-slate-800 rounded-xl p-4 mb-2 flex-row items-center"
        >
          <Text className={`text-lg font-bold w-10 ${medalColor(idx + 1)}`}>
            #{idx + 1}
          </Text>
          <View className="flex-1">
            <Text className="text-blue-400 font-bold text-base">Team {team.team_number}</Text>
            <Text className="text-slate-400 text-xs mt-1">
              Scout: {team.scout_avg?.toFixed(1) ?? '—'} · OPR: {team.opr?.toFixed(1) ?? '—'}
            </Text>
          </View>
          <View className="items-end">
            <Text className="text-green-400 font-bold text-lg">
              {team.weighted_score?.toFixed(1)}
            </Text>
            <Text className="text-slate-500 text-xs">weighted</Text>
          </View>
        </View>
      ))}

      <View className="h-8" />
    </ScrollView>
  );
}
