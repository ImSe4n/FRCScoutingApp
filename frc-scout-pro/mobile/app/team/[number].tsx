import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, RadarChart } from 'react-native-chart-kit';
import { tbaAPI, scoutAPI } from '../../api/client';

const screenWidth = Dimensions.get('window').width - 32;
const chartConfig = {
  backgroundColor: '#1e293b',
  backgroundGradientFrom: '#1e293b',
  backgroundGradientTo: '#1e293b',
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(59,130,246,${opacity})`,
  labelColor: (opacity = 1) => `rgba(148,163,184,${opacity})`,
};

export default function TeamProfile() {
  const { number } = useLocalSearchParams<{ number: string }>();
  const [team, setTeam] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [awards, setAwards] = useState<any[]>([]);
  const [scoutAvg, setScoutAvg] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!number) return;
    Promise.all([
      tbaAPI.getTeam(number).then((r) => setTeam(r.data)).catch(() => {}),
      tbaAPI.getTeamEvents(number).then((r) => setEvents(r.data ?? [])).catch(() => {}),
      tbaAPI.getTeamMatches(number).then((r) => setMatches(r.data ?? [])).catch(() => {}),
      tbaAPI.getTeamAwards(number).then((r) => setAwards(r.data ?? [])).catch(() => {}),
      scoutAPI.getAverages(number).then((r) => setScoutAvg(r.data)).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, [number]);

  if (loading) {
    return (
      <View className="flex-1 bg-slate-900 justify-center items-center">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  const recentMatches = [...matches]
    .sort((a, b) => (b.actual_time ?? b.time ?? 0) - (a.actual_time ?? a.time ?? 0))
    .slice(0, 10);

  const scoreHistory = recentMatches
    .reverse()
    .map((m) => {
      const key = `frc${number}`;
      const isRed = m.alliances?.red?.team_keys?.includes(key);
      return isRed ? (m.alliances?.red?.score ?? 0) : (m.alliances?.blue?.score ?? 0);
    })
    .filter((s) => s > 0);

  const lineData = scoreHistory.length > 1
    ? {
        labels: scoreHistory.map((_, i) => String(i + 1)),
        datasets: [{ data: scoreHistory }],
      }
    : null;

  return (
    <ScrollView className="flex-1 bg-slate-900" contentContainerStyle={{ padding: 16 }}>
      {/* Back */}
      <TouchableOpacity onPress={() => router.back()} className="flex-row items-center mt-12 mb-4">
        <Ionicons name="chevron-back" size={20} color="#94a3b8" />
        <Text className="text-slate-400 ml-1">Back</Text>
      </TouchableOpacity>

      {/* Team Header */}
      <View className="bg-slate-800 rounded-xl p-5 mb-4">
        <Text className="text-blue-400 font-bold text-3xl">#{number}</Text>
        <Text className="text-white text-xl font-semibold mt-1">{team?.nickname ?? 'Unknown Team'}</Text>
        <Text className="text-slate-400 text-sm mt-1">
          {team?.school_name ?? ''}
        </Text>
        <Text className="text-slate-400 text-sm">
          {team?.city && `${team.city}, `}{team?.state_prov && `${team.state_prov}, `}{team?.country}
        </Text>
        {team?.rookie_year && (
          <Text className="text-slate-500 text-xs mt-2">Rookie: {team.rookie_year}</Text>
        )}
      </View>

      {/* Scout Averages */}
      {scoutAvg && (
        <View className="bg-slate-800 rounded-xl p-4 mb-4">
          <Text className="text-slate-300 font-semibold mb-3">Scout Data (Your Team)</Text>
          <View className="flex-row justify-between">
            {[
              { label: 'Avg Score', val: scoutAvg.avg_score?.toFixed(1) ?? '—', color: 'text-green-400' },
              { label: 'Avg Climb', val: scoutAvg.avg_climb?.toFixed(1) ?? '—', color: 'text-yellow-400' },
              { label: 'Entries', val: scoutAvg.entries_count ?? '—', color: 'text-blue-400' },
            ].map(({ label, val, color }) => (
              <View key={label} className="items-center flex-1">
                <Text className={`text-2xl font-bold ${color}`}>{val}</Text>
                <Text className="text-slate-500 text-xs mt-1">{label}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Score Trend */}
      {lineData && (
        <View className="bg-slate-800 rounded-xl p-4 mb-4">
          <Text className="text-slate-300 font-semibold mb-3">Recent Match Scores</Text>
          <LineChart
            data={lineData}
            width={screenWidth - 32}
            height={160}
            chartConfig={chartConfig}
            bezier
            style={{ borderRadius: 8 }}
          />
        </View>
      )}

      {/* Events */}
      {events.length > 0 && (
        <View className="bg-slate-800 rounded-xl p-4 mb-4">
          <Text className="text-slate-300 font-semibold mb-3">Events ({events.length})</Text>
          {events.slice(0, 5).map((e) => (
            <TouchableOpacity
              key={e.key}
              onPress={() => router.push(`/event/${e.key}`)}
              className="flex-row justify-between items-center py-2 border-b border-slate-700 last:border-0"
            >
              <Text className="text-white flex-1">{e.name}</Text>
              <Ionicons name="chevron-forward" size={14} color="#64748b" />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Recent Matches */}
      {recentMatches.length > 0 && (
        <View className="bg-slate-800 rounded-xl p-4 mb-4">
          <Text className="text-slate-300 font-semibold mb-3">Recent Matches</Text>
          {recentMatches.map((m) => {
            const key = `frc${number}`;
            const isRed = m.alliances?.red?.team_keys?.includes(key);
            const myScore = isRed ? m.alliances?.red?.score : m.alliances?.blue?.score;
            const theirScore = isRed ? m.alliances?.blue?.score : m.alliances?.red?.score;
            const won = myScore != null && theirScore != null && myScore > theirScore;
            return (
              <View key={m.key} className="flex-row justify-between items-center py-2 border-b border-slate-700">
                <View>
                  <Text className="text-slate-300 text-sm">
                    {m.comp_level?.toUpperCase()} {m.match_number}
                  </Text>
                  <Text className="text-slate-500 text-xs">{m.event_key}</Text>
                </View>
                <View className="items-end">
                  <Text className={`font-bold ${won ? 'text-green-400' : 'text-red-400'}`}>
                    {myScore} – {theirScore}
                  </Text>
                  <Text className={`text-xs ${won ? 'text-green-500' : 'text-red-500'}`}>
                    {won ? 'WIN' : 'LOSS'}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {/* Awards */}
      {awards.length > 0 && (
        <View className="bg-slate-800 rounded-xl p-4 mb-4">
          <Text className="text-slate-300 font-semibold mb-3">Awards ({awards.length})</Text>
          {awards.map((a, idx) => (
            <View key={idx} className="py-1">
              <Text className="text-yellow-400 text-sm">{a.name}</Text>
              <Text className="text-slate-500 text-xs">{a.event_key}</Text>
            </View>
          ))}
        </View>
      )}

      <View className="h-8" />
    </ScrollView>
  );
}
