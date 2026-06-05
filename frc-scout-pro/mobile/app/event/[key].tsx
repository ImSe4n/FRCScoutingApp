import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, ActivityIndicator, FlatList,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { tbaAPI } from '../../api/client';

type Tab = 'rankings' | 'matches' | 'teams' | 'oprs' | 'alliances' | 'awards';

export default function EventView() {
  const { key } = useLocalSearchParams<{ key: string }>();
  const [event, setEvent] = useState<any>(null);
  const [rankings, setRankings] = useState<any[]>([]);
  const [matches, setMatches] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [oprs, setOprs] = useState<any>({});
  const [alliances, setAlliances] = useState<any[]>([]);
  const [awards, setAwards] = useState<any[]>([]);
  const [tab, setTab] = useState<Tab>('rankings');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!key) return;
    Promise.all([
      tbaAPI.getEvent(key).then((r) => setEvent(r.data)).catch(() => {}),
      tbaAPI.getEventRankings(key).then((r) => setRankings(r.data?.rankings ?? [])).catch(() => {}),
      tbaAPI.getEventMatches(key).then((r) => setMatches(r.data ?? [])).catch(() => {}),
      tbaAPI.getEventTeams(key).then((r) => setTeams(r.data ?? [])).catch(() => {}),
      tbaAPI.getEventOPRs(key).then((r) => setOprs(r.data?.oprs ?? {})).catch(() => {}),
      tbaAPI.getEventAlliances(key).then((r) => setAlliances(r.data ?? [])).catch(() => {}),
      tbaAPI.getEventAwards(key).then((r) => setAwards(r.data ?? [])).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, [key]);

  const tabs: { id: Tab; label: string }[] = [
    { id: 'rankings', label: 'Rankings' },
    { id: 'matches', label: 'Matches' },
    { id: 'teams', label: 'Teams' },
    { id: 'oprs', label: 'OPRs' },
    { id: 'alliances', label: 'Alliances' },
    { id: 'awards', label: 'Awards' },
  ];

  if (loading) {
    return (
      <View className="flex-1 bg-slate-900 justify-center items-center">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  const oprList = Object.entries(oprs)
    .map(([team, score]) => ({ team: team.replace('frc', ''), score: score as number }))
    .sort((a, b) => b.score - a.score);

  return (
    <View className="flex-1 bg-slate-900">
      {/* Header */}
      <View className="bg-slate-800 px-4 pt-14 pb-4">
        <TouchableOpacity onPress={() => router.back()} className="flex-row items-center mb-3">
          <Ionicons name="chevron-back" size={20} color="#94a3b8" />
          <Text className="text-slate-400 ml-1">Back</Text>
        </TouchableOpacity>
        <Text className="text-white text-lg font-bold">{event?.name ?? key}</Text>
        <Text className="text-slate-400 text-sm mt-1">
          {event?.city && `${event.city}, `}{event?.state_prov && `${event.state_prov} · `}
          {event?.start_date} – {event?.end_date}
        </Text>
        {/* Tab bar */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4 -mx-1">
          {tabs.map((t) => (
            <TouchableOpacity
              key={t.id}
              onPress={() => setTab(t.id)}
              className={`px-4 py-2 rounded-full mr-2 ${tab === t.id ? 'bg-blue-600' : 'bg-slate-700'}`}
            >
              <Text className={`text-sm ${tab === t.id ? 'text-white' : 'text-slate-400'}`}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={{ padding: 12 }}>
        {/* Rankings */}
        {tab === 'rankings' && (
          <View>
            {rankings.length === 0 && <EmptyState msg="No rankings yet" />}
            {rankings.map((r) => (
              <TouchableOpacity
                key={r.team_key}
                onPress={() => router.push(`/team/${r.team_key.replace('frc', '')}`)}
                className="bg-slate-800 rounded-xl p-3 mb-2 flex-row items-center"
              >
                <Text className="text-slate-400 w-8 text-sm">{r.rank}</Text>
                <Text className="text-blue-400 font-bold flex-1">
                  #{r.team_key.replace('frc', '')}
                </Text>
                <Text className="text-slate-400 text-sm">
                  W-L-T: {r.record?.wins ?? 0}-{r.record?.losses ?? 0}-{r.record?.ties ?? 0}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Matches */}
        {tab === 'matches' && (
          <View>
            {matches.length === 0 && <EmptyState msg="No matches yet" />}
            {matches
              .sort((a, b) => (a.match_number ?? 0) - (b.match_number ?? 0))
              .map((m) => (
                <View key={m.key} className="bg-slate-800 rounded-xl p-3 mb-2">
                  <Text className="text-slate-300 text-xs mb-2 font-semibold uppercase">
                    {m.comp_level} {m.match_number}
                  </Text>
                  <View className="flex-row justify-between">
                    <View className="flex-1">
                      <Text className="text-red-400 text-xs font-semibold mb-1">Red</Text>
                      <Text className="text-slate-300 text-xs">
                        {m.alliances?.red?.team_keys?.map((t: string) => t.replace('frc', '')).join(', ')}
                      </Text>
                      <Text className="text-red-300 font-bold text-lg">
                        {m.alliances?.red?.score ?? '?'}
                      </Text>
                    </View>
                    <Text className="text-slate-500 self-center mx-2">vs</Text>
                    <View className="flex-1 items-end">
                      <Text className="text-blue-400 text-xs font-semibold mb-1">Blue</Text>
                      <Text className="text-slate-300 text-xs">
                        {m.alliances?.blue?.team_keys?.map((t: string) => t.replace('frc', '')).join(', ')}
                      </Text>
                      <Text className="text-blue-300 font-bold text-lg">
                        {m.alliances?.blue?.score ?? '?'}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
          </View>
        )}

        {/* Teams */}
        {tab === 'teams' && (
          <View>
            {teams.length === 0 && <EmptyState msg="No teams" />}
            {teams
              .sort((a, b) => (a.team_number ?? 0) - (b.team_number ?? 0))
              .map((t) => (
                <TouchableOpacity
                  key={t.key}
                  onPress={() => router.push(`/team/${t.team_number}`)}
                  className="bg-slate-800 rounded-xl p-3 mb-2 flex-row justify-between items-center"
                >
                  <View>
                    <Text className="text-blue-400 font-bold">#{t.team_number}</Text>
                    <Text className="text-white text-sm">{t.nickname}</Text>
                    <Text className="text-slate-400 text-xs mt-0.5">
                      {t.city}{t.state_prov ? `, ${t.state_prov}` : ''}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color="#64748b" />
                </TouchableOpacity>
              ))}
          </View>
        )}

        {/* OPRs */}
        {tab === 'oprs' && (
          <View>
            {oprList.length === 0 && <EmptyState msg="No OPR data" />}
            {oprList.map((item, idx) => (
              <TouchableOpacity
                key={item.team}
                onPress={() => router.push(`/team/${item.team}`)}
                className="bg-slate-800 rounded-xl p-3 mb-2 flex-row items-center"
              >
                <Text className="text-slate-500 w-8 text-sm">{idx + 1}</Text>
                <Text className="text-blue-400 font-bold flex-1">#{item.team}</Text>
                <Text className="text-green-400 font-bold">{item.score.toFixed(1)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Alliances */}
        {tab === 'alliances' && (
          <View>
            {alliances.length === 0 && <EmptyState msg="No alliance data" />}
            {alliances.map((a, idx) => (
              <View key={idx} className="bg-slate-800 rounded-xl p-4 mb-3">
                <Text className="text-slate-300 font-semibold mb-2">Alliance {idx + 1}</Text>
                <View className="flex-row flex-wrap gap-2">
                  {a.picks?.map((pick: string) => (
                    <TouchableOpacity
                      key={pick}
                      onPress={() => router.push(`/team/${pick.replace('frc', '')}`)}
                      className="bg-slate-700 rounded-lg px-3 py-1"
                    >
                      <Text className="text-blue-400 font-bold">#{pick.replace('frc', '')}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Awards */}
        {tab === 'awards' && (
          <View>
            {awards.length === 0 && <EmptyState msg="No awards yet" />}
            {awards.map((award, idx) => (
              <View key={idx} className="bg-slate-800 rounded-xl p-4 mb-2">
                <Text className="text-yellow-400 font-semibold">{award.name}</Text>
                {award.recipient_list?.map((r: any, i: number) => (
                  <Text key={i} className="text-slate-300 text-sm mt-1">
                    {r.team_key ? `#${r.team_key.replace('frc', '')}` : ''}{r.awardee ? ` – ${r.awardee}` : ''}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        )}

        <View className="h-8" />
      </ScrollView>
    </View>
  );
}

function EmptyState({ msg }: { msg: string }) {
  return (
    <View className="py-12 items-center">
      <Text className="text-slate-500">{msg}</Text>
    </View>
  );
}
