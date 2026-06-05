import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, ActivityIndicator, FlatList, Alert,
} from 'react-native';
import { Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { scoutAPI } from '../../api/client';

const screenWidth = Dimensions.get('window').width - 32;

const chartConfig = {
  backgroundColor: '#1e293b',
  backgroundGradientFrom: '#1e293b',
  backgroundGradientTo: '#1e293b',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(59,130,246,${opacity})`,
  labelColor: (opacity = 1) => `rgba(148,163,184,${opacity})`,
  style: { borderRadius: 12 },
  barPercentage: 0.6,
};

export default function Dashboard() {
  const [summary, setSummary] = useState<any[]>([]);
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'avg_score' | 'entries_count' | 'avg_climb'>('avg_score');
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [s, e] = await Promise.all([scoutAPI.getSummary(), scoutAPI.getEntries()]);
      setSummary(s.data);
      setEntries(e.data);
    } catch {
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = (id: number) => {
    Alert.alert('Delete Entry', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: async () => {
          await scoutAPI.deleteEntry(id);
          load();
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View className="flex-1 bg-slate-900 justify-center items-center">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  const sorted = [...summary].sort((a, b) => (b[sortBy] ?? 0) - (a[sortBy] ?? 0));
  const top8 = sorted.slice(0, 8);

  const barData = {
    labels: top8.map((t) => `${t.team_number}`),
    datasets: [{ data: top8.map((t) => parseFloat(t.avg_score?.toFixed(1) ?? '0')) }],
  };

  const sortOptions: { key: typeof sortBy; label: string }[] = [
    { key: 'avg_score', label: 'Avg Score' },
    { key: 'entries_count', label: 'Entries' },
    { key: 'avg_climb', label: 'Avg Climb' },
  ];

  return (
    <ScrollView className="flex-1 bg-slate-900" contentContainerStyle={{ padding: 16 }}>
      <Text className="text-xl font-bold text-white mt-12 mb-4">Scout Dashboard</Text>

      {error ? <Text className="text-red-400 mb-4">{error}</Text> : null}

      {/* Sort controls */}
      <View className="flex-row gap-2 mb-4">
        {sortOptions.map((opt) => (
          <TouchableOpacity
            key={opt.key}
            onPress={() => setSortBy(opt.key)}
            className={`px-3 py-2 rounded-lg flex-1 items-center ${sortBy === opt.key ? 'bg-blue-600' : 'bg-slate-800'}`}
          >
            <Text className={`text-sm ${sortBy === opt.key ? 'text-white' : 'text-slate-400'}`}>{opt.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Bar Chart */}
      {top8.length > 0 && (
        <View className="bg-slate-800 rounded-xl p-4 mb-4">
          <Text className="text-slate-300 font-semibold mb-3">Top Teams – Avg Score</Text>
          <BarChart
            data={barData}
            width={screenWidth - 32}
            height={180}
            yAxisLabel=""
            yAxisSuffix=""
            chartConfig={chartConfig}
            style={{ borderRadius: 8 }}
            showValuesOnTopOfBars
          />
        </View>
      )}

      {/* Team Summary Table */}
      <View className="bg-slate-800 rounded-xl mb-4 overflow-hidden">
        <View className="flex-row bg-slate-700 px-4 py-3">
          <Text className="text-slate-400 text-xs flex-1">TEAM</Text>
          <Text className="text-slate-400 text-xs w-16 text-right">AVG</Text>
          <Text className="text-slate-400 text-xs w-16 text-right">CLIMB</Text>
          <Text className="text-slate-400 text-xs w-10 text-right">N</Text>
        </View>
        {sorted.map((team, idx) => (
          <View
            key={team.team_number}
            className={`flex-row px-4 py-3 ${idx % 2 === 0 ? 'bg-slate-800' : 'bg-slate-800/50'}`}
          >
            <View className="flex-1 flex-row items-center">
              <Text className="text-slate-500 text-xs w-5">{idx + 1}</Text>
              <Text className="text-blue-400 font-semibold ml-1">#{team.team_number}</Text>
            </View>
            <Text className="text-green-400 text-sm w-16 text-right">
              {team.avg_score?.toFixed(1) ?? '—'}
            </Text>
            <Text className="text-yellow-400 text-sm w-16 text-right">
              {team.avg_climb?.toFixed(1) ?? '—'}
            </Text>
            <Text className="text-slate-400 text-sm w-10 text-right">{team.entries_count}</Text>
          </View>
        ))}
        {sorted.length === 0 && (
          <View className="p-8 items-center">
            <Text className="text-slate-500">No scouting data yet</Text>
          </View>
        )}
      </View>

      {/* Recent Entries */}
      <Text className="text-slate-300 font-semibold mb-3">Recent Entries</Text>
      {entries.slice(0, 10).map((entry) => (
        <View key={entry.id} className="bg-slate-800 rounded-xl p-4 mb-2 flex-row justify-between items-center">
          <View>
            <Text className="text-white font-semibold">
              Team #{entry.team_number} · Match {entry.match_number}
            </Text>
            <Text className="text-slate-400 text-sm mt-1">{entry.event_key}</Text>
            <Text className="text-slate-500 text-xs mt-1">by {entry.scouter_name}</Text>
          </View>
          <View className="items-end">
            <Text className="text-green-400 font-bold text-lg">{entry.score ?? '—'}</Text>
            <TouchableOpacity onPress={() => handleDelete(entry.id)} className="mt-2 p-1">
              <Ionicons name="trash-outline" size={18} color="#f87171" />
            </TouchableOpacity>
          </View>
        </View>
      ))}
      {entries.length === 0 && (
        <View className="bg-slate-800 rounded-xl p-8 items-center mb-4">
          <Text className="text-slate-500">No entries yet. Start scouting!</Text>
        </View>
      )}

      <View className="h-8" />
    </ScrollView>
  );
}
